-- ============================================================================
-- Migration 0010: Student-Only Cleanup
-- Remove owner/landlord functionality, add student-centric tables
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Drop owner-dependent RLS policies
-- ============================================================================

-- Properties: drop owner policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    DROP POLICY IF EXISTS "owners_create_properties" ON properties;
    DROP POLICY IF EXISTS "owners_update_properties" ON properties;
    DROP POLICY IF EXISTS "owners_delete_properties" ON properties;
  END IF;
END $$;

-- Property rooms: drop owner policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_rooms') THEN
    DROP POLICY IF EXISTS "owners_create_property_rooms" ON property_rooms;
    DROP POLICY IF EXISTS "owners_update_property_rooms" ON property_rooms;
    DROP POLICY IF EXISTS "owners_delete_property_rooms" ON property_rooms;
  END IF;
END $$;

-- Property media: drop owner policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_media') THEN
    DROP POLICY IF EXISTS "Property owners can create property media" ON property_media;
    DROP POLICY IF EXISTS "Property owners can update property media" ON property_media;
    DROP POLICY IF EXISTS "Property owners can delete property media" ON property_media;
  END IF;
END $$;

-- Property amenities: drop owner policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_amenities') THEN
    DROP POLICY IF EXISTS "Property owners can create property amenities" ON property_amenities;
    DROP POLICY IF EXISTS "Property owners can update property amenities" ON property_amenities;
    DROP POLICY IF EXISTS "Property owners can delete property amenities" ON property_amenities;
  END IF;
END $$;

-- Property utilities: drop owner policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_utilities') THEN
    DROP POLICY IF EXISTS "Property owners can create property utilities" ON property_utilities;
    DROP POLICY IF EXISTS "Property owners can update property utilities" ON property_utilities;
    DROP POLICY IF EXISTS "Property owners can delete property utilities" ON property_utilities;
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Remove owner_id from properties and add student-centric columns
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    -- Drop owner index if exists
    DROP INDEX IF EXISTS idx_properties_owner_id;
    
    -- Drop owner_id column if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'owner_id') THEN
      ALTER TABLE properties DROP COLUMN owner_id;
    END IF;
    
    -- Add curated_by if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'curated_by') THEN
      ALTER TABLE properties ADD COLUMN curated_by UUID REFERENCES profiles(id);
    END IF;
    
    -- Add curation_notes if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'curation_notes') THEN
      ALTER TABLE properties ADD COLUMN curation_notes TEXT;
    END IF;
    
    -- Add data_source if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'data_source') THEN
      ALTER TABLE properties ADD COLUMN data_source TEXT DEFAULT 'scout_verified' 
        CHECK (data_source IN ('scout_verified', 'community_verified', 'campozy_verified'));
    END IF;
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Drop owner-related tables
-- ============================================================================

-- Drop property_inquiries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_inquiries') THEN
    DROP TABLE property_inquiries CASCADE;
  END IF;
END $$;

-- Drop viewing_requests
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'viewing_requests') THEN
    DROP TABLE viewing_requests CASCADE;
  END IF;
END $$;

-- Drop property_claims
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_claims') THEN
    DROP TABLE property_claims CASCADE;
  END IF;
END $$;

-- Drop owners
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'owners') THEN
    DROP TABLE owners CASCADE;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Update properties RLS policies (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    -- Students can view verified properties
    DROP POLICY IF EXISTS "properties_public_read" ON properties;
    CREATE POLICY "properties_public_read" ON properties 
      FOR SELECT TO authenticated USING (is_active = TRUE AND verification_level IN ('community_verified', 'scout_verified', 'campozy_verified'));
    
    -- Students can update properties they curate (for scouts/admins)
    DROP POLICY IF EXISTS "properties_student_update" ON properties;
    CREATE POLICY "properties_student_update" ON properties 
      FOR UPDATE TO authenticated USING (
        curated_by = auth.uid() 
        OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'scout'))
      ) WITH CHECK (
        curated_by = auth.uid() 
        OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'scout'))
      );
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Update property_rooms RLS (remove owner dependency)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_rooms') THEN
    DROP POLICY IF EXISTS "property_rooms_public_read" ON property_rooms;
    CREATE POLICY "property_rooms_public_read" ON property_rooms 
      FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.is_active = TRUE)
      );
    
    DROP POLICY IF EXISTS "owners_create_property_rooms" ON property_rooms;
    DROP POLICY IF EXISTS "owners_update_property_rooms" ON property_rooms;
    DROP POLICY IF EXISTS "owners_delete_property_rooms" ON property_rooms;
    
    CREATE POLICY "property_rooms_admin_insert" ON property_rooms 
      FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
      );
    CREATE POLICY "property_rooms_admin_update" ON property_rooms 
      FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
      );
    CREATE POLICY "property_rooms_admin_delete" ON property_rooms 
      FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
      );
  END IF;
END $$;

-- ============================================================================
-- STEP 6: Update property_media RLS (remove owner dependency)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_media') THEN
    DROP POLICY IF EXISTS "Property owners can create property media" ON property_media;
    DROP POLICY IF EXISTS "Property owners can update property media" ON property_media;
    DROP POLICY IF EXISTS "Property owners can delete property media" ON property_media;
    
    CREATE POLICY "property_media_admin_insert" ON property_media 
      FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.is_active = TRUE)
      );
    CREATE POLICY "property_media_admin_update" ON property_media 
      FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.is_active = TRUE)
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.is_active = TRUE)
      );
    CREATE POLICY "property_media_admin_delete" ON property_media 
      FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.is_active = TRUE)
      );
  END IF;
END $$;

-- ============================================================================
-- STEP 7: Update property_amenities RLS (remove owner dependency)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_amenities') THEN
    DROP POLICY IF EXISTS "Property owners can create property amenities" ON property_amenities;
    DROP POLICY IF EXISTS "Property owners can update property amenities" ON property_amenities;
    DROP POLICY IF EXISTS "Property owners can delete property amenities" ON property_amenities;
    
    CREATE POLICY "property_amenities_admin_insert" ON property_amenities 
      FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.is_active = TRUE)
      );
    CREATE POLICY "property_amenities_admin_update" ON property_amenities 
      FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.is_active = TRUE)
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.is_active = TRUE)
      );
    CREATE POLICY "property_amenities_admin_delete" ON property_amenities 
      FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_amenities.property_id AND properties.is_active = TRUE)
      );
  END IF;
END $$;

-- ============================================================================
-- STEP 8: Update property_utilities RLS (remove owner dependency)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_utilities') THEN
    DROP POLICY IF EXISTS "Property owners can create property utilities" ON property_utilities;
    DROP POLICY IF EXISTS "Property owners can update property utilities" ON property_utilities;
    DROP POLICY IF EXISTS "Property owners can delete property utilities" ON property_utilities;
    
    CREATE POLICY "property_utilities_admin_insert" ON property_utilities 
      FOR INSERT TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.is_active = TRUE)
      );
    CREATE POLICY "property_utilities_admin_update" ON property_utilities 
      FOR UPDATE TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.is_active = TRUE)
      ) WITH CHECK (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.is_active = TRUE)
      );
    CREATE POLICY "property_utilities_admin_delete" ON property_utilities 
      FOR DELETE TO authenticated USING (
        EXISTS (SELECT 1 FROM properties WHERE properties.id = property_utilities.property_id AND properties.is_active = TRUE)
      );
  END IF;
END $$;

-- ============================================================================
-- STEP 9: Update utility_reports table for student-only use
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'utility_reports') THEN
    -- Make property_id nullable for campus/neighborhood reports
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'property_id' AND is_nullable = 'NO') THEN
      -- Drop dependent indexes first
      DROP INDEX IF EXISTS idx_utility_reports_property_id;
      ALTER TABLE utility_reports ALTER COLUMN property_id DROP NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_utility_reports_property_id ON utility_reports(property_id);
    END IF;
    
    -- Add campus_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'campus_id') THEN
      ALTER TABLE utility_reports ADD COLUMN campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_utility_reports_campus_id ON utility_reports(campus_id);
    END IF;
    
    -- Add neighborhood_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'neighborhood_id') THEN
      ALTER TABLE utility_reports ADD COLUMN neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_utility_reports_neighborhood_id ON utility_reports(neighborhood_id);
    END IF;
    
    -- Add status if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'status') THEN
      ALTER TABLE utility_reports ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed'));
    END IF;
    
    -- Add severity if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'severity') THEN
      ALTER TABLE utility_reports ADD COLUMN severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical'));
    END IF;
    
    -- Add title if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'title') THEN
      ALTER TABLE utility_reports ADD COLUMN title TEXT NOT NULL DEFAULT 'Utility Report';
    END IF;
    
    -- Add description if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'description') THEN
      ALTER TABLE utility_reports ADD COLUMN description TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Add is_verified if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'is_verified') THEN
      ALTER TABLE utility_reports ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add verified_by if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'verified_by') THEN
      ALTER TABLE utility_reports ADD COLUMN verified_by UUID REFERENCES profiles(id);
    END IF;
    
    -- Add verified_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'verified_at') THEN
      ALTER TABLE utility_reports ADD COLUMN verified_at TIMESTAMPTZ;
    END IF;
    
    -- Add created_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'created_at') THEN
      ALTER TABLE utility_reports ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    -- Add updated_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'utility_reports' AND column_name = 'updated_at') THEN
      ALTER TABLE utility_reports ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    END IF;
    
    -- Update RLS: students can create and view their own utility reports
    DROP POLICY IF EXISTS "utility_reports_select" ON utility_reports;
    DROP POLICY IF EXISTS "utility_reports_insert" ON utility_reports;
    DROP POLICY IF EXISTS "utility_reports_update" ON utility_reports;
    DROP POLICY IF EXISTS "utility_reports_delete" ON utility_reports;
    
    CREATE POLICY "utility_reports_select" ON utility_reports 
      FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_verified = TRUE);
    CREATE POLICY "utility_reports_insert" ON utility_reports 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "utility_reports_update" ON utility_reports 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "utility_reports_delete" ON utility_reports 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 10: Create contribution_events table
-- ============================================================================

CREATE TABLE IF NOT EXISTS contribution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('utility_report', 'review', 'discussion', 'answer', 'tip', 'warning', 'verification', 'profile_update')),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_events_user_id ON contribution_events(user_id);
CREATE INDEX IF NOT EXISTS idx_contribution_events_event_type ON contribution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_contribution_events_created_at ON contribution_events(created_at DESC);

-- RLS for contribution_events
ALTER TABLE contribution_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contribution_events_select" ON contribution_events;
CREATE POLICY "contribution_events_select" ON contribution_events 
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "contribution_events_insert" ON contribution_events;
CREATE POLICY "contribution_events_insert" ON contribution_events 
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- STEP 11: Update property_reviews RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_reviews') THEN
    DROP POLICY IF EXISTS "property_reviews_select" ON property_reviews;
    DROP POLICY IF EXISTS "property_reviews_insert" ON property_reviews;
    DROP POLICY IF EXISTS "property_reviews_update" ON property_reviews;
    DROP POLICY IF EXISTS "property_reviews_delete" ON property_reviews;
    
    CREATE POLICY "property_reviews_select" ON property_reviews 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "property_reviews_insert" ON property_reviews 
      FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());
    CREATE POLICY "property_reviews_update" ON property_reviews 
      FOR UPDATE TO authenticated USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());
    CREATE POLICY "property_reviews_delete" ON property_reviews 
      FOR DELETE TO authenticated USING (reviewer_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 12: Update discussions RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'discussions') THEN
    DROP POLICY IF EXISTS "discussions_select" ON discussions;
    DROP POLICY IF EXISTS "discussions_insert" ON discussions;
    DROP POLICY IF EXISTS "discussions_update" ON discussions;
    DROP POLICY IF EXISTS "discussions_delete" ON discussions;
    
    CREATE POLICY "discussions_select" ON discussions 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "discussions_insert" ON discussions 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "discussions_update" ON discussions 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "discussions_delete" ON discussions 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 13: Update discussion_replies RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'discussion_replies') THEN
    DROP POLICY IF EXISTS "discussion_replies_select" ON discussion_replies;
    DROP POLICY IF EXISTS "discussion_replies_insert" ON discussion_replies;
    DROP POLICY IF EXISTS "discussion_replies_update" ON discussion_replies;
    DROP POLICY IF EXISTS "discussion_replies_delete" ON discussion_replies;
    
    CREATE POLICY "discussion_replies_select" ON discussion_replies 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "discussion_replies_insert" ON discussion_replies 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "discussion_replies_update" ON discussion_replies 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "discussion_replies_delete" ON discussion_replies 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 14: Update saved_properties RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'saved_properties') THEN
    DROP POLICY IF EXISTS "saved_properties_select" ON saved_properties;
    DROP POLICY IF EXISTS "saved_properties_insert" ON saved_properties;
    DROP POLICY IF EXISTS "saved_properties_update" ON saved_properties;
    DROP POLICY IF EXISTS "saved_properties_delete" ON saved_properties;
    
    CREATE POLICY "saved_properties_select" ON saved_properties 
      FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "saved_properties_insert" ON saved_properties 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "saved_properties_update" ON saved_properties 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "saved_properties_delete" ON saved_properties 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 15: Update neighborhood_reviews RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'neighborhood_reviews') THEN
    DROP POLICY IF EXISTS "neighborhood_reviews_select" ON neighborhood_reviews;
    DROP POLICY IF EXISTS "neighborhood_reviews_insert" ON neighborhood_reviews;
    DROP POLICY IF EXISTS "neighborhood_reviews_update" ON neighborhood_reviews;
    DROP POLICY IF EXISTS "neighborhood_reviews_delete" ON neighborhood_reviews;
    
    CREATE POLICY "neighborhood_reviews_select" ON neighborhood_reviews 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "neighborhood_reviews_insert" ON neighborhood_reviews 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "neighborhood_reviews_update" ON neighborhood_reviews 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "neighborhood_reviews_delete" ON neighborhood_reviews 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 16: Update tips RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'tips') THEN
    DROP POLICY IF EXISTS "tips_select" ON tips;
    DROP POLICY IF EXISTS "tips_insert" ON tips;
    DROP POLICY IF EXISTS "tips_update" ON tips;
    DROP POLICY IF EXISTS "tips_delete" ON tips;
    
    CREATE POLICY "tips_select" ON tips 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "tips_insert" ON tips 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "tips_update" ON tips 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "tips_delete" ON tips 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 17: Update warnings RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'warnings') THEN
    DROP POLICY IF EXISTS "warnings_select" ON warnings;
    DROP POLICY IF EXISTS "warnings_insert" ON warnings;
    DROP POLICY IF EXISTS "warnings_update" ON warnings;
    DROP POLICY IF EXISTS "warnings_delete" ON warnings;
    
    CREATE POLICY "warnings_select" ON warnings 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "warnings_insert" ON warnings 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "warnings_update" ON warnings 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "warnings_delete" ON warnings 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 18: Update knowledge_articles RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'knowledge_articles') THEN
    DROP POLICY IF EXISTS "knowledge_articles_select" ON knowledge_articles;
    DROP POLICY IF EXISTS "knowledge_articles_insert" ON knowledge_articles;
    DROP POLICY IF EXISTS "knowledge_articles_update" ON knowledge_articles;
    DROP POLICY IF EXISTS "knowledge_articles_delete" ON knowledge_articles;
    
    CREATE POLICY "knowledge_articles_select" ON knowledge_articles 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "knowledge_articles_insert" ON knowledge_articles 
      FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
    CREATE POLICY "knowledge_articles_update" ON knowledge_articles 
      FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
    CREATE POLICY "knowledge_articles_delete" ON knowledge_articles 
      FOR DELETE TO authenticated USING (author_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 19: Update hygiene_reports RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'hygiene_reports') THEN
    DROP POLICY IF EXISTS "hygiene_reports_select" ON hygiene_reports;
    DROP POLICY IF EXISTS "hygiene_reports_insert" ON hygiene_reports;
    DROP POLICY IF EXISTS "hygiene_reports_update" ON hygiene_reports;
    DROP POLICY IF EXISTS "hygiene_reports_delete" ON hygiene_reports;
    
    CREATE POLICY "hygiene_reports_select" ON hygiene_reports 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "hygiene_reports_insert" ON hygiene_reports 
      FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "hygiene_reports_update" ON hygiene_reports 
      FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
    CREATE POLICY "hygiene_reports_delete" ON hygiene_reports 
      FOR DELETE TO authenticated USING (user_id = auth.uid());
  END IF;
END $$;

-- ============================================================================
-- STEP 20: Update utility_incidents RLS (student-only)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'utility_incidents') THEN
    DROP POLICY IF EXISTS "utility_incidents_select" ON utility_incidents;
    DROP POLICY IF EXISTS "utility_incidents_insert" ON utility_incidents;
    DROP POLICY IF EXISTS "utility_incidents_update" ON utility_incidents;
    DROP POLICY IF EXISTS "utility_incidents_delete" ON utility_incidents;
    
    CREATE POLICY "utility_incidents_select" ON utility_incidents 
      FOR SELECT TO authenticated USING (TRUE);
    CREATE POLICY "utility_incidents_insert" ON utility_incidents 
      FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
    CREATE POLICY "utility_incidents_update" ON utility_incidents 
      FOR UPDATE TO authenticated USING (reported_by = auth.uid()) WITH CHECK (reported_by = auth.uid());
    CREATE POLICY "utility_incidents_delete" ON utility_incidents 
      FOR DELETE TO authenticated USING (reported_by = auth.uid());
  END IF;
END $$;

COMMIT;
