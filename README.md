# MultiSport: train smarter in every sport

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38BDF8" alt="Tailwind" />
  <img src="https://img.shields.io/badge/shadcn/ui-Components-000000" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/pnpm-10.x-4A3" alt="pnpm" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-000000" alt="Vercel" />
</p>

> A clean, mobile‑first Next.js app for multi‑sport athletes. Video‑first progress, daily challenges, local leaderboards, and coach tools in one login. Built with TypeScript, Tailwind, and shadcn/ui. All data is placeholder for now, so you can iterate fast.

## 🔗 Live preview

https://v0-multi-sport-app-build.vercel.app/

## ✨ What is in here right now

- Landing page with hero, feature grid, testimonials carousel, and “How it works” steps
- Polished micro‑interactions (hover, focus visible, motion‑safe transitions)
- Onboarding flow (4 steps)
  - Choose sports  
  - Location and affiliation
  - Skill level and goals (sport‑specific goals, “All” filter chip)
  - Privacy and content step with a **Safe recording pledge**
- Basic fake auth flow
  - `/login` (click to “log in”)
  - `AuthGuard` protects `/onboarding` and later routes
  - Session stored in `localStorage`, easy to replace later
- A11y improvements: focus rings, readable labels, helper text when Next is disabled

## 🧠 Product idea, in short

One app for multiple sports. Short clips, not long forms. Streaks, simple analytics, local leaderboards, and “one device coach mode” so a team can record attempts in sequence with a single phone.

## 🗺️ Routes

- `/` Landing
- `/login` Fake login (Google button is visual only for now)
- `/onboarding` Sports, location, goals, privacy
- `/dashboard` Placeholder route after onboarding
- `/about` Project write‑up (Who, Where, Why, What, When) ready to fill
- `/guidelines` Community standards and safety tips
- `/settings` Privacy and account placeholders

## 🧩 Tech stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS with CSS variables for sport accent colors
- shadcn/ui (Card, Button, Tabs, Badge, Checkbox, RadioGroup, Progress)
- lucide‑react icons
- Local state and a small `useAuth` hook, `useToast`, `AuthGuard`

## 🛠️ Getting started

> Requires Node 18+ and pnpm 10.x. Use Corepack to keep versions aligned with CI.

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate

pnpm install
pnpm dev
# open http://localhost:3000
```

## 📦 Useful scripts

```bash
pnpm dev        # run local dev server
pnpm build      # production build
pnpm start      # run built app
pnpm lint       # lint
```

## 🧭 Folder sketch

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

## 🧱 Design system

- Neutral base colors with light sport accents (blue, green, orange)
- Minimal shadows, rounded corners, small hover lifts
- Motion is opt‑in, respects `prefers-reduced-motion`
- Friendly tone, nothing weird, privacy first

## 🔐 Safety and privacy

- Safe recording pledge in onboarding
- Do not film minors without a parent or legal guardian’s permission
- Get consent before filming anyone, respect requests to stop
- Avoid private info in clips or captions

## 🚧 Roadmap (near term)

- “See live demo” button that fakes a session and routes to `/dashboard`
- Real Google OAuth
- One device coach session flow with roster and queue
- Local leaderboards with server data
- Drill library with clip record and attempt logging
- Simple analytics (load vs rest, accuracy trend)
- Data export and delete account flows

## 🧰 Vercel and pnpm notes

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

## 🤝 Contributing

Open a PR or drop issues. Keep copy simple, avoid hype, prefer real user value. Small PRs are better than huge ones.

## 📝 License

MIT
