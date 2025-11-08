# Learn Soccer – Gamified Skill Journey

A playful learning loop for footballers that mixes Candy Crush map progression with Duolingo’s streaks, hearts, and booster economy. Everything runs client-side today with mock APIs and local storage persistence so you can iterate on flows before wiring a backend.

## Highlights

- **World Map (`/play`)** – Six themed worlds with 20 levels each, gates at 20/40/60/80/100, keyboard panning, and accessible level buttons (`aria-label="Level 12, 2 stars, tap to start"`). Sticky HUD shows hearts, streak, XP, coins, and daily quests.
- **Session Engine (`/session/[id]`)** – Three-card rounds pull from skill tags, track quiz answers + self-reported effort, calculate score ➜ stars, XP, coins, and streak updates. Animated celebration on finish.
- **Practice Loop** – SM-2 inspired scheduler prioritises weakest skills and feeds the “Practice” button. Practice halves rewards, never consumes hearts, and protects streaks.
- **Economy + Shop (`/shop`)** – Earn stars/XP/coins, open gates, and buy boosters (Star Doubler, Gate Key, Streak Freeze, Extra Heart). Inventory syncs via local storage before falling back to `/api/progress` mock route.
- **League (`/league`)** – 30-player mock ladder seeded with flavour data, weekly resets, and promotion rewards.

## Quick Start

```bash
pnpm install       # install dependencies
pnpm dev           # run Next.js dev server on http://localhost:3000
pnpm test          # run vitest unit suite
pnpm build && pnpm start  # production build preview
```

> The mock database lives entirely in memory (`lib/game/mock-db.ts`). No Supabase or external services are required to explore the new flows.

## Project Map

```
app/
  play/page.tsx            # primary map hub + session preview drawer
  session/[id]/page.tsx    # session HUD, rounds, result celebration
  league/page.tsx          # weekly leaderboard mock
  shop/page.tsx            # booster storefront
  api/
    seed/route.ts          # generates level data (120 nodes)
    progress/route.ts      # GET/POST mock persistence
components/game/
  Hud.tsx, Hearts.tsx, XPBar.tsx, StreakFlame.tsx
  PathCanvas.tsx, LevelNode.tsx, GateNode.tsx
  SessionPreview.tsx, RoundCard.tsx, ResultCelebration.tsx
  LeagueTable.tsx, ShopGrid.tsx, BoosterPill.tsx
lib/game/
  types.ts                 # Skill, Level, Progress, SessionResult, constants
  seed.ts                  # 6 worlds, gates, neighbours, friendly titles
  progress.ts              # initial state, hydration, date helpers
  scheduler.ts             # SM-2 inspired spaced repetition helpers
  session.ts               # round generation + reward model
  store.ts                 # Zustand store (progress, boosters, gate logic)
  quests.ts                # rotating daily quest metadata
  mock-db.ts               # in-memory persistence for route handlers
public/media/              # lightweight SVG illustrations per skill
```

## Core Data Model

```ts
type Level = {
  id: string;
  world: 1 | 2 | 3 | 4 | 5 | 6;
  number: number;                // 1..120
  skills: Skill[];               // tags drive round content
  thresholds: { one: number; two: number; three: number };
  neighbors: string[];           // next nodes in map
  gate?: boolean;                // gates at 20,40,60,80,100
  locked: boolean;               // calculated from progress
};

type Progress = {
  xp: number;
  coins: number;
  stars: Record<Level["id"], 0 | 1 | 2 | 3>;
  hearts: number;                // 0..5
  streakDays: number;
  streakFreezeArmed: boolean;
  gatesOpened: string[];
  inventory: { keys: number; freeze: number; doubler: number; extraHearts: number };
  dailyQuests: DailyQuestState[];   // finish sessions, earn stars, practice scanning
  weeklyLeaguePoints: number;
  lastPlayedISO: string | null;
  lastHeartsRefillISO: string | null;
};
```

All state mutators live in `lib/game/store.ts` (`earnXP`, `addStars`, `openGate`, `applyBooster`, `startSession`, `registerPerformance`, etc.). The store hydrates from `localStorage` first, then merges with `/api/progress` to simulate a future backend.

## Persistence & APIs

- **GET `/api/progress`** → returns in-memory `Progress` snapshot.
- **POST `/api/progress`** → merges client payload into mock DB (stars are maxed per level, arrays deduped).
- **GET `/api/seed`** → exposes generated level data (6 worlds × 20 nodes) for debugging or future external tooling.

`lib/game/mock-db.ts` keeps the canonical `Progress` object alive for the life of the dev server. Swap it for a real database adapter later without touching the UI.

## Testing

- `pnpm test` runs the Vitest suite. New specs cover the reward model (`lib/game/__tests__/session.test.ts`) and the spaced-repetition scheduler (`lib/game/__tests__/scheduler.test.ts`).
- For end-to-end coverage, wire up Playwright when you’re ready to drive the actual UI. Recommended scenarios:
  1. Visit `/play`, start Level 1, finish with ≥ 2 stars, confirm HUD updates hearts/stars/coins.
  2. Unlock Gate 20 with stars and verify the path animates to World 2.
  3. Purchase a booster in `/shop`, equip via the session preview drawer, and confirm doubled coin rewards.

## Hooking Up a Real Backend

1. Replace `lib/game/mock-db.ts` with calls into your database (Supabase, Prisma, etc.). Persist `Progress`, `SessionResult`, and quest history per user.
2. Promote `/api/progress` to read/write authenticated user data. Keep the client store API identical to avoid UI changes.
3. Sync `SessionResult` to analytics or match history endpoints.
4. Pipe league standings into `/app/league/page.tsx` from a real leaderboard service and mark the logged-in user.
5. Expand `seed.ts` with CMS-driven levels once real media and drills are ready.

## Next Steps & Ideas

- Add richer round types (video replay, quick reflex taps) by expanding `SessionRound` payloads.
- Animate star counters flying into the HUD (`framer-motion` hooks are stubbed and ready).
- Swap the mock leaderboard with live Supabase data and weekly reset jobs.
- Build a Playwright smoke test harness while hooking up CI to run `pnpm test` + e2e checks.

This repo now centres on the Learn Soccer experience; legacy dashboards and drills remain in `legacy/` should you need reference patterns from the previous product. Have fun leveling up the map! 
