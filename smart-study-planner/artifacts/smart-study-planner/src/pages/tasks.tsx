import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, ChevronDown, CheckCircle2 } from "lucide-react";
import { useTasksData } from "@/hooks/use-tasks";
import { TaskCard } from "@/components/task-card";
import { QuickAdd } from "@/components/quick-add";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TaskCategory, TaskPriority } from "@workspace/api-client-react";

export default function TasksPage() {
  const [search, setSearch] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<string | null>(null);
  const [filterPriority, setFilterPriority] = React.useState<string | null>(null);
  const [showCompleted, setShowCompleted] = React.useState(false);

  const { data: allTasks, isLoading } = useTasksData(); // Get top-level tasks

  // Client-side filtering for snappier experience
  const filteredTasks = React.useMemo(() => {
    if (!allTasks) return [];
    
    return allTasks.filter(task => {
      // Search
      if (search && !task.title.toLowerCase().includes(search.toLowerCase()) && 
          !(task.description?.toLowerCase() || "").includes(search.toLowerCase())) {
        return false;
      }
      
      // Category
      if (filterCategory && task.category !== filterCategory) return false;
      
      // Priority
      if (filterPriority && task.priority !== filterPriority) return false;
      
      return true;
    });
  }, [allTasks, search, filterCategory, filterPriority]);

  const activeTasks = filteredTasks.filter(t => !t.completed);
  const completedTasks = filteredTasks.filter(t => t.completed);

  return (
    <div className="space-y-8 pb-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your workload and track progress.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border shadow-sm">
        <QuickAdd />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(filterCategory || filterPriority) && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {(filterCategory ? 1 : 0) + (filterPriority ? 1 : 0)}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Category</DropdownMenuLabel>
            {Object.values(TaskCategory).map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat}
                checked={filterCategory === cat}
                onCheckedChange={(c) => setFilterCategory(c ? cat : null)}
                className="capitalize"
              >
                {cat}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {Object.values(TaskPriority).map((pri) => (
              <DropdownMenuCheckboxItem
                key={pri}
                checked={filterPriority === pri}
                onCheckedChange={(c) => setFilterPriority(c ? pri : null)}
                className="capitalize"
              >
                {pri}
              </DropdownMenuCheckboxItem>
            ))}
            {(filterCategory || filterPriority) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="justify-center text-muted-foreground"
                  onClick={() => { setFilterCategory(null); setFilterPriority(null); }}
                >
                  Clear filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : (
          <>
            {activeTasks.length > 0 ? (
              <motion.div 
                className="grid gap-3"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
                }}
              >
                <AnimatePresence mode="popLayout">
                  {activeTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-foreground">No active tasks</p>
                <p>You're all caught up! Time to relax or add something new.</p>
              </div>
            )}

            {completedTasks.length > 0 && (
              <Collapsible open={showCompleted} onOpenChange={setShowCompleted} className="border rounded-xl bg-card overflow-hidden">
                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Completed Tasks <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-full text-xs">{completedTasks.length}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-4 pt-0 grid gap-3 bg-muted/10 border-t">
                    {completedTasks.map(task => (
                      <TaskCard key={task.id} task={task} showSubtasks={false} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
      </div>
    </div>
  );
}
