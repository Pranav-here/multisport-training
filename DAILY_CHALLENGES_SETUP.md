# Daily Challenges - Production Setup Guide

This document outlines the production-ready Daily Challenge system with complete setup instructions, features, and integration points.

## 🚀 Features Implemented

### ✅ **Phase 1: Core Infrastructure** (COMPLETED)

#### 1. **Enhanced Dashboard Card**
- **Current Streak Display**: Shows user's active challenge streak with 🔥 icon
- **Remind Me Later**: Bell icon button to snooze challenge reminder for 2 hours
- **Hyperlinks**: "View details" link to full challenge page
- **Better UI**: Improved spacing, badges, and visual hierarchy
- **Empty States**: Skeleton loading states while challenge loads

**Location**: `components/daily-challenge-card.tsx`

#### 2. **Challenge Detail Page**
Full-featured detail page with:
- **Crystal-clear rules**: Step-by-step instructions with numbered list
- **Submission requirements**: Video length, format, quality, authenticity guidelines
- **Anti-cheat policy**: Warning about duplicate/AI-generated content
- **Scoring rubric**: Visual breakdown of scoring criteria with progress bars
  - Technical Execution (40%)
  - Consistency (30%)
  - Difficulty (20%)
  - Presentation (10%)
- **Bonus points system**: Explained in detail
- **Action buttons**: Submit challenge, View leaderboard

**Location**: `app/challenge/[id]/page.tsx`
**Route**: `/challenge/{challenge-id}`

#### 3. **Production Database Schema**
Complete PostgreSQL/Supabase schema with:

##### Tables Created:
- **`challenges`**: Stores published daily challenges
  - AI-generated or manual challenges
  - Sport, difficulty, points, instructions
  - Timezone-aware deadlines
  - Experiment flags for A/B testing

- **`challenge_submissions`**: Tracks all user submissions
  - Video URL, thumbnail, clip reference
  - Status tracking: pending → submitted → verifying → verified → scored
  - Anti-cheat token verification
  - Score breakdown and bonus points
  - Multiple attempts per challenge

- **`challenge_streaks`**: User streak tracking
  - Current streak, longest streak
  - Grace period & makeup tokens
  - Multi-sport statistics
  - Total points earned

- **`challenge_leaderboards`**: Pre-computed rankings
  - Global, school, friends, local filters
  - Fast query performance

- **`challenge_badges`**: Achievement definitions
  - Streak badges (7-day, 30-day, 100-day)
  - Multi-sport variety badges
  - Perfect score badges
  - Special event badges

- **`user_challenge_badges`**: User badge awards

- **`challenge_reminders`**: Notification scheduling

**Location**: `database-migrations/001_daily_challenges.sql`

##### Key Features:
- **Row-Level Security (RLS)**: Secure data access
- **Triggers**: Auto-update participant counts, streaks
- **Indexes**: Optimized for fast queries
- **Constraints**: Data integrity validation

#### 4. **Analytics Tracking**
Comprehensive event tracking for:

**Implemented Events**:
- ✅ `challenge_viewed`: When user sees challenge
- ✅ `challenge_joined`: When user clicks "Join Challenge"
- ✅ `challenge_attempt_started`: Recording/upload initiated
- ✅ `challenge_submitted`: Video uploaded
- ✅ `challenge_verified`: Submission passed checks
- ✅ `challenge_scored`: Final score calculated
- ✅ `badge_earned`: Achievement unlocked
- ✅ `streak_incremented`: Streak continues
- ✅ `streak_broken`: Streak ends
- ✅ `reminder_set`: User sets notification
- ✅ `leaderboard_viewed`: User checks rankings
- ✅ `challenge_funnel`: Conversion tracking
- ✅ `challenge_missed`: Expired without completion

**Location**: `lib/analytics.ts`

**Integration Points**:
- Dashboard card view tracking
- Join button click tracking
- Reminder button tracking
- Ready for: Mixpanel, Amplitude, PostHog, Google Analytics

---

## 📋 Setup Instructions

### 1. **Database Setup**

#### Option A: Supabase (Recommended)
```bash
# Navigate to Supabase dashboard
# Go to SQL Editor
# Copy and paste: database-migrations/001_daily_challenges.sql
# Click "Run"
```

#### Option B: Local PostgreSQL
```bash
psql -U your_username -d your_database -f database-migrations/001_daily_challenges.sql
```

**Verification**:
```sql
-- Check tables created
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'challenge%';

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'challenge%';

-- Check seed badges
SELECT * FROM challenge_badges;
```

### 2. **Environment Variables**

Already configured:
```env
# .env.local
GROQ_API_KEY=your_groq_key_here  # ✅ Already set
GROQ_DAILY_CHALLENGE_MODEL=llama-3.3-70b-versatile  # Optional, defaults to this
```

**Optional** (for future features):
```env
# Notifications (choose one)
SENDGRID_API_KEY=your_sendgrid_key
# OR
FIREBASE_ADMIN_SDK=path_to_firebase_admin_sdk.json
# OR
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY=your_access_key
AWS_SES_SECRET_KEY=your_secret_key

# Analytics (choose one or multiple)
NEXT_PUBLIC_MIXPANEL_TOKEN=your_mixpanel_token
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ML Verification (optional)
ML_VERIFICATION_API_KEY=your_ml_api_key
ML_VERIFICATION_ENDPOINT=https://api.your-ml-service.com
```

### 3. **Groq API Setup** ✅

**Status**: Already configured and working!

The system uses Groq API for AI-powered challenge generation:
- Model: `llama-3.3-70b-versatile`
- Temperature: 0.6 (balanced creativity)
- Seed-based deterministic generation (same challenge per user/day)
- Automatic fallback to local challenges if API fails

**Daily Challenge Lifecycle**:
1. User opens dashboard
2. System checks session storage for cached challenge
3. If not cached or expired, calls `/api/daily-challenge?tz={timezone}`
4. API route calls Groq with user's sports and today's date
5. Validates response, assigns points based on difficulty
6. Returns personalized challenge with countdown timer

### 4. **Analytics Integration**

#### To connect your analytics provider:

**Edit** `lib/analytics.ts`:

```typescript
// Example: Mixpanel
import mixpanel from 'mixpanel-browser'

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)

export const track = (event: string, payload: AnalyticsPayload = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[analytics] ${event}`, payload)
  }

  // Send to Mixpanel
  mixpanel.track(event, payload)
}
```

**Example: PostHog**
```typescript
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com'
})

export const track = (event: string, payload: AnalyticsPayload = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[analytics] ${event}`, payload)
  }

  posthog.capture(event, payload)
}
```

**Example: Google Analytics 4**
```typescript
import ReactGA from 'react-ga4'

ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID)

export const track = (event: string, payload: AnalyticsPayload = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`[analytics] ${event}`, payload)
  }

  ReactGA.event({
    category: payload.category as string,
    action: event,
    ...payload
  })
}
```

---

## 🎯 Current Workflow (What Works Now)

### **User Journey**:

1. **Dashboard Load**
   - ✅ User sees Daily Challenge card
   - ✅ Challenge generated via Groq AI based on their sports
   - ✅ Shows: title, description, sport, difficulty, points, participants, countdown
   - ✅ Displays current streak (if any)
   - ✅ Analytics: `challenge_viewed` event fired

2. **Challenge Interaction**
   - ✅ Click "View details" → Navigate to `/challenge/{id}`
   - ✅ Click "Join Challenge" → Opens join dialog → Redirects to upload
   - ✅ Analytics: `challenge_joined` event fired
   - ✅ Click "Remind me later" → Sets 2-hour reminder in session storage
   - ✅ Analytics: `reminder_set` event fired

3. **Challenge Detail Page**
   - ✅ View full instructions
   - ✅ See submission requirements
   - ✅ Review scoring rubric
   - ✅ Click "Submit Challenge" → Navigate to upload page

4. **Daily Refresh**
   - ✅ Challenge expires at midnight (user's timezone)
   - ✅ Auto-refreshes when deadline passes
   - ✅ New challenge generated for next day
   - ✅ Session storage cache prevents unnecessary API calls

---

## 🛠 Remaining Features to Implement

### **Phase 2: Submission & Verification** (NEXT)

Priority tasks from ChatGPT suggestions:

#### 1. **Submission Pipeline** ⏳
**Status**: Schema ready, needs implementation

**Required**:
- [ ] Extend upload flow to mark submission as challenge entry
- [ ] Add anti-cheat token generation (random code shown during recording)
- [ ] Client-side validations:
  - [ ] Video duration (15-60 seconds)
  - [ ] File format check (MP4, MOV, WebM)
  - [ ] File size limit (< 100MB)
- [ ] Link submission to challenge via `challenge_id`
- [ ] Track `attempt_number` for multi-submission support

**Files to modify**:
- `components/upload-clip-dialog.tsx`
- Create: `app/api/challenges/[id]/submit/route.ts`

#### 2. **Verification System** ⏳
**Status**: Schema ready, needs queue implementation

**Required**:
- [ ] Auto-verification for basic checks (format, duration, size)
- [ ] Manual review queue for flagged submissions
- [ ] Admin panel to review submissions
- [ ] ML integration (optional) for movement/skill detection
- [ ] Anti-cheat token verification

**Files to create**:
- `app/api/challenges/submissions/[id]/verify/route.ts`
- `app/api/admin/review-queue/route.ts`
- `app/admin/review-queue/page.tsx`

#### 3. **Scoring Engine** ⏳
**Status**: Rubric defined, needs implementation

**Required**:
- [ ] Calculate score based on rubric weights
- [ ] Apply bonus points logic
- [ ] Update `final_points` and `score_breakdown`
- [ ] Mark as `is_best_attempt` if highest score
- [ ] Trigger streak update via database trigger (already in schema)

**Files to create**:
- `lib/scoring/challenge-scorer.ts`
- `app/api/challenges/submissions/[id]/score/route.ts`

### **Phase 3: Streaks & Badges**

#### 4. **Streak Integration** ⏳
**Status**: Database triggers ready, needs UI

**Required**:
- [ ] Display streak on profile page
- [ ] Grace period logic (allow 1 missed day)
- [ ] Weekly makeup tokens (skip 1 day per week)
- [ ] Streak broken notification
- [ ] Streak milestone celebrations

**Files to modify**:
- `app/profile/page.tsx`
- `components/streak-widget.tsx` (already exists, extend for challenges)

#### 5. **Badge System** ⏳
**Status**: Badges seeded, needs awarding logic

**Required**:
- [ ] Check badge criteria on each submission
- [ ] Award badge via `user_challenge_badges` insert
- [ ] Badge notification/toast
- [ ] Display badges on profile
- [ ] Badge showcase in feed

**Files to create**:
- `lib/badges/badge-checker.ts`
- `app/api/badges/check/route.ts`
- `components/badge-showcase.tsx`

### **Phase 4: Leaderboards & Social**

#### 6. **Challenge Leaderboards** ⏳
**Status**: Schema ready

**Required**:
- [ ] Generate leaderboard on challenge close
- [ ] Filter by: global, school, friends, local
- [ ] Pagination for large leaderboards
- [ ] User's rank indicator
- [ ] Top 3 podium display

**Files to create**:
- `app/api/challenges/[id]/leaderboard/route.ts`
- `app/leaderboards/challenges/[id]/page.tsx`
- `components/challenge-leaderboard.tsx`

### **Phase 5: Automation & Ops**

#### 7. **Scheduled Jobs** ⏳

**Required**:
- [ ] Publish challenges at midnight per timezone
- [ ] Close expired challenges
- [ ] Compute leaderboards
- [ ] Send reminder notifications
- [ ] Clean up old reminders

**Options**:
- **Vercel Cron**: `vercel.json` config
- **Supabase Edge Functions**: Scheduled functions
- **External**: GitHub Actions, AWS Lambda

**Files to create**:
- `app/api/cron/publish-challenges/route.ts`
- `app/api/cron/close-challenges/route.ts`
- `vercel.json` (cron config)

#### 8. **Notifications** ⏳

**Required**:
- [ ] Push notifications for:
  - [ ] New challenge available
  - [ ] 2 hours left to submit
  - [ ] Streak at risk (haven't completed today)
  - [ ] Badge earned
  - [ ] Leaderboard rank achieved
- [ ] Email fallback
- [ ] In-app notifications

**Files to create**:
- `lib/notifications/push-service.ts`
- `app/api/notifications/send/route.ts`
- `components/notification-center.tsx`

---

## 📊 Analytics Dashboard Recommendations

**Key Metrics to Track**:

### Engagement Funnel
```
Challenge Viewed (100%)
  ↓ 60-70%
Challenge Joined
  ↓ 40-50%
Attempt Started
  ↓ 80-90%
Submitted
  ↓ 85-95%
Verified
```

### Retention Metrics
- **Daily Active Users (DAU)**: Users who view challenges
- **Completion Rate**: Submitted / Joined
- **Streak Retention**: % users maintaining 7+ day streak
- **Churn Indicators**: Users who break streaks

### Quality Metrics
- **Average Score by Difficulty**: Track if scoring is balanced
- **Verification Time**: p50, p95, p99 (target: <20s for auto, <24h for manual)
- **Anti-Cheat Flag Rate**: % submissions flagged

### Business Metrics
- **Points Distributed**: Track virtual economy health
- **Badge Distribution**: Ensure badges aren't too easy/hard
- **Multi-Sport Participation**: Goal: 3+ sports per user

---

## 🔐 Security & Anti-Cheat

### Implemented in Schema
1. **Anti-cheat tokens**: Random code shown during recording, verified on submission
2. **Rate limiting**: (needs implementation in API routes)
3. **Duplicate detection**: Unique constraint on `(challenge_id, user_id, attempt_number)`
4. **RLS policies**: Users can only modify their own submissions

### Recommended Additional Measures
1. **Video fingerprinting**: Hash videos to detect re-uploads
2. **EXIF metadata check**: Verify creation timestamp
3. **Anomaly detection**: Flag impossible scores/speeds
4. **Manual review queue**: Human verification for flagged content
5. **Account suspension**: For repeat offenders

---

## 🚢 Deployment Checklist

Before launching Daily Challenges to production:

### Database
- [ ] Run migration: `database-migrations/001_daily_challenges.sql`
- [ ] Verify tables created
- [ ] Verify RLS policies enabled
- [ ] Verify triggers working
- [ ] Seed challenge badges

### Environment
- [ ] Set `GROQ_API_KEY` ✅ (Already done)
- [ ] Set analytics provider keys
- [ ] Set notification service keys (optional)
- [ ] Configure ML verification endpoint (optional)

### Code
- [ ] Deploy enhanced dashboard card ✅
- [ ] Deploy challenge detail page ✅
- [ ] Deploy analytics tracking ✅
- [ ] Implement submission pipeline ⏳
- [ ] Implement verification system ⏳
- [ ] Implement scoring engine ⏳

### Testing
- [ ] Test challenge generation (works now ✅)
- [ ] Test deadline expiry and refresh
- [ ] Test timezone handling
- [ ] Test session storage caching
- [ ] Test analytics event firing
- [ ] Test "Remind me later" functionality
- [ ] Load test submission pipeline
- [ ] Security audit

### Monitoring
- [ ] Set up error tracking (Sentry, Bugsnag)
- [ ] Set up performance monitoring (Vercel Analytics)
- [ ] Set up database monitoring (Supabase dashboard)
- [ ] Create alerts for:
  - [ ] Groq API failures
  - [ ] Verification queue backup
  - [ ] Database query slowness
  - [ ] Error spike

### Documentation
- [ ] User-facing: How to complete challenges
- [ ] Admin: How to review submissions
- [ ] Dev: API documentation
- [ ] Ops: Runbook for incidents

---

## 💡 Pro Tips

### Performance Optimization
1. **Pre-generate challenges**: Run cron job at midnight to generate all challenges for the day
2. **Cache leaderboards**: Use Redis to cache top 100 for each filter
3. **CDN for videos**: Use Cloudflare/Vercel Edge for challenge thumbnails
4. **Lazy load**: Don't fetch leaderboard until user clicks "View Leaderboard"

### User Experience
1. **Progressive disclosure**: Show simple card, reveal details on click
2. **Optimistic UI**: Update streak count immediately, sync in background
3. **Offline support**: Cache challenge for offline viewing
4. **Push notifications**: Critical for daily habit formation

### Growth Hacks
1. **Share to social**: Let users share their scores to Twitter/Instagram
2. **Friend challenges**: "Challenge your friend to beat your score"
3. **Streaks as currency**: Let users spend streak days to unlock premium content
4. **Multi-challenge days**: Special events with 3-5 challenges for bonus points

---

## 🆘 Troubleshooting

### Issue: Challenge not loading
**Cause**: Groq API failure or rate limit
**Solution**: Check `.env.local` for `GROQ_API_KEY`, fallback challenge will show

### Issue: Countdown timer not refreshing
**Cause**: Timezone mismatch
**Solution**: Verify timezone passed in API call `/api/daily-challenge?tz=...`

### Issue: Analytics not firing
**Cause**: Provider not configured
**Solution**: Update `lib/analytics.ts` with your provider SDK

### Issue: Database migration fails
**Cause**: Existing tables with same name
**Solution**: Drop tables first or use `IF NOT EXISTS` (already in migration)

---

## 📞 Support & Questions

**API Keys Needed?**
Ask the user:
- [ ] Do you have SendGrid/Firebase/AWS SES for notifications?
- [ ] Do you have Mixpanel/PostHog/GA for analytics?
- [ ] Do you want ML verification? (Optional)

**Next Steps?**
Priority order:
1. ✅ Test current features (dashboard card, detail page, analytics)
2. ⏳ Implement submission pipeline
3. ⏳ Implement verification & scoring
4. ⏳ Set up cron jobs for daily publishing
5. ⏳ Add notifications

---

## 📜 License & Credits

Built with:
- Next.js 14+ App Router
- Supabase (PostgreSQL + Auth + Storage)
- Groq AI (LLaMA 3.3 70B)
- Tailwind CSS + shadcn/ui
- TypeScript

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0 (Phase 1 Complete)
