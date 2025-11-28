"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Hud,
  PathCanvas,
  SessionPreview,
} from "@/components/game";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/lib/game/store";
import { Level, SessionMode } from "@/lib/game/types";
import { cn } from "@/lib/utils";

const REQUIRED_STARS_PER_WORLD = 35;

export default function PlayPage() {
  const router = useRouter();
  const { toast } = useToast();

  const loadProgress = useGameStore((state) => state.loadProgress);
  const levels = useGameStore((state) => state.levels);
  const progress = useGameStore((state) => state.progress);
  const practiceQueue = useGameStore((state) => state.practiceQueue);
  const selectLevel = useGameStore((state) => state.selectLevel);
  const selectedLevelId = useGameStore((state) => state.selectedLevelId);
  const startSession = useGameStore((state) => state.startSession);
  const applyBooster = useGameStore((state) => state.applyBooster);
  const openGate = useGameStore((state) => state.openGate);

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    loadProgress().catch(() => null);
  }, [loadProgress]);

  const selectedLevel = useMemo(
    () => levels.find((level) => level.id === selectedLevelId) ?? null,
    [levels, selectedLevelId],
  );

  useEffect(() => {
    if (selectedLevel) {
      setPreviewOpen(true);
    }
  }, [selectedLevel]);

  const nextPlayableLevelId = useMemo(() => {
    if (!levels.length) return null;
    const byOrder = [...levels].filter((level) => !level.gate);
    const candidate =
      byOrder.find(
        (level) =>
          !level.locked && (progress.stars[level.id] ?? 0) === 0,
      ) ?? byOrder.find((level) => !level.locked);
    return candidate?.id ?? null;
  }, [levels, progress.stars]);

  const currentLevelId = selectedLevelId ?? nextPlayableLevelId;

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleKeyPan = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;
    const step = 260;
    if (event.key === "ArrowRight") {
      container.scrollBy({ left: step, behavior: "smooth" });
      event.preventDefault();
    } else if (event.key === "ArrowLeft") {
      container.scrollBy({ left: -step, behavior: "smooth" });
      event.preventDefault();
    } else if (event.key === "Home") {
      container.scrollTo({ left: 0, behavior: "smooth" });
      event.preventDefault();
    } else if (event.key === "End") {
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
      event.preventDefault();
    }
  };

  const handleSelectLevel = (level: Level) => {
    if (level.locked && !level.gate) {
      toast({
        title: "Locked level",
        description: "Earn more stars to unlock this session.",
      });
      return;
    }
    selectLevel(level.id);
  };

  const handleStart = (mode: SessionMode) => {
    if (!selectedLevel) return;
    if (selectedLevel.locked) {
      toast({
        title: "Locked session",
        description: selectedLevel.gate
          ? "Open the gate before continuing."
          : "Finish the previous node to unlock this challenge.",
      });
      return;
    }
    if (mode === "play" && progress.hearts <= 0) {
      toast({
        title: "No hearts remaining",
        description: "Buy an extra heart or wait for the daily refill.",
      });
      return;
    }

    startSession(selectedLevel.id, mode);
    setPreviewOpen(false);
    router.push(`/session/${selectedLevel.id}?mode=${mode}`);
  };

  const handleEquipDoubler = () => {
    const success = applyBooster("starDoubler");
    if (!success) {
      toast({
        title: "No doublers available",
        description: "Buy one in the shop to double your coins.",
      });
    } else {
      toast({
        title: "Star Doubler equipped",
        description: "Coins will be doubled in your next session.",
      });
    }
  };

  const handleUnlockGate = (useKey: boolean) => {
    if (!selectedLevel) return;
    const unlocked = openGate(selectedLevel.id, useKey);
    toast({
      title: unlocked ? "Gate unlocked" : "Keep collecting stars",
      description: unlocked
        ? "The path continues! Scroll ahead to explore the next world."
        : useKey
          ? "You need a gate key to unlock this."
          : "You need more stars to open this gate.",
    });
  };

  const inventoryDoublers = progress.inventory.doubler;
  const currentStarsForWorld = selectedLevel
    ? countStarsForWorld(progress.stars, levels, selectedLevel.world)
    : 0;
  const requiredStars =
    selectedLevel?.gate && selectedLevel.world
      ? selectedLevel.world * REQUIRED_STARS_PER_WORLD
      : undefined;

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 px-4 pb-10 pt-6 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="sticky top-4 z-10">
          <Hud onOpenShop={() => router.push("/shop")} />
        </div>

        <section className="flex flex-col gap-4">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Skill Journey
              </h1>
              <p className="text-sm text-slate-200/70">
                Tap a node to begin. Earn stars to unlock gates.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10"
              onClick={() => router.push("/league")}
            >
              Weekly League
            </Button>
          </header>

          <div
            ref={scrollRef}
            className="hide-scrollbar overflow-x-auto pb-6"
            onKeyDown={handleKeyPan}
            tabIndex={0}
            aria-label="World map. Use arrow keys to pan."
          >
            <PathCanvas
              levels={levels}
              stars={progress.stars}
              currentLevelId={currentLevelId}
              onSelectLevel={handleSelectLevel}
              className="min-w-[1200px]"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-inner backdrop-blur">
          <h2 className="text-lg font-semibold">
            Practice streak savers
          </h2>
          <p className="text-sm text-white/70">
            Quick three-card practice refreshes your weakest skills and
            protects your streak.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {practiceQueue.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-white/15 px-3 py-1 text-sm capitalize text-white/90"
              >
                {skill.replace("_", " ")}
              </span>
            ))}
          </div>
        </section>
      </div>

      <SessionPreview
        level={selectedLevel}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onStart={handleStart}
        onEquipBooster={handleEquipDoubler}
        inventoryDoublers={inventoryDoublers}
        requiredStars={requiredStars}
        currentStars={currentStarsForWorld}
        canUseKey={progress.inventory.keys > 0}
        onUnlockGate={handleUnlockGate}
        disabled={Boolean(selectedLevel?.locked && !selectedLevel?.gate)}
      />
    </main>
  );
}

function countStarsForWorld(
  stars: Record<string, number>,
  levels: Level[],
  world: number,
) {
  return levels
    .filter((level) => level.world === world && !level.gate)
    .reduce((sum, level) => sum + (stars[level.id] ?? 0), 0);
}
