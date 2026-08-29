-- Add detail fields to opportunity_suggestions
ALTER TABLE opportunity_suggestions
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS is_remote BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS compensation TEXT,
  ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
