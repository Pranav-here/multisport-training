import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

type HeartsProps = {
  hearts: number;
  max?: number;
  className?: string;
};

const heartVariants = {
  enter: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 20 },
  },
};

export function Hearts({ hearts, max = 5, className }: HeartsProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-background/60 px-4 py-2 shadow-sm backdrop-blur",
        className,
      )}
      aria-label={`${hearts} hearts`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => {
          const filled = index < hearts;
          return (
            <motion.span
              key={index}
              variants={heartVariants}
              initial="enter"
              animate="visible"
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full",
                filled ? "text-rose-500" : "text-muted-foreground",
              )}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  filled ? "fill-current" : "fill-transparent",
                )}
              />
            </motion.span>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-foreground">
        {hearts}/{max}
      </span>
    </div>
  );
}
