import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout";
import { StreakRecorder } from "@/components/streak-recorder";
import { useUserProfileData } from "@/hooks/use-profile";
import * as React from "react";

// Pages
import Dashboard from "@/pages/dashboard";
import TasksPage from "@/pages/tasks";
import TaskDetailPage from "@/pages/task-detail";
import StatsPage from "@/pages/stats";
import PlannerPage from "@/pages/planner";
import WelcomePage from "@/pages/welcome";
import PlaylistPage from "@/pages/playlist";

const STORAGE_KEY = "ssp_user_name";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading } = useUserProfileData();
  const [nameSet, setNameSet] = React.useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  });

  // Derive whether we need the welcome screen
  const hasRealName = profile?.name && profile.name !== "User";
  // If the API returns a real saved name, persist it locally
  React.useEffect(() => {
    if (hasRealName && profile?.name) {
      localStorage.setItem(STORAGE_KEY, profile.name);
    }
  }, [hasRealName, profile?.name]);

  function handleWelcomeComplete(name: string) {
    localStorage.setItem(STORAGE_KEY, name);
    setNameSet(true);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold animate-pulse">
            S
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  const showWelcome = !nameSet && !hasRealName;

  if (showWelcome) {
    return <WelcomePage onComplete={handleWelcomeComplete} />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/tasks" component={TasksPage} />
        <Route path="/task/:id" component={TaskDetailPage} />
        <Route path="/stats" component={StatsPage} />
        <Route path="/planner" component={PlannerPage} />
        <Route path="/playlist" component={PlaylistPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthGate>
              <StreakRecorder />
              <Router />
            </AuthGate>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
