-- ============================================================================
-- Migration 0002: Add Missing Tables + RLS
-- Tables referenced in service code but missing from schema
-- ============================================================================

BEGIN;

DO $$
BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL,
    -- email, phone, whatsapp
    value TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS identity_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    -- student_id, national_id, passport
    document_url TEXT NOT NULL,
    status verification_status NOT NULL DEFAULT 'pending',
    -- pending, approved, rejected
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
    slug TEXT NOT NULL UNIQUE CHECK (length(trim(slug)) > 0),
    description TEXT,
    icon_url TEXT CHECK (
        icon_url IS NULL
        OR length(trim(icon_url)) > 0
    ),
    category TEXT CHECK (
        category IS NULL
        OR length(trim(category)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neighborhood_landmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    landmark_type TEXT CHECK (
        landmark_type IS NULL
        OR length(trim(landmark_type)) > 0
    ),
    location_lat NUMERIC(9, 6) CHECK (
        location_lat BETWEEN -90
        AND 90
    ),
    location_lng NUMERIC(9, 6) CHECK (
        location_lng BETWEEN -180
        AND 180
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_neighborhood_landmarks_neighborhood_id ON neighborhood_landmarks(neighborhood_id);

CREATE TABLE IF NOT EXISTS neighborhood_campus_distances (
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    distance_km NUMERIC(8, 2) NOT NULL CHECK (distance_km >= 0),
    walking_time_min INTEGER CHECK (
        walking_time_min IS NULL
        OR walking_time_min >= 0
    ),
    transport_time_min INTEGER CHECK (
        transport_time_min IS NULL
        OR transport_time_min >= 0
    ),
    transport_cost NUMERIC CHECK (
        transport_cost IS NULL
        OR transport_cost >= 0
    ),
    PRIMARY KEY (neighborhood_id, campus_id)
);

CREATE TABLE IF NOT EXISTS discussion_votes (
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (discussion_id, user_id)
);

CREATE TABLE IF NOT EXISTS academic_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_level TEXT,
    -- certificate, diploma, bachelors, masters, phd
    duration_years NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (length(trim(event_type)) > 0),
    -- review_created, report_submitted, discussion_helpful, verification_accurate, spam_flagged, etc.
    points INTEGER NOT NULL,
    reason TEXT CHECK (
        reason IS NULL
        OR length(trim(reason)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reputation_events_user_id ON reputation_events(user_id);

CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (length(trim(entity_type)) > 0),
    -- property, user, business, owner, scout
    verification_level verification_level NOT NULL DEFAULT 'claimed',
    verifier_id UUID REFERENCES profiles(id),
    status verification_status NOT NULL DEFAULT 'pending',
    -- pending, approved, rejected, expired
    notes TEXT CHECK (
        notes IS NULL
        OR length(trim(notes)) > 0
    ),
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_records_entity ON verification_records(entity_id, entity_type);

CREATE INDEX idx_verification_records_verifier_id ON verification_records(verifier_id);

CREATE TABLE IF NOT EXISTS verification_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (length(trim(evidence_type)) > 0),
    -- photo, document, video, geolocation
    url TEXT NOT NULL CHECK (length(trim(url)) > 0),
    description TEXT CHECK (
        description IS NULL
        OR length(trim(description)) > 0
    ),
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_evidence_verification_id ON verification_evidence(verification_id);

CREATE INDEX idx_verification_evidence_uploaded_by ON verification_evidence(uploaded_by);

CREATE TABLE IF NOT EXISTS user_badges (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_reason TEXT CHECK (
        granted_reason IS NULL
        OR length(trim(granted_reason)) > 0
    ),
    PRIMARY KEY (user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS neighborhood_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (
        rating BETWEEN 1
        AND 5
    ),
    content TEXT CHECK (
        content IS NULL
        OR length(trim(content)) > 0
    ),
    safety_rating INTEGER CHECK (
        safety_rating BETWEEN 1
        AND 5
    ),
    transport_rating INTEGER CHECK (
        transport_rating BETWEEN 1
        AND 5
    ),
    amenities_rating INTEGER CHECK (
        amenities_rating BETWEEN 1
        AND 5
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_neighborhood_reviews_neighborhood_id ON neighborhood_reviews(neighborhood_id);

CREATE INDEX idx_neighborhood_reviews_user_id ON neighborhood_reviews(user_id);

CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    category TEXT CHECK (
        category IS NULL
        OR length(trim(category)) > 0
    ),
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tips_campus_id ON tips(campus_id);

CREATE INDEX idx_tips_neighborhood_id ON tips(neighborhood_id);

CREATE INDEX idx_tips_user_id ON tips(user_id);

CREATE TABLE IF NOT EXISTS warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    property_id UUID REFERENCES properties(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (length(trim(severity)) > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warnings_campus_id ON warnings(campus_id);

CREATE INDEX idx_warnings_neighborhood_id ON warnings(neighborhood_id);

CREATE INDEX idx_warnings_property_id ON warnings(property_id);

CREATE INDEX idx_warnings_user_id ON warnings(user_id);

CREATE TABLE IF NOT EXISTS knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id),
    campus_id UUID REFERENCES campuses(id),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    category TEXT CHECK (
        category IS NULL
        OR length(trim(category)) > 0
    ),
    tags TEXT [],
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_articles_author_id ON knowledge_articles(author_id);

CREATE INDEX idx_knowledge_articles_campus_id ON knowledge_articles(campus_id);

CREATE TABLE IF NOT EXISTS hygiene_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name = lower(trim(name))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hygiene_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    category_id UUID NOT NULL REFERENCES hygiene_categories(id),
    score INTEGER NOT NULL CHECK (
        score BETWEEN 1
        AND 5
    ),
    comment TEXT CHECK (
        comment IS NULL
        OR length(trim(comment)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hygiene_reports_property_id ON hygiene_reports(property_id);

CREATE INDEX idx_hygiene_reports_user_id ON hygiene_reports(user_id);

CREATE INDEX idx_hygiene_reports_category_id ON hygiene_reports(category_id);

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

CREATE INDEX idx_utility_incidents_property_id ON utility_incidents(property_id);

CREATE INDEX idx_utility_incidents_utility_type_id ON utility_incidents(utility_type_id);

CREATE INDEX idx_utility_incidents_reported_by ON utility_incidents(reported_by);

CREATE TABLE IF NOT EXISTS property_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES profiles(id),
    status claim_status NOT NULL DEFAULT 'pending',
    -- Supporting evidence
    evidence_urls TEXT [],
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_claims_property_id ON property_claims(property_id);

CREATE INDEX idx_property_claims_claimant_id ON property_claims(claimant_id);

CREATE INDEX idx_property_claims_reviewed_by ON property_claims(reviewed_by);

CREATE TABLE IF NOT EXISTS property_review_votes (
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (review_id, user_id)
);

CREATE TABLE IF NOT EXISTS property_review_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    flagged_by UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (length(trim(status)) > 0),
    reviewed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_review_flags_review_id ON property_review_flags(review_id);

CREATE INDEX idx_property_review_flags_flagged_by ON property_review_flags(flagged_by);

CREATE INDEX idx_property_review_flags_reviewed_by ON property_review_flags(reviewed_by);

-- ============================================================================
-- Enable Row Level Security on new tables
-- Restrictive policies are defined in migration 0009_harden_rls_policies.sql
-- ============================================================================

ALTER TABLE IF EXISTS public.contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.neighborhood_landmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.neighborhood_campus_distances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.discussion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reputation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.verification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.neighborhood_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hygiene_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hygiene_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.utility_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.property_review_flags ENABLE ROW LEVEL SECURITY;



COMMIT;
