# AthletIQs

AthletIQs is a multi-sport training platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. The app helps athletes and coaches plan sessions, capture short-form video progress, and track streaks across multiple sports from a single dashboard.

## Live preview

- Demo: [https://v0-multi-sport-app-build.vercel.app/](https://athletiqs.vercel.app/)

## Current experience

- Landing page with hero, feature grid, testimonial carousel, and a "How it works" journey.
- Authenticated surfaces protected by Supabase session-aware middleware (onboarding, dashboard, profile settings, guidelines, about).
- Four-step onboarding flow that captures sport mix, affiliations, skill level, goal focus, and privacy preferences, including a Safe Recording pledge.
- Dashboard that blends mock feed data with locally cached uploads, daily challenges, streak insights, leaderboards, and daily hashtag prompts.
- Upload workflow that generates Supabase Storage signed URLs, tracks progress locally, and surfaces new clips immediately.
- Quick post dialog is streamlined for fast mood-tagged updates without auto-inserted hashtags.
- Daily challenge generator that calls Groq (when configured) and reliably falls back to American sport skill work.
- Friend activity stream spotlights trending pro highlights with reaction counts and timestamps.
- Personal messages are on the roadmap, and the dashboard now includes a placeholder action that previews the upcoming DM experience.
- Accessibility-first UI: focus-visible states, motion-safe transitions, semantic landmarks, and keyboard-friendly dialogs.

## Architecture snapshot

- **Frontend:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS (sport accent tokens), shadcn/ui primitives, lucide-react icon set.
- **State and hooks:** Custom hooks for Supabase auth (`useAuth`), toast notifications, challenge caching, and countdown timers.
- **Auth and access control:** Middleware-enforced route protection with onboarding gating (`middleware.ts`), plus an `AuthGuard` component for client-only views.
- **Data and APIs:** REST endpoints under `app/api/*` cover clip CRUD, leaderboards, daily challenges, streak tracking, uploads, and Supabase auth callbacks. Domain models live in `types/database.ts`.
- **Storage:** Supabase Storage-backed clip uploads with local caching helpers (`lib/storage/local`) so newly posted content appears before remote indexing.
- **Analytics and mock data:** Rich sample datasets in `lib/mock-data.ts`, `analytics-data.ts`, and `leaderboard-data.ts` power UI prototypes ahead of real data connections.
- **AI integrations (optional):** Daily challenge endpoint can call Groq when `GROQ_API_KEY` is defined; legacy OpenAI chat prototype is documented in `AI_INTEGRATION.md`.

## Local development

### Requirements

- Node.js 18+
- pnpm 10+ (use Corepack to pin versions)
- Supabase project (required for full auth/upload flows)

### Install

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
