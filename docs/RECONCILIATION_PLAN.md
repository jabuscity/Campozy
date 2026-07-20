# Reconciliation Execution Plan

**Assumption:** Zero reconciliation artifacts have been executed.  
**Constraint:** Additive-only per `token-optimization.md`. Migrations-only per `CAMPOZY_BASELINE_v4.md`.  
**Order:** Runtime → Schema → Pages → Services → RLS → Nav → Validation.

---

## Phase 1: Stabilize Current Runtime

**Goal:** Dev server stable, no runtime warnings, pages return 200.

| # | Action | File(s) | Command / Check |
|---|--------|---------|-----------------|
| 1.1 | Add memory flag | `.env.local` | `NODE_OPTIONS=--max-old-space-size=4096` |
| 1.2 | Fix broken image URLs | `app/page.tsx`, `app/signup/page.tsx` | Replace with `images.unsplash.com` or `i.pravatar.cc` |
| 1.3 | Add `sizes` to all `fill` images | All `Image` components with `fill` | Add `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"` |
| 1.4 | Verify pages | Browser / curl | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200` |
| 1.5 | Verify signup | Browser / curl | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/signup` → `200` |

**Validation:** `npm run dev` → no console errors → `/` and `/signup` return 200.

---

## Phase 2: Deduplicate & Lock Schema

**Goal:** Single source of truth, additive migrations, validated baseline.

### 2.1 Schema Source of Truth
| # | Action | File(s) | Notes |
|---|--------|---------|-------|
| 2.1.1 | Audit duplicates | `supabase/schema/04_students.sql`, `supabase/schema/06_marketplace.sql` | Compare table definitions; keep canonical in `04_students.sql` |
| 2.1.2 | Remove duplicates from `06_marketplace.sql` | `supabase/schema/06_marketplace.sql` | Delete duplicate `CREATE TABLE` blocks; keep marketplace-specific tables only |
| 2.1.3 | Audit empty schema files | `08_housing.sql`, `09_notifications.sql`, `10_messages.sql`, `11_recommendations.sql`, `15_rls.sql` | If empty and unused → delete; if used → populate |

### 2.2 Add Missing Tables (Additive Only)
Create new migration file: `supabase/migrations/0004_add_missing_core_tables.sql`

Tables to add (only if not present in `audited_schema.sql` or `schema/*.sql`):
```sql
-- reputation_events
CREATE TABLE IF NOT EXISTS reputation_events (...);

-- events
CREATE TABLE IF NOT EXISTS events (...);

-- identity_documents
CREATE TABLE IF NOT EXISTS identity_documents (...);

-- contact_methods
CREATE TABLE IF NOT EXISTS contact_methods (...);

-- verification_records
CREATE TABLE IF NOT EXISTS verification_records (...);

-- verification_evidence
CREATE TABLE IF NOT EXISTS verification_evidence (...);
```

**Constraint:** `IF NOT EXISTS` only. Never alter or drop existing tables.

### 2.3 Baseline Validation
| # | Action | Command |
|---|--------|---------|
| 2.3.1 | Run audited schema | `supabase db reset` or apply `migrations/audited_schema.sql` to fresh project |
| 2.3.2 | Run validation | `supabase migration up` then execute `migrations/validation/0001_validation_checks.sql` |
| 2.3.3 | Verify checklist | All items in `CAMPOZY_BASELINE_v4.md` Validation Requirements → checked |

**Output:** `SCHEMA_CHANGELOG_v4.md` updated, `DEPLOYMENT_LOG.md` updated.

---

## Phase 3: Add Missing Core Pages

**Goal:** All IA routes from `docs/13_INFORMATION_ARCHITECTURE.md` return 200.

| # | Route | Page Component | Data Source | Priority |
|---|-------|----------------|-------------|----------|
| 3.1 | `/universities` | `app/universities/page.tsx` | `supabase.from('universities').select('*')` | High |
| 3.2 | `/opportunities` | `app/opportunities/page.tsx` | `supabase.from('opportunities').select('*')` | High |
| 3.3 | `/campuses` | `app/campuses/page.tsx` | `supabase.from('campuses').select('*')` | High |
| 3.4 | `/neighborhoods` | `app/neighborhoods/page.tsx` | `supabase.from('neighborhoods').select('*')` | Medium |
| 3.5 | `/businesses` | `app/businesses/page.tsx` | `supabase.from('businesses').select('*')` | Medium |
| 3.6 | `/founders` | `app/founders/page.tsx` | `supabase.from('founder_profiles').select('*')` | Medium |
| 3.7 | `/alumni` | `app/alumni/page.tsx` | `supabase.from('alumni_profiles').select('*')` | Medium |
| 3.8 | `/profile` | `app/profile/page.tsx` | `supabase.from('profiles').select('*').eq('id', auth.uid())` | High |
| 3.9 | `/universities/[id]/housing` | `app/universities/[id]/housing/page.tsx` | HousingService.getPropertiesByCampus | High |
| 3.10 | `/universities/[id]/neighborhoods` | `app/universities/[id]/neighborhoods/page.tsx` | HousingService.getNeighborhoodsByCampus | Medium |
| 3.11 | `/universities/[id]/discussions` | `app/universities/[id]/discussions/page.tsx` | CommunityService.getDiscussions | Medium |
| 3.12 | `/universities/[id]/opportunities` | `app/universities/[id]/opportunities/page.tsx` | OpportunityService.getOpportunities | Medium |
| 3.13 | `/universities/[id]/reports` | `app/universities/[id]/reports/page.tsx` | campus_intelligence_reports | Medium |
| 3.14 | `/campuses/[id]/utilities` | `app/campuses/[id]/utilities/page.tsx` | property_utilities + utility_types | High |
| 3.15 | `/campuses/[id]/safety` | `app/campuses/[id]/safety/page.tsx` | property_reviews + neighborhood_reviews | High |
| 3.16 | `/campuses/[id]/hygiene` | `app/campuses/[id]/hygiene/page.tsx` | hygiene_reports + hygiene_categories | Medium |
| 3.17 | `/campuses/[id]/businesses` | `app/campuses/[id]/businesses/page.tsx` | BusinessService.getBusinesses | Medium |
| 3.18 | `/campuses/[id]/reviews` | `app/campuses/[id]/reviews/page.tsx` | property_reviews | Medium |
| 3.19 | `/campuses/[id]/discussions` | `app/campuses/[id]/discussions/page.tsx` | CommunityService.getDiscussions | Medium |
| 3.20 | `/campuses/[id]/opportunities` | `app/campuses/[id]/opportunities/page.tsx` | OpportunityService.getOpportunities | Medium |
| 3.21 | `/parents/confidence-reports` | `app/parents/confidence-reports/page.tsx` | HousingService.getSavedProperties | High |
| 3.22 | `/parents/safety` | `app/parents/safety/page.tsx` | property_reviews + neighborhood_reviews | High |
| 3.23 | `/parents/utility-reports` | `app/parents/utility-reports/page.tsx` | property_utilities | High |
| 3.24 | `/ambassadors/training` | `app/ambassadors/training/page.tsx` | ambassadors + ambassador_programs | Medium |
| 3.25 | `/ambassadors/reports` | `app/ambassadors/reports/page.tsx` | ambassador_reports | Medium |
| 3.26 | `/ambassadors/growth` | `app/ambassadors/growth/page.tsx` | ambassador_assignments | Medium |
| 3.27 | `/ambassadors/recognition` | `app/ambassadors/recognition/page.tsx` | ambassador_rewards | Medium |
| 3.28 | `/scouts/queue` | `app/scouts/queue/page.tsx` | scout_assignments | High |
| 3.29 | `/scouts/assignments` | `app/scouts/assignments/page.tsx` | scout_assignments | Medium |
| 3.30 | `/scouts/audit` | `app/scouts/audit/page.tsx` | scout_audits | Medium |

**Pattern:** Server Component → `createClient()` → fetch → render. No client-side refactors.

**Validation:** `next build` → all routes compile → no 404s.

---

## Phase 4: Add Missing Services

**Goal:** Domain services for data access, single source of truth for queries.

| # | Service | File | Responsibilities |
|---|---------|------|------------------|
| 4.1 | `student-service.ts` | `lib/services/student-service.ts` | Lifecycle, preferences, saved searches |
| 4.2 | `messaging-service.ts` | `lib/services/messaging-service.ts` | Conversations, messages |
| 4.3 | `business-service.ts` | `lib/services/business-service.ts` | Business CRUD, reviews |
| 4.4 | `parent-service.ts` | `lib/services/parent-service.ts` | Parent-student links, alerts |
| 4.5 | `lifecycle-service.ts` | `lib/services/lifecycle-service.ts` | Role transitions, alumni progression, Akwet transition profiles |
| 4.6 | `recommendation-service.ts` | `lib/services/recommendation-service.ts` | Personalized recommendations, feedback tracking |
| 4.7 | `forum-service.ts` | `lib/services/forum-service.ts` | Forum CRUD, topics, posts, subscriptions |

**Pattern:**
```ts
export async function getX(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('x').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
```

**Constraint:** No client components. Server-only. Reuse existing `createClient()`.

**Validation:** `npx tsc --noEmit` → zero errors.

---

## Phase 5: Wire RLS Policies

**Goal:** Every table has SELECT, INSERT, UPDATE, DELETE policies scoped to `auth.uid()`.

| # | Action | File | Notes |
|---|--------|------|-------|
| 5.1 | Audit current policies | `supabase/schema/15_rls.sql` | List tables without policies |
| 5.2 | Add missing policies | `supabase/schema/15_rls.sql` | One policy per table per operation |
| 5.3 | Policy template | — | `CREATE POLICY ... USING (auth.uid() = user_id)` or role-based variants |
| 5.4 | Enable RLS | All tables | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |

**Template:**
```sql
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

**Validation:** `supabase migration up` → `SELECT * FROM pg_policies` → all tables covered.

---

## Phase 6: Fix Nav & Routing

**Goal:** Nav matches `13_INFORMATION_ARCHITECTURE.md`, no dead links, 404 fallback.

| # | Action | File | Notes |
|---|--------|------|-------|
| 6.1 | Add missing nav items | `components/navbar.tsx` | `/universities`, `/campuses`, `/neighborhoods`, `/businesses`, `/founders`, `/alumni`, `/mentors`, `/parents`, `/ambassadors`, `/scouts` |
| 6.2 | Remove dead links | `components/navbar.tsx` | `/opportunities` already exists; verify it works |
| 6.3 | Add mobile nav | `components/navbar.tsx` | Mirror desktop links in mobile drawer |
| 6.4 | Add 404 fallback | `app/not-found.tsx` | Campozy-styled 404 with nav links |
| 6.5 | Wire mobile Report FAB | `components/mobile-bottom-nav.tsx` | Connect dead button to report-utility-modal |

**Nav target (from `13_INFORMATION_ARCHITECTURE.md`):**
```
Home | Housing | Campuses | Universities | Neighborhoods | Community | Opportunities | Employers | Businesses | Founders | Alumni | Mentors | Parents | Ambassadors | Scouts | Resources | About | Profile
```

**Validation:** Manual smoke test all nav links → no 404s.

---

## Phase 7: Validate End-to-End

**Goal:** Zero errors, all routes compile, schema validated.

| # | Check | Command | Expected |
|---|-------|---------|----------|
| 7.1 | Build | `npx next build` | All routes compile, no errors |
| 7.2 | Lint | `npx eslint .` | Zero errors |
| 7.3 | Typecheck | `npx tsc --noEmit` | Zero errors |
| 7.4 | Smoke test | Manual | `/`, `/signup`, `/login`, `/discovery`, `/community`, `/property/[id]` |
| 7.5 | Schema checklist | docs/09_DATABASE_SCHEMA.md | All tables present, all relationships valid |
| 7.6 | Baseline checklist | docs/CAMPOZY_BASELINE_v4.md | All validation requirements checked |

**Completion Criteria:**
- `next build` passes
- `eslint` passes
- `tsc --noEmit` passes
- All Phase 1–6 deliverables exist and are functional
- `SCHEMA_CHANGELOG_v4.md` updated
- `DEPLOYMENT_LOG.md` updated
- Migrations 0006 (forum tables) and 0007 (score triggers) applied and validated

---

## Execution Order Summary

```
Phase 1 (Runtime) 
    → Phase 2 (Schema: deduplicate → add missing tables → validate baseline)
        → Phase 3 (Pages: directory listings)
            → Phase 4 (Services: data access layer)
                → Phase 5 (RLS: policies for all tables)
                    → Phase 6 (Nav: fix links, add 404)
                        → Phase 7 (Validation: build, lint, typecheck, smoke test)
```

**Token Optimization Compliance:**
- Minimal surgical changes — no large refactors
- Preserve all existing reconciliation artifacts
- Additive only — no deletion or modification of existing tables/columns
- Every change linted and typechecked
- Incremental delivery — ship and validate per phase
