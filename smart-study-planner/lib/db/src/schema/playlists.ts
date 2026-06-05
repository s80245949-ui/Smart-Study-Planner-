import { pgTable, text, serial, integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const playlistsTable = pgTable("playlists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).notNull().default("violet"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playlistVideosTable = pgTable("playlist_videos", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  videoId: varchar("video_id", { length: 20 }).notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Playlist = typeof playlistsTable.$inferSelect;
export type PlaylistVideo = typeof playlistVideosTable.$inferSelect;
