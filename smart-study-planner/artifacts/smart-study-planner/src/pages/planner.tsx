import * as React from "react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { useTasksData } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/task-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const { data: allTasks, isLoading } = useTasksData({ completed: false });
  const today = startOfDay(new Date());

  // Generate next 7 days
  const days = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  const tasksByDay = React.useMemo(() => {
    if (!allTasks) return {};
    
    const grouped: Record<string, typeof allTasks> = {};
    
    // Initialize empty arrays for the next 7 days
    days.forEach(day => {
      grouped[day.toISOString()] = [];
    });
    grouped['overdue'] = [];
    grouped['later'] = [];

    allTasks.forEach(task => {
      if (!task.dueDate) {
        grouped['later'].push(task);
        return;
      }
      
      const taskDate = startOfDay(new Date(task.dueDate));
      
      if (taskDate < today) {
        grouped['overdue'].push(task);
      } else {
        const matchingDay = days.find(d => isSameDay(d, taskDate));
        if (matchingDay) {
          grouped[matchingDay.toISOString()].push(task);
        } else {
          grouped['later'].push(task);
        }
      }
    });

    return grouped;
  }, [allTasks, days, today]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[320px] w-[320px] space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden pb-4">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Study Planner</h1>
        <p className="text-muted-foreground mt-1">Your schedule for the week ahead.</p>
      </div>

      <ScrollArea className="flex-1 w-full rounded-xl" orientation="horizontal">
        <div className="flex gap-6 pb-6 pr-6 h-full items-start min-h-[500px]">
          
          {/* Overdue Column */}
          {tasksByDay['overdue']?.length > 0 && (
            <div className="min-w-[320px] w-[320px] shrink-0 flex flex-col">
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 mb-3 border-b-2 border-destructive">
                <h3 className="font-bold flex items-center text-destructive">
                  <Clock className="h-5 w-5 mr-2" /> Overdue
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{tasksByDay['overdue'].length} tasks</p>
              </div>
              <div className="space-y-3">
                {tasksByDay['overdue'].map(task => (
                  <TaskCard key={task.id} task={task} showSubtasks={false} />
                ))}
              </div>
            </div>
          )}

          {/* Next 7 Days */}
          {days.map((day, index) => {
            const isToday = index === 0;
            const isTomorrow = index === 1;
            const dateKey = day.toISOString();
            const dayTasks = tasksByDay[dateKey] || [];
            
            let label = format(day, "EEEE");
            if (isToday) label = "Today";
            if (isTomorrow) label = "Tomorrow";

            return (
              <div key={dateKey} className="min-w-[320px] w-[320px] shrink-0 flex flex-col h-full bg-muted/5 rounded-xl p-3 border border-border/50 shadow-sm">
                <div className={cn(
                  "sticky top-0 z-10 bg-transparent py-2 mb-3 border-b-2 transition-colors",
                  isToday ? "border-primary" : "border-border"
                )}>
                  <h3 className={cn(
                    "font-bold flex items-center gap-2",
                    isToday && "text-primary"
                  )}>
                    {isToday && <CalendarIcon className="h-5 w-5" />}
                    {label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">{format(day, "MMM d, yyyy")}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
                  {dayTasks.length > 0 ? (
                    dayTasks.map(task => (
                      <TaskCard key={task.id} task={task} showSubtasks={false} />
                    ))
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-xl bg-card/30">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">Clear schedule</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Later Column */}
          <div className="min-w-[320px] w-[320px] shrink-0 flex flex-col h-full bg-muted/5 rounded-xl p-3 border border-border/50 shadow-sm">
            <div className="sticky top-0 z-10 bg-transparent py-2 mb-3 border-b-2 border-border">
              <h3 className="font-bold flex items-center text-foreground">
                Someday
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">No due date</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
              {tasksByDay['later']?.length > 0 ? (
                tasksByDay['later'].map(task => (
                  <TaskCard key={task.id} task={task} showSubtasks={false} />
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/50 rounded-xl bg-card/30">
                  <p className="text-sm text-muted-foreground">No unscheduled tasks</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </ScrollArea>
    </div>
  );
}
