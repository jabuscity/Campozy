-- ============================================================================
-- Fix: allow all active properties to be readable by authenticated users
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    DROP POLICY IF EXISTS "properties_public_read" ON properties;
    CREATE POLICY "properties_public_read" ON properties
      FOR SELECT TO authenticated USING (is_active = TRUE);
  END IF;
END $$;
