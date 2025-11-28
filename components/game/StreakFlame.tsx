import { motion } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";

import { cn } from "@/lib/utils";

type StreakFlameProps = {
  streakDays: number;
  frozen?: boolean;
  className?: string;
};

export function StreakFlame({
  streakDays,
  frozen = false,
  className,
}: StreakFlameProps) {
  const label = frozen
    ? `Streak freeze armed. Current streak ${streakDays} days`
    : `Current streak ${streakDays} days`;

  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 rounded-full border border-border bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-rose-500/20 px-3 py-2 shadow-sm backdrop-blur",
        className,
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      aria-label={label}
    >
      <div className="relative grid h-7 w-7 place-items-center">
        <Flame className="h-6 w-6 text-orange-500" />
        {frozen ? (
          <Snowflake className="absolute -right-1 -top-1 h-3 w-3 text-sky-300" />
        ) : null}
      </div>
      <div className="leading-none">
        <p className="text-xs text-muted-foreground">Streak</p>
        <p className="text-sm font-semibold text-foreground">
          {streakDays} day{streakDays === 1 ? "" : "s"}
        </p>
      </div>
    </motion.div>
  );
}
