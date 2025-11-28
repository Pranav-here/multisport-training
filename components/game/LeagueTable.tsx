import { ChevronDown, ChevronUp, Crown } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type LeagueEntry = {
  id: string;
  name: string;
  avatarColor: string;
  xp: number;
  rank: number;
  change: "up" | "down" | "stay";
};

type LeagueTableProps = {
  entries: LeagueEntry[];
  highlightId?: string;
  className?: string;
};

export function LeagueTable({
  entries,
  highlightId,
  className,
}: LeagueTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-3xl border border-border/80 bg-background/90 shadow-xl backdrop-blur",
        className,
      )}
    >
      <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Weekly League
          </p>
          <h2 className="text-xl font-bold text-foreground">Top 30 Players</h2>
        </div>
        <div className="flex flex-col text-right text-xs text-muted-foreground">
          <span>Resets Monday 00:00 local</span>
          <span>XP earns promotion</span>
        </div>
      </header>
      <div className="max-h-[480px] overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 px-6 py-3 text-sm transition",
              highlightId === entry.id
                ? "bg-primary/10 font-semibold text-primary"
                : "hover:bg-muted/40",
            )}
            aria-label={`${entry.rank} ${entry.name} ${entry.xp} XP`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-right text-xs font-semibold text-muted-foreground">
                {entry.rank}
              </span>
              {entry.rank <= 3 ? (
                <Crown className="h-4 w-4 text-amber-400" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </div>
            <Avatar
              className={cn(
                "h-9 w-9 border-2 border-border/60",
                highlightId === entry.id && "border-primary",
              )}
              style={{ background: entry.avatarColor }}
            >
              <AvatarFallback className="text-xs font-semibold text-background">
                {entry.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{entry.name}</span>
              <span className="text-xs text-muted-foreground">
                {entry.xp} XP
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
              {entry.change === "up" ? (
                <ChevronUp className="h-4 w-4 text-emerald-500" />
              ) : entry.change === "down" ? (
                <ChevronDown className="h-4 w-4 text-rose-500" />
              ) : (
                <span className="h-4 w-4" />
              )}
              {entry.change === "up"
                ? "+"
                : entry.change === "down"
                  ? "-"
                  : "•"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
