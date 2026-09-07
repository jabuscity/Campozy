-- ============================================
-- Migration: Create missing tables for visual analysis
-- ============================================

-- Forums
CREATE TABLE IF NOT EXISTS forums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT CHECK (description IS NULL OR length(trim(description)) > 0),
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forums_campus ON forums(campus_id);
CREATE INDEX IF NOT EXISTS idx_forums_neighborhood ON forums(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_forums_created_by ON forums(created_by);
CREATE INDEX IF NOT EXISTS idx_forums_created_at ON forums(created_at DESC);

-- Forum topics
CREATE TABLE IF NOT EXISTS forum_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_topics_forum ON forum_topics(forum_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_user ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent ON forum_posts(parent_post_id);

-- Forum subscriptions
CREATE TABLE IF NOT EXISTS forum_subscriptions (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
    notify_on_reply BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_id)
);

-- Utility types
CREATE TABLE IF NOT EXISTS utility_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Utility incidents
CREATE TABLE IF NOT EXISTS utility_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    reported_by UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (length(trim(severity)) > 0),
    location_type TEXT NOT NULL DEFAULT 'property' CHECK (length(trim(location_type)) > 0),
    location_description TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utility_incidents_property_id ON utility_incidents(property_id);
CREATE INDEX IF NOT EXISTS idx_utility_incidents_utility_type_id ON utility_incidents(utility_type_id);
CREATE INDEX IF NOT EXISTS idx_utility_incidents_reported_by ON utility_incidents(reported_by);
CREATE INDEX IF NOT EXISTS idx_utility_incidents_created_at ON utility_incidents(created_at DESC);

-- Hygiene categories
CREATE TABLE IF NOT EXISTS hygiene_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hygiene reports
CREATE TABLE IF NOT EXISTS hygiene_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    category_id UUID NOT NULL REFERENCES hygiene_categories(id),
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT CHECK (comment IS NULL OR length(trim(comment)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hygiene_reports_property_id ON hygiene_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_hygiene_reports_user_id ON hygiene_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_hygiene_reports_category_id ON hygiene_reports(category_id);

-- Neighborhood reviews
CREATE TABLE IF NOT EXISTS neighborhood_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content TEXT CHECK (content IS NULL OR length(trim(content)) > 0),
    safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
    transport_rating INTEGER CHECK (transport_rating BETWEEN 1 AND 5),
    amenities_rating INTEGER CHECK (amenities_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_neighborhood_id ON neighborhood_reviews(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_neighborhood_reviews_user_id ON neighborhood_reviews(user_id);

-- Employers
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    industry TEXT,
    website TEXT,
    logo_url TEXT,
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employers' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE employers ADD COLUMN owner_id UUID NOT NULL DEFAULT gen_random_uuid();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employers_owner ON employers(owner_id);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    type opportunity_type NOT NULL,
    is_remote BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    requirements JSONB DEFAULT '{}',
    benefits JSONB DEFAULT '{}',
    application_deadline TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_employer ON opportunities(employer_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);

-- Opportunity applications
CREATE TABLE IF NOT EXISTS opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cover_note TEXT,
    status application_status NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    UNIQUE (opportunity_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity ON opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_applications_student ON opportunity_applications(student_id);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    event_type TEXT NOT NULL,
    location TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    campus_id UUID REFERENCES campuses(id),
    organizer_id UUID NOT NULL REFERENCES profiles(id),
    max_attendees INTEGER,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_campus ON events(campus_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Scout assignments
CREATE TABLE IF NOT EXISTS scout_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    status assignment_status NOT NULL DEFAULT 'assigned',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_scout_assignments_scout ON scout_assignments(scout_id);
CREATE INDEX IF NOT EXISTS idx_scout_assignments_property ON scout_assignments(property_id);

-- Ambassador programs
CREATE TABLE IF NOT EXISTS ambassador_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambassador_programs_campus ON ambassador_programs(campus_id);

-- Ambassadors
CREATE TABLE IF NOT EXISTS ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES ambassador_programs(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_ambassadors_user ON ambassadors(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassadors_program ON ambassadors(program_id);

-- Scouts
CREATE TABLE IF NOT EXISTS scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    region TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scouts_user ON scouts(user_id);

-- Founder cohorts
CREATE TABLE IF NOT EXISTS founder_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    scope founder_scope NOT NULL DEFAULT 'campus',
    campus_id UUID REFERENCES campuses(id),
    description TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_cohorts_campus ON founder_cohorts(campus_id);

-- Founder memberships
CREATE TABLE IF NOT EXISTS founder_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cohort_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_founder_memberships_cohort ON founder_memberships(cohort_id);
CREATE INDEX IF NOT EXISTS idx_founder_memberships_user ON founder_memberships(user_id);
