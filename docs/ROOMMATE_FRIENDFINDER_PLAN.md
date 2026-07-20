# Roommate Finder & Friendfinder Implementation Plan

## Status
Paused from Phase 2 reconciliation. To be executed before resuming Phase 2.

## Objective
Add roommate finder and friendfinder features to Campozy with a smart, seamless matching algorithm that respects all docs guardrails and does not break existing reconciliation work.

---

## Guardrails Compliance

### From `token-optimization.md`
- Minimal surgical changes — no large refactors
- Preserve all existing reconciliation artifacts (schema files, migrations, scripts)
- Additive only — no deletion or modification of existing tables/columns
- Every change must be linted and typechecked

### From `CAMPOZY_BASELINE_v4.md`
- Incremental delivery — ship core matching first, iterate on algorithm
- Never delete rows unless explicitly requested
- Migrations only in dev, not production
- ALWAYS keep repo ready to push/PR/revert
- No big-bang changes

### From `09_DATABASE_SCHEMA.md`
- Normalization first
- Relationships are first-class
- Roles are assigned, not hard-coded
- Trust must be traceable
- Everything important is auditable
- Campozy is lifecycle-aware

### From `02_PRODUCT.md`
- Housing is the entry point; student success is the destination
- Trust is central — matching must preserve trust signals
- Community intelligence is a core pillar

---

## Phase A: Schema Extension (Additive Only)

**Commitment:** Zero modifications to existing tables. New tables only.

### A1. Roommate Finder Tables

Create `supabase/schema/17_roommate_finder.sql`:

```sql
-- Roommate preferences (what a student wants in a roommate)
CREATE TABLE IF NOT EXISTS roommate_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    budget_min NUMERIC CHECK(budget_min IS NULL OR budget_min >= 0),
    budget_max NUMERIC CHECK(budget_max IS NULL OR budget_max >= 0),
    preferred_campus_id UUID REFERENCES campuses(id),
    preferred_neighborhood_ids UUID[] DEFAULT '{}',
    sleep_schedule TEXT CHECK(sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    cleanliness_level TEXT CHECK(cleanliness_level IN ('neat', 'moderate', 'relaxed')),
    social_level TEXT CHECK(social_level IN ('introvert', 'moderate', 'extrovert')),
    study_habits TEXT CHECK(study_habits IN ('silent', 'light_noise', 'flexible')),
    gender_preference TEXT CHECK(gender_preference IN ('male_only', 'female_only', 'any')),
    dietary_preferences TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    smoking_ok BOOLEAN DEFAULT FALSE,
    pets_ok BOOLEAN DEFAULT FALSE,
    max_roommates INTEGER DEFAULT 1 CHECK(max_roommates BETWEEN 1 AND 4),
    move_in_date DATE,
    lease_duration_months INTEGER CHECK(lease_duration_months IS NULL OR lease_duration_months >= 1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Roommate profile (public-facing summary)
CREATE TABLE IF NOT EXISTS roommate_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT CHECK(bio IS NULL OR length(trim(bio)) > 0),
    year_of_study INTEGER CHECK(year_of_study BETWEEN 1 AND 7),
    age INTEGER CHECK(age IS NULL OR age BETWEEN 16 AND 99),
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    budget_range NUMERIC[2] CHECK(
        budget_range IS NULL
        OR (budget_range[1] >= 0 AND budget_range[2] >= budget_range[1])
    ),
    sleep_schedule TEXT CHECK(sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    cleanliness_level TEXT CHECK(cleanliness_level IN ('neat', 'moderate', 'relaxed')),
    social_level TEXT CHECK(social_level IN ('introvert', 'moderate', 'extrovert')),
    study_habits TEXT CHECK(study_habits IN ('silent', 'light_noise', 'flexible')),
    gender_preference TEXT CHECK(gender_preference IN ('male_only', 'female_only', 'any')),
    dietary_preferences TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    smoking_ok BOOLEAN DEFAULT FALSE,
    pets_ok BOOLEAN DEFAULT FALSE,
    max_roommates INTEGER DEFAULT 1 CHECK(max_roommates BETWEEN 1 AND 4),
    move_in_date DATE,
    lease_duration_months INTEGER CHECK(lease_duration_months IS NULL OR lease_duration_months >= 1),
    is_active BOOLEAN DEFAULT TRUE,
    campozy_score INTEGER NOT NULL DEFAULT 0 CHECK(campozy_score >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Roommate matches (computed scores)
CREATE TABLE IF NOT EXISTS roommate_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL CHECK(compatibility_score BETWEEN 0 AND 100),
    match_reasons TEXT[] DEFAULT '{}',
    budget_score NUMERIC(5, 2),
    lifestyle_score NUMERIC(5, 2),
    location_score NUMERIC(5, 2),
    academic_score NUMERIC(5, 2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'viewed', 'liked', 'matched', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seeker_id, match_id)
);

-- Roommate interactions (likes, passes, conversations)
CREATE TABLE IF NOT EXISTS roommate_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('like', 'pass', 'super_like', 'message')),
    notes TEXT CHECK(notes IS NULL OR length(trim(notes)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, interaction_type)
);

-- Roommate conversations (when both like each other)
CREATE TABLE IF NOT EXISTS roommate_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    participant_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK(participant_a <> participant_b),
    UNIQUE(participant_a, participant_b)
);

-- Roommate messages
CREATE TABLE IF NOT EXISTS roommate_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES roommate_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK(length(trim(content)) > 0),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### A2. Friendfinder Tables

Create `supabase/schema/18_friendfinder.sql`:

```sql
-- Friend preferences (what a student looks for in friends)
CREATE TABLE IF NOT EXISTS friend_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    preferred_campus_id UUID REFERENCES campuses(id),
    preferred_program_ids UUID[] DEFAULT '{}',
    preferred_interest_ids UUID[] DEFAULT '{}',
    preferred_personality_types TEXT[] DEFAULT '{}',
    max_distance_km NUMERIC CHECK(max_distance_km IS NULL OR max_distance_km >= 0),
    study_together_ok BOOLEAN DEFAULT TRUE,
    event_attendance_ok BOOLEAN DEFAULT TRUE,
    gaming_ok BOOLEAN DEFAULT TRUE,
    fitness_ok BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Friend profile (public-facing)
CREATE TABLE IF NOT EXISTS friend_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    bio TEXT CHECK(bio IS NULL OR length(trim(bio)) > 0),
    year_of_study INTEGER CHECK(year_of_study BETWEEN 1 AND 7),
    university_id UUID REFERENCES universities(id),
    campus_id UUID REFERENCES campuses(id),
    personality_type TEXT CHECK(personality_type IN ('introvert', 'extrovert', 'ambivert')),
    interests TEXT[] DEFAULT '{}',
    hobbies TEXT[] DEFAULT '{}',
    study_habits TEXT CHECK(study_habits IN ('silent', 'light_noise', 'flexible')),
    availability_windows TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    campozy_score INTEGER NOT NULL DEFAULT 0 CHECK(campozy_score >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- Friend matches
CREATE TABLE IF NOT EXISTS friend_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    compatibility_score NUMERIC(5, 2) NOT NULL CHECK(compatibility_score BETWEEN 0 AND 100),
    match_reasons TEXT[] DEFAULT '{}',
    academic_score NUMERIC(5, 2),
    interest_score NUMERIC(5, 2),
    social_score NUMERIC(5, 2),
    proximity_score NUMERIC(5, 2),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'viewed', 'suggested', 'connected', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seeker_id, match_id)
);

-- Friend connections (mutual)
CREATE TABLE IF NOT EXISTS friend_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL DEFAULT 'friend' CHECK(connection_type IN ('friend', 'study_buddy', 'event_buddy')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK(user_a <> user_b),
    UNIQUE(user_a, user_b)
);

-- Friend interactions
CREATE TABLE IF NOT EXISTS friend_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK(interaction_type IN ('viewed', 'liked', 'passed', 'connected')),
    notes TEXT CHECK(notes IS NULL OR length(trim(notes)) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, interaction_type)
);
```

### A3. RLS Policies

Add to `supabase/schema/15_rls.sql`:

```sql
-- roommate_preferences
ALTER TABLE roommate_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_preferences_select ON roommate_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_preferences_insert ON roommate_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_preferences_update ON roommate_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_preferences_delete ON roommate_preferences FOR DELETE TO authenticated USING (true);

-- roommate_profiles
ALTER TABLE roommate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_profiles_select ON roommate_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_profiles_insert ON roommate_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_profiles_update ON roommate_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_profiles_delete ON roommate_profiles FOR DELETE TO authenticated USING (true);

-- roommate_matches
ALTER TABLE roommate_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_matches_select ON roommate_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_matches_insert ON roommate_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_matches_update ON roommate_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_matches_delete ON roommate_matches FOR DELETE TO authenticated USING (true);

-- roommate_interactions
ALTER TABLE roommate_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_interactions_select ON roommate_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_interactions_insert ON roommate_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_interactions_update ON roommate_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_interactions_delete ON roommate_interactions FOR DELETE TO authenticated USING (true);

-- roommate_conversations
ALTER TABLE roommate_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_conversations_select ON roommate_conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_conversations_insert ON roommate_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_conversations_update ON roommate_conversations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_conversations_delete ON roommate_conversations FOR DELETE TO authenticated USING (true);

-- roommate_messages
ALTER TABLE roommate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY roommate_messages_select ON roommate_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY roommate_messages_insert ON roommate_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY roommate_messages_update ON roommate_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY roommate_messages_delete ON roommate_messages FOR DELETE TO authenticated USING (true);

-- friend_preferences
ALTER TABLE friend_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_preferences_select ON friend_preferences FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_preferences_insert ON friend_preferences FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_preferences_update ON friend_preferences FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_preferences_delete ON friend_preferences FOR DELETE TO authenticated USING (true);

-- friend_profiles
ALTER TABLE friend_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_profiles_select ON friend_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_profiles_insert ON friend_profiles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_profiles_update ON friend_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_profiles_delete ON friend_profiles FOR DELETE TO authenticated USING (true);

-- friend_matches
ALTER TABLE friend_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_matches_select ON friend_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_matches_insert ON friend_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_matches_update ON friend_matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_matches_delete ON friend_matches FOR DELETE TO authenticated USING (true);

-- friend_connections
ALTER TABLE friend_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_connections_select ON friend_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_connections_insert ON friend_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_connections_update ON friend_connections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_connections_delete ON friend_connections FOR DELETE TO authenticated USING (true);

-- friend_interactions
ALTER TABLE friend_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY friend_interactions_select ON friend_interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY friend_interactions_insert ON friend_interactions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY friend_interactions_update ON friend_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY friend_interactions_delete ON friend_interactions FOR DELETE TO authenticated USING (true);
```

### A4. Migration

Create `supabase/migrations/0003_add_matching_features.sql` wrapping all new tables + RLS in a transaction.

### A5. Update create_all.sql and clear_database.sql

- Append new table definitions to `supabase/scripts/create_all.sql`
- Append new DROP statements to `supabase/scripts/clear_database.sql`

---

## Phase B: Service Layer

### B1. Create `services/matching-service.ts`

**Core responsibilities:**
- `computeRoommateMatches(studentId)` — returns ranked matches with scores
- `computeFriendMatches(studentId)` — returns ranked friend suggestions
- `recordInteraction(userId, targetId, type)` — logs likes/passes
- `getConversation(userA, userB)` — roommate messaging
- `getMatches(studentId)` — paginated match list

**Algorithm design principles:**
- Weighted scoring: budget (25%), lifestyle (25%), location (20%), academic (15%), social (15%)
- Hard filters applied first (budget range, gender preference, smoking/pets)
- Soft scoring for nuanced preferences (interests, sleep schedule, study habits)
- Decay function: older matches rank lower unless refreshed
- Anti-spam: limit super-likes per day, block repeated passes
- Privacy-first: only show matches who also have active profiles

### B2. Create `services/matching-algorithm.ts`

**Pure functions** (no Supabase dependency, easily testable):

```typescript
export function computeRoommateCompatibility(
  seeker: RoommateProfile & RoommatePreferences,
  candidate: RoommateProfile & RoommatePreferences
): MatchResult

export function computeFriendCompatibility(
  seeker: FriendProfile & FriendPreferences,
  candidate: FriendProfile & FriendPreferences
): MatchResult
```

**Scoring breakdown:**
- Budget overlap: 0–25 points
- Lifestyle alignment (cleanliness, sleep, social): 0–25 points
- Location proximity (campus/neighborhood): 0–20 points
- Academic overlap (year, program): 0–15 points
- Interest/hobby overlap: 0–15 points

**Output:** `{ score: number, reasons: string[], subScores: object }`

### B3. Update `services/identity-service.ts`

Add methods:
- `getRoommateProfile(studentId)`
- `getFriendProfile(studentId)`
- `createRoommateProfile(data)`
- `createFriendProfile(data)`

---

## Phase C: UI/UX

### C1. Pages

| Route | Purpose |
|-------|---------|
| `/roommates` | Main roommate finder dashboard |
| `/roommates/preferences` | Set/edit roommate preferences |
| `/roommates/matches` | View matches + conversations |
| `/roommates/conversations/[id]` | Chat with matched roommate |
| `/friends` | Main friendfinder dashboard |
| `/friends/preferences` | Set/edit friend preferences |
| `/friends/suggestions` | View friend suggestions |
| `/friends/connections` | View existing friend connections |

### C2. Components

- `components/roommate/roommate-card.tsx` — swipeable card with match score badge
- `components/roommate/match-details.tsx` — detailed compatibility breakdown
- `components/roommate/preference-form.tsx` — multi-step preference wizard
- `components/friend/friend-card.tsx` — friend suggestion card
- `components/friend/connection-request.tsx` — send/accept connection
- `components/matching/match-badge.tsx` — shared component for match score display

### C3. Design Principles (from docs)

- **Trust-first:** Show verification badges, campozy_score, mutual connections
- **Lifecycle-aware:** Match students in similar academic stages
- **Transparent:** Show *why* someone was matched (e.g., "Similar sleep schedule", "Same campus")
- **Privacy controls:** Users can hide profiles, adjust visibility
- **Graceful:** Algorithm does the work; user sees results, not complexity

---

## Phase D: Algorithm Deep-Dive

### D1. Data Sources

| Source | Data Point | Weight |
|--------|-----------|--------|
| `profiles` | university, campus, phone | Used for identity |
| `students` | enrollment_year, campus, former_school | Academic alignment |
| `roommate_preferences` | budget, sleep, cleanliness, social, study | Core matching |
| `roommate_profiles` | public summary fields | Display + scoring |
| `trust-service` | campozy_score, reputation | Trust signal |
| `neighborhoods` | location data | Proximity scoring |

### D2. Matching Flow

```
User completes preferences
    ↓
System fetches all active candidate profiles
    ↓
Apply HARD FILTERS (budget, gender, smoking, pets)
    ↓
Compute WEIGHTED SCORES for remaining candidates
    ↓
Store top N matches in roommate_matches/friend_matches
    ↓
User views matches (paginated, lazy-loaded)
    ↓
User likes/passes → record interaction
    ↓
Mutual like → create conversation/connection
```

### D3. Smart Features

- **Cold start:** For new users with no preferences, use profile data (campus, year) + popularity signals
- **Dynamic re-ranking:** Recompute matches weekly or when preferences change
- **Anti-fatigue:** Don't show same users repeatedly; introduce variety
- **Feedback loop:** Track which matches lead to conversations; optimize weights
- **Blocking/reporting:** Integrate with existing trust/moderation system
- **Privacy:** Users can exclude themselves from matching; data never shared without consent

### D4. Algorithm Testing

- Unit tests for `matching-algorithm.ts` pure functions
- Integration tests for `matching-service.ts` with test database
- Manual QA: create 10 test profiles, verify match quality

---

## Phase E: Integration Points

### E1. Existing Systems

| System | Integration Point |
|--------|------------------|
| Auth (`auth-actions.ts`) | On signup, prompt to complete matching preferences |
| Trust service | Use `campozy_score` as trust signal in matches |
| Housing service | Link roommate matches to neighborhood/property data |
| Community service | Shared discussions about roommates/friends |
| Notifications | Match alerts, new messages, connection requests |

### E2. New Triggers

- Auto-create `roommate_profiles` / `friend_profiles` when student signs up
- Auto-recompute matches when preferences change
- Notify users of new matches daily (throttled)

---

## Phase F: Migration & Rollback

### F1. Migration Strategy

1. Create `supabase/migrations/0003_add_matching_features.sql`
2. Run in dev only first
3. Validate with `supabase/scripts/validation/0001_validation_checks.sql`
4. Update `create_all.sql` and `clear_database.sql`
5. Test locally with `npx next dev`

### F2. Rollback Plan

- All new tables are additive — dropping migration reverts cleanly
- No modifications to existing tables/columns
- Feature flags in code for gradual rollout
- Can disable matching pages without affecting core app

---

## Phase G: Execution Order

```
Week 1:
  Day 1-2: Schema (Phase A) + migration
  Day 3-4: Algorithm core (Phase B.2) + unit tests
  Day 5: Service layer (Phase B.1) + integration tests

Week 2:
  Day 1-3: Roommate UI (Phase C.1-2)
  Day 4-5: Friendfinder UI (Phase C.1-2)
  Day 5: Integration points (Phase E)

Week 3:
  Day 1-2: Polish, accessibility, responsive
  Day 3: Manual QA + bug fixes
  Day 4: Update docs, seed data
  Day 5: Code review, lint, typecheck, ready to merge
```

---

## Success Criteria

- [ ] All 13 new tables created with proper indexes and RLS
- [ ] Matching algorithm passes unit tests with 10+ test profiles
- [ ] `/roommates` and `/friends` pages render without errors
- [ ] Users can set preferences, view matches, like/pass, and message
- [ ] Zero breaking changes to existing Phase 2 reconciliation artifacts
- [ ] ESLint + TypeScript + Next.js build all pass
- [ ] Algorithm transparency: users see match reasons, not just scores

---

## Return to Reconciliation

After matching features are merged:
1. Resume Phase 2 from where we paused
2. All matching tables are now part of the canonical schema
3. `create_all.sql` and `clear_database.sql` already updated
4. No reconciliation work was broken or deleted
