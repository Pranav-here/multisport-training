"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Hearts,
  ResultCelebration,
  RoundCard,
  StreakFlame,
  XPBar,
} from "@/components/game";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGameStore } from "@/lib/game/store";
import { SessionMode, SessionResult } from "@/lib/game/types";

type SessionPageProps = {
  params: { id: string };
};

export default function SessionPage({ params }: SessionPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const modeParam = searchParams?.get("mode") === "practice" ? "practice" : "play";
  const levelId = params.id;

  const loadProgress = useGameStore((state) => state.loadProgress);
  const saveProgress = useGameStore((state) => state.saveProgress);
  const levels = useGameStore((state) => state.levels);
  const progress = useGameStore((state) => state.progress);
  const activeSession = useGameStore((state) => state.activeSession);
  const startSession = useGameStore((state) => state.startSession);
  const registerPerformance = useGameStore((state) => state.registerPerformance);

  const level = useMemo(
    () => levels.find((item) => item.id === levelId) ?? null,
    [levels, levelId],
  );

  const [ready, setReady] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [effortRatings, setEffortRatings] = useState<number[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const startTimestampRef = useRef<number>(Date.now());

  useEffect(() => {
    loadProgress()
      .catch(() => null)
      .finally(() => setReady(true));
  }, [loadProgress]);

  useEffect(() => {
    if (!ready || !level) return;
    const existing = activeSession;
    if (!existing || existing.levelId !== level.id) {
      const session = startSession(level.id, modeParam);
      if (!session) {
        toast({
          title: "Unable to start session",
          description: "Return to the map and try again.",
        });
        router.push("/play");
        return;
      }
    }
    startTimestampRef.current = Date.now();
  }, [activeSession, level, modeParam, ready, router, startSession, toast]);

  const rounds = activeSession?.rounds ?? [];

  useEffect(() => {
    if (!rounds.length) return;
    setAnswers(Array.from({ length: rounds.length }, () => null));
    setEffortRatings(Array.from({ length: rounds.length }, () => 3));
    setCurrentRoundIndex(0);
    setIsComplete(false);
    setResult(null);
    startTimestampRef.current = Date.now();
  }, [rounds]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimestampRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentRoundIndex] = optionIndex;
      return next;
    });
  };

  const handleEffortChange = (value: number) => {
    setEffortRatings((prev) => {
      const next = [...prev];
      next[currentRoundIndex] = value;
      return next;
    });
  };

  const handleAdvance = async () => {
    if (!rounds.length) return;
    const round = rounds[currentRoundIndex];
    if (round?.quiz && answers[currentRoundIndex] == null) {
      toast({
        title: "Choose an option",
        description: "Select your answer before continuing.",
      });
      return;
    }

    if (currentRoundIndex < rounds.length - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
    } else {
      const totalQuestions = rounds.reduce(
        (count, item) => count + (item.quiz ? 1 : 0),
        0,
      );
      const correctAnswers = rounds.reduce((count, item, index) => {
        if (!item.quiz) return count;
        return count + (answers[index] === item.quiz.answerIndex ? 1 : 0);
      }, 0);
      const avgEffort =
        effortRatings.reduce((sum, effort) => sum + effort, 0) /
        Math.max(1, effortRatings.length);
      const timeSeconds = Math.max(
        10,
        Math.floor((Date.now() - startTimestampRef.current) / 1000),
      );
      const performance = {
        correctAnswers,
        totalQuestions,
        avgEffort,
        timeSeconds,
        missed: totalQuestions - correctAnswers,
      };
      const sessionResult =
        registerPerformance(levelId, performance, modeParam) ??
        null;
      if (sessionResult) {
        setResult(sessionResult);
        setIsComplete(true);
        await saveProgress().catch(() => null);
      }
    }
  };

  const handleReplay = () => {
    if (!level) return;
    startSession(level.id, modeParam);
    setResult(null);
    setIsComplete(false);
    setCurrentRoundIndex(0);
    setAnswers(Array.from({ length: rounds.length }, () => null));
    setEffortRatings(Array.from({ length: rounds.length }, () => 3));
    startTimestampRef.current = Date.now();
  };

  const modeCopy = modeParam === "practice" ? "Practice" : "Session";

  if (!level) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Level not found</h1>
          <p className="text-sm text-muted-foreground">
            Head back to the map and pick another challenge.
          </p>
          <Button className="mt-4 rounded-full" onClick={() => router.push("/play")}>
            Back to map
          </Button>
        </div>
      </main>
    );
  }

  const round = rounds[currentRoundIndex];

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-12 pt-6 text-foreground">
      <header className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="outline"
            className="rounded-full border-white/30 text-white hover:bg-white/10"
            onClick={() => router.push("/play")}
          >
            Exit
          </Button>
          <Hearts hearts={progress.hearts} max={5} />
          <StreakFlame
            streakDays={progress.streakDays}
            frozen={progress.streakFreezeArmed}
          />
          <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
            {modeCopy}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight">
              {level.title}
            </h1>
            <p className="text-sm text-white/70">
              Round {currentRoundIndex + 1} / {rounds.length} • {elapsedSeconds}s
            </p>
          </div>
          <XPBar xp={progress.xp} className="sm:max-w-xs" />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4">
        {isComplete && result ? (
          <ResultCelebration
            result={result}
            onReplay={handleReplay}
            onContinue={() => router.push("/play")}
          />
        ) : round ? (
          <>
            <RoundCard
              round={round}
              index={currentRoundIndex}
              total={rounds.length}
              selectedOption={answers[currentRoundIndex]}
              effortRating={effortRatings[currentRoundIndex]}
              onSelectOption={handleSelectOption}
              onEffortChange={handleEffortChange}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => router.push("/play")}
              >
                Pause
              </Button>
              <Button
                type="button"
                className="rounded-full"
                onClick={handleAdvance}
              >
                {currentRoundIndex === rounds.length - 1
                  ? "Finish"
                  : "Next"}
              </Button>
            </div>
          </>
        ) : (
          <Card className="grid flex-1 place-items-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-white/80">
            Loading session…
          </Card>
        )}
      </div>
    </main>
  );
}
