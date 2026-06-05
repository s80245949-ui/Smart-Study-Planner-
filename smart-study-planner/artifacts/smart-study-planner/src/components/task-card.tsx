import * as React from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { 
  Calendar, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  CheckCircle2,
  Circle,
  LayoutList
} from "lucide-react";
import { Task, TaskPriority, TaskCategory } from "@workspace/api-client-react";
import { useToggleTaskComplete, useDeleteTask } from "@workspace/api-client-react";
import { getGetTasksQueryKey, getGetTaskQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  showSubtasks?: boolean;
}

const priorityColors = {
  [TaskPriority.high]: "bg-destructive/10 text-destructive border-destructive/20",
  [TaskPriority.medium]: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20",
  [TaskPriority.low]: "bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20",
};

const categoryColors: Record<string, string> = {
  [TaskCategory.study]:    "bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20",
  [TaskCategory.work]:     "bg-purple-500/10 text-purple-600 dark:text-purple-500 border-purple-500/20",
  [TaskCategory.personal]: "bg-orange-500/10 text-orange-600 dark:text-orange-500 border-orange-500/20",
  [TaskCategory.health]:   "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  [TaskCategory.finance]:  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  [TaskCategory.hobby]:    "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  [TaskCategory.social]:   "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
};

export function TaskCard({ task, showSubtasks = true }: TaskCardProps) {
  const queryClient = useQueryClient();
  const toggleComplete = useToggleTaskComplete();
  const deleteTask = useDeleteTask();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleComplete.mutate(
      { id: task.id, data: { completed: !task.completed } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetTaskQueryKey(task.id), updated);
          queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        }
      }
    );
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTask.mutate(
      { id: task.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        }
      }
    );
  };

  const progress = task.subtaskCount > 0 
    ? Math.round((task.completedSubtaskCount / task.subtaskCount) * 100) 
    : task.completed ? 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      <Link href={`/task/${task.id}`}>
        <Card className={cn(
          "p-4 cursor-pointer transition-all duration-200 border border-border/50",
          task.completed ? "opacity-60 bg-muted/30" : "hover:border-primary/50 hover:shadow-md bg-card"
        )}>
          <div className="flex items-start gap-3">
            <button 
              onClick={handleToggle}
              className={cn(
                "mt-1 flex-shrink-0 transition-colors duration-200",
                task.completed ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 fill-primary/20" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  "font-medium truncate transition-all duration-200",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </h3>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/task/${task.id}`} className="cursor-pointer flex items-center">
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Task
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline" className={cn("text-xs font-medium border", categoryColors[task.category])}>
                  {task.category}
                </Badge>
                <Badge variant="outline" className={cn("text-xs font-medium border", priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
                
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center text-xs text-muted-foreground ml-auto",
                    new Date(task.dueDate) < new Date() && !task.completed && "text-destructive"
                  )}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(task.dueDate), "MMM d")}
                  </div>
                )}
              </div>

              {showSubtasks && task.subtaskCount > 0 && (
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <LayoutList className="h-3.5 w-3.5" />
                      <span>{task.completedSubtaskCount} / {task.subtaskCount} subtasks</span>
                    </div>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 opacity-60" />
                </div>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
