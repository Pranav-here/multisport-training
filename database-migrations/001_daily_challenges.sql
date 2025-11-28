-- Daily Challenges Production Schema
-- This migration adds tables for challenge persistence, submissions, and tracking

-- ============================================================================
-- CHALLENGES TABLE
-- Stores published daily challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sport_slug TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL CHECK (points >= 10 AND points <= 500),
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenge_date DATE NOT NULL,
  time_zone TEXT NOT NULL DEFAULT 'UTC',
  deadline TIMESTAMPTZ NOT NULL,

  -- Metadata
  thumbnail TEXT,
  participant_count INTEGER NOT NULL DEFAULT 0,
  experiment_flag TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'daily' CHECK (challenge_type IN ('daily', 'personalized', 'universal', 'special')),

  -- Publishing info
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Scoring rubric (flexible JSON for different challenge types)
  scoring_rubric JSONB DEFAULT '{
    "technical_execution": 40,
    "consistency": 30,
    "difficulty": 20,
    "presentation": 10
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_date ON public.challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_challenges_sport ON public.challenges(sport_slug);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON public.challenges(is_active, challenge_date);
CREATE INDEX IF NOT EXISTS idx_challenges_deadline ON public.challenges(deadline);

-- ============================================================================
-- CHALLENGE SUBMISSIONS TABLE
-- Tracks user attempts and submissions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Submission details
  clip_id TEXT REFERENCES public.clips(id) ON DELETE SET NULL,
  video_url TEXT,
  thumbnail_url TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verifying', 'verified', 'rejected', 'flagged')),
  submission_method TEXT CHECK (submission_method IN ('upload', 'record', 'link')),

  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  verification_method TEXT CHECK (verification_method IN ('auto', 'manual', 'ml', 'hybrid')),
  verification_notes TEXT,
  anti_cheat_token TEXT, -- Dynamic code/gesture shown during recording
  anti_cheat_verified BOOLEAN DEFAULT false,

  -- Scoring
  score INTEGER CHECK (score >= 0 AND score <= 100),
  bonus_points INTEGER DEFAULT 0,
  final_points INTEGER, -- Base points from challenge + bonus
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  scored_at TIMESTAMPTZ,

  -- Metadata
  attempt_number INTEGER NOT NULL DEFAULT 1, -- Allow multiple attempts
  is_best_attempt BOOLEAN DEFAULT false, -- Flag the best scoring attempt
  client_metadata JSONB DEFAULT '{}'::jsonb, -- Device info, app version, etc.

  -- Timestamps
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one submission per challenge per user per attempt
  UNIQUE(challenge_id, user_id, attempt_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge ON public.challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.challenge_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_verified ON public.challenge_submissions(verified_at, status);
CREATE INDEX IF NOT EXISTS idx_submissions_best ON public.challenge_submissions(is_best_attempt, user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_leaderboard ON public.challenge_submissions(challenge_id, status, score DESC);

-- ============================================================================
-- CHALLENGE STREAKS TABLE
-- Track user challenge completion streaks
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Streak tracking
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_completion_date DATE,

  -- Grace period & recovery
  grace_period_used BOOLEAN DEFAULT false,
  grace_period_expires_at TIMESTAMPTZ,
  makeup_tokens INTEGER NOT NULL DEFAULT 0, -- Weekly makeup tokens
  makeup_tokens_last_reset DATE,

  -- Statistics
  total_challenges_completed INTEGER NOT NULL DEFAULT 0,
  total_challenges_attempted INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,

  -- Multi-sport tracking
  sports_completed JSONB DEFAULT '{}'::jsonb, -- {"soccer": 5, "basketball": 3}

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CHALLENGE LEADERBOARDS TABLE
-- Pre-computed leaderboard entries for performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ranking
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  final_points INTEGER NOT NULL,

  -- Filters
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('global', 'school', 'friends', 'local')),
  filter_value TEXT, -- School ID, city, etc.

  -- Metadata
  submission_id UUID REFERENCES public.challenge_submissions(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(challenge_id, leaderboard_type, filter_value, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_challenge ON public.challenge_leaderboards(challenge_id, leaderboard_type, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user ON public.challenge_leaderboards(user_id, leaderboard_type);

-- ============================================================================
-- CHALLENGE BADGES TABLE
-- Special badges awarded for challenge achievements
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Badge info
  badge_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),

  -- Award criteria (flexible JSON)
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Examples:
  -- {"type": "streak", "value": 7}
  -- {"type": "multi_sport", "sports_count": 3}
  -- {"type": "perfect_score", "min_score": 95}

  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- USER CHALLENGE BADGES TABLE
-- Track which users earned which badges
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_challenge_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.challenge_badges(id) ON DELETE CASCADE,

  -- Award details
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  challenge_id TEXT REFERENCES public.challenges(id),
  submission_id UUID REFERENCES public.challenge_submissions(id),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges ON public.user_challenge_badges(user_id, earned_at DESC);

-- ============================================================================
-- CHALLENGE REMINDERS TABLE
-- Track reminder preferences and delivery
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.challenge_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,

  -- Reminder details
  remind_at TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('snooze', 'daily', 'time_based')),

  -- Delivery tracking
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  delivery_method TEXT CHECK (delivery_method IN ('push', 'email', 'in_app')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, challenge_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending ON public.challenge_reminders(remind_at, delivered) WHERE NOT delivered;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_reminders ENABLE ROW LEVEL SECURITY;

-- Challenges: Public read, admin write
CREATE POLICY "Challenges are viewable by authenticated users"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Submissions: Users can manage their own
CREATE POLICY "Users can view their own submissions"
  ON public.challenge_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
  ON public.challenge_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending submissions"
  ON public.challenge_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

-- Streaks: Users can view their own
CREATE POLICY "Users can view their own streaks"
  ON public.challenge_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Leaderboards: Public read
CREATE POLICY "Leaderboards are viewable by authenticated users"
  ON public.challenge_leaderboards FOR SELECT
  TO authenticated
  USING (true);

-- Badges: Public read
CREATE POLICY "Badges are viewable by all"
  ON public.challenge_badges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User badges: Users can view their own and others'
CREATE POLICY "User badges are viewable by authenticated users"
  ON public.user_challenge_badges FOR SELECT
  TO authenticated
  USING (true);

-- Reminders: Users manage their own
CREATE POLICY "Users can manage their own reminders"
  ON public.challenge_reminders FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.challenge_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON public.challenge_leaderboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Increment participant count when submission is verified
CREATE OR REPLACE FUNCTION increment_challenge_participants()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    UPDATE public.challenges
    SET participant_count = participant_count + 1
    WHERE id = NEW.challenge_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenge_participants AFTER INSERT OR UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION increment_challenge_participants();

-- Update streak on verified submission
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_challenge_date DATE;
  v_last_completion DATE;
  v_current_streak INTEGER;
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    -- Get challenge date
    SELECT challenge_date INTO v_challenge_date
    FROM public.challenges
    WHERE id = NEW.challenge_id;

    -- Get or create streak record
    INSERT INTO public.challenge_streaks (user_id, current_streak, longest_streak)
    VALUES (NEW.user_id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    -- Get current streak data
    SELECT current_streak, last_completion_date
    INTO v_current_streak, v_last_completion
    FROM public.challenge_streaks
    WHERE user_id = NEW.user_id;

    -- Update streak logic
    IF v_last_completion IS NULL OR v_challenge_date > v_last_completion THEN
      -- First completion or new day
      IF v_last_completion IS NULL OR v_challenge_date = v_last_completion + INTERVAL '1 day' THEN
        -- Consecutive day
        v_current_streak := v_current_streak + 1;
      ELSIF v_challenge_date > v_last_completion + INTERVAL '1 day' THEN
        -- Streak broken
        v_current_streak := 1;
      END IF;

      -- Update streak record
      UPDATE public.challenge_streaks
      SET
        current_streak = v_current_streak,
        longest_streak = GREATEST(longest_streak, v_current_streak),
        last_completion_date = v_challenge_date,
        total_challenges_completed = total_challenges_completed + 1,
        total_points_earned = total_points_earned + COALESCE(NEW.final_points, 0)
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_streak_on_completion AFTER INSERT OR UPDATE ON public.challenge_submissions
  FOR EACH ROW EXECUTE FUNCTION update_user_streak();

-- ============================================================================
-- SEED DATA: Common Challenge Badges
-- ============================================================================

INSERT INTO public.challenge_badges (badge_code, name, description, icon, rarity, criteria, points_reward) VALUES
  ('streak_7', '7-Day Warrior', 'Complete challenges for 7 consecutive days', '🔥', 'rare', '{"type": "streak", "value": 7}'::jsonb, 100),
  ('streak_30', 'Monthly Master', 'Complete challenges for 30 consecutive days', '🏆', 'epic', '{"type": "streak", "value": 30}'::jsonb, 500),
  ('streak_100', 'Century Champion', 'Complete challenges for 100 consecutive days', '👑', 'legendary', '{"type": "streak", "value": 100}'::jsonb, 2000),
  ('multi_sport_3', 'Triple Threat', 'Complete challenges in 3 different sports', '⚡', 'rare', '{"type": "multi_sport", "sports_count": 3}'::jsonb, 150),
  ('multi_sport_5', 'All-Around Athlete', 'Complete challenges in 5 different sports', '🌟', 'epic', '{"type": "multi_sport", "sports_count": 5}'::jsonb, 300),
  ('perfect_score', 'Perfectionist', 'Achieve a perfect score (95+)', '💯', 'epic', '{"type": "perfect_score", "min_score": 95}'::jsonb, 200),
  ('early_bird', 'Early Bird', 'Complete challenge within first hour of release', '🌅', 'rare', '{"type": "early_completion", "hours": 1}'::jsonb, 75),
  ('comeback', 'Comeback Kid', 'Rebuild a 7+ day streak after breaking it', '💪', 'rare', '{"type": "streak_recovery", "value": 7}'::jsonb, 150)
ON CONFLICT (badge_code) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.challenges IS 'Stores published daily challenges with metadata';
COMMENT ON TABLE public.challenge_submissions IS 'Tracks user challenge attempts and submissions with verification status';
COMMENT ON TABLE public.challenge_streaks IS 'Maintains user challenge completion streaks and statistics';
COMMENT ON TABLE public.challenge_leaderboards IS 'Pre-computed leaderboard rankings for fast queries';
COMMENT ON TABLE public.challenge_badges IS 'Defines available achievement badges for challenges';
COMMENT ON TABLE public.user_challenge_badges IS 'Tracks which users earned which badges and when';
COMMENT ON TABLE public.challenge_reminders IS 'Manages user reminder preferences for challenges';
