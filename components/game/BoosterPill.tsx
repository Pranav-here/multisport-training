import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BoosterPillProps = {
  label: string;
  icon: ReactNode;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  description?: string;
  onClick?: () => void;
  className?: string;
};

export function BoosterPill({
  label,
  icon,
  count,
  active = false,
  disabled = false,
  description,
  onClick,
  className,
}: BoosterPillProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "group flex h-auto items-start gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-3 text-left shadow-sm backdrop-blur transition hover:border-primary/60 hover:bg-primary/10",
        active && "border-primary bg-primary/10 text-primary",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
    >
      <span className="grid place-items-center rounded-full bg-foreground/10 p-1.5 text-foreground transition group-hover:scale-105 group-hover:bg-foreground/20">
        {icon}
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {label}
          {count != null ? (
            <span className="inline-flex items-center rounded-full bg-background/60 px-2 text-xs font-medium text-muted-foreground">
              x{count}
            </span>
          ) : null}
        </span>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </Button>
  );
}
