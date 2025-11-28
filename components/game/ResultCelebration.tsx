import { motion } from "framer-motion";
import { ArrowRight, RefreshCw, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SessionResult } from "@/lib/game/types";
import { cn } from "@/lib/utils";

type ResultCelebrationProps = {
  result: SessionResult;
  onReplay?: () => void;
  onContinue?: () => void;
  className?: string;
};

export function ResultCelebration({
  result,
  onReplay,
  onContinue,
  className,
}: ResultCelebrationProps) {
  const isPerfect = result.stars === 3;

  return (
    <section
      className={cn(
        "relative flex flex-col gap-5 rounded-3xl border border-border/80 bg-background/90 p-6 text-center shadow-2xl backdrop-blur",
        className,
      )}
    >
      {isPerfect ? <ConfettiBurst key="confetti" /> : null}
      <header className="flex flex-col gap-2">
        <motion.h2
          className="text-2xl font-bold text-foreground"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
        >
          {victoryHeadline(result.stars)}
        </motion.h2>
        <p className="text-sm text-muted-foreground">
          Score {result.score} • Missed {result.missed}
        </p>
      </header>

      <motion.div
        className="flex items-center justify-center gap-2 text-amber-400"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "h-10 w-10",
              index < result.stars ? "fill-current" : "opacity-10",
            )}
          />
        ))}
      </motion.div>

      <div className="flex items-center justify-center gap-6 text-sm">
        <Stat label="XP" value={`+${result.xpGained}`} />
        <Stat label="Coins" value={`+${result.coinsGained}`} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={onReplay}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Replay
        </Button>
        <Button
          type="button"
          className="rounded-full"
          onClick={onContinue}
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

function victoryHeadline(stars: number) {
  if (stars === 3) return "Hat trick! Perfect session.";
  if (stars === 2) return "Strong form! Keep pushing.";
  if (stars === 1) return "Nice! You cleared it.";
  return "Almost there. Try again soon.";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col text-center">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 20 }).map((_, index) => (
        <motion.span
          key={index}
          className="absolute h-2 w-2 rounded-full bg-gradient-to-br from-amber-400 to-rose-500"
          initial={{
            opacity: 0,
            scale: 0.3,
            x: "50%",
            y: "50%",
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: 1,
            x: `${Math.cos(index) * 180}px`,
            y: `${Math.sin(index) * 140}px`,
            rotate: 180,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: index * 0.015,
          }}
        />
      ))}
    </div>
  );
}
