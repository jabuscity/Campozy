// ============================================================================
// CAMPOZY TYPE DEFINITIONS
// Complete TypeScript types mirroring the database schema.
// ============================================================================

// ---------------------------------------------------------------------------
// Enums (mirror PostgreSQL enums)
// ---------------------------------------------------------------------------

export type VerificationLevel = 'unverified' | 'claimed' | 'community_verified' | 'scout_verified' | 'campozy_verified';
export type TrustLevel = 'new' | 'member' | 'contributor' | 'trusted_contributor' | 'campus_expert' | 'community_leader' | 'campozy_fellow';
export type FounderScope = 'campus' | 'country' | 'global';
export type OpportunityType = 'job' | 'internship' | 'scholarship' | 'volunteer' | 'event';
export type NotificationType = 'review' | 'verification' | 'opportunity' | 'message' | 'founder' | 'system' | 'alert' | 'utility_report' | 'tip_suggestion' | 'opportunity_suggestion';
export type ModerationActionType = 'warning' | 'content_removed' | 'temporary_restriction' | 'account_suspension';
export type RoleName = 'student' | 'owner' | 'scout' | 'founder' | 'ambassador' | 'mentor' | 'alumni' | 'employer' | 'parent' | 'moderator' | 'admin';

// ---------------------------------------------------------------------------
// Lifecycle stages (from doc 13)
// ---------------------------------------------------------------------------

export type LifecycleStage =
  | 'prospective'
  | 'student'
  | 'contributor'
  | 'campus_founder'
  | 'country_founder'
  | 'global_pioneer'
  | 'campus_expert'
  | 'ambassador'
  | 'scout'
  | 'graduate'
  | 'alumni'
  | 'mentor'
  | 'employer';

// ---------------------------------------------------------------------------
// Reference Tables
// ---------------------------------------------------------------------------

export interface Role {
  id: string;
  name: RoleName;
  description: string | null;
  created_at: string;
}

export interface Country {
  id: string;
  name: string;
  iso_code: string;
  created_at: string;
}

export interface City {
  id: string;
  country_id: string;
  name: string;
  created_at: string;
  // Relations
  country?: Country;
  countries?: Country;
}

export interface PropertyType {
  id: string;
  name: string;
  created_at: string;
}

export interface AmenityType {
  id: string;
  name: string;
  icon: string | null;
  created_at: string;
}

export interface UtilityType {
  id: string;
  name: string;
}

export interface HygieneCategory {
  id: string;
  name: string;
}

export interface DiscussionCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  location: string | null;
  start_time: string;
  end_time: string | null;
  campus_id: string | null;
  organizer_id: string;
  max_attendees: number | null;
  is_public: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Identity Domain
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone_number: string | null;
  is_verified: boolean;
  is_onboarded: boolean;
  date_of_birth: string | null;
  trust_level: TrustLevel;
  reputation_score: number;
  contribution_score: number;
  university_id: string | null;
  campus_id: string | null;
  former_school_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user_roles?: UserRole[];
  user_badges?: UserBadge[];
  university?: University;
  campus?: Campus;
  former_school?: HighSchool;
  owner?: Owner;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_at: string;
  // Relations
  role?: Role;
}

export interface ContactMethod {
  id: string;
  user_id: string;
  method_type: string;
  value: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
}

export interface IdentityDocument {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Education Domain
// ---------------------------------------------------------------------------

export interface University {
  id: string;
  country_id: string;
  city_id: string;
  name: string;
  short_name: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  // Relations
  country?: Country;
  campuses?: Campus[];
}

export interface Campus {
  id: string;
  university_id: string;
  name: string;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  description: string | null;
  created_at: string;
  // Relations
  university?: University;
}

export interface AcademicProgram {
  id: string;
  university_id: string;
  name: string;
  degree_level: string | null;
  duration_years: number | null;
  created_at: string;
}

export interface HighSchool {
  id: string;
  name: string;
  city_id: string | null;
  created_at: string;
  // Relations
  city?: City;
}

export interface Owner {
  id: string;
  address: string | null;
  created_at: string;
  // Relations
  profile?: Profile;
}

// ---------------------------------------------------------------------------
// Student Domain
// ---------------------------------------------------------------------------

export interface Student {
  id: string;
  campus_id: string | null;
  program_id: string | null;
  year_of_study: number | null;
  enrollment_year: number | null;
  expected_graduation_year: number | null;
  former_school_id: string | null;
  personality: string | null;
  fun_activities: string | null;
  religious_inclination: string | null;
  study_type: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: Profile;
  campus?: Campus;
  program?: AcademicProgram;
  former_school?: HighSchool;
}

export interface StudentPreferences {
  id: string;
  student_id: string;
  max_budget: number | null;
  currency: string;
  preferred_property_types: string[];
  preferred_amenities: string[];
  max_distance_km: number | null;
  priority_utilities: string[];
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Geography Domain
// ---------------------------------------------------------------------------

export interface Neighborhood {
  id: string;
  city_id: string;
  name: string;
  description: string | null;
  safety_score: number;
  reputation_score: number | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  city?: City;
  cities?: City;
  landmarks?: NeighborhoodLandmark[];
  campus_distances?: NeighborhoodCampusDistance[];
}

export interface NeighborhoodLandmark {
  id: string;
  neighborhood_id: string;
  name: string;
  landmark_type: string | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
}

export interface NeighborhoodCampusDistance {
  neighborhood_id: string;
  campus_id: string;
  distance_km: number;
  walking_time_min: number | null;
  transport_time_min: number | null;
  transport_cost: number | null;
  // Relations
  campus?: Campus;
  neighborhood?: Neighborhood;
}

// ---------------------------------------------------------------------------
// Housing Domain
// ---------------------------------------------------------------------------

export interface Property {
  id: string;
  neighborhood_id: string | null;
  name: string;
  address: string;
  description: string | null;
  property_type_id: string | null;
  verification_level: VerificationLevel;
  campozy_score: number;
  location_lat: number | null;
  location_lng: number | null;
  total_rooms: number | null;
  floors: number | null;
  year_built: number | null;
  monthly_price: number | null;
  pros: string | null;
  known_issues: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  neighborhood?: Neighborhood;
  neighborhoods?: Neighborhood;
  property_type?: PropertyType;
  profiles?: Pick<Profile, 'id' | 'username' | 'full_name' | 'phone_number' | 'is_verified'>;
  rooms?: PropertyRoom[];
  property_media?: PropertyMedia[];
  media?: PropertyMedia[];
  amenities?: PropertyAmenity[];
  utilities?: PropertyUtility[];
  reviews?: PropertyReview[];
}

export interface PropertyRoom {
  id: string;
  property_id: string;
  room_type: string;
  price_per_semester: number | null;
  price_per_month: number | null;
  currency: string;
  is_available: boolean;
  capacity: number;
  floor_number: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  url: string;
  media_type: string;
  caption: string | null;
  is_primary: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface PropertyAmenity {
  property_id: string;
  amenity_id: string;
  notes: string | null;
  // Relations
  amenity_type?: AmenityType;
}

export interface PropertyClaim {
  id: string;
  property_id: string;
  claimant_id: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence_urls: string[];
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Utility Domain
// ---------------------------------------------------------------------------

export interface PropertyUtility {
  id: string;
  property_id: string;
  utility_id: string;
  reliability_score: number;
  report_count: number;
  last_reported_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  utility_type?: UtilityType;
}

export interface UtilityReport {
  id: string;
  property_id: string;
  utility_type_id: string;
  user_id: string;
  reliability_rating: number;
  hours_available_per_day: number | null;
  comment: string | null;
  created_at: string;
}

export interface UtilityIncident {
  id: string;
  property_id: string | null;
  utility_type_id: string;
  reported_by: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location_type: 'property' | 'campus' | 'other';
  location_description: string | null;
  resolved_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Hygiene Domain
// ---------------------------------------------------------------------------

export interface HygieneReport {
  id: string;
  property_id: string;
  user_id: string;
  category_id: string;
  score: number;
  comment: string | null;
  created_at: string;
  // Relations
  category?: HygieneCategory;
  media?: HygieneMedia[];
}

export interface HygieneMedia {
  id: string;
  report_id: string;
  url: string;
  media_type: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Review Domain
// ---------------------------------------------------------------------------

/** The 10 Campozy Score dimensions */
export interface CampozyScoreDimensions {
  safety_rating: number | null;
  hygiene_rating: number | null;
  water_rating: number | null;
  electricity_rating: number | null;
  internet_rating: number | null;
  management_rating: number | null;
  accessibility_rating: number | null;
  value_for_money_rating: number | null;
}

export interface PropertyReview extends CampozyScoreDimensions {
  id: string;
  property_id: string;
  user_id: string;
  overall_rating: number;
  content: string | null;
  is_verified_stay: boolean;
  stay_duration_months: number | null;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  reviewer?: Profile;
  profiles?: Profile;
  media?: PropertyReviewMedia[];
}

export interface PropertyReviewMedia {
  id: string;
  review_id: string;
  url: string;
  media_type: string;
  created_at: string;
}

export interface PropertyReviewVote {
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

export interface NeighborhoodReview {
  id: string;
  neighborhood_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  safety_rating: number | null;
  transport_rating: number | null;
  amenities_rating: number | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Trust & Reputation Domain
// ---------------------------------------------------------------------------

export interface ReputationEvent {
  id: string;
  user_id: string;
  event_type: string;
  points: number;
  reason: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
  category: string | null;
  created_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  granted_at: string;
  granted_reason: string | null;
  // Relations
  badge?: Badge;
}

// ---------------------------------------------------------------------------
// Verification Domain
// ---------------------------------------------------------------------------

export interface VerificationRecord {
  id: string;
  entity_id: string;
  entity_type: string;
  verification_level: VerificationLevel;
  verifier_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  notes: string | null;
  verified_at: string | null;
  expires_at: string | null;
  created_at: string;
  // Relations
  evidence?: VerificationEvidence[];
}

export interface VerificationEvidence {
  id: string;
  verification_id: string;
  evidence_type: string;
  url: string;
  description: string | null;
  uploaded_by: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Community Domain
// ---------------------------------------------------------------------------

export interface Discussion {
  id: string;
  campus_id: string | null;
  neighborhood_id: string | null;
  category_id: string | null;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
  category?: DiscussionCategory;
  campus?: Campus;
  replies?: DiscussionReply[];
  // Computed vote fields
  upvotes?: number;
  downvotes?: number;
  user_vote?: number | null;
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  user_id: string;
  parent_reply_id: string | null;
  content: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  campus_id: string | null;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
  campus?: Campus;
  // Computed
  vote_count?: number;
  comment_count?: number;
  user_vote?: number | null;
  upvotes?: number;
  downvotes?: number;
}

export interface PostVote {
  id: string;
  post_id: string;
  user_id: string;
  vote_type: number;
  created_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
}

export interface Tip {
  id: string;
  campus_id: string | null;
  neighborhood_id: string | null;
  user_id: string;
  content: string;
  category: string | null;
  helpful_count: number;
  created_at: string;
}

export interface Warning {
  id: string;
  campus_id: string | null;
  neighborhood_id: string | null;
  property_id: string | null;
  user_id: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
}

export interface KnowledgeArticle {
  id: string;
  author_id: string;
  campus_id: string | null;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Messaging Domain
// ---------------------------------------------------------------------------

export interface Conversation {
  id: string;
  subject: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  members?: ConversationMember[];
  messages?: Message[];
}

export interface ConversationMember {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string | null;
  is_muted: boolean;
  // Relations
  profiles?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  // Relations
  sender?: Profile;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  url: string;
  file_type: string | null;
  file_name: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Business Domain
// ---------------------------------------------------------------------------

export interface Business {
  id: string;
  owner_id: string;
  neighborhood_id: string | null;
  name: string;
  description: string | null;
  category: string | null;
  verification_level: VerificationLevel;
  campozy_score: number;
  location_lat: number | null;
  location_lng: number | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  owner?: Profile;
  media?: BusinessMedia[];
  reviews?: BusinessReview[];
}

export interface BusinessMedia {
  id: string;
  business_id: string;
  url: string;
  media_type: string;
  is_primary: boolean;
  created_at: string;
}

export interface BusinessReview {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  created_at: string;
  // Relations
  reviewer?: Profile;
}

// ---------------------------------------------------------------------------
// Education Domain
// ---------------------------------------------------------------------------

export interface ParentStudentLink {
  parent_id: string;
  student_id: string;
  status: 'pending' | 'confirmed' | 'rejected';
  confirmed_at: string | null;
}

export interface ParentAlert {
  id: string;
  parent_id: string;
  alert_type: string;
  title: string;
  content: string | null;
  is_read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Founder Domain
// ---------------------------------------------------------------------------

export interface FounderCohort {
  id: string;
  name: string;
  scope: FounderScope;
  scope_entity_id: string | null;
  max_members: number;
  is_active: boolean;
  created_at: string;
  // Relations
  memberships?: FounderMembership[];
}

export interface FounderMembership {
  id: string;
  user_id: string;
  cohort_id: string;
  contribution_score: number;
  qualified_at: string | null;
  became_founder_at: string;
  // Relations
  profile?: Profile;
  cohort?: FounderCohort;
}

export interface FounderQualificationEvent {
  id: string;
  user_id: string;
  cohort_id: string;
  event_type: string;
  points: number;
  description: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Ambassador Domain
// ---------------------------------------------------------------------------

export interface AmbassadorProgram {
  id: string;
  campus_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Ambassador {
  id: string;
  user_id: string;
  program_id: string;
  status: 'active' | 'paused' | 'completed';
  started_at: string;
}

export interface AmbassadorAssignment {
  id: string;
  ambassador_id: string;
  task_type: string;
  description: string | null;
  status: 'assigned' | 'in_progress' | 'completed';
  completed_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Scout Domain
// ---------------------------------------------------------------------------

export interface Scout {
  id: string;
  user_id: string;
  region_id: string | null;
  certification_level: 'trainee' | 'certified' | 'senior' | 'lead';
  reputation_score: number;
  total_verifications: number;
  accuracy_rate: number;
  is_active: boolean;
  created_at: string;
  // Relations
  profile?: Profile;
}

export interface ScoutAssignment {
  id: string;
  scout_id: string;
  property_id: string;
  assignment_type: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'standard' | 'high' | 'urgent';
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  // Relations
  property?: Property;
}

export interface ScoutReport {
  id: string;
  assignment_id: string;
  scout_id: string;
  findings: string;
  recommendation: string | null;
  evidence_urls: string[];
  created_at: string;
}

export interface ScoutAudit {
  id: string;
  scout_id: string;
  report_id: string;
  auditor_id: string;
  outcome: 'accurate' | 'inaccurate' | 'partially_accurate';
  notes: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Opportunity Domain
// ---------------------------------------------------------------------------

export interface Employer {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  verification_level: VerificationLevel;
  contact_user_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Opportunity {
  id: string;
  employer_id: string | null;
  creator_id: string;
  type: OpportunityType;
  title: string;
  description: string;
  requirements: unknown[];
  location: string | null;
  is_remote: boolean;
  compensation: string | null;
  application_url: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  employer?: Employer;
  creator?: Profile;
}

export interface OpportunityApplication {
  id: string;
  opportunity_id: string;
  student_id: string;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
  cover_note: string | null;
  applied_at: string;
}

export interface MentorshipProfile {
  id: string;
  user_id: string;
  expertise: string[];
  bio: string | null;
  max_mentees: number;
  is_accepting: boolean;
  created_at: string;
  // Relations
  profile?: Profile;
}

export interface MentorshipRelationship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'active' | 'paused' | 'completed';
  started_at: string;
  ended_at: string | null;
}

// ---------------------------------------------------------------------------
// Alumni Domain
// ---------------------------------------------------------------------------

export interface AlumniProfile {
  id: string;
  university_id: string;
  graduation_year: number | null;
  degree: string | null;
  current_role: string | null;
  current_company: string | null;
  is_mentor: boolean;
  is_employer: boolean;
  created_at: string;
  // Relations
  profile?: Profile;
  university?: University;
}

// ---------------------------------------------------------------------------
// Akwet Transition Domain
// ---------------------------------------------------------------------------

export interface TransitionProfile {
  id: string;
  target_city_id: string | null;
  target_move_date: string | null;
  budget_range_min: number | null;
  budget_range_max: number | null;
  housing_type_preference: string[] | null;
  created_at: string;
  updated_at: string;
  // Relations
  target_city?: City;
}

export interface HousingTransitionPreference {
  id: string;
  transition_profile_id: string;
  property_type: string | null;
  min_bedrooms: number | null;
  max_bedrooms: number | null;
  min_bathrooms: number | null;
  furnished: boolean | null;
  utilities_included: boolean | null;
  created_at: string;
}

export interface AkwetRecommendationProfile {
  id: string;
  transition_profile_id: string;
  recommended_property_id: string | null;
  recommended_neighborhood_id: string | null;
  score: number | null;
  reasoning: string | null;
  created_at: string;
}

export interface TransitionEvent {
  id: string;
  transition_profile_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface TransitionRecommendation {
  id: string;
  transition_profile_id: string;
  entity_type: 'property' | 'neighborhood' | 'business';
  entity_id: string;
  score: number;
  reasoning: string | null;
  is_viewed: boolean;
  is_saved: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Recommendation Domain
// ---------------------------------------------------------------------------

export interface RecommendationProfile {
  id: string;
  user_id: string;
  preference_vector: number[] | null;
  behavior_vector: number[] | null;
  last_computed_at: string | null;
}

export interface RecommendationCandidate {
  id: string;
  user_id: string;
  entity_type: 'property' | 'neighborhood' | 'business' | 'opportunity';
  entity_id: string;
  score: number;
  reason: string | null;
  source: 'rules' | 'preferences' | 'behavior' | 'graph' | 'ai';
  created_at: string;
}

export interface RecommendationFeedback {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: string;
  action: 'viewed' | 'saved' | 'dismissed' | 'clicked' | 'applied';
  created_at: string;
}

// ---------------------------------------------------------------------------
// Forum Domain
// ---------------------------------------------------------------------------

export interface Forum {
  id: string;
  name: string;
  description: string | null;
  campus_id: string | null;
  neighborhood_id: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
  // Relations
  topics?: ForumTopic[];
  created_by_profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ForumMembership {
  id: string;
  forum_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
}

export interface ForumTopic {
  id: string;
  forum_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
  forum?: Forum;
  posts?: ForumPost[];
}

export interface ForumPost {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  parent_post_id: string | null;
  is_solution: boolean;
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  // Relations
  author?: Profile;
  topic?: ForumTopic;
}

export interface ForumSubscription {
  id: string;
  user_id: string;
  topic_id: string;
  notify_on_reply: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Saved & Preferences
// ---------------------------------------------------------------------------

export interface SavedProperty {
  user_id: string;
  property_id: string;
  notes: string | null;
  saved_at: string;
  // Relations
  property?: Property;
}

export interface SavedBusiness {
  user_id: string;
  business_id: string;
  saved_at: string;
}

export interface SavedOpportunity {
  user_id: string;
  opportunity_id: string;
  saved_at: string;
}

// ---------------------------------------------------------------------------
// Event Domain
// ---------------------------------------------------------------------------

export interface AppEvent {
  id: string;
  actor_id: string | null;
  event_type: string;
  target_id: string | null;
  target_type: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Notification Domain
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_reviews: boolean;
  email_opportunities: boolean;
  email_messages: boolean;
  email_founder: boolean;
  push_enabled: boolean;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Growth & Referral Domain
// ---------------------------------------------------------------------------

export interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  status: 'pending' | 'registered' | 'qualified';
  created_at: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  creator_id: string;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  campus_id: string | null;
  country_id: string | null;
  source: string | null;
  joined_at: string;
}

// ---------------------------------------------------------------------------
// Audit & Governance Domain
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: unknown;
  new_value: unknown;
  ip_address: string | null;
  created_at: string;
}

export interface ModerationCase {
  id: string;
  reported_by: string | null;
  target_user_id: string | null;
  target_entity_id: string | null;
  target_entity_type: string | null;
  reason: string;
  description: string | null;
  priority: 'critical' | 'high' | 'standard' | 'routine';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ModerationAction {
  id: string;
  case_id: string;
  action_type: ModerationActionType;
  moderator_id: string;
  reason: string;
  expires_at: string | null;
  created_at: string;
}

export interface Appeal {
  id: string;
  action_id: string;
  appellant_id: string;
  reason: string;
  status: 'pending' | 'reviewing' | 'upheld' | 'overturned';
  reviewer_id: string | null;
  reviewed_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Analytics Domain
// ---------------------------------------------------------------------------

export interface PropertyAnalytics {
  id: string;
  property_id: string;
  period_start: string;
  period_end: string;
  view_count: number;
  save_count: number;
  inquiry_count: number;
  review_count: number;
  avg_rating: number | null;
  created_at: string;
}

export interface CampusIntelligenceReport {
  id: string;
  campus_id: string;
  period_start: string;
  period_end: string;
  active_properties: number;
  avg_campozy_score: number | null;
  review_count: number;
  discussion_count: number;
  contributor_count: number;
  founder_count: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Campozy Score — Dimension Weights (from doc 01 + scoring trigger)
// ---------------------------------------------------------------------------

export const CAMPOZY_SCORE_DIMENSIONS = [
  'safety',
  'hygiene',
  'water',
  'electricity',
  'internet',
  'management',
  'accessibility',
  'value_for_money',
] as const;

export type CampozyScoreDimension = typeof CAMPOZY_SCORE_DIMENSIONS[number];

export const CAMPOZY_SCORE_WEIGHTS: Record<CampozyScoreDimension, number> = {
  safety: 3.0,
  hygiene: 2.0,
  water: 2.0,
  electricity: 2.0,
  internet: 1.5,
  management: 1.5,
  accessibility: 1.0,
  value_for_money: 2.0,
};

/** Campozy Score color thresholds (from doc 12) */
export function getCampozyScoreColor(score: number): 'green' | 'blue' | 'orange' | 'red' {
  if (score >= 90) return 'green';
  if (score >= 75) return 'blue';
  if (score >= 60) return 'orange';
  return 'red';
}

// ---------------------------------------------------------------------------
// Roommate Finder Domain
// ---------------------------------------------------------------------------

export type RoommateSleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type RoommateCleanlinessLevel = 'neat' | 'moderate' | 'relaxed';
export type RoommateSocialLevel = 'introvert' | 'moderate' | 'extrovert';
export type RoommateStudyHabits = 'silent' | 'light_noise' | 'flexible';
export type RoommateGenderPreference = 'male_only' | 'female_only' | 'any';
export type RoommateMatchStatus = 'pending' | 'viewed' | 'liked' | 'matched' | 'rejected';
export type RoommateInteractionType = 'like' | 'pass' | 'super_like' | 'message';

export interface RoommatePreference {
  id: string;
  student_id: string;
  budget_min: number | null;
  budget_max: number | null;
  preferred_campus_id: string | null;
  preferred_neighborhood_ids: string[];
  sleep_schedule: RoommateSleepSchedule;
  cleanliness_level: RoommateCleanlinessLevel;
  social_level: RoommateSocialLevel;
  study_habits: RoommateStudyHabits;
  gender_preference: RoommateGenderPreference;
  dietary_preferences: string[];
  interests: string[];
  smoking_ok: boolean;
  pets_ok: boolean;
  max_roommates: number;
  move_in_date: string | null;
  lease_duration_months: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoommateProfile {
  id: string;
  student_id: string;
  bio: string | null;
  year_of_study: number | null;
  age: number | null;
  university_id: string | null;
  campus_id: string | null;
  neighborhood_id: string | null;
  budget_range: number[] | null;
  sleep_schedule: RoommateSleepSchedule;
  cleanliness_level: RoommateCleanlinessLevel;
  social_level: RoommateSocialLevel;
  study_habits: RoommateStudyHabits;
  gender_preference: RoommateGenderPreference;
  dietary_preferences: string[];
  interests: string[];
  smoking_ok: boolean;
  pets_ok: boolean;
  max_roommates: number;
  move_in_date: string | null;
  lease_duration_months: number | null;
  is_active: boolean;
  campozy_score: number;
  created_at: string;
  updated_at: string;
  // Relations
  student?: Student;
  university?: University;
  campus?: Campus;
  neighborhood?: Neighborhood;
}

export interface RoommateMatch {
  id: string;
  seeker_id: string;
  match_id: string;
  compatibility_score: number;
  match_reasons: string[];
  budget_score: number | null;
  lifestyle_score: number | null;
  location_score: number | null;
  academic_score: number | null;
  status: RoommateMatchStatus;
  created_at: string;
  updated_at: string;
  // Relations
  seeker?: Profile;
  match?: Profile;
}

export interface RoommateInteraction {
  id: string;
  user_id: string;
  target_id: string;
  interaction_type: RoommateInteractionType;
  notes: string | null;
  created_at: string;
}

export interface RoommateConversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  participant_a_profile?: Profile;
  participant_b_profile?: Profile;
  messages?: RoommateMessage[];
}

export interface RoommateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  // Relations
  sender?: Profile;
}

// ---------------------------------------------------------------------------
// Friendfinder Domain
// ---------------------------------------------------------------------------

export type FriendPersonalityType = 'introvert' | 'extrovert' | 'ambivert';
export type FriendStudyHabits = 'silent' | 'light_noise' | 'flexible';
export type FriendMatchStatus = 'pending' | 'viewed' | 'suggested' | 'connected' | 'rejected';
export type FriendInteractionType = 'viewed' | 'liked' | 'passed' | 'connected';
export type FriendConnectionType = 'friend' | 'study_buddy' | 'event_buddy';

export interface FriendPreference {
  id: string;
  student_id: string;
  preferred_campus_id: string | null;
  preferred_program_ids: string[];
  preferred_interest_ids: string[];
  preferred_personality_types: string[];
  max_distance_km: number | null;
  study_together_ok: boolean;
  event_attendance_ok: boolean;
  gaming_ok: boolean;
  fitness_ok: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FriendProfile {
  id: string;
  student_id: string;
  bio: string | null;
  year_of_study: number | null;
  university_id: string | null;
  campus_id: string | null;
  personality_type: FriendPersonalityType;
  interests: string[];
  hobbies: string[];
  study_habits: FriendStudyHabits;
  availability_windows: string[];
  is_active: boolean;
  campozy_score: number;
  created_at: string;
  updated_at: string;
  // Relations
  student?: Student;
  university?: University;
  campus?: Campus;
}

export interface FriendMatch {
  id: string;
  seeker_id: string;
  match_id: string;
  compatibility_score: number;
  match_reasons: string[];
  academic_score: number | null;
  interest_score: number | null;
  social_score: number | null;
  proximity_score: number | null;
  status: FriendMatchStatus;
  created_at: string;
  updated_at: string;
  // Relations
  seeker?: Profile;
  match?: Profile;
}

export interface FriendConnection {
  id: string;
  user_a: string;
  user_b: string;
  connection_type: FriendConnectionType;
  is_active: boolean;
  created_at: string;
  // Relations
  user_a_profile?: Profile;
  user_b_profile?: Profile;
}

export interface FriendInteraction {
  id: string;
  user_id: string;
  target_id: string;
  interaction_type: FriendInteractionType;
  notes: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Matching Algorithm Types
// ---------------------------------------------------------------------------

export interface MatchResult {
  score: number;
  reasons: string[];
  subScores: {
    budget?: number;
    lifestyle?: number;
    location?: number;
    academic?: number;
    interests?: number;
    social?: number;
    proximity?: number;
  };
}

export interface RoommateCompatibilityInput {
  seeker: RoommateProfile & RoommatePreference;
  candidate: RoommateProfile & RoommatePreference;
}

export interface FriendCompatibilityInput {
  seeker: FriendProfile & FriendPreference;
  candidate: FriendProfile & FriendPreference;
}
