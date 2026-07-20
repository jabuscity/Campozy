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
