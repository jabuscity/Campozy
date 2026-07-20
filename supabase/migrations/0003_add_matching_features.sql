-- ============================================================================
-- Migration 0003: Add Roommate Finder & Friendfinder Features
-- ============================================================================

BEGIN;

-- Roommate Finder Tables
CREATE TABLE IF NOT EXISTS roommate_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    budget_min NUMERIC CHECK(budget_min IS NULL OR budget_min >= 0),
    budget_max NUMERIC CHECK(budget_max IS NULL OR budget_max >= 0),
    preferred_campus_id UUID REFERENCES campuses(id),
    preferred_neighborhood_ids UUID[] DEFAULT '{}',
    sleep_schedule TEXT CHECK(sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    cleanliness_level TEXT CHECK(cleanliness_level IN ('neat', 'moderate', 'relaxed')),
    social_level TEXT CHECK(social_level IN ('introvert', 'moderate', 'extrovert')),
    study_habits TEXT CHECK(study_habits IN ('silent', 'light_noise', 'flexible')),
    gender_preference TEXT CHECK(gender_preference IN ('male_only', 'female_only', 'any')),
    dietary_preferences TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    smoking_ok BOOLEAN DEFAULT FALSE,
    pets_ok BOOLEAN DEFAULT FALSE,
    max_roommates INTEGER DEFAULT 1 CHECK(max_roommates BETWEEN 1 AND 4),
    move_in_date DATE,
    lease_duration_months INTEGER CHECK(lease_duration_months IS NULL OR lease_duration_months >= 1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS roommate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT CHECK(bio IS NULL OR length(trim(bio)) > 0),
    year_of_study INTEGER CHECK(year_of_study IS NULL OR year_of_study BETWEEN 1 AND 7),
    age INTEGER CHECK(age IS NULL OR age BETWEEN 16 AND 99),
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    budget_range NUMERIC[2] CHECK(
        budget_range IS NULL
        OR (budget_range[1] >= 0 AND budget_range[2] >= budget_range[1])
    ),
    sleep_schedule TEXT CHECK(sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    cleanliness_level TEXT CHECK(cleanliness_level IN ('neat', 'moderate', 'relaxed')),
    social_level TEXT CHECK(social_level IN ('introvert', 'moderate', 'extrovert')),
    study_habits TEXT CHECK(study_habits IN ('silent', 'light_noise', 'flexible')),
    gender_preference TEXT CHECK(gender_preference IN ('male_only', 'female_only', 'any')),
    dietary_preferences TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    smoking_ok BOOLEAN DEFAULT FALSE,
    pets_ok BOOLEAN DEFAULT FALSE,
    max_roommates INTEGER DEFAULT 1 CHECK(max_roommates BETWEEN 1 AND 4),
    move_in_date DATE,
    lease_duration_months INTEGER CHECK(lease_duration_months IS NULL OR lease_duration_months >= 1),
    is_active BOOLEAN DEFAULT TRUE,
    campozy_score INTEGER NOT NULL DEFAULT 0 CHECK(campozy_score >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS roommate_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL CHECK(compatibility_score BETWEEN 0 AND 100),
    match_reasons TEXT[] DEFAULT '{}',
    budget_score NUMERIC(5, 2),
    lifestyle_score NUMERIC(5, 2),
    location_score NUMERIC(5, 2),
    academic_score NUMERIC(5, 2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'viewed', 'liked', 'matched', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seeker_id, match_id)
);

CREATE TABLE IF NOT EXISTS roommate_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('like', 'pass', 'super_like', 'message')),
    notes TEXT CHECK(notes IS NULL OR length(trim(notes)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, interaction_type)
);

CREATE TABLE IF NOT EXISTS roommate_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK(participant_a <> participant_b),
    UNIQUE(participant_a, participant_b)
);

CREATE TABLE IF NOT EXISTS roommate_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES roommate_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Friendfinder Tables
CREATE TABLE IF NOT EXISTS friend_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_campus_id UUID REFERENCES campuses(id),
    preferred_program_ids UUID[] DEFAULT '{}',
    preferred_interest_ids UUID[] DEFAULT '{}',
    preferred_personality_types TEXT[] DEFAULT '{}',
    max_distance_km NUMERIC CHECK(max_distance_km IS NULL OR max_distance_km >= 0),
    study_together_ok BOOLEAN DEFAULT TRUE,
    event_attendance_ok BOOLEAN DEFAULT TRUE,
    gaming_ok BOOLEAN DEFAULT TRUE,
    fitness_ok BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS friend_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT CHECK(bio IS NULL OR length(trim(bio)) > 0),
    year_of_study INTEGER CHECK(year_of_study IS NULL OR year_of_study BETWEEN 1 AND 7),
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    personality_type TEXT CHECK(personality_type IN ('introvert', 'extrovert', 'ambivert')),
    interests TEXT[] DEFAULT '{}',
    hobbies TEXT[] DEFAULT '{}',
    study_habits TEXT CHECK(study_habits IN ('silent', 'light_noise', 'flexible')),
    availability_windows TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    campozy_score INTEGER NOT NULL DEFAULT 0 CHECK(campozy_score >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS friend_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL CHECK(compatibility_score BETWEEN 0 AND 100),
    match_reasons TEXT[] DEFAULT '{}',
    academic_score NUMERIC(5, 2),
    interest_score NUMERIC(5, 2),
    social_score NUMERIC(5, 2),
    proximity_score NUMERIC(5, 2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'viewed', 'suggested', 'connected', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seeker_id, match_id)
);

CREATE TABLE IF NOT EXISTS friend_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL DEFAULT 'friend' CHECK(connection_type IN ('friend', 'study_buddy', 'event_buddy')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK(user_a <> user_b),
    UNIQUE(user_a, user_b)
);

CREATE TABLE IF NOT EXISTS friend_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('viewed', 'liked', 'passed', 'connected')),
    notes TEXT CHECK(notes IS NULL OR length(trim(notes)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, interaction_type)
);

-- Indexes for Roommate Finder
CREATE INDEX IF NOT EXISTS idx_roommate_preferences_student ON roommate_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_roommate_preferences_campus ON roommate_preferences(preferred_campus_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_student ON roommate_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_campus ON roommate_profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_neighborhood ON roommate_profiles(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_score ON roommate_profiles(campozy_score DESC);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_seeker ON roommate_matches(seeker_id);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_match ON roommate_matches(match_id);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_score ON roommate_matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_status ON roommate_matches(status);
CREATE INDEX IF NOT EXISTS idx_roommate_interactions_user ON roommate_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_roommate_interactions_target ON roommate_interactions(target_id);
CREATE INDEX IF NOT EXISTS idx_roommate_conversations_participant_a ON roommate_conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_roommate_conversations_participant_b ON roommate_conversations(participant_b);
CREATE INDEX IF NOT EXISTS idx_roommate_messages_conversation ON roommate_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_roommate_messages_sender ON roommate_messages(sender_id);

-- Indexes for Friendfinder
CREATE INDEX IF NOT EXISTS idx_friend_preferences_student ON friend_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_friend_preferences_campus ON friend_preferences(preferred_campus_id);
CREATE INDEX IF NOT EXISTS idx_friend_profiles_student ON friend_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_friend_profiles_campus ON friend_profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_friend_profiles_score ON friend_profiles(campozy_score DESC);
CREATE INDEX IF NOT EXISTS idx_friend_matches_seeker ON friend_matches(seeker_id);
CREATE INDEX IF NOT EXISTS idx_friend_matches_match ON friend_matches(match_id);
CREATE INDEX IF NOT EXISTS idx_friend_matches_score ON friend_matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_friend_matches_status ON friend_matches(status);
CREATE INDEX IF NOT EXISTS idx_friend_connections_user_a ON friend_connections(user_a);
CREATE INDEX IF NOT EXISTS idx_friend_connections_user_b ON friend_connections(user_b);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_user ON friend_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_target ON friend_interactions(target_id);

-- RLS Policies for Roommate Finder
ALTER TABLE roommate_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_preferences_select ON roommate_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_preferences_insert ON roommate_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_preferences_update ON roommate_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_preferences_delete ON roommate_preferences FOR DELETE TO authenticated USING (true);

ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_profiles_select ON roommate_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_profiles_insert ON roommate_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_profiles_update ON roommate_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_profiles_delete ON roommate_profiles FOR DELETE TO authenticated USING (true);

ALTER TABLE roommate_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_matches_select ON roommate_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_matches_insert ON roommate_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_matches_update ON roommate_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_matches_delete ON roommate_matches FOR DELETE TO authenticated USING (true);

ALTER TABLE roommate_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_interactions_select ON roommate_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_interactions_insert ON roommate_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_interactions_update ON roommate_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_interactions_delete ON roommate_interactions FOR DELETE TO authenticated USING (true);

ALTER TABLE roommate_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_conversations_select ON roommate_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_conversations_insert ON roommate_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_conversations_update ON roommate_conversations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_conversations_delete ON roommate_conversations FOR DELETE TO authenticated USING (true);

ALTER TABLE roommate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_messages_select ON roommate_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_messages_insert ON roommate_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_messages_update ON roommate_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_messages_delete ON roommate_messages FOR DELETE TO authenticated USING (true);

-- RLS Policies for Friendfinder
ALTER TABLE friend_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_preferences_select ON friend_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_preferences_insert ON friend_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_preferences_update ON friend_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_preferences_delete ON friend_preferences FOR DELETE TO authenticated USING (true);

ALTER TABLE friend_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_profiles_select ON friend_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_profiles_insert ON friend_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_profiles_update ON friend_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_profiles_delete ON friend_profiles FOR DELETE TO authenticated USING (true);

ALTER TABLE friend_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_matches_select ON friend_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_matches_insert ON friend_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_matches_update ON friend_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_matches_delete ON friend_matches FOR DELETE TO authenticated USING (true);

ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_connections_select ON friend_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_connections_insert ON friend_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_connections_update ON friend_connections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_connections_delete ON friend_connections FOR DELETE TO authenticated USING (true);

ALTER TABLE friend_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_interactions_select ON friend_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_interactions_insert ON friend_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_interactions_update ON friend_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_interactions_delete ON friend_interactions FOR DELETE TO authenticated USING (true);

COMMIT;
