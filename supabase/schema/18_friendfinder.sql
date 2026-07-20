-- ============================================================================
-- Module 18: Friendfinder
-- ============================================================================

-- Friend preferences (what a student looks for in friends)
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

CREATE INDEX IF NOT EXISTS idx_friend_preferences_student ON friend_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_friend_preferences_campus ON friend_preferences(preferred_campus_id);

-- Friend profile (public-facing)
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

CREATE INDEX IF NOT EXISTS idx_friend_profiles_student ON friend_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_friend_profiles_campus ON friend_profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_friend_profiles_score ON friend_profiles(campozy_score DESC);

-- Friend matches
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

CREATE INDEX IF NOT EXISTS idx_friend_matches_seeker ON friend_matches(seeker_id);
CREATE INDEX IF NOT EXISTS idx_friend_matches_match ON friend_matches(match_id);
CREATE INDEX IF NOT EXISTS idx_friend_matches_score ON friend_matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_friend_matches_status ON friend_matches(status);

-- Friend connections (mutual)
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

CREATE INDEX IF NOT EXISTS idx_friend_connections_user_a ON friend_connections(user_a);
CREATE INDEX IF NOT EXISTS idx_friend_connections_user_b ON friend_connections(user_b);

-- Friend interactions
CREATE TABLE IF NOT EXISTS friend_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('viewed', 'liked', 'passed', 'connected')),
    notes TEXT CHECK(notes IS NULL OR length(trim(notes)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_friend_interactions_user ON friend_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_interactions_target ON friend_interactions(target_id);
