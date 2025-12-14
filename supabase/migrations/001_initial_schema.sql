-- ============================================
-- Easy Habit Pro - Initial Database Schema
-- ============================================
-- Run this in Supabase SQL Editor to set up the database
-- https://supabase.com/dashboard/project/_/sql
-- ============================================
-- TABLES
-- ============================================
-- Users profile extension (Supabase auth handles core user data)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free',
    -- 'free', 'standard_monthly', 'standard_yearly', 'cancelled'
    subscription_end_date TIMESTAMPTZ,
    dark_mode_preference TEXT DEFAULT 'system',
    -- 'light', 'dark', 'system'
    weekly_summary_enabled BOOLEAN DEFAULT true,
    monthly_summary_enabled BOOLEAN DEFAULT true,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tags for habit categorization
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    -- Tailwind indigo-500
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Habits
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    target_days_per_month INTEGER DEFAULT 20,
    -- Goal: X days per month
    sort_order INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit-Tag relationship (many-to-many)
CREATE TABLE IF NOT EXISTS habit_tags (
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (habit_id, tag_id)
);

-- Daily habit entries
CREATE TABLE IF NOT EXISTS habit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    -- 'done', 'planned'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, date)
);

-- Achievements/Gamification
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    -- 'first_habit', 'week_streak', 'month_complete', etc.
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    -- Store extra info like streak count, habit name, etc.
    UNIQUE(user_id, achievement_type)
);

-- Sync tracking for offline-first
CREATE TABLE IF NOT EXISTS sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL,
    -- 'INSERT', 'UPDATE', 'DELETE'
    synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);

CREATE INDEX IF NOT EXISTS idx_habits_sort_order ON habits(user_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id ON habit_entries(habit_id);

CREATE INDEX IF NOT EXISTS idx_habit_entries_user_date ON habit_entries(user_id, date);

CREATE INDEX IF NOT EXISTS idx_habit_entries_date ON habit_entries(date);

CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_sync_log_user_id ON sync_log(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS on all tables
ALTER TABLE
    profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    tags ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    habits ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    habit_tags ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    habit_entries ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    achievements ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    sync_log ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
    WITH CHECK (auth.uid() = id);

-- Tags: Users can only manage their own tags
CREATE POLICY "Users can manage own tags" ON tags FOR ALL USING (auth.uid() = user_id);

-- Habits: Users can only manage their own habits
CREATE POLICY "Users can manage own habits" ON habits FOR ALL USING (auth.uid() = user_id);

-- Habit Tags: Users can manage tags for their habits
CREATE POLICY "Users can manage habit tags" ON habit_tags FOR ALL USING (
    EXISTS (
        SELECT
            1
        FROM
            habits
        WHERE
            habits.id = habit_tags.habit_id
            AND habits.user_id = auth.uid()
    )
);

-- Habit Entries: Users can manage their own entries
CREATE POLICY "Users can manage own entries" ON habit_entries FOR ALL USING (auth.uid() = user_id);

-- Achievements: Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON achievements FOR
SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON achievements FOR
INSERT
    WITH CHECK (auth.uid() = user_id);

-- Sync Log: Users can access their own sync log
CREATE POLICY "Users can manage own sync log" ON sync_log FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
-- Auto-create profile on user signup
CREATE
OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO
    public.profiles (id, email, full_name, avatar_url)
VALUES
    (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'avatar_url'
    );

RETURN NEW;

END;

$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp automatically
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE
    ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habits_updated_at ON habits;

CREATE TRIGGER update_habits_updated_at BEFORE
UPDATE
    ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_habit_entries_updated_at ON habit_entries;

CREATE TRIGGER update_habit_entries_updated_at BEFORE
UPDATE
    ON habit_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime
ADD
    TABLE habits;

ALTER PUBLICATION supabase_realtime
ADD
    TABLE habit_entries;

ALTER PUBLICATION supabase_realtime
ADD
    TABLE tags;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample habits for testing
-- This requires a valid user_id from auth.users
/*
 -- First, get a user ID from auth.users table
 -- INSERT INTO habits (user_id, name, color, target_days_per_month, sort_order) VALUES
 --   ('YOUR-USER-UUID', 'Exercise', '#10B981', 20, 0),
 --   ('YOUR-USER-UUID', 'Read', '#6366F1', 25, 1),
 --   ('YOUR-USER-UUID', 'Meditate', '#8B5CF6', 30, 2);
 */