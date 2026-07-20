-- ============================================================================
-- CAMPOZY SCHEMA RECONCILIATION MIGRATION
-- Adds missing columns to match the TypeScript types and frontend code.
-- Applied to live Supabase project: Campozy (wqnnuydlsgmxnbxdpfdx)
-- ============================================================================

-- Reference Tables
ALTER TABLE IF EXISTS public.countries ADD COLUMN IF NOT EXISTS iso_code TEXT UNIQUE;
ALTER TABLE IF EXISTS public.cities ADD COLUMN IF NOT EXISTS iso_code TEXT;

-- Education Domain
ALTER TABLE IF EXISTS public.universities ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES public.countries(id);
ALTER TABLE IF EXISTS public.universities ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE IF EXISTS public.universities ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE IF EXISTS public.universities ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE IF EXISTS public.campuses ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);
ALTER TABLE IF EXISTS public.campuses ADD COLUMN IF NOT EXISTS location_lat NUMERIC(9, 6) CHECK (location_lat BETWEEN -90 AND 90);
ALTER TABLE IF EXISTS public.campuses ADD COLUMN IF NOT EXISTS location_lng NUMERIC(9, 6) CHECK (location_lng BETWEEN -180 AND 180);
ALTER TABLE IF EXISTS public.campuses ADD COLUMN IF NOT EXISTS address TEXT;

-- Identity Domain
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS trust_level TEXT NOT NULL DEFAULT 'new';
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER NOT NULL DEFAULT 0 CHECK (reputation_score >= 0);
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS contribution_score INTEGER NOT NULL DEFAULT 0 CHECK (contribution_score >= 0);
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Geography Domain
ALTER TABLE IF EXISTS public.neighborhoods ADD COLUMN IF NOT EXISTS safety_score NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (safety_score BETWEEN 0 AND 100);
ALTER TABLE IF EXISTS public.neighborhoods ADD COLUMN IF NOT EXISTS reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (reputation_score BETWEEN 0 AND 100);

-- Housing Domain
ALTER TABLE IF EXISTS public.properties ADD COLUMN IF NOT EXISTS reputation_score NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (reputation_score BETWEEN 0 AND 100);

-- Alumni Domain
ALTER TABLE IF EXISTS public.alumni_profiles ADD COLUMN IF NOT EXISTS current_role TEXT;
ALTER TABLE IF EXISTS public.alumni_profiles ADD COLUMN IF NOT EXISTS is_employer BOOLEAN NOT NULL DEFAULT FALSE;
