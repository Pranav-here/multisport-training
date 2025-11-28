"use client";

import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGameStore } from "@/lib/game/store";
import { DAILY_QUESTS } from "@/lib/game/quests";
import { cn } from "@/lib/utils";
import { Hearts } from "./Hearts";
import { XPBar } from "./XPBar";
import { StreakFlame } from "./StreakFlame";

import {
  Coins,
  Flame,
  Heart,
  LockKeyhole,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";

type HudProps = {
  className?: string;
  onOpenShop?: () => void;
};

export function Hud({ className, onOpenShop }: HudProps) {
  const {
    progress,
    hearts,
    streakDays,
    xp,
    coins,
    inventory,
    streakFreezeArmed,
    dailyQuests,
  } = useGameSummary();

  const questSummary = useMemo(() => {
    if (!dailyQuests.length) return null;
    const pending = dailyQuests.filter((quest) => !quest.completed);
    const next = pending[0] ?? dailyQuests[0];
    if (!next) return null;
    return `${next.progress}/${next.goal} ${next.label}`;
  }, [dailyQuests]);

  return (
    <header
      className={cn(
        "flex w-full flex-col gap-4 rounded-3xl border border-border/70 bg-background/80 p-4 shadow-lg backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Hearts hearts={hearts} max={5} className="order-1" />
        <StreakFlame
          streakDays={streakDays}
          frozen={streakFreezeArmed}
          className="order-3 sm:order-2"
        />
        <Badge
          variant="outline"
          className="order-2 flex items-center gap-2 rounded-full px-3 py-2 text-sm sm:order-3"
        >
          <Coins className="h-4 w-4 text-amber-500" />
          {coins} Coins
        </Badge>
        <Badge
          variant="outline"
          className="order-4 flex items-center gap-2 rounded-full px-3 py-2 text-sm"
        >
          <Star className="h-4 w-4 text-yellow-400" />
          {progress.totalStars} Stars
        </Badge>
        <Button
          variant="secondary"
          size="sm"
          className="order-5 ml-auto rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          onClick={onOpenShop}
          asChild={onOpenShop ? false : true}
        >
          {onOpenShop ? (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Shop Boosters
            </span>
          ) : (
            <Link href="/shop" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Shop Boosters
            </Link>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(200px,1fr)_minmax(240px,1.2fr)]">
        <XPBar xp={xp} />
        <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-muted/40 p-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Daily Quests</span>
            <span>{progress.completedQuests}/3 done</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {dailyQuests.map((quest) => (
              <Badge
                key={quest.id}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs",
                  quest.completed
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-background/80 text-muted-foreground",
                )}
              >
                <Flame className="h-3.5 w-3.5" />
                {quest.progress}/{quest.goal} {quest.label}
              </Badge>
            ))}
            {!dailyQuests.length ? (
              <p className="text-xs text-muted-foreground">
                New quests drop daily. Finish a session to see progress.
              </p>
            ) : null}
          </div>
          {questSummary ? (
            <p className="text-xs text-muted-foreground">
              Next up: {questSummary}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              You completed today’s quests, nice work!
            </p>
          )}
        </div>
      </div>

      <Separator className="border-border/60" />

      <div className="flex flex-wrap gap-3">
        <StatChip
          icon={<Shield className="h-4 w-4 text-sky-400" />}
          label="Streak Freeze"
          value={`${inventory.freeze} ready`}
        />
        <StatChip
          icon={<Sparkles className="h-4 w-4 text-amber-400" />}
          label="Star Doubler"
          value={`${inventory.doubler} in bag`}
        />
        <StatChip
          icon={<LockKeyhole className="h-4 w-4 text-purple-400" />}
          label="Gate Keys"
          value={`${inventory.keys} spare`}
        />
        <StatChip
          icon={<Heart className="h-4 w-4 text-rose-400" />}
          label="Extra Hearts"
          value={`${inventory.extraHearts}`}
        />
      </div>
    </header>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-sm text-muted-foreground">
      <span className="grid place-items-center">{icon}</span>
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

function useGameSummary() {
  return useGameStore((state) => {
    const progress = state.progress;
    const totalStars = Object.values(progress.stars).reduce(
      (sum, stars) => sum + stars,
      0,
    );
    const completedQuests = progress.dailyQuests.filter(
      (quest) => quest.completed,
    ).length;

    return {
      progress: {
        ...progress,
        totalStars,
        completedQuests,
      },
      hearts: progress.hearts,
      streakDays: progress.streakDays,
      streakFreezeArmed: progress.streakFreezeArmed,
      xp: progress.xp,
      coins: progress.coins,
      inventory: progress.inventory,
      dailyQuests: progress.dailyQuests.map((quest) => {
        const definition = DAILY_QUESTS.find((item) => item.id === quest.id);
        return {
          ...quest,
          label: definition?.label ?? quest.id,
          goal: definition?.goal ?? 0,
        };
      }),
    };
  });
}
