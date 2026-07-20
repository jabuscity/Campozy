-- ============================================================================
-- RLS POLICIES FOR NEW TABLES
-- Additive migration: enables Row Level Security and adds policies for
-- forum domain tables, utility_incidents, hygiene_reports, neighborhood_reviews,
-- hygiene_categories, and utility_types.
-- ============================================================================

-- =====================================================
-- FORUMS
-- =====================================================
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;

CREATE POLICY forums_select ON forums FOR SELECT TO authenticated USING (true);
CREATE POLICY forums_select_anon ON forums FOR SELECT TO anon USING (true);
CREATE POLICY forums_insert ON forums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY forums_update ON forums FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY forums_delete ON forums FOR DELETE TO authenticated USING (true);

-- =====================================================
-- FORUM_TOPICS
-- =====================================================
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY forum_topics_select ON forum_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_topics_select_anon ON forum_topics FOR SELECT TO anon USING (true);
CREATE POLICY forum_topics_insert ON forum_topics FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY forum_topics_update ON forum_topics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY forum_topics_delete ON forum_topics FOR DELETE TO authenticated USING (true);

-- =====================================================
-- FORUM_POSTS
-- =====================================================
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY forum_posts_select ON forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_posts_select_anon ON forum_posts FOR SELECT TO anon USING (true);
CREATE POLICY forum_posts_insert ON forum_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY forum_posts_update ON forum_posts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY forum_posts_delete ON forum_posts FOR DELETE TO authenticated USING (true);

-- =====================================================
-- FORUM_SUBSCRIPTIONS
-- =====================================================
ALTER TABLE forum_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY forum_subscriptions_select ON forum_subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_subscriptions_insert ON forum_subscriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY forum_subscriptions_update ON forum_subscriptions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY forum_subscriptions_delete ON forum_subscriptions FOR DELETE TO authenticated USING (true);

-- =====================================================
-- FORUM_MEMBERSHIPS
-- =====================================================
ALTER TABLE forum_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY forum_memberships_select ON forum_memberships FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_memberships_insert ON forum_memberships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY forum_memberships_update ON forum_memberships FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY forum_memberships_delete ON forum_memberships FOR DELETE TO authenticated USING (true);

-- =====================================================
-- UTILITY_INCIDENTS
-- =====================================================
ALTER TABLE utility_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_incidents_select ON utility_incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY utility_incidents_select_anon ON utility_incidents FOR SELECT TO anon USING (true);
CREATE POLICY utility_incidents_insert ON utility_incidents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY utility_incidents_update ON utility_incidents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY utility_incidents_delete ON utility_incidents FOR DELETE TO authenticated USING (true);

-- =====================================================
-- HYGIENE_REPORTS
-- =====================================================
ALTER TABLE hygiene_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_reports_select ON hygiene_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY hygiene_reports_select_anon ON hygiene_reports FOR SELECT TO anon USING (true);
CREATE POLICY hygiene_reports_insert ON hygiene_reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY hygiene_reports_update ON hygiene_reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY hygiene_reports_delete ON hygiene_reports FOR DELETE TO authenticated USING (true);

-- =====================================================
-- NEIGHBORHOOD_REVIEWS
-- =====================================================
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY neighborhood_reviews_select ON neighborhood_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY neighborhood_reviews_select_anon ON neighborhood_reviews FOR SELECT TO anon USING (true);
CREATE POLICY neighborhood_reviews_insert ON neighborhood_reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY neighborhood_reviews_update ON neighborhood_reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY neighborhood_reviews_delete ON neighborhood_reviews FOR DELETE TO authenticated USING (true);

-- =====================================================
-- HYGIENE_CATEGORIES
-- =====================================================
ALTER TABLE hygiene_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY hygiene_categories_select ON hygiene_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY hygiene_categories_select_anon ON hygiene_categories FOR SELECT TO anon USING (true);
CREATE POLICY hygiene_categories_insert ON hygiene_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY hygiene_categories_update ON hygiene_categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY hygiene_categories_delete ON hygiene_categories FOR DELETE TO authenticated USING (true);

-- =====================================================
-- UTILITY_TYPES
-- =====================================================
ALTER TABLE utility_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY utility_types_select ON utility_types FOR SELECT TO authenticated USING (true);
CREATE POLICY utility_types_select_anon ON utility_types FOR SELECT TO anon USING (true);
CREATE POLICY utility_types_insert ON utility_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY utility_types_update ON utility_types FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY utility_types_delete ON utility_types FOR DELETE TO authenticated USING (true);
