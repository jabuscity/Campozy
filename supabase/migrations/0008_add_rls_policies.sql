-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- Additive migration: enables Row Level Security and adds anon read access
-- for public community/reporting tables.
-- ============================================================================

-- =====================================================
-- FORUMS
-- =====================================================
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY forums_select_anon ON forums FOR SELECT TO anon USING (true);

-- =====================================================
-- FORUM_TOPICS
-- =====================================================
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY forum_topics_select_anon ON forum_topics FOR SELECT TO anon USING (true);

-- =====================================================
-- FORUM_POSTS
-- =====================================================
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY forum_posts_select_anon ON forum_posts FOR SELECT TO anon USING (true);

-- =====================================================
-- FORUM_SUBSCRIPTIONS
-- =====================================================
ALTER TABLE forum_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FORUM_MEMBERSHIPS
-- =====================================================
ALTER TABLE forum_memberships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- UTILITY_INCIDENTS
-- =====================================================
ALTER TABLE utility_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_incidents_select_anon ON utility_incidents FOR SELECT TO anon USING (true);

-- =====================================================
-- HYGIENE_REPORTS
-- =====================================================
ALTER TABLE hygiene_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_reports_select_anon ON hygiene_reports FOR SELECT TO anon USING (true);

-- =====================================================
-- NEIGHBORHOOD_REVIEWS
-- =====================================================
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_reviews_select_anon ON neighborhood_reviews FOR SELECT TO anon USING (true);

-- =====================================================
-- HYGIENE_CATEGORIES
-- =====================================================
ALTER TABLE hygiene_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_categories_select_anon ON hygiene_categories FOR SELECT TO anon USING (true);

-- =====================================================
-- UTILITY_TYPES
-- =====================================================
ALTER TABLE utility_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_types_select_anon ON utility_types FOR SELECT TO anon USING (true);