-- ============================================================================
-- CAMPOZY DATABASE SCHEMA v3 — Complete Implementation
-- Based on: 09_DATABASE_SCHEMA.md + all 23 specification documents
-- ============================================================================
-- This migration creates the complete Campozy data model.
-- Run against a fresh Supabase project (PostgreSQL 15+).
-- ============================================================================
-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "vector";

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name = lower(trim(name))),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
    iso_code CHAR(2) NOT NULL UNIQUE CHECK (iso_code = upper(iso_code)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, name)
);

CREATE INDEX idx_cities_country ON cities(country_id);

CREATE TABLE property_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name = lower(trim(name))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE amenity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name = lower(trim(name))),
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE utility_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name = lower(trim(name))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hygiene_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (name = lower(trim(name))),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
    -- Machine-readable values:
    -- housing
    -- campus_life
    -- safety
    -- utilities
    -- opportunities
    -- general
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE verification_level AS ENUM (
    'unverified',
    'claimed',
    'community_verified',
    'scout_verified',
    'campozy_verified'
);

CREATE TYPE trust_level AS ENUM (
    'new',
    'member',
    'contributor',
    'trusted_contributor',
    'campus_expert',
    'community_leader',
    'campozy_fellow'
);

CREATE TYPE founder_scope AS ENUM ('campus', 'country', 'global');

CREATE TYPE opportunity_type AS ENUM (
    'internship',
    'attachment',
    'scholarship',
    'fellowship',
    'competition',
    'graduate_trainee',
    'mentorship',
    'ambassador_program',
    'employer_partnership'
);

CREATE TYPE notification_type AS ENUM (
    'review',
    'verification',
    'opportunity',
    'message',
    'founder',
    'system',
    'alert',
    'utility_report'
);

CREATE TYPE moderation_action_type AS ENUM (
    'warning',
    'content_removal',
    'temporary_restriction',
    'suspension',
    'permanent_ban'
);

CREATE TYPE verification_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);

CREATE TYPE claim_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE moderation_status AS ENUM (
    'open',
    'investigating',
    'resolved',
    'dismissed'
);

CREATE TYPE appeal_status AS ENUM (
    'pending',
    'reviewing',
    'upheld',
    'overturned'
);

CREATE TYPE application_status AS ENUM (
    'applied',
    'reviewed',
    'shortlisted',
    'accepted',
    'rejected'
);

CREATE TYPE mentorship_status AS ENUM (
    'active',
    'paused',
    'completed'
);

CREATE TYPE assignment_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
);

-- ============================================================================
-- IDENTITY DOMAIN
-- ============================================================================
-- Note: In Supabase, `auth.users` is the primary identity table.
-- `public.profiles` extends it with app-specific data.
-- We do NOT create a `public.users` table — profiles reference auth.users(id) directly.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE CHECK (
        username IS NULL
        OR length(trim(username)) > 0
    ),
    full_name TEXT CHECK (
        full_name IS NULL
        OR length(trim(full_name)) > 0
    ),
    avatar_url TEXT CHECK (
        avatar_url IS NULL
        OR length(trim(avatar_url)) > 0
    ),
    bio TEXT CHECK (
        bio IS NULL
        OR length(trim(bio)) > 0
    ),
    phone_number TEXT CHECK (
        phone_number IS NULL
        OR length(trim(phone_number)) > 0
    ),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    trust_level trust_level NOT NULL DEFAULT 'new',
    reputation_score NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (reputation_score >= 0),
    contribution_score NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (contribution_score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE contact_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL,
    -- email, phone, whatsapp
    value TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE identity_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    -- student_id, national_id, passport
    document_url TEXT NOT NULL,
    status verification_status NOT NULL DEFAULT 'pending' -- pending, approved, rejected
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EDUCATION DOMAIN
-- ============================================================================
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    -- e.g. UON, KU, JKUAT
    short_name TEXT CHECK (
        short_name IS NULL
        OR length(trim(short_name)) > 0
    ),
    website TEXT CHECK (
        website IS NULL
        OR length(trim(website)) > 0
    ),
    logo_url TEXT CHECK (
        logo_url IS NULL
        OR length(trim(logo_url)) > 0
    ),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (country_id, name)
);

CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    location_lat NUMERIC(9, 6) CHECK (
        location_lat BETWEEN -90
        AND 90
    ),
    location_lng NUMERIC(9, 6) CHECK (
        location_lng BETWEEN -180
        AND 180
    ),
    address TEXT CHECK (
        address IS NULL
        OR length(trim(address)) > 0
    ),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (university_id, name)
);

CREATE TABLE academic_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_level TEXT,
    -- certificate, diploma, bachelors, masters, phd
    duration_years NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STUDENT DOMAIN
-- ============================================================================
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id),
    program_id UUID REFERENCES academic_programs(id),
    year_of_study INTEGER CHECK (
        year_of_study IS NULL
        OR year_of_study BETWEEN 1
        AND 12
    ),
    enrollment_year INTEGER CHECK (
        enrollment_year IS NULL
        OR enrollment_year BETWEEN 1900
        AND 2100
    ),
    expected_graduation_year INTEGER CHECK (
        expected_graduation_year IS NULL
        OR expected_graduation_year BETWEEN 1900
        AND 2100
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_campus_id ON students(campus_id);

CREATE INDEX idx_students_program_id ON students(program_id);

CREATE TABLE student_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    max_budget NUMERIC CHECK (
        max_budget IS NULL
        OR max_budget >= 0
    ),
    currency TEXT NOT NULL DEFAULT 'KES',
    preferred_property_types TEXT [],
    preferred_amenities TEXT [],
    max_distance_km NUMERIC CHECK (
        max_distance_km IS NULL
        OR max_distance_km >= 0
    ),
    priority_utilities TEXT [],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_preferences_student_id ON student_preferences(student_id);

CREATE TABLE student_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL CHECK (length(trim(from_stage)) > 0),
    to_stage TEXT NOT NULL CHECK (length(trim(to_stage)) > 0),
    transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_lifecycle_history_student_id ON student_lifecycle_history(student_id);

CREATE INDEX idx_student_lifecycle_history_transitioned_at ON student_lifecycle_history(transitioned_at);

-- ============================================================================
-- GEOGRAPHY DOMAIN
-- ============================================================================
CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    safety_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (
        safety_score BETWEEN 0
        AND 100
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (city_id, name)
);

CREATE TABLE neighborhood_landmarks (
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

CREATE TABLE neighborhood_campus_distances (
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

-- ============================================================================
-- HOUSING DOMAIN
-- ============================================================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    address TEXT NOT NULL CHECK (length(trim(address)) > 0),
    description TEXT,
    property_type_id UUID REFERENCES property_types(id),
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    campozy_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (
        campozy_score BETWEEN 0
        AND 100
    ),
    location_lat NUMERIC(9, 6) CHECK (
        location_lat BETWEEN -90
        AND 90
    ),
    location_lng NUMERIC(9, 6) CHECK (
        location_lng BETWEEN -180
        AND 180
    ),
    total_rooms INTEGER CHECK (
        total_rooms IS NULL
        OR total_rooms >= 0
    ),
    floors INTEGER CHECK (
        floors IS NULL
        OR floors >= 0
    ),
    year_built INTEGER CHECK (
        year_built IS NULL
        OR year_built BETWEEN 1900
        AND EXTRACT(
            YEAR
            FROM
                CURRENT_DATE
        ) :: INTEGER + 2
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_neighborhood_id ON properties(neighborhood_id);

CREATE INDEX idx_properties_owner_id ON properties(owner_id);

CREATE INDEX idx_properties_property_type_id ON properties(property_type_id);

CREATE TABLE property_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL CHECK (length(trim(room_type)) > 0),
    price_per_semester NUMERIC CHECK (
        price_per_semester IS NULL
        OR price_per_semester >= 0
    ),
    price_per_month NUMERIC CHECK (
        price_per_month IS NULL
        OR price_per_month >= 0
    ),
    currency TEXT NOT NULL DEFAULT 'KES',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity > 0),
    floor_number INTEGER CHECK (
        floor_number IS NULL
        OR floor_number >= 0
    ),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_rooms_property_id ON property_rooms(property_id);

CREATE TABLE property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (length(trim(url)) > 0),
    media_type TEXT NOT NULL CHECK (length(trim(media_type)) > 0),
    -- image, video, virtual_tour
    caption TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_media_property_id ON property_media(property_id);

CREATE INDEX idx_property_media_uploaded_by ON property_media(uploaded_by);

CREATE TABLE property_amenities (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_type_id UUID NOT NULL REFERENCES amenity_types(id) ON DELETE CASCADE,
    notes TEXT CHECK (
        notes IS NULL
        OR length(trim(notes)) > 0
    ),
    PRIMARY KEY (property_id, amenity_type_id)
);

CREATE TABLE property_claims (
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

-- ============================================================================
-- UTILITY DOMAIN
-- ============================================================================
CREATE TABLE property_utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    reliability_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (
        reliability_score BETWEEN 0
        AND 100
    ),
    report_count INTEGER NOT NULL DEFAULT 0 CHECK (report_count >= 0),
    last_reported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (property_id, utility_type_id)
);

CREATE INDEX idx_property_utilities_utility_type_id ON property_utilities(utility_type_id);

CREATE TABLE utility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    reliability_rating INTEGER CHECK (
        reliability_rating BETWEEN 1
        AND 5
    ),
    hours_available_per_day NUMERIC CHECK (
        hours_available_per_day IS NULL
        OR hours_available_per_day BETWEEN 0
        AND 24
    ),
    comment TEXT CHECK (
        comment IS NULL
        OR length(trim(comment)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_utility_reports_property_id ON utility_reports(property_id);

CREATE INDEX idx_utility_reports_utility_type_id ON utility_reports(utility_type_id);

CREATE INDEX idx_utility_reports_user_id ON utility_reports(user_id);

CREATE TABLE utility_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    reported_by UUID NOT NULL REFERENCES profiles(id),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (length(trim(severity)) > 0),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_utility_incidents_property_id ON utility_incidents(property_id);

CREATE INDEX idx_utility_incidents_utility_type_id ON utility_incidents(utility_type_id);

CREATE INDEX idx_utility_incidents_reported_by ON utility_incidents(reported_by);

-- ============================================================================
-- HYGIENE DOMAIN
-- ============================================================================
CREATE TABLE hygiene_reports (
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

CREATE TABLE hygiene_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES hygiene_reports(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (length(trim(url)) > 0),
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (length(trim(media_type)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hygiene_media_report_id ON hygiene_media(report_id);

-- ============================================================================
-- REVIEW DOMAIN
-- ============================================================================
CREATE TABLE property_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    overall_rating INTEGER NOT NULL CHECK (
        overall_rating BETWEEN 1
        AND 5
    ),
    content TEXT CHECK (
        content IS NULL
        OR length(trim(content)) > 0
    ),
    -- Campozy Score dimensions
    safety_rating INTEGER CHECK (
        safety_rating BETWEEN 1
        AND 5
    ),
    hygiene_rating INTEGER CHECK (
        hygiene_rating BETWEEN 1
        AND 5
    ),
    water_rating INTEGER CHECK (
        water_rating BETWEEN 1
        AND 5
    ),
    electricity_rating INTEGER CHECK (
        electricity_rating BETWEEN 1
        AND 5
    ),
    internet_rating INTEGER CHECK (
        internet_rating BETWEEN 1
        AND 5
    ),
    management_rating INTEGER CHECK (
        management_rating BETWEEN 1
        AND 5
    ),
    accessibility_rating INTEGER CHECK (
        accessibility_rating BETWEEN 1
        AND 5
    ),
    value_for_money_rating INTEGER CHECK (
        value_for_money_rating BETWEEN 1
        AND 5
    ),
    is_verified_stay BOOLEAN NOT NULL DEFAULT FALSE,
    stay_duration_months INTEGER CHECK (
        stay_duration_months IS NULL
        OR stay_duration_months >= 0
    ),
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (property_id, user_id)
);

CREATE TABLE property_review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (length(trim(url)) > 0),
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (length(trim(media_type)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_review_media_review_id ON property_review_media(review_id);

CREATE TABLE property_review_votes (
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (review_id, user_id)
);

CREATE TABLE property_review_flags (
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

CREATE TABLE neighborhood_reviews (
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

-- ============================================================================
-- TRUST & REPUTATION DOMAIN
-- ============================================================================
CREATE TABLE reputation_events (
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

CREATE TABLE badges (
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

CREATE TABLE user_badges (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_reason TEXT CHECK (
        granted_reason IS NULL
        OR length(trim(granted_reason)) > 0
    ),
    PRIMARY KEY (user_id, badge_id)
);

-- ============================================================================
-- VERIFICATION DOMAIN
-- ============================================================================
CREATE TABLE verification_records (
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

CREATE TABLE verification_evidence (
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

-- ============================================================================
-- COMMUNITY DOMAIN
-- ============================================================================
CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    category_id UUID REFERENCES discussion_categories(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    tags TEXT [],
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussions_campus_id ON discussions(campus_id);

CREATE INDEX idx_discussions_neighborhood_id ON discussions(neighborhood_id);

CREATE INDEX idx_discussions_category_id ON discussions(category_id);

CREATE INDEX idx_discussions_user_id ON discussions(user_id);

CREATE TABLE discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    parent_reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);

CREATE INDEX idx_discussion_replies_user_id ON discussion_replies(user_id);

CREATE INDEX idx_discussion_replies_parent_reply_id ON discussion_replies(parent_reply_id);

CREATE TABLE discussion_votes (
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (discussion_id, user_id)
);

CREATE TABLE tips (
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

CREATE TABLE warnings (
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

CREATE TABLE knowledge_articles (
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

-- ============================================================================
-- MESSAGING DOMAIN
-- ============================================================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT CHECK (
        subject IS NULL
        OR length(trim(subject)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_members (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (length(trim(url)) > 0),
    file_type TEXT CHECK (
        file_type IS NULL
        OR length(trim(file_type)) > 0
    ),
    file_name TEXT CHECK (
        file_name IS NULL
        OR length(trim(file_name)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);

-- ============================================================================
-- BUSINESS DOMAIN
-- ============================================================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    category TEXT CHECK (
        category IS NULL
        OR length(trim(category)) > 0
    ),
    -- food, transport, printing, laundry, electronics, bookshop
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    campozy_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (
        campozy_score BETWEEN 0
        AND 100
    ),
    location_lat NUMERIC(9, 6) CHECK (
        location_lat BETWEEN -90
        AND 90
    ),
    location_lng NUMERIC(9, 6) CHECK (
        location_lng BETWEEN -180
        AND 180
    ),
    address TEXT CHECK (
        address IS NULL
        OR length(trim(address)) > 0
    ),
    phone TEXT CHECK (
        phone IS NULL
        OR length(trim(phone)) > 0
    ),
    website TEXT CHECK (
        website IS NULL
        OR length(trim(website)) > 0
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);

CREATE INDEX idx_businesses_neighborhood_id ON businesses(neighborhood_id);

CREATE TABLE business_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK (length(trim(url)) > 0),
    media_type TEXT NOT NULL DEFAULT 'image' CHECK (length(trim(media_type)) > 0),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_media_business_id ON business_media(business_id);

CREATE TABLE business_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER NOT NULL CHECK (
        rating BETWEEN 1
        AND 5
    ),
    content TEXT CHECK (
        content IS NULL
        OR length(trim(content)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_business_reviews_business_id ON business_reviews(business_id);

CREATE INDEX idx_business_reviews_user_id ON business_reviews(user_id);

-- ============================================================================
-- PARENT DOMAIN
-- ============================================================================
CREATE TABLE parent_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'parent' CHECK (length(trim(relationship)) > 0),
    -- parent, guardian
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parent_student_links (
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (length(trim(status)) > 0),
    -- pending, confirmed, rejected
    confirmed_at TIMESTAMPTZ,
    PRIMARY KEY (parent_id, student_id)
);

CREATE TABLE parent_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (length(trim(alert_type)) > 0),
    -- safety, utility_outage, verification_update
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT CHECK (
        content IS NULL
        OR length(trim(content)) > 0
    ),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parent_alerts_parent_id ON parent_alerts(parent_id);

-- ============================================================================
-- FOUNDER DOMAIN
-- ============================================================================
CREATE TABLE founder_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    -- e.g. "Founding 50 UON", "Founding 100 Kenya", "Global Pioneer 100"
    scope founder_scope NOT NULL,
    scope_entity_id UUID,
    -- campus_id for campus, country_id for country, NULL for global
    max_members INTEGER NOT NULL CHECK (max_members > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE founder_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id) ON DELETE CASCADE,
    contribution_score NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (contribution_score >= 0),
    qualified_at TIMESTAMPTZ,
    became_founder_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, cohort_id)
);

CREATE INDEX idx_founder_memberships_user_id ON founder_memberships(user_id);

CREATE INDEX idx_founder_memberships_cohort_id ON founder_memberships(cohort_id);

CREATE TABLE founder_qualification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id),
    event_type TEXT NOT NULL CHECK (length(trim(event_type)) > 0),
    -- review, report, discussion, verification, referral, mentorship
    points INTEGER NOT NULL,
    description TEXT CHECK (
        description IS NULL
        OR length(trim(description)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_founder_qualification_events_user_id ON founder_qualification_events(user_id);

CREATE INDEX idx_founder_qualification_events_cohort_id ON founder_qualification_events(cohort_id);

-- ============================================================================
-- AMBASSADOR DOMAIN
-- ============================================================================
CREATE TABLE ambassador_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambassador_programs_campus_id ON ambassador_programs(campus_id);

CREATE TABLE ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES ambassador_programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (length(trim(status)) > 0),
    -- active, paused, completed
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, program_id)
);

CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);

CREATE INDEX idx_ambassadors_program_id ON ambassadors(program_id);

CREATE TABLE ambassador_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK (length(trim(task_type)) > 0),
    -- recruit_contributors, identify_founders, promote_discussions
    description TEXT CHECK (
        description IS NULL
        OR length(trim(description)) > 0
    ),
    status assignment_status NOT NULL DEFAULT 'assigned',
    -- assigned, in_progress, completed
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambassador_assignments_ambassador_id ON ambassador_assignments(ambassador_id);

-- ============================================================================
-- SCOUT DOMAIN
-- ============================================================================
CREATE TABLE scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    region_id UUID REFERENCES cities(id),
    certification_level TEXT NOT NULL DEFAULT 'trainee' CHECK (length(trim(certification_level)) > 0),
    -- trainee, certified, senior, lead
    reputation_score NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (reputation_score >= 0),
    total_verifications INTEGER NOT NULL DEFAULT 0 CHECK (total_verifications >= 0),
    accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (
        accuracy_rate BETWEEN 0
        AND 100
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE INDEX idx_scouts_region_id ON scouts(region_id);

CREATE TABLE scout_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id),
    assignment_type TEXT NOT NULL DEFAULT 'verification' CHECK (length(trim(assignment_type)) > 0),
    -- verification, audit, investigation
    status assignment_status NOT NULL DEFAULT 'assigned',
    -- assigned, in_progress, completed, cancelled
    priority TEXT NOT NULL DEFAULT 'standard' CHECK (length(trim(priority)) > 0),
    -- standard, high, urgent
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scout_assignments_scout_id ON scout_assignments(scout_id);

CREATE INDEX idx_scout_assignments_property_id ON scout_assignments(property_id);

CREATE TABLE scout_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES scout_assignments(id) ON DELETE CASCADE,
    scout_id UUID NOT NULL REFERENCES scouts(id),
    findings TEXT NOT NULL CHECK (length(trim(findings)) > 0),
    recommendation TEXT CHECK (
        recommendation IS NULL
        OR length(trim(recommendation)) > 0
    ),
    -- verify, reject, needs_more_info
    evidence_urls TEXT [],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scout_reports_assignment_id ON scout_reports(assignment_id);

CREATE INDEX idx_scout_reports_scout_id ON scout_reports(scout_id);

CREATE TABLE scout_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id),
    report_id UUID NOT NULL REFERENCES scout_reports(id),
    auditor_id UUID NOT NULL REFERENCES profiles(id),
    outcome TEXT NOT NULL CHECK (length(trim(outcome)) > 0),
    -- accurate, inaccurate, partially_accurate
    notes TEXT CHECK (
        notes IS NULL
        OR length(trim(notes)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scout_audits_scout_id ON scout_audits(scout_id);

CREATE INDEX idx_scout_audits_report_id ON scout_audits(report_id);

CREATE INDEX idx_scout_audits_auditor_id ON scout_audits(auditor_id);

-- ============================================================================
-- OPPORTUNITY DOMAIN
-- ============================================================================
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    website TEXT CHECK (
        website IS NULL
        OR length(trim(website)) > 0
    ),
    logo_url TEXT CHECK (
        logo_url IS NULL
        OR length(trim(logo_url)) > 0
    ),
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    contact_user_id UUID REFERENCES profiles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employers_contact_user_id ON employers(contact_user_id);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id),
    creator_id UUID NOT NULL REFERENCES profiles(id),
    type opportunity_type NOT NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    requirements JSONB NOT NULL DEFAULT '[]',
    location TEXT CHECK (
        location IS NULL
        OR length(trim(location)) > 0
    ),
    is_remote BOOLEAN NOT NULL DEFAULT FALSE,
    compensation TEXT CHECK (
        compensation IS NULL
        OR length(trim(compensation)) > 0
    ),
    application_url TEXT CHECK (
        application_url IS NULL
        OR length(trim(application_url)) > 0
    ),
    deadline TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_opportunities_employer_id ON opportunities(employer_id);

CREATE INDEX idx_opportunities_creator_id ON opportunities(creator_id);

CREATE TABLE opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    status application_status NOT NULL DEFAULT 'applied',
    -- applied, reviewed, shortlisted, accepted, rejected
    cover_note TEXT CHECK (
        cover_note IS NULL
        OR length(trim(cover_note)) > 0
    ),
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (opportunity_id, student_id)
);

CREATE TABLE mentorship_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expertise TEXT [],
    bio TEXT CHECK (
        bio IS NULL
        OR length(trim(bio)) > 0
    ),
    max_mentees INTEGER NOT NULL DEFAULT 3 CHECK (max_mentees > 0),
    is_accepting BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE TABLE mentorship_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES mentorship_profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status mentorship_status NOT NULL DEFAULT 'active',
    -- active, paused, completed
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    UNIQUE (mentor_id, mentee_id)
);

-- ============================================================================
-- ALUMNI DOMAIN
-- ============================================================================
CREATE TABLE alumni_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id),
    graduation_year INTEGER CHECK (
        graduation_year IS NULL
        OR graduation_year BETWEEN 1900
        AND 2100
    ),
    degree TEXT CHECK (
        degree IS NULL
        OR length(trim(degree)) > 0
    ),
    current_position TEXT CHECK (
        current_position IS NULL
        OR length(trim(current_position)) > 0
    ),
    current_company TEXT CHECK (
        current_company IS NULL
        OR length(trim(current_company)) > 0
    ),
    is_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    is_employer BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alumni_profiles_university_id ON alumni_profiles(university_id);

-- ============================================================================
-- RECOMMENDATION DOMAIN
-- ============================================================================
CREATE TABLE recommendation_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preference_vector vector(64),
    behavior_vector vector(64),
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

CREATE TABLE recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (length(trim(entity_type)) > 0),
    -- property, business, opportunity, neighborhood
    action TEXT NOT NULL CHECK (length(trim(action)) > 0),
    -- viewed, saved, dismissed, clicked, applied
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);

CREATE INDEX idx_recommendation_feedback_entity ON recommendation_feedback(entity_id, entity_type);

CREATE INDEX idx_recommendation_feedback_action ON recommendation_feedback(action);

-- ============================================================================
-- SAVED & PREFERENCE DOMAIN
-- ============================================================================
CREATE TABLE saved_properties (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT CHECK (
        notes IS NULL
        OR length(trim(notes)) > 0
    ),
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

CREATE TABLE saved_businesses (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, business_id)
);

CREATE TABLE saved_opportunities (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, opportunity_id)
);

-- ============================================================================
-- AKWET TRANSITION DOMAIN
-- ============================================================================
CREATE TABLE transition_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_city_id UUID REFERENCES cities(id),
    target_move_date DATE,
    budget_range_min NUMERIC CHECK (
        budget_range_min IS NULL
        OR budget_range_min >= 0
    ),
    budget_range_max NUMERIC CHECK (
        budget_range_max IS NULL
        OR budget_range_max >= 0
    ),
    housing_type_preference TEXT [],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (
        budget_range_min IS NULL
        OR budget_range_max IS NULL
        OR budget_range_max >= budget_range_min
    )
);

CREATE INDEX idx_transition_profiles_target_city_id ON transition_profiles(target_city_id);

-- ============================================================================
-- EVENT DOMAIN — Event-Driven Architecture
-- ============================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL CHECK (length(trim(event_type)) > 0),
    target_id UUID,
    target_type TEXT CHECK (
        target_type IS NULL
        OR length(trim(target_type)) > 0
    ),
    -- property, review, discussion, opportunity, user
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_actor ON events(actor_id);

CREATE INDEX idx_events_type ON events(event_type);

CREATE INDEX idx_events_target ON events(target_id, target_type);

CREATE INDEX idx_events_created ON events(created_at DESC);

-- ============================================================================
-- NOTIFICATION DOMAIN
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    content TEXT CHECK (
        content IS NULL
        OR length(trim(content)) > 0
    ),
    link TEXT CHECK (
        link IS NULL
        OR length(trim(link)) > 0
    ),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    email_reviews BOOLEAN NOT NULL DEFAULT TRUE,
    email_opportunities BOOLEAN NOT NULL DEFAULT TRUE,
    email_messages BOOLEAN NOT NULL DEFAULT TRUE,
    email_founder BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- GROWTH & REFERRAL DOMAIN
-- ============================================================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    referred_email TEXT NOT NULL CHECK (length(trim(referred_email)) > 0),
    referred_user_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (length(trim(status)) > 0),
    -- pending, registered, qualified
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);

CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);

CREATE TABLE invitation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (length(trim(code)) > 0),
    creator_id UUID NOT NULL REFERENCES profiles(id),
    max_uses INTEGER NOT NULL DEFAULT 10 CHECK (max_uses > 0),
    current_uses INTEGER NOT NULL DEFAULT 0 CHECK (current_uses >= 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_codes_creator_id ON invitation_codes(creator_id);

CREATE TABLE waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL CHECK (length(trim(email)) > 0),
    campus_id UUID REFERENCES campuses(id),
    country_id UUID REFERENCES countries(id),
    source TEXT CHECK (
        source IS NULL
        OR length(trim(source)) > 0
    ),
    -- organic, referral, social
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_waitlists_campus_id ON waitlists(campus_id);

CREATE INDEX idx_waitlists_country_id ON waitlists(country_id);

-- ============================================================================
-- AUDIT & GOVERNANCE DOMAIN
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (length(trim(action)) > 0),
    entity_type TEXT NOT NULL CHECK (length(trim(entity_type)) > 0),
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE TABLE moderation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID REFERENCES profiles(id),
    target_user_id UUID REFERENCES profiles(id),
    target_entity_id UUID,
    target_entity_type TEXT CHECK (
        target_entity_type IS NULL
        OR length(trim(target_entity_type)) > 0
    ),
    -- review, discussion, message, property, business
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
    description TEXT CHECK (
        description IS NULL
        OR length(trim(description)) > 0
    ),
    priority TEXT NOT NULL DEFAULT 'standard' CHECK (length(trim(priority)) > 0),
    -- critical, high, standard, routine
    status moderation_status NOT NULL DEFAULT 'open',
    -- open, investigating, resolved, dismissed
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_moderation_cases_reported_by ON moderation_cases(reported_by);

CREATE INDEX idx_moderation_cases_target_user_id ON moderation_cases(target_user_id);

CREATE INDEX idx_moderation_cases_status ON moderation_cases(status);

CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES moderation_cases(id) ON DELETE CASCADE,
    action_type moderation_action_type NOT NULL,
    moderator_id UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
    expires_at TIMESTAMPTZ,
    -- for temporary restrictions
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_case_id ON moderation_actions(case_id);

CREATE INDEX idx_moderation_actions_moderator_id ON moderation_actions(moderator_id);

CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES moderation_actions(id),
    appellant_id UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
    status appeal_status NOT NULL DEFAULT 'pending',
    -- pending, reviewing, upheld, overturned
    reviewer_id UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appeals_action_id ON appeals(action_id);

CREATE INDEX idx_appeals_appellant_id ON appeals(appellant_id);

CREATE INDEX idx_appeals_status ON appeals(status);

-- ============================================================================
-- ANALYTICS DOMAIN
-- ============================================================================
CREATE TABLE property_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),
    save_count INTEGER NOT NULL DEFAULT 0 CHECK (save_count >= 0),
    inquiry_count INTEGER NOT NULL DEFAULT 0 CHECK (inquiry_count >= 0),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    avg_rating NUMERIC(3, 2) CHECK (
        avg_rating IS NULL
        OR avg_rating BETWEEN 1
        AND 5
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, period_start),
    CHECK (period_end >= period_start)
);

CREATE INDEX idx_property_analytics_property_id ON property_analytics(property_id);

CREATE TABLE campus_intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    active_properties INTEGER NOT NULL DEFAULT 0 CHECK (active_properties >= 0),
    avg_campozy_score NUMERIC(5, 2) CHECK (
        avg_campozy_score IS NULL
        OR avg_campozy_score BETWEEN 0
        AND 100
    ),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    discussion_count INTEGER NOT NULL DEFAULT 0 CHECK (discussion_count >= 0),
    contributor_count INTEGER NOT NULL DEFAULT 0 CHECK (contributor_count >= 0),
    founder_count INTEGER NOT NULL DEFAULT 0 CHECK (founder_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campus_id, period_start),
    CHECK (period_end >= period_start)
);

CREATE INDEX idx_campus_intelligence_reports_campus_id ON campus_intelligence_reports(campus_id);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Properties
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);

CREATE INDEX idx_properties_owner ON properties(owner_id);

CREATE INDEX idx_properties_score ON properties(campozy_score DESC);

CREATE INDEX idx_properties_active ON properties(is_active)
WHERE
    is_active = TRUE;

-- Reviews
CREATE INDEX idx_reviews_property ON property_reviews(property_id);

CREATE INDEX idx_reviews_user ON property_reviews(user_id);

CREATE INDEX idx_reviews_created ON property_reviews(created_at DESC);

-- Discussions
CREATE INDEX idx_discussions_campus ON discussions(campus_id);

CREATE INDEX idx_discussions_created ON discussions(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
WHERE
    is_read = FALSE;

-- Search support
CREATE INDEX idx_properties_name_trgm ON properties USING gin (name gin_trgm_ops);

CREATE INDEX idx_discussions_title_trgm ON discussions USING gin (title gin_trgm_ops);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Profiles
ALTER TABLE
    profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read" ON profiles FOR
SELECT
    TO authenticated USING (true);

CREATE POLICY "users_create_own_profile" ON profiles FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON profiles FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Students
ALTER TABLE
    students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_view_own_profile" ON students FOR
SELECT
    TO authenticated USING (auth.uid() = id);

CREATE POLICY "students_create_own_profile" ON students FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "students_update_own_profile" ON students FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Student_preferences
ALTER TABLE
    student_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_view_own_preferences" ON student_preferences FOR
SELECT
    TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "students_create_own_preferences" ON student_preferences FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY "students_update_own_preferences" ON student_preferences FOR
UPDATE
    TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

-- Student_lifecyle_history
ALTER TABLE
    student_lifecycle_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_view_own_lifecycle_history" ON student_lifecycle_history FOR
SELECT
    TO authenticated USING (auth.uid() = student_id);

-- Parent_profiles
ALTER TABLE
    parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_view_own_profile" ON parent_profiles FOR
SELECT
    TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_create_own_parent_profile" ON parent_profiles FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "parents_update_own_profile" ON parent_profiles FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Parent_student_links
ALTER TABLE
    parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_view_student_links" ON parent_student_links FOR
SELECT
    TO authenticated USING (
        auth.uid() = parent_id
        OR auth.uid() = student_id
    );

CREATE POLICY "parents_create_student_links" ON parent_student_links FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = parent_id);

-- Parent_alerts
ALTER TABLE
    parent_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parents_view_own_alerts" ON parent_alerts FOR
SELECT
    TO authenticated USING (auth.uid() = parent_id);

CREATE POLICY "parents_update_own_alerts" ON parent_alerts FOR
UPDATE
    TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

-- Universities
ALTER TABLE
    universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "universities_public_read" ON universities FOR
SELECT
    TO authenticated USING (true);

-- Campuses
ALTER TABLE
    campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campuses_public_read" ON campuses FOR
SELECT
    TO authenticated USING (true);

-- Neighborhoods
ALTER TABLE
    neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "neighborhoods_public_read" ON neighborhoods FOR
SELECT
    TO authenticated USING (true);

-- Neighborhood_landmarks
ALTER TABLE
    neighborhood_landmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "neighborhood_landmarks_public_read" ON neighborhood_landmarks FOR
SELECT
    TO authenticated USING (true);

-- Neighborhood_campus_distances
ALTER TABLE
    neighborhood_campus_distances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "neighborhood_campus_distances_public_read" ON neighborhood_campus_distances FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "properties_public_read" ON properties FOR
SELECT
    TO authenticated USING (is_active = true);

CREATE POLICY "owners_create_properties" ON properties FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owners_update_properties" ON properties FOR
UPDATE
    TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "owners_delete_properties" ON properties FOR DELETE TO authenticated USING (auth.uid() = owner_id);

ALTER TABLE
    property_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_rooms_public_read" ON property_rooms FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_rooms.property_id
                AND properties.is_active = true
        )
    );

CREATE POLICY "owners_create_property_rooms" ON property_rooms FOR
INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_rooms.property_id
                AND properties.owner_id = auth.uid()
        )
    );

CREATE POLICY "owners_update_property_rooms" ON property_rooms FOR
UPDATE
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_rooms.property_id
                AND properties.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_rooms.property_id
                AND properties.owner_id = auth.uid()
        )
    );

CREATE POLICY "owners_delete_property_rooms" ON property_rooms FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            properties
        WHERE
            properties.id = property_rooms.property_id
            AND properties.owner_id = auth.uid()
    )
);

-- Property Media
-- Enable RLS
ALTER TABLE
    property_media ENABLE ROW LEVEL SECURITY;

-- Public authenticated read access
CREATE POLICY "Authenticated users can view media of active properties" ON property_media FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_media.property_id
                AND properties.status = 'active'
        )
    );

-- Property owners can upload media
CREATE POLICY "Property owners can create property media" ON property_media FOR
INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_media.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Property owners can update media
CREATE POLICY "Property owners can update property media" ON property_media FOR
UPDATE
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_media.property_id
                AND properties.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_media.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Property owners can delete media
CREATE POLICY "Property owners can delete property media" ON property_media FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            properties
        WHERE
            properties.id = property_media.property_id
            AND properties.owner_id = auth.uid()
    )
);

-- Property Amenities
-- Enable RLS
ALTER TABLE
    property_amenities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view amenities of active properties
CREATE POLICY "Authenticated users can view amenities of active properties" ON property_amenities FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_amenities.property_id
                AND properties.status = 'active'
        )
    );

-- Property owners can add amenities
CREATE POLICY "Property owners can create property amenities" ON property_amenities FOR
INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_amenities.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Property owners can update amenities
CREATE POLICY "Property owners can update property amenities" ON property_amenities FOR
UPDATE
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_amenities.property_id
                AND properties.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_amenities.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Property owners can remove amenities
CREATE POLICY "Property owners can delete property amenities" ON property_amenities FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            properties
        WHERE
            properties.id = property_amenities.property_id
            AND properties.owner_id = auth.uid()
    )
);

-- Amenities
-- Enable RLS
ALTER TABLE
    amenities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view amenities
CREATE POLICY "Authenticated users can view amenities" ON amenities FOR
SELECT
    TO authenticated USING (true);

-- Admin/service role manages amenities
-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Service role bypasses RLS automatically.
-- Property Utilities
-- Enable RLS
ALTER TABLE
    property_utilities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view utilities of active properties
CREATE POLICY "Authenticated users can view utilities of active properties" ON property_utilities FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_utilities.property_id
                AND properties.status = 'active'
        )
    );

-- Property owners can add utilities
CREATE POLICY "Property owners can create property utilities" ON property_utilities FOR
INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_utilities.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Property owners can update utilities
CREATE POLICY "Property owners can update property utilities" ON property_utilities FOR
UPDATE
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_utilities.property_id
                AND properties.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_utilities.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Property owners can delete utilities
CREATE POLICY "Property owners can delete property utilities" ON property_utilities FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            properties
        WHERE
            properties.id = property_utilities.property_id
            AND properties.owner_id = auth.uid()
    )
);

-- Utilities
-- Enable RLS
ALTER TABLE
    utilities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view utilities
CREATE POLICY "Authenticated users can view utilities" ON utilities FOR
SELECT
    TO authenticated USING (true);

-- Admin/service role manages utilities
-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Service role bypasses RLS automatically.
ALTER TABLE
    property_reviews ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view reviews
CREATE POLICY "Authenticated users can view property reviews" ON property_reviews FOR
SELECT
    TO authenticated USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create property reviews" ON property_reviews FOR
INSERT
    TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users can update own property reviews" ON property_reviews FOR
UPDATE
    TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own property reviews" ON property_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

----
-- Discussions
ALTER TABLE
    discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions are viewable by everyone" ON discussions FOR
SELECT
    USING (true);

CREATE POLICY "Authenticated users can create discussions" ON discussions FOR
INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions" ON discussions FOR
UPDATE
    USING (auth.uid() = user_id);

-- Discussion Replies
ALTER TABLE
    discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Replies are viewable by everyone" ON discussion_replies FOR
SELECT
    USING (true);

CREATE POLICY "Authenticated users can reply" ON discussion_replies FOR
INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON discussion_replies FOR
UPDATE
    USING (auth.uid() = user_id);

-- Messages
-- Enable RLS
ALTER TABLE
    messages ENABLE ROW LEVEL SECURITY;

-- Participants can view messages
CREATE POLICY "Users can view own messages" ON messages FOR
SELECT
    TO authenticated USING (
        sender_id = auth.uid()
        OR recipient_id = auth.uid()
    );

-- Users can send messages
CREATE POLICY "Users can create messages" ON messages FOR
INSERT
    TO authenticated WITH CHECK (sender_id = auth.uid());

-- Senders can update their messages
CREATE POLICY "Users can update own messages" ON messages FOR
UPDATE
    TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

-- Senders can delete their messages
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE TO authenticated USING (sender_id = auth.uid());

CREATE POLICY "Users can send messages to their conversations" ON messages FOR
INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT
                1
            FROM
                conversation_members
            WHERE
                conversation_members.conversation_id = messages.conversation_id
                AND conversation_members.user_id = auth.uid()
        )
    );

-- Notifications
-- Enable RLS
ALTER TABLE
    notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- No INSERT policy for authenticated users.
-- Notifications are generated by backend logic,
-- triggers, or service role processes.
-- Users can update their own notifications
-- (for example marking as read)
CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Saved Properties
ALTER TABLE
    saved_properties ENABLE ROW LEVEL SECURITY;

-- Users can view their saved properties
CREATE POLICY "Users can view own saved properties" ON saved_properties FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- Users can save properties
CREATE POLICY "Users can create own saved properties" ON saved_properties FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update their saved properties
CREATE POLICY "Users can update own saved properties" ON saved_properties FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can remove saved properties
CREATE POLICY "Users can delete own saved properties" ON saved_properties FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Property Inquiries
-- Enable RLS
ALTER TABLE
    property_inquiries ENABLE ROW LEVEL SECURITY;

-- Sender or property owner can view inquiries
CREATE POLICY "Users can view own inquiries or property inquiries" ON property_inquiries FOR
SELECT
    TO authenticated USING (
        sender_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_inquiries.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Users can create inquiries
CREATE POLICY "Users can create property inquiries" ON property_inquiries FOR
INSERT
    TO authenticated WITH CHECK (sender_id = auth.uid());

-- Sender or property owner can update inquiry
CREATE POLICY "Users or owners can update inquiries" ON property_inquiries FOR
UPDATE
    TO authenticated USING (
        sender_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_inquiries.property_id
                AND properties.owner_id = auth.uid()
        )
    ) WITH CHECK (
        sender_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_inquiries.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Sender can delete inquiry
CREATE POLICY "Users can delete own inquiries" ON property_inquiries FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- Viewing Requests
-- Enable RLS
ALTER TABLE
    viewing_requests ENABLE ROW LEVEL SECURITY;

-- Requester or property owner can view requests
CREATE POLICY "Users can view own or property viewing requests" ON viewing_requests FOR
SELECT
    TO authenticated USING (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = viewing_requests.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Users can create viewing requests
CREATE POLICY "Users can create viewing requests" ON viewing_requests FOR
INSERT
    TO authenticated WITH CHECK (requester_id = auth.uid());

-- Requester or owner can update requests
CREATE POLICY "Users or owners can update viewing requests" ON viewing_requests FOR
UPDATE
    TO authenticated USING (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = viewing_requests.property_id
                AND properties.owner_id = auth.uid()
        )
    ) WITH CHECK (
        requester_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = viewing_requests.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Requester can delete request
CREATE POLICY "Users can delete own viewing requests" ON viewing_requests FOR DELETE TO authenticated USING (requester_id = auth.uid());

-- Housing Reports
-- Enable RLS
ALTER TABLE
    housing_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view own housing reports" ON housing_reports FOR
SELECT
    TO authenticated USING (reporter_id = auth.uid());

-- Users can create reports
CREATE POLICY "Users can create housing reports" ON housing_reports FOR
INSERT
    TO authenticated WITH CHECK (reporter_id = auth.uid());

-- Users can update their own reports
CREATE POLICY "Users can update own housing reports" ON housing_reports FOR
UPDATE
    TO authenticated USING (reporter_id = auth.uid()) WITH CHECK (reporter_id = auth.uid());

-- Users can delete their own reports
CREATE POLICY "Users can delete own housing reports" ON housing_reports FOR DELETE TO authenticated USING (reporter_id = auth.uid());

-- Community Posts
-- Enable RLS
ALTER TABLE
    community_posts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view community posts
CREATE POLICY "Authenticated users can view community posts" ON community_posts FOR
SELECT
    TO authenticated USING (true);

-- Users can create posts
CREATE POLICY "Users can create community posts" ON community_posts FOR
INSERT
    TO authenticated WITH CHECK (author_id = auth.uid());

-- Users can update own posts
CREATE POLICY "Users can update own community posts" ON community_posts FOR
UPDATE
    TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Users can delete own posts
CREATE POLICY "Users can delete own community posts" ON community_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

-- Community Comments
-- Enable RLS
ALTER TABLE
    community_comments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view comments
CREATE POLICY "Authenticated users can view community comments" ON community_comments FOR
SELECT
    TO authenticated USING (true);

-- Users can create comments
CREATE POLICY "Users can create community comments" ON community_comments FOR
INSERT
    TO authenticated WITH CHECK (author_id = auth.uid());

-- Users can update own comments
CREATE POLICY "Users can update own community comments" ON community_comments FOR
UPDATE
    TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

-- Users can delete own comments
CREATE POLICY "Users can delete own community comments" ON community_comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- Community Likes
-- Enable RLS
ALTER TABLE
    community_likes ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view likes
CREATE POLICY "Authenticated users can view community likes" ON community_likes FOR
SELECT
    TO authenticated USING (true);

-- Users can create their own likes
CREATE POLICY "Users can create own community likes" ON community_likes FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can remove their own likes
CREATE POLICY "Users can delete own community likes" ON community_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Reputation Scores
-- Enable RLS
ALTER TABLE
    reputation_scores ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view reputation scores
CREATE POLICY "Authenticated users can view reputation scores" ON reputation_scores FOR
SELECT
    TO authenticated USING (true);

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Reputation scores are maintained by trusted backend functions,
-- triggers, or service role processes.
-- Reputation Events
-- Enable RLS
ALTER TABLE
    reputation_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own reputation events
CREATE POLICY "Users can view own reputation events" ON reputation_events FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Reputation events are generated by backend logic,
-- triggers, or service role processes.
-- Verification Requests
-- Enable RLS
ALTER TABLE
    verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification requests
CREATE POLICY "Users can view own verification requests" ON verification_requests FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- Users can submit verification requests
CREATE POLICY "Users can create verification requests" ON verification_requests FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update own pending requests
CREATE POLICY "Users can update own verification requests" ON verification_requests FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can delete own verification requests
CREATE POLICY "Users can delete own verification requests" ON verification_requests FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Verification Documents
-- Enable RLS
ALTER TABLE
    verification_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification documents" ON verification_documents FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- Users can upload their own verification documents
CREATE POLICY "Users can create own verification documents" ON verification_documents FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update own verification documents
CREATE POLICY "Users can update own verification documents" ON verification_documents FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can delete own verification documents
CREATE POLICY "Users can delete own verification documents" ON verification_documents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Founder Profiles
-- Enable RLS
ALTER TABLE
    founder_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view founder profiles
CREATE POLICY "Authenticated users can view founder profiles" ON founder_profiles FOR
SELECT
    TO authenticated USING (true);

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Founder profiles are managed by admins/service role.
-- Ambassador Profiles
-- Enable RLS
ALTER TABLE
    ambassador_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view ambassador profiles
CREATE POLICY "Authenticated users can view ambassador profiles" ON ambassador_profiles FOR
SELECT
    TO authenticated USING (true);

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Ambassador profiles are managed by admins/service role.
-- Scout Profiles
-- Enable RLS
ALTER TABLE
    scout_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view scout profiles
CREATE POLICY "Authenticated users can view scout profiles" ON scout_profiles FOR
SELECT
    TO authenticated USING (true);

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Scout profiles are managed by admins/service role.
-- Businesses
ALTER TABLE
    businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Businesses are viewable by everyone" ON businesses FOR
SELECT
    USING (true);

CREATE POLICY "Owners can manage own businesses" ON businesses FOR ALL USING (auth.uid() = owner_id);

-- Opportunities
-- Enable RLS
ALTER TABLE
    opportunities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view opportunities
CREATE POLICY "Authenticated users can view opportunities" ON opportunities FOR
SELECT
    TO authenticated USING (true);

-- Opportunity creators can create opportunities
CREATE POLICY "Users can create opportunities" ON opportunities FOR
INSERT
    TO authenticated WITH CHECK (created_by = auth.uid());

-- Opportunity owners can update opportunities
CREATE POLICY "Users can update own opportunities" ON opportunities FOR
UPDATE
    TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- Opportunity owners can delete opportunities
CREATE POLICY "Users can delete own opportunities" ON opportunities FOR DELETE TO authenticated USING (created_by = auth.uid());

-- Opportinity Applications
-- Enable RLS
ALTER TABLE
    opportunity_applications ENABLE ROW LEVEL SECURITY;

-- Applicant or opportunity owner can view applications
CREATE POLICY "Users can view own applications or received applications" ON opportunity_applications FOR
SELECT
    TO authenticated USING (
        applicant_id = auth.uid()
        OR EXISTS (
            SELECT
                1
            FROM
                opportunities
            WHERE
                opportunities.id = opportunity_applications.opportunity_id
                AND opportunities.created_by = auth.uid()
        )
    );

-- Students can create applications
CREATE POLICY "Users can create opportunity applications" ON opportunity_applications FOR
INSERT
    TO authenticated WITH CHECK (applicant_id = auth.uid());

-- Applicants can update their own applications
CREATE POLICY "Users can update own opportunity applications" ON opportunity_applications FOR
UPDATE
    TO authenticated USING (applicant_id = auth.uid()) WITH CHECK (applicant_id = auth.uid());

-- Applicants can withdraw/delete applications
CREATE POLICY "Users can delete own opportunity applications" ON opportunity_applications FOR DELETE TO authenticated USING (applicant_id = auth.uid());

-- Mentorship Profiles
-- Enable RLS
ALTER TABLE
    mentorship_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view mentorship profiles
CREATE POLICY "Authenticated users can view mentorship profiles" ON mentorship_profiles FOR
SELECT
    TO authenticated USING (true);

-- Users can create their own mentorship profile
CREATE POLICY "Users can create own mentorship profile" ON mentorship_profiles FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update their own mentorship profile
CREATE POLICY "Users can update own mentorship profile" ON mentorship_profiles FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can delete their own mentorship profile
CREATE POLICY "Users can delete own mentorship profile" ON mentorship_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Mentorship Requests
-- Enable RLS
ALTER TABLE
    mentorship_requests ENABLE ROW LEVEL SECURITY;

-- Requester or mentor can view requests
CREATE POLICY "Users can view own mentorship requests" ON mentorship_requests FOR
SELECT
    TO authenticated USING (
        requester_id = auth.uid()
        OR mentor_id = auth.uid()
    );

-- Users can create mentorship requests
CREATE POLICY "Users can create mentorship requests" ON mentorship_requests FOR
INSERT
    TO authenticated WITH CHECK (requester_id = auth.uid());

-- Requester or mentor can update requests
CREATE POLICY "Users can update mentorship requests" ON mentorship_requests FOR
UPDATE
    TO authenticated USING (
        requester_id = auth.uid()
        OR mentor_id = auth.uid()
    ) WITH CHECK (
        requester_id = auth.uid()
        OR mentor_id = auth.uid()
    );

-- Requester can delete requests
CREATE POLICY "Users can delete own mentorship requests" ON mentorship_requests FOR DELETE TO authenticated USING (requester_id = auth.uid());

-- -- Enable RLS
ALTER TABLE
    alumni_profiles ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view alumni profiles
CREATE POLICY "Authenticated users can view alumni profiles" ON alumni_profiles FOR
SELECT
    TO authenticated USING (true);

-- Users can create their own alumni profile
CREATE POLICY "Users can create own alumni profiles" ON alumni_profiles FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

-- Users can update their own alumni profile
CREATE POLICY "Users can update own alumni profiles" ON alumni_profiles FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can delete their own alumni profile
CREATE POLICY "Users can delete own alumni profiles" ON alumni_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Recommendations
-- Enable RLS
ALTER TABLE
    recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations" ON recommendations FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Recommendations are generated and maintained by backend services,
-- AI systems, triggers, or service role processes.
-- Referrals
-- Enable RLS
ALTER TABLE
    referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals they are involved in
CREATE POLICY "Users can view own referrals" ON referrals FOR
SELECT
    TO authenticated USING (
        referrer_id = auth.uid()
        OR referred_user_id = auth.uid()
    );

-- Users can create referrals
CREATE POLICY "Users can create referrals" ON referrals FOR
INSERT
    TO authenticated WITH CHECK (referrer_id = auth.uid());

-- No authenticated UPDATE policy.
-- Referral status, rewards, and completion logic
-- should be managed by backend functions/service role.
-- Users can delete referrals they created
CREATE POLICY "Users can delete own referrals" ON referrals FOR DELETE TO authenticated USING (referrer_id = auth.uid());

-- Moderation Reports
-- Enable RLS
ALTER TABLE
    moderation_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own moderation reports
CREATE POLICY "Users can view own moderation reports" ON moderation_reports FOR
SELECT
    TO authenticated USING (reporter_id = auth.uid());

-- Users can submit moderation reports
CREATE POLICY "Users can create moderation reports" ON moderation_reports FOR
INSERT
    TO authenticated WITH CHECK (reporter_id = auth.uid());

-- No authenticated UPDATE policy.
-- Moderation status, decisions, and enforcement actions
-- are controlled by moderators/admins/service role.
-- Users can delete their own reports
CREATE POLICY "Users can delete own moderation reports" ON moderation_reports FOR DELETE TO authenticated USING (reporter_id = auth.uid());

-- 
-- Events (write-only for users, read for service role)
-- Enable RLS
ALTER TABLE
    events ENABLE ROW LEVEL SECURITY;

-- Users can view events associated with themselves
CREATE POLICY "Users can view own events" ON events FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- No INSERT, UPDATE, DELETE policies for authenticated users.
-- Events are generated by backend logic,
-- triggers, automation, or service role processes.
-- Audit Logs (read-only for admins — handled via service role)
ALTER TABLE
    audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================
-- Handle new user signup: create profile from auth metadata
CREATE
OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $ $ BEGIN
INSERT INTO
    public.profiles (id, full_name, avatar_url, username)
VALUES
    (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'avatar_url',
        NEW.email
    );

-- Assign default student role
INSERT INTO
    public.user_roles (user_id, role_id)
SELECT
    NEW.id,
    r.id
FROM
    public.roles r
WHERE
    r.name = 'student';

RETURN NEW;

END;

$ $ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update `updated_at` timestamps
CREATE
OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = NOW();

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE
UPDATE
    ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER properties_updated_at BEFORE
UPDATE
    ON properties FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER property_rooms_updated_at BEFORE
UPDATE
    ON property_rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER discussions_updated_at BEFORE
UPDATE
    ON discussions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER opportunities_updated_at BEFORE
UPDATE
    ON opportunities FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Increment reply count on discussion when a reply is added
CREATE
OR REPLACE FUNCTION increment_reply_count() RETURNS TRIGGER AS $ $ BEGIN
UPDATE
    discussions
SET
    reply_count = reply_count + 1
WHERE
    id = NEW.discussion_id;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER on_reply_created
AFTER
INSERT
    ON discussion_replies FOR EACH ROW EXECUTE PROCEDURE increment_reply_count();

-- Recalculate property Campozy Score when a review is added
CREATE
OR REPLACE FUNCTION recalculate_campozy_score() RETURNS TRIGGER AS $ $ DECLARE avg_overall NUMERIC;

avg_safety NUMERIC;

avg_hygiene NUMERIC;

avg_water NUMERIC;

avg_electricity NUMERIC;

avg_internet NUMERIC;

avg_management NUMERIC;

avg_accessibility NUMERIC;

avg_value NUMERIC;

review_count INTEGER;

verification_bonus NUMERIC;

volume_bonus NUMERIC;

final_score NUMERIC;

v_level verification_level;

BEGIN -- Get averages from all reviews for this property
SELECT
    COALESCE(AVG(overall_rating), 0),
    COALESCE(AVG(safety_rating), 0),
    COALESCE(AVG(hygiene_rating), 0),
    COALESCE(AVG(water_rating), 0),
    COALESCE(AVG(electricity_rating), 0),
    COALESCE(AVG(internet_rating), 0),
    COALESCE(AVG(management_rating), 0),
    COALESCE(AVG(accessibility_rating), 0),
    COALESCE(AVG(value_for_money_rating), 0),
    COUNT(*) INTO avg_overall,
    avg_safety,
    avg_hygiene,
    avg_water,
    avg_electricity,
    avg_internet,
    avg_management,
    avg_accessibility,
    avg_value,
    review_count
FROM
    property_reviews
WHERE
    property_id = COALESCE(NEW.property_id, OLD.property_id);

-- Get verification level
SELECT
    verification_level INTO v_level
FROM
    properties
WHERE
    id = COALESCE(NEW.property_id, OLD.property_id);

-- Verification bonus (0-15)
CASE
    v_level
    WHEN 'campozy_verified' THEN verification_bonus := 15;

WHEN 'scout_verified' THEN verification_bonus := 12;

WHEN 'community_verified' THEN verification_bonus := 8;

WHEN 'claimed' THEN verification_bonus := 3;

ELSE verification_bonus := 0;

END CASE
;

-- Volume bonus (0-5): more reviews = higher confidence
volume_bonus := LEAST(5, review_count);

-- Weighted dimension score (0-80):
-- Each dimension rated 1-5, weighted sum normalized to 80 points
-- Weights reflect the Campozy Score philosophy
final_score := (
    (avg_safety * 3.0) + -- Safety is paramount
    (avg_water * 2.0) + (avg_electricity * 2.0) + (avg_internet * 1.5) + (avg_hygiene * 2.0) + (avg_management * 1.5) + (avg_accessibility * 1.0) + (avg_value * 2.0) + (avg_overall * 1.0)
) / (16.0 * 5.0) * 80.0;

-- Normalize: total_weight * max_rating = max_raw, map to 80
final_score := final_score + verification_bonus + volume_bonus;

final_score := LEAST(100, GREATEST(0, ROUND(final_score)));

UPDATE
    properties
SET
    campozy_score = final_score
WHERE
    id = COALESCE(NEW.property_id, OLD.property_id);

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER on_review_score_update
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON property_reviews FOR EACH ROW EXECUTE PROCEDURE recalculate_campozy_score();

-- ============================================================================
-- SEED DATA — Reference tables
-- ============================================================================
INSERT INTO
    roles (name, description)
VALUES
    ('student', 'Default role for all students'),
    ('owner', 'Property owner'),
    ('scout', 'Verification scout'),
    ('founder', 'Campus/Country/Global founder'),
    ('ambassador', 'Campus/Community ambassador'),
    ('mentor', 'Student mentor'),
    ('alumni', 'University alumni'),
    ('employer', 'Opportunity employer'),
    ('parent', 'Student parent/guardian'),
    ('moderator', 'Content moderator'),
    ('admin', 'Platform administrator');

INSERT INTO
    utility_types (name)
VALUES
    ('Water'),
    ('Electricity'),
    ('Internet'),
    ('Security'),
    ('Accessibility');

INSERT INTO
    hygiene_categories (name)
VALUES
    ('Bathrooms'),
    ('Kitchens'),
    ('Common Areas'),
    ('Waste Management'),
    ('Pest Control'),
    ('Sanitation');

INSERT INTO
    discussion_categories (name, description)
VALUES
    ('housing', 'Property and housing discussions'),
    (
        'campus_life',
        'Campus life and student experience'
    ),
    ('safety', 'Safety alerts and information'),
    ('utilities', 'Utility reliability and issues'),
    (
        'opportunities',
        'Internships, scholarships, and careers'
    ),
    ('general', 'General discussions');

INSERT INTO
    badges (name, slug, description, category)
VALUES
    (
        'Trusted Reviewer',
        'trusted-reviewer',
        'Consistently helpful and accurate reviews',
        'trust'
    ),
    (
        'Campus Expert',
        'campus-expert',
        'Deep knowledge of a specific campus',
        'expertise'
    ),
    (
        'Utility Expert',
        'utility-expert',
        'Reliable utility intelligence contributor',
        'expertise'
    ),
    (
        'Hygiene Expert',
        'hygiene-expert',
        'Detailed hygiene reporting',
        'expertise'
    ),
    (
        'Community Leader',
        'community-leader',
        'Active and helpful community member',
        'community'
    ),
    (
        'Mentor',
        'mentor',
        'Active student mentor',
        'community'
    ),
    (
        'Campus Founder',
        'campus-founder',
        'Founding member of a campus community',
        'founder'
    ),
    (
        'Country Founder',
        'country-founder',
        'Founding member of a country community',
        'founder'
    ),
    (
        'Global Pioneer',
        'global-pioneer',
        'Early builder of the global Campozy network',
        'founder'
    ),
    (
        'Verified Contributor',
        'verified-contributor',
        'Identity-verified active contributor',
        'trust'
    );

-- Trigram extension for text search