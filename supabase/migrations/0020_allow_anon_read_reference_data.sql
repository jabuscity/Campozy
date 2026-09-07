-- 0020_allow_anon_read_reference_data.sql
-- Allow anonymous (logged-out) users to read reference/listing data so that
-- publicly accessible pages (e.g. /neighborhoods/[id], /search) can render
-- without triggering RLS permission-denied errors on joins.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'countries') THEN
    DROP POLICY IF EXISTS "countries_select_anon" ON countries;
    CREATE POLICY "countries_select_anon" ON countries FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cities') THEN
    DROP POLICY IF EXISTS "cities_select_anon" ON cities;
    CREATE POLICY "cities_select_anon" ON cities FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'universities') THEN
    DROP POLICY IF EXISTS "universities_select_anon" ON universities;
    CREATE POLICY "universities_select_anon" ON universities FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'campuses') THEN
    DROP POLICY IF EXISTS "campuses_select_anon" ON campuses;
    CREATE POLICY "campuses_select_anon" ON campuses FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'neighborhoods') THEN
    DROP POLICY IF EXISTS "neighborhoods_select_anon" ON neighborhoods;
    CREATE POLICY "neighborhoods_select_anon" ON neighborhoods FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'neighborhood_campus_distances') THEN
    DROP POLICY IF EXISTS "neighborhood_campus_distances_select_anon" ON neighborhood_campus_distances;
    CREATE POLICY "neighborhood_campus_distances_select_anon" ON neighborhood_campus_distances FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'neighborhood_landmarks') THEN
    DROP POLICY IF EXISTS "neighborhood_landmarks_select_anon" ON neighborhood_landmarks;
    CREATE POLICY "neighborhood_landmarks_select_anon" ON neighborhood_landmarks FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'properties') THEN
    DROP POLICY IF EXISTS "properties_public_read_anon" ON properties;
    CREATE POLICY "properties_public_read_anon" ON properties FOR SELECT TO anon USING (is_active = TRUE);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_types') THEN
    DROP POLICY IF EXISTS "property_types_select_anon" ON property_types;
    CREATE POLICY "property_types_select_anon" ON property_types FOR SELECT TO anon USING (true);
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_rooms') THEN
    DROP POLICY IF EXISTS "property_rooms_select_anon" ON property_rooms;
    CREATE POLICY "property_rooms_select_anon" ON property_rooms FOR SELECT TO anon USING (
      EXISTS (SELECT 1 FROM properties WHERE properties.id = property_rooms.property_id AND properties.is_active = TRUE)
    );
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'property_media') THEN
    DROP POLICY IF EXISTS "property_media_select_anon" ON property_media;
    CREATE POLICY "property_media_select_anon" ON property_media FOR SELECT TO anon USING (
      EXISTS (SELECT 1 FROM properties WHERE properties.id = property_media.property_id AND properties.is_active = TRUE)
    );
  END IF;
END $$;