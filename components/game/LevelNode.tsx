import { motion, type HTMLMotionProps } from "framer-motion";
import { Crown, Lock, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Level } from "@/lib/game/types";

type LevelNodeProps = {
  level: Level;
  stars?: 0 | 1 | 2 | 3;
  isCurrent?: boolean;
  onSelect?: (level: Level) => void;
  size?: "md" | "lg";
} & Omit<HTMLMotionProps<"button">, "onSelect">;

const bounce = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 20 },
  },
};

export function LevelNode({
  level,
  stars = 0,
  isCurrent = false,
  onSelect,
  className,
  size = "md",
  ...buttonProps
}: LevelNodeProps) {
  const locked = level.locked;
  const sizeClasses =
    size === "lg"
      ? "h-20 w-20 text-base"
      : "h-16 w-16 text-sm sm:h-20 sm:w-20 sm:text-base";

  const ariaLabel = locked
    ? `Level ${level.number}, locked`
    : `Level ${level.number}, ${stars} star${stars === 1 ? "" : "s"}, tap to start`;

  return (
    <motion.button
      type="button"
      className={cn(
        "flex transform-gpu flex-col items-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        className,
      )}
      variants={bounce}
      initial="initial"
      animate="animate"
      onClick={() => onSelect?.(level)}
      aria-label={ariaLabel}
      {...buttonProps}
    >
      <span
        className={cn(
          "relative grid place-items-center rounded-full border-2 border-border bg-background/80 font-semibold shadow-md backdrop-blur transition",
          sizeClasses,
          locked && "border-dashed border-muted-foreground/40 text-muted-foreground",
          isCurrent && "border-primary shadow-primary/40 shadow-lg",
        )}
      >
        {locked ? (
          <Lock className="h-6 w-6" aria-hidden="true" />
        ) : stars === 3 ? (
          <Crown className="h-6 w-6 text-amber-400" aria-hidden="true" />
        ) : (
          <span>{level.number}</span>
        )}
      </span>
      <motion.div
        className="flex items-center gap-1 text-amber-400"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: locked ? 0 : 1, y: locked ? 6 : 0 }}
        transition={{ duration: 0.2 }}
        aria-hidden="true"
      >
        {locked
          ? null
          : Array.from({ length: 3 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  "h-3.5 w-3.5 fill-current",
                  index < stars ? "opacity-100" : "opacity-20",
                )}
              />
            ))}
      </motion.div>
    </motion.button>
  );
}
