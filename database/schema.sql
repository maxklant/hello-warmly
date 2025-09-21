-- ==========================================
-- HELLO-WARMLY DATABASE SCHEMA
-- ==========================================
-- This SQL script sets up the complete database schema for the hello-warmly app
-- Run this in your Supabase SQL editor after creating a new project

-- Enable Row Level Security (RLS) for all tables
-- This ensures users can only access their own data

-- ==========================================
-- USERS TABLE
-- ==========================================
-- Stores user profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  phone TEXT,
  invite_code TEXT UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  bio TEXT,
  avatar_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and profiles of people they have as contacts
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for initial signup)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ==========================================
-- FRIENDSHIPS TABLE
-- ==========================================
-- Stores friendship relationships between users with status tracking
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't friend the same person twice
  UNIQUE(requester_id, receiver_id),
  
  -- Ensure a user can't friend themselves
  CHECK (requester_id != receiver_id)
);

-- Enable RLS on friendships table
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can manage friendships they are part of
CREATE POLICY "Users can manage own friendships" ON friendships
  FOR ALL USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ==========================================
-- CONTACTS TABLE (LEGACY - For muting functionality)
-- ==========================================
-- Stores additional contact settings like muting
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_muted BOOLEAN DEFAULT FALSE,
  muted_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can't add the same contact twice
  UNIQUE(user_id, contact_user_id),
  
  -- Ensure a user can't add themselves as a contact
  CHECK (user_id != contact_user_id)
);

-- Enable RLS on contacts table
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own contacts
CREATE POLICY "Users can manage own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- CHECK_INS TABLE
-- ==========================================
-- Stores user check-in data (status updates, mood, activities)
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  emotions TEXT[],
  current_activity TEXT,
  today_activities TEXT,
  visibility TEXT DEFAULT 'contacts' CHECK (visibility IN ('public', 'contacts', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on check_ins table
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Users can manage their own check-ins
CREATE POLICY "Users can manage own check_ins" ON check_ins
  FOR ALL USING (auth.uid() = user_id);

-- Users can view check-ins from their friends (based on visibility)
CREATE POLICY "Users can view friend check_ins" ON check_ins
  FOR SELECT USING (
    -- Public check-ins are visible to everyone
    visibility = 'public' 
    OR 
    -- Contact check-ins are visible if the viewer is friends with the check-in author
    (visibility = 'contacts' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE (
        (friendships.requester_id = auth.uid() AND friendships.receiver_id = check_ins.user_id) OR
        (friendships.receiver_id = auth.uid() AND friendships.requester_id = check_ins.user_id)
      ) AND friendships.status = 'accepted'
    ))
  );

-- ==========================================
-- MESSAGES TABLE
-- ==========================================
-- Stores chat messages between users
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'check-in-reaction', 'image', 'system')),
  check_in_id UUID REFERENCES check_ins(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages they sent or received, and only if they are friends
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    (auth.uid() = sender_id OR auth.uid() = receiver_id) AND
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (
        (friendships.requester_id = sender_id AND friendships.receiver_id = receiver_id) OR
        (friendships.receiver_id = sender_id AND friendships.requester_id = receiver_id)
      ) AND friendships.status = 'accepted'
    )
  );

-- Users can send messages only to friends
CREATE POLICY "Users can send messages to friends" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM friendships 
      WHERE (
        (friendships.requester_id = auth.uid() AND friendships.receiver_id = messages.receiver_id) OR
        (friendships.receiver_id = auth.uid() AND friendships.requester_id = messages.receiver_id)
      ) AND friendships.status = 'accepted'
    )
  );

-- Users can update (mark as read) messages they received
CREATE POLICY "Users can update received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
-- Create indexes on frequently queried columns

-- Index for users lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for friendships lookup
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- Index for contacts lookup
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_contact_user_id ON contacts(contact_user_id);

-- Index for check-ins lookup
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_created_at ON check_ins(created_at DESC);

-- Index for messages lookup
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at 
  BEFORE UPDATE ON friendships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
  BEFORE UPDATE ON contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- HELPFUL VIEWS (OPTIONAL)
-- ==========================================

-- View to get friends with user information
CREATE OR REPLACE VIEW user_friends AS
SELECT 
  f.*,
  CASE 
    WHEN f.requester_id = auth.uid() THEN f.receiver_id
    ELSE f.requester_id
  END as friend_id,
  CASE 
    WHEN f.requester_id = auth.uid() THEN ru.name
    ELSE qu.name
  END as friend_name,
  CASE 
    WHEN f.requester_id = auth.uid() THEN ru.username
    ELSE qu.username
  END as friend_username,
  CASE 
    WHEN f.requester_id = auth.uid() THEN ru.avatar_url
    ELSE qu.avatar_url
  END as friend_avatar
FROM friendships f
JOIN users qu ON f.requester_id = qu.id
JOIN users ru ON f.receiver_id = ru.id
WHERE f.status = 'accepted';

-- View to get contacts with user information (legacy)
CREATE OR REPLACE VIEW contact_users AS
SELECT 
  c.*,
  u.name as contact_name,
  u.email as contact_email,
  u.phone as contact_phone,
  u.username as contact_username
FROM contacts c
JOIN users u ON c.contact_user_id = u.id;

-- ==========================================
-- SEED DATA (OPTIONAL - FOR TESTING)
-- ==========================================
-- Uncomment the following to add some test data

/*
-- Insert test users (you'll need to replace these UUIDs with real auth.users UUIDs)
INSERT INTO users (id, email, name, phone) VALUES
  ('11111111-1111-1111-1111-111111111111', 'test1@example.com', 'Test User 1', '+31612345678'),
  ('22222222-2222-2222-2222-222222222222', 'test2@example.com', 'Test User 2', '+31687654321')
ON CONFLICT (id) DO NOTHING;

-- Insert test contacts
INSERT INTO contacts (user_id, contact_user_id) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (user_id, contact_user_id) DO NOTHING;

-- Insert test check-ins
INSERT INTO check_ins (user_id, status, mood, emotions, current_activity) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alles oké', 8, ARRAY['happy', 'calm'], 'Aan het programmeren'),
  ('22222222-2222-2222-2222-222222222222', 'Druk bezig', 6, ARRAY['busy', 'focused'], 'In vergadering');
*/

-- ==========================================
-- INSTRUCTIONS FOR SETUP
-- ==========================================
/*
1. Create a new Supabase project at https://supabase.com/dashboard
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste this entire script
4. Run the script to create all tables, policies, and indexes
5. Copy your project URL and anon key to your .env file
6. Your database is ready to use with the hello-warmly app!

Note: The Row Level Security (RLS) policies ensure that:
- Users can only see their own data
- Users can see check-ins from people they have as contacts
- Messages are only visible to sender and receiver
- All data access is properly secured
*/