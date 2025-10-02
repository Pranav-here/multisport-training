# MultiSport: train smarter in every sport

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8" alt="Tailwind" />
  <img src="https://img.shields.io/badge/shadcn/ui-Components-000000" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/pnpm-10.x-4A3" alt="pnpm" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000" alt="Vercel" />
</p>

> A clean, mobileâ€‘first Next.js app for multiâ€‘sport athletes. Videoâ€‘first progress, daily challenges, local leaderboards, and coach tools in one login. Built with TypeScript, Tailwind, and shadcn/ui. All data is placeholder for now, so you can iterate fast.

## ðŸ”— Live preview

https://v0-multi-sport-app-build.vercel.app/

## âœ¨ What is in here right now

- Landing page with hero, feature grid, testimonials carousel, and â€œHow it worksâ€ steps
- Polished microâ€‘interactions (hover, focus visible, motionâ€‘safe transitions)
- Onboarding flow (4 steps)
  - Choose sports  
  - Location and affiliation
  - Skill level and goals (sportâ€‘specific goals, â€œAllâ€ filter chip)
  - Privacy and content step with a **Safe recording pledge**
- Basic fake auth flow
  - `/login` (click to â€œlog inâ€)
  - `AuthGuard` protects `/onboarding` and later routes
  - Session stored in `localStorage`, easy to replace later
- A11y improvements: focus rings, readable labels, helper text when Next is disabled

## ðŸ§  Product idea, in short

One app for multiple sports. Short clips, not long forms. Streaks, simple analytics, local leaderboards, and â€œone device coach modeâ€ so a team can record attempts in sequence with a single phone.

## ðŸ—ºï¸ Routes

- `/` Landing
- `/login` Fake login (Google button is visual only for now)
- `/onboarding` Sports, location, goals, privacy
- `/dashboard` Placeholder route after onboarding
- `/about` Project writeâ€‘up (Who, Where, Why, What, When) ready to fill
- `/guidelines` Community standards and safety tips
- `/settings` Privacy and account placeholders

## ðŸ§© Tech stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS with CSS variables for sport accent colors
- shadcn/ui (Card, Button, Tabs, Badge, Checkbox, RadioGroup, Progress)
- lucideâ€‘react icons
- Local state and a small `useAuth` hook, `useToast`, `AuthGuard`

## ðŸ› ï¸ Getting started

> Requires Node 18+ and pnpm 10.x. Use Corepack to keep versions aligned with CI.

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate

pnpm install
pnpm dev
# open http://localhost:3000
```

## ðŸ“¦ Useful scripts

```bash
pnpm dev        # run local dev server
pnpm build      # production build
pnpm start      # run built app
pnpm lint       # lint
```

## ðŸ§­ Folder sketch

```
app/
  (routes)/
    page.tsx              # Landing
    login/page.tsx        # auth
    onboarding/page.tsx   # Multi-step onboarding
    dashboard/page.tsx    # Post-login placeholder
    about/page.tsx
    guidelines/page.tsx
    settings/page.tsx
components/
  auth-guard.tsx
  ui/*                    # shadcn/ui components
hooks/
  use-auth.ts
  use-toast.ts
public/
  placeholder assets (avatars, icons, clips)
```

## ðŸ§± Design system

- Neutral base colors with light sport accents (blue, green, orange)
- Minimal shadows, rounded corners, small hover lifts
- Motion is optâ€‘in, respects `prefers-reduced-motion`
- Friendly tone, nothing weird, privacy first

## ðŸ” Safety and privacy

- Safe recording pledge in onboarding
- Do not film minors without a parent or legal guardianâ€™s permission
- Get consent before filming anyone, respect requests to stop
- Avoid private info in clips or captions

## ðŸš§ Roadmap (near term)

- â€œSee live demoâ€ button that fakes a session and routes to `/dashboard`
- Real Google OAuth
- One device coach session flow with roster and queue
- Local leaderboards with server data
- Drill library with clip record and attempt logging
- Simple analytics (load vs rest, accuracy trend)
- Data export and delete account flows

## ðŸ§° Vercel and pnpm notes

If Vercel fails with a frozen lockfile error, the lockfile and `package.json` are out of sync.

**Fix locally:**
```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
pnpm up vaul@^1.1.2
pnpm install
git add pnpm-lock.yaml package.json
git commit -m "chore: sync lockfile"
git push
```

## ðŸ¤ Contributing

Open a PR or drop issues. Keep copy simple, avoid hype, prefer real user value. Small PRs are better than huge ones.

## ðŸ“ License

MIT



## Backend setup

1. Install project dependencies with `npm install`.
2. Start the local development server with `npm run dev`.
3. Open your Supabase project dashboard, navigate to the SQL editor, paste the contents of `schema.sql`, and run it once.
4. Sign in at `/login`, complete onboarding, and confirm that your profile appears without reload errors.
5. Test the upload flow:
   1. Call `POST /api/upload/create-url` with `{ "fileName": "clip.mp4", "contentType": "video/mp4", "fileSize": 10485760 }`.
   2. PUT the file bytes to the signed URL you received.
   3. Call `POST /api/clips` with the storage path from step 2 plus metadata (sport slug, caption, visibility).

1. Install project dependencies with `npm install`.
2. Start the local development server with `npm run dev`.
3. Open your Supabase project dashboard, go to the SQL editor, paste the contents of `schema.sql`, and run the script once.
4. Visit `/login`, authenticate with Google or a magic link, and complete onboarding to create your profile data.
5. To test uploads: (a) call `POST /api/upload/create-url` with a JSON body like `{ "fileName": "clip.mp4", "contentType": "video/mp4", "fileSize": 10485760 }`, (b) use the returned signed URL to PUT your file bytes, (c) call `POST /api/clips` with the storage path from step b to register the clip.

