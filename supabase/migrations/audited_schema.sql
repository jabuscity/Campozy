-- ============================================================================
-- CAMPOZY DATABASE SCHEMA v3.1 FIXED
-- Production Migration
-- Part 1: Extensions, Enums, Core Reference Tables, Profiles Foundation
-- ============================================================================
BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUM TYPES
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

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    code TEXT UNIQUE CHECK(length(trim(code)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(country_id, name)
);

CREATE TABLE IF NOT EXISTS campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    city_id UUID REFERENCES cities(id),
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id);

CREATE INDEX IF NOT EXISTS idx_campuses_city ON campuses(city_id);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city_id);

-- ============================================================================
-- AUTHENTICATION FOUNDATION
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
    bio TEXT,
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university_id);

CREATE INDEX IF NOT EXISTS idx_profiles_campus ON profiles(campus_id);

-- ============================================================================
-- ROLE SYSTEM
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

-- ============================================================================
-- STUDENT DOMAIN
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
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
-- PART 2
-- Housing Core Domain
-- ============================================================================
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
-- PART 3
-- Community, Discussions, Messaging, Business Domains
-- ============================================================================
-- ============================================================================
-- DISCUSSION DOMAIN
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
-- MESSAGING DOMAIN
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(
        conversation_id,
        user_id
    )
);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL CHECK(length(trim(url)) > 0),
    file_type TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);

-- ============================================================================
-- BUSINESS DOMAIN
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
-- BUSINESS DOMAIN
-- ============================================================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE
    SET
        NULL,
        name TEXT NOT NULL CHECK (length(trim(name)) > 0),
        description TEXT,
        category TEXT CHECK (
            category IS NULL
            OR length(trim(category)) > 0
        ),
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
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (
        rating BETWEEN 1
        AND 5
    ),
    content TEXT CHECK (
        content IS NULL
        OR length(trim(content)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

CREATE INDEX idx_business_reviews_business_id ON business_reviews(business_id);

CREATE INDEX idx_business_reviews_user_id ON business_reviews(user_id);

-- ============================================================================
-- PARENT DOMAIN
-- ============================================================================
CREATE TABLE parent_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT NOT NULL DEFAULT 'parent' CHECK (length(trim(relationship)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parent_student_links (
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (length(trim(status)) > 0),
    confirmed_at TIMESTAMPTZ,
    PRIMARY KEY(parent_id, student_id)
);

CREATE TABLE parent_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK(length(trim(alert_type)) > 0),
    title TEXT NOT NULL CHECK(length(trim(title)) > 0),
    content TEXT CHECK(
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
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    scope founder_scope NOT NULL,
    scope_entity_id UUID,
    max_members INTEGER NOT NULL CHECK(max_members > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE founder_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id) ON DELETE CASCADE,
    contribution_score NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK(contribution_score >= 0),
    qualified_at TIMESTAMPTZ,
    became_founder_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, cohort_id)
);

CREATE INDEX idx_founder_memberships_user_id ON founder_memberships(user_id);

CREATE INDEX idx_founder_memberships_cohort_id ON founder_memberships(cohort_id);

CREATE TABLE founder_qualification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(length(trim(event_type)) > 0),
    points INTEGER NOT NULL,
    description TEXT CHECK(
        description IS NULL
        OR length(trim(description)) > 0
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_founder_events_user_id ON founder_qualification_events(user_id);

CREATE INDEX idx_founder_events_cohort_id ON founder_qualification_events(cohort_id);

-- ============================================================================
-- AMBASSADOR DOMAIN
-- ============================================================================
CREATE TABLE ambassador_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ambassador_programs_campus_id ON ambassador_programs(campus_id);

CREATE TABLE ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES ambassador_programs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK(length(trim(status)) > 0),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);

CREATE INDEX idx_ambassadors_program_id ON ambassadors(program_id);

CREATE TABLE ambassador_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL CHECK(length(trim(task_type)) > 0),
    description TEXT,
    status assignment_status NOT NULL DEFAULT 'assigned',
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
    region_id UUID REFERENCES cities(id) ON DELETE
    SET
        NULL,
        certification_level TEXT NOT NULL DEFAULT 'trainee' CHECK(length(trim(certification_level)) > 0),
        reputation_score NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK(reputation_score >= 0),
        total_verifications INTEGER NOT NULL DEFAULT 0 CHECK(total_verifications >= 0),
        accuracy_rate NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK(
            accuracy_rate BETWEEN 0
            AND 100
        ),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(user_id)
);

CREATE INDEX idx_scouts_region_id ON scouts(region_id);

CREATE TABLE scout_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    assignment_type TEXT NOT NULL DEFAULT 'verification' CHECK(length(trim(assignment_type)) > 0),
    status assignment_status NOT NULL DEFAULT 'assigned',
    priority TEXT NOT NULL DEFAULT 'standard' CHECK(length(trim(priority)) > 0),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scout_assignments_scout_id ON scout_assignments(scout_id);

CREATE INDEX idx_scout_assignments_property_id ON scout_assignments(property_id);

CREATE TABLE scout_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES scout_assignments(id) ON DELETE CASCADE,
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    findings TEXT NOT NULL CHECK(length(trim(findings)) > 0),
    recommendation TEXT,
    evidence_urls TEXT [],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scout_reports_assignment_id ON scout_reports(assignment_id);

CREATE INDEX idx_scout_reports_scout_id ON scout_reports(scout_id);

CREATE TABLE scout_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES scout_reports(id) ON DELETE CASCADE,
    auditor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL CHECK(length(trim(outcome)) > 0),
    notes TEXT,
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
    name TEXT NOT NULL CHECK(length(trim(name)) > 0),
    description TEXT,
    website TEXT,
    logo_url TEXT,
    verification_level verification_level NOT NULL DEFAULT 'unverified',
    contact_user_id UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_employers_contact_user_id ON employers(contact_user_id);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id) ON DELETE
    SET
        NULL,
        creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        type opportunity_type NOT NULL,
        title TEXT NOT NULL CHECK(length(trim(title)) > 0),
        description TEXT NOT NULL CHECK(length(trim(description)) > 0),
        requirements JSONB NOT NULL DEFAULT '[]',
        location TEXT,
        is_remote BOOLEAN NOT NULL DEFAULT FALSE,
        compensation TEXT,
        application_url TEXT,
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
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'applied',
    cover_note TEXT,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(opportunity_id, student_id)
);

-- ============================================================================
-- MENTORSHIP DOMAIN
-- ============================================================================
CREATE TABLE mentorship_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expertise TEXT [],
    bio TEXT,
    max_mentees INTEGER NOT NULL DEFAULT 3 CHECK(max_mentees > 0),
    is_accepting BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE mentorship_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES mentorship_profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status mentorship_status NOT NULL DEFAULT 'active',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    UNIQUE(mentor_id, mentee_id)
);

-- ============================================================================
-- ALUMNI DOMAIN
-- ============================================================================
CREATE TABLE alumni_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
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
    UNIQUE(user_id)
);

CREATE TABLE recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK(length(trim(entity_type)) > 0),
    action TEXT NOT NULL CHECK(length(trim(action)) > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recommendation_feedback_user_id ON recommendation_feedback(user_id);

CREATE INDEX idx_recommendation_feedback_entity ON recommendation_feedback(entity_id, entity_type);

CREATE INDEX idx_recommendation_feedback_action ON recommendation_feedback(action);

-- ============================================================================
-- SAVED ITEMS DOMAIN
-- ============================================================================
CREATE TABLE saved_properties (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, property_id)
);

CREATE TABLE saved_businesses (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, business_id)
);

CREATE TABLE saved_opportunities (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY(user_id, opportunity_id)
);

-- ============================================================================
-- AKWET TRANSITION DOMAIN
-- ============================================================================
CREATE TABLE transition_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_city_id UUID REFERENCES cities(id) ON DELETE
    SET
        NULL,
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
-- EVENT DOMAIN
-- ============================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        event_type TEXT NOT NULL CHECK(length(trim(event_type)) > 0),
        target_id UUID,
        target_type TEXT,
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
    content TEXT,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

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
-- GROWTH / REFERRAL DOMAIN
-- ============================================================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referred_email TEXT NOT NULL CHECK (length(trim(referred_email)) > 0),
    referred_user_id UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (length(trim(status)) > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

CREATE INDEX idx_referrals_referred_user ON referrals(referred_user_id);

CREATE TABLE invitation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE CHECK (length(trim(code)) > 0),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    max_uses INTEGER NOT NULL DEFAULT 10 CHECK (max_uses > 0),
    current_uses INTEGER NOT NULL DEFAULT 0 CHECK (
        current_uses >= 0
        AND current_uses <= max_uses
    ),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_codes_creator ON invitation_codes(creator_id);

CREATE TABLE waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT NOT NULL,
    campus_id UUID REFERENCES campuses(id) ON DELETE
    SET
        NULL,
        country_id UUID REFERENCES countries(id) ON DELETE
    SET
        NULL,
        source TEXT,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(email)
);

CREATE INDEX idx_waitlists_campus ON waitlists(campus_id);

CREATE INDEX idx_waitlists_country ON waitlists(country_id);

-- ============================================================================
-- AUDIT & GOVERNANCE
-- ============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        action TEXT NOT NULL CHECK(length(trim(action)) > 0),
        entity_type TEXT NOT NULL CHECK(length(trim(entity_type)) > 0),
        entity_id UUID NOT NULL,
        old_value JSONB,
        new_value JSONB,
        ip_address INET,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE TABLE moderation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        target_user_id UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        target_entity_id UUID,
        target_entity_type TEXT,
        reason TEXT NOT NULL CHECK(length(trim(reason)) > 0),
        description TEXT,
        priority TEXT NOT NULL DEFAULT 'standard' CHECK(length(trim(priority)) > 0),
        status moderation_status NOT NULL DEFAULT 'open',
        assigned_to UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_moderation_cases_reported ON moderation_cases(reported_by);

CREATE INDEX idx_moderation_cases_target_user ON moderation_cases(target_user_id);

CREATE INDEX idx_moderation_cases_status ON moderation_cases(status);

CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES moderation_cases(id) ON DELETE CASCADE,
    action_type moderation_action_type NOT NULL,
    moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK(length(trim(reason)) > 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_moderation_actions_case ON moderation_actions(case_id);

CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_id);

CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES moderation_actions(id) ON DELETE CASCADE,
    appellant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK(length(trim(reason)) > 0),
    status appeal_status NOT NULL DEFAULT 'pending',
    reviewer_id UUID REFERENCES profiles(id) ON DELETE
    SET
        NULL,
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appeals_action ON appeals(action_id);

CREATE INDEX idx_appeals_appellant ON appeals(appellant_id);

CREATE INDEX idx_appeals_status ON appeals(status);

-- ============================================================================
-- ANALYTICS DOMAIN
-- ============================================================================
CREATE TABLE property_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    view_count INTEGER NOT NULL DEFAULT 0 CHECK(view_count >= 0),
    save_count INTEGER NOT NULL DEFAULT 0 CHECK(save_count >= 0),
    inquiry_count INTEGER NOT NULL DEFAULT 0 CHECK(inquiry_count >= 0),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK(review_count >= 0),
    avg_rating NUMERIC(3, 2) CHECK (
        avg_rating IS NULL
        OR avg_rating BETWEEN 1
        AND 5
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, period_start),
    CHECK(period_end >= period_start)
);

CREATE INDEX idx_property_analytics_property ON property_analytics(property_id);

CREATE TABLE campus_intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    active_properties INTEGER NOT NULL DEFAULT 0 CHECK(active_properties >= 0),
    avg_campozy_score NUMERIC(5, 2) CHECK (
        avg_campozy_score IS NULL
        OR avg_campozy_score BETWEEN 0
        AND 100
    ),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK(review_count >= 0),
    discussion_count INTEGER NOT NULL DEFAULT 0 CHECK(discussion_count >= 0),
    contributor_count INTEGER NOT NULL DEFAULT 0 CHECK(contributor_count >= 0),
    founder_count INTEGER NOT NULL DEFAULT 0 CHECK(founder_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campus_id, period_start),
    CHECK(period_end >= period_start)
);

CREATE INDEX idx_campus_reports_campus ON campus_intelligence_reports(campus_id);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);

CREATE INDEX idx_properties_owner ON properties(owner_id);

CREATE INDEX idx_properties_score ON properties(campozy_score DESC);

CREATE INDEX idx_properties_active ON properties(is_active)
WHERE
    is_active = TRUE;

CREATE INDEX idx_reviews_property ON property_reviews(property_id);

CREATE INDEX idx_reviews_user ON property_reviews(user_id);

CREATE INDEX idx_reviews_created ON property_reviews(created_at DESC);

CREATE INDEX idx_discussions_campus ON discussions(campus_id);

CREATE INDEX idx_discussions_created ON discussions(created_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);

CREATE INDEX idx_messages_sender ON messages(sender_id);

CREATE INDEX idx_events_created_desc ON events(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Production Version
-- Every table explicitly enables RLS.
-- Service Role bypasses RLS automatically.
-- No anonymous access unless explicitly granted.
-- ============================================================================
-- ============================================================================
-- CORE LOOKUP TABLES
-- ============================================================================
ALTER TABLE
    countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY countries_read ON countries FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_read ON cities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY universities_read ON universities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY campuses_read ON campuses FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhoods_read ON neighborhoods FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    neighborhood_landmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_landmarks_read ON neighborhood_landmarks FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    neighborhood_campus_distances ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_campus_distances_read ON neighborhood_campus_distances FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY amenities_read ON amenities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    utilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY utilities_read ON utilities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    utility_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_types_read ON utility_types FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    hygiene_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_categories_read ON hygiene_categories FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    discussion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_categories_read ON discussion_categories FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY badges_read ON badges FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_read ON roles FOR
SELECT
    TO authenticated USING (true);

-- ============================================================================
-- PROFILES
-- ============================================================================
ALTER TABLE
    profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_read ON profiles FOR
SELECT
    TO authenticated USING (true);

CREATE POLICY profiles_insert ON profiles FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update ON profiles FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STUDENTS
-- ============================================================================
ALTER TABLE
    students ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_select ON students FOR
SELECT
    TO authenticated USING (auth.uid() = id);

CREATE POLICY students_insert ON students FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY students_update ON students FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE
    student_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_preferences_select ON student_preferences FOR
SELECT
    TO authenticated USING (auth.uid() = student_id);

CREATE POLICY student_preferences_insert ON student_preferences FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = student_id);

CREATE POLICY student_preferences_update ON student_preferences FOR
UPDATE
    TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);

ALTER TABLE
    student_lifecycle_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_lifecycle_history_select ON student_lifecycle_history FOR
SELECT
    TO authenticated USING (auth.uid() = student_id);

-- ============================================================================
-- PARENTS
-- ============================================================================
ALTER TABLE
    parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY parent_profiles_select ON parent_profiles FOR
SELECT
    TO authenticated USING (auth.uid() = id);

CREATE POLICY parent_profiles_insert ON parent_profiles FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY parent_profiles_update ON parent_profiles FOR
UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE
    parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY parent_student_links_select ON parent_student_links FOR
SELECT
    TO authenticated USING (
        auth.uid() = parent_id
        OR auth.uid() = student_id
    );

CREATE POLICY parent_student_links_insert ON parent_student_links FOR
INSERT
    TO authenticated WITH CHECK (auth.uid() = parent_id);

ALTER TABLE
    parent_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY parent_alerts_select ON parent_alerts FOR
SELECT
    TO authenticated USING (auth.uid() = parent_id);

CREATE POLICY parent_alerts_update ON parent_alerts FOR
UPDATE
    TO authenticated USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

-- ============================================================================
-- PROPERTIES
-- ============================================================================
ALTER TABLE
    properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY properties_read ON properties FOR
SELECT
    TO authenticated USING (is_active = true);

CREATE POLICY properties_insert ON properties FOR
INSERT
    TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY properties_update ON properties FOR
UPDATE
    TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY properties_delete ON properties FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================================
-- PROPERTY ROOMS
-- ============================================================================
ALTER TABLE
    property_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_rooms_read ON property_rooms FOR
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

CREATE POLICY property_rooms_insert ON property_rooms FOR
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

CREATE POLICY property_rooms_update ON property_rooms FOR
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

CREATE POLICY property_rooms_delete ON property_rooms FOR DELETE TO authenticated USING (
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

-- ============================================================================
-- PROPERTY MEDIA
-- ============================================================================
ALTER TABLE
    property_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_media_read ON property_media FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_media.property_id
                AND properties.is_active = true
        )
    );

CREATE POLICY property_media_insert ON property_media FOR
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

CREATE POLICY property_media_update ON property_media FOR
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

CREATE POLICY property_media_delete ON property_media FOR DELETE TO authenticated USING (
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

-- ============================================================================
-- PROPERTY AMENITIES
-- ============================================================================
ALTER TABLE
    property_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_amenities_read ON property_amenities FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_amenities.property_id
                AND properties.is_active = true
        )
    );

CREATE POLICY property_amenities_insert ON property_amenities FOR
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

CREATE POLICY property_amenities_update ON property_amenities FOR
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

CREATE POLICY property_amenities_delete ON property_amenities FOR DELETE TO authenticated USING (
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

-- ============================================================================
-- PROPERTY UTILITIES
-- ============================================================================
ALTER TABLE
    property_utilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_utilities_read ON property_utilities FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_utilities.property_id
                AND properties.is_active = true
        )
    );

CREATE POLICY property_utilities_insert ON property_utilities FOR
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

CREATE POLICY property_utilities_update ON property_utilities FOR
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

CREATE POLICY property_utilities_delete ON property_utilities FOR DELETE TO authenticated USING (
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

-- ============================================================================
-- REFERENCE TABLES
-- ============================================================================
ALTER TABLE
    amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY amenities_read ON amenities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    utilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY utilities_read ON utilities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    utility_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_types_read ON utility_types FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    hygiene_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_categories_read ON hygiene_categories FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY badges_read ON badges FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    discussion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_categories_read ON discussion_categories FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY universities_read ON universities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY campuses_read ON campuses FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY countries_read ON countries FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY cities_read ON cities FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    neighborhoods ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhoods_read ON neighborhoods FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    neighborhood_landmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_landmarks_read ON neighborhood_landmarks FOR
SELECT
    TO authenticated USING (true);

ALTER TABLE
    neighborhood_campus_distances ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_campus_distances_read ON neighborhood_campus_distances FOR
SELECT
    TO authenticated USING (true);

-- ============================================================================
-- PROPERTY REVIEWS
-- ============================================================================
ALTER TABLE
    property_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_reviews_read ON property_reviews FOR
SELECT
    TO authenticated USING (true);

CREATE POLICY property_reviews_insert ON property_reviews FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY property_reviews_update ON property_reviews FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY property_reviews_delete ON property_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- DISCUSSIONS
-- ============================================================================
ALTER TABLE
    discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussions_read ON discussions FOR
SELECT
    TO authenticated USING (true);

CREATE POLICY discussions_insert ON discussions FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY discussions_update ON discussions FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY discussions_delete ON discussions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- DISCUSSION REPLIES
-- ============================================================================
ALTER TABLE
    discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_replies_read ON discussion_replies FOR
SELECT
    TO authenticated USING (true);

CREATE POLICY discussion_replies_insert ON discussion_replies FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY discussion_replies_update ON discussion_replies FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY discussion_replies_delete ON discussion_replies FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- CONVERSATIONS
-- ============================================================================
ALTER TABLE
    conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversations_read ON conversations FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                conversation_members
            WHERE
                conversation_members.conversation_id = conversations.id
                AND conversation_members.user_id = auth.uid()
        )
    );

CREATE POLICY conversations_insert ON conversations FOR
INSERT
    TO authenticated WITH CHECK (true);

CREATE POLICY conversations_update ON conversations FOR
UPDATE
    TO authenticated USING (false);

CREATE POLICY conversations_delete ON conversations FOR DELETE TO authenticated USING (false);

-- ============================================================================
-- CONVERSATION MEMBERS
-- ============================================================================
ALTER TABLE
    conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY conversation_members_read ON conversation_members FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                conversation_members cm
            WHERE
                cm.conversation_id = conversation_members.conversation_id
                AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY conversation_members_insert ON conversation_members FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY conversation_members_delete ON conversation_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- MESSAGES
-- ============================================================================
ALTER TABLE
    messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY messages_read ON messages FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                conversation_members
            WHERE
                conversation_members.conversation_id = messages.conversation_id
                AND conversation_members.user_id = auth.uid()
        )
    );

CREATE POLICY messages_insert ON messages FOR
INSERT
    TO authenticated WITH CHECK (
        sender_id = auth.uid()
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

CREATE POLICY messages_update ON messages FOR
UPDATE
    TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

CREATE POLICY messages_delete ON messages FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- ============================================================================
-- MESSAGE ATTACHMENTS
-- ============================================================================
ALTER TABLE
    message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY message_attachments_read ON message_attachments FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                messages
                JOIN conversation_members ON conversation_members.conversation_id = messages.conversation_id
            WHERE
                messages.id = message_attachments.message_id
                AND conversation_members.user_id = auth.uid()
        )
    );

CREATE POLICY message_attachments_insert ON message_attachments FOR
INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                messages
            WHERE
                messages.id = message_attachments.message_id
                AND messages.sender_id = auth.uid()
        )
    );

CREATE POLICY message_attachments_update ON message_attachments FOR
UPDATE
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                messages
            WHERE
                messages.id = message_attachments.message_id
                AND messages.sender_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                messages
            WHERE
                messages.id = message_attachments.message_id
                AND messages.sender_id = auth.uid()
        )
    );

CREATE POLICY message_attachments_delete ON message_attachments FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            messages
        WHERE
            messages.id = message_attachments.message_id
            AND messages.sender_id = auth.uid()
    )
);

-- ============================================================================
-- BUSINESSES
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE
    businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY businesses_read ON businesses FOR
SELECT
    TO authenticated USING (is_active = TRUE);

CREATE POLICY businesses_insert ON businesses FOR
INSERT
    TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY businesses_update ON businesses FOR
UPDATE
    TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY businesses_delete ON businesses FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================================
-- BUSINESS MEDIA
-- ============================================================================
ALTER TABLE
    business_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_media_read ON business_media FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                businesses
            WHERE
                businesses.id = business_media.business_id
                AND businesses.is_active = TRUE
        )
    );

CREATE POLICY business_media_insert ON business_media FOR
INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                businesses
            WHERE
                businesses.id = business_media.business_id
                AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY business_media_update ON business_media FOR
UPDATE
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                businesses
            WHERE
                businesses.id = business_media.business_id
                AND businesses.owner_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT
                1
            FROM
                businesses
            WHERE
                businesses.id = business_media.business_id
                AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY business_media_delete ON business_media FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT
            1
        FROM
            businesses
        WHERE
            businesses.id = business_media.business_id
            AND businesses.owner_id = auth.uid()
    )
);

-- ============================================================================
-- BUSINESS REVIEWS
-- ============================================================================
ALTER TABLE
    business_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_reviews_read ON business_reviews FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY business_reviews_insert ON business_reviews FOR
INSERT
    TO authenticated WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY business_reviews_update ON business_reviews FOR
UPDATE
    TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());

CREATE POLICY business_reviews_delete ON business_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

-- ============================================================================
-- BUSINESS REVIEW REPLIES
-- ============================================================================
ALTER TABLE
    business_review_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_review_replies_read ON business_review_replies FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY business_review_replies_insert ON business_review_replies FOR
INSERT
    TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY business_review_replies_update ON business_review_replies FOR
UPDATE
    TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY business_review_replies_delete ON business_review_replies FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ============================================================================
-- BUSINESS REVIEW VOTES
-- ============================================================================
ALTER TABLE
    business_review_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_review_votes_read ON business_review_votes FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY business_review_votes_insert ON business_review_votes FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY business_review_votes_delete ON business_review_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- COMMUNITY POSTS
-- ============================================================================
ALTER TABLE
    community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_posts_read ON community_posts FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY community_posts_insert ON community_posts FOR
INSERT
    TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY community_posts_update ON community_posts FOR
UPDATE
    TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY community_posts_delete ON community_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ============================================================================
-- COMMUNITY COMMENTS
-- ============================================================================
ALTER TABLE
    community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_comments_read ON community_comments FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY community_comments_insert ON community_comments FOR
INSERT
    TO authenticated WITH CHECK (author_id = auth.uid());

CREATE POLICY community_comments_update ON community_comments FOR
UPDATE
    TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY community_comments_delete ON community_comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- ============================================================================
-- COMMUNITY LIKES
-- ============================================================================
ALTER TABLE
    community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_likes_read ON community_likes FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY community_likes_insert ON community_likes FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY community_likes_delete ON community_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- DISCUSSIONS
-- ============================================================================
ALTER TABLE
    discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussions_read ON discussions FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY discussions_insert ON discussions FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY discussions_update ON discussions FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY discussions_delete ON discussions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- DISCUSSION REPLIES
-- ============================================================================
ALTER TABLE
    discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY discussion_replies_read ON discussion_replies FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY discussion_replies_insert ON discussion_replies FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY discussion_replies_update ON discussion_replies FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY discussion_replies_delete ON discussion_replies FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- REPUTATION SCORES
-- ============================================================================
ALTER TABLE
    reputation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY reputation_scores_read ON reputation_scores FOR
SELECT
    TO authenticated USING (TRUE);

-- ============================================================================
-- REPUTATION EVENTS
-- ============================================================================
ALTER TABLE
    reputation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY reputation_events_read ON reputation_events FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION REQUESTS
-- ============================================================================
ALTER TABLE
    verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_requests_read ON verification_requests FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY verification_requests_insert ON verification_requests FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY verification_requests_update ON verification_requests FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY verification_requests_delete ON verification_requests FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION DOCUMENTS
-- ============================================================================
ALTER TABLE
    verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY verification_documents_read ON verification_documents FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY verification_documents_insert ON verification_documents FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY verification_documents_update ON verification_documents FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY verification_documents_delete ON verification_documents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- FOUNDER PROFILES
-- ============================================================================
ALTER TABLE
    founder_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY founder_profiles_read ON founder_profiles FOR
SELECT
    TO authenticated USING (TRUE);

-- ============================================================================
-- AMBASSADOR PROFILES
-- ============================================================================
ALTER TABLE
    ambassador_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY ambassador_profiles_read ON ambassador_profiles FOR
SELECT
    TO authenticated USING (TRUE);

-- ============================================================================
-- SCOUT PROFILES
-- ============================================================================
ALTER TABLE
    scout_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY scout_profiles_read ON scout_profiles FOR
SELECT
    TO authenticated USING (TRUE);

-- ============================================================================
-- ALUMNI PROFILES
-- ============================================================================
ALTER TABLE
    alumni_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY alumni_profiles_read ON alumni_profiles FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY alumni_profiles_insert ON alumni_profiles FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY alumni_profiles_update ON alumni_profiles FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY alumni_profiles_delete ON alumni_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- MENTORSHIP PROFILES
-- ============================================================================
ALTER TABLE
    mentorship_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentorship_profiles_read ON mentorship_profiles FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY mentorship_profiles_insert ON mentorship_profiles FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY mentorship_profiles_update ON mentorship_profiles FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY mentorship_profiles_delete ON mentorship_profiles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- MENTORSHIP REQUESTS
-- ============================================================================
ALTER TABLE
    mentorship_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY mentorship_requests_read ON mentorship_requests FOR
SELECT
    TO authenticated USING (
        requester_id = auth.uid()
        OR mentor_id = auth.uid()
    );

CREATE POLICY mentorship_requests_insert ON mentorship_requests FOR
INSERT
    TO authenticated WITH CHECK (requester_id = auth.uid());

CREATE POLICY mentorship_requests_update ON mentorship_requests FOR
UPDATE
    TO authenticated USING (
        requester_id = auth.uid()
        OR mentor_id = auth.uid()
    ) WITH CHECK (
        requester_id = auth.uid()
        OR mentor_id = auth.uid()
    );

CREATE POLICY mentorship_requests_delete ON mentorship_requests FOR DELETE TO authenticated USING (requester_id = auth.uid());

-- ============================================================================
-- RECOMMENDATIONS
-- ============================================================================
ALTER TABLE
    recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY recommendations_read ON recommendations FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- OPPORTUNITIES
-- ============================================================================
ALTER TABLE
    opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY opportunities_read ON opportunities FOR
SELECT
    TO authenticated USING (TRUE);

CREATE POLICY opportunities_insert ON opportunities FOR
INSERT
    TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY opportunities_update ON opportunities FOR
UPDATE
    TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

CREATE POLICY opportunities_delete ON opportunities FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ============================================================================
-- OPPORTUNITY APPLICATIONS
-- ============================================================================
ALTER TABLE
    opportunity_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY opportunity_applications_read ON opportunity_applications FOR
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

CREATE POLICY opportunity_applications_insert ON opportunity_applications FOR
INSERT
    TO authenticated WITH CHECK (applicant_id = auth.uid());

CREATE POLICY opportunity_applications_update ON opportunity_applications FOR
UPDATE
    TO authenticated USING (applicant_id = auth.uid()) WITH CHECK (applicant_id = auth.uid());

CREATE POLICY opportunity_applications_delete ON opportunity_applications FOR DELETE TO authenticated USING (applicant_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
ALTER TABLE
    notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_read ON notifications FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- No INSERT policy.
-- Notifications are generated by trusted backend logic.
-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================
ALTER TABLE
    notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_preferences_read ON notification_preferences FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY notification_preferences_insert ON notification_preferences FOR
INSERT
    TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY notification_preferences_update ON notification_preferences FOR
UPDATE
    TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- REFERRALS
-- ============================================================================
ALTER TABLE
    referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY referrals_read ON referrals FOR
SELECT
    TO authenticated USING (
        referrer_id = auth.uid()
        OR referred_user_id = auth.uid()
    );

CREATE POLICY referrals_insert ON referrals FOR
INSERT
    TO authenticated WITH CHECK (referrer_id = auth.uid());

CREATE POLICY referrals_delete ON referrals FOR DELETE TO authenticated USING (referrer_id = auth.uid());

-- Referral completion/status is managed by backend logic.
-- ============================================================================
-- INVITATION CODES
-- ============================================================================
ALTER TABLE
    invitation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitation_codes_read ON invitation_codes FOR
SELECT
    TO authenticated USING (creator_id = auth.uid());

CREATE POLICY invitation_codes_insert ON invitation_codes FOR
INSERT
    TO authenticated WITH CHECK (creator_id = auth.uid());

CREATE POLICY invitation_codes_update ON invitation_codes FOR
UPDATE
    TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());

CREATE POLICY invitation_codes_delete ON invitation_codes FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- ============================================================================
-- WAITLIST
-- ============================================================================
ALTER TABLE
    waitlists ENABLE ROW LEVEL SECURITY;

-- No public access.
-- Managed by backend/service role only.
-- ============================================================================
-- MODERATION CASES
-- ============================================================================
ALTER TABLE
    moderation_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY moderation_cases_read ON moderation_cases FOR
SELECT
    TO authenticated USING (
        reported_by = auth.uid()
        OR target_user_id = auth.uid()
    );

CREATE POLICY moderation_cases_insert ON moderation_cases FOR
INSERT
    TO authenticated WITH CHECK (reported_by = auth.uid());

CREATE POLICY moderation_cases_delete ON moderation_cases FOR DELETE TO authenticated USING (reported_by = auth.uid());

-- Moderators/service role manage investigation,
-- assignment and resolution.
-- ============================================================================
-- MODERATION ACTIONS
-- ============================================================================
ALTER TABLE
    moderation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY moderation_actions_read ON moderation_actions FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                moderation_cases
            WHERE
                moderation_cases.id = moderation_actions.case_id
                AND (
                    moderation_cases.reported_by = auth.uid()
                    OR moderation_cases.target_user_id = auth.uid()
                )
        )
    );

-- No INSERT / UPDATE / DELETE policies.
-- Service role and moderators perform enforcement.
-- ============================================================================
-- APPEALS
-- ============================================================================
ALTER TABLE
    appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY appeals_read ON appeals FOR
SELECT
    TO authenticated USING (appellant_id = auth.uid());

CREATE POLICY appeals_insert ON appeals FOR
INSERT
    TO authenticated WITH CHECK (appellant_id = auth.uid());

CREATE POLICY appeals_delete ON appeals FOR DELETE TO authenticated USING (appellant_id = auth.uid());

-- Appeal decisions are handled by moderators.
-- ============================================================================
-- AUDIT LOGS
-- ============================================================================
ALTER TABLE
    audit_logs ENABLE ROW LEVEL SECURITY;

-- No authenticated policies.
-- Audit logs are intentionally invisible to end users.
-- Service role bypasses RLS automatically.
-- ============================================================================
-- PROPERTY ANALYTICS
-- ============================================================================
ALTER TABLE
    property_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_analytics_read ON property_analytics FOR
SELECT
    TO authenticated USING (
        EXISTS (
            SELECT
                1
            FROM
                properties
            WHERE
                properties.id = property_analytics.property_id
                AND properties.owner_id = auth.uid()
        )
    );

-- Analytics are maintained by backend jobs.
-- ============================================================================
-- CAMPUS INTELLIGENCE REPORTS
-- ============================================================================
ALTER TABLE
    campus_intelligence_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY campus_intelligence_reports_read ON campus_intelligence_reports FOR
SELECT
    TO authenticated USING (TRUE);

-- ============================================================================
-- EVENTS
-- ============================================================================
ALTER TABLE
    events ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_read ON events FOR
SELECT
    TO authenticated USING (user_id = auth.uid());

-- Backend-generated event stream.
-- No INSERT / UPDATE / DELETE policies.
-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS unaccent;

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- ----------------------------------------------------------------------------
-- USERS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ----------------------------------------------------------------------------
-- STUDENTS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_university ON students(university_id);

CREATE INDEX IF NOT EXISTS idx_students_campus ON students(campus_id);

CREATE INDEX IF NOT EXISTS idx_students_graduation ON students(expected_graduation_year);

-- ----------------------------------------------------------------------------
-- PROPERTIES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_owner ON properties(owner_id);

CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood_id);

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);

CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active)
WHERE
    is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_properties_score ON properties(campozy_score DESC);

CREATE INDEX IF NOT EXISTS idx_properties_created ON properties(created_at DESC);

-- ----------------------------------------------------------------------------
-- PROPERTY SEARCH
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_properties_name_trgm ON properties USING gin(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_properties_address_trgm ON properties USING gin(address gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- PROPERTY ROOMS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_property_rooms_property ON property_rooms(property_id);

-- ----------------------------------------------------------------------------
-- PROPERTY MEDIA
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_property_media_property ON property_media(property_id);

-- ----------------------------------------------------------------------------
-- PROPERTY REVIEWS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_property_reviews_property ON property_reviews(property_id);

CREATE INDEX IF NOT EXISTS idx_property_reviews_reviewer ON property_reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_property_reviews_created ON property_reviews(created_at DESC);

-- ----------------------------------------------------------------------------
-- SAVED PROPERTIES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON saved_properties(user_id);

CREATE INDEX IF NOT EXISTS idx_saved_properties_property ON saved_properties(property_id);

-- ----------------------------------------------------------------------------
-- BUSINESSES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);

CREATE INDEX IF NOT EXISTS idx_businesses_neighborhood ON businesses(neighborhood_id);

CREATE INDEX IF NOT EXISTS idx_businesses_score ON businesses(campozy_score DESC);

-- ----------------------------------------------------------------------------
-- BUSINESS REVIEWS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_business_reviews_business ON business_reviews(business_id);

CREATE INDEX IF NOT EXISTS idx_business_reviews_reviewer ON business_reviews(reviewer_id);

CREATE INDEX IF NOT EXISTS idx_business_reviews_created ON business_reviews(created_at DESC);

-- ----------------------------------------------------------------------------
-- DISCUSSIONS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_discussions_campus ON discussions(campus_id);

CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category_id);

CREATE INDEX IF NOT EXISTS idx_discussions_created ON discussions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussions_title_trgm ON discussions USING gin(title gin_trgm_ops);

-- ----------------------------------------------------------------------------
-- DISCUSSION REPLIES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion ON discussion_replies(discussion_id);

-- ----------------------------------------------------------------------------
-- COMMUNITY
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);

CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_community_likes_post ON community_likes(post_id);

-- ----------------------------------------------------------------------------
-- MESSAGING
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read)
WHERE
    is_read = FALSE;

-- ----------------------------------------------------------------------------
-- OPPORTUNITIES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_opportunities_creator ON opportunities(created_by);

CREATE INDEX IF NOT EXISTS idx_opportunities_campus ON opportunities(campus_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON opportunities(application_deadline);

-- ----------------------------------------------------------------------------
-- ANALYTICS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_property_analytics_property ON property_analytics(property_id);

CREATE INDEX IF NOT EXISTS idx_campus_reports_campus ON campus_intelligence_reports(campus_id);

-- ----------------------------------------------------------------------------
-- AUDIT
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================================
-- COMMON TRIGGER FUNCTIONS
-- ============================================================================
CREATE
OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $ $ BEGIN NEW.updated_at := NOW();

RETURN NEW;

END;

$ $;

-- ============================================================================
-- AUTO CREATE PROFILE AFTER AUTH SIGNUP
-- ============================================================================
CREATE
OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = public AS $ $ BEGIN
INSERT INTO
    public.profiles (
        id,
        full_name,
        username,
        avatar_url
    )
VALUES
    (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data ->> 'full_name',
            ''
        ),
        COALESCE(
            NEW.email,
            NEW.id :: text
        ),
        NEW.raw_user_meta_data ->> 'avatar_url'
    ) ON CONFLICT (id) DO NOTHING;

INSERT INTO
    public.user_roles (user_id, role_id)
SELECT
    NEW.id,
    roles.id
FROM
    public.roles
WHERE
    roles.name = 'student' ON CONFLICT DO NOTHING;

RETURN NEW;

END;

$ $;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER
INSERT
    ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- AUTOMATIC updated_at TRIGGERS
-- ============================================================================
CREATE TRIGGER profiles_updated_at BEFORE
UPDATE
    ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER students_updated_at BEFORE
UPDATE
    ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER parent_profiles_updated_at BEFORE
UPDATE
    ON parent_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at BEFORE
UPDATE
    ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER property_rooms_updated_at BEFORE
UPDATE
    ON property_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER businesses_updated_at BEFORE
UPDATE
    ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER discussions_updated_at BEFORE
UPDATE
    ON discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER opportunities_updated_at BEFORE
UPDATE
    ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER mentorship_profiles_updated_at BEFORE
UPDATE
    ON mentorship_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER alumni_profiles_updated_at BEFORE
UPDATE
    ON alumni_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notification_preferences_updated_at BEFORE
UPDATE
    ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- DISCUSSION REPLY COUNTER
-- ============================================================================
CREATE
OR REPLACE FUNCTION increment_reply_count() RETURNS TRIGGER LANGUAGE plpgsql AS $ $ BEGIN
UPDATE
    discussions
SET
    reply_count = reply_count + 1
WHERE
    id = NEW.discussion_id;

RETURN NEW;

END;

$ $;

CREATE TRIGGER discussion_reply_created
AFTER
INSERT
    ON discussion_replies FOR EACH ROW EXECUTE FUNCTION increment_reply_count();

-- =====================================================
-- RECALCULATE CAMPOZY SCORE
-- =====================================================
-- =====================================================
-- RECALCULATE CAMPOZY SCORE
-- =====================================================
CREATE
OR REPLACE FUNCTION recalculate_campozy_score(p_student_id UUID) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = public AS $ $ DECLARE v_profile_score INTEGER := 0;

v_posts INTEGER := 0;

v_replies INTEGER := 0;

v_score INTEGER := 0;

BEGIN ----------------------------------------------------
-- Profile completion (maximum 20 points)
----------------------------------------------------
SELECT
    (
        CASE
            WHEN full_name IS NOT NULL
            AND trim(full_name) <> '' THEN 5
            ELSE 0
        END
    ) + (
        CASE
            WHEN avatar_url IS NOT NULL
            AND trim(avatar_url) <> '' THEN 5
            ELSE 0
        END
    ) + (
        CASE
            WHEN bio IS NOT NULL
            AND trim(bio) <> '' THEN 5
            ELSE 0
        END
    ) + (
        CASE
            WHEN university_id IS NOT NULL THEN 5
            ELSE 0
        END
    ) INTO v_profile_score
FROM
    public.profiles
WHERE
    id = p_student_id;

----------------------------------------------------
-- Discussions (maximum 20 points)
----------------------------------------------------
SELECT
    COUNT(*) INTO v_posts
FROM
    public.discussions
WHERE
    user_id = p_student_id;

----------------------------------------------------
-- Discussion replies (maximum 20 points)
----------------------------------------------------
SELECT
    COUNT(*) INTO v_replies
FROM
    public.discussion_replies
WHERE
    user_id = p_student_id;

----------------------------------------------------
-- Final score (maximum 100)
----------------------------------------------------
v_score := v_profile_score + LEAST(v_posts * 3, 30) + LEAST(v_replies * 2, 30);

UPDATE
    public.students
SET
    campozy_score = v_score
WHERE
    id = p_student_id;

END;

$ $;

-- =====================================================
-- CAMPOZY SCORE TRIGGER FUNCTION
-- =====================================================
CREATE
OR REPLACE FUNCTION trigger_recalculate_campozy_score() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = public AS $ $ BEGIN PERFORM recalculate_campozy_score(
        COALESCE(
            NEW.student_id,
            NEW.user_id,
            NEW.author_id,
            OLD.student_id,
            OLD.user_id,
            OLD.author_id
        )
    );

RETURN COALESCE(NEW, OLD);

END;

$ $;

DROP TRIGGER IF EXISTS trg_discussion_score ON discussions;

CREATE TRIGGER trg_discussion_score
AFTER
INSERT
    OR DELETE ON discussions FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_campozy_score();

DROP TRIGGER IF EXISTS trg_reply_score ON discussion_replies;

CREATE TRIGGER trg_reply_score
AFTER
INSERT
    OR DELETE ON discussion_replies FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_campozy_score();

DROP TRIGGER IF EXISTS trg_profile_score ON students;

CREATE TRIGGER trg_profile_score
AFTER
UPDATE
    ON students FOR EACH ROW EXECUTE FUNCTION trigger_recalculate_campozy_score();

-- =====================================================
-- FUNCTION SECURITY HARDENING
-- =====================================================
ALTER FUNCTION handle_new_user()
SET
    search_path = public;

ALTER FUNCTION update_updated_at()
SET
    search_path = public;

ALTER FUNCTION increment_discussion_reply_count()
SET
    search_path = public;

ALTER FUNCTION decrement_discussion_reply_count()
SET
    search_path = public;

ALTER FUNCTION recalculate_campozy_score(UUID)
SET
    search_path = public;

ALTER FUNCTION trigger_recalculate_campozy_score()
SET
    search_path = public;

-- =====================================================
-- SEED DATA
-- =====================================================
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
    (
        'Jomo Kenyatta University of Agriculture and Technology'
    ),
    ('Egerton University'),
    ('Maseno University'),
    (
        'Masinde Muliro University of Science and Technology'
    ),
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

-- =====================================================
-- PRODUCTION PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_students_university_score ON students (university_id, campozy_score DESC);

CREATE INDEX IF NOT EXISTS idx_discussions_feed ON discussions (
    category_id,
    is_pinned DESC,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_discussions_user_created ON discussions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_created 
ON discussion_replies (discussion_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_discussion_replies_user ON discussion_replies (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hostels_search ON hostels (
    university_id,
    monthly_rent,
    is_available
);

CREATE INDEX IF NOT EXISTS idx_hostels_rating ON hostels (average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (
    recipient_id,
    is_read,
    created_at DESC
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, created_at DESC);

-- =====================================================
-- PRODUCTION HARDENING
-- =====================================================
-- =====================================================
-- UPDATE QUERY PLANNER STATISTICS
-- =====================================================
-- Initializes PostgreSQL planner statistics for newly created tables.
-- PostgreSQL will continue maintaining these automatically through autovacuum.
ANALYZE students;

ANALYZE universities;

ANALYZE discussions;

ANALYZE discussion_replies;

ANALYZE hostels;

ANALYZE notifications;

-- =====================================================
-- VERIFY RLS IS ENABLED
-- =====================================================
ALTER TABLE
    students ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    discussions ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    discussion_replies ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    hostels ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- END OF MIGRATION
-- CAMPOZY SCHEMA v4
-- =====================================================