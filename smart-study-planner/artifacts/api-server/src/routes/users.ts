import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  UpdateUserProfileBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateUser() {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, 1));
  if (users[0]) return users[0];

  const [user] = await db
    .insert(usersTable)
    .values({ name: "User", streakDays: 0, totalTasksCompleted: 0 })
    .returning();
  return user!;
}

router.get("/user/profile", async (_req, res) => {
  const user = await getOrCreateUser();

  res.json({
    id: user.id,
    name: user.name,
    streakDays: user.streakDays,
    lastActiveDate: user.lastActiveDate ?? null,
    totalTasksCompleted: user.totalTasksCompleted,
    createdAt: user.createdAt.toISOString(),
  });
});

router.put("/user/profile", async (req, res) => {
  const body = UpdateUserProfileBody.parse(req.body);
  const user = await getOrCreateUser();

  const [updated] = await db
    .update(usersTable)
    .set({ name: body.name })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json({
    id: updated!.id,
    name: updated!.name,
    streakDays: updated!.streakDays,
    lastActiveDate: updated!.lastActiveDate ?? null,
    totalTasksCompleted: updated!.totalTasksCompleted,
    createdAt: updated!.createdAt.toISOString(),
  });
});

router.post("/user/streak", async (_req, res) => {
  const user = await getOrCreateUser();
  const today = new Date().toISOString().split("T")[0]!;

  if (user.lastActiveDate === today) {
    res.json({
      streakDays: user.streakDays,
      lastActiveDate: user.lastActiveDate,
      isNewDay: false,
    });
    return;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0]!;

  const newStreak = user.lastActiveDate === yesterdayStr ? user.streakDays + 1 : 1;

  const [updated] = await db
    .update(usersTable)
    .set({ streakDays: newStreak, lastActiveDate: today })
    .where(eq(usersTable.id, user.id))
    .returning();

  res.json({
    streakDays: updated!.streakDays,
    lastActiveDate: updated!.lastActiveDate,
    isNewDay: true,
  });
});

export default router;
