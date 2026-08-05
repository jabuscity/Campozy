-- =============================================================================
-- TIP SUGGESTIONS SYSTEM
-- =============================================================================

-- Add tip_suggestion to notification_type enum
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'tip_suggestion';

-- Status enum (conditional creation for idempotency)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tip_status') THEN
    CREATE TYPE tip_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS tip_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tip_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES tip_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT NOT NULL CHECK (length(trim(description)) > 0),
  status tip_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tip_suggestions_user_id ON tip_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_suggestions_status ON tip_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_tip_suggestions_category_id ON tip_suggestions(category_id);

-- RLS
ALTER TABLE tip_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_suggestions ENABLE ROW LEVEL SECURITY;

-- Categories are public read-only
DROP POLICY IF EXISTS tip_categories_public_read ON tip_categories;
CREATE POLICY tip_categories_public_read ON tip_categories FOR SELECT
  TO authenticated USING (true);

-- Users can view their own suggestions
DROP POLICY IF EXISTS Users_can_view_own_suggestions ON tip_suggestions;
CREATE POLICY Users_can_view_own_suggestions ON tip_suggestions FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Users can create suggestions
DROP POLICY IF EXISTS Users_can_create_suggestions ON tip_suggestions;
CREATE POLICY Users_can_create_suggestions ON tip_suggestions FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

-- Admins can view all suggestions
DROP POLICY IF EXISTS "Admins can view all suggestions" ON tip_suggestions;
CREATE POLICY "Admins can view all suggestions" ON tip_suggestions FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'moderator')
    )
  );

-- Admins can update suggestions (approve/reject)
DROP POLICY IF EXISTS "Admins can update suggestions" ON tip_suggestions;
CREATE POLICY "Admins can update suggestions" ON tip_suggestions FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'moderator')
    )
  );

-- Insert default categories (idempotent)
INSERT INTO tip_categories (name, description, icon) VALUES
  ('Budgeting', 'Tips on managing student finances and budgeting', 'bank'),
  ('Social', 'Advice on building connections and social life', 'account-group'),
  ('Academics', 'Study tips, academic resources, and learning strategies', 'school'),
  ('House Finding', 'Guidance on finding and securing student housing', 'home'),
  ('Spiritual', 'Faith-based resources and campus spiritual life', 'church')
ON CONFLICT (name) DO NOTHING;
