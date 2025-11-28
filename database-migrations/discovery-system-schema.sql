-- ============================================================
-- DISCOVERY SYSTEM SCHEMA
-- Complete schema for Instagram Reels-style discovery feed
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE content_rating AS ENUM ('sfw', 'nsfw', 'wholesome');
CREATE TYPE sport_level AS ENUM ('little_league', 'youth', 'middle_school', 'high_school', 'college', 'amateur', 'professional', 'olympic');
CREATE TYPE region_scope AS ENUM ('local', 'regional', 'national', 'international');

-- ============================================================
-- USER PREFERENCES
-- ============================================================

CREATE TABLE IF NOT EXISTS user_discovery_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content filters
  content_ratings content_rating[] DEFAULT ARRAY['sfw']::content_rating[],
  show_wholesome BOOLEAN DEFAULT true,
  show_nsfw BOOLEAN DEFAULT false,

  -- Regional preferences
  region_scope region_scope DEFAULT 'national',
  preferred_regions TEXT[] DEFAULT ARRAY[]::TEXT[], -- e.g., ['Chicago', 'Midwest', 'Illinois']

  -- Sport preferences
  favorite_sports TEXT[] DEFAULT ARRAY[]::TEXT[], -- sport slugs
  favorite_teams TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Level preferences
  preferred_levels sport_level[] DEFAULT ARRAY['high_school', 'college']::sport_level[],

  -- Discovery settings
  auto_play BOOLEAN DEFAULT true,
  show_live_streams BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================
-- TEAMS DATABASE
-- ============================================================

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sport_id INTEGER REFERENCES sports(id) ON DELETE SET NULL,

  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'USA',
  region TEXT, -- e.g., 'Midwest', 'West Coast'

  -- Level
  level sport_level DEFAULT 'high_school',
  division TEXT, -- e.g., 'Division I', 'Conference A'

  -- Media
  logo_url TEXT,
  colors TEXT[], -- hex codes

  -- Metadata
  founded_year INTEGER,
  home_venue TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_teams_sport ON teams(sport_id);
CREATE INDEX idx_teams_level ON teams(level);
CREATE INDEX idx_teams_region ON teams(region);

-- ============================================================
-- ENHANCED CLIPS/VIDEOS
-- ============================================================

ALTER TABLE clips ADD COLUMN IF NOT EXISTS content_rating content_rating DEFAULT 'sfw';
ALTER TABLE clips ADD COLUMN IF NOT EXISTS is_wholesome BOOLEAN DEFAULT false;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS sport_level sport_level;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS athlete_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS division TEXT;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE clips ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_clips_content_rating ON clips(content_rating);
CREATE INDEX IF NOT EXISTS idx_clips_sport_level ON clips(sport_level);
CREATE INDEX IF NOT EXISTS idx_clips_team ON clips(team_id);
CREATE INDEX IF NOT EXISTS idx_clips_region ON clips(region);
CREATE INDEX IF NOT EXISTS idx_clips_athlete ON clips(athlete_id);

-- ============================================================
-- CHEER BADGES / REACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS cheer_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  icon_url TEXT,

  -- Association
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  sport_id INTEGER REFERENCES sports(id) ON DELETE CASCADE,
  region TEXT,

  -- Rarity/unlocking
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  unlock_requirement TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cheer_badges_team ON cheer_badges(team_id);
CREATE INDEX idx_cheer_badges_sport ON cheer_badges(sport_id);

CREATE TABLE IF NOT EXISTS clip_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES cheer_badges(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(clip_id, user_id, badge_id)
);

CREATE INDEX idx_clip_reactions_clip ON clip_reactions(clip_id);
CREATE INDEX idx_clip_reactions_user ON clip_reactions(user_id);

-- ============================================================
-- COMMENTS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- for nested replies

  content TEXT NOT NULL,

  -- Moderation
  is_hidden BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  flagged_count INTEGER DEFAULT 0,

  -- Metrics
  likes_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_clip ON comments(clip_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(comment_id, user_id)
);

-- ============================================================
-- LIVE STREAMS
-- ============================================================

CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stream info
  title TEXT NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Provider
  provider TEXT, -- 'ESPN', 'ABC Sports', 'NBC Sports', 'Meta', 'YouTube'
  provider_stream_id TEXT,

  -- Sports context
  sport_id INTEGER REFERENCES sports(id) ON DELETE SET NULL,
  team_home_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  team_away_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Location
  venue TEXT,
  region TEXT,

  -- Level
  sport_level sport_level,

  -- Status
  status TEXT DEFAULT 'scheduled', -- scheduled, live, ended
  scheduled_start TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,

  -- Metrics
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_live_streams_sport ON live_streams(sport_id);
CREATE INDEX idx_live_streams_scheduled_start ON live_streams(scheduled_start);

-- ============================================================
-- ATHLETE STATS & PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS athlete_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport_id INTEGER NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  season TEXT, -- e.g., '2024', '2023-2024'

  -- Generic stats (key-value for flexibility across sports)
  stats JSONB DEFAULT '{}'::JSONB,

  -- Examples of stats structure:
  -- Basketball: { "points": 1250, "rebounds": 450, "assists": 320, "games_played": 30 }
  -- Soccer: { "goals": 15, "assists": 8, "games_played": 22, "minutes_played": 1800 }
  -- Football: { "touchdowns": 12, "yards": 850, "receptions": 45 }

  -- Achievements
  championships INTEGER DEFAULT 0,
  awards TEXT[], -- ["MVP", "All-State", "Team Captain"]

  -- Current team
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, sport_id, season)
);

CREATE INDEX idx_athlete_stats_user ON athlete_stats(user_id);
CREATE INDEX idx_athlete_stats_sport ON athlete_stats(sport_id);
CREATE INDEX idx_athlete_stats_team ON athlete_stats(team_id);

-- ============================================================
-- CONTENT DISCOVERY ALGORITHM TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS clip_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- View metadata
  watch_duration INTEGER, -- seconds
  completed BOOLEAN DEFAULT false, -- watched to end

  -- Session tracking
  session_id TEXT,
  device_type TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clip_views_clip ON clip_views(clip_id);
CREATE INDEX idx_clip_views_user ON clip_views(user_id);
CREATE INDEX idx_clip_views_created_at ON clip_views(created_at);

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Learned interests (updated by algorithm)
  sports_interest JSONB DEFAULT '{}'::JSONB, -- { "basketball": 0.8, "soccer": 0.6 }
  teams_interest JSONB DEFAULT '{}'::JSONB,
  regions_interest JSONB DEFAULT '{}'::JSONB,
  levels_interest JSONB DEFAULT '{}'::JSONB,

  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_interests_user ON user_interests(user_id);

-- ============================================================
-- SEED DATA: CHEER BADGES
-- ============================================================

-- Generic sport badges
INSERT INTO cheer_badges (name, slug, emoji, rarity) VALUES
('Fire', 'fire', '🔥', 'common'),
('Heart', 'heart', '❤️', 'common'),
('Trophy', 'trophy', '🏆', 'common'),
('Clap', 'clap', '👏', 'common'),
('Star', 'star', '⭐', 'rare'),
('Crown', 'crown', '👑', 'epic'),
('Rocket', 'rocket', '🚀', 'rare'),
('Lightning', 'lightning', '⚡', 'rare')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update comments count on clips
CREATE OR REPLACE FUNCTION update_clip_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clips SET comments_count = comments_count + 1 WHERE id = NEW.clip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clips SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.clip_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clip_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_clip_comments_count();

-- Update likes count on comments
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_discovery_preferences_updated_at
BEFORE UPDATE ON user_discovery_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_streams_updated_at
BEFORE UPDATE ON live_streams
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_athlete_stats_updated_at
BEFORE UPDATE ON athlete_stats
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- User preferences
ALTER TABLE user_discovery_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_discovery_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_discovery_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_discovery_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Comment likes
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes"
  ON comment_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like comments"
  ON comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Teams (public read)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  USING (true);

-- Cheer badges (public read)
ALTER TABLE cheer_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cheer badges"
  ON cheer_badges FOR SELECT
  USING (true);

-- Clip reactions
ALTER TABLE clip_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions"
  ON clip_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON clip_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON clip_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Live streams (public read)
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live streams"
  ON live_streams FOR SELECT
  USING (true);

-- Athlete stats (public read, owner edit)
ALTER TABLE athlete_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view athlete stats"
  ON athlete_stats FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own stats"
  ON athlete_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON athlete_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);
