import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
import {
  GetTasksQueryParams,
  CreateTaskBody,
  GetTaskParams,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
  ToggleTaskCompleteParams,
  ToggleTaskCompleteBody,
  GetSubtasksParams,
  CreateSubtaskParams,
  CreateSubtaskBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getTaskWithSubtaskCounts(taskId: number) {
  const subtaskCounts = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where completed = true)::int`,
    })
    .from(tasksTable)
    .where(eq(tasksTable.parentId, taskId));

  return {
    subtaskCount: subtaskCounts[0]?.total ?? 0,
    completedSubtaskCount: subtaskCounts[0]?.completed ?? 0,
  };
}

function formatTask(task: typeof tasksTable.$inferSelect, subtaskCount = 0, completedSubtaskCount = 0) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority,
    category: task.category,
    completed: task.completed,
    dueDate: task.dueDate ?? null,
    parentId: task.parentId ?? null,
    subtaskCount,
    completedSubtaskCount,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

router.get("/tasks", async (req, res) => {
  const rawQuery = { ...req.query };
  if (rawQuery.parentId === "" || rawQuery.parentId === undefined) {
    delete rawQuery.parentId;
  }
  const query = GetTasksQueryParams.parse(rawQuery);

  const conditions = [isNull(tasksTable.parentId)];

  if (query.category) {
    conditions.push(eq(tasksTable.category, query.category));
  }
  if (query.priority) {
    conditions.push(eq(tasksTable.priority, query.priority));
  }
  if (query.completed !== undefined) {
    conditions.push(eq(tasksTable.completed, query.completed));
  }

  const tasks = await db
    .select()
    .from(tasksTable)
    .where(and(...conditions))
    .orderBy(tasksTable.createdAt);

  const tasksWithCounts = await Promise.all(
    tasks.map(async (task) => {
      const counts = await getTaskWithSubtaskCounts(task.id);
      return formatTask(task, counts.subtaskCount, counts.completedSubtaskCount);
    })
  );

  res.json(tasksWithCounts);
});

router.post("/tasks", async (req, res) => {
  const body = CreateTaskBody.parse(req.body);

  const [task] = await db
    .insert(tasksTable)
    .values({
      title: body.title,
      description: body.description ?? null,
      priority: body.priority ?? "medium",
      category: body.category ?? "study",
      dueDate: body.dueDate ?? null,
      parentId: body.parentId ?? null,
    })
    .returning();

  res.status(201).json(formatTask(task!));
});

router.get("/tasks/:id", async (req, res) => {
  const { id } = GetTaskParams.parse({ id: Number(req.params.id) });

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const counts = await getTaskWithSubtaskCounts(id);
  res.json(formatTask(task, counts.subtaskCount, counts.completedSubtaskCount));
});

router.put("/tasks/:id", async (req, res) => {
  const { id } = UpdateTaskParams.parse({ id: Number(req.params.id) });
  const body = UpdateTaskBody.parse(req.body);

  const updateData: Partial<typeof tasksTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;

  const [task] = await db
    .update(tasksTable)
    .set(updateData)
    .where(eq(tasksTable.id, id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const counts = await getTaskWithSubtaskCounts(id);
  res.json(formatTask(task, counts.subtaskCount, counts.completedSubtaskCount));
});

router.delete("/tasks/:id", async (req, res) => {
  const { id } = DeleteTaskParams.parse({ id: Number(req.params.id) });

  await db.delete(tasksTable).where(eq(tasksTable.parentId, id));
  await db.delete(tasksTable).where(eq(tasksTable.id, id));

  res.status(204).send();
});

router.patch("/tasks/:id/complete", async (req, res) => {
  const { id } = ToggleTaskCompleteParams.parse({ id: Number(req.params.id) });
  const body = ToggleTaskCompleteBody.parse(req.body);

  const [task] = await db
    .update(tasksTable)
    .set({
      completed: body.completed,
      completedAt: body.completed ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasksTable.id, id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (body.completed) {
    const { usersTable } = await import("@workspace/db/schema");
    await db
      .update(usersTable)
      .set({
        totalTasksCompleted: sql`total_tasks_completed + 1`,
      })
      .where(eq(usersTable.id, 1));
  }

  const counts = await getTaskWithSubtaskCounts(id);
  res.json(formatTask(task, counts.subtaskCount, counts.completedSubtaskCount));
});

router.get("/tasks/:id/subtasks", async (req, res) => {
  const { id } = GetSubtasksParams.parse({ id: Number(req.params.id) });

  const subtasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.parentId, id))
    .orderBy(tasksTable.createdAt);

  const formattedSubtasks = subtasks.map((t) => formatTask(t));
  res.json(formattedSubtasks);
});

router.post("/tasks/:id/subtasks", async (req, res) => {
  const { id } = CreateSubtaskParams.parse({ id: Number(req.params.id) });
  const body = CreateSubtaskBody.parse(req.body);

  const [subtask] = await db
    .insert(tasksTable)
    .values({
      title: body.title,
      description: body.description ?? null,
      priority: body.priority ?? "medium",
      category: body.category ?? "study",
      dueDate: body.dueDate ?? null,
      parentId: id,
    })
    .returning();

  res.status(201).json(formatTask(subtask!));
});

export default router;
