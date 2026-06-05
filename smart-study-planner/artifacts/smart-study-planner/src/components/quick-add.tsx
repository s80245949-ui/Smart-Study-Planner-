import * as React from "react";
import { Plus } from "lucide-react";
import { useCreateTask } from "@workspace/api-client-react";
import { getGetTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseSmartInput } from "@/lib/smart-input";
import { useToast } from "@/hooks/use-toast";

const CHEAT_CODES = [
  { tag: "@high",     desc: "High priority (top)" },
  { tag: "@medium",   desc: "Medium priority" },
  { tag: "@low",      desc: "Low priority" },
  { tag: "@study",    desc: "Study category" },
  { tag: "@work",     desc: "Work category" },
  { tag: "@personal", desc: "Personal category" },
  { tag: "@health",   desc: "Health category" },
  { tag: "@finance",  desc: "Finance category" },
  { tag: "@hobby",    desc: "Hobby category" },
  { tag: "@social",   desc: "Social category" },
  { tag: "@today",    desc: "Due today" },
  { tag: "@tomorrow", desc: "Due tomorrow" },
  { tag: "@nextweek", desc: "Due next week" },
];

export function QuickAdd() {
  const [input, setInput] = React.useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseSmartInput(input);

    createTask.mutate(
      { data: parsed },
      {
        onSuccess: () => {
          setInput("");
          queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
          toast({ title: "Task created", description: "Your task has been added." });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to create task." });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="relative flex items-center">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a task… try '@high @study @tomorrow Finish assignment'"
          className="pr-12 h-12 rounded-xl border-primary/20 focus-visible:ring-primary/30 bg-background/50 backdrop-blur shadow-sm transition-all"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || createTask.isPending}
          className="absolute right-1.5 h-9 w-9 rounded-lg"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Cheat-code tooltip on focus */}
      <div className="absolute top-full mt-2 left-0 right-0 p-4 bg-popover border rounded-xl shadow-xl opacity-0 pointer-events-none group-focus-within:opacity-100 transition-opacity z-20 text-xs">
        <p className="font-semibold text-foreground mb-3">⚡ Quick-add cheat codes</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {CHEAT_CODES.map(({ tag, desc }) => (
            <div key={tag} className="flex items-center gap-2">
              <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[11px] shrink-0">
                {tag}
              </span>
              <span className="text-muted-foreground truncate">{desc}</span>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground mt-3 border-t border-border/50 pt-2">
          Example: <span className="text-primary font-mono">@high @study @tomorrow Review notes</span>
        </p>
      </div>
    </form>
  );
}
