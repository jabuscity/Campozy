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
