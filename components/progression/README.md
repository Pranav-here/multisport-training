# Progression Components

The components in this folder compose the touch-friendly “Soccer Progression” experience. They are written as pure client components so the Next.js App Router can colocate data fetching with the page.

## Architecture

- `WorldArcTabs` renders the world navigation using shadcn Tabs. It accepts data + callbacks and is fully keyboard accessible.
- `LevelGrid` virtualises the 120-tile grid with `@tanstack/react-virtual`. It exposes callbacks for selection, search, and filters while keeping rendering work minimal.
- `LevelDetails` shows the active level information, rewards, and actions. It renders inside a right-rail panel or a drawer on mobile.
- `ContinueCard` surfaces the next level to start and exposes the sticky action bar.
- `MomentumPanel` contains the arc progress bar and nudges that link back into the product. Replace this with live analytics by swapping the props.
- `PlannerDialog` lets athletes slot three levels into the week. It persists to the Zustand store today; replace the `saveWeeklyPlan` call with a real mutation later.
- `Skeletons` centralises shimmer placeholders the page can reuse while loading.

Shared state lives in `lib/progression/store.ts` (Zustand + persist). The store loads mock data from `lib/progression/mock.ts`. When a real API is ready, swap the mock exports with data-fetching functions and keep the store contract the same.

## Replacing the mock API

1. Connect `listLevels`, `getLevel`, `getProgress`, and `listNudges` to your backend or Supabase edge functions.
2. Add caching (SWR, React Query, etc.) and call those functions from the store actions. The components already expect async promises.
3. Swap the mock planner persistence in `saveWeeklyPlan` with a real POST call and emit `track('weekly_plan_saved', { levelIds })` once it resolves.

## Testing

Minimal Vitest suites live beside the store and page to ensure selectors stay pure and the keyboard flow keeps working. Extend those tests as you wire real data.
