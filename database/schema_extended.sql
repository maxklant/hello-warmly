-- ==========================================
-- HELLO-WARMLY EXTENDED SCHEMA - ADVANCED FEATURES
-- ==========================================
-- This file extends the base schema with advanced features:
-- 1. Mood Tracking
-- 2. Low Effort Contact 
-- 3. Escalation System
-- 4. Priority Contacts
-- 5. Enhanced Privacy
-- 6. Gamification
-- Run this AFTER the base schema.sql

-- ==========================================
-- MOOD TRACKING SYSTEM
-- ==========================================

-- Mood log for daily mood tracking
CREATE TABLE IF NOT EXISTS mood_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood_label TEXT NOT NULL, -- "energiek", "moe", "gestrest", etc.
  mood_emoji TEXT NOT NULL, -- "🙂", "😴", "😡", "😍", etc.
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10), -- 1-10 scale
  notes TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'contacts', 'all')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date) -- One mood per day per user
);

-- Enable RLS on mood_log
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;

-- Users can manage their own mood logs
CREATE POLICY "Users can manage own mood logs" ON mood_log
  FOR ALL USING (auth.uid() = user_id);

-- Users can view mood logs based on visibility and friendship
CREATE POLICY "Users can view visible mood logs" ON mood_log
  FOR SELECT USING (
    visibility = 'all' OR
    (visibility = 'contacts' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE (requester_id = auth.uid() AND receiver_id = user_id) 
         OR (receiver_id = auth.uid() AND requester_id = user_id)
      AND status = 'accepted'
    )) OR
    auth.uid() = user_id
  );

-- ==========================================
-- LOW EFFORT CONTACT SYSTEM
-- ==========================================

-- Enhanced messages table for multimedia content
-- (Extends existing messages table)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('text', 'photo', 'voice', 'sticker', 'video'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS duration INTEGER; -- for voice messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Special events for contextual reminders
CREATE TABLE IF NOT EXISTS special_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'anniversary', 'holiday', 'custom')),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  recurring BOOLEAN DEFAULT TRUE,
  reminder_days_before INTEGER DEFAULT 1,
  reminder_sent BOOLEAN DEFAULT FALSE,
  last_reminded_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE special_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own special events" ON special_events
  FOR ALL USING (auth.uid() = user_id);

-- Contextual nudges for smart suggestions
CREATE TABLE IF NOT EXISTS contextual_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('weather', 'time_of_day', 'location', 'inactivity', 'mood_trend')),
  trigger_condition JSONB, -- Flexible conditions
  message_template TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contextual_nudges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nudges" ON contextual_nudges
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- ESCALATION & EMERGENCY SYSTEM
-- ==========================================

-- Escalation settings for each user
CREATE TABLE IF NOT EXISTS escalation_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  days_until_alert INTEGER DEFAULT 3 CHECK (days_until_alert > 0),
  emergency_contact_ids UUID[] DEFAULT '{}',
  escalation_enabled BOOLEAN DEFAULT TRUE,
  last_check_in DATE,
  alert_sent BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE escalation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own escalation settings" ON escalation_settings
  FOR ALL USING (auth.uid() = user_id);

-- Alert logs for tracking escalations
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('reminder', 'escalation', 'emergency')),
  sent_to UUID[] DEFAULT '{}', -- Array of user IDs who received the alert
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(sent_to));

CREATE POLICY "Users can manage own alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- PRIORITY CONTACTS SYSTEM
-- ==========================================

-- Priority levels for contacts
CREATE TABLE IF NOT EXISTS priority_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
  reminder_frequency INTEGER DEFAULT 7, -- days between reminders
  last_contact_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

ALTER TABLE priority_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own priority contacts" ON priority_contacts
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- ENHANCED PRIVACY CONTROLS
-- ==========================================

-- Granular privacy settings per contact
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  show_status BOOLEAN DEFAULT TRUE,
  show_mood BOOLEAN DEFAULT TRUE,
  show_last_seen BOOLEAN DEFAULT TRUE,
  show_location BOOLEAN DEFAULT FALSE,
  show_activity_feed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own privacy settings" ON privacy_settings
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- GAMIFICATION SYSTEM
-- ==========================================

-- User points and levels
CREATE TABLE IF NOT EXISTS user_points (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  points_total INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0, -- current check-in streak
  longest_streak INTEGER DEFAULT 0,
  check_ins_count INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  friends_added INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON user_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own points" ON user_points
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points" ON user_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT, -- emoji or icon name
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'social', 'wellness', 'consistency', 'special')),
  points_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can award achievements" ON achievements
  FOR INSERT WITH CHECK (true); -- Allow system to award badges

-- Challenges system
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('personal', 'group', 'global')),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('check_ins', 'messages', 'streak', 'friends', 'mood_logs')),
  goal_target INTEGER NOT NULL,
  participants UUID[] DEFAULT '{}',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  reward_points INTEGER DEFAULT 0,
  reward_badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active challenges" ON challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own challenges" ON challenges
  FOR ALL USING (auth.uid() = created_by);

-- Challenge progress tracking
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge progress" ON challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress" ON challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Collections system (stickers, backgrounds, etc.)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('sticker', 'background', 'theme', 'badge', 'emoji_pack')),
  item_name TEXT NOT NULL,
  item_data JSONB, -- Flexible data for different item types
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_condition TEXT, -- How it was unlocked
  is_active BOOLEAN DEFAULT FALSE -- Currently selected/in use
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- ANALYTICS & INSIGHTS
-- ==========================================

-- Activity logs for analytics
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('check_in', 'message_sent', 'friend_added', 'mood_logged', 'challenge_joined')),
  activity_data JSONB, -- Flexible data for different activities
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Mood tracking indexes
CREATE INDEX IF NOT EXISTS idx_mood_log_user_date ON mood_log(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_log_visibility ON mood_log(visibility);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_media_type ON messages(media_type);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Special events indexes
CREATE INDEX IF NOT EXISTS idx_special_events_date ON special_events(event_date);
CREATE INDEX IF NOT EXISTS idx_special_events_reminder ON special_events(reminder_sent, event_date);

-- Priority contacts indexes
CREATE INDEX IF NOT EXISTS idx_priority_contacts_level ON priority_contacts(priority_level);
CREATE INDEX IF NOT EXISTS idx_priority_contacts_last_contact ON priority_contacts(last_contact_date);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_points_level ON user_points(level DESC);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id, earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active, end_date);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type ON activity_logs(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to update user points when activities happen
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update points based on activity type
  IF TG_TABLE_NAME = 'mood_log' AND TG_OP = 'INSERT' THEN
    INSERT INTO user_points (user_id, points_total, check_ins_count)
    VALUES (NEW.user_id, 5, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      points_total = user_points.points_total + 5,
      check_ins_count = user_points.check_ins_count + 1,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();
  END IF;

  IF TG_TABLE_NAME = 'messages' AND TG_OP = 'INSERT' THEN
    INSERT INTO user_points (user_id, points_total, messages_sent)
    VALUES (NEW.sender_id, 2, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      points_total = user_points.points_total + 2,
      messages_sent = user_points.messages_sent + 1,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();
  END IF;

  IF TG_TABLE_NAME = 'friendships' AND TG_OP = 'UPDATE' AND NEW.status = 'accepted' THEN
    -- Award points to both users
    INSERT INTO user_points (user_id, points_total, friends_added)
    VALUES (NEW.requester_id, 10, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      points_total = user_points.points_total + 10,
      friends_added = user_points.friends_added + 1,
      updated_at = NOW();
      
    INSERT INTO user_points (user_id, points_total, friends_added)
    VALUES (NEW.receiver_id, 10, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      points_total = user_points.points_total + 10,
      friends_added = user_points.friends_added + 1,
      updated_at = NOW();
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for point updates
CREATE TRIGGER trigger_mood_log_points
  AFTER INSERT ON mood_log
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

CREATE TRIGGER trigger_message_points
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

CREATE TRIGGER trigger_friendship_points
  AFTER UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_user_points();

-- Function to check and update streaks
CREATE OR REPLACE FUNCTION update_streaks()
RETURNS TRIGGER AS $$
BEGIN
  -- Update check-in streaks for mood logs
  IF TG_TABLE_NAME = 'mood_log' AND TG_OP = 'INSERT' THEN
    UPDATE user_points 
    SET 
      current_streak = CASE 
        WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
        WHEN last_activity_date = CURRENT_DATE THEN current_streak
        ELSE 1
      END,
      longest_streak = GREATEST(longest_streak, 
        CASE 
          WHEN last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN current_streak + 1
          WHEN last_activity_date = CURRENT_DATE THEN current_streak
          ELSE 1
        END
      ),
      last_activity_date = CURRENT_DATE
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_streak_update
  AFTER INSERT ON mood_log
  FOR EACH ROW EXECUTE FUNCTION update_streaks();

-- Function to auto-award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT * INTO user_stats FROM user_points WHERE user_id = NEW.user_id;
  
  -- First check-in badge
  IF user_stats.check_ins_count = 1 THEN
    INSERT INTO achievements (user_id, badge_name, badge_description, badge_icon, category, points_earned)
    VALUES (NEW.user_id, 'First Steps', 'Completed your first mood check-in!', '🎯', 'wellness', 10)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Streak badges
  IF user_stats.current_streak = 7 THEN
    INSERT INTO achievements (user_id, badge_name, badge_description, badge_icon, category, points_earned)
    VALUES (NEW.user_id, 'Week Warrior', '7 days in a row!', '🔥', 'consistency', 25)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF user_stats.current_streak = 30 THEN
    INSERT INTO achievements (user_id, badge_name, badge_description, badge_icon, category, points_earned)
    VALUES (NEW.user_id, 'Monthly Master', '30 days consecutive!', '👑', 'consistency', 100)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Social badges
  IF user_stats.friends_added = 5 THEN
    INSERT INTO achievements (user_id, badge_name, badge_description, badge_icon, category, points_earned)
    VALUES (NEW.user_id, 'Social Butterfly', 'Connected with 5 friends!', '🦋', 'social', 20)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_achievements
  AFTER UPDATE ON user_points
  FOR EACH ROW EXECUTE FUNCTION check_achievements();

-- ==========================================
-- INITIAL DATA SETUP
-- ==========================================

-- Create default challenges
INSERT INTO challenges (title, description, type, goal_type, goal_target, end_date, reward_points, reward_badge) VALUES
('Weekly Warrior', 'Check in every day for a week', 'personal', 'streak', 7, CURRENT_DATE + INTERVAL '30 days', 50, 'Week Champion'),
('Social Connector', 'Send 10 messages to friends', 'personal', 'messages', 10, CURRENT_DATE + INTERVAL '14 days', 30, 'Communicator'),
('Mood Master', 'Log your mood for 14 days', 'personal', 'mood_logs', 14, CURRENT_DATE + INTERVAL '21 days', 70, 'Mindful')
ON CONFLICT DO NOTHING;

-- Create default sticker collection items
INSERT INTO collections (user_id, item_type, item_name, item_data, unlocked_at, unlock_condition, is_active)
SELECT 
  u.id,
  'sticker',
  'Welcome Pack',
  '{"stickers": ["👋", "😊", "🎉", "❤️", "👍"]}'::jsonb,
  NOW(),
  'default',
  false
FROM users u
ON CONFLICT DO NOTHING;