# AthletIQ

AthletIQ is a multi-sport training platform built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. The app helps athletes and coaches plan sessions, capture short-form video progress, and track streaks across multiple sports from a single dashboard.

## Live preview

- Demo: https://v0-multi-sport-app-build.vercel.app/

## Current experience

- Landing page with hero, feature grid, testimonial carousel, and a "How it works" journey.
- Authenticated surfaces protected by Supabase session-aware middleware (onboarding, dashboard, profile settings, guidelines, about).
- Four-step onboarding flow that captures sport mix, affiliations, skill level, goal focus, and privacy preferences, including a Safe Recording pledge.
- Dashboard that blends mock feed data with locally cached uploads, daily challenges, streak insights, leaderboards, and daily hashtag prompts.
- Upload workflow that generates Supabase Storage signed URLs, tracks progress locally, and surfaces new clips immediately.
- Daily challenge generator that calls Groq (when configured) and gracefully falls back to curated challenges per sport.
- Accessibility-first UI: focus-visible states, motion-safe transitions, semantic landmarks, and keyboard-friendly dialogs.

## Architecture snapshot

- **Frontend:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS (sport accent tokens), shadcn/ui primitives, lucide-react icon set.
- **State and hooks:** Custom hooks for Supabase auth (`useAuth`), toast notifications, challenge caching, and countdown timers.
- **Auth and access control:** Middleware-enforced route protection with onboarding gating (`middleware.ts`), plus an `AuthGuard` component for client-only views.
- **Data and APIs:** REST endpoints under `app/api/*` cover clip CRUD, leaderboards, daily challenges, streak tracking, uploads, and Supabase auth callbacks. Domain models live in `types/database.ts`.
- **Storage:** Supabase Storage-backed clip uploads with local caching helpers (`lib/storage/local`) so newly posted content appears before remote indexing.
- **Analytics and mock data:** Rich placeholder datasets in `lib/mock-data.ts`, `analytics-data.ts`, and `leaderboard-data.ts` power UI prototypes ahead of real data connections.
- **AI integrations (optional):** Daily challenge endpoint can call Groq when `GROQ_API_KEY` is defined; legacy OpenAI chat prototype is documented in `AI_INTEGRATION.md`.

## Local development

### Requirements

- Node.js 18+
- pnpm 10+ (use Corepack to pin versions)
- Supabase project (required for full auth/upload flows)

### Install

```bash
corepack enable
corepack prepare pnpm@10 --activate
pnpm install
```

Create `.env.local` in the repository root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
RESEND_API_KEY=optional-resend-api-key
OPENAI_API_KEY=optional-openai-key
GROQ_API_KEY=optional-groq-key
```

> Keep the service role key server-side only. Use Vercel or your hosting provider's secret manager in production.

### Run

```bash
pnpm dev          # start Next.js dev server on http://localhost:3000
pnpm lint         # run ESLint
pnpm build        # create a production build
pnpm start        # serve the production build
```

### Supabase bootstrap

1. In Supabase, run the SQL schema (see `schema.sql`) to create required tables and policies.
2. Configure the auth site URL and redirect URLs to `http://localhost:3000` for local development.
3. Optionally run `node scripts/seed-supabase.mjs` to seed sports, drills, and leaderboard rows.
4. Sign in through `/login`, complete onboarding, and confirm `profiles`, `user_sports`, and related tables populate.

## Project layout

```
app/
  page.tsx                  # marketing landing page
  login/                    # Supabase auth bridge
  onboarding/               # multi-step onboarding wizard
  dashboard/                # authenticated athlete experience
  challenge-arena/          # challenge discovery prototype
  api/                      # REST endpoints (clips, challenges, streaks, uploads, auth)
components/
  header.tsx                # shared shell
  upload-clip-dialog.tsx    # Supabase storage upload flow
  daily-challenge-card.tsx  # challenge display module
  ui/                       # shadcn/ui primitives
hooks/
  use-auth.ts               # Supabase session sync
  use-daily-challenge.ts    # cached challenge fetch with Groq fallback
lib/
  supabase-server.ts        # server client + admin helpers
  supabase-browser.ts       # browser client
  clips.ts                  # clip DTO mappers
  mock-data.ts              # feed, leaderboard, and badge fixtures
public/
  *.png / *.webp            # placeholder athlete imagery
scripts/
  seed-supabase.mjs         # optional data seeding
types/
  database.ts               # generated Supabase typings
legacy/
  api/ / components/        # archived AI chat prototype
```

## API surface

- `GET /api/daily-challenge` - returns a per-user challenge seeded by sport and timezone.
- `POST /api/upload/create-url` - signs Supabase Storage uploads server-side.
- `GET /api/clips` - retrieves clip feed (Supabase + mock fallback).
- `POST /api/clips` - registers new clips with metadata.
- `POST /api/clips/[id]/like` - like/unlike interactions with optimistic UI support.
- `POST /api/clips/[id]/comments` - adds validated comments to clips.
- `GET /api/leaderboard` - resolves leaderboard standings for dashboard widgets.
- `POST /api/streak/increment` - records daily streak progress.
- `GET /api/auth/callback` - Supabase OAuth callback handler that persists auth cookies.

## Tooling and quality

- ESLint with `eslint-config-next` enforces code style.
- Tailwind CSS 4 with CSS variables handles sport-specific theming.
- Radix primitives (via shadcn/ui) ensure accessible dialogs, menus, and overlays.
- `lib/rate-limit.ts` provides basic API throttling utilities.
- `lib/storage/local` keeps locally generated clip metadata consistent across reloads.

## Design language

- Neutral grayscale base with blue/green/orange sport accent gradients.
- Motion defaults respect `prefers-reduced-motion`.
- Large touch targets, consistent focus rings, descriptive ARIA labels across components.
- Responsive shell via `Header`, `MobileNav`, and `SidebarWidgets`.

## Deployment notes

- Optimized for Vercel (App Router). Configure environment variables in the Vercel dashboard before deploying.
- pnpm is the package manager. Enable Corepack in CI/CD to avoid frozen-lockfile failures; regenerate by running `pnpm install && pnpm install --frozen-lockfile` when dependencies drift.
- Align Supabase auth redirect URLs with `NEXT_PUBLIC_SITE_URL`/`SITE_URL`.

## Additional references

- `AI_INTEGRATION.md` - guardrails and ideas for reintroducing AI copilots.
- `legacy/` - archived components and routes retained for reference.
- `styles/` - Tailwind globals and sport color variables.
- `middleware.ts` - single source of truth for access rules and onboarding enforcement.

## Status

incomplete asf, here are potential changes we are thinking of doing:
- Wire the dashboard feed, leaderboards, and streak widgets to live Supabase data.
- Ship production-ready OAuth providers and email magic links.
- Build the one-device coach session flow with roster queues and inline scoring.
- Expand analytics panels with deeper workload vs. recovery insights and export options.
- Add end-to-end and visual regression coverage to protect the core journeys while iterating.
