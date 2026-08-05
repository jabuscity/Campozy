CREATE TABLE IF NOT EXISTS neighborhood_campus_distances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    distance_km NUMERIC CHECK(distance_km IS NULL OR distance_km >= 0),
    walking_time_min INTEGER CHECK(walking_time_min IS NULL OR walking_time_min >= 0),
    transport_time_min INTEGER CHECK(transport_time_min IS NULL OR transport_time_min >= 0),
    transport_cost NUMERIC CHECK(transport_cost IS NULL OR transport_cost >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(neighborhood_id, campus_id)
);
