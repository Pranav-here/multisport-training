import { TrendingUp } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type XPBarProps = {
  xp: number;
  className?: string;
};

const XP_PER_LEVEL = 100;

const getLevelBreakdown = (xp: number) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXP = (level - 1) * XP_PER_LEVEL;
  const progress = xp - currentLevelXP;
  const nextLevelXP = XP_PER_LEVEL;
  return {
    level,
    progress,
    nextLevelXP,
    percentage: Math.min(100, Math.round((progress / nextLevelXP) * 100)),
  };
};

export function XPBar({ xp, className }: XPBarProps) {
  const { level, progress, nextLevelXP, percentage } = getLevelBreakdown(xp);

  return (
    <div
      className={cn(
        "flex w-full min-w-[220px] flex-col gap-1 rounded-xl border border-border bg-background/70 p-3 shadow-sm backdrop-blur",
        className,
      )}
      aria-label={`Level ${level}, ${progress} XP towards next level`}
    >
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Level {level}</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          {progress}/{nextLevelXP} XP
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  );
}
