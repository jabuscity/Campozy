-- =============================================================================
-- OPPORTUNITY SUGGESTIONS SYSTEM
-- =============================================================================

-- Add opportunity_suggestion to notification_type enum (if not exists)
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'opportunity_suggestion';

-- Status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'opportunity_suggestion_status') THEN
    CREATE TYPE opportunity_suggestion_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS opportunity_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type opportunity_type NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  status opportunity_suggestion_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opportunity_suggestions_user_id ON opportunity_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_suggestions_status ON opportunity_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_opportunity_suggestions_type ON opportunity_suggestions(type);

-- RLS
ALTER TABLE opportunity_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
DROP POLICY IF EXISTS "Users can view own opportunity suggestions" ON opportunity_suggestions;
CREATE POLICY "Users can view own opportunity suggestions" ON opportunity_suggestions FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Users can create suggestions
DROP POLICY IF EXISTS "Users can create opportunity suggestions" ON opportunity_suggestions;
CREATE POLICY "Users can create opportunity suggestions" ON opportunity_suggestions FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Admins can view all suggestions
DROP POLICY IF EXISTS "Admins can view all opportunity suggestions" ON opportunity_suggestions;
CREATE POLICY "Admins can view all opportunity suggestions" ON opportunity_suggestions FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'moderator')
    )
  );

-- Admins can update suggestions (approve/reject)
DROP POLICY IF EXISTS "Admins can update opportunity suggestions" ON opportunity_suggestions;
CREATE POLICY "Admins can update opportunity suggestions" ON opportunity_suggestions FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'moderator')
    )
  );

-- Grants
GRANT SELECT ON opportunity_suggestions TO anon, authenticated;
GRANT INSERT, UPDATE ON opportunity_suggestions TO authenticated;
