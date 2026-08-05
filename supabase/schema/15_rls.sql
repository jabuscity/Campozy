-- ============================================================================
-- Module 15: Row Level Security Policies
-- Restrictive owner-based policies replacing permissive USING (true)
-- ============================================================================

-- countries
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "countries_select" ON countries;
CREATE POLICY "countries_select" ON countries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "countries_insert" ON countries;
CREATE POLICY "countries_insert" ON countries FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "countries_update" ON countries;
CREATE POLICY "countries_update" ON countries FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "countries_delete" ON countries;
CREATE POLICY "countries_delete" ON countries FOR DELETE TO authenticated USING (false);

-- cities
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "cities_select" ON cities;
CREATE POLICY "cities_select" ON cities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "cities_insert" ON cities;
CREATE POLICY "cities_insert" ON cities FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "cities_update" ON cities;
CREATE POLICY "cities_update" ON cities FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "cities_delete" ON cities;
CREATE POLICY "cities_delete" ON cities FOR DELETE TO authenticated USING (false);

-- campuses
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "campuses_select" ON campuses;
CREATE POLICY "campuses_select" ON campuses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "campuses_insert" ON campuses;
CREATE POLICY "campuses_insert" ON campuses FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "campuses_update" ON campuses;
CREATE POLICY "campuses_update" ON campuses FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "campuses_delete" ON campuses;
CREATE POLICY "campuses_delete" ON campuses FOR DELETE TO authenticated USING (false);

-- universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "universities_select" ON universities;
CREATE POLICY "universities_select" ON universities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "universities_insert" ON universities;
CREATE POLICY "universities_insert" ON universities FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "universities_update" ON universities;
CREATE POLICY "universities_update" ON universities FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "universities_delete" ON universities;
CREATE POLICY "universities_delete" ON universities FOR DELETE TO authenticated USING (false);

-- neighborhoods
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "neighborhoods_select" ON neighborhoods;
CREATE POLICY "neighborhoods_select" ON neighborhoods FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "neighborhoods_insert" ON neighborhoods;
CREATE POLICY "neighborhoods_insert" ON neighborhoods FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "neighborhoods_update" ON neighborhoods;
CREATE POLICY "neighborhoods_update" ON neighborhoods FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "neighborhoods_delete" ON neighborhoods;
CREATE POLICY "neighborhoods_delete" ON neighborhoods FOR DELETE TO authenticated USING (false);

-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_select" ON roles;
CREATE POLICY "roles_select" ON roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "roles_insert" ON roles;
CREATE POLICY "roles_insert" ON roles FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "roles_update" ON roles;
CREATE POLICY "roles_update" ON roles FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "roles_delete" ON roles;
CREATE POLICY "roles_delete" ON roles FOR DELETE TO authenticated USING (false);

-- high_schools
ALTER TABLE high_schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "high_schools_select" ON high_schools;
CREATE POLICY "high_schools_select" ON high_schools FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "high_schools_insert" ON high_schools;
CREATE POLICY "high_schools_insert" ON high_schools FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "high_schools_update" ON high_schools;
CREATE POLICY "high_schools_update" ON high_schools FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "high_schools_delete" ON high_schools;
CREATE POLICY "high_schools_delete" ON high_schools FOR DELETE TO authenticated USING (false);

-- property_types
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_types_select" ON property_types;
CREATE POLICY "property_types_select" ON property_types FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "property_types_insert" ON property_types;
CREATE POLICY "property_types_insert" ON property_types FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "property_types_update" ON property_types;
CREATE POLICY "property_types_update" ON property_types FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "property_types_delete" ON property_types;
CREATE POLICY "property_types_delete" ON property_types FOR DELETE TO authenticated USING (false);

-- amenities
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "amenities_select" ON amenities;
CREATE POLICY "amenities_select" ON amenities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "amenities_insert" ON amenities;
CREATE POLICY "amenities_insert" ON amenities FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "amenities_update" ON amenities;
CREATE POLICY "amenities_update" ON amenities FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "amenities_delete" ON amenities;
CREATE POLICY "amenities_delete" ON amenities FOR DELETE TO authenticated USING (false);

-- utilities
ALTER TABLE utilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "utilities_select" ON utilities;
CREATE POLICY "utilities_select" ON utilities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "utilities_insert" ON utilities;
CREATE POLICY "utilities_insert" ON utilities FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "utilities_update" ON utilities;
CREATE POLICY "utilities_update" ON utilities FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "utilities_delete" ON utilities;
CREATE POLICY "utilities_delete" ON utilities FOR DELETE TO authenticated USING (false);

-- discussion_categories
ALTER TABLE discussion_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discussion_categories_select" ON discussion_categories;
CREATE POLICY "discussion_categories_select" ON discussion_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "discussion_categories_insert" ON discussion_categories;
CREATE POLICY "discussion_categories_insert" ON discussion_categories FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "discussion_categories_update" ON discussion_categories;
CREATE POLICY "discussion_categories_update" ON discussion_categories FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "discussion_categories_delete" ON discussion_categories;
CREATE POLICY "discussion_categories_delete" ON discussion_categories FOR DELETE TO authenticated USING (false);

-- badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_select" ON badges;
CREATE POLICY "badges_select" ON badges FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "badges_insert" ON badges;
CREATE POLICY "badges_insert" ON badges FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "badges_update" ON badges;
CREATE POLICY "badges_update" ON badges FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "badges_delete" ON badges;
CREATE POLICY "badges_delete" ON badges FOR DELETE TO authenticated USING (false);

-- academic_programs
ALTER TABLE academic_programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "academic_programs_select" ON academic_programs;
CREATE POLICY "academic_programs_select" ON academic_programs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "academic_programs_insert" ON academic_programs;
CREATE POLICY "academic_programs_insert" ON academic_programs FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "academic_programs_update" ON academic_programs;
CREATE POLICY "academic_programs_update" ON academic_programs FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "academic_programs_delete" ON academic_programs;
CREATE POLICY "academic_programs_delete" ON academic_programs FOR DELETE TO authenticated USING (false);

-- hygiene_categories
ALTER TABLE hygiene_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hygiene_categories_select" ON hygiene_categories;
CREATE POLICY "hygiene_categories_select" ON hygiene_categories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "hygiene_categories_insert" ON hygiene_categories;
CREATE POLICY "hygiene_categories_insert" ON hygiene_categories FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "hygiene_categories_update" ON hygiene_categories;
CREATE POLICY "hygiene_categories_update" ON hygiene_categories FOR UPDATE TO authenticated USING (false);
DROP POLICY IF EXISTS "hygiene_categories_delete" ON hygiene_categories;
CREATE POLICY "hygiene_categories_delete" ON hygiene_categories FOR DELETE TO authenticated USING (false);

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_delete" ON profiles;
CREATE POLICY "profiles_delete" ON profiles FOR DELETE TO authenticated USING (id = auth.uid());

-- owners
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owners_select" ON owners;
CREATE POLICY "owners_select" ON owners FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "owners_insert" ON owners;
CREATE POLICY "owners_insert" ON owners FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "owners_update" ON owners;
CREATE POLICY "owners_update" ON owners FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "owners_delete" ON owners;
CREATE POLICY "owners_delete" ON owners FOR DELETE TO authenticated USING (id = auth.uid());

-- students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "students_select" ON students;
CREATE POLICY "students_select" ON students FOR SELECT TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "students_insert" ON students;
CREATE POLICY "students_insert" ON students FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "students_update" ON students;
CREATE POLICY "students_update" ON students FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "students_delete" ON students;
CREATE POLICY "students_delete" ON students FOR DELETE TO authenticated USING (id = auth.uid());

-- student_preferences
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_preferences_select" ON student_preferences;
CREATE POLICY "student_preferences_select" ON student_preferences FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "student_preferences_insert" ON student_preferences;
CREATE POLICY "student_preferences_insert" ON student_preferences FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "student_preferences_update" ON student_preferences;
CREATE POLICY "student_preferences_update" ON student_preferences FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "student_preferences_delete" ON student_preferences;
CREATE POLICY "student_preferences_delete" ON student_preferences FOR DELETE TO authenticated USING (student_id = auth.uid());

-- student_lifecycle_history
ALTER TABLE student_lifecycle_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_lifecycle_history_select" ON student_lifecycle_history;
CREATE POLICY "student_lifecycle_history_select" ON student_lifecycle_history FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "student_lifecycle_history_insert" ON student_lifecycle_history;
CREATE POLICY "student_lifecycle_history_insert" ON student_lifecycle_history FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "student_lifecycle_history_update" ON student_lifecycle_history;
CREATE POLICY "student_lifecycle_history_update" ON student_lifecycle_history FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "student_lifecycle_history_delete" ON student_lifecycle_history;
CREATE POLICY "student_lifecycle_history_delete" ON student_lifecycle_history FOR DELETE TO authenticated USING (student_id = auth.uid());

-- discussions
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discussions_select" ON discussions;
CREATE POLICY "discussions_select" ON discussions FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "discussions_insert" ON discussions;
CREATE POLICY "discussions_insert" ON discussions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "discussions_update" ON discussions;
CREATE POLICY "discussions_update" ON discussions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "discussions_delete" ON discussions;
CREATE POLICY "discussions_delete" ON discussions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- discussion_replies
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discussion_replies_select" ON discussion_replies;
CREATE POLICY "discussion_replies_select" ON discussion_replies FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "discussion_replies_insert" ON discussion_replies;
CREATE POLICY "discussion_replies_insert" ON discussion_replies FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "discussion_replies_update" ON discussion_replies;
CREATE POLICY "discussion_replies_update" ON discussion_replies FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "discussion_replies_delete" ON discussion_replies;
CREATE POLICY "discussion_replies_delete" ON discussion_replies FOR DELETE TO authenticated USING (user_id = auth.uid());

-- community_posts
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "community_posts_select" ON community_posts;
CREATE POLICY "community_posts_select" ON community_posts FOR SELECT TO authenticated USING (author_id = auth.uid());
DROP POLICY IF EXISTS "community_posts_insert" ON community_posts;
CREATE POLICY "community_posts_insert" ON community_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "community_posts_update" ON community_posts;
CREATE POLICY "community_posts_update" ON community_posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "community_posts_delete" ON community_posts;
CREATE POLICY "community_posts_delete" ON community_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

-- community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "community_comments_select" ON community_comments;
CREATE POLICY "community_comments_select" ON community_comments FOR SELECT TO authenticated USING (author_id = auth.uid());
DROP POLICY IF EXISTS "community_comments_insert" ON community_comments;
CREATE POLICY "community_comments_insert" ON community_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "community_comments_update" ON community_comments;
CREATE POLICY "community_comments_update" ON community_comments FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "community_comments_delete" ON community_comments;
CREATE POLICY "community_comments_delete" ON community_comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- property_reviews
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_reviews_select" ON property_reviews;
CREATE POLICY "property_reviews_select" ON property_reviews FOR SELECT TO authenticated USING (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "property_reviews_insert" ON property_reviews;
CREATE POLICY "property_reviews_insert" ON property_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "property_reviews_update" ON property_reviews;
CREATE POLICY "property_reviews_update" ON property_reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "property_reviews_delete" ON property_reviews;
CREATE POLICY "property_reviews_delete" ON property_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

-- property_inquiries
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_inquiries_select" ON property_inquiries;
CREATE POLICY "property_inquiries_select" ON property_inquiries FOR SELECT TO authenticated USING (sender_id = auth.uid());
DROP POLICY IF EXISTS "property_inquiries_insert" ON property_inquiries;
CREATE POLICY "property_inquiries_insert" ON property_inquiries FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "property_inquiries_update" ON property_inquiries;
CREATE POLICY "property_inquiries_update" ON property_inquiries FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "property_inquiries_delete" ON property_inquiries;
CREATE POLICY "property_inquiries_delete" ON property_inquiries FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- viewing_requests
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "viewing_requests_select" ON viewing_requests;
CREATE POLICY "viewing_requests_select" ON viewing_requests FOR SELECT TO authenticated USING (requester_id = auth.uid());
DROP POLICY IF EXISTS "viewing_requests_insert" ON viewing_requests;
CREATE POLICY "viewing_requests_insert" ON viewing_requests FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
DROP POLICY IF EXISTS "viewing_requests_update" ON viewing_requests;
CREATE POLICY "viewing_requests_update" ON viewing_requests FOR UPDATE TO authenticated USING (requester_id = auth.uid()) WITH CHECK (requester_id = auth.uid());
DROP POLICY IF EXISTS "viewing_requests_delete" ON viewing_requests;
CREATE POLICY "viewing_requests_delete" ON viewing_requests FOR DELETE TO authenticated USING (requester_id = auth.uid());

-- businesses
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "businesses_select" ON businesses;
CREATE POLICY "businesses_select" ON businesses FOR SELECT TO authenticated USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "businesses_insert" ON businesses;
CREATE POLICY "businesses_insert" ON businesses FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "businesses_update" ON businesses;
CREATE POLICY "businesses_update" ON businesses FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "businesses_delete" ON businesses;
CREATE POLICY "businesses_delete" ON businesses FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- business_reviews
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_reviews_select" ON business_reviews;
CREATE POLICY "business_reviews_select" ON business_reviews FOR SELECT TO authenticated USING (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "business_reviews_insert" ON business_reviews;
CREATE POLICY "business_reviews_insert" ON business_reviews FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "business_reviews_update" ON business_reviews;
CREATE POLICY "business_reviews_update" ON business_reviews FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
DROP POLICY IF EXISTS "business_reviews_delete" ON business_reviews;
CREATE POLICY "business_reviews_delete" ON business_reviews FOR DELETE TO authenticated USING (reviewer_id = auth.uid());

-- business_review_replies
ALTER TABLE business_review_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_review_replies_select" ON business_review_replies;
CREATE POLICY "business_review_replies_select" ON business_review_replies FOR SELECT TO authenticated USING (author_id = auth.uid());
DROP POLICY IF EXISTS "business_review_replies_insert" ON business_review_replies;
CREATE POLICY "business_review_replies_insert" ON business_review_replies FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "business_review_replies_update" ON business_review_replies;
CREATE POLICY "business_review_replies_update" ON business_review_replies FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "business_review_replies_delete" ON business_review_replies;
CREATE POLICY "business_review_replies_delete" ON business_review_replies FOR DELETE TO authenticated USING (author_id = auth.uid());

-- contact_methods
ALTER TABLE contact_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "contact_methods_select" ON contact_methods;
CREATE POLICY "contact_methods_select" ON contact_methods FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "contact_methods_insert" ON contact_methods;
CREATE POLICY "contact_methods_insert" ON contact_methods FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "contact_methods_update" ON contact_methods;
CREATE POLICY "contact_methods_update" ON contact_methods FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "contact_methods_delete" ON contact_methods;
CREATE POLICY "contact_methods_delete" ON contact_methods FOR DELETE TO authenticated USING (user_id = auth.uid());

-- identity_documents
ALTER TABLE identity_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "identity_documents_select" ON identity_documents;
CREATE POLICY "identity_documents_select" ON identity_documents FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "identity_documents_insert" ON identity_documents;
CREATE POLICY "identity_documents_insert" ON identity_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "identity_documents_update" ON identity_documents;
CREATE POLICY "identity_documents_update" ON identity_documents FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "identity_documents_delete" ON identity_documents;
CREATE POLICY "identity_documents_delete" ON identity_documents FOR DELETE TO authenticated USING (user_id = auth.uid());

-- reputation_events
ALTER TABLE reputation_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reputation_events_select" ON reputation_events;
CREATE POLICY "reputation_events_select" ON reputation_events FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "reputation_events_insert" ON reputation_events;
CREATE POLICY "reputation_events_insert" ON reputation_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "reputation_events_update" ON reputation_events;
CREATE POLICY "reputation_events_update" ON reputation_events FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "reputation_events_delete" ON reputation_events;
CREATE POLICY "reputation_events_delete" ON reputation_events FOR DELETE TO authenticated USING (user_id = auth.uid());

-- verification_records
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "verification_records_select" ON verification_records;
CREATE POLICY "verification_records_select" ON verification_records FOR SELECT TO authenticated USING (verifier_id = auth.uid());
DROP POLICY IF EXISTS "verification_records_insert" ON verification_records;
CREATE POLICY "verification_records_insert" ON verification_records FOR INSERT TO authenticated WITH CHECK (verifier_id = auth.uid());
DROP POLICY IF EXISTS "verification_records_update" ON verification_records;
CREATE POLICY "verification_records_update" ON verification_records FOR UPDATE TO authenticated USING (verifier_id = auth.uid()) WITH CHECK (verifier_id = auth.uid());
DROP POLICY IF EXISTS "verification_records_delete" ON verification_records;
CREATE POLICY "verification_records_delete" ON verification_records FOR DELETE TO authenticated USING (verifier_id = auth.uid());

-- verification_evidence
ALTER TABLE verification_evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "verification_evidence_select" ON verification_evidence;
CREATE POLICY "verification_evidence_select" ON verification_evidence FOR SELECT TO authenticated USING (uploaded_by = auth.uid());
DROP POLICY IF EXISTS "verification_evidence_insert" ON verification_evidence;
CREATE POLICY "verification_evidence_insert" ON verification_evidence FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
DROP POLICY IF EXISTS "verification_evidence_update" ON verification_evidence;
CREATE POLICY "verification_evidence_update" ON verification_evidence FOR UPDATE TO authenticated USING (uploaded_by = auth.uid()) WITH CHECK (uploaded_by = auth.uid());
DROP POLICY IF EXISTS "verification_evidence_delete" ON verification_evidence;
CREATE POLICY "verification_evidence_delete" ON verification_evidence FOR DELETE TO authenticated USING (uploaded_by = auth.uid());

-- neighborhood_reviews
ALTER TABLE neighborhood_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "neighborhood_reviews_select" ON neighborhood_reviews;
CREATE POLICY "neighborhood_reviews_select" ON neighborhood_reviews FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "neighborhood_reviews_insert" ON neighborhood_reviews;
CREATE POLICY "neighborhood_reviews_insert" ON neighborhood_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "neighborhood_reviews_update" ON neighborhood_reviews;
CREATE POLICY "neighborhood_reviews_update" ON neighborhood_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "neighborhood_reviews_delete" ON neighborhood_reviews;
CREATE POLICY "neighborhood_reviews_delete" ON neighborhood_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

-- tips
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tips_select" ON tips;
CREATE POLICY "tips_select" ON tips FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "tips_insert" ON tips;
CREATE POLICY "tips_insert" ON tips FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "tips_update" ON tips;
CREATE POLICY "tips_update" ON tips FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "tips_delete" ON tips;
CREATE POLICY "tips_delete" ON tips FOR DELETE TO authenticated USING (user_id = auth.uid());

-- warnings
ALTER TABLE warnings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "warnings_select" ON warnings;
CREATE POLICY "warnings_select" ON warnings FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "warnings_insert" ON warnings;
CREATE POLICY "warnings_insert" ON warnings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "warnings_update" ON warnings;
CREATE POLICY "warnings_update" ON warnings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "warnings_delete" ON warnings;
CREATE POLICY "warnings_delete" ON warnings FOR DELETE TO authenticated USING (user_id = auth.uid());

-- knowledge_articles
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "knowledge_articles_select" ON knowledge_articles;
CREATE POLICY "knowledge_articles_select" ON knowledge_articles FOR SELECT TO authenticated USING (author_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_articles_insert" ON knowledge_articles;
CREATE POLICY "knowledge_articles_insert" ON knowledge_articles FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_articles_update" ON knowledge_articles;
CREATE POLICY "knowledge_articles_update" ON knowledge_articles FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "knowledge_articles_delete" ON knowledge_articles;
CREATE POLICY "knowledge_articles_delete" ON knowledge_articles FOR DELETE TO authenticated USING (author_id = auth.uid());

-- hygiene_reports
ALTER TABLE hygiene_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "hygiene_reports_select" ON hygiene_reports;
CREATE POLICY "hygiene_reports_select" ON hygiene_reports FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "hygiene_reports_insert" ON hygiene_reports;
CREATE POLICY "hygiene_reports_insert" ON hygiene_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "hygiene_reports_update" ON hygiene_reports;
CREATE POLICY "hygiene_reports_update" ON hygiene_reports FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "hygiene_reports_delete" ON hygiene_reports;
CREATE POLICY "hygiene_reports_delete" ON hygiene_reports FOR DELETE TO authenticated USING (user_id = auth.uid());

-- utility_incidents
ALTER TABLE utility_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "utility_incidents_select" ON utility_incidents;
CREATE POLICY "utility_incidents_select" ON utility_incidents FOR SELECT TO authenticated USING (reported_by = auth.uid());
DROP POLICY IF EXISTS "utility_incidents_insert" ON utility_incidents;
CREATE POLICY "utility_incidents_insert" ON utility_incidents FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
DROP POLICY IF EXISTS "utility_incidents_update" ON utility_incidents;
CREATE POLICY "utility_incidents_update" ON utility_incidents FOR UPDATE TO authenticated USING (reported_by = auth.uid()) WITH CHECK (reported_by = auth.uid());
DROP POLICY IF EXISTS "utility_incidents_delete" ON utility_incidents;
CREATE POLICY "utility_incidents_delete" ON utility_incidents FOR DELETE TO authenticated USING (reported_by = auth.uid());

-- property_claims
ALTER TABLE property_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_claims_select" ON property_claims;
CREATE POLICY "property_claims_select" ON property_claims FOR SELECT TO authenticated USING (claimant_id = auth.uid());
DROP POLICY IF EXISTS "property_claims_insert" ON property_claims;
CREATE POLICY "property_claims_insert" ON property_claims FOR INSERT TO authenticated WITH CHECK (claimant_id = auth.uid());
DROP POLICY IF EXISTS "property_claims_update" ON property_claims;
CREATE POLICY "property_claims_update" ON property_claims FOR UPDATE TO authenticated USING (claimant_id = auth.uid()) WITH CHECK (claimant_id = auth.uid());
DROP POLICY IF EXISTS "property_claims_delete" ON property_claims;
CREATE POLICY "property_claims_delete" ON property_claims FOR DELETE TO authenticated USING (claimant_id = auth.uid());

-- property_review_flags
ALTER TABLE property_review_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_review_flags_select" ON property_review_flags;
CREATE POLICY "property_review_flags_select" ON property_review_flags FOR SELECT TO authenticated USING (flagged_by = auth.uid());
DROP POLICY IF EXISTS "property_review_flags_insert" ON property_review_flags;
CREATE POLICY "property_review_flags_insert" ON property_review_flags FOR INSERT TO authenticated WITH CHECK (flagged_by = auth.uid());
DROP POLICY IF EXISTS "property_review_flags_update" ON property_review_flags;
CREATE POLICY "property_review_flags_update" ON property_review_flags FOR UPDATE TO authenticated USING (flagged_by = auth.uid()) WITH CHECK (flagged_by = auth.uid());
DROP POLICY IF EXISTS "property_review_flags_delete" ON property_review_flags;
CREATE POLICY "property_review_flags_delete" ON property_review_flags FOR DELETE TO authenticated USING (flagged_by = auth.uid());

-- roommate_preferences
ALTER TABLE roommate_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roommate_preferences_select" ON roommate_preferences;
CREATE POLICY "roommate_preferences_select" ON roommate_preferences FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "roommate_preferences_insert" ON roommate_preferences;
CREATE POLICY "roommate_preferences_insert" ON roommate_preferences FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "roommate_preferences_update" ON roommate_preferences;
CREATE POLICY "roommate_preferences_update" ON roommate_preferences FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "roommate_preferences_delete" ON roommate_preferences;
CREATE POLICY "roommate_preferences_delete" ON roommate_preferences FOR DELETE TO authenticated USING (student_id = auth.uid());

-- roommate_profiles
ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roommate_profiles_select" ON roommate_profiles;
CREATE POLICY "roommate_profiles_select" ON roommate_profiles FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "roommate_profiles_insert" ON roommate_profiles;
CREATE POLICY "roommate_profiles_insert" ON roommate_profiles FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "roommate_profiles_update" ON roommate_profiles;
CREATE POLICY "roommate_profiles_update" ON roommate_profiles FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "roommate_profiles_delete" ON roommate_profiles;
CREATE POLICY "roommate_profiles_delete" ON roommate_profiles FOR DELETE TO authenticated USING (student_id = auth.uid());

-- roommate_interactions
ALTER TABLE roommate_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roommate_interactions_select" ON roommate_interactions;
CREATE POLICY "roommate_interactions_select" ON roommate_interactions FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "roommate_interactions_insert" ON roommate_interactions;
CREATE POLICY "roommate_interactions_insert" ON roommate_interactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "roommate_interactions_update" ON roommate_interactions;
CREATE POLICY "roommate_interactions_update" ON roommate_interactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "roommate_interactions_delete" ON roommate_interactions;
CREATE POLICY "roommate_interactions_delete" ON roommate_interactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- roommate_messages
ALTER TABLE roommate_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roommate_messages_select" ON roommate_messages;
CREATE POLICY "roommate_messages_select" ON roommate_messages FOR SELECT TO authenticated USING (sender_id = auth.uid());
DROP POLICY IF EXISTS "roommate_messages_insert" ON roommate_messages;
CREATE POLICY "roommate_messages_insert" ON roommate_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "roommate_messages_update" ON roommate_messages;
CREATE POLICY "roommate_messages_update" ON roommate_messages FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "roommate_messages_delete" ON roommate_messages;
CREATE POLICY "roommate_messages_delete" ON roommate_messages FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- friend_preferences
ALTER TABLE friend_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "friend_preferences_select" ON friend_preferences;
CREATE POLICY "friend_preferences_select" ON friend_preferences FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "friend_preferences_insert" ON friend_preferences;
CREATE POLICY "friend_preferences_insert" ON friend_preferences FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "friend_preferences_update" ON friend_preferences;
CREATE POLICY "friend_preferences_update" ON friend_preferences FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "friend_preferences_delete" ON friend_preferences;
CREATE POLICY "friend_preferences_delete" ON friend_preferences FOR DELETE TO authenticated USING (student_id = auth.uid());

-- friend_profiles
ALTER TABLE friend_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "friend_profiles_select" ON friend_profiles;
CREATE POLICY "friend_profiles_select" ON friend_profiles FOR SELECT TO authenticated USING (student_id = auth.uid());
DROP POLICY IF EXISTS "friend_profiles_insert" ON friend_profiles;
CREATE POLICY "friend_profiles_insert" ON friend_profiles FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "friend_profiles_update" ON friend_profiles;
CREATE POLICY "friend_profiles_update" ON friend_profiles FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
DROP POLICY IF EXISTS "friend_profiles_delete" ON friend_profiles;
CREATE POLICY "friend_profiles_delete" ON friend_profiles FOR DELETE TO authenticated USING (student_id = auth.uid());

-- friend_interactions
ALTER TABLE friend_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "friend_interactions_select" ON friend_interactions;
CREATE POLICY "friend_interactions_select" ON friend_interactions FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "friend_interactions_insert" ON friend_interactions;
CREATE POLICY "friend_interactions_insert" ON friend_interactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "friend_interactions_update" ON friend_interactions;
CREATE POLICY "friend_interactions_update" ON friend_interactions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "friend_interactions_delete" ON friend_interactions;
CREATE POLICY "friend_interactions_delete" ON friend_interactions FOR DELETE TO authenticated USING (user_id = auth.uid());

-- user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user_roles_update" ON user_roles;
CREATE POLICY "user_roles_update" ON user_roles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;
CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE TO authenticated USING (user_id = auth.uid());

-- community_likes
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "community_likes_select" ON community_likes;
CREATE POLICY "community_likes_select" ON community_likes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "community_likes_insert" ON community_likes;
CREATE POLICY "community_likes_insert" ON community_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "community_likes_update" ON community_likes;
CREATE POLICY "community_likes_update" ON community_likes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "community_likes_delete" ON community_likes;
CREATE POLICY "community_likes_delete" ON community_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- saved_properties
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_properties_select" ON saved_properties;
CREATE POLICY "saved_properties_select" ON saved_properties FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "saved_properties_insert" ON saved_properties;
CREATE POLICY "saved_properties_insert" ON saved_properties FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "saved_properties_update" ON saved_properties;
CREATE POLICY "saved_properties_update" ON saved_properties FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "saved_properties_delete" ON saved_properties;
CREATE POLICY "saved_properties_delete" ON saved_properties FOR DELETE TO authenticated USING (user_id = auth.uid());

-- property_review_votes
ALTER TABLE property_review_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_review_votes_select" ON property_review_votes;
CREATE POLICY "property_review_votes_select" ON property_review_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "property_review_votes_insert" ON property_review_votes;
CREATE POLICY "property_review_votes_insert" ON property_review_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "property_review_votes_update" ON property_review_votes;
CREATE POLICY "property_review_votes_update" ON property_review_votes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "property_review_votes_delete" ON property_review_votes;
CREATE POLICY "property_review_votes_delete" ON property_review_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- discussion_votes
ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discussion_votes_select" ON discussion_votes;
CREATE POLICY "discussion_votes_select" ON discussion_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "discussion_votes_insert" ON discussion_votes;
CREATE POLICY "discussion_votes_insert" ON discussion_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "discussion_votes_update" ON discussion_votes;
CREATE POLICY "discussion_votes_update" ON discussion_votes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "discussion_votes_delete" ON discussion_votes;
CREATE POLICY "discussion_votes_delete" ON discussion_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_badges_select" ON user_badges;
CREATE POLICY "user_badges_select" ON user_badges FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_badges_insert" ON user_badges;
CREATE POLICY "user_badges_insert" ON user_badges FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user_badges_update" ON user_badges;
CREATE POLICY "user_badges_update" ON user_badges FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user_badges_delete" ON user_badges;
CREATE POLICY "user_badges_delete" ON user_badges FOR DELETE TO authenticated USING (user_id = auth.uid());

-- business_review_votes
ALTER TABLE business_review_votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_review_votes_select" ON business_review_votes;
CREATE POLICY "business_review_votes_select" ON business_review_votes FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "business_review_votes_insert" ON business_review_votes;
CREATE POLICY "business_review_votes_insert" ON business_review_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "business_review_votes_update" ON business_review_votes;
CREATE POLICY "business_review_votes_update" ON business_review_votes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "business_review_votes_delete" ON business_review_votes;
CREATE POLICY "business_review_votes_delete" ON business_review_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- roommate_matches
ALTER TABLE roommate_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roommate_matches_select" ON roommate_matches;
CREATE POLICY "roommate_matches_select" ON roommate_matches FOR SELECT TO authenticated USING (seeker_id = auth.uid() OR match_id = auth.uid());
DROP POLICY IF EXISTS "roommate_matches_insert" ON roommate_matches;
CREATE POLICY "roommate_matches_insert" ON roommate_matches FOR INSERT TO authenticated WITH CHECK (seeker_id = auth.uid() OR match_id = auth.uid());
DROP POLICY IF EXISTS "roommate_matches_update" ON roommate_matches;
CREATE POLICY "roommate_matches_update" ON roommate_matches FOR UPDATE TO authenticated USING (seeker_id = auth.uid() OR match_id = auth.uid()) WITH CHECK (seeker_id = auth.uid() OR match_id = auth.uid());
DROP POLICY IF EXISTS "roommate_matches_delete" ON roommate_matches;
CREATE POLICY "roommate_matches_delete" ON roommate_matches FOR DELETE TO authenticated USING (seeker_id = auth.uid() OR match_id = auth.uid());

-- friend_matches
ALTER TABLE friend_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "friend_matches_select" ON friend_matches;
CREATE POLICY "friend_matches_select" ON friend_matches FOR SELECT TO authenticated USING (seeker_id = auth.uid() OR match_id = auth.uid());
DROP POLICY IF EXISTS "friend_matches_insert" ON friend_matches;
CREATE POLICY "friend_matches_insert" ON friend_matches FOR INSERT TO authenticated WITH CHECK (seeker_id = auth.uid() OR match_id = auth.uid());
DROP POLICY IF EXISTS "friend_matches_update" ON friend_matches;
CREATE POLICY "friend_matches_update" ON friend_matches FOR UPDATE TO authenticated USING (seeker_id = auth.uid() OR match_id = auth.uid()) WITH CHECK (seeker_id = auth.uid() OR match_id = auth.uid());
DROP POLICY IF EXISTS "friend_matches_delete" ON friend_matches;
CREATE POLICY "friend_matches_delete" ON friend_matches FOR DELETE TO authenticated USING (seeker_id = auth.uid() OR match_id = auth.uid());

-- friend_connections
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "friend_connections_select" ON friend_connections;
CREATE POLICY "friend_connections_select" ON friend_connections FOR SELECT TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());
DROP POLICY IF EXISTS "friend_connections_insert" ON friend_connections;
CREATE POLICY "friend_connections_insert" ON friend_connections FOR INSERT TO authenticated WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());
DROP POLICY IF EXISTS "friend_connections_update" ON friend_connections;
CREATE POLICY "friend_connections_update" ON friend_connections FOR UPDATE TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid()) WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());
DROP POLICY IF EXISTS "friend_connections_delete" ON friend_connections;
CREATE POLICY "friend_connections_delete" ON friend_connections FOR DELETE TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());

-- roommate_conversations
ALTER TABLE roommate_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roommate_conversations_select" ON roommate_conversations;
CREATE POLICY "roommate_conversations_select" ON roommate_conversations FOR SELECT TO authenticated USING (participant_a = auth.uid() OR participant_b = auth.uid());
DROP POLICY IF EXISTS "roommate_conversations_insert" ON roommate_conversations;
CREATE POLICY "roommate_conversations_insert" ON roommate_conversations FOR INSERT TO authenticated WITH CHECK (participant_a = auth.uid() OR participant_b = auth.uid());
DROP POLICY IF EXISTS "roommate_conversations_update" ON roommate_conversations;
CREATE POLICY "roommate_conversations_update" ON roommate_conversations FOR UPDATE TO authenticated USING (participant_a = auth.uid() OR participant_b = auth.uid()) WITH CHECK (participant_a = auth.uid() OR participant_b = auth.uid());
DROP POLICY IF EXISTS "roommate_conversations_delete" ON roommate_conversations;
CREATE POLICY "roommate_conversations_delete" ON roommate_conversations FOR DELETE TO authenticated USING (participant_a = auth.uid() OR participant_b = auth.uid());

-- property_rooms
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_rooms_select" ON property_rooms;
CREATE POLICY "property_rooms_select" ON property_rooms FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_rooms_insert" ON property_rooms;
CREATE POLICY "property_rooms_insert" ON property_rooms FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_rooms_update" ON property_rooms;
CREATE POLICY "property_rooms_update" ON property_rooms FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_rooms_delete" ON property_rooms;
CREATE POLICY "property_rooms_delete" ON property_rooms FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.owner_id = auth.uid()));

-- property_media
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_media_select" ON property_media;
CREATE POLICY "property_media_select" ON property_media FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_media_insert" ON property_media;
CREATE POLICY "property_media_insert" ON property_media FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_media_update" ON property_media;
CREATE POLICY "property_media_update" ON property_media FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_media_delete" ON property_media;
CREATE POLICY "property_media_delete" ON property_media FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.owner_id = auth.uid()));

-- business_media
ALTER TABLE business_media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "business_media_select" ON business_media;
CREATE POLICY "business_media_select" ON business_media FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_media.business_id AND businesses.owner_id = auth.uid()));
DROP POLICY IF EXISTS "business_media_insert" ON business_media;
CREATE POLICY "business_media_insert" ON business_media FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_media.business_id AND businesses.owner_id = auth.uid()));
DROP POLICY IF EXISTS "business_media_update" ON business_media;
CREATE POLICY "business_media_update" ON business_media FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_media.business_id AND businesses.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_media.business_id AND businesses.owner_id = auth.uid()));
DROP POLICY IF EXISTS "business_media_delete" ON business_media;
CREATE POLICY "business_media_delete" ON business_media FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = business_media.business_id AND businesses.owner_id = auth.uid()));

-- property_amenities
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_amenities_select" ON property_amenities;
CREATE POLICY "property_amenities_select" ON property_amenities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_amenities_insert" ON property_amenities;
CREATE POLICY "property_amenities_insert" ON property_amenities FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_amenities_update" ON property_amenities;
CREATE POLICY "property_amenities_update" ON property_amenities FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_amenities_delete" ON property_amenities;
CREATE POLICY "property_amenities_delete" ON property_amenities FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.owner_id = auth.uid()));

-- property_utilities
ALTER TABLE property_utilities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "property_utilities_select" ON property_utilities;
CREATE POLICY "property_utilities_select" ON property_utilities FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_utilities_insert" ON property_utilities;
CREATE POLICY "property_utilities_insert" ON property_utilities FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_utilities_update" ON property_utilities;
CREATE POLICY "property_utilities_update" ON property_utilities FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.owner_id = auth.uid()));
DROP POLICY IF EXISTS "property_utilities_delete" ON property_utilities;
CREATE POLICY "property_utilities_delete" ON property_utilities FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.owner_id = auth.uid()));

-- forums
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forums_select" ON forums;
CREATE POLICY "forums_select" ON forums FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "forums_insert" ON forums;
CREATE POLICY "forums_insert" ON forums FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "forums_update" ON forums;
CREATE POLICY "forums_update" ON forums FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "forums_delete" ON forums;
CREATE POLICY "forums_delete" ON forums FOR DELETE TO authenticated USING (false);

-- forum_topics
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forum_topics_select" ON forum_topics;
CREATE POLICY "forum_topics_select" ON forum_topics FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "forum_topics_insert" ON forum_topics;
CREATE POLICY "forum_topics_insert" ON forum_topics FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "forum_topics_update" ON forum_topics;
CREATE POLICY "forum_topics_update" ON forum_topics FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "forum_topics_delete" ON forum_topics;
CREATE POLICY "forum_topics_delete" ON forum_topics FOR DELETE TO authenticated USING (false);

-- forum_posts
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "forum_posts_select" ON forum_posts;
CREATE POLICY "forum_posts_select" ON forum_posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "forum_posts_insert" ON forum_posts;
CREATE POLICY "forum_posts_insert" ON forum_posts FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "forum_posts_update" ON forum_posts;
CREATE POLICY "forum_posts_update" ON forum_posts FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "forum_posts_delete" ON forum_posts;
CREATE POLICY "forum_posts_delete" ON forum_posts FOR DELETE TO authenticated USING (false);

-- neighborhood_landmarks
ALTER TABLE neighborhood_landmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "neighborhood_landmarks_select" ON neighborhood_landmarks;
CREATE POLICY "neighborhood_landmarks_select" ON neighborhood_landmarks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "neighborhood_landmarks_insert" ON neighborhood_landmarks;
CREATE POLICY "neighborhood_landmarks_insert" ON neighborhood_landmarks FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "neighborhood_landmarks_update" ON neighborhood_landmarks;
CREATE POLICY "neighborhood_landmarks_update" ON neighborhood_landmarks FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "neighborhood_landmarks_delete" ON neighborhood_landmarks;
CREATE POLICY "neighborhood_landmarks_delete" ON neighborhood_landmarks FOR DELETE TO authenticated USING (false);

-- neighborhood_campus_distances
ALTER TABLE neighborhood_campus_distances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "neighborhood_campus_distances_select" ON neighborhood_campus_distances;
CREATE POLICY "neighborhood_campus_distances_select" ON neighborhood_campus_distances FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "neighborhood_campus_distances_insert" ON neighborhood_campus_distances;
CREATE POLICY "neighborhood_campus_distances_insert" ON neighborhood_campus_distances FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "neighborhood_campus_distances_update" ON neighborhood_campus_distances;
CREATE POLICY "neighborhood_campus_distances_update" ON neighborhood_campus_distances FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "neighborhood_campus_distances_delete" ON neighborhood_campus_distances;
CREATE POLICY "neighborhood_campus_distances_delete" ON neighborhood_campus_distances FOR DELETE TO authenticated USING (false);

