-- Add link/contact field to opportunity_suggestions
ALTER TABLE opportunity_suggestions
  ADD COLUMN IF NOT EXISTS link TEXT;
