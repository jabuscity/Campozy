import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1].trim()] = match[2].trim();
  return acc;
}, {});

const supabase = createClient(envVars['NEXT_PUBLIC_SUPABASE_URL'], envVars['SUPABASE_SERVICE_ROLE_KEY']);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randBool = () => Math.random() > 0.5;

export async function seedMatching(profileIds, campusIds) {
  console.log('\n=== Matching (Roommate & Friend Finder) ===\n');

  const studentIds = profileIds.slice(0, 20);

  // Roommate preferences
  for (const sid of studentIds) {
    await supabase.from('roommate_preferences').insert({
      student_id: sid,
      budget_min: 3000 + randInt(0, 10) * 1000,
      budget_max: 10000 + randInt(0, 20) * 1000,
      preferred_campus_id: rand(campusIds),
      sleep_schedule: rand(['early_bird', 'night_owl', 'flexible']),
      cleanliness_level: rand(['neat', 'moderate', 'relaxed']),
      social_level: rand(['introvert', 'moderate', 'extrovert']),
      study_habits: rand(['silent', 'light_noise', 'flexible']),
      gender_preference: 'any',
      smoking_ok: randBool(),
      pets_ok: randBool(),
      max_roommates: randInt(1, 4),
      is_active: true,
    });

    await supabase.from('roommate_profiles').insert({
      student_id: sid,
      bio: `Looking for a great roommate experience. ${rand(['Quiet', 'Social', 'Balanced', 'Active'])} personality.`,
      year_of_study: randInt(1, 5),
      campus_id: rand(campusIds),
      sleep_schedule: rand(['early_bird', 'night_owl', 'flexible']),
      cleanliness_level: rand(['neat', 'moderate', 'relaxed']),
      social_level: rand(['introvert', 'moderate', 'extrovert']),
      study_habits: rand(['silent', 'light_noise', 'flexible']),
      interests: rand([['coding', 'reading'], ['gaming', 'music'], ['sports', 'fitness'], ['art', 'photography'], ['hiking', 'travel']]),
      smoking_ok: randBool(),
      pets_ok: randBool(),
      max_roommates: randInt(1, 4),
      campozy_score: randInt(50, 100),
      is_active: true,
    });

    await supabase.from('friend_preferences').insert({
      student_id: sid,
      preferred_campus_id: rand(campusIds),
      study_together_ok: randBool(),
      event_attendance_ok: randBool(),
      gaming_ok: randBool(),
      fitness_ok: randBool(),
      is_active: true,
    });

    await supabase.from('friend_profiles').insert({
      student_id: sid,
      bio: `Student looking to connect with others.`,
      year_of_study: randInt(1, 5),
      campus_id: rand(campusIds),
      personality_type: rand(['introvert', 'extrovert', 'ambivert']),
      interests: rand([['sports', 'music'], ['reading', 'coding'], ['travel', 'photography'], ['gaming', 'movies']]),
      hobbies: rand([['gaming', 'hiking'], ['chess', 'painting'], ['cooking', 'yoga'], ['running', 'drawing']]),
      study_habits: rand(['silent', 'light_noise', 'flexible']),
      campozy_score: randInt(50, 100),
      is_active: true,
    });
  }

  // Matches
  for (let i = 0; i < 20; i++) {
    const seeker = rand(studentIds);
    let match = rand(studentIds);
    while (match === seeker) match = rand(studentIds);

    await supabase.from('roommate_matches').insert({
      seeker_id: seeker,
      match_id: match,
      compatibility_score: randInt(50, 95),
      match_reasons: rand([['similar_budget', 'same_campus'], ['similar_interests'], ['compatible_schedule']]),
      budget_score: randInt(50, 100),
      lifestyle_score: randInt(50, 100),
      location_score: randInt(50, 100),
      academic_score: randInt(50, 100),
      status: rand(['pending', 'viewed', 'liked', 'matched']),
    });

    await supabase.from('friend_matches').insert({
      seeker_id: seeker,
      match_id: match,
      compatibility_score: randInt(50, 95),
      match_reasons: rand([['shared_interests'], ['same_campus', 'compatible_schedule'], ['similar_hobbies']]),
      academic_score: randInt(50, 100),
      interest_score: randInt(50, 100),
      social_score: randInt(50, 100),
      proximity_score: randInt(50, 100),
      status: rand(['suggested', 'pending', 'connected']),
    });
  }

  console.log('  ✓ Matching data seeded');
}
