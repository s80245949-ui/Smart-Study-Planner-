import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { playlistsTable, playlistVideosTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

// GET /playlists
router.get("/playlists", async (_req, res) => {
  const playlists = await db
    .select()
    .from(playlistsTable)
    .orderBy(asc(playlistsTable.createdAt));

  const withVideos = await Promise.all(
    playlists.map(async (p) => {
      const videos = await db
        .select()
        .from(playlistVideosTable)
        .where(eq(playlistVideosTable.playlistId, p.id))
        .orderBy(asc(playlistVideosTable.position));
      return { ...p, videos, videoCount: videos.length };
    })
  );

  res.json(withVideos);
});

// POST /playlists
router.post("/playlists", async (req, res) => {
  const { title, description, color } = req.body as {
    title?: string;
    description?: string;
    color?: string;
  };
  if (!title?.trim()) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  const [playlist] = await db
    .insert(playlistsTable)
    .values({
      title: title.trim(),
      description: description ?? null,
      color: color ?? "violet",
    })
    .returning();
  res.status(201).json({ ...playlist, videos: [], videoCount: 0 });
});

// PUT /playlists/:id
router.put("/playlists/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, color } = req.body as {
    title?: string;
    description?: string | null;
    color?: string;
  };
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (color !== undefined) updates.color = color;

  const [updated] = await db
    .update(playlistsTable)
    .set(updates)
    .where(eq(playlistsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Playlist not found" });
    return;
  }
  res.json(updated);
});

// DELETE /playlists/:id
router.delete("/playlists/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(playlistVideosTable).where(eq(playlistVideosTable.playlistId, id));
  await db.delete(playlistsTable).where(eq(playlistsTable.id, id));
  res.status(204).send();
});

// POST /playlists/:id/videos
router.post("/playlists/:id/videos", async (req, res) => {
  const playlistId = Number(req.params.id);
  const { title, url, videoId, thumbnailUrl } = req.body as {
    title?: string;
    url?: string;
    videoId?: string;
    thumbnailUrl?: string;
  };

  if (!title?.trim() || !url?.trim() || !videoId?.trim() || !thumbnailUrl?.trim()) {
    res.status(400).json({ error: "title, url, videoId and thumbnailUrl are required" });
    return;
  }

  const existing = await db
    .select({ id: playlistVideosTable.id })
    .from(playlistVideosTable)
    .where(eq(playlistVideosTable.playlistId, playlistId));

  const [video] = await db
    .insert(playlistVideosTable)
    .values({
      playlistId,
      title: title.trim(),
      url: url.trim(),
      videoId: videoId.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      position: existing.length,
    })
    .returning();

  res.status(201).json(video);
});

// DELETE /playlists/videos/:id  — must come BEFORE /playlists/:id to avoid route shadowing
router.delete("/playlists/videos/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(playlistVideosTable).where(eq(playlistVideosTable.id, id));
  res.status(204).send();
});

export default router;
