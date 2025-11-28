"use client";

import { Drawer } from "vaul";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Level, SessionMode } from "@/lib/game/types";
import { resolveRewards } from "@/lib/game/session";
import { cn } from "@/lib/utils";
import { BoosterPill } from "./BoosterPill";

import {
  Brain,
  Clock,
  Dumbbell,
  PlayCircle,
  Repeat,
  Sparkles,
} from "lucide-react";

type SessionPreviewProps = {
  level: Level | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (mode: SessionMode) => void;
  onEquipBooster?: () => void;
  inventoryDoublers?: number;
  requiredStars?: number;
  currentStars?: number;
  canUseKey?: boolean;
  onUnlockGate?: (useKey: boolean) => void;
  disabled?: boolean;
};

const SKILL_LABELS: Record<string, string> = {
  first_touch: "First touch",
  scanning: "Scanning",
  passing: "Passing",
  turning: "Turning",
  press_break: "Press break",
  finishing: "Finishing",
};

export function SessionPreview({
  level,
  open,
  onOpenChange,
  onStart,
  onEquipBooster,
  inventoryDoublers = 0,
  requiredStars,
  currentStars = 0,
  canUseKey = false,
  onUnlockGate,
  disabled = false,
}: SessionPreviewProps) {
  const rewards =
    level && !level.gate
      ? resolveRewards(level, 3, "play", false)
      : { xp: 0, coins: 0 };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-3xl flex-col rounded-t-3xl border border-border/80 bg-background shadow-2xl">
          <div className="flex items-center justify-between px-6 pt-4">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-muted" />
          </div>
          <div className="overflow-y-auto px-6 pb-6">
            {level ? (
              <div className="flex flex-col gap-5">
                <header className="flex flex-col gap-2">
                  <Badge className="w-fit rounded-full px-3 py-1 text-xs">
                    {level.gate ? "Gate Unlock" : `World ${level.world}`}
                  </Badge>
                  <h2 className="text-2xl font-bold leading-tight text-foreground">
                    {level.title}
                  </h2>
                  {level.gate ? (
                    <p className="text-sm text-muted-foreground">
                      Collect stars or use a key to enter the next world.
                    </p>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {level.estMinutes} min • 3 rounds
                    </p>
                  )}
                </header>

                {level.gate ? (
                  <GatePreview
                    levelNumber={level.number}
                    requiredStars={requiredStars ?? 0}
                    currentStars={currentStars}
                    canUseKey={canUseKey}
                    unlocked={!level.locked}
                    onUnlock={onUnlockGate}
                  />
                ) : (
                  <>
                    <section className="flex flex-wrap gap-2">
                      {level.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="rounded-full px-3 py-1"
                        >
                          <Brain className="mr-2 h-4 w-4" />
                          {SKILL_LABELS[skill] ?? skill}
                        </Badge>
                      ))}
                    </section>

                    <section className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Rewards
                      </h3>
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <RewardCard
                          label="Base XP"
                          value={`+${rewards.xp}`}
                          icon={<Sparkles className="h-5 w-5 text-amber-400" />}
                        />
                        <RewardCard
                          label="Coins"
                          value={`+${rewards.coins}`}
                          icon={<Dumbbell className="h-5 w-5 text-sky-400" />}
                        />
                        <RewardCard
                          label="Star Goals"
                          value={`${level.thresholds.one}/${level.thresholds.two}/${level.thresholds.three}`}
                          icon={<Repeat className="h-5 w-5 text-purple-400" />}
                        />
                      </div>
                    </section>

                    <section className="grid gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          Boost your run
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          Star Doubler x{inventoryDoublers}
                        </span>
                      </div>
                      <BoosterPill
                        icon={<Sparkles className="h-4 w-4 text-amber-400" />}
                        label="Equip Star Doubler"
                        description="Double your coin payout this session"
                        count={inventoryDoublers}
                        disabled={!inventoryDoublers}
                        onClick={onEquipBooster}
                      />
                    </section>

                    <div className="grid gap-2 text-xs text-muted-foreground">
                      {disabled ? (
                        <p className="rounded-xl border border-dashed border-border/70 bg-background/80 p-3">
                          Finish earlier levels or open the gate to unlock this
                          session.
                        </p>
                      ) : null}
                    </div>
                    <div className="grid gap-3">
                      <Button
                        type="button"
                        size="lg"
                        className="h-12 rounded-full text-base font-semibold"
                        disabled={disabled}
                        onClick={() => onStart("play")}
                      >
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Start Session
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="h-12 rounded-full text-base font-semibold"
                        disabled={disabled}
                        onClick={() => onStart("practice")}
                      >
                        Practice Mode
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <EmptyPreview />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function RewardCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-background/70 px-3 py-4 text-sm backdrop-blur">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-base font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground">{icon}</span>
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Sparkles className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Select a level on the path to preview the session.
      </p>
    </div>
  );
}

function GatePreview({
  levelNumber,
  requiredStars,
  currentStars,
  canUseKey,
  unlocked,
  onUnlock,
}: {
  levelNumber: number;
  requiredStars: number;
  currentStars: number;
  canUseKey: boolean;
  unlocked: boolean;
  onUnlock?: (useKey: boolean) => void;
}) {
  const progress = Math.min(1, requiredStars ? currentStars / requiredStars : 0);
  const ready = currentStars >= requiredStars;
  return (
    <div className="grid gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span>Gate {levelNumber}</span>
        <span>
          {currentStars}/{requiredStars} stars
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-background/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-[width]"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <Button
          type="button"
          className="rounded-full"
          disabled={unlocked || !ready}
          onClick={() => onUnlock?.(false)}
        >
          Unlock with stars
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={unlocked || !canUseKey}
          onClick={() => onUnlock?.(true)}
        >
          Use Gate Key
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Collect stars by perfecting sessions. Keys unlock a gate instantly.
      </p>
    </div>
  );
}
