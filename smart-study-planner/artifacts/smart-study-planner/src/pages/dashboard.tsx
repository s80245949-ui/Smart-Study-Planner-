import * as React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, CircleDashed, Clock, Sparkles } from "lucide-react";
import { useUserProfileData } from "@/hooks/use-profile";
import { useDailyQuoteData, useStatsOverviewData } from "@/hooks/use-stats";
import { useTasksData } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskCard } from "@/components/task-card";
import { QuickAdd } from "@/components/quick-add";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name}!`;
  if (hour < 18) return `Good Afternoon, ${name}!`;
  return `Good Evening, ${name}!`;
}

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useUserProfileData();
  const { data: quote, isLoading: quoteLoading } = useDailyQuoteData();
  const { data: stats, isLoading: statsLoading } = useStatsOverviewData();
  const { data: tasks, isLoading: tasksLoading } = useTasksData({ completed: false });

  const todayTasks = tasks?.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    const today = new Date();
    return due.getDate() === today.getDate() && 
           due.getMonth() === today.getMonth() && 
           due.getFullYear() === today.getFullYear();
  }) || [];

  const completionRate = stats ? Math.round((stats.todayCompleted / stats.todayTarget) * 100) || 0 : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            {profileLoading ? <Skeleton className="h-10 w-64" /> : getGreeting(profile?.name || "Student")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg flex items-center gap-2"
          >
            {format(new Date(), "EEEE, MMMM do")}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border shadow-sm rounded-2xl p-4 flex items-center gap-4 shrink-0"
        >
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</div>
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? <Skeleton className="h-8 w-12" /> : `${stats?.streakDays || 0} Days`}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quote */}
      {quote && !quoteLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-primary/5 border-primary/10 shadow-none">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Sparkles className="h-8 w-8 text-primary shrink-0 opacity-50" />
              <div>
                <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">"{quote.text}"</p>
                <p className="text-sm font-medium text-primary mt-2">— {quote.author}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Progress & Quick Add */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden relative border-none bg-gradient-to-br from-card to-card/50 shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <CardHeader>
            <CardTitle className="text-xl">Today's Progress</CardTitle>
            <CardDescription>You've completed {stats?.todayCompleted || 0} out of {stats?.todayTarget || 0} tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span className="text-primary">{completionRate}%</span>
                <span className="text-muted-foreground">Daily Goal</span>
              </div>
              <Progress value={completionRate} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Total
                </div>
                <div className="text-2xl font-semibold">{stats?.totalTasks || 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Done
                </div>
                <div className="text-2xl font-semibold text-green-500">{stats?.completedTasks || 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CircleDashed className="h-3.5 w-3.5 text-blue-500" /> Pending
                </div>
                <div className="text-2xl font-semibold text-blue-500">{stats?.pendingTasks || 0}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-destructive" /> Overdue
                </div>
                <div className="text-2xl font-semibold text-destructive">{stats?.overdueTasks || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Quick Add
            </h3>
            <QuickAdd />
          </div>
          
          <Card className="bg-card/50 shadow-sm">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Study Tip</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm">
              Break large study sessions into 25-minute Pomodoro intervals. Take 5 minutes to stretch in between to maintain focus.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Today's Tasks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Today's Agenda</h2>
          <Button variant="outline" size="sm" asChild>
            <a href="/tasks">View All</a>
          </Button>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : todayTasks.length > 0 ? (
          <motion.div 
            className="grid gap-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {todayTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </motion.div>
        ) : (
          <Card className="border-dashed bg-transparent shadow-none h-48 flex flex-col items-center justify-center text-center p-6">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">You're all caught up!</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              No tasks due today. Enjoy your free time or get ahead on upcoming assignments.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
