import * as React from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Calendar, Trash2, CheckCircle2, Circle, 
  Plus, MoreVertical, LayoutList, Clock
} from "lucide-react";
import { 
  TaskPriority, TaskCategory,
  useGetTask, getGetTaskQueryKey,
  useUpdateTask, useDeleteTask, useToggleTaskComplete,
  useGetSubtasks, getGetSubtasksQueryKey,
  useCreateSubtask,
  getGetTasksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const priorityColors = {
  [TaskPriority.high]: "text-destructive border-destructive/20 bg-destructive/10",
  [TaskPriority.medium]: "text-yellow-600 dark:text-yellow-500 border-yellow-500/20 bg-yellow-500/10",
  [TaskPriority.low]: "text-green-600 dark:text-green-500 border-green-500/20 bg-green-500/10",
};

const categoryColors: Record<string, string> = {
  [TaskCategory.study]:    "text-blue-600 dark:text-blue-500 border-blue-500/20 bg-blue-500/10",
  [TaskCategory.work]:     "text-purple-600 dark:text-purple-500 border-purple-500/20 bg-purple-500/10",
  [TaskCategory.personal]: "text-orange-600 dark:text-orange-500 border-orange-500/20 bg-orange-500/10",
  [TaskCategory.health]:   "text-red-600 dark:text-red-400 border-red-500/20 bg-red-500/10",
  [TaskCategory.finance]:  "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
  [TaskCategory.hobby]:    "text-pink-600 dark:text-pink-400 border-pink-500/20 bg-pink-500/10",
  [TaskCategory.social]:   "text-cyan-600 dark:text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
};

export default function TaskDetailPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: task, isLoading: taskLoading } = useGetTask(id, { query: { enabled: !!id, queryKey: getGetTaskQueryKey(id) } });
  const { data: subtasks = [], isLoading: subtasksLoading } = useGetSubtasks(id, { query: { enabled: !!id, queryKey: getGetSubtasksQueryKey(id) } });
  
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleComplete = useToggleTaskComplete();
  const createSubtask = useCreateSubtask();

  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");

  const handleToggleTask = () => {
    if (!task) return;
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

  const handleUpdateField = (field: string, value: string | null) => {
    if (!task) return;
    updateTask.mutate(
      { id: task.id, data: { [field]: value } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetTaskQueryKey(task.id), updated);
          queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        }
      }
    );
  };

  const handleDelete = () => {
    if (!task || !confirm("Are you sure you want to delete this task?")) return;
    deleteTask.mutate(
      { id: task.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
          toast({ title: "Task deleted" });
          setLocation("/tasks");
        }
      }
    );
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    createSubtask.mutate(
      { id, data: { title: newSubtaskTitle, parentId: id } },
      {
        onSuccess: () => {
          setNewSubtaskTitle("");
          queryClient.invalidateQueries({ queryKey: getGetSubtasksQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
        }
      }
    );
  };

  const handleToggleSubtask = (subtaskId: number, completed: boolean) => {
    toggleComplete.mutate(
      { id: subtaskId, data: { completed: !completed } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSubtasksQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
        }
      }
    );
  };

  const handleDeleteSubtask = (subtaskId: number) => {
    deleteTask.mutate(
      { id: subtaskId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSubtasksQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
        }
      }
    );
  };

  if (taskLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Task not found</h2>
        <Button variant="link" onClick={() => setLocation("/tasks")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to tasks
        </Button>
      </div>
    );
  }

  const progress = task.subtaskCount > 0 
    ? Math.round((task.completedSubtaskCount / task.subtaskCount) * 100) 
    : task.completed ? 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => window.history.back()} className="-ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6 bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <button 
            onClick={handleToggleTask}
            className={cn(
              "mt-1.5 flex-shrink-0 transition-colors duration-200",
              task.completed ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="h-7 w-7 fill-primary/20" />
            ) : (
              <Circle className="h-7 w-7" />
            )}
          </button>
          
          <div className="flex-1 space-y-4">
            <Input
              value={task.title}
              onChange={(e) => handleUpdateField("title", e.target.value)}
              className={cn(
                "text-2xl font-bold border-none bg-transparent shadow-none px-0 h-auto focus-visible:ring-0 focus-visible:border-b rounded-none",
                task.completed && "line-through text-muted-foreground"
              )}
              placeholder="Task title"
            />

            <div className="flex flex-wrap gap-4 pt-2">
              <Select value={task.category} onValueChange={(val) => handleUpdateField("category", val)}>
                <SelectTrigger className={cn("w-auto h-8 text-xs font-medium border-0", categoryColors[task.category])}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskCategory).map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={task.priority} onValueChange={(val) => handleUpdateField("priority", val)}>
                <SelectTrigger className={cn("w-auto h-8 text-xs font-medium border-0", priorityColors[task.priority])}>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskPriority).map(pri => (
                    <SelectItem key={pri} value={pri} className="capitalize">{pri}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-md border border-border/50">
                <Calendar className="h-4 w-4 mr-2" />
                <Input 
                  type="date" 
                  value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                  onChange={(e) => handleUpdateField("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                  className="h-6 p-0 border-none bg-transparent shadow-none focus-visible:ring-0 w-[120px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Textarea
            value={task.description || ""}
            onChange={(e) => handleUpdateField("description", e.target.value)}
            placeholder="Add a description..."
            className="min-h-[120px] resize-none border-none bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LayoutList className="h-5 w-5 text-primary" /> Subtasks
          </h3>
          <span className="text-sm text-muted-foreground font-medium">
            {task.completedSubtaskCount} / {task.subtaskCount} completed
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />

        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
          {subtasksLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              <AnimatePresence mode="popLayout">
                {subtasks.map(subtask => (
                  <motion.div
                    key={subtask.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/30 group transition-colors"
                  >
                    <button 
                      onClick={() => handleToggleSubtask(subtask.id, subtask.completed)}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        subtask.completed ? "text-primary" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      {subtask.completed ? <CheckCircle2 className="h-5 w-5 fill-primary/20" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <span className={cn(
                      "flex-1 text-sm transition-colors",
                      subtask.completed && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              <form onSubmit={handleAddSubtask} className="p-3 bg-muted/10">
                <div className="relative flex items-center">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a subtask..."
                    className="pr-10 h-10 border-transparent bg-transparent focus-visible:ring-0 focus-visible:bg-background shadow-none transition-colors"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    variant="ghost"
                    disabled={!newSubtaskTitle.trim() || createSubtask.isPending}
                    className="absolute right-1 h-8 w-8 text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
