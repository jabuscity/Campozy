-- ============================================================================
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

