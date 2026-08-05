-- ============================================================================
-- Module 04: Students
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- HIGH SCHOOLS

CREATE TABLE IF NOT EXISTS high_schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    city_id UUID REFERENCES cities(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE INDEX IF NOT EXISTS idx_high_schools_city ON high_schools(city_id);

-- STUDENT DOMAIN
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    former_school_id UUID REFERENCES high_schools(id),
    enrollment_year INTEGER CHECK(
        enrollment_year IS NULL
        OR enrollment_year BETWEEN 1900
        AND 2100
    ),
    graduation_year INTEGER CHECK(
        graduation_year IS NULL
        OR graduation_year BETWEEN 1900
        AND 2100
    ),
    campozy_score INTEGER NOT NULL DEFAULT 0 CHECK (campozy_score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_university ON students(university_id);

CREATE INDEX IF NOT EXISTS idx_students_campus ON students(campus_id);

CREATE INDEX IF NOT EXISTS idx_students_former_school ON students(former_school_id);

CREATE INDEX IF NOT EXISTS idx_students_campozy_score ON students(campozy_score DESC);

CREATE TABLE IF NOT EXISTS student_preferences (
    student_id UUID PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
    preferred_city_id UUID REFERENCES cities(id),
    budget_min NUMERIC CHECK(
        budget_min IS NULL
        OR budget_min >= 0
    ),
    budget_max NUMERIC CHECK(
        budget_max IS NULL
        OR budget_max >= 0
    ),
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK(
        budget_min IS NULL
        OR budget_max IS NULL
        OR budget_max >= budget_min
    )
);

CREATE TABLE IF NOT EXISTS student_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK(length(trim(status)) > 0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_lifecycle_student ON student_lifecycle_history(student_id);