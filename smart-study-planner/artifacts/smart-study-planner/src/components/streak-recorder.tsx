import { useEffect } from "react";
import { useRecordStreakMutation } from "@/hooks/use-profile";

export function StreakRecorder() {
  const recordStreak = useRecordStreakMutation();

  useEffect(() => {
    recordStreak.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
