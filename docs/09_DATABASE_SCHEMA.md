# CAMPOZY DATABASE SCHEMA v3

## Status
Logical database constitution.

## Schema Philosophy
The schema must support:
- housing intelligence
- trust intelligence
- utility intelligence
- hygiene intelligence
- community intelligence
- opportunity intelligence
- alumni intelligence
- founder intelligence
- campus intelligence

## Design Principles
- Normalization first
- Relationships are first-class
- Roles are assigned, not hard-coded
- Trust must be traceable
- Everything important is auditable
- Campozy is lifecycle-aware

## Reference Tables
- roles
- countries
- cities
- property_types
- amenity_types
- utility_types
- hygiene_categories
- discussion_categories
- verification_levels
- trust_levels
- founder_scope_types
- founder_cohort_types
- opportunity_types
- notification_types
- event_types

## Identity Domain
Tables:
- users
- profiles
- user_roles
- contact_methods
- user_verification_profiles
- identity_documents
- auth_audit_logs

## Education Domain
Tables:
- universities
- university_profiles
- campuses
- campus_profiles
- academic_programs
- campus_programs
- university_statistics
- campus_statistics

## Student Domain
Tables:
- students
- student_preferences
- student_profile_extensions
- student_lifecycle_history
- student_reputation_profiles
- student_trust_profiles
- student_saved_searches

## Geography Domain
Tables:
- neighborhoods
- neighborhood_profiles
- neighborhood_landmarks
- neighborhood_campus_distances
- neighborhood_scores
- neighborhood_statistics

## Housing Domain
Tables:
- properties
- property_profiles
- property_rooms
- property_media
- property_amenities
- property_availability_snapshots
- property_management_profiles
- property_claims

## Utility Domain
Tables:
- property_utilities
- utility_reports
- utility_incidents
- utility_reliability_scores
- utility_trends

## Hygiene Domain
Tables:
- hygiene_reports
- hygiene_incidents
- hygiene_media
- hygiene_scores
- hygiene_trends

## Review Domain
Tables:
- property_reviews
- property_review_dimensions
- property_review_media
- property_review_votes
- property_review_flags
- neighborhood_reviews
- business_reviews

## Trust & Reputation Domain
Tables:
- trust_profiles
- reputation_profiles
- reputation_events
- badges
- entity_badges

## Verification Domain
Tables:
- verification_records
- verification_evidence
- verification_actions
- verification_confidence_profiles
- verification_expirations

## Community Domain
Tables:
- discussions
- discussion_replies
- discussion_votes
- discussion_tags
- tips
- warnings
- knowledge_articles
- community_reports

## Forum Domain
Tables:
- forums
- forum_memberships
- forum_topics
- forum_posts
- forum_subscriptions

## Messaging Domain
Tables:
- conversations
- conversation_members
- messages
- message_attachments
- message_reports

## Business Domain
Tables:
- businesses
- business_profiles
- business_locations
- business_media
- business_scores
- business_verification_records

## Parent Domain
Tables:
- parent_profiles
- parent_student_links
- parent_preferences
- parent_alerts
- parent_reports

## Founder Domain
Tables:
- founder_cohorts
- founder_memberships
- founder_progress
- founder_qualification_events
- founder_councils
- founder_council_memberships

A user may hold multiple founder memberships simultaneously:
- campus founder
- country founder
- global pioneer

## Ambassador Domain
Tables:
- ambassador_programs
- ambassadors
- ambassador_assignments
- ambassador_reports
- ambassador_rewards

## Scout Domain
Tables:
- scouts
- scout_regions
- scout_assignments
- scout_reports
- scout_evidence
- scout_audits
- scout_rewards

## Opportunity Domain
Tables:
- employers
- employer_profiles
- opportunities
- opportunity_requirements
- opportunity_matches
- opportunity_applications
- opportunity_alerts
- mentorship_profiles
- mentorship_relationships

## Alumni Domain
Tables:
- alumni_profiles
- alumni_experience_records
- alumni_contributions
- alumni_network_connections

## Recommendation Domain
Tables:
- recommendation_profiles
- recommendation_signals
- recommendation_weights
- recommendation_candidates
- recommendation_explanations
- recommendation_feedback

## Saved & Preference Domain
Tables:
- saved_properties
- saved_businesses
- saved_opportunities
- user_preference_profiles

## Akwet Transition Domain
Tables:
- transition_profiles
- housing_transition_preferences
- akwet_recommendation_profiles
- transition_events
- transition_recommendations

## Analytics Domain
Tables:
- analytics_profiles
- analytics_snapshots
- property_analytics
- neighborhood_analytics
- university_analytics
- opportunity_analytics
- recommendation_analytics
- campus_intelligence_reports

## Event Domain
Tables:
- events
- event_streams
- event_projections
- event_failures

## Notification Domain
Tables:
- notifications
- notification_preferences

## Growth & Referral Domain
Tables:
- referrals
- referral_rewards
- invitation_codes
- growth_campaigns
- campaign_participants
- waitlists

## Audit & Governance Domain
Tables:
- audit_logs
- moderation_cases
- moderation_actions
- appeals

## Logical Storage Domains
- property_media_assets
- review_media_assets
- hygiene_media_assets
- verification_evidence_assets
- business_media_assets
- profile_media_assets
- community_media_assets

## Relationship Summary
A user may have many roles.  
A user may be a student, founder, ambassador, scout, alumni member, mentor, or employer across time.  
A university has many campuses.  
A campus connects to many neighborhoods.  
A neighborhood contains many properties and businesses.  
A property has many reviews, utility reports, hygiene reports, and verification records.  
A user may hold multiple founder memberships across campus, country, and global scope.  
A founder may later become an ambassador, scout, mentor, alumni member, and employer.  
Opportunities connect students, mentors, alumni, employers, and future lifecycle stages.

## Schema North Star
The schema should make it possible to answer:
- Which housing should this student trust?
- Which campus has the strongest housing intelligence?
- Which neighborhood has reliable utilities?
- Which contributors are building trust?
- Who are the founders of this campus and country?
- Which alumni can mentor this student?
- Which opportunities best fit this student?
- When should this student transition to Akwet?
