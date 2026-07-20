-- ============================================================================
-- Module 17: Roommate Finder
-- ============================================================================

-- Roommate preferences (what a student wants in a roommate)
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

CREATE INDEX IF NOT EXISTS idx_roommate_preferences_student ON roommate_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_roommate_preferences_campus ON roommate_preferences(preferred_campus_id);

-- Roommate profile (public-facing summary)
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

CREATE INDEX IF NOT EXISTS idx_roommate_profiles_student ON roommate_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_campus ON roommate_profiles(campus_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_neighborhood ON roommate_profiles(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_score ON roommate_profiles(campozy_score DESC);

-- Roommate matches (computed scores)
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

CREATE INDEX IF NOT EXISTS idx_roommate_matches_seeker ON roommate_matches(seeker_id);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_match ON roommate_matches(match_id);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_score ON roommate_matches(compatibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_roommate_matches_status ON roommate_matches(status);

-- Roommate interactions (likes, passes, conversations)
CREATE TABLE IF NOT EXISTS roommate_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('like', 'pass', 'super_like', 'message')),
    notes TEXT CHECK(notes IS NULL OR length(trim(notes)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, interaction_type)
);

CREATE INDEX IF NOT EXISTS idx_roommate_interactions_user ON roommate_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_roommate_interactions_target ON roommate_interactions(target_id);

-- Roommate conversations (when both like each other)
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

CREATE INDEX IF NOT EXISTS idx_roommate_conversations_participant_a ON roommate_conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_roommate_conversations_participant_b ON roommate_conversations(participant_b);

-- Roommate messages
CREATE TABLE IF NOT EXISTS roommate_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES roommate_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roommate_messages_conversation ON roommate_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_roommate_messages_sender ON roommate_messages(sender_id);
