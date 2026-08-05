WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 10)

INSERT INTO roommate_preferences (student_id, budget_min, budget_max, preferred_campus_id, sleep_schedule, cleanliness_level, social_level, study_habits, gender_preference, smoking_ok, pets_ok, max_roommates, is_active)
SELECT id, 3000 + floor(random()*10000), 10000 + floor(random()*20000),
  (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1),
  ('{early_bird,night_owl,flexible}'::text[])[floor(random()*3+1)],
  ('{neat,moderate,relaxed}'::text[])[floor(random()*3+1)],
  ('{introvert,moderate,extrovert}'::text[])[floor(random()*3+1)],
  ('{silent,light_noise,flexible}'::text[])[floor(random()*3+1)],
  'any', random() > 0.5, random() > 0.5, floor(random()*4+1), true
FROM u WHERE id IN (SELECT id FROM profiles LIMIT 20)
ON CONFLICT (student_id) DO NOTHING;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 10)

INSERT INTO roommate_profiles (student_id, bio, year_of_study, campus_id, sleep_schedule, cleanliness_level, social_level, study_habits, interests, smoking_ok, pets_ok, max_roommates, campozy_score, is_active)
SELECT id,
  ('{Looking for a quiet roommate.,Social person who loves gaming.,Chill student who likes flexibility.,Athletic and energetic.,Creative mind.}'::text[])[floor(random()*5+1)],
  floor(random()*5+1),
  (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1),
  ('{early_bird,night_owl,flexible}'::text[])[floor(random()*3+1)],
  ('{neat,moderate,relaxed}'::text[])[floor(random()*3+1)],
  ('{introvert,moderate,extrovert}'::text[])[floor(random()*3+1)],
  ('{silent,light_noise,flexible}'::text[])[floor(random()*3+1)],
  ARRAY['coding', 'reading'],
  random() > 0.5, random() > 0.5, floor(random()*4+1), floor(random()*50+50), true
FROM u WHERE id IN (SELECT id FROM profiles LIMIT 20)
ON CONFLICT (student_id) DO NOTHING;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 10)

INSERT INTO friend_preferences (student_id, preferred_campus_id, study_together_ok, event_attendance_ok, gaming_ok, fitness_ok, is_active)
SELECT id,
  (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1),
  random() > 0.3, random() > 0.3, random() > 0.3, random() > 0.3, true
FROM u WHERE id IN (SELECT id FROM profiles LIMIT 20)
ON CONFLICT (student_id) DO NOTHING;

WITH u AS (SELECT id FROM profiles ORDER BY created_at LIMIT 25),
c AS (SELECT id FROM campuses LIMIT 10)

INSERT INTO friend_profiles (student_id, bio, year_of_study, campus_id, personality_type, interests, hobbies, study_habits, campozy_score, is_active)
SELECT id,
  ('{Friendly and outgoing.,Quiet and studious.,Balanced personality.,Athletic and team-oriented.,Creative and expressive.}'::text[])[floor(random()*5+1)],
  floor(random()*5+1),
  (SELECT id FROM c OFFSET floor(random()*10) LIMIT 1),
  ('{introvert,extrovert,ambivert}'::text[])[floor(random()*3+1)],
  ARRAY['sports', 'music'],
  ARRAY['gaming', 'hiking'],
  ('{silent,light_noise,flexible}'::text[])[floor(random()*3+1)],
  floor(random()*50+50), true
FROM u WHERE id IN (SELECT id FROM profiles LIMIT 20)
ON CONFLICT (student_id) DO NOTHING;

WITH u1 AS (SELECT id FROM profiles ORDER BY created_at LIMIT 20),
u2 AS (SELECT id FROM profiles ORDER BY created_at LIMIT 20)

INSERT INTO roommate_matches (seeker_id, match_id, compatibility_score, match_reasons, budget_score, lifestyle_score, location_score, academic_score, status)
SELECT u1.id, u2.id,
  floor(random()*45+55),
  ARRAY['similar_budget', 'same_campus'],
  floor(random()*50+50), floor(random()*50+50), floor(random()*50+50), floor(random()*50+50),
  'pending'
FROM u1, u2
WHERE u1.id <> u2.id AND floor(random()*2) = 0
LIMIT 30
ON CONFLICT DO NOTHING;

WITH u1 AS (SELECT id FROM profiles ORDER BY created_at LIMIT 20),
u2 AS (SELECT id FROM profiles ORDER BY created_at LIMIT 20)

INSERT INTO friend_matches (seeker_id, match_id, compatibility_score, match_reasons, academic_score, interest_score, social_score, proximity_score, status)
SELECT u1.id, u2.id,
  floor(random()*45+55),
  ARRAY['shared_interests', 'same_campus'],
  floor(random()*50+50), floor(random()*50+50), floor(random()*50+50), floor(random()*50+50),
  'suggested'
FROM u1, u2
WHERE u1.id <> u2.id AND floor(random()*2) = 0
LIMIT 30
ON CONFLICT DO NOTHING;

SELECT 'roommate_preferences' AS tbl, count(*) AS cnt FROM roommate_preferences UNION ALL
SELECT 'roommate_profiles', count(*) FROM roommate_profiles UNION ALL
SELECT 'roommate_matches', count(*) FROM roommate_matches UNION ALL
SELECT 'friend_preferences', count(*) FROM friend_preferences UNION ALL
SELECT 'friend_profiles', count(*) FROM friend_profiles UNION ALL
SELECT 'friend_matches', count(*) FROM friend_matches;
