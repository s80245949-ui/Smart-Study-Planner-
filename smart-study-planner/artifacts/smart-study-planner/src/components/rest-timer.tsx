import * as React from "react";
import { Coffee, Play, Pause, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

const PRESETS = [
  { label: "5 min", seconds: 5 * 60 },
  { label: "10 min", seconds: 10 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "30 min", seconds: 30 * 60 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function RestTimer() {
  const [open, setOpen] = React.useState(false);
  const [total, setTotal] = React.useState(5 * 60);
  const [remaining, setRemaining] = React.useState(5 * 60);
  const [running, setRunning] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, remaining]);

  function selectPreset(seconds: number) {
    setTotal(seconds);
    setRemaining(seconds);
    setRunning(false);
    setFinished(false);
  }

  function handleReset() {
    setRemaining(total);
    setRunning(false);
    setFinished(false);
  }

  function handleClose() {
    setOpen(false);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:flex gap-2"
        onClick={() => setOpen(true)}
      >
        <Coffee className="h-4 w-4 text-amber-500" />
        Rest
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-500" />
              Rest Timer
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-4">
            {/* Preset buttons */}
            <div className="flex gap-2">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant={total === p.seconds ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectPreset(p.seconds)}
                  disabled={running}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {/* Countdown display */}
            <div className="relative flex items-center justify-center w-40 h-40 rounded-full border-4 border-muted">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${progress * 3.6}deg, transparent 0deg)`,
                  opacity: 0.15,
                }}
              />
              <span className={`text-4xl font-mono font-bold tabular-nums ${finished ? "text-amber-500" : ""}`}>
                {formatTime(remaining)}
              </span>
            </div>

            {finished && (
              <p className="text-sm text-amber-500 font-medium animate-pulse">
                Break is over — back to it!
              </p>
            )}

            {/* Progress bar */}
            <Progress value={progress} className="w-full h-2" />

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={() => setRunning((r) => !r)}
                disabled={remaining === 0}
                className="w-12 h-12 rounded-full"
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
