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
    name TEXT UNIQUE NOT NULL,  -- student, owner, scout, founder, ambassador, mentor, alumni, employer, parent, moderator, admin
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    iso_code CHAR(2) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_id, name)
);

CREATE TABLE property_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,  -- hostel, apartment, bedsitter, single_room, shared_room
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE amenity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,  -- wifi, parking, laundry, gym, study_room, kitchen, security_guard
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE utility_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL  -- Water, Electricity, Internet, Security, Accessibility
);

CREATE TABLE hygiene_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL  -- bathrooms, kitchens, common_areas, waste_management, pest_control, sanitation
);

CREATE TABLE discussion_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,  -- housing, campus_life, safety, utilities, opportunities, general
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE verification_level AS ENUM ('unverified', 'claimed', 'community_verified', 'scout_verified', 'campozy_verified');
CREATE TYPE trust_level AS ENUM ('new', 'member', 'contributor', 'trusted_contributor', 'campus_expert', 'community_leader', 'campozy_fellow');
CREATE TYPE founder_scope AS ENUM ('campus', 'country', 'global');
CREATE TYPE opportunity_type AS ENUM ('internship', 'attachment', 'scholarship', 'fellowship', 'competition', 'graduate_trainee', 'mentorship', 'ambassador_program', 'employer_partnership');
CREATE TYPE notification_type AS ENUM ('review', 'verification', 'opportunity', 'message', 'founder', 'system', 'alert');
CREATE TYPE moderation_action_type AS ENUM ('warning', 'content_removal', 'temporary_restriction', 'suspension', 'permanent_ban');

-- ============================================================================
-- IDENTITY DOMAIN
-- ============================================================================

-- Note: In Supabase, `auth.users` is the primary identity table.
-- `public.profiles` extends it with app-specific data.
-- We do NOT create a `public.users` table — profiles reference auth.users(id) directly.

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    phone_number TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    trust_level trust_level DEFAULT 'new',
    reputation_score NUMERIC DEFAULT 0,
    contribution_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
    method_type TEXT NOT NULL,  -- email, phone, whatsapp
    value TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE identity_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,  -- student_id, national_id, passport
    document_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, approved, rejected
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EDUCATION DOMAIN
-- ============================================================================

CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES countries(id),
    name TEXT NOT NULL,
    short_name TEXT,  -- e.g. UON, JKUAT, KU
    website TEXT,
    logo_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_id, name)
);

CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_lat NUMERIC,
    location_lng NUMERIC,
    address TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(university_id, name)
);

CREATE TABLE academic_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    degree_level TEXT,  -- certificate, diploma, bachelors, masters, phd
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
    year_of_study INTEGER,
    enrollment_year INTEGER,
    expected_graduation_year INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    max_budget NUMERIC,
    currency TEXT DEFAULT 'KES',
    preferred_property_types TEXT[],  -- hostel, apartment, etc.
    preferred_amenities TEXT[],
    max_distance_km NUMERIC,
    priority_utilities TEXT[],  -- water, wifi, electricity
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_lifecycle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,  -- prospective, student, contributor, founder, ambassador, scout, graduate, alumni, mentor, employer
    transitioned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GEOGRAPHY DOMAIN
-- ============================================================================

CREATE TABLE neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id),
    name TEXT NOT NULL,
    description TEXT,
    safety_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(city_id, name)
);

CREATE TABLE neighborhood_landmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    landmark_type TEXT,  -- market, hospital, police_station, transport_hub, bank
    location_lat NUMERIC,
    location_lng NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE neighborhood_campus_distances (
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    distance_km NUMERIC NOT NULL,
    walking_time_min INTEGER,
    transport_time_min INTEGER,
    transport_cost NUMERIC,
    PRIMARY KEY (neighborhood_id, campus_id)
);

-- ============================================================================
-- HOUSING DOMAIN
-- ============================================================================

CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    property_type_id UUID REFERENCES property_types(id),
    verification_level verification_level DEFAULT 'unverified',
    campozy_score NUMERIC DEFAULT 0,
    location_lat NUMERIC,
    location_lng NUMERIC,
    total_rooms INTEGER,
    floors INTEGER,
    year_built INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_type TEXT NOT NULL,  -- single, double, shared, bedsitter
    price_per_semester NUMERIC,
    price_per_month NUMERIC,
    currency TEXT DEFAULT 'KES',
    is_available BOOLEAN DEFAULT TRUE,
    capacity INTEGER DEFAULT 1,
    floor_number INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT NOT NULL,  -- image, video, virtual_tour
    caption TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_amenities (
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_type_id UUID NOT NULL REFERENCES amenity_types(id) ON DELETE CASCADE,
    notes TEXT,
    PRIMARY KEY (property_id, amenity_type_id)
);

CREATE TABLE property_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT DEFAULT 'pending',  -- pending, approved, rejected
    evidence_urls TEXT[],
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- UTILITY DOMAIN
-- ============================================================================

CREATE TABLE property_utilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    reliability_score NUMERIC DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    last_reported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, utility_type_id)
);

CREATE TABLE utility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    hours_available_per_day NUMERIC,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE utility_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    utility_type_id UUID NOT NULL REFERENCES utility_types(id),
    reported_by UUID NOT NULL REFERENCES profiles(id),
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',  -- low, medium, high, critical
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HYGIENE DOMAIN
-- ============================================================================

CREATE TABLE hygiene_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    category_id UUID NOT NULL REFERENCES hygiene_categories(id),
    score INTEGER CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hygiene_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES hygiene_reports(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVIEW DOMAIN
-- ============================================================================

CREATE TABLE property_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    content TEXT,
    -- The 10 Campozy Score dimensions, each 1-5
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    hygiene_rating INTEGER CHECK (hygiene_rating >= 1 AND hygiene_rating <= 5),
    water_rating INTEGER CHECK (water_rating >= 1 AND water_rating <= 5),
    electricity_rating INTEGER CHECK (electricity_rating >= 1 AND electricity_rating <= 5),
    internet_rating INTEGER CHECK (internet_rating >= 1 AND internet_rating <= 5),
    management_rating INTEGER CHECK (management_rating >= 1 AND management_rating <= 5),
    accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    value_for_money_rating INTEGER CHECK (value_for_money_rating >= 1 AND value_for_money_rating <= 5),
    is_verified_stay BOOLEAN DEFAULT FALSE,
    stay_duration_months INTEGER,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_review_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE property_review_votes (
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (review_id, user_id)
);

CREATE TABLE property_review_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES property_reviews(id) ON DELETE CASCADE,
    flagged_by UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, reviewed, dismissed, actioned
    reviewed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE neighborhood_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    transport_rating INTEGER CHECK (transport_rating >= 1 AND transport_rating <= 5),
    amenities_rating INTEGER CHECK (amenities_rating >= 1 AND amenities_rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRUST & REPUTATION DOMAIN
-- ============================================================================

CREATE TABLE reputation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,  -- review_created, report_submitted, discussion_helpful, verification_accurate, spam_flagged, etc.
    points INTEGER NOT NULL,  -- positive or negative
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    category TEXT,  -- trust, founder, expertise, community, achievement
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_reason TEXT,
    PRIMARY KEY (user_id, badge_id)
);

-- ============================================================================
-- VERIFICATION DOMAIN
-- ============================================================================

CREATE TABLE verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,  -- property, user, business, owner, scout
    verification_level verification_level DEFAULT 'claimed',
    verifier_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending',  -- pending, approved, rejected, expired
    notes TEXT,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verification_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES verification_records(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL,  -- photo, document, video, geolocation
    url TEXT NOT NULL,
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMMUNITY DOMAIN
-- ============================================================================

CREATE TABLE discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    category_id UUID REFERENCES discussion_categories(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discussion_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    parent_reply_id UUID REFERENCES discussion_replies(id),  -- threaded replies
    content TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discussion_votes (
    discussion_id UUID NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (discussion_id, user_id)
);

CREATE TABLE tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    category TEXT,  -- housing, safety, transport, budgeting, food
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    property_id UUID REFERENCES properties(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',  -- low, medium, high
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id),
    campus_id UUID REFERENCES campuses(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,  -- guide, checklist, faq, resource
    tags TEXT[],
    view_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MESSAGING DOMAIN
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_members (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    file_type TEXT,
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BUSINESS DOMAIN
-- ============================================================================

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,  -- food, transport, printing, laundry, electronics, bookshop
    verification_level verification_level DEFAULT 'unverified',
    campozy_score NUMERIC DEFAULT 0,
    location_lat NUMERIC,
    location_lng NUMERIC,
    address TEXT,
    phone TEXT,
    website TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image',
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE business_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARENT DOMAIN
-- ============================================================================

CREATE TABLE parent_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    relationship TEXT DEFAULT 'parent',  -- parent, guardian
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE parent_student_links (
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',  -- pending, confirmed, rejected
    confirmed_at TIMESTAMPTZ,
    PRIMARY KEY (parent_id, student_id)
);

CREATE TABLE parent_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,  -- safety, utility_outage, verification_update
    title TEXT NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOUNDER DOMAIN
-- ============================================================================

CREATE TABLE founder_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,  -- e.g. "Founding 50 UON", "Founding 100 Kenya", "Global Pioneer 100"
    scope founder_scope NOT NULL,
    scope_entity_id UUID,  -- campus_id for campus, country_id for country, NULL for global
    max_members INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE founder_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id) ON DELETE CASCADE,
    contribution_score NUMERIC DEFAULT 0,
    qualified_at TIMESTAMPTZ,
    became_founder_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, cohort_id)
);

CREATE TABLE founder_qualification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    cohort_id UUID NOT NULL REFERENCES founder_cohorts(id),
    event_type TEXT NOT NULL,  -- review, report, discussion, verification, referral, mentorship
    points INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AMBASSADOR DOMAIN
-- ============================================================================

CREATE TABLE ambassador_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ambassadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES ambassador_programs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',  -- active, paused, completed
    started_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

CREATE TABLE ambassador_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,  -- recruit_contributors, identify_founders, promote_discussions
    description TEXT,
    status TEXT DEFAULT 'assigned',  -- assigned, in_progress, completed
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SCOUT DOMAIN
-- ============================================================================

CREATE TABLE scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    region_id UUID REFERENCES cities(id),
    certification_level TEXT DEFAULT 'trainee',  -- trainee, certified, senior, lead
    reputation_score NUMERIC DEFAULT 0,
    total_verifications INTEGER DEFAULT 0,
    accuracy_rate NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE scout_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id),
    assignment_type TEXT DEFAULT 'verification',  -- verification, audit, investigation
    status TEXT DEFAULT 'assigned',  -- assigned, in_progress, completed, cancelled
    priority TEXT DEFAULT 'standard',  -- standard, high, urgent
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scout_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES scout_assignments(id) ON DELETE CASCADE,
    scout_id UUID NOT NULL REFERENCES scouts(id),
    findings TEXT NOT NULL,
    recommendation TEXT,  -- verify, reject, needs_more_info
    evidence_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scout_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scout_id UUID NOT NULL REFERENCES scouts(id),
    report_id UUID NOT NULL REFERENCES scout_reports(id),
    auditor_id UUID NOT NULL REFERENCES profiles(id),
    outcome TEXT NOT NULL,  -- accurate, inaccurate, partially_accurate
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- OPPORTUNITY DOMAIN
-- ============================================================================

CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    verification_level verification_level DEFAULT 'unverified',
    contact_user_id UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES employers(id),
    creator_id UUID NOT NULL REFERENCES profiles(id),
    type opportunity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]',
    location TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    compensation TEXT,
    application_url TEXT,
    deadline TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id),
    status TEXT DEFAULT 'applied',  -- applied, reviewed, shortlisted, accepted, rejected
    cover_note TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, student_id)
);

CREATE TABLE mentorship_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    expertise TEXT[],
    bio TEXT,
    max_mentees INTEGER DEFAULT 3,
    is_accepting BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE mentorship_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES mentorship_profiles(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',  -- active, paused, completed
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    UNIQUE(mentor_id, mentee_id)
);

-- ============================================================================
-- ALUMNI DOMAIN
-- ============================================================================

CREATE TABLE alumni_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES universities(id),
    graduation_year INTEGER,
    degree TEXT,
    current_position TEXT,
    current_company TEXT,
    is_mentor BOOLEAN DEFAULT FALSE,
    is_employer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- RECOMMENDATION DOMAIN
-- ============================================================================

CREATE TABLE recommendation_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preference_vector vector(64),
    behavior_vector vector(64),
    last_computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL,  -- property, business, opportunity, neighborhood
    action TEXT NOT NULL,  -- viewed, saved, dismissed, clicked, applied
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SAVED & PREFERENCE DOMAIN
-- ============================================================================

CREATE TABLE saved_properties (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

CREATE TABLE saved_businesses (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, business_id)
);

CREATE TABLE saved_opportunities (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, opportunity_id)
);

-- ============================================================================
-- AKWET TRANSITION DOMAIN
-- ============================================================================

CREATE TABLE transition_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    target_city_id UUID REFERENCES cities(id),
    target_move_date DATE,
    budget_range_min NUMERIC,
    budget_range_max NUMERIC,
    housing_type_preference TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EVENT DOMAIN — Event-Driven Architecture
-- ============================================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    target_id UUID,
    target_type TEXT,  -- property, review, discussion, opportunity, user
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for event queries
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
    title TEXT NOT NULL,
    content TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    email_reviews BOOLEAN DEFAULT TRUE,
    email_opportunities BOOLEAN DEFAULT TRUE,
    email_messages BOOLEAN DEFAULT TRUE,
    email_founder BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- GROWTH & REFERRAL DOMAIN
-- ============================================================================

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    referred_email TEXT NOT NULL,
    referred_user_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'pending',  -- pending, registered, qualified
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invitation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    creator_id UUID NOT NULL REFERENCES profiles(id),
    max_uses INTEGER DEFAULT 10,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    campus_id UUID REFERENCES campuses(id),
    country_id UUID REFERENCES countries(id),
    source TEXT,  -- organic, referral, social
    joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUDIT & GOVERNANCE DOMAIN
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE moderation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by UUID REFERENCES profiles(id),
    target_user_id UUID REFERENCES profiles(id),
    target_entity_id UUID,
    target_entity_type TEXT,  -- review, discussion, message, property, business
    reason TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'standard',  -- critical, high, standard, routine
    status TEXT DEFAULT 'open',  -- open, investigating, resolved, dismissed
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES moderation_cases(id) ON DELETE CASCADE,
    action_type moderation_action_type NOT NULL,
    moderator_id UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL,
    expires_at TIMESTAMPTZ,  -- for temporary restrictions
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES moderation_actions(id),
    appellant_id UUID NOT NULL REFERENCES profiles(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending, reviewing, upheld, overturned
    reviewer_id UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ANALYTICS DOMAIN
-- ============================================================================

CREATE TABLE property_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    view_count INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    avg_rating NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(property_id, period_start)
);

CREATE TABLE campus_intelligence_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campus_id UUID NOT NULL REFERENCES campuses(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    active_properties INTEGER DEFAULT 0,
    avg_campozy_score NUMERIC,
    review_count INTEGER DEFAULT 0,
    discussion_count INTEGER DEFAULT 0,
    contributor_count INTEGER DEFAULT 0,
    founder_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campus_id, period_start)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Properties
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_score ON properties(campozy_score DESC);
CREATE INDEX idx_properties_active ON properties(is_active) WHERE is_active = TRUE;

-- Reviews
CREATE INDEX idx_reviews_property ON property_reviews(property_id);
CREATE INDEX idx_reviews_user ON property_reviews(user_id);
CREATE INDEX idx_reviews_created ON property_reviews(created_at DESC);

-- Discussions
CREATE INDEX idx_discussions_campus ON discussions(campus_id);
CREATE INDEX idx_discussions_created ON discussions(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Search support
CREATE INDEX idx_properties_name_trgm ON properties USING gin (name gin_trgm_ops);
CREATE INDEX idx_discussions_title_trgm ON discussions USING gin (title gin_trgm_ops);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Owners can insert properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id);

-- Property Rooms
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms are viewable by everyone" ON property_rooms FOR SELECT USING (true);
CREATE POLICY "Owners can manage rooms" ON property_rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.owner_id = auth.uid())
);

-- Property Reviews
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON property_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON property_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON property_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Discussions
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discussions are viewable by everyone" ON discussions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create discussions" ON discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own discussions" ON discussions FOR UPDATE USING (auth.uid() = user_id);

-- Discussion Replies
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Replies are viewable by everyone" ON discussion_replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can reply" ON discussion_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own replies" ON discussion_replies FOR UPDATE USING (auth.uid() = user_id);

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid())
);
CREATE POLICY "Users can send messages to their conversations" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversation_members WHERE conversation_members.conversation_id = messages.conversation_id AND conversation_members.user_id = auth.uid())
);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Saved Properties
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved properties" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save properties" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave properties" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- Businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Businesses are viewable by everyone" ON businesses FOR SELECT USING (true);
CREATE POLICY "Owners can manage own businesses" ON businesses FOR ALL USING (auth.uid() = owner_id);

-- Opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active opportunities are viewable by everyone" ON opportunities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Creators can manage own opportunities" ON opportunities FOR ALL USING (auth.uid() = creator_id);

-- Events (write-only for users, read for service role)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- Audit Logs (read-only for admins — handled via service role)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Handle new user signup: create profile from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, username)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    );

    -- Assign default student role
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, r.id FROM public.roles r WHERE r.name = 'student';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update `updated_at` timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER property_rooms_updated_at BEFORE UPDATE ON property_rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER discussions_updated_at BEFORE UPDATE ON discussions FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Increment reply count on discussion when a reply is added
CREATE OR REPLACE FUNCTION increment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE discussions SET reply_count = reply_count + 1 WHERE id = NEW.discussion_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_reply_created
    AFTER INSERT ON discussion_replies
    FOR EACH ROW EXECUTE PROCEDURE increment_reply_count();

-- Recalculate property Campozy Score when a review is added
CREATE OR REPLACE FUNCTION recalculate_campozy_score()
RETURNS TRIGGER AS $$
DECLARE
    avg_overall NUMERIC;
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
BEGIN
    -- Get averages from all reviews for this property
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
        COUNT(*)
    INTO avg_overall, avg_safety, avg_hygiene, avg_water, avg_electricity,
         avg_internet, avg_management, avg_accessibility, avg_value, review_count
    FROM property_reviews
    WHERE property_id = COALESCE(NEW.property_id, OLD.property_id);

    -- Get verification level
    SELECT verification_level INTO v_level FROM properties WHERE id = COALESCE(NEW.property_id, OLD.property_id);

    -- Verification bonus (0-15)
    CASE v_level
        WHEN 'campozy_verified' THEN verification_bonus := 15;
        WHEN 'scout_verified' THEN verification_bonus := 12;
        WHEN 'community_verified' THEN verification_bonus := 8;
        WHEN 'claimed' THEN verification_bonus := 3;
        ELSE verification_bonus := 0;
    END CASE;

    -- Volume bonus (0-5): more reviews = higher confidence
    volume_bonus := LEAST(5, review_count);

    -- Weighted dimension score (0-80):
    -- Each dimension rated 1-5, weighted sum normalized to 80 points
    -- Weights reflect the Campozy Score philosophy
    final_score := (
        (avg_safety * 3.0) +        -- Safety is paramount
        (avg_water * 2.0) +
        (avg_electricity * 2.0) +
        (avg_internet * 1.5) +
        (avg_hygiene * 2.0) +
        (avg_management * 1.5) +
        (avg_accessibility * 1.0) +
        (avg_value * 2.0) +
        (avg_overall * 1.0)
    ) / (16.0 * 5.0) * 80.0;  -- Normalize: total_weight * max_rating = max_raw, map to 80

    final_score := final_score + verification_bonus + volume_bonus;
    final_score := LEAST(100, GREATEST(0, ROUND(final_score)));

    UPDATE properties SET campozy_score = final_score WHERE id = COALESCE(NEW.property_id, OLD.property_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_score_update
    AFTER INSERT OR UPDATE OR DELETE ON property_reviews
    FOR EACH ROW EXECUTE PROCEDURE recalculate_campozy_score();

-- ============================================================================
-- SEED DATA — Reference tables
-- ============================================================================

INSERT INTO roles (name, description) VALUES
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

INSERT INTO utility_types (name) VALUES
    ('Water'), ('Electricity'), ('Internet'), ('Security'), ('Accessibility');

INSERT INTO hygiene_categories (name) VALUES
    ('Bathrooms'), ('Kitchens'), ('Common Areas'), ('Waste Management'), ('Pest Control'), ('Sanitation');

INSERT INTO discussion_categories (name, description) VALUES
    ('housing', 'Property and housing discussions'),
    ('campus_life', 'Campus life and student experience'),
    ('safety', 'Safety alerts and information'),
    ('utilities', 'Utility reliability and issues'),
    ('opportunities', 'Internships, scholarships, and careers'),
    ('general', 'General discussions');

INSERT INTO badges (name, slug, description, category) VALUES
    ('Trusted Reviewer', 'trusted-reviewer', 'Consistently helpful and accurate reviews', 'trust'),
    ('Campus Expert', 'campus-expert', 'Deep knowledge of a specific campus', 'expertise'),
    ('Utility Expert', 'utility-expert', 'Reliable utility intelligence contributor', 'expertise'),
    ('Hygiene Expert', 'hygiene-expert', 'Detailed hygiene reporting', 'expertise'),
    ('Community Leader', 'community-leader', 'Active and helpful community member', 'community'),
    ('Mentor', 'mentor', 'Active student mentor', 'community'),
    ('Campus Founder', 'campus-founder', 'Founding member of a campus community', 'founder'),
    ('Country Founder', 'country-founder', 'Founding member of a country community', 'founder'),
    ('Global Pioneer', 'global-pioneer', 'Early builder of the global Campozy network', 'founder'),
    ('Verified Contributor', 'verified-contributor', 'Identity-verified active contributor', 'trust');

-- Trigram extension for text search

