-- ============================================================================
-- CAMPOZY MATCHING FEATURES SEED DATA
-- ============================================================================
-- This script inserts sample data for testing roommate and friend matching.
-- Run this AFTER applying migration 0003_add_matching_features.sql
-- ============================================================================

-- Insert sample roommate preferences
INSERT INTO roommate_preferences (student_id, budget_min, budget_max, sleep_schedule, cleanliness_level, social_level, study_habits, gender_preference, smoking_ok, pets_ok, max_roommates, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 5000, 15000, 'early_bird', 'neat', 'moderate', 'silent', 'any', FALSE, TRUE, 2, TRUE),
  ('00000000-0000-0000-0000-000000000002', 8000, 20000, 'night_owl', 'moderate', 'extrovert', 'light_noise', 'any', FALSE, FALSE, 1, TRUE),
  ('00000000-0000-0000-0000-000000000003', 3000, 10000, 'flexible', 'relaxed', 'introvert', 'flexible', 'any', TRUE, TRUE, 3, TRUE)
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample roommate profiles
INSERT INTO roommate_profiles (student_id, bio, year_of_study, sleep_schedule, cleanliness_level, social_level, study_habits, interests, smoking_ok, pets_ok, max_roommates, is_active, campozy_score)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Looking for a quiet roommate who enjoys studying.', 3, 'early_bird', 'neat', 'moderate', 'silent', ARRAY['coding', 'reading'], FALSE, TRUE, 2, TRUE, 85),
  ('00000000-0000-0000-0000-000000000002', 'Social person who loves gaming and movies.', 2, 'night_owl', 'moderate', 'extrovert', 'light_noise', ARRAY['gaming', 'movies', 'music'], FALSE, FALSE, 1, TRUE, 72),
  ('00000000-0000-0000-0000-000000000003', 'Chill student who likes flexibility.', 4, 'flexible', 'relaxed', 'introvert', 'flexible', ARRAY['art', 'photography'], TRUE, TRUE, 3, TRUE, 68)
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample friend preferences
INSERT INTO friend_preferences (student_id, study_together_ok, event_attendance_ok, gaming_ok, fitness_ok, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', TRUE, TRUE, FALSE, TRUE, TRUE),
  ('00000000-0000-0000-0000-000000000002', FALSE, TRUE, TRUE, FALSE, TRUE),
  ('00000000-0000-0000-0000-000000000003', TRUE, FALSE, TRUE, TRUE, TRUE)
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample friend profiles
INSERT INTO friend_profiles (student_id, bio, year_of_study, personality_type, interests, hobbies, study_habits, is_active, campozy_score)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Friendly and outgoing.', 3, 'extrovert', ARRAY['sports', 'music'], ARRAY['gaming', 'hiking'], 'light_noise', TRUE, 90),
  ('00000000-0000-0000-0000-000000000002', 'Quiet and studious.', 2, 'introvert', ARRAY['reading', 'coding'], ARRAY['chess', 'painting'], 'silent', TRUE, 75),
  ('00000000-0000-0000-0000-000000000003', 'Balanced personality.', 4, 'ambivert', ARRAY['travel', 'photography'], ARRAY['cooking', 'yoga'], 'flexible', TRUE, 82)
ON CONFLICT (student_id) DO NOTHING;

-- Insert sample matches
INSERT INTO roommate_matches (seeker_id, match_id, compatibility_score, match_reasons, budget_score, lifestyle_score, location_score, academic_score, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 78.5, ARRAY['similar_budget', 'same_campus', 'compatible_schedule'], 85.0, 72.0, 90.0, 65.0, 'pending'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 65.2, ARRAY['similar_interests', 'flexible_schedule'], 70.0, 68.0, 75.0, 55.0, 'pending')
ON CONFLICT (seeker_id, match_id) DO NOTHING;

INSERT INTO friend_matches (seeker_id, match_id, compatibility_score, match_reasons, academic_score, interest_score, social_score, proximity_score, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 82.0, ARRAY['shared_interests', 'similar_year'], 75.0, 90.0, 85.0, 80.0, 'suggested'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 71.3, ARRAY['same_campus', 'compatible_schedule'], 80.0, 65.0, 70.0, 72.0, 'pending')
ON CONFLICT (seeker_id, match_id) DO NOTHING;

-- Insert sample interactions
INSERT INTO roommate_interactions (user_id, target_id, interaction_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'like'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'view')
ON CONFLICT (user_id, target_id, interaction_type) DO NOTHING;

INSERT INTO friend_interactions (user_id, target_id, interaction_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'liked'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'viewed')
ON CONFLICT (user_id, target_id, interaction_type) DO NOTHING;

-- Insert sample connections
INSERT INTO friend_connections (user_a, user_b, connection_type)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'friend')
ON CONFLICT (user_a, user_b) DO NOTHING;
