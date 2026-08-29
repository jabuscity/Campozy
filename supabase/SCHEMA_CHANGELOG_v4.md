| Step          | SQL Line | Error                                       | Cause                                                                 | Resolution                                                    |
| ------------- | -------: | ------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Enum creation |       20 | `ERROR: 42601: syntax error at or near "$"` | `DO $$` delimiters were corrupted to `DO $ $` during previous editing | Global replacement of `$ $` → `$$`; migration reset and rerun |

## Schema Reconciliation (2026-07-20)

Remote columns/tables added to match existing TypeScript types and frontend queries.

| Step | Table | Column/Table Added | Resolution |
|------|-------|---------------------|------------|
| 1 | universities | country_id, short_name, logo_url, description | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 2 | campuses | location_lat, location_lng, address | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 3 | profiles | university_id, campus_id, former_school_id, is_verified, trust_level, reputation_score, contribution_score, phone_number | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 4 | neighborhoods | safety_score, reputation_score | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 5 | properties | reputation_score | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 6 | alumni_profiles | current_role | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 7 | cities | iso_code | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 8 | countries | iso_code | ALTER TABLE ADD COLUMN IF NOT EXISTS |
| 9 | high_schools | table creation | CREATE TABLE IF NOT EXISTS + index |

## RLS Policy Change: community_posts Public Read (2026-08-10)

| Step | Table | Policy Change | Resolution |
|------|-------|---------------|------------|
| 1 | community_posts | `community_posts_select` changed from `author_id = auth.uid()` to `USING (true)` | Migration `0015_feed_posts_voting_comments.sql:10-12` — allows all authenticated users to read all community posts to support the public social feed |

## Validation

| Check | Status |
|--------|--------|
| Remote schema matches code types | ✅ |
| next build | ✅ |
| tsc --noEmit | ✅ |
| eslint | ✅ |
