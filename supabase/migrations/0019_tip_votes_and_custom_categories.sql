-- =============================================================================
-- TIP VOTES AND CUSTOM CATEGORIES
-- =============================================================================

CREATE TABLE IF NOT EXISTS tip_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id UUID NOT NULL REFERENCES tip_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tip_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tip_votes_tip_id ON tip_votes(tip_id);
CREATE INDEX IF NOT EXISTS idx_tip_votes_user_id ON tip_votes(user_id);

ALTER TABLE tip_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tip_votes_public_read ON tip_votes;
CREATE POLICY tip_votes_public_read ON tip_votes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS tip_votes_insert ON tip_votes;
CREATE POLICY tip_votes_insert ON tip_votes FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS tip_votes_update ON tip_votes;
CREATE POLICY tip_votes_update ON tip_votes FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS tip_votes_delete ON tip_votes;
CREATE POLICY tip_votes_delete ON tip_votes FOR DELETE
  TO authenticated USING (user_id = auth.uid());

ALTER TABLE tip_suggestions ADD COLUMN IF NOT EXISTS upvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tip_suggestions ADD COLUMN IF NOT EXISTS downvotes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tip_suggestions ADD COLUMN IF NOT EXISTS custom_category_name TEXT;

CREATE OR REPLACE FUNCTION sync_tip_vote_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE tip_suggestions
    SET upvotes = upvotes - (CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END),
        downvotes = downvotes - (CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END)
    WHERE id = OLD.tip_id;
    RETURN OLD;
  END IF;

  IF TG_OP = 'INSERT' THEN
    UPDATE tip_suggestions
    SET upvotes = upvotes + (CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END),
        downvotes = downvotes + (CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END)
    WHERE id = NEW.tip_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    UPDATE tip_suggestions
    SET upvotes = upvotes
        - (CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END)
        + (CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END),
        downvotes = downvotes
        - (CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END)
        + (CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END)
    WHERE id = NEW.tip_id;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_tip_vote_counts ON tip_votes;
CREATE TRIGGER trg_sync_tip_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON tip_votes
FOR EACH ROW EXECUTE FUNCTION sync_tip_vote_counts();

INSERT INTO tip_categories (name, description, icon) VALUES
  ('Other', 'Suggest a new tip category', 'dots-horizontal')
ON CONFLICT (name) DO NOTHING;

GRANT SELECT ON tip_votes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON tip_votes TO authenticated;
