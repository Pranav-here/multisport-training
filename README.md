# AthletIQs

AthletIQs is a multi-sport training platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. The app helps athletes and coaches plan sessions, capture short-form video progress, and track streaks across multiple sports from a single dashboard.

## Live preview

- Demo: [https://v0-multi-sport-app-build.vercel.app/](https://athletiqs.vercel.app/)

## What's new

- **Dual-mode navigation** - Global `AppModeProvider` (`contexts/app-mode-context.tsx`) and the header `ModeToggle` let athletes jump between Training and Discovery without losing page context. The dashboard respects the selected mode and redirects appropriately.
- **Discovery surfaces** - `/discovery` now delivers a TikTok-style vertical video feed (`components/discovery-feed.tsx`) with sport/sort filters, back-to-dashboard controls, scout actions, and mock data from `lib/discovery`.
- **Discovery-aware uploads & privacy** - The upload dialog, `ContentTagSelector`, `PostDestinationSelector`, and the Discovery tab inside `app/settings/page.tsx` let athletes pick destinations, add wholesome tags, and opt into Discovery with parental consent flow.
- **Scout + Admin tooling** - `/scout/bookmarks` ships a CRM-like view for bookmarked athletes, while `/admin/moderation` provides a full moderation queue with approvals, statistics, and guidelines.
- **Hashtag & streak platform** - New migrations (`database-migrations/002_hashtags_and_streaks.sql`), API routes under `app/api/hashtag/*`, enhanced dashboard cards, `app/hashtag/[id]/page.tsx`, and `components/share-card-generator.tsx` cover daily challenges end-to-end.
- **Challenge arena polish** - The challenge-entry flow documented in `UI_IMPROVEMENTS_SUMMARY.md` adds dynamic point badges, a no-sports empty state, podium-style leaderboards, and a client-only `/challenge-arena` experience.

## Current experience

- Landing page with hero, feature grid, testimonial carousel, and a "How it works" journey.
- Authenticated surfaces protected by Supabase session-aware middleware (onboarding, dashboard, profile settings, guidelines, about).
- Four-step onboarding flow that captures sport mix, affiliations, skill level, goal focus, and privacy preferences, including a Safe Recording pledge.
- Training dashboard that blends mock feed data with cached uploads, enhanced hashtag cards, streak heatmaps, challenge callouts, leaderboards, and personal reminders.
- Header-level mode toggle plus global context keep Training and Discovery states in sync and redirect users to the correct surface when modes change.
- `/discovery` delivers a vertical video feed with sport/sort filters, scout actions (bookmark, contact, share), and a quick path back to the dashboard.
- Upload workflow now includes destination selection (training, discovery, or both), tag recommendations, and auto-suggestion logic when wholesome tags are chosen.
- Settings > Discovery adds opt-in controls, parental consent requirements, and Discovery activity summaries.
- `/scout/bookmarks` offers a CRM-style board for saved athletes, search, lists, notes, and CSV exports, while `/admin/moderation` provides queue management with approve/reject flows.
- Challenge arena, leaderboard, and empty-state experiences received major UI polish (dynamic point badges, podium views, no-sports glass card) without adding API dependencies.
- Friend activity stream spotlights trending pro highlights with reaction counts and timestamps, and the dashboard still includes a DM preview action while messaging is on the roadmap.
- Accessibility-first UI: focus-visible states, motion-safe transitions, semantic landmarks, and keyboard-friendly dialogs.

## Architecture snapshot

- **Frontend:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS (sport accent tokens), shadcn/ui primitives, lucide-react icon set.
- **State and hooks:** Custom hooks for Supabase auth (`useAuth`), toast notifications, challenge caching, countdown timers, and the global `useAppMode()` context for training/discovery state.
- **Dual-mode infrastructure:** `contexts/app-mode-context.tsx`, `components/mode-toggle.tsx`, and `app/layout.tsx` wire up persistence, UI, and redirect helpers for mode-aware navigation.
- **Discovery modules:** `lib/discovery/*` houses type systems, constants, mock data, and moderation queue types feeding `components/discovery-feed.tsx`, `components/content-tag-selector.tsx`, `components/post-destination-selector.tsx`, and `components/discovery-settings-card.tsx`.
- **Hashtag & streak stack:** `database-migrations/002_hashtags_and_streaks.sql`, `app/api/hashtag/*`, `hooks/use-current-hashtag.ts`, `hooks/use-streaks.ts`, `components/enhanced-streak-widget.tsx`, `components/share-card-generator.tsx`, and `app/hashtag/[id]/page.tsx` cover the entire funnel.
- **Scout/Admin surfaces:** `/scout/bookmarks` and `/admin/moderation` are first-class pages with list management, stats, and approval tooling ready for real data sources.
- **Auth and access control:** Middleware-enforced route protection with onboarding gating (`middleware.ts`), plus an `AuthGuard` component for client-only views.
- **Data and APIs:** REST endpoints under `app/api/*` cover clip CRUD, leaderboards, daily challenges, streak tracking, uploads, and Supabase auth callbacks. Domain models live in `types/database.ts`.
- **Storage:** Supabase Storage-backed clip uploads with local caching helpers (`lib/storage/local`) so newly posted content appears before remote indexing.
- **Analytics and mock data:** Rich sample datasets in `lib/mock-data.ts`, `analytics-data.ts`, and `leaderboard-data.ts` power UI prototypes ahead of real data connections.
- **AI integrations (optional):** Daily challenge endpoint can call Groq when `GROQ_API_KEY` is defined; legacy OpenAI chat prototype is documented in `AI_INTEGRATION.md`.

## Dual-mode & discovery surfaces

- `DUAL_MODE_IMPLEMENTATION.md` documents the full Training/Discovery vision plus the nine tasks already shipped across the codebase.
- `contexts/app-mode-context.tsx` persists the selected mode, while `components/mode-toggle.tsx` sits in `components/header.tsx` so every screen can switch contexts.
- `app/dashboard/page.tsx` respects the current mode and can redirect to `/discovery` when the user toggles into scout mode.
- `app/discovery/page.tsx` wraps `components/discovery-feed.tsx` with sport and sort filters, keyboard and swipe navigation, scout actions (bookmark, contact, share), and a hero-level surface that feels like TikTok when populated with `lib/discovery/mock-data.ts`.
- Upload flows (`components/upload-clip-dialog.tsx`) now embed `components/post-destination-selector.tsx` and `components/content-tag-selector.tsx`, enabling Training-only, Discovery-only, or dual posting plus wholesome content tagging.
- Privacy lives under Settings > Discovery via `components/discovery-settings-card.tsx`, which handles opt-in, guardian consent, and safety disclaimers.
- `/scout/bookmarks` provides list management, search, and CSV exports for scouts, and `/admin/moderation` exposes video review, queue stats, navigation, and rejection reasons for moderators.

## Hashtag & streak platform

- `IMPLEMENTATION_COMPLETE.md` walks through the production-ready hashtag and streak system, anchored by `database-migrations/002_hashtags_and_streaks.sql`.
- API routes under `app/api/hashtag/*`, `app/api/streaks`, and `app/api/analytics/hashtag` power current, upcoming, detail, completion, analytics, and admin seeding flows.
- Dashboard widgets (`components/hashtag-card.tsx`, `components/enhanced-streak-widget.tsx`) surface live countdowns, per-sport streaks, freezes, and click-throughs.
- `app/hashtag/[id]/page.tsx` ships a hero detail page with hero media, leaderboard tabs, progress tracking, and submission CTAs.
- `components/share-card-generator.tsx` offers downloadable or share-ready graphics for hashtags, streaks, and badges, while hooks like `useCurrentHashtag` and `useStreaks` manage client state.

## Daily challenge & leaderboard upgrades

- `UI_IMPROVEMENTS_SUMMARY.md` captures the no-API-needed polish pass for challenges.
- `/challenge-arena` now renders purely on the client, avoiding Supabase bundle issues and loading instantly from session storage.
- `components/daily-challenge-card.tsx` includes point-based gradients and emoji indicators, and `components/no-sports-empty-state.tsx` covers the glass-style empty case.
- `components/challenge-leaderboard.tsx` adds podium visuals, tabbed filters (Global, School, Friends), mock generators, and highlight styling for the signed-in athlete.

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

### Dual-mode app

```
app/
  dashboard/page.tsx          # training home (hashtags, streaks, feed, quick post, uploads)
  discovery/page.tsx          # TikTok-style vertical feed with filters + back CTA
  settings/page.tsx           # includes Discovery tab + privacy controls
  admin/moderation/page.tsx   # moderation queue with stats and review tools
  scout/bookmarks/page.tsx    # scout CRM for bookmarked athletes
  hashtag/[id]/page.tsx       # full hashtag challenge detail surface
  challenge-arena/page.tsx    # client-only challenge playthrough
components/
  mode-toggle.tsx             # header pill for Training vs Discovery
  discovery-feed.tsx          # vertical video stack with scout actions
  content-tag-selector.tsx    # wholesome tag picker for uploads
  post-destination-selector.tsx  # training/discovery/both radio control
  discovery-settings-card.tsx # opt-in + guardian consent UI
  hashtag-card.tsx            # dashboard card with countdown
  enhanced-streak-widget.tsx  # 12-week heatmap and freeze tracker
  share-card-generator.tsx    # exportable graphics for wins
contexts/
  app-mode-context.tsx        # global mode state + persistence
lib/discovery/
  constants.ts, types.ts, mock-data.ts
hooks/
  use-current-hashtag.ts, use-streaks.ts
```

### Game map prototype (legacy but still available)

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

> The following types power the legacy `app/play` map experience documented above.

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

> These endpoints belong to the game prototype (`app/play`, `/api/progress`, `/api/seed`) that still ships alongside the dual-mode experience.

- **GET `/api/progress`** - returns the in-memory `Progress` snapshot.
- **POST `/api/progress`** - merges client payloads into the mock DB (stars are maxed per level, arrays deduped).
- **GET `/api/seed`** - exposes generated level data (6 worlds x 20 nodes) for debugging or future external tooling.

`lib/game/mock-db.ts` keeps the canonical `Progress` object alive for the life of the dev server. Swap it for a real database adapter later without touching the UI.

## Testing

- `pnpm test` runs the Vitest suite. New specs cover the reward model (`lib/game/__tests__/session.test.ts`) and the spaced-repetition scheduler (`lib/game/__tests__/scheduler.test.ts`).
- For end-to-end coverage, wire up Playwright when you're ready to drive the actual UI. Recommended scenarios:
  1. Visit `/play`, start Level 1, finish with >= 2 stars, confirm HUD updates hearts/stars/coins.
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
- Stand up Supabase tables for Discovery clips, bookmarks, moderation, and feed queries so `/discovery`, `/scout/bookmarks`, and `/admin/moderation` work with live data.
- Promote the Discovery-aware upload flow (destination selection, tags, consent) to real APIs plus notifications so athletes and scouts receive actual updates.

This repo now centres on the Learn Soccer experience; legacy dashboards and drills remain in `legacy/` should you need reference patterns from the previous product. Have fun leveling up the map! 
