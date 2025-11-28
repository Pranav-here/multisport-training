import { motion } from "framer-motion";
import { Key, LockKeyhole, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GateNodeProps = {
  levelNumber: number;
  requiredStars: number;
  currentStars: number;
  unlocked: boolean;
  canUseKey?: boolean;
  onUnlock?: (useKey: boolean) => void;
  className?: string;
};

const gateVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 18 },
  },
};

export function GateNode({
  levelNumber,
  requiredStars,
  currentStars,
  unlocked,
  canUseKey = false,
  onUnlock,
  className,
}: GateNodeProps) {
  const progress = Math.min(1, currentStars / requiredStars);
  const label = unlocked
    ? `Gate ${levelNumber} unlocked`
    : `Gate ${levelNumber}, ${currentStars} of ${requiredStars} stars`;

  return (
    <motion.div
      className={cn(
        "flex min-w-[160px] flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-3 text-center shadow-md backdrop-blur",
        className,
      )}
      variants={gateVariants}
      initial="initial"
      animate="animate"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <LockKeyhole className="h-5 w-5" />
        Gate {levelNumber}
      </div>
      <div className="relative w-full overflow-hidden rounded-full border border-border/70 bg-background/80">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
      <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <Star className="h-3.5 w-3.5 text-amber-400" />
        {currentStars}/{requiredStars} stars
      </p>
      <div className="flex w-full gap-2">
        <Button
          type="button"
          className="flex-1 rounded-full"
          disabled={unlocked || currentStars < requiredStars}
          onClick={() => onUnlock?.(false)}
        >
          Unlock
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-full"
          disabled={unlocked || !canUseKey}
          onClick={() => onUnlock?.(true)}
        >
          <Key className="mr-1 h-4 w-4" />
          Use key
        </Button>
      </div>
      <span className="text-xs text-muted-foreground" aria-live="polite">
        {unlocked ? "Gate open! Next world awaits." : label}
      </span>
    </motion.div>
  );
}
