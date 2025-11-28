-- Hashtag System and Enhanced Streaks Migration
-- Adds comprehensive hashtag tracking, per-sport streaks, and freeze mechanics

-- ============================================================================
-- DAILY HASHTAGS TABLE
-- Server-managed hashtag rotation with sport-specific support
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.daily_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hashtag details
  tag TEXT NOT NULL, -- e.g., "#FirstTouchFriday"
  display_name TEXT NOT NULL, -- e.g., "First Touch Friday"
  description TEXT NOT NULL,

  -- Scope
  sport_id INTEGER REFERENCES public.sports(id),
  is_global BOOLEAN NOT NULL DEFAULT true, -- Global or sport-specific

  -- Scheduling
  active_date DATE NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,

  -- Content
  hero_media_url TEXT,
  rules JSONB DEFAULT '[]'::jsonb, -- ["One completion per sport", "Min 10 seconds"]
  example_clips JSONB DEFAULT '[]'::jsonb, -- Array of clip IDs for examples

  -- Metadata
  state TEXT NOT NULL DEFAULT 'draft' CHECK (state IN ('draft', 'scheduled', 'active', 'expired', 'archived')),
  priority INTEGER NOT NULL DEFAULT 0, -- For sorting when multiple hashtags are active

  -- Publishing
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure only one global hashtag per day
  CONSTRAINT unique_global_hashtag_per_day UNIQUE NULLS NOT DISTINCT (active_date, sport_id, is_global)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hashtags_active_date ON public.daily_hashtags(active_date, state);
CREATE INDEX IF NOT EXISTS idx_hashtags_sport ON public.daily_hashtags(sport_id, active_date);
CREATE INDEX IF NOT EXISTS idx_hashtags_state ON public.daily_hashtags(state, start_at);

-- ============================================================================
-- HASHTAG COMPLETIONS TABLE
-- Track user completions per hashtag per sport (one per day per sport)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hashtag_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  hashtag_id UUID NOT NULL REFERENCES public.daily_hashtags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id INTEGER REFERENCES public.sports(id),
  clip_id TEXT REFERENCES public.clips(id) ON DELETE SET NULL,

  -- Completion tracking
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  credit_status TEXT NOT NULL DEFAULT 'pending' CHECK (credit_status IN ('pending', 'credited', 'rejected', 'under_review')),
  rejection_reason TEXT,

  -- Validation metadata
  video_duration_seconds INTEGER,
  video_timestamp TIMESTAMPTZ, -- When video was recorded
  device_fingerprint TEXT,
  anti_spam_hash TEXT, -- Hash of video frames to prevent duplicates

  -- Grace period tracking
  is_late_submission BOOLEAN DEFAULT false,
  grace_hours_used INTEGER DEFAULT 0,

  -- Timestamps
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One completion per hashtag per sport per user
  CONSTRAINT unique_completion_per_user_sport UNIQUE (hashtag_id, user_id, sport_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_completions_user ON public.hashtag_completions(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_completions_hashtag ON public.hashtag_completions(hashtag_id, credit_status);
CREATE INDEX IF NOT EXISTS idx_completions_sport ON public.hashtag_completions(sport_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_completions_leaderboard ON public.hashtag_completions(hashtag_id, sport_id, completed_at);

-- ============================================================================
-- PER-SPORT STREAKS TABLE
-- Track streaks individually per sport plus all-sport combo
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.sport_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_id INTEGER REFERENCES public.sports(id), -- NULL means "all-sport" combo streak

  -- Streak data
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,

  -- Weekly stats
  weekly_goal INTEGER NOT NULL DEFAULT 7,
  weekly_progress INTEGER NOT NULL DEFAULT 0,
  week_start_date DATE,

  -- Calendar data (stores last 90 days of activity)
  activity_calendar JSONB DEFAULT '[]'::jsonb, -- [{"date": "2025-01-01", "completed": true, "sports": ["soccer", "basketball"]}]

  -- Milestones
  total_days_active INTEGER NOT NULL DEFAULT 0,
  longest_streak_achieved_at DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One record per user per sport (or all-sport)
  CONSTRAINT unique_user_sport_streak UNIQUE (user_id, sport_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sport_streaks_user ON public.sport_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_streaks_sport ON public.sport_streaks(sport_id, current_streak DESC);

-- ============================================================================
-- STREAK FREEZES TABLE
-- Manage streak protection/freeze mechanics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.streak_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_streak_id UUID REFERENCES public.sport_streaks(id) ON DELETE CASCADE,

  -- Freeze details
  freeze_type TEXT NOT NULL CHECK (freeze_type IN ('earned', 'purchased', 'granted')),
  earned_by_streak_days INTEGER, -- e.g., earned after 7-day streak
  purchased_with_coins INTEGER,

  -- Status
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  used_on_date DATE,
  expires_at TIMESTAMPTZ,

  -- Auto-apply settings
  auto_apply BOOLEAN DEFAULT true,

  -- Timestamps
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Limit: One freeze per 30 days per sport
  CONSTRAINT one_freeze_per_month CHECK (
    (earned_at IS NULL) OR
    (NOT EXISTS (
      SELECT 1 FROM public.streak_freezes sf2
      WHERE sf2.user_id = user_id
      AND sf2.sport_streak_id = sport_streak_id
      AND sf2.earned_at > (earned_at - INTERVAL '30 days')
      AND sf2.id != id
    ))
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_freezes_user ON public.streak_freezes(user_id, status);
CREATE INDEX IF NOT EXISTS idx_freezes_streak ON public.streak_freezes(sport_streak_id, status);
CREATE INDEX IF NOT EXISTS idx_freezes_available ON public.streak_freezes(user_id, status, expires_at) WHERE status = 'available';

-- ============================================================================
-- HASHTAG LEADERBOARDS TABLE
-- Real-time leaderboard for each hashtag
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hashtag_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hashtag_id UUID NOT NULL REFERENCES public.daily_hashtags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ranking
  rank INTEGER NOT NULL,
  completion_time TIMESTAMPTZ NOT NULL, -- When they completed it
  sports_completed INTEGER NOT NULL DEFAULT 1, -- How many sports they completed for this hashtag

  -- Scope filters
  scope TEXT NOT NULL CHECK (scope IN ('global', 'school', 'city', 'friends')),
  scope_value TEXT, -- school_id, city name, etc.

  -- Metadata
  completion_id UUID REFERENCES public.hashtag_completions(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_hashtag_leaderboard_entry UNIQUE (hashtag_id, scope, scope_value, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hashtag_leaderboard ON public.hashtag_leaderboards(hashtag_id, scope, rank);
CREATE INDEX IF NOT EXISTS idx_hashtag_leaderboard_user ON public.hashtag_leaderboards(user_id, scope);

-- ============================================================================
-- HASHTAG ANALYTICS EVENTS TABLE
-- Track user interactions with hashtags for funnel analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.hashtag_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  hashtag_id UUID REFERENCES public.daily_hashtags(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'hashtag_viewed',
    'challenge_opened',
    'upload_started',
    'upload_succeeded',
    'upload_failed',
    'submission_credited',
    'streak_incremented',
    'freeze_used',
    'leaderboard_viewed',
    'share_clicked',
    'example_viewed'
  )),

  -- Context
  sport_id INTEGER REFERENCES public.sports(id),
  clip_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional event-specific data

  -- Session tracking
  session_id TEXT,
  device_type TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.hashtag_analytics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_hashtag ON public.hashtag_analytics(hashtag_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.hashtag_analytics(event_type, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.daily_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sport_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_analytics ENABLE ROW LEVEL SECURITY;

-- Daily Hashtags: Public read for active hashtags
CREATE POLICY "Active hashtags viewable by authenticated users"
  ON public.daily_hashtags FOR SELECT
  TO authenticated
  USING (state IN ('scheduled', 'active'));

-- Hashtag Completions: Users can view their own, others can see credited ones
CREATE POLICY "Users can view their own completions"
  ON public.hashtag_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others' credited completions"
  ON public.hashtag_completions FOR SELECT
  TO authenticated
  USING (credit_status = 'credited');

CREATE POLICY "Users can create their own completions"
  ON public.hashtag_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending completions"
  ON public.hashtag_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND credit_status = 'pending');

-- Sport Streaks: Users can view their own
CREATE POLICY "Users can view their own sport streaks"
  ON public.sport_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Streak Freezes: Users can view and manage their own
CREATE POLICY "Users can manage their own freezes"
  ON public.streak_freezes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Hashtag Leaderboards: Public read
CREATE POLICY "Hashtag leaderboards viewable by all"
  ON public.hashtag_leaderboards FOR SELECT
  TO authenticated
  USING (true);

-- Analytics: Users can insert their own events
CREATE POLICY "Users can log their own analytics"
  ON public.hashtag_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_hashtags_updated_at BEFORE UPDATE ON public.daily_hashtags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_completions_updated_at BEFORE UPDATE ON public.hashtag_completions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sport_streaks_updated_at BEFORE UPDATE ON public.sport_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hashtag_leaderboards_updated_at BEFORE UPDATE ON public.hashtag_leaderboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update sport streak when hashtag completion is credited
CREATE OR REPLACE FUNCTION update_sport_streak_on_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_completion_date DATE;
  v_last_activity DATE;
  v_current_streak INTEGER;
  v_sport_streak_id UUID;
BEGIN
  -- Only process when status changes to 'credited'
  IF NEW.credit_status = 'credited' AND (OLD.credit_status IS NULL OR OLD.credit_status != 'credited') THEN

    v_completion_date := NEW.completed_at::DATE;

    -- Get or create sport streak record
    INSERT INTO public.sport_streaks (user_id, sport_id, current_streak, best_streak)
    VALUES (NEW.user_id, NEW.sport_id, 0, 0)
    ON CONFLICT (user_id, sport_id) DO NOTHING;

    -- Get current streak data
    SELECT id, current_streak, last_activity_date
    INTO v_sport_streak_id, v_current_streak, v_last_activity
    FROM public.sport_streaks
    WHERE user_id = NEW.user_id AND sport_id = NEW.sport_id;

    -- Update streak logic
    IF v_last_activity IS NULL OR v_completion_date > v_last_activity THEN
      -- Check for consecutive day
      IF v_last_activity IS NULL THEN
        -- First completion
        v_current_streak := 1;
      ELSIF v_completion_date = v_last_activity + 1 THEN
        -- Consecutive day
        v_current_streak := v_current_streak + 1;
      ELSIF v_completion_date > v_last_activity + 1 THEN
        -- Check for available freeze
        DECLARE
          v_freeze_id UUID;
        BEGIN
          SELECT id INTO v_freeze_id
          FROM public.streak_freezes
          WHERE user_id = NEW.user_id
          AND sport_streak_id = v_sport_streak_id
          AND status = 'available'
          AND auto_apply = true
          AND (expires_at IS NULL OR expires_at > NOW())
          LIMIT 1;

          IF v_freeze_id IS NOT NULL THEN
            -- Use freeze to save streak
            UPDATE public.streak_freezes
            SET status = 'used', used_at = NOW(), used_on_date = v_last_activity + 1
            WHERE id = v_freeze_id;

            v_current_streak := v_current_streak + 1;
          ELSE
            -- Streak broken, reset to 1
            v_current_streak := 1;
          END IF;
        END;
      END IF;

      -- Update streak record
      UPDATE public.sport_streaks
      SET
        current_streak = v_current_streak,
        best_streak = GREATEST(best_streak, v_current_streak),
        last_activity_date = v_completion_date,
        total_days_active = total_days_active + 1,
        longest_streak_achieved_at = CASE
          WHEN v_current_streak > best_streak THEN v_completion_date
          ELSE longest_streak_achieved_at
        END,
        -- Update activity calendar (keep last 90 days)
        activity_calendar = (
          SELECT jsonb_agg(day)
          FROM (
            SELECT day
            FROM jsonb_array_elements(activity_calendar) AS day
            WHERE (day->>'date')::DATE > CURRENT_DATE - INTERVAL '90 days'
            UNION
            SELECT jsonb_build_object('date', v_completion_date, 'completed', true)
            ORDER BY (day->>'date')::DATE DESC
            LIMIT 90
          ) AS days
        )
      WHERE id = v_sport_streak_id;

      -- Award freeze after 7-day streak
      IF v_current_streak = 7 THEN
        INSERT INTO public.streak_freezes (user_id, sport_streak_id, freeze_type, earned_by_streak_days)
        VALUES (NEW.user_id, v_sport_streak_id, 'earned', 7)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;

    -- Also update all-sport streak (sport_id = NULL)
    INSERT INTO public.sport_streaks (user_id, sport_id, current_streak, best_streak)
    VALUES (NEW.user_id, NULL, 0, 0)
    ON CONFLICT (user_id, sport_id) DO NOTHING;

    -- Similar logic for all-sport streak
    SELECT id, current_streak, last_activity_date
    INTO v_sport_streak_id, v_current_streak, v_last_activity
    FROM public.sport_streaks
    WHERE user_id = NEW.user_id AND sport_id IS NULL;

    IF v_last_activity IS NULL OR v_completion_date > v_last_activity THEN
      IF v_last_activity IS NULL THEN
        v_current_streak := 1;
      ELSIF v_completion_date = v_last_activity + 1 THEN
        v_current_streak := v_current_streak + 1;
      ELSIF v_completion_date > v_last_activity + 1 THEN
        DECLARE
          v_freeze_id UUID;
        BEGIN
          SELECT id INTO v_freeze_id
          FROM public.streak_freezes
          WHERE user_id = NEW.user_id
          AND sport_streak_id = v_sport_streak_id
          AND status = 'available'
          AND auto_apply = true
          AND (expires_at IS NULL OR expires_at > NOW())
          LIMIT 1;

          IF v_freeze_id IS NOT NULL THEN
            UPDATE public.streak_freezes
            SET status = 'used', used_at = NOW(), used_on_date = v_last_activity + 1
            WHERE id = v_freeze_id;
            v_current_streak := v_current_streak + 1;
          ELSE
            v_current_streak := 1;
          END IF;
        END;
      END IF;

      UPDATE public.sport_streaks
      SET
        current_streak = v_current_streak,
        best_streak = GREATEST(best_streak, v_current_streak),
        last_activity_date = v_completion_date,
        total_days_active = total_days_active + 1,
        longest_streak_achieved_at = CASE
          WHEN v_current_streak > best_streak THEN v_completion_date
          ELSE longest_streak_achieved_at
        END
      WHERE id = v_sport_streak_id;

      IF v_current_streak = 7 THEN
        INSERT INTO public.streak_freezes (user_id, sport_streak_id, freeze_type, earned_by_streak_days)
        VALUES (NEW.user_id, v_sport_streak_id, 'earned', 7)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streak_on_hashtag_completion AFTER INSERT OR UPDATE ON public.hashtag_completions
  FOR EACH ROW EXECUTE FUNCTION update_sport_streak_on_completion();

-- Auto-transition hashtag states based on time
CREATE OR REPLACE FUNCTION auto_transition_hashtag_states()
RETURNS void AS $$
BEGIN
  -- Activate scheduled hashtags
  UPDATE public.daily_hashtags
  SET state = 'active', published_at = NOW()
  WHERE state = 'scheduled' AND start_at <= NOW();

  -- Expire active hashtags
  UPDATE public.daily_hashtags
  SET state = 'expired'
  WHERE state = 'active' AND end_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed next 7 days of hashtags (using the existing rotation logic)
-- This would typically be run by a cron job or on-demand script

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.daily_hashtags IS 'Server-managed daily hashtags with sport-specific support';
COMMENT ON TABLE public.hashtag_completions IS 'User completions per hashtag per sport (one per day per sport)';
COMMENT ON TABLE public.sport_streaks IS 'Per-sport and all-sport streak tracking with calendar';
COMMENT ON TABLE public.streak_freezes IS 'Streak protection mechanics (earned or purchased)';
COMMENT ON TABLE public.hashtag_leaderboards IS 'Real-time leaderboards for each hashtag';
COMMENT ON TABLE public.hashtag_analytics IS 'Event tracking for hashtag funnel analysis';
