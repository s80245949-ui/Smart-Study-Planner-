import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, usersTable } from "@workspace/db/schema";
import { isNull, sql, eq, and, gte } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats/overview", async (_req, res) => {
  const today = new Date().toISOString().split("T")[0]!;
  const todayStart = new Date(today);
  const todayEnd = new Date(today);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [counts] = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where completed = true)::int`,
      pending: sql<number>`count(*) filter (where completed = false)::int`,
    })
    .from(tasksTable)
    .where(isNull(tasksTable.parentId));

  const [overdue] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(
      and(
        isNull(tasksTable.parentId),
        eq(tasksTable.completed, false),
        sql`due_date < ${today} and due_date is not null`
      )
    );

  const [todayStats] = await db
    .select({ completed: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(
      and(
        isNull(tasksTable.parentId),
        eq(tasksTable.completed, true),
        gte(tasksTable.completedAt, todayStart)
      )
    );

  const users = await db.select().from(usersTable).where(eq(usersTable.id, 1));
  const user = users[0];

  const total = counts?.total ?? 0;
  const completed = counts?.completed ?? 0;

  res.json({
    totalTasks: total,
    completedTasks: completed,
    pendingTasks: counts?.pending ?? 0,
    overdueTasks: overdue?.count ?? 0,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    streakDays: user?.streakDays ?? 0,
    todayCompleted: todayStats?.completed ?? 0,
    todayTarget: 5,
  });
});

router.get("/stats/weekly", async (_req, res) => {
  const days = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]!;
    const dayName = dayNames[d.getDay()]!;

    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const [completedRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasksTable)
      .where(
        and(
          isNull(tasksTable.parentId),
          eq(tasksTable.completed, true),
          gte(tasksTable.completedAt, d),
          sql`completed_at < ${nextDay}`
        )
      );

    const [createdRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasksTable)
      .where(
        and(
          isNull(tasksTable.parentId),
          gte(tasksTable.createdAt, d),
          sql`created_at < ${nextDay}`
        )
      );

    days.push({
      date: dateStr,
      dayName,
      completed: completedRow?.count ?? 0,
      created: createdRow?.count ?? 0,
    });
  }

  res.json(days);
});

router.get("/stats/by-category", async (_req, res) => {
  const categories = ["study", "work", "personal", "health", "finance", "hobby", "social"];

  const results = await Promise.all(
    categories.map(async (category) => {
      const [row] = await db
        .select({
          total: sql<number>`count(*)::int`,
          completed: sql<number>`count(*) filter (where completed = true)::int`,
          pending: sql<number>`count(*) filter (where completed = false)::int`,
        })
        .from(tasksTable)
        .where(and(isNull(tasksTable.parentId), eq(tasksTable.category, category)));

      return {
        category,
        total: row?.total ?? 0,
        completed: row?.completed ?? 0,
        pending: row?.pending ?? 0,
      };
    })
  );

  res.json(results);
});

export default router;
