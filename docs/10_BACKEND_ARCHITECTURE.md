# CAMPOZY BACKEND ARCHITECTURE

## Status
Engineering blueprint.

## Stack Assumptions
Frontend:
- Next.js App Router
- TypeScript
- Tailwind

Backend:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- Edge Functions
- pgvector
- Postgres full-text search

## Core Philosophy
Campozy begins as a modular monolith, not microservices.

## Core Backend Layers
1. API Layer
2. Domain Services
3. Trust Layer
4. Intelligence Layer
5. Data Layer
6. Infrastructure Layer

## API Layer
- Route handlers
- Server actions
- validation
- authorization
- rate limiting

## Domain Services
- Identity
- Students
- Housing
- Reviews
- Utilities
- Hygiene
- Trust
- Verification
- Community
- Messaging
- Businesses
- Parents
- Opportunities
- Alumni
- Recommendations
- Analytics
- Growth
- Founders
- Ambassadors
- Scouts

## Trust Layer
- Reputation Engine
- Verification Engine
- Fraud Detection
- Moderation Engine
- Confidence Scoring

## Intelligence Layer
- Property Recommendations
- Neighborhood Recommendations
- Business Recommendations
- Mentorship Recommendations
- Opportunity Recommendations
- Akwet Transition Recommendations
- Founder qualification projections
- Campus intelligence projections

## Event Architecture
Every meaningful action becomes an event.

Examples:
- property_viewed
- property_saved
- review_created
- discussion_created
- message_sent
- founder_points_earned
- scout_report_submitted
- ambassador_assignment_completed

## Projection System
- recommendation_projection
- analytics_projection
- reputation_projection
- trust_projection
- founder_projection
- campus_projection

## Founder Backend Support
The backend must explicitly support:
- founder cohorts
- founder qualification events
- founder point aggregation
- campus/country/global scope logic
- founder council access
- founder opportunity alerts

## Ambassador Backend Support
- assignment creation
- report submission
- growth tracking
- reward management

## Scout Backend Support
- assignment queue
- evidence submission
- audit flow
- trust impact propagation

## Recommendation Pipeline
Stage 1: rules  
Stage 2: preferences  
Stage 3: behavior  
Stage 4: graph intelligence  
Stage 5: AI-assisted enhancement

## Auth & Authorization
- Supabase Auth
- role assignment through relationship tables
- Postgres RLS
- admin and service-role separation

## Storage
Buckets/logical domains:
- property-media
- review-media
- verification-evidence
- community-media
- business-media
- profile-media

## Realtime
Used for:
- messages
- discussion replies
- verification updates
- founder notifications
- opportunity alerts

## Monitoring
Track:
- API errors
- query performance
- event throughput
- recommendation latency
- moderation backlog
- verification backlog

## Architectural North Star
Every system exists to transform activity into trust, trust into intelligence, and intelligence into better decisions.
