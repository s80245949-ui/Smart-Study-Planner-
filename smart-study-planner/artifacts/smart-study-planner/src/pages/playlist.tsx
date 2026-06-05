import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Play, Youtube, ChevronDown, ChevronRight,
  MoreVertical, Pencil, FolderOpen, Link2, X, Check,
} from "lucide-react";
import {
  usePlaylistsData, useCreatePlaylistMutation, useDeletePlaylistMutation,
  useUpdatePlaylistMutation, useAddVideoMutation, useDeleteVideoMutation,
  extractYouTubeId, getThumbnailUrl, type Playlist, type PlaylistVideo,
} from "@/hooks/use-playlists";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
  { name: "violet", bg: "bg-violet-500", light: "bg-violet-500/10 border-violet-500/30 text-violet-500" },
  { name: "blue",   bg: "bg-blue-500",   light: "bg-blue-500/10 border-blue-500/30 text-blue-500" },
  { name: "emerald",bg: "bg-emerald-500",light: "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" },
  { name: "orange", bg: "bg-orange-500", light: "bg-orange-500/10 border-orange-500/30 text-orange-500" },
  { name: "pink",   bg: "bg-pink-500",   light: "bg-pink-500/10 border-pink-500/30 text-pink-500" },
  { name: "red",    bg: "bg-red-500",    light: "bg-red-500/10 border-red-500/30 text-red-500" },
  { name: "cyan",   bg: "bg-cyan-500",   light: "bg-cyan-500/10 border-cyan-500/30 text-cyan-500" },
  { name: "yellow", bg: "bg-yellow-500", light: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500" },
];

function colorClass(name: string, variant: "bg" | "light") {
  return COLORS.find(c => c.name === name)?.[variant] ?? COLORS[0]![variant];
}

// ── Create / Edit Playlist Dialog ──────────────────────────────────────────
function PlaylistFormDialog({
  open, onClose, initial,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Playlist;
}) {
  const { toast } = useToast();
  const create = useCreatePlaylistMutation();
  const update = useUpdatePlaylistMutation();
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [desc, setDesc] = React.useState(initial?.description ?? "");
  const [color, setColor] = React.useState(initial?.color ?? "violet");

  React.useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDesc(initial?.description ?? "");
      setColor(initial?.color ?? "violet");
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, title: title.trim(), description: desc || null, color });
        toast({ title: "Section updated" });
      } else {
        await create.mutateAsync({ title: title.trim(), description: desc || undefined, color });
        toast({ title: "Section created" });
      }
      onClose();
    } catch {
      toast({ variant: "destructive", title: "Something went wrong" });
    }
  }

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit section" : "New playlist section"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Math Revision" autoFocus />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What's this playlist for?" rows={2} className="resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={cn("w-7 h-7 rounded-full transition-all border-2", c.bg,
                    color === c.name ? "border-foreground scale-110" : "border-transparent opacity-70")}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending ? "Saving…" : initial ? "Save changes" : "Create section"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Video Dialog ─────────────────────────────────────────────────────────
function AddVideoDialog({ playlistId, open, onClose }: { playlistId: number; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const addVideo = useAddVideoMutation();
  const [url, setUrl] = React.useState("");
  const [customTitle, setCustomTitle] = React.useState("");
  const [preview, setPreview] = React.useState<{ videoId: string; thumbnailUrl: string } | null>(null);

  React.useEffect(() => {
    if (!open) { setUrl(""); setCustomTitle(""); setPreview(null); }
  }, [open]);

  function handleUrlChange(val: string) {
    setUrl(val);
    const id = extractYouTubeId(val.trim());
    if (id) {
      setPreview({ videoId: id, thumbnailUrl: getThumbnailUrl(id) });
    } else {
      setPreview(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!preview) return;
    const title = customTitle.trim() || `YouTube Video`;
    try {
      await addVideo.mutateAsync({
        playlistId,
        title,
        url: url.trim(),
        videoId: preview.videoId,
        thumbnailUrl: preview.thumbnailUrl,
      });
      toast({ title: "Video added" });
      onClose();
    } catch {
      toast({ variant: "destructive", title: "Failed to add video" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" /> Add YouTube Video
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">YouTube URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          {preview && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border bg-muted/30">
              <div className="relative aspect-video">
                <img src={preview.thumbnailUrl} alt="thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                    <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Custom title (optional)</label>
                <Input
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Give this video a name…"
                  className="h-8 text-sm"
                />
              </div>
            </motion.div>
          )}

          {url && !preview && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <X className="h-4 w-4" /> Not a valid YouTube URL
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!preview || addVideo.isPending}>
              {addVideo.isPending ? "Adding…" : "Add video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ video, onDelete }: { video: PlaylistVideo; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="group relative rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
        onClick={() => window.open(video.url, "_blank")}
      >
        <div className="relative aspect-video">
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-2.5">
          <p className="text-sm font-medium line-clamp-2 leading-snug">{video.title}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Youtube className="h-3 w-3 text-red-500" /> YouTube
          </p>
        </div>
      </motion.div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove video?</AlertDialogTitle>
            <AlertDialogDescription>This will remove "{video.title}" from the playlist.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Playlist Section ──────────────────────────────────────────────────────────
function PlaylistSection({ playlist }: { playlist: Playlist }) {
  const [open, setOpen] = React.useState(true);
  const [addVideoOpen, setAddVideoOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const deletePlaylist = useDeletePlaylistMutation();
  const deleteVideo = useDeleteVideoMutation();
  const { toast } = useToast();

  async function handleDeletePlaylist() {
    await deletePlaylist.mutateAsync(playlist.id);
    toast({ title: "Section deleted" });
  }

  return (
    <>
      <Card className="border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <CardHeader className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left group"
            >
              <div className={cn("w-3 h-3 rounded-full flex-shrink-0", colorClass(playlist.color, "bg"))} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base truncate">{playlist.title}</span>
                  <Badge variant="outline" className={cn("text-xs border", colorClass(playlist.color, "light"))}>
                    {playlist.videoCount} video{playlist.videoCount !== 1 ? "s" : ""}
                  </Badge>
                </div>
                {playlist.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{playlist.description}</p>
                )}
              </div>
              <span className="ml-2 text-muted-foreground flex-shrink-0">
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </span>
            </button>

            <div className="flex items-center gap-1 ml-3 flex-shrink-0">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs"
                onClick={() => setAddVideoOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Add video
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit section
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setConfirmDelete(true)}
                    className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete section
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Videos grid */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CardContent className="p-4">
                {playlist.videos.length === 0 ? (
                  <button
                    onClick={() => setAddVideoOpen(true)}
                    className="w-full h-36 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors group"
                  >
                    <Youtube className="h-8 w-8 opacity-40 group-hover:opacity-70 transition-opacity" />
                    <span className="text-sm">Add your first YouTube video</span>
                  </button>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    <AnimatePresence mode="popLayout">
                      {playlist.videos.map(video => (
                        <VideoCard
                          key={video.id}
                          video={video}
                          onDelete={() => deleteVideo.mutate(video.id)}
                        />
                      ))}
                      {/* Add more tile */}
                      <motion.button
                        layout
                        onClick={() => setAddVideoOpen(true)}
                        className="aspect-video rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-xs"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add more</span>
                      </motion.button>
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <AddVideoDialog playlistId={playlist.id} open={addVideoOpen} onClose={() => setAddVideoOpen(false)} />
      <PlaylistFormDialog open={editOpen} onClose={() => setEditOpen(false)} initial={playlist} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{playlist.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the section and all {playlist.videoCount} video{playlist.videoCount !== 1 ? "s" : ""} in it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PlaylistPage() {
  const { data: playlists, isLoading } = usePlaylistsData();
  const [createOpen, setCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study Playlists</h1>
          <p className="text-muted-foreground mt-1">Organise your YouTube learning videos into sections.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New section
        </Button>
      </div>

      {/* Sections */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : playlists && playlists.length > 0 ? (
        <motion.div
          className="space-y-4"
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
        >
          <AnimatePresence mode="popLayout">
            {playlists.map(playlist => (
              <motion.div
                key={playlist.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <PlaylistSection playlist={playlist} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <Youtube className="h-10 w-10 text-red-500 opacity-60" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Create a section to start organising your YouTube study videos.
          </p>
          <Button onClick={() => setCreateOpen(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" /> Create your first section
          </Button>
        </motion.div>
      )}

      <PlaylistFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
