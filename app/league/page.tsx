"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { LeagueTable, type LeagueEntry } from "@/components/game";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/lib/game/store";

const DUMMY_NAMES = [
  "Sofia Martinez",
  "Liam Johnson",
  "Noah Chen",
  "Amelia Singh",
  "Oliver Dubois",
  "Mia Anders",
  "Lucas Rossi",
  "Ava Nakamura",
  "Ethan Silva",
  "Isabella Costa",
  "Mateo Park",
  "Aria Becker",
  "Elijah Stone",
  "Harper Flores",
  "Benjamin Ali",
  "Evelyn Novak",
  "Henry Adams",
  "Grace O'Connor",
  "Sebastian Müller",
  "Layla Reed",
  "Daniel Rivera",
  "Chloe Laurent",
  "Jack Kim",
  "Scarlett Ito",
  "Logan Clarke",
  "Penelope Ruiz",
  "Leo Moretti",
  "Zoey Wallace",
  "Isaac Khan",
  "Nora Barrett",
];

export default function LeaguePage() {
  const router = useRouter();
  const loadProgress = useGameStore((state) => state.loadProgress);
  const progress = useGameStore((state) => state.progress);

  useEffect(() => {
    loadProgress().catch(() => null);
  }, [loadProgress]);

  const table = useMemo(() => seedLeague(progress.weeklyLeaguePoints), [progress.weeklyLeaguePoints]);

  return (
    <main className="flex min-h-screen flex-col gap-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 pb-12 pt-6 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Weekly League</h1>
              <p className="text-sm text-white/70">
                Climb the board with XP. Top ten players earn bonus coins on Monday.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10"
              onClick={() => router.push("/play")}
            >
              Back to map
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span>
              Your XP this week:{" "}
              <strong className="text-white">{progress.weeklyLeaguePoints}</strong>
            </span>
            <span>
              Hearts refill daily at midnight • Season resets Monday 00:00 local time
            </span>
          </div>
        </header>

        <LeagueTable
          entries={table.entries}
          highlightId={table.highlightId}
        />

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/90 backdrop-blur">
          <h2 className="text-xl font-semibold">Rewards</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Top 3 players: 200 coins + streak freeze</li>
            <li>Top 10 players: 100 coins</li>
            <li>Stay in the top 20 to avoid relegation to a lower league</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function seedLeague(playerXp: number): { entries: LeagueEntry[]; highlightId?: string } {
  const entries: LeagueEntry[] = DUMMY_NAMES.map((name, index) => {
    const xpBase = 1200 - index * 30 + Math.round(Math.random() * 40);
    const xp = Math.max(200, xpBase);
    const changeRoll = Math.random();
    const change: LeagueEntry["change"] =
      changeRoll > 0.7 ? "up" : changeRoll < 0.3 ? "down" : "stay";
    return {
      id: `dummy-${index}`,
      name,
      avatarColor: randomPalette(index),
      xp,
      rank: index + 1,
      change,
    };
  });

  entries.push({
    id: "you",
    name: "You",
    avatarColor: "#facc15",
    xp: playerXp,
    rank: clampRank(playerXp),
    change: "stay",
  });

  const sorted = entries
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return { entries: sorted, highlightId: "you" };
}

const palette = [
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#8b5cf6",
  "#facc15",
];

function randomPalette(index: number) {
  return palette[index % palette.length];
}

function clampRank(xp: number) {
  if (xp > 1100) return 3;
  if (xp > 900) return 6;
  if (xp > 700) return 12;
  if (xp > 500) return 18;
  return 26;
}
