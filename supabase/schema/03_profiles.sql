-- ============================================================================
-- Module 03: Profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE CHECK(
        username IS NULL
        OR length(trim(username)) > 0
    ),
    full_name TEXT CHECK(
        full_name IS NULL
        OR length(trim(full_name)) > 0
    ),
    avatar_url TEXT,
    phone_number TEXT,
    bio TEXT,
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    former_school_id UUID REFERENCES high_schools(id),
    is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
    date_of_birth DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university_id);

CREATE INDEX IF NOT EXISTS idx_profiles_campus ON profiles(campus_id);