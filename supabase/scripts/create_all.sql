-- ============================================================================
-- CAMPOZY DATABASE CREATE ALL
-- ============================================================================
-- This script creates the complete Campozy database from scratch.
-- Run this on a fresh Supabase project.
-- ============================================================================

-- ============================================================================
-- 00_extensions.sql
-- ============================================================================

-- ============================================================================
-- Module 00: Extensions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- 01_enums.sql
-- ============================================================================

-- ============================================================================
-- Module 01: Enum Types
-- ============================================================================
DO $ $ BEGIN CREATE TYPE verification_level AS ENUM (
    'unverified',
    'claimed',
    'community_verified',
    'scout_verified',
    'campozy_verified'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE founder_scope AS ENUM ('campus', 'country', 'global');

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE assignment_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'cancelled'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE opportunity_type AS ENUM (
    'job',
    'internship',
    'scholarship',
    'volunteer',
    'event'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE application_status AS ENUM (
    'applied',
    'reviewed',
    'shortlisted',
    'accepted',
    'rejected'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE mentorship_status AS ENUM (
    'active',
    'paused',
    'completed'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE notification_type AS ENUM (
    'message',
    'review',
    'opportunity',
    'founder',
    'system',
    'verification'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE moderation_status AS ENUM (
    'open',
    'investigating',
    'resolved',
    'dismissed'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE moderation_action_type AS ENUM (
    'warning',
    'content_removed',
    'temporary_restriction',
    'account_suspension'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;

DO $ $ BEGIN CREATE TYPE appeal_status AS ENUM (
    'pending',
    'reviewing',
    'upheld',
    'overturned'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END $ $;
DO  BEGIN CREATE TYPE verification_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END ;

DO  BEGIN CREATE TYPE claim_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

EXCEPTION
WHEN duplicate_object THEN NULL;

END ;

-- ============================================================================
-- 02_reference_tables.sql
-- ============================================================================

-- ============================================================================
-- Module 02: Reference Tables
-- ============================================================================
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    code TEXT UNIQUE CHECK(length(trim(code)) > 0),
    iso_code TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    iso_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id),
    university_id UUID REFERENCES universities(id),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    location_lat NUMERIC(9, 6) CHECK (location_lat BETWEEN -90 AND 90),
    location_lng NUMERIC(9, 6) CHECK (location_lng BETWEEN -180 AND 180),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    city_id UUID REFERENCES cities(id),
    country_id UUID REFERENCES countries(id),
    short_name TEXT,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    safety_score NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (safety_score BETWEEN 0 AND 100),
    reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (reputation_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);

CREATE INDEX IF NOT EXISTS idx_campuses_city ON campuses(city_id);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city_id);

-- ============================================================================
-- 03_profiles.sql
-- ============================================================================

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
    phone TEXT,
    phone_number TEXT,
    bio TEXT,
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    former_school_id UUID REFERENCES high_schools(id),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    trust_level TEXT NOT NULL DEFAULT 'new',
    reputation_score INTEGER NOT NULL DEFAULT 0 CHECK (reputation_score >= 0),
    contribution_score INTEGER NOT NULL DEFAULT 0 CHECK (contribution_score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university_id);

CREATE INDEX IF NOT EXISTS idx_profiles_campus ON profiles(campus_id);

-- ============================================================================
-- 04_students.sql
-- ============================================================================

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

-- OWNERS

CREATE TABLE IF NOT EXISTS owners (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY owners_select ON owners FOR
SELECT
    TO authenticated USING (auth.uid() = id);

CREATE POLICY owners_insert ON owners FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY owners_update ON owners FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- STUDENT DOMAIN

CREATE TABLE IF NOT EXISTS students (
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

-- ============================================================================
-- 05_community.sql
-- ============================================================================

-- ============================================================================
-- Module 05: Community
-- ============================================================================

CREATE TABLE IF NOT EXISTS discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES discussion_categories(id),
    title TEXT NOT NULL CHECK(length(trim(title)) > 0),
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK(reply_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussions_campus ON discussions(campus_id);

CREATE INDEX IF NOT EXISTS idx_discussions_user ON discussions(user_id);

CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussions_title_search ON discussions USING gin(title gin_trgm_ops);

CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);

-- ============================================================================
-- COMMUNITY POSTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id),
    title TEXT CHECK(
        title IS NULL
        OR length(trim(title)) > 0
    ),
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_community_posts_campus ON community_posts(campus_id);

CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON community_comments(post_id);

CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(post_id, user_id)
);

-- ============================================================================
-- 06_marketplace.sql
-- ============================================================================

-- ============================================================================
-- Module 06: Marketplace
-- ============================================================================

-- Housing Core Domain

-- ============================================================================
-- PROPERTY TYPES
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROPERTIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    property_type_id UUID REFERENCES property_types(id),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    address TEXT CHECK(
        address IS NULL
        OR length(trim(address)) > 0
    ),
    location_lat NUMERIC(9, 6) CHECK(
        location_lat BETWEEN -90
        AND 90
    ),
    location_lng NUMERIC(9, 6) CHECK(
        location_lng BETWEEN -180
        AND 180
    ),
    monthly_price NUMERIC CHECK(
        monthly_price IS NULL
        OR monthly_price >= 0
    ),
    currency TEXT DEFAULT 'KES' CHECK(length(trim(currency)) > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(
        status IN (
            'pending',
            'active',
            'inactive',
            'rejected'
        )
    ),
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    campozy_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK(
        campozy_score BETWEEN 0
        AND 100
    ),
    reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK(
        reputation_score BETWEEN 0
        AND 100
    ),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);

CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood_id);

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

CREATE INDEX IF NOT EXISTS idx_properties_score ON properties(campozy_score DESC);

-- ============================================================================
-- PROPERTY ROOMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL CHECK(length(trim(room_type)) > 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_rooms_property ON property_rooms(property_id);

-- ============================================================================
-- PROPERTY MEDIA
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK(length(trim(url)) > 0),
    media_type TEXT NOT NULL DEFAULT 'image' CHECK(length(trim(media_type)) > 0),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_media_property ON property_media(property_id);

-- ============================================================================
-- AMENITIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK(length(trim(name)) > 0),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_amenities (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(property_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON property_amenities(property_id);

-- ============================================================================
-- UTILITIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL CHECK(length(trim(name)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS property_utilities (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_id UUID NOT NULL REFERENCES utilities(id) ON DELETE CASCADE,
    reliability_score NUMERIC(5, 2) CHECK(
        reliability_score BETWEEN 0
        AND 100
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(property_id, utility_id)
);

CREATE INDEX IF NOT EXISTS idx_property_utilities_property ON property_utilities(property_id);

-- ============================================================================
-- PROPERTY REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    overall_rating INTEGER NOT NULL CHECK(
        overall_rating BETWEEN 1
        AND 5
    ),
    safety_rating INTEGER CHECK(
        safety_rating BETWEEN 1
        AND 5
    ),
    hygiene_rating INTEGER CHECK(
        hygiene_rating BETWEEN 1
        AND 5
    ),
    water_rating INTEGER CHECK(
        water_rating BETWEEN 1
        AND 5
    ),
    electricity_rating INTEGER CHECK(
        electricity_rating BETWEEN 1
        AND 5
    ),
    internet_rating INTEGER CHECK(
        internet_rating BETWEEN 1
        AND 5
    ),
    management_rating INTEGER CHECK(
        management_rating BETWEEN 1
        AND 5
    ),
    accessibility_rating INTEGER CHECK(
        accessibility_rating BETWEEN 1
        AND 5
    ),
    value_for_money_rating INTEGER CHECK(
        value_for_money_rating BETWEEN 1
        AND 5
    ),
    content TEXT CHECK(
        content IS NULL
        OR length(trim(content)) > 0
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);

CREATE INDEX IF NOT EXISTS idx_property_reviews_reviewer ON property_reviews(reviewer_id);

-- ============================================================================
-- PROPERTY INQUIRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL CHECK(length(trim(message)) > 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK(
        status IN (
            'open',
            'responded',
            'closed'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_property ON property_inquiries(property_id);

CREATE INDEX IF NOT EXISTS idx_property_inquiries_sender ON property_inquiries(sender_id);

-- ============================================================================
-- VIEWING REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS viewing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    requested_time TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(
        status IN (
            'pending',
            'approved',
            'rejected',
            'completed'
        )
    ),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_viewing_requests_property ON viewing_requests(property_id);

CREATE INDEX IF NOT EXISTS idx_viewing_requests_requester ON viewing_requests(requester_id);

-- ============================================================================
-- SAVED PROPERTIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_properties (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, property_id)
);

-- ============================================================================
-- 07_businesses.sql
-- ============================================================================

-- ============================================================================
-- Module 07: Businesses
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    category TEXT,
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    campozy_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK(
        campozy_score BETWEEN 0
        AND 100
    ),
    address TEXT,
    phone TEXT,
    website TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

CREATE INDEX IF NOT EXISTS idx_businesses_neighborhood ON businesses(neighborhood_id);

CREATE TABLE IF NOT EXISTS business_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK(length(trim(url)) > 0),
    media_type TEXT DEFAULT 'image',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_media_business ON business_media(business_id);

-- ============================================================================
-- BUSINESS REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    overall_rating NUMERIC(2, 1) NOT NULL CHECK (
        overall_rating BETWEEN 1
        AND 5
    ),
    service_rating NUMERIC(2, 1) CHECK (
        service_rating BETWEEN 1
        AND 5
    ),
    quality_rating NUMERIC(2, 1) CHECK (
        quality_rating BETWEEN 1
        AND 5
    ),
    value_rating NUMERIC(2, 1) CHECK (
        value_rating BETWEEN 1
        AND 5
    ),
    cleanliness_rating NUMERIC(2, 1) CHECK (
        cleanliness_rating BETWEEN 1
        AND 5
    ),
    staff_rating NUMERIC(2, 1) CHECK (
        staff_rating BETWEEN 1
        AND 5
    ),
    title TEXT,
    review TEXT,
    would_recommend BOOLEAN,
    is_verified_visit BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        business_id,
        reviewer_id
    )
);

CREATE INDEX IF NOT EXISTS idx_business_reviews_business ON business_reviews(business_id);

CREATE INDEX IF NOT EXISTS idx_business_reviews_reviewer ON business_reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_business_reviews_created ON business_reviews(created_at DESC);

-- ============================================================================
-- BUSINESS REVIEW VOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_review_votes (
    review_id UUID NOT NULL REFERENCES business_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_review_votes_user ON business_review_votes(user_id);

-- ============================================================================
-- BUSINESS REVIEW REPLIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS business_review_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES business_reviews(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (length(trim(body)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_review_replies_review ON business_review_replies(review_id);

-- ============================================================================
-- 12_missing_tables.sql
-- ============================================================================

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
    status verification_status NOT NULL DEFAULT 'pending' -- pending, approved, rejected
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
-- 13_triggers.sql
-- ============================================================================

-- ============================================================================
-- Module 13: Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        username,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.email, NEW.id::text),
        NEW.raw_user_meta_data ->> 'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role_id)
    SELECT
        NEW.id,
        roles.id
    FROM public.roles
    WHERE roles.name = COALESCE(
        NEW.raw_user_meta_data ->> 'role',
        'student'
    )
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update `updated_at` timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 15_rls.sql
-- ============================================================================

﻿-- ============================================================================
-- Module 15: Row Level Security Policies
-- ============================================================================

-- academic_programs
ALTER TABLE academic_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY academic_programs_select ON academic_programs FOR SELECT TO authenticated USING (true);
CREATE POLICY academic_programs_insert ON academic_programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY academic_programs_update ON academic_programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY academic_programs_delete ON academic_programs FOR DELETE TO authenticated USING (true);

-- amenities
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY amenities_select ON amenities FOR SELECT TO authenticated USING (true);
CREATE POLICY amenities_insert ON amenities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY amenities_update ON amenities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY amenities_delete ON amenities FOR DELETE TO authenticated USING (true);

-- badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY badges_select ON badges FOR SELECT TO authenticated USING (true);
CREATE POLICY badges_insert ON badges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY badges_update ON badges FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY badges_delete ON badges FOR DELETE TO authenticated USING (true);

-- business_media
ALTER TABLE business_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_media_select ON business_media FOR SELECT TO authenticated USING (true);
CREATE POLICY business_media_insert ON business_media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY business_media_update ON business_media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY business_media_delete ON business_media FOR DELETE TO authenticated USING (true);

-- business_review_replies
ALTER TABLE business_review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_review_replies_select ON business_review_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY business_review_replies_insert ON business_review_replies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY business_review_replies_update ON business_review_replies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY business_review_replies_delete ON business_review_replies FOR DELETE TO authenticated USING (true);

-- business_review_votes
ALTER TABLE business_review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_review_votes_select ON business_review_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY business_review_votes_insert ON business_review_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY business_review_votes_update ON business_review_votes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY business_review_votes_delete ON business_review_votes FOR DELETE TO authenticated USING (true);

-- business_reviews
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_reviews_select ON business_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY business_reviews_insert ON business_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY business_reviews_update ON business_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY business_reviews_delete ON business_reviews FOR DELETE TO authenticated USING (true);

-- businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY businesses_select ON businesses FOR SELECT TO authenticated USING (true);
CREATE POLICY businesses_insert ON businesses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY businesses_update ON businesses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY businesses_delete ON businesses FOR DELETE TO authenticated USING (true);

-- campuses
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY campuses_select ON campuses FOR SELECT TO authenticated USING (true);
CREATE POLICY campuses_insert ON campuses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY campuses_update ON campuses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY campuses_delete ON campuses FOR DELETE TO authenticated USING (true);

-- cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_select ON cities FOR SELECT TO authenticated USING (true);
CREATE POLICY cities_insert ON cities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY cities_update ON cities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY cities_delete ON cities FOR DELETE TO authenticated USING (true);

-- community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_comments_select ON community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY community_comments_insert ON community_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY community_comments_update ON community_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY community_comments_delete ON community_comments FOR DELETE TO authenticated USING (true);

-- community_likes
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_likes_select ON community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY community_likes_insert ON community_likes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY community_likes_update ON community_likes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY community_likes_delete ON community_likes FOR DELETE TO authenticated USING (true);

-- community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_posts_select ON community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY community_posts_insert ON community_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY community_posts_update ON community_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY community_posts_delete ON community_posts FOR DELETE TO authenticated USING (true);

-- contact_methods
ALTER TABLE contact_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY contact_methods_select ON contact_methods FOR SELECT TO authenticated USING (true);
CREATE POLICY contact_methods_insert ON contact_methods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY contact_methods_update ON contact_methods FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY contact_methods_delete ON contact_methods FOR DELETE TO authenticated USING (true);

-- countries
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY countries_select ON countries FOR SELECT TO authenticated USING (true);
CREATE POLICY countries_insert ON countries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY countries_update ON countries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY countries_delete ON countries FOR DELETE TO authenticated USING (true);

-- discussion_categories
ALTER TABLE discussion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_categories_select ON discussion_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY discussion_categories_insert ON discussion_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY discussion_categories_update ON discussion_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY discussion_categories_delete ON discussion_categories FOR DELETE TO authenticated USING (true);

-- discussion_replies
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_replies_select ON discussion_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY discussion_replies_insert ON discussion_replies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY discussion_replies_update ON discussion_replies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY discussion_replies_delete ON discussion_replies FOR DELETE TO authenticated USING (true);

-- discussion_votes
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_votes_select ON discussion_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY discussion_votes_insert ON discussion_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY discussion_votes_update ON discussion_votes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY discussion_votes_delete ON discussion_votes FOR DELETE TO authenticated USING (true);

-- discussions
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussions_select ON discussions FOR SELECT TO authenticated USING (true);
CREATE POLICY discussions_insert ON discussions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY discussions_update ON discussions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY discussions_delete ON discussions FOR DELETE TO authenticated USING (true);

-- high_schools
ALTER TABLE high_schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY high_schools_select ON high_schools FOR SELECT TO authenticated USING (true);
CREATE POLICY high_schools_insert ON high_schools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY high_schools_update ON high_schools FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY high_schools_delete ON high_schools FOR DELETE TO authenticated USING (true);

-- hygiene_reports
ALTER TABLE hygiene_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_reports_select ON hygiene_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY hygiene_reports_insert ON hygiene_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY hygiene_reports_update ON hygiene_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY hygiene_reports_delete ON hygiene_reports FOR DELETE TO authenticated USING (true);

-- identity_documents
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY identity_documents_select ON identity_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY identity_documents_insert ON identity_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY identity_documents_update ON identity_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY identity_documents_delete ON identity_documents FOR DELETE TO authenticated USING (true);

-- knowledge_articles
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY knowledge_articles_select ON knowledge_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY knowledge_articles_insert ON knowledge_articles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY knowledge_articles_update ON knowledge_articles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY knowledge_articles_delete ON knowledge_articles FOR DELETE TO authenticated USING (true);

-- neighborhood_campus_distances
ALTER TABLE neighborhood_campus_distances ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_campus_distances_select ON neighborhood_campus_distances FOR SELECT TO authenticated USING (true);
CREATE POLICY neighborhood_campus_distances_insert ON neighborhood_campus_distances FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY neighborhood_campus_distances_update ON neighborhood_campus_distances FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY neighborhood_campus_distances_delete ON neighborhood_campus_distances FOR DELETE TO authenticated USING (true);

-- neighborhood_landmarks
ALTER TABLE neighborhood_landmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_landmarks_select ON neighborhood_landmarks FOR SELECT TO authenticated USING (true);
CREATE POLICY neighborhood_landmarks_insert ON neighborhood_landmarks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY neighborhood_landmarks_update ON neighborhood_landmarks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY neighborhood_landmarks_delete ON neighborhood_landmarks FOR DELETE TO authenticated USING (true);

-- neighborhood_reviews
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_reviews_select ON neighborhood_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY neighborhood_reviews_insert ON neighborhood_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY neighborhood_reviews_update ON neighborhood_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY neighborhood_reviews_delete ON neighborhood_reviews FOR DELETE TO authenticated USING (true);

-- neighborhoods
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhoods_select ON neighborhoods FOR SELECT TO authenticated USING (true);
CREATE POLICY neighborhoods_insert ON neighborhoods FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY neighborhoods_update ON neighborhoods FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY neighborhoods_delete ON neighborhoods FOR DELETE TO authenticated USING (true);

-- owners
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY owners_select ON owners FOR SELECT TO authenticated USING (true);
CREATE POLICY owners_insert ON owners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY owners_update ON owners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY owners_delete ON owners FOR DELETE TO authenticated USING (true);

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_insert ON profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY profiles_delete ON profiles FOR DELETE TO authenticated USING (true);

-- properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY properties_select ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY properties_insert ON properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY properties_update ON properties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY properties_delete ON properties FOR DELETE TO authenticated USING (true);

-- property_amenities
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_amenities_select ON property_amenities FOR SELECT TO authenticated USING (true);
CREATE POLICY property_amenities_insert ON property_amenities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_amenities_update ON property_amenities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_amenities_delete ON property_amenities FOR DELETE TO authenticated USING (true);

-- property_claims
ALTER TABLE property_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_claims_select ON property_claims FOR SELECT TO authenticated USING (true);
CREATE POLICY property_claims_insert ON property_claims FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_claims_update ON property_claims FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_claims_delete ON property_claims FOR DELETE TO authenticated USING (true);

-- property_inquiries
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_inquiries_select ON property_inquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY property_inquiries_insert ON property_inquiries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_inquiries_update ON property_inquiries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_inquiries_delete ON property_inquiries FOR DELETE TO authenticated USING (true);

-- property_media
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_media_select ON property_media FOR SELECT TO authenticated USING (true);
CREATE POLICY property_media_insert ON property_media FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_media_update ON property_media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_media_delete ON property_media FOR DELETE TO authenticated USING (true);

-- property_review_flags
ALTER TABLE property_review_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_review_flags_select ON property_review_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY property_review_flags_insert ON property_review_flags FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_review_flags_update ON property_review_flags FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_review_flags_delete ON property_review_flags FOR DELETE TO authenticated USING (true);

-- property_review_votes
ALTER TABLE property_review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_review_votes_select ON property_review_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY property_review_votes_insert ON property_review_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_review_votes_update ON property_review_votes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_review_votes_delete ON property_review_votes FOR DELETE TO authenticated USING (true);

-- property_reviews
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_reviews_select ON property_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY property_reviews_insert ON property_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_reviews_update ON property_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_reviews_delete ON property_reviews FOR DELETE TO authenticated USING (true);

-- property_rooms
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_rooms_select ON property_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY property_rooms_insert ON property_rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_rooms_update ON property_rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_rooms_delete ON property_rooms FOR DELETE TO authenticated USING (true);

-- property_types
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_types_select ON property_types FOR SELECT TO authenticated USING (true);
CREATE POLICY property_types_insert ON property_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_types_update ON property_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_types_delete ON property_types FOR DELETE TO authenticated USING (true);

-- property_utilities
ALTER TABLE property_utilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_utilities_select ON property_utilities FOR SELECT TO authenticated USING (true);
CREATE POLICY property_utilities_insert ON property_utilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY property_utilities_update ON property_utilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY property_utilities_delete ON property_utilities FOR DELETE TO authenticated USING (true);

-- reputation_events
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY reputation_events_select ON reputation_events FOR SELECT TO authenticated USING (true);
CREATE POLICY reputation_events_insert ON reputation_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY reputation_events_update ON reputation_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY reputation_events_delete ON reputation_events FOR DELETE TO authenticated USING (true);

-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY roles_insert ON roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roles_update ON roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roles_delete ON roles FOR DELETE TO authenticated USING (true);

-- saved_properties
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_properties_select ON saved_properties FOR SELECT TO authenticated USING (true);
CREATE POLICY saved_properties_insert ON saved_properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY saved_properties_update ON saved_properties FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY saved_properties_delete ON saved_properties FOR DELETE TO authenticated USING (true);

-- student_lifecycle_history
ALTER TABLE student_lifecycle_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_lifecycle_history_select ON student_lifecycle_history FOR SELECT TO authenticated USING (true);
CREATE POLICY student_lifecycle_history_insert ON student_lifecycle_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY student_lifecycle_history_update ON student_lifecycle_history FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY student_lifecycle_history_delete ON student_lifecycle_history FOR DELETE TO authenticated USING (true);

-- student_preferences
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_preferences_select ON student_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY student_preferences_insert ON student_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY student_preferences_update ON student_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY student_preferences_delete ON student_preferences FOR DELETE TO authenticated USING (true);

-- students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_select ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY students_insert ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY students_update ON students FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY students_delete ON students FOR DELETE TO authenticated USING (true);

-- tips
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY tips_select ON tips FOR SELECT TO authenticated USING (true);
CREATE POLICY tips_insert ON tips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY tips_update ON tips FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY tips_delete ON tips FOR DELETE TO authenticated USING (true);

-- universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY universities_select ON universities FOR SELECT TO authenticated USING (true);
CREATE POLICY universities_insert ON universities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY universities_update ON universities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY universities_delete ON universities FOR DELETE TO authenticated USING (true);

-- user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_badges_select ON user_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY user_badges_insert ON user_badges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY user_badges_update ON user_badges FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY user_badges_delete ON user_badges FOR DELETE TO authenticated USING (true);

-- user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_roles_select ON user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY user_roles_insert ON user_roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY user_roles_update ON user_roles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY user_roles_delete ON user_roles FOR DELETE TO authenticated USING (true);

-- utilities
ALTER TABLE utilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY utilities_select ON utilities FOR SELECT TO authenticated USING (true);
CREATE POLICY utilities_insert ON utilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY utilities_update ON utilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY utilities_delete ON utilities FOR DELETE TO authenticated USING (true);

-- utility_incidents
ALTER TABLE utility_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_incidents_select ON utility_incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY utility_incidents_insert ON utility_incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY utility_incidents_update ON utility_incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY utility_incidents_delete ON utility_incidents FOR DELETE TO authenticated USING (true);

-- verification_evidence
ALTER TABLE verification_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_evidence_select ON verification_evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY verification_evidence_insert ON verification_evidence FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY verification_evidence_update ON verification_evidence FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY verification_evidence_delete ON verification_evidence FOR DELETE TO authenticated USING (true);

-- verification_records
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_records_select ON verification_records FOR SELECT TO authenticated USING (true);
CREATE POLICY verification_records_insert ON verification_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY verification_records_update ON verification_records FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY verification_records_delete ON verification_records FOR DELETE TO authenticated USING (true);

-- viewing_requests
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY viewing_requests_select ON viewing_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY viewing_requests_insert ON viewing_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY viewing_requests_update ON viewing_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY viewing_requests_delete ON viewing_requests FOR DELETE TO authenticated USING (true);

-- warnings
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY warnings_select ON warnings FOR SELECT TO authenticated USING (true);
CREATE POLICY warnings_insert ON warnings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY warnings_update ON warnings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY warnings_delete ON warnings FOR DELETE TO authenticated USING (true);

-- roommate_preferences
ALTER TABLE roommate_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY roommate_preferences_select ON roommate_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_preferences_insert ON roommate_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_preferences_update ON roommate_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_preferences_delete ON roommate_preferences FOR DELETE TO authenticated USING (true);

-- roommate_profiles
ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roommate_profiles_select ON roommate_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_profiles_insert ON roommate_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_profiles_update ON roommate_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_profiles_delete ON roommate_profiles FOR DELETE TO authenticated USING (true);

-- roommate_matches
ALTER TABLE roommate_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY roommate_matches_select ON roommate_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_matches_insert ON roommate_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_matches_update ON roommate_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_matches_delete ON roommate_matches FOR DELETE TO authenticated USING (true);

-- roommate_interactions
ALTER TABLE roommate_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY roommate_interactions_select ON roommate_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_interactions_insert ON roommate_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_interactions_update ON roommate_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_interactions_delete ON roommate_interactions FOR DELETE TO authenticated USING (true);

-- roommate_conversations
ALTER TABLE roommate_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY roommate_conversations_select ON roommate_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_conversations_insert ON roommate_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_conversations_update ON roommate_conversations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_conversations_delete ON roommate_conversations FOR DELETE TO authenticated USING (true);

-- roommate_messages
ALTER TABLE roommate_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY roommate_messages_select ON roommate_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_messages_insert ON roommate_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_messages_update ON roommate_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_messages_delete ON roommate_messages FOR DELETE TO authenticated USING (true);

-- friend_preferences
ALTER TABLE friend_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_preferences_select ON friend_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_preferences_insert ON friend_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_preferences_update ON friend_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_preferences_delete ON friend_preferences FOR DELETE TO authenticated USING (true);

-- friend_profiles
ALTER TABLE friend_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_profiles_select ON friend_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_profiles_insert ON friend_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_profiles_update ON friend_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_profiles_delete ON friend_profiles FOR DELETE TO authenticated USING (true);

-- friend_matches
ALTER TABLE friend_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_matches_select ON friend_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_matches_insert ON friend_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_matches_update ON friend_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_matches_delete ON friend_matches FOR DELETE TO authenticated USING (true);

-- friend_connections
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_connections_select ON friend_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_connections_insert ON friend_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_connections_update ON friend_connections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_connections_delete ON friend_connections FOR DELETE TO authenticated USING (true);

-- friend_interactions
ALTER TABLE friend_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_interactions_select ON friend_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_interactions_insert ON friend_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_interactions_update ON friend_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_interactions_delete ON friend_interactions FOR DELETE TO authenticated USING (true);

-- ============================================================================
-- 17_roommate_finder.sql
-- ============================================================================

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

-- ============================================================================
-- 18_friendfinder.sql
-- ============================================================================

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

-- ============================================================================
-- 16_seed_data.sql
-- ============================================================================

-- =====================================================
-- SEED DATA
-- UNIVERSITIES
-- =====================================================
INSERT INTO
    universities (name)
VALUES
    ('University of Nairobi'),
    ('Kenyatta University'),
    ('Moi University'),
    ('Jomo Kenyatta University of Agriculture and Technology'),
    ('Egerton University'),
    ('Maseno University'),
    ('Masinde Muliro University of Science and Technology'),
    ('Chuka University'),
    ('Karatina University'),
    ('Laikipia University'),
    ('Meru University of Science and Technology'),
    ('Technical University of Mombasa'),
    ('Kibabii University'),
    ('Rongo University'),
    ('University of Eldoret'),
    ('University of Kabianga'),
    ('University of Kisii'),
    ('University of Embu'),
    ('University of Eastern Africa, Baraton'),
    ('South Eastern Kenya University'),
    ('Pwani University'),
    ('Dedan Kimathi University of Technology'),
    ('Technical University of Kenya'),
    ('Multimedia University of Kenya'),
    ('Masai Mara University'),
    ('University of Nairobi, Chiromo Campus'),
    ('University of Nairobi, Kikuyu Campus'),
    ('University of Nairobi, Parklands Campus'),
    ('University of Nairobi, Lower Kabete Campus'),
    ('University of Nairobi, Upper Kabete Campus'),
    ('University of Nairobi, Kenyatta National Hospital Campus'),
    ('Technical University of Kenya'),
    ('Dedan Kimathi University of Technology'),
    ('Pwani University'),
    ('South Eastern Kenya University'),
    ('Multimedia University of Kenya') ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- DISCUSSION CATEGORIES
-- =====================================================
INSERT INTO
    discussion_categories (name)
VALUES
    ('General'),
    ('Academics'),
    ('Hostels'),
    ('Campus Life'),
    ('Relationships'),
    ('Faith'),
    ('Events'),
    ('Marketplace'),
    ('Technology'),
    ('Careers') ON CONFLICT (name) DO NOTHING;

SELECT 'CAMPOZY DATABASE CREATED SUCCESSFULLY' AS status;
