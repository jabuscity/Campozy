-- Seed data for matching features
-- Run this via: supabase db query --linked --file supabase/seeds/seed-data.sql

-- Insert profiles
INSERT INTO profiles (id, username, full_name, bio, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', 'alice_w', 'Alice Wanjiku', 'Student at University of Nairobi. Alice enjoys coding and meeting new people.', NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', 'bob_m', 'Bob Mwangi', 'Student at University of Nairobi. Bob loves gaming and movies.', NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', 'carol_n', 'Carol Njeri', 'Student at University of Nairobi. Carol is chill and flexible.', NOW(), NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', 'david_k', 'David Kipchoge', 'Student at University of Nairobi. David is athletic and energetic.', NOW(), NOW()),
  ('bac34430-7b36-4e99-ba6a-8aa34500b10a', 'emma_a', 'Emma Achieng', 'Student at University of Nairobi. Emma is creative and expressive.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert roommate profiles
INSERT INTO roommate_profiles (student_id, bio, year_of_study, sleep_schedule, cleanliness_level, social_level, study_habits, interests, smoking_ok, pets_ok, max_roommates, campozy_score, is_active, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', 'Looking for a quiet roommate who enjoys studying.', 3, 'early_bird', 'neat', 'moderate', 'silent', ARRAY['coding', 'reading'], false, true, 2, 85, true, NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', 'Social person who loves gaming and movies.', 2, 'night_owl', 'moderate', 'extrovert', 'light_noise', ARRAY['gaming', 'movies', 'music'], false, false, 1, 72, true, NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', 'Chill student who likes flexibility.', 4, 'flexible', 'relaxed', 'introvert', 'flexible', ARRAY['art', 'photography'], true, true, 3, 68, true, NOW(), NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', 'Athletic and energetic, loves sports.', 3, 'early_bird', 'neat', 'extrovert', 'silent', ARRAY['sports', 'fitness', 'hiking'], false, false, 2, 90, true, NOW(), NOW()),
  ('bac34430-7b36-4e99-ba6a-8aa34500b10a', 'Creative mind, loves music and art.', 2, 'night_owl', 'moderate', 'moderate', 'light_noise', ARRAY['music', 'art', 'design'], false, true, 1, 78, true, NOW(), NOW())
ON CONFLICT (student_id) DO NOTHING;

-- Insert roommate preferences
INSERT INTO roommate_preferences (student_id, budget_min, budget_max, sleep_schedule, cleanliness_level, social_level, study_habits, gender_preference, smoking_ok, pets_ok, max_roommates, is_active, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', 5000, 15000, 'early_bird', 'neat', 'moderate', 'silent', 'any', false, true, 2, true, NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', 8000, 20000, 'night_owl', 'moderate', 'extrovert', 'light_noise', 'any', false, false, 1, true, NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', 3000, 10000, 'flexible', 'relaxed', 'introvert', 'flexible', 'any', true, true, 3, true, NOW(), NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', 6000, 18000, 'early_bird', 'neat', 'extrovert', 'silent', 'any', false, false, 2, true, NOW(), NOW()),
  ('bac34430-7b36-4e99-ba6a-8aa34500b10a', 4000, 12000, 'night_owl', 'moderate', 'moderate', 'light_noise', 'any', false, true, 1, true, NOW(), NOW())
ON CONFLICT (student_id) DO NOTHING;

-- Insert friend profiles
INSERT INTO friend_profiles (student_id, bio, year_of_study, personality_type, interests, hobbies, study_habits, campozy_score, is_active, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', 'Friendly and outgoing.', 3, 'extrovert', ARRAY['sports', 'music'], ARRAY['gaming', 'hiking'], 'light_noise', 90, true, NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', 'Quiet and studious.', 2, 'introvert', ARRAY['reading', 'coding'], ARRAY['chess', 'painting'], 'silent', 75, true, NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', 'Balanced personality.', 4, 'ambivert', ARRAY['travel', 'photography'], ARRAY['cooking', 'yoga'], 'flexible', 82, true, NOW(), NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', 'Athletic and team-oriented.', 3, 'extrovert', ARRAY['sports', 'fitness'], ARRAY['running', 'gaming'], 'light_noise', 88, true, NOW(), NOW()),
  ('bac34430-7b36-4e99-ba6a-8aa34500b10a', 'Creative and expressive.', 2, 'introvert', ARRAY['music', 'art'], ARRAY['drawing', 'singing'], 'flexible', 79, true, NOW(), NOW())
ON CONFLICT (student_id) DO NOTHING;

-- Insert friend preferences
INSERT INTO friend_preferences (student_id, study_together_ok, event_attendance_ok, gaming_ok, fitness_ok, is_active, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', true, true, false, true, true, NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', false, true, true, false, true, NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', true, false, true, true, true, NOW(), NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', true, true, false, true, true, NOW(), NOW()),
  ('bac34430-7b36-4e99-ba6a-8aa34500b10a', false, true, true, false, true, NOW(), NOW())
ON CONFLICT (student_id) DO NOTHING;

-- Insert roommate matches
INSERT INTO roommate_matches (seeker_id, match_id, compatibility_score, match_reasons, budget_score, lifestyle_score, location_score, academic_score, status, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', '723d8ccd-c563-4439-bd7f-88df061da74e', 78.5, ARRAY['similar_budget', 'same_campus', 'compatible_schedule'], 85.0, 72.0, 90.0, 65.0, 'pending', NOW(), NOW()),
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', '5594a361-e44d-44cc-a990-c79e2e61ed57', 65.2, ARRAY['similar_interests', 'flexible_schedule'], 70.0, 68.0, 75.0, 55.0, 'pending', NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', '99d833b8-61ef-487c-b750-984c0c4b1bff', 82.0, ARRAY['compatible_schedule', 'similar_interests'], 90.0, 80.0, 85.0, 70.0, 'pending', NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', 'bac34430-7b36-4e99-ba6a-8aa34500b10a', 71.3, ARRAY['same_campus', 'compatible_schedule'], 75.0, 70.0, 72.0, 68.0, 'pending', NOW(), NOW())
ON CONFLICT (seeker_id, match_id) DO NOTHING;

-- Insert friend matches
INSERT INTO friend_matches (seeker_id, match_id, compatibility_score, match_reasons, academic_score, interest_score, social_score, proximity_score, status, created_at, updated_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', '99d833b8-61ef-487c-b750-984c0c4b1bff', 82.0, ARRAY['shared_interests', 'similar_year'], 75.0, 90.0, 85.0, 80.0, 'suggested', NOW(), NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', '752f3dd3-4cee-4124-8d49-2fc322fed16c', 71.3, ARRAY['same_campus', 'compatible_schedule'], 80.0, 65.0, 70.0, 72.0, 'pending', NOW(), NOW()),
  ('5594a361-e44d-44cc-a990-c79e2e61ed57', 'bac34430-7b36-4e99-ba6a-8aa34500b10a', 88.5, ARRAY['similar_hobbies', 'compatible_personality'], 70.0, 95.0, 88.0, 85.0, 'suggested', NOW(), NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', '752f3dd3-4cee-4124-8d49-2fc322fed16c', 76.0, ARRAY['shared_interests', 'same_campus'], 72.0, 80.0, 75.0, 78.0, 'pending', NOW(), NOW())
ON CONFLICT (seeker_id, match_id) DO NOTHING;

-- Insert interactions
INSERT INTO roommate_interactions (user_id, target_id, interaction_type, created_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', '723d8ccd-c563-4439-bd7f-88df061da74e', 'like', NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', '752f3dd3-4cee-4124-8d49-2fc322fed16c', 'message', NOW()),
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', '99d833b8-61ef-487c-b750-984c0c4b1bff', 'like', NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', '752f3dd3-4cee-4124-8d49-2fc322fed16c', 'message', NOW())
ON CONFLICT (user_id, target_id, interaction_type) DO NOTHING;

INSERT INTO friend_interactions (user_id, target_id, interaction_type, created_at) VALUES
  ('752f3dd3-4cee-4124-8d49-2fc322fed16c', '99d833b8-61ef-487c-b750-984c0c4b1bff', 'liked', NOW()),
  ('99d833b8-61ef-487c-b750-984c0c4b1bff', '752f3dd3-4cee-4124-8d49-2fc322fed16c', 'viewed', NOW()),
  ('723d8ccd-c563-4439-bd7f-88df061da74e', '752f3dd3-4cee-4124-8d49-2fc322fed16c', 'viewed', NOW())
ON CONFLICT (user_id, target_id, interaction_type) DO NOTHING;
