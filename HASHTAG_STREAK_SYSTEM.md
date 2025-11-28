# Hashtag & Streak System - Production Guide

## Overview

This system implements a comprehensive daily hashtag challenge and per-sport streak tracking feature with the following capabilities:

- **Daily Hashtags**: Server-managed rotating hashtags with countdown timers
- **Per-Sport Streaks**: Track streaks for each sport individually plus an all-sport combo streak
- **Streak Freezes**: Earn protection to save streaks when you miss a day
- **Leaderboards**: Real-time rankings for each hashtag challenge
- **Analytics**: Track user engagement through the entire funnel
- **Challenge Detail Pages**: Rich pages showing examples, rules, and leaderboards

## Database Schema

### Core Tables

1. **`daily_hashtags`** - Server-managed hashtag rotation
   - Supports global and sport-specific hashtags
   - Automatic state transitions (draft → scheduled → active → expired)
   - Hero images, rules, and example clips
   - Timezone-aware scheduling

2. **`hashtag_completions`** - User submissions per hashtag
   - One completion per sport per day
   - Anti-spam measures (video duration, device fingerprint, frame hash)
   - Grace period support for late submissions
   - Credit status tracking (pending → credited → rejected)

3. **`sport_streaks`** - Per-sport and all-sport streak tracking
   - Current and best streak records
   - Weekly goal progress
   - 90-day activity calendar (heatmap data)
   - Automatic freeze application

4. **`streak_freezes`** - Streak protection mechanics
   - Earned after 7-day streaks
   - Auto-apply by default
   - Expires after 30 days
   - Can be purchased with coins

5. **`hashtag_leaderboards`** - Pre-computed rankings
   - Multiple scopes: global, school, city, friends
   - Ranked by completion time
   - Tracks sports completed

6. **`hashtag_analytics`** - Event tracking
   - Funnel analysis (viewed → opened → uploaded → credited)
   - Session and device tracking
   - Flexible metadata storage

## API Endpoints

### Hashtag Endpoints

- `GET /api/hashtag/current` - Get current active hashtag with user progress
- `GET /api/hashtag/upcoming?limit=7` - Get upcoming scheduled hashtags
- `GET /api/hashtag/[id]` - Get hashtag details, examples, and leaderboard
- `POST /api/hashtag/[id]/complete` - Submit a completion (to be implemented)

### Streak Endpoints

- `GET /api/streaks` - Get all user streaks (all-sport + per-sport) and freezes

### Admin Endpoints

- `POST /api/seed-hashtags?action=seed` - Seed next 7 days of hashtags
- `POST /api/seed-hashtags?action=transition` - Transition hashtag states
- `POST /api/seed-hashtags?action=both` - Both seed and transition

## React Components

### Core Components

1. **`HashtagCard`** (`components/hashtag-card.tsx`)
   - Displays current hashtag with countdown timer
   - Shows user progress across sports
   - Links to challenge detail page
   - Upload CTA button

2. **`EnhancedStreakWidget`** (`components/enhanced-streak-widget.tsx`)
   - Streak stats (current, best, total days)
   - Weekly goal progress bar
   - 12-week activity heatmap calendar
   - Freeze indicators and next freeze progress
   - Sport-specific or all-sport views

3. **`HashtagDetailPage`** (`app/hashtag/[id]/page.tsx`)
   - Full challenge page with hero image
   - Example clips from other users
   - Real-time leaderboard
   - User progress tracking
   - Upload functionality

### Custom Hooks

1. **`useCurrentHashtag(session)`** - Fetch current hashtag with user progress
2. **`useStreaks(session)`** - Fetch all user streaks and freezes

## Setup Instructions

### 1. Run Database Migrations

```bash
# Apply the migrations in order
psql -U your_username -d your_database -f database-migrations/001_daily_challenges.sql
psql -U your_username -d your_database -f database-migrations/002_hashtags_and_streaks.sql
```

Or use Supabase CLI:

```bash
supabase db push
```

### 2. Seed Initial Hashtags

Call the seed endpoint to populate the next 7 days:

```bash
curl -X POST 'http://localhost:3000/api/seed-hashtags?action=both' \
  -H 'Cookie: your-session-cookie'
```

Or use the UI (create a button in admin panel):

```typescript
await fetch('/api/seed-hashtags?action=both', {
  method: 'POST',
  credentials: 'include'
})
```

### 3. Set Up Cron Job (Optional)

For automatic hashtag management, set up a daily cron job:

**Vercel Cron** (`vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/seed-hashtags?action=both",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Or Supabase Edge Function**:

```typescript
Deno.cron("transition-hashtags", "0 * * * *", async () => {
  await transitionHashtagStates(supabase)
})
```

### 4. Update Dashboard

Replace the simple hashtag badge with the new card:

```typescript
import { HashtagCard } from '@/components/hashtag-card'
import { useCurrentHashtag } from '@/hooks/use-current-hashtag'

function Dashboard() {
  const { session } = useAuth()
  const { hashtag, loading } = useCurrentHashtag(session)

  return (
    <div>
      {hashtag && (
        <HashtagCard
          hashtag={hashtag}
          userProgress={hashtag.userProgress}
          onUploadClick={() => setIsUploadOpen(true)}
        />
      )}
    </div>
  )
}
```

Replace StreakWidget with EnhancedStreakWidget:

```typescript
import { EnhancedStreakWidget } from '@/components/enhanced-streak-widget'
import { useStreaks } from '@/hooks/use-streaks'

function Dashboard() {
  const { session } = useAuth()
  const { allSportStreak, freezes, loading } = useStreaks(session)

  return (
    <div>
      {allSportStreak && (
        <EnhancedStreakWidget
          streakData={allSportStreak}
          freezes={freezes}
          onViewDetails={() => router.push('/stats')}
        />
      )}
    </div>
  )
}
```

## Features Implemented

### ✅ Complete

- [x] Database schema for hashtags, streaks, completions, freezes
- [x] API endpoints for hashtag and streak data
- [x] HashtagCard component with countdown timer
- [x] EnhancedStreakWidget with heatmap calendar
- [x] Challenge detail page with examples and leaderboard
- [x] Custom hooks for data fetching
- [x] Automatic streak freeze application
- [x] Per-sport and all-sport streak tracking
- [x] Hashtag state management (draft → scheduled → active → expired)
- [x] Seed script for initial hashtags

### 🚧 To Be Implemented

- [ ] Hashtag completion submission endpoint
- [ ] Video validation (duration, timestamp, anti-spam)
- [ ] Share card generator
- [ ] Analytics event tracking client-side
- [ ] Reminder system (push, email, in-app)
- [ ] Freeze purchase with coins
- [ ] Moderation tools for clips
- [ ] Badge awarding system integration

## Analytics Events

Track these events for funnel analysis:

```typescript
// Event types
type HashtagEvent =
  | 'hashtag_viewed'       // User views hashtag on dashboard
  | 'challenge_opened'     // User clicks to detail page
  | 'upload_started'       // User opens upload dialog
  | 'upload_succeeded'     // Upload completes
  | 'submission_credited'  // Submission approved
  | 'streak_incremented'   // Streak increases
  | 'freeze_used'          // Freeze automatically applied
  | 'leaderboard_viewed'   // User views leaderboard
  | 'share_clicked'        // User shares challenge
  | 'example_viewed'       // User plays example clip

// Usage
await fetch('/api/analytics/hashtag', {
  method: 'POST',
  body: JSON.stringify({
    event_type: 'hashtag_viewed',
    hashtag_id: hashtag.id,
    metadata: { source: 'dashboard' }
  })
})
```

## Streak Freeze Mechanics

### How Freezes Work

1. **Earning**: Complete a 7-day streak to earn one freeze
2. **Auto-apply**: When you miss a day, an available freeze is automatically used
3. **Limit**: One freeze per 30 days per sport/all-sport combo
4. **Expiration**: Freezes expire if not used within 30 days
5. **Purchase**: (To be implemented) Buy freezes with coins

### Example Flow

```
Day 1-7: User completes daily challenges → Earns 1 freeze
Day 8: User continues → Current streak: 8 days
Day 9: User misses → Freeze auto-applies → Current streak: 9 days (saved!)
Day 10: User continues → Current streak: 10 days
Day 11: User misses → No freeze available → Current streak: 1 day (reset)
```

## Production Considerations

### Anti-Abuse Measures

1. **Device fingerprinting**: Prevent multi-device spam
2. **Video frame hashing**: Detect duplicate uploads
3. **Rate limiting**: Limit submissions per user per day
4. **Minimum duration**: Enforce 10-second minimum
5. **Timestamp validation**: Ensure video was recorded within 24-hour window

### Performance Optimizations

1. **Pre-computed leaderboards**: Updated on submission credit
2. **Cached current hashtag**: Redis/Vercel KV for fast access
3. **Indexed queries**: All lookups use database indexes
4. **Lazy-load examples**: Load clips on demand
5. **Activity calendar**: Limited to 90 days to reduce payload

### Monitoring

Set up alerts for:

- Hashtag transitions failing
- Spike in rejected submissions
- Freeze usage anomalies
- API endpoint errors
- Leaderboard computation delays

## Next Steps

1. **Implement submission endpoint** with video validation
2. **Add analytics tracking** throughout the UI
3. **Build share card generator** for social sharing
4. **Create admin panel** for hashtag management
5. **Set up reminder system** for engagement
6. **Add badge integration** for milestone rewards
7. **Build moderation tools** for content review

## Support

For questions or issues with this system, contact the development team or refer to:

- Database schema: `database-migrations/002_hashtags_and_streaks.sql`
- API documentation: Inline comments in route files
- Component props: TypeScript interfaces in component files
