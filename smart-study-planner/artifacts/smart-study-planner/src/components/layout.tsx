import * as React from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  CalendarDays, 
  Bell,
  Sparkles,
  Menu,
  Pencil,
  Check,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./theme-toggle";
import { RestTimer } from "./rest-timer";
import { useUserProfileData, useUpdateProfileMutation } from "@/hooks/use-profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResetDialog } from "./reset-dialog";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/planner", label: "Planner", icon: CalendarDays },
  { href: "/playlist", label: "Playlists", icon: Youtube },
  { href: "/stats", label: "Stats", icon: BarChart3 },
];

function UserFooter() {
  const { data: profile } = useUserProfileData();
  const updateProfile = useUpdateProfileMutation();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");

  function startEdit() {
    setDraft(profile?.name || "");
    setEditing(true);
  }

  async function saveEdit() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed.length < 2) return;
    await updateProfile.mutateAsync({ name: trimmed });
    localStorage.setItem("ssp_user_name", trimmed);
    setEditing(false);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") saveEdit();
    if (e.key === "Escape") cancelEdit();
  }

  if (editing) {
    return (
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-8 text-sm flex-1"
            placeholder="Your name"
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400" onClick={saveEdit} disabled={updateProfile.isPending}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={cancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">Press Enter to save</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-sidebar-border mt-auto flex items-center justify-between">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={startEdit}
            className="flex items-center gap-3 min-w-0 group hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-sm">
                {profile?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium leading-none truncate">{profile?.name || "Student"}</span>
              <span className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pencil className="h-3 w-3" /> Edit name
              </span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Change your name</TooltipContent>
      </Tooltip>
      <ThemeToggle />
    </div>
  );
}

function SidebarContent() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          S
        </div>
        <span className="font-bold text-lg tracking-tight">StudyPlanner</span>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 flex flex-col">
        <div className="px-3 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start ${isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"}`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
        <div className="flex-1" />
        <div className="pt-2 border-t border-sidebar-border/50">
          <ResetDialog />
        </div>
      </div>

      <UserFooter />
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [location] = useLocation();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0 z-10">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 border-b bg-background/80 backdrop-blur flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <span className="ml-2 font-bold tracking-tight">StudyPlanner</span>
          </div>

          <div className="hidden md:block flex-1" />

          <div className="flex items-center gap-2">
            <RestTimer />
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-2"
              onClick={() => window.open("https://chat.openai.com/?q=Help%20me%20plan%20my%20study%20tasks", "_blank")}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Ask AI
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive border-2 border-background" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="h-full p-4 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
