import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, usersTable, playlistsTable, playlistVideosTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/reset", async (_req, res) => {
  await db.delete(tasksTable);
  await db.delete(playlistVideosTable);
  await db.delete(playlistsTable);
  await db
    .update(usersTable)
    .set({
      name: "User",
      streakDays: 0,
      lastActiveDate: null,
      totalTasksCompleted: 0,
    })
    .where(eq(usersTable.id, 1));

  res.json({ success: true });
});

export default router;
