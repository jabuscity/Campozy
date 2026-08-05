# CAMPOZY WORK PLAN — STUDENT-CENTRIC REBUILD

## Status
Execution blueprint for the student-only, highly sticky Campozy.

## Objective
Rebuild Campozy as a **Student Confidence Engine** — no landlord/owner modules, no booking flows, no owner dashboards. Every screen, flow, and data point must answer: *"Does this help a student make a better decision?"*

---

## PHASE 0: CURRENT STATE AUDIT

### What Already Exists (Reusable)
| Component | Status | Notes |
|---|---|---|
| Property discovery UI | Built | `/property/[id]`, `/discovery`, `/search` |
| Property detail with Campozy Score | Built | Score dimensions, utility matrix |
| Community discussions | Built | `/community`, `/forums` |
| Roommate Finder | Schema + UI | Full matching schema, preferences, conversations |
| Friendfinder | Schema + UI | Full matching schema, preferences, connections |
| University/Campus pages | Built | `/universities/[id]`, `/campuses/[id]` |
| Neighborhood pages | Built | `/neighborhoods/[id]` |
| Opportunities | Routes exist | `/opportunities`, `/opportunities/[id]` |
| Auth (student + owner) | Built | `/signup`, `/login` |
| Profile | Built | `/profile`, `/profile/student` |
| Search | Built | `/search` |
| Types | Comprehensive | 1570 lines, all domains |

### What Must Be Removed or Refactored
| Item | Action | Reason |
|---|---|---|
| Owner role in auth | Remove | No landlord functions |
| `owners` table | Remove | No owner identity needed |
| `property_inquiries` table | Remove | Student→owner messaging |
| `viewing_requests` table | Remove | Scheduling viewings with owners |
| `property_claims` table | Deprecate | Owner claim flow |
| `/parents/*` routes | Defer | Parent confidence layer is Phase 3 |
| `/employers/*` routes | Defer | Employer dashboards not needed |
| `/businesses/*` routes | Defer | Business owner dashboards not needed |
| `/scouts/*` routes | Refactor | Scouts become verified student contributors |
| `/founders/*` routes | Refactor | Founders become student leaders |
| `/ambassadors/*` routes | Refactor | Ambassadors become student leaders |
| `/alumni/*` routes | Refactor | Alumni becomes Phase 3 |

### What Must Be Built
| Item | Priority | Notes |
|---|---|---|
| Personalized Home/Feed | P0 | Live utility updates, trending discussions, opportunity matches |
| Utility reporting (student-facing) | P0 | One-tap reports from current location |
| Community Q&A | P0 | Ask/answer about housing, utilities, campus life |
| Contribution & Reputation UI | P0 | Badges, points, contribution history |
| Opportunity matching | P1 | Profile-based matching |
| Notifications system | P1 | Utility alerts, match alerts, opportunity alerts |
| Search overhaul | P1 | Single search reaching all student-relevant content |
| Progressive onboarding | P0 | No interrogation — progressive profiling |

---

## PHASE 1: DATA MODEL — STUDENT-ONLY

### 1.1 Schema Changes

#### Remove
```sql
-- Drop owner-related tables
DROP TABLE IF EXISTS owners CASCADE;
DROP TABLE IF EXISTS property_inquiries CASCADE;
DROP TABLE IF EXISTS viewing_requests CASCADE;
DROP TABLE IF EXISTS property_claims CASCADE;

-- Remove owner role from enum (if exists as separate enum)
-- Update auth-actions.ts to remove 'owner' from ALLOWED_SIGNUP_ROLES
```

#### Modify `properties` table
```sql
-- Remove owner_id, make properties community-curated
ALTER TABLE properties DROP COLUMN IF EXISTS owner_id;

-- Add curated_by field (admin/scout who verified)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS curated_by UUID REFERENCES profiles(id);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS curation_notes TEXT;

-- Add data_source to track where property info comes from
ALTER TABLE properties ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'scout_verified' 
  CHECK (data_source IN ('scout_verified', 'community_verified', 'campozy_verified'));
```

#### Modify `profiles` table
```sql
-- Remove owner-specific fields if any
-- Ensure campus_id and university_id are the primary student identifiers

-- Add student-specific fields to profiles (move from students table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS year_of_study INTEGER 
  CHECK (year_of_study IS NULL OR year_of_study BETWEEN 1 AND 7);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES academic_programs(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enrollment_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expected_graduation_year INTEGER;
```

#### Simplify `students` table
```sql
-- Merge student-specific fields into profiles
-- students table becomes a view or is removed
-- Keep only lifecycle-specific data if needed
ALTER TABLE students ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT DEFAULT 'student'
  CHECK (lifecycle_stage IN ('prospective', 'student', 'contributor', 'campus_founder', 
    'country_founder', 'global_pioneer', 'campus_expert', 'ambassador', 'scout', 
    'graduate', 'alumni', 'mentor', 'employer'));
```

#### Refactor Scout system
```sql
-- Scouts become verified student contributors
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS is_student_verified BOOLEAN DEFAULT TRUE;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS certification_level TEXT DEFAULT 'certified'
  CHECK (certification_level IN ('trainee', 'certified', 'senior', 'lead'));

-- Scout assignments become verification tasks
ALTER TABLE scout_assignments ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'property_verification'
  CHECK (task_type IN ('property_verification', 'utility_audit', 'neighborhood_audit', 'hygiene_audit'));
```

#### Refactor Founder system
```sql
-- Founders become student leaders, not external founders
ALTER TABLE founder_cohorts ADD COLUMN IF NOT EXISTS requires_contribution_score INTEGER DEFAULT 100;
ALTER TABLE founder_cohorts ADD COLUMN IF NOT EXISTS requires_verification_count INTEGER DEFAULT 10;

-- Founder qualification becomes contribution-based
ALTER TABLE founder_qualification_events ADD COLUMN IF NOT EXISTS auto_qualified BOOLEAN DEFAULT FALSE;
```

#### Add Utility Reports table (student-submitted)
```sql
CREATE TABLE IF NOT EXISTS utility_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
    utility_type_id UUID REFERENCES utilities(id),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'resolved', 'dismissed')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL CHECK(length(trim(title)) > 0),
    description TEXT NOT NULL CHECK(length(trim(description)) > 0),
    hours_available_per_day NUMERIC CHECK(hours_available_per_day IS NULL OR hours_available_per_day BETWEEN 0 AND 24),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utility_reports_property ON utility_reports(property_id);
CREATE INDEX IF NOT EXISTS idx_utility_reports_campus ON utility_reports(campus_id);
CREATE INDEX IF NOT EXISTS idx_utility_reports_user ON utility_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_utility_reports_created ON utility_reports(created_at DESC);
```

#### Add Student Activity / Contribution tracking
```sql
CREATE TABLE IF NOT EXISTS contribution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK(event_type IN ('utility_report', 'review', 'discussion', 'answer', 'tip', 'warning', 'verification')),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contribution_events_user ON contribution_events(user_id);
CREATE INDEX IF NOT EXISTS idx_contribution_events_type ON contribution_events(event_type);
CREATE INDEX IF NOT EXISTS idx_contribution_events_created ON contribution_events(created_at DESC);
```

#### Add Notifications table (student-specific)
```sql
-- Ensure notifications table exists with student-relevant types
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('utility_alert', 'match', 'opportunity', 'discussion_reply', 'system', 'reputation')),
    title TEXT NOT NULL CHECK(length(trim(title)) > 0),
    content TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
```

### 1.2 RLS Policies (Student-Only)

```sql
-- Students can read all public property data
CREATE POLICY "Students can view verified properties" ON properties
  FOR SELECT USING (is_active = TRUE AND verification_level IN ('community_verified', 'scout_verified', 'campozy_verified'));

-- Students can submit utility reports
CREATE POLICY "Students can create utility reports" ON utility_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can update their own utility reports
CREATE POLICY "Students can update own utility reports" ON utility_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Students can view discussions
CREATE POLICY "Students can view discussions" ON discussions
  FOR SELECT USING (TRUE);

-- Students can create discussions
CREATE POLICY "Students can create discussions" ON discussions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Students can update own discussions
CREATE POLICY "Students can update own discussions" ON discussions
  FOR UPDATE USING (auth.uid() = user_id);

-- Students can create replies
CREATE POLICY "Students can create replies" ON discussion_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## PHASE 2: UI SCREENS & USER FLOWS

### 2.1 Information Architecture (Student-Only)

```
Home / Feed
├── Utility Alerts (personalized by campus/neighborhood)
├── Trending Discussions
├── Opportunities for You
├── New Matches (Roommate/Friend)
└── Contribution Reminders

Housing
├── Browse Properties
│   ├── Map View
│   ├── List View
│   ├── Filters (budget, utilities, campus proximity)
│   └── Sort (Campozy Score, reviews, distance)
├── Compare Properties (side-by-side)
├── Saved Properties
└── Property Detail
    ├── Campozy Score + Breakdown
    ├── Utility History Graph
    ├── Student Reviews
    ├── Community Discussion
    ├── Report Utility Issue
    └── Similar Properties

Community
├── Discussions
│   ├── By Campus
│   ├── By Neighborhood
│   ├── By Topic
│   └── Trending
├── Q&A
├── Tips & Warnings
└── My Contributions

Matching
├── Roommate Finder
│   ├── Preference Wizard
│   ├── Browse Matches
│   ├── Conversations
│   └── Saved Matches
└── Friendfinder
    ├── Browse Suggestions
    ├── Connections
    └── Study Buddies

Opportunities
├── For You (personalized)
├── Internships
├── Scholarships
├── Mentorship
└── Applications Tracker

Profile
├── My Info (student, campus, program)
├── My Contributions
├── My Reputation
├── My Saved Items
├── My Matches
└── Settings

Search (Global Modal)
├── Properties
├── Neighborhoods
├── Campuses
├── Discussions
├── Opportunities
├── Roommates
└── Friends
```

### 2.2 Core User Flows

#### Flow 1: New Student Onboarding (Progressive)
```
Landing Page
    ↓
"Find Housing You Can Trust" CTA
    ↓
Signup (email + password only)
    ↓
Step 1: "What campus are you at?" (select from list)
    ↓
Step 2: "What program/year?" (optional)
    ↓
Step 3: "Any housing preferences?" (budget, amenities — optional)
    ↓
HOME FEED (immediate value — no more steps)
```

**Key principle:** Student gets value BEFORE completing profile. Feed shows campus-specific utility alerts, trending discussions, and top properties.

#### Flow 2: Housing Search → Decision
```
Home Feed or Search
    ↓
Search "hostels near Strathmore"
    ↓
Results: Properties with Campozy Scores, utility status, distance
    ↓
Filter by: budget, water status, WiFi, safety
    ↓
Property Detail
    ├── Campozy Score Breakdown (explainable)
    ├── Utility Reliability Graph (water/electricity/WiFi over 30 days)
    ├── Student Reviews (verified stays only)
    ├── Community Discussion ("Is water reliable here?")
    └── "Report Utility Issue" button
    ↓
Compare (add 2-3 properties)
    ↓
Decision: Student saves or shares
```

#### Flow 3: Utility Reporting (Sticky Loop)
```
Student experiences utility issue at hostel
    ↓
Notification: "Report water status at your hostel?"
    ↓
One-tap report: "Water OFF" + optional comment
    ↓
Report appears in campus feed
    ↓
Other students see: "Water reported OFF at XYZ (5 mins ago)"
    ↓
Reputation points awarded to reporter
    ↓
Student returns to check if status changed
```

#### Flow 4: Community Q&A
```
Student has question: "Is the WiFi at Westlands Residency actually good?"
    ↓
Search or browse discussions
    ↓
Find existing thread or ask new question
    ↓
Get answers from verified residents + live utility data
    ↓
Upvote helpful answers
    ↓
Follow thread for updates
```

#### Flow 5: Roommate Matching
```
Student: "I need a roommate"
    ↓
Preference Wizard (5 questions, 2 minutes)
    ↓
Matches ranked by compatibility score
    ↓
Browse matches → Like/Pass
    ↓
Mutual like → Conversation opens
    ↓
Chat → Connect → Plan move-in
```

#### Flow 6: Opportunity Discovery
```
Student profile complete (program, year, interests)
    ↓
"For You" tab shows:
    ├── Internships matching program
    ├── Scholarships matching year
    ├── Competitions matching interests
    └── Mentorship connections
    ↓
Save or Apply
    ↓
Application tracked in profile
```

### 2.3 Key Screens (Detailed)

#### Screen 1: Home Feed (New — Replaces Generic Landing)
**Purpose:** Immediate value on every visit.

**Layout:**
```
┌─────────────────────────────────────┐
│  Good morning, Wanjiku              │
│  Strathmore University • Year 2     │
├─────────────────────────────────────┤
│  🔴 Utility Alert                   │
│  Water reported OFF at Madaraka     │
│  Estate (10 mins ago)               │
├─────────────────────────────────────┤
│  Trending at your campus            │
│  ┌──────────┬──────────┬──────────┐ │
│  │ Discussion│ Review   │ Tip      │ │
│  │ "Best    │ "Westlands│ "Avoid  │ │
│  │ study    │  Residency"│ Area X" │ │
│  │ spots?"  │ 4.8★      │ after 9PM│ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│  Opportunities for You              │
│  ┌─────────────────────────────────┐│
│  │ Software Internship at Safaricom││
│  │ CS • Year 2+ • Deadline: Aug 15 ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  New Roommate Matches (3)           │
│  ┌──────────┬──────────┬──────────┐ │
│  │ 92% Match │ 87% Match │ 85% Match│ │
│  │ James K.  │ Mary N.  │ David O. │ │
│  └──────────┴──────────┴──────────┘ │
└─────────────────────────────────────┘
```

#### Screen 2: Property Detail (Refactor — Remove Owner Elements)
**Current:** Has owner_id, inquiries, viewing requests
**Target:**
```
┌─────────────────────────────────────┐
│  ← Back to Results    🔖 Share      │
├─────────────────────────────────────┤
│  [Image Gallery]                    │
│  The Westlands Residency            │
│  Madaraka Estate • 0.8km from campus│
│  ★ 4.9 (1,240 reviews)  ✅ Verified │
├─────────────────────────────────────┤
│  Campozy Score: 92/100 🟢           │
│  ┌─────────────────────────────────┐│
│  │ Water: 95% │ Power: 98% │ WiFi: ││
│  │ Hygiene: 90│ Safety: 94 │ Mgmt: ││
│  │ Value: 88  │              │      ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Utility History (30 days)          │
│  [Graph: water reliability]         │
│  [Graph: electricity uptime]        │
│  [Graph: WiFi speed]                │
├─────────────────────────────────────┤
│  Student Reviews (Verified Stays)   │
│  ┌─────────────────────────────────┐│
│  │ ★★★★★ "Great WiFi, responsive  ││
│  │ management..." — James K.       ││
│  │ Stayed 8 months                 ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  Community Discussion               │
│  Q: "Is water reliable here?"       │
│  A: "Yes, borehole active 24/7"     │
│  [Ask a Question]                   │
├─────────────────────────────────────┤
│  [Report Utility Issue]             │
└─────────────────────────────────────┘
```

**Remove:**
- "Contact Owner" button
- "Schedule Viewing" button
- Owner profile section
- Property inquiry form

#### Screen 3: Utility Report (New — One-Tap)
```
┌─────────────────────────────────────┐
│  Report Utility Status              │
│  The Westlands Residency            │
├─────────────────────────────────────┤
│  What's the status?                 │
│  ┌──────────┬──────────┬──────────┐ │
│  │  ON      │  OFF     │  LIMITED │ │
│  │ 💧       │ 💧       │ 💧       │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│  How many hours per day? (optional) │
│  [____ hours]                       │
├─────────────────────────────────────┤
│  Add a comment (optional)           │
│  [________________________________] │
│  [________________________________] │
├─────────────────────────────────────┤
│  [Submit Report]                    │
└─────────────────────────────────────┘
```

#### Screen 4: Community Discussion (Refactor)
```
┌─────────────────────────────────────┐
│  Campus Discussions                 │
│  Strathmore University              │
├─────────────────────────────────────┤
│  [Ask a Question]                   │
├─────────────────────────────────────┤
│  🔥 Trending                        │
│  ┌─────────────────────────────────┐│
│  │ "Best quiet study spots?"       ││
│  │ 45 replies • 120 views          ││
│  │ Posted 2h ago by James K.       ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ "Water update: Madaraka"        ││
│  │ 23 replies • 89 views           ││
│  │ Posted 5h ago by Mary N.        ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  [Load more...]                     │
└─────────────────────────────────────┘
```

#### Screen 5: Roommate Finder (Refactor)
```
┌─────────────────────────────────────┐
│  Roommate Finder                    │
│  Find someone you'll actually like  │
├─────────────────────────────────────┤
│  Your Match Score: 87%              │
│  ┌─────────────────────────────────┐│
│  │ Budget: 92% │ Lifestyle: 85%    ││
│  │ Location: 90%│ Academic: 80%    ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  New Matches                        │
│  ┌──────────┬──────────┬──────────┐ │
│  │ James K. │ Mary N. │ David O. │ │
│  │ 92%      │ 87%     │ 85%      │ │
│  │ CS Year2 │ Med Yr3 │ Eng Yr1  │ │
│  │ [Like]   │ [Like]  │ [Pass]   │ │
│  └──────────┴──────────┴──────────┘ │
├─────────────────────────────────────┤
│  Your Preferences                   │
│  [Edit Preferences]                 │
└─────────────────────────────────────┘
```

#### Screen 6: Profile (Student-Centric)
```
┌─────────────────────────────────────┐
│  My Profile                         │
├─────────────────────────────────────┤
│  Wanjiku M.                         │
│  Strathmore University              │
│  Computer Science • Year 2          │
│  🏆 Top Contributor • 1,240 pts    │
├─────────────────────────────────────┤
│  My Activity                        │
│  ┌─────────────────────────────────┐│
│  │ 42 Utility Reports              ││
│  │ 18 Reviews                       ││
│  │ 156 Discussion Replies           ││
│  │ 12 Properties Saved              ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  My Matches                         │
│  ┌─────────────────────────────────┐│
│  │ 3 new roommate matches           ││
│  │ 2 pending friend requests        ││
│  └─────────────────────────────────┘│
├─────────────────────────────────────┤
│  My Opportunities                   │
│  ┌─────────────────────────────────┐│
│  │ 2 applications in progress       ││
│  │ 1 new scholarship match          ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## PHASE 3: ROUTE RESTRUCTURING

### 3.1 Current Routes → Target Routes

| Current Route | Action | Target Route | Reason |
|---|---|---|---|
| `/` | Keep | `/` | Home feed |
| `/property/[id]` | Refactor | `/property/[id]` | Remove owner elements |
| `/discovery` | Refactor | `/housing` | Clearer student language |
| `/search` | Keep | `/search` | Global search modal |
| `/community` | Refactor | `/community` | Student-focused |
| `/forums` | Defer | `/community/forums` | Merge into community |
| `/roommates` | Keep | `/roommates` | Matching |
| `/friends` | Refactor | `/connections` | Broader than just friends |
| `/opportunities` | Keep | `/opportunities` | Student opportunities |
| `/universities` | Keep | `/universities` | Reference |
| `/campuses` | Keep | `/campuses` | Reference |
| `/neighborhoods` | Keep | `/neighborhoods` | Reference |
| `/profile` | Refactor | `/profile` | Student-centric |
| `/profile/student` | Merge | `/profile` | Single profile page |
| `/signup` | Refactor | `/signup` | Student-only |
| `/login` | Keep | `/login` | Keep |
| `/about` | Keep | `/about` | Keep |
| `/parents/*` | Remove | — | Phase 3 |
| `/employers/*` | Remove | — | Not needed |
| `/businesses/*` | Remove | — | Phase 3 |
| `/scouts/*` | Refactor | `/contributors/scouts` | Student scouts |
| `/founders/*` | Refactor | `/contributors/founders` | Student leaders |
| `/ambassadors/*` | Refactor | `/contributors/ambassadors` | Student leaders |
| `/alumni/*` | Defer | `/alumni` | Phase 3 |
| `/mentors` | Defer | `/mentors` | Phase 3 |
| `/recommendations` | Merge | `/` (feed) | Integrated into home |
| `/report` | Refactor | `/report` | Utility/community reports |
| `/resources` | Keep | `/resources` | Student resources |
| `/roadmap` | Keep | `/roadmap` | Product roadmap |

### 3.2 New Routes to Add

| New Route | Purpose |
|---|---|
| `/feed` | Personalized home feed (merge with `/`) |
| `/housing/compare` | Side-by-side property comparison |
| `/community/ask` | Ask a question |
| `/opportunities/applications` | Track applications |
| `/connections` | Friendfinder + roommate matches |
| `/contributors` | Scouts, founders, ambassadors hub |
| `/notifications` | Notification center |
| `/settings` | App preferences |

### 3.3 Route Map (Final Student-Centric)

```
/                              → Home Feed
/login                         → Login
/signup                        → Student Signup (progressive)
/profile                       → Student Profile
/settings                      → App Settings
/notifications                 → Notification Center

/housing                       → Browse Properties
/housing/compare               → Compare Properties
/property/[id]                 → Property Detail
/search                        → Global Search Modal

/neighborhoods                 → Neighborhood Directory
/neighborhoods/[id]            → Neighborhood Detail
/campuses                      → Campus Directory
/campuses/[id]                 → Campus Detail
/universities                  → University Directory
/universities/[id]             → University Detail

/community                     → Community Hub
/community/discussions         → Discussions
/community/qa                  → Q&A
/community/tips                → Tips & Warnings
/community/ask                 → Ask Question

/opportunities                 → Opportunities Hub
/opportunities/applications    → My Applications
/opportunities/[id]            → Opportunity Detail

/roommates                     → Roommate Finder
/roommates/preferences         → Preference Wizard
/roommates/matches             → My Matches
/roommates/conversations/[id]  → Chat

/connections                   → Friendfinder
/connections/suggestions       → Suggestions
/connections/buddies           → Study/Event Buddies

/contributors                  → Contributors Hub
/contributors/scouts           → Scout Network
/contributors/founders         → Founders
/contributors/ambassadors      → Ambassadors

/resources                     → Student Resources
/about                         → About Campozy
/roadmap                       → Product Roadmap
/report                         → Report Issue
```

---

## PHASE 4: REVISED PRODUCT ROADMAP

### Phase 1: Foundation (Weeks 1-4) — "The Trust Core"
**Goal:** Student can search, discover, and trust properties.

**Deliverables:**
1. **Auth & Onboarding**
   - Student-only signup (email + password)
   - Progressive onboarding (campus → program → preferences)
   - No owner role anywhere

2. **Property Discovery**
   - Browse properties with Campozy Scores
   - Filter by budget, utilities, campus proximity
   - Property detail with trust signals
   - Property comparison (2-3 side-by-side)

3. **Utility Intelligence**
   - Student utility reporting (one-tap)
   - Utility history graphs on property pages
   - Campus-level utility feed on home

4. **Community Q&A**
   - Ask/answer questions about housing
   - Campus-specific discussions
   - Tips & warnings

5. **Basic Search**
   - Search properties, campuses, neighborhoods
   - Global search modal

**Success Metrics:**
- 100 properties with verified data
- 50+ student utility reports
- 20+ campus discussions
- 10+ student reviews

### Phase 2: Engagement (Weeks 5-8) — "The Social Loops"
**Goal:** Student contributes, matches, and returns daily.

**Deliverables:**
1. **Contribution & Reputation**
   - Contribution points system
   - Badges (Verified Reviewer, Utility Reporter, Campus Expert)
   - Contribution history on profile
   - Leaderboards (campus-level)

2. **Roommate Finder**
   - Preference wizard (5 questions, 2 min)
   - Match ranking algorithm
   - Like/pass/message flow
   - Conversations

3. **Friendfinder**
   - Preference settings
   - Friend suggestions
   - Study buddy matching
   - Event buddy matching

4. **Notifications**
   - Utility alerts
   - Match alerts
   - Discussion replies
   - Opportunity matches

5. **Home Feed (Personalized)**
   - Utility alerts for followed neighborhoods
   - Trending discussions at campus
   - New matches
   - Opportunities for you

**Success Metrics:**
- 30% of students complete roommate preferences
- 50+ matches made
- 100+ conversations started
- 20% daily active rate

### Phase 3: Retention (Weeks 9-12) — "The Lifecycle"
**Goal:** Student stays from arrival to graduation and beyond.

**Deliverables:**
1. **Opportunity Matching**
   - Profile-based internship matching
   - Scholarship matching
   - Mentorship connections
   - Application tracking

2. **Advanced Reputation**
   - Campus Expert status
   - Contributor tiers
   - Founder pathway (auto-qualification based on contributions)

3. **Alumni Connections (Light)**
   - Alumni directory (read-only)
   - Mentorship requests
   - Success stories

4. **Parent Confidence Layer (Light)**
   - Read-only housing confidence reports
   - Parent link to student profile
   - Safety/utility summaries

5. **Analytics & Insights**
   - Campus intelligence reports
   - Neighborhood trends
   - Property popularity metrics

**Success Metrics:**
- 50+ opportunities posted
- 20+ mentorship connections
- 30% opportunity application rate
- 60% 30-day retention

### Phase 4: Scale (Weeks 13+) — "The Network Effects"
**Goal:** Multi-campus, multi-country expansion.

**Deliverables:**
1. Multi-campus feed
2. Cross-campus matching
3. Country-level utility intelligence
4. Ambassador program (student-led)
5. Scout network expansion
6. API for third-party integrations

**Success Metrics:**
- 5+ campuses active
- 1000+ active students
- 500+ properties verified
- Network effects visible (students inviting friends)

---

## PHASE 5: IMPLEMENTATION PLAN

### 5.1 Sprint 0: Cleanup (Week 1)
**Goal:** Remove owner/landlord functionality, prepare for student-only build.

**Tasks:**
1. **Database:**
   - [ ] Drop `owners` table
   - [ ] Drop `property_inquiries` table
   - [ ] Drop `viewing_requests` table
   - [ ] Drop `property_claims` table
   - [ ] Remove `owner_id` from `properties`
   - [ ] Add `curated_by`, `curation_notes` to `properties`
   - [ ] Add `utility_reports` table
   - [ ] Add `contribution_events` table
   - [ ] Update RLS policies for student-only access

2. **Code:**
   - [ ] Remove 'owner' from `ALLOWED_SIGNUP_ROLES`
   - [ ] Remove owner signup flow
   - [ ] Remove owner dashboard routes
   - [ ] Remove owner components
   - [ ] Update types: remove `Owner` interface
   - [ ] Update auth-actions.ts

3. **UI:**
   - [ ] Remove "Contact Owner" buttons
   - [ ] Remove "Schedule Viewing" buttons
   - [ ] Remove owner profile sections
   - [ ] Update signup page (student-only)

**Deliverable:** Clean database, student-only auth, no owner references in code.

### 5.2 Sprint 1: Home Feed & Onboarding (Weeks 2-3)
**Goal:** Student gets immediate value on first visit.

**Tasks:**
1. **Home Feed:**
   - [ ] Create `/app/page.tsx` as personalized feed
   - [ ] Utility alerts section (campus-specific)
   - [ ] Trending discussions section
   - [ ] Opportunities for you section
   - [ ] New matches section

2. **Progressive Onboarding:**
   - [ ] Simplify signup to 3 steps max
   - [ ] Add campus selection (cached in localStorage if not logged in)
   - [ ] Add program/year selection (optional)
   - [ ] Add housing preferences (optional)
   - [ ] Redirect to home feed after signup (no forced profile completion)

3. **Utility Reporting:**
   - [ ] Create `/app/report/page.tsx` (utility report form)
   - [ ] One-tap report buttons on property pages
   - [ ] Utility report list (campus-level)

4. **Search:**
   - [ ] Update `/app/search/page.tsx` to reach discussions, opportunities
   - [ ] Add filters for utility status, Campozy Score

**Deliverable:** Working home feed, student-only signup, utility reporting.

### 5.3 Sprint 2: Property Detail & Community (Weeks 4-5)
**Goal:** Student can make informed housing decisions.

**Tasks:**
1. **Property Detail Refactor:**
   - [ ] Remove owner elements
   - [ ] Add utility history graph
   - [ ] Add "Report Utility Issue" button
   - [ ] Add community discussion section
   - [ ] Add "Students like you also viewed" section

2. **Community Q&A:**
   - [ ] Refactor `/app/community/page.tsx`
   - [ ] Add `/app/community/ask/page.tsx`
   - [ ] Campus-specific discussion filtering
   - [ ] Question/answer threading

3. **Property Comparison:**
   - [ ] Create `/app/housing/compare/page.tsx`
   - [ ] Side-by-side Campozy Scores
   - [ ] Side-by-side utility data
   - [ ] Side-by-side reviews

4. **Saved Properties:**
   - [ ] Add save/unsave from property detail
   - [ ] Create `/app/housing/saved/page.tsx`

**Deliverable:** Complete property discovery flow, community Q&A, comparison.

### 5.4 Sprint 3: Matching (Weeks 6-7)
**Goal:** Social hooks for daily engagement.

**Tasks:**
1. **Roommate Finder:**
   - [ ] Refactor `/app/roommates/page.tsx`
   - [ ] Preference wizard (5 questions)
   - [ ] Match ranking display
   - [ ] Like/pass/message flow
   - [ ] Conversations UI

2. **Friendfinder:**
   - [ ] Rename `/app/friends` → `/app/connections`
   - [ ] Refactor friend suggestions
   - [ ] Study buddy matching
   - [ ] Event buddy matching

3. **Notifications:**
   - [ ] Create `/app/notifications/page.tsx`
   - [ ] Real-time notifications (Supabase realtime)
   - [ ] Notification preferences in settings

**Deliverable:** Working matching system, notifications.

### 5.5 Sprint 4: Opportunities & Profile (Weeks 8-9)
**Goal:** Student sees personalized opportunities.

**Tasks:**
1. **Opportunity Matching:**
   - [ ] Create opportunity matching algorithm
   - [ ] "For You" tab on `/app/opportunities`
   - [ ] Application tracking
   - [ ] `/app/opportunities/applications/page.tsx`

2. **Profile Refactor:**
   - [ ] Merge `/app/profile` and `/app/profile/student`
   - [ ] Add contribution history
   - [ ] Add reputation/badges display
   - [ ] Add saved items section
   - [ ] Add matches section

3. **Settings:**
   - [ ] Create `/app/settings/page.tsx`
   - [ ] Notification preferences
   - [ ] Campus/program editing
   - [ ] Privacy settings

**Deliverable:** Opportunity matching, complete profile, settings.

### 5.6 Sprint 5: Polish & Launch (Weeks 10-12)
**Goal:** Production-ready student-centric product.

**Tasks:**
1. **UI Polish:**
   - [ ] Mobile responsiveness audit
   - [ ] Loading states
   - [ ] Error states
   - [ ] Empty states
   - [ ] Offline handling

2. **Performance:**
   - [ ] Image optimization
   - [ ] Query optimization
   - [ ] Caching strategy
   - [ ] Bundle size optimization

3. **Testing:**
   - [ ] E2E tests for key flows
   - [ ] Unit tests for matching algorithms
   - [ ] Database migration testing

4. **Launch Prep:**
   - [ ] Seed data (properties, discussions, opportunities)
   - [ ] Documentation
   - [ ] Launch plan (campus-by-campus)

**Deliverable:** Production-ready Campozy (student-only).

---

## PHASE 6: DEFINITIONS & DECISIONS

### 6.1 Key Decisions Made

| Decision | Rationale |
|---|---|
| Remove owner/landlord modules entirely | Simplifies product, sharpens focus on student confidence, reduces build complexity |
| Properties become community-curated data | Scouts and students verify; no owner self-service |
| Progressive onboarding (not interrogation) | Every visit must produce value; no forced profile completion |
| Home feed as primary screen | Daily engagement loop; student returns for utility alerts, discussions, matches |
| Utility reporting as primary contribution | Low friction, high value, creates return loop |
| Roommate/Friendfinder as social hooks | Relationships create habitual usage |
| Opportunities as retention layer | Keeps student engaged from arrival to graduation |
| Parents/Employers/Businesses deferred | Focus scarce resources on student core first |

### 6.2 Open Questions

| Question | Options | Decision Needed |
|---|---|---|
| How to seed initial property data? | Manual entry, scout network, import | Before Phase 1 |
| Verification model for students? | Email verification, university ID, community vouching | Phase 1 |
| Monetization timeline? | Freemium forever, premium features later | Post-launch |
| Multi-campus expansion? | Single campus first vs. multi from day 1 | Phase 4 |
| Scout/contributor compensation? | Reputation only vs. monetary | Phase 3 |

### 6.3 Success Metrics (Student-Centric)

| Metric | Target (Phase 1) | Target (Phase 3) |
|---|---|---|
| Daily Active Students | 50 | 500 |
| Properties with verified data | 100 | 500 |
| Utility reports per week | 20 | 200 |
| Community discussions per week | 10 | 100 |
| Matches made (roommate + friend) | 10 | 200 |
| Opportunity matches | 5 | 50 |
| 30-day retention | 40% | 70% |
| NPS (Net Promoter Score) | 50 | 70 |

---

## APPENDIX: FILES TO MODIFY

### Database
- `supabase/schema/06_marketplace.sql` — Remove owner_id, add curated_by
- `supabase/schema/03_profiles.sql` — Add student fields
- `supabase/schema/05_community.sql` — Add utility_reports, contribution_events
- `supabase/migrations/0001_initial_schema.sql` — Remove owner tables
- `supabase/seeds/seed-data.sql` — Remove owner seeds

### Backend/Server
- `app/actions/auth-actions.ts` — Remove owner role
- `app/actions/housing-actions.ts` — Remove owner-specific actions
- `services/housing-service.ts` — Remove owner queries
- `services/trust-service.ts` — Update for student-only
- `services/community-service.ts` — Add utility reports
- `services/opportunity-service.ts` — Add matching

### Frontend/Pages
- `app/page.tsx` — Convert to home feed
- `app/signup/page.tsx` — Student-only progressive onboarding
- `app/property/[id]/page.tsx` — Remove owner elements
- `app/discovery/page.tsx` → `app/housing/page.tsx`
- `app/community/page.tsx` — Refactor for students
- `app/roommates/page.tsx` — Refactor
- `app/friends/` → `app/connections/`
- `app/profile/page.tsx` — Student-centric
- `app/layout.tsx` — Update nav (remove owner links)

### Components
- `components/navbar.tsx` — Remove owner links
- `components/property-owner-actions.tsx` — Delete
- `components/property-inquiry-form.tsx` — Delete
- `components/viewing-request-form.tsx` — Delete
- `components/utility-report-form.tsx` — Create
- `components/home-feed.tsx` — Create
- `components/contribution-badge.tsx` — Create

### Types
- `types/index.ts` — Remove Owner interface, update Property

### Config
- `kilo.json` — Update if needed
- `AGENTS.md` — Update workflow if needed

---

## EXECUTION ORDER

```
Sprint 0 (Week 1): Database Cleanup + Auth Refactor
    ↓
Sprint 1 (Weeks 2-3): Home Feed + Onboarding + Utility Reporting
    ↓
Sprint 2 (Weeks 4-5): Property Detail + Community Q&A + Comparison
    ↓
Sprint 3 (Weeks 6-7): Matching + Notifications
    ↓
Sprint 4 (Weeks 8-9): Opportunities + Profile + Settings
    ↓
Sprint 5 (Weeks 10-12): Polish + Testing + Launch Prep
```

**Critical Path:** Auth cleanup → Home Feed → Property Detail → Community → Matching → Opportunities

**Parallel Work:**
- UI components can be built in parallel with backend
- Types can be updated immediately
- Seed data preparation can happen during Sprint 1

---

## DOCUMENT END
