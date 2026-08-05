-- ============================================================================
-- Migration 0011: Add onboarding fields
-- ============================================================================

-- Profiles: onboarding flag + date of birth
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Students: onboarding preference fields
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS personality TEXT,
  ADD COLUMN IF NOT EXISTS fun_activities TEXT,
  ADD COLUMN IF NOT EXISTS religious_inclination TEXT,
  ADD COLUMN IF NOT EXISTS study_type TEXT;
