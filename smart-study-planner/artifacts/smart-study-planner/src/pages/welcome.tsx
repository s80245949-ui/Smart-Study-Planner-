import * as React from "react";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProfileMutation } from "@/hooks/use-profile";

interface WelcomeProps {
  onComplete: (name: string) => void;
}

const FEATURES = [
  "Track tasks by priority & category",
  "Build daily study streaks",
  "Smart input to add tasks fast",
  "Productivity stats & charts",
];

export default function WelcomePage({ onComplete }: WelcomeProps) {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const updateProfile = useUpdateProfileMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    setError("");
    await updateProfile.mutateAsync({ name: trimmed });
    onComplete(trimmed);
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-1/2 bg-primary/10 border-r border-border p-12"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">Smart Study Planner</span>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Your personal<br />
              <span className="text-primary">study companion</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Stay focused, build consistency, and track your progress — one task at a time.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f}
                className="flex items-center gap-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                </span>
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-amber-500" />
          Build streaks. Study smarter.
        </div>
      </motion.div>

      {/* Right panel — name form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">Smart Study Planner</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Welcome</span>
            </div>
            <h1 className="text-3xl font-bold">What should we call you?</h1>
            <p className="text-muted-foreground">
              Enter your name to personalise your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                placeholder="e.g. Alex, Jordan, Sam…"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
                className="h-12 text-base"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving…" : "Get started"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Your name is saved locally to personalise greetings and your profile.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
