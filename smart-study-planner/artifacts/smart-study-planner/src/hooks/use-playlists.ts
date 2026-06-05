import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface PlaylistVideo {
  id: number;
  playlistId: number;
  title: string;
  url: string;
  videoId: string;
  thumbnailUrl: string;
  position: number;
  createdAt: string;
}

export interface Playlist {
  id: number;
  title: string;
  description: string | null;
  color: string;
  videoCount: number;
  videos: PlaylistVideo[];
  createdAt: string;
  updatedAt: string;
}

async function fetchPlaylists(): Promise<Playlist[]> {
  const res = await fetch(`${BASE}/api/playlists`);
  if (!res.ok) throw new Error("Failed to fetch playlists");
  return res.json();
}

export function usePlaylistsData() {
  return useQuery({ queryKey: ["playlists"], queryFn: fetchPlaylists });
}

export function useCreatePlaylistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; description?: string; color?: string }) => {
      const res = await fetch(`${BASE}/api/playlists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create playlist");
      return res.json() as Promise<Playlist>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useUpdatePlaylistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; title?: string; description?: string; color?: string }) => {
      const res = await fetch(`${BASE}/api/playlists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update playlist");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useDeletePlaylistMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/playlists/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete playlist");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useAddVideoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ playlistId, ...data }: { playlistId: number; title: string; url: string; videoId: string; thumbnailUrl: string }) => {
      const res = await fetch(`${BASE}/api/playlists/${playlistId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add video");
      return res.json() as Promise<PlaylistVideo>;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useDeleteVideoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${BASE}/api/playlists/videos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

// --- YouTube helpers ---
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

export function getThumbnailUrl(videoId: string) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
