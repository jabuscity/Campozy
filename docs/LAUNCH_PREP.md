# Campozy Launch Preparation

## Sprint 5 Completed

### What Was Built
- **Home Feed Personalization**: Utility alerts, trending discussions, personalized opportunities, and match counts for logged-in students
- **Route Cleanup**: `/discovery` → `/housing` redirect, `/forums` → `/community` redirect, `/recommendations` → `/` redirect
- **Image Optimization**: Converted `tile-image-with-fallback` to use Next.js `Image` component
- **Code Quality**: Removed unused imports, fixed type issues, maintained 59-route build
- **Testing**: Maintained 25/25 passing unit tests

### Current Route Map
| Route | Status |
|-------|--------|
| `/` | Home Feed (personalized) |
| `/login`, `/signup` | Auth |
| `/profile`, `/settings` | Profile & Settings |
| `/notifications` | Notification Center |
| `/housing`, `/housing/compare`, `/housing/saved` | Property Discovery |
| `/property/[id]` | Property Detail |
| `/community`, `/community/ask` | Community Hub |
| `/opportunities`, `/opportunities/applications` | Opportunities |
| `/roommates`, `/roommates/preferences`, `/roommates/conversations/[id]` | Roommate Finder |
| `/connections`, `/connections/suggestions`, `/connections/buddies`, `/connections/preferences` | Friendfinder |
| `/search` | Global Search |
| `/report` | Report Issue |

## Launch Checklist

### Pre-Launch (Week 10)
- [ ] **Seed Data**: Populate initial properties, discussions, opportunities
  - Target: 20+ properties across 3 campuses
  - Target: 50+ discussions
  - Target: 10+ opportunities
  - Target: 10+ utility reports
- [ ] **Database Migrations**: Run all pending migrations on production
- [ ] **Environment Variables**: Verify all env vars are set in production
- [ ] **Image CDN**: Verify Unsplash and Supabase Storage CDN is configured
- [ ] **Error Monitoring**: Set up Sentry or similar for production error tracking
- [ ] **Analytics**: Add Google Analytics or Plausible for usage tracking

### Soft Launch (Week 11)
- [ ] **Campus 1**: Launch at pilot campus with 50-100 students
- [ ] **Onboarding**: Verify progressive onboarding flow works
- [ ] **Support**: Set up WhatsApp/Slack support channel for early users
- [ ] **Feedback**: Add in-app feedback mechanism

### Full Launch (Week 12)
- [ ] **Campus 2-3**: Expand to additional campuses
- [ ] **Marketing**: Campus ambassador program activation
- [ ] **Content**: Seed discussions, reviews, utility reports
- [ ] **Performance**: Verify < 2s page load times on 3G

## Seed Data Strategy

### Priority 1: Properties (20+)
- Target 3 campuses: Strathmore, KU, USIU
- 5-10 properties per campus
- Include: name, address, neighborhood, price, Campozy score, utility data, media

### Priority 2: Discussions (50+)
- Campus-specific: "Best hostels near [campus]?"
- Utility: "Water status at [hostel]?"
- General: "Moving to Nairobi tips"

### Priority 3: Opportunities (10+)
- Internships: 5
- Scholarships: 3
- Events: 2

### Priority 4: Utility Reports (10+)
- Water status reports
- Electricity reliability reports
- Internet speed reports

### Priority 5: Users (50+)
- Student accounts with profiles
- Complete roommate/friend preferences for 20+ users
- Generate matches for testing

## Campus Rollout Plan

### Phase 1: Pilot (Week 10-11)
**Campus**: Strathmore University (Nairobi)
- Seed 10 properties around Madaraka Estate
- Recruit 5 campus ambassadors
- Target: 50 active students

### Phase 2: Expand (Week 12-13)
**Campuses**: Kenyatta University, USIU
- Seed 10 properties per campus
- Recruit ambassadors
- Target: 200 active students

### Phase 3: Scale (Week 14+)
**Campuses**: Additional Nairobi campuses, then Mombasa/Kisumu
- Community-driven seeding
- Target: 500+ active students

## Technical Debt to Address Post-Launch

1. **E2E Testing**: Set up Playwright for critical flows
2. **Performance**: Implement React Suspense boundaries for loading states
3. **Caching**: Add Redis/Supabase caching for frequent queries
4. **Real-time**: Enable Supabase real-time for discussions and matches
5. **PWA**: Add service worker for offline support

## Success Metrics

| Metric | Target (Week 12) |
|--------|-----------------|
| Daily Active Students | 100+ |
| Properties Listed | 50+ |
| Utility Reports | 50+ |
| Discussions | 100+ |
| Matches Made | 20+ |
| Opportunity Applications | 10+ |
| 30-day Retention | 40%+ |

## Emergency Contacts

- **Technical Lead**: [Name]
- **Product Lead**: [Name]
- **Support Channel**: [WhatsApp/Slack]
- **Incident Response**: [PagerDuty/OpsGenie]

---

_Last updated: 2026-07-29_
