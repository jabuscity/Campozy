-- ============================================================================
-- CAMPOZY DATABASE CLEARANCE SCRIPT
-- ============================================================================
-- Purpose: Drops all Campozy tables, policies, triggers, and functions
--          while preserving extensions and enum types.
--
-- WARNING: This will delete ALL data. Use only on development/staging.
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;

-- Drop all tables in reverse dependency order
-- Using CASCADE to handle foreign key dependencies

DROP TABLE IF EXISTS public.academic_programs CASCADE;
DROP TABLE IF EXISTS public.amenities CASCADE;
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.business_media CASCADE;
DROP TABLE IF EXISTS public.business_review_replies CASCADE;
DROP TABLE IF EXISTS public.business_review_votes CASCADE;
DROP TABLE IF EXISTS public.business_reviews CASCADE;
DROP TABLE IF EXISTS public.businesses CASCADE;
DROP TABLE IF EXISTS public.campuses CASCADE;
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.community_comments CASCADE;
DROP TABLE IF EXISTS public.community_likes CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.contact_methods CASCADE;
DROP TABLE IF EXISTS public.countries CASCADE;
DROP TABLE IF EXISTS public.discussion_categories CASCADE;
DROP TABLE IF EXISTS public.discussion_replies CASCADE;
DROP TABLE IF EXISTS public.discussion_votes CASCADE;
DROP TABLE IF EXISTS public.discussions CASCADE;
DROP TABLE IF EXISTS public.friend_connections CASCADE;
DROP TABLE IF EXISTS public.friend_interactions CASCADE;
DROP TABLE IF EXISTS public.friend_matches CASCADE;
DROP TABLE IF EXISTS public.friend_preferences CASCADE;
DROP TABLE IF EXISTS public.friend_profiles CASCADE;
DROP TABLE IF EXISTS public.high_schools CASCADE;
DROP TABLE IF EXISTS public.hygiene_reports CASCADE;
DROP TABLE IF EXISTS public.identity_documents CASCADE;
DROP TABLE IF EXISTS public.knowledge_articles CASCADE;
DROP TABLE IF EXISTS public.neighborhood_campus_distances CASCADE;
DROP TABLE IF EXISTS public.neighborhood_landmarks CASCADE;
DROP TABLE IF EXISTS public.neighborhood_reviews CASCADE;
DROP TABLE IF EXISTS public.neighborhoods CASCADE;
DROP TABLE IF EXISTS public.owners CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.property_amenities CASCADE;
DROP TABLE IF EXISTS public.property_claims CASCADE;
DROP TABLE IF EXISTS public.property_inquiries CASCADE;
DROP TABLE IF EXISTS public.property_media CASCADE;
DROP TABLE IF EXISTS public.property_review_flags CASCADE;
DROP TABLE IF EXISTS public.property_review_votes CASCADE;
DROP TABLE IF EXISTS public.property_reviews CASCADE;
DROP TABLE IF EXISTS public.property_rooms CASCADE;
DROP TABLE IF EXISTS public.property_types CASCADE;
DROP TABLE IF EXISTS public.property_utilities CASCADE;
DROP TABLE IF EXISTS public.reputation_events CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.roommate_conversations CASCADE;
DROP TABLE IF EXISTS public.roommate_interactions CASCADE;
DROP TABLE IF EXISTS public.roommate_matches CASCADE;
DROP TABLE IF EXISTS public.roommate_messages CASCADE;
DROP TABLE IF EXISTS public.roommate_preferences CASCADE;
DROP TABLE IF EXISTS public.roommate_profiles CASCADE;
DROP TABLE IF EXISTS public.saved_properties CASCADE;
DROP TABLE IF EXISTS public.student_lifecycle_history CASCADE;
DROP TABLE IF EXISTS public.student_preferences CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.tips CASCADE;
DROP TABLE IF EXISTS public.universities CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.utilities CASCADE;
DROP TABLE IF EXISTS public.utility_incidents CASCADE;
DROP TABLE IF EXISTS public.verification_evidence CASCADE;
DROP TABLE IF EXISTS public.verification_records CASCADE;
DROP TABLE IF EXISTS public.viewing_requests CASCADE;
DROP TABLE IF EXISTS public.warnings CASCADE;

-- ============================================================================
-- IMPORTANT: Extensions and enum types are intentionally preserved
-- ============================================================================
--
-- Preserved extensions:
--   - pgcrypto
--   - pg_trgm
--   - vector
--
-- Preserved enum types:
--   - verification_level
--   - verification_status
--   - founder_scope
--   - claim_status
--   - assignment_status
--   - opportunity_type
--   - application_status
--   - mentorship_status
--   - notification_type
--   - moderation_status
--   - moderation_action_type
--   - appeal_status
--
-- To drop these manually if needed:
--   DROP EXTENSION IF EXISTS vector CASCADE;
--   DROP EXTENSION IF EXISTS pg_trgm CASCADE;
--   DROP EXTENSION IF EXISTS pgcrypto CASCADE;
--   DROP TYPE IF EXISTS appeal_status CASCADE;
--   DROP TYPE IF EXISTS moderation_action_type CASCADE;
--   DROP TYPE IF EXISTS moderation_status CASCADE;
--   DROP TYPE IF EXISTS notification_type CASCADE;
--   DROP TYPE IF EXISTS mentorship_status CASCADE;
--   DROP TYPE IF EXISTS application_status CASCADE;
--   DROP TYPE IF EXISTS opportunity_type CASCADE;
--   DROP TYPE IF EXISTS assignment_status CASCADE;
--   DROP TYPE IF EXISTS claim_status CASCADE;
--   DROP TYPE IF EXISTS verification_status CASCADE;
--   DROP TYPE IF EXISTS verification_level CASCADE;
--   DROP TYPE IF EXISTS founder_scope CASCADE;
-- ============================================================================

SELECT 'CAMPOZY DATABASE CLEARED (extensions and enums preserved)' AS status;
