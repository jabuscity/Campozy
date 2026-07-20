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
