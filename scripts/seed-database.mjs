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

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seedDatabase() {
  console.log('Seeding database with test data...\n');

  const testUsers = [
    { email: 'alice@university.ac', password: 'password123', fullName: 'Alice Wanjiku', username: 'alice_w' },
    { email: 'bob@university.ac', password: 'password123', fullName: 'Bob Mwangi', username: 'bob_m' },
    { email: 'carol@university.ac', password: 'password123', fullName: 'Carol Njeri', username: 'carol_n' },
    { email: 'david@university.ac', password: 'password123', fullName: 'David Kipchoge', username: 'david_k' },
    { email: 'emma@university.ac', password: 'password123', fullName: 'Emma Achieng', username: 'emma_a' },
  ];

  const userIds = [];

  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        username: user.username,
      }
    });

    if (error && error.message.includes('already been registered')) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const found = existingUser?.users.find(u => u.email === user.email);
      if (found) {
        userIds.push(found.id);
        console.log(`~ User already exists: ${user.email} (${found.id})`);
        continue;
      }
    }

    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
      continue;
    }

    if (data.user) {
      userIds.push(data.user.id);
      console.log(`✓ Created user: ${user.email} (${data.user.id})`);
    }
  }

  console.log(`\nProcessing ${userIds.length} users...\n`);

  // Create profiles
  for (let i = 0; i < userIds.length; i++) {
    const user = testUsers[i];
    const { error } = await supabase.from('profiles').upsert({
      id: userIds[i],
      username: user.username,
      full_name: user.fullName,
      bio: `Student at University of Nairobi. ${user.fullName.split(' ')[0]} enjoys coding and meeting new people.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`Error creating profile for ${user.email}:`, error.message);
    } else {
      console.log(`✓ Created profile for ${user.fullName}`);
    }
  }

  // Create roommate profiles
  const roommateProfiles = [
    { student_id: userIds[0], bio: 'Looking for a quiet roommate who enjoys studying.', year_of_study: 3, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'moderate', study_habits: 'silent', interests: ['coding', 'reading'], smoking_ok: false, pets_ok: true, max_roommates: 2, campozy_score: 85 },
    { student_id: userIds[1], bio: 'Social person who loves gaming and movies.', year_of_study: 2, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'extrovert', study_habits: 'light_noise', interests: ['gaming', 'movies', 'music'], smoking_ok: false, pets_ok: false, max_roommates: 1, campozy_score: 72 },
    { student_id: userIds[2], bio: 'Chill student who likes flexibility.', year_of_study: 4, sleep_schedule: 'flexible', cleanliness_level: 'relaxed', social_level: 'introvert', study_habits: 'flexible', interests: ['art', 'photography'], smoking_ok: true, pets_ok: true, max_roommates: 3, campozy_score: 68 },
    { student_id: userIds[3], bio: 'Athletic and energetic, loves sports.', year_of_study: 3, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'extrovert', study_habits: 'silent', interests: ['sports', 'fitness', 'hiking'], smoking_ok: false, pets_ok: false, max_roommates: 2, campozy_score: 90 },
    { student_id: userIds[4], bio: 'Creative mind, loves music and art.', year_of_study: 2, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'moderate', study_habits: 'light_noise', interests: ['music', 'art', 'design'], smoking_ok: false, pets_ok: true, max_roommates: 1, campozy_score: 78 },
  ];

  for (const profile of roommateProfiles) {
    const { error } = await supabase.from('roommate_profiles').upsert(profile);
    if (error) {
      console.error(`Error creating roommate profile for ${profile.student_id}:`, error.message);
    } else {
      console.log(`✓ Created roommate profile for ${profile.student_id}`);
    }
  }

  // Create roommate preferences
  const roommatePreferences = [
    { student_id: userIds[0], budget_min: 5000, budget_max: 15000, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'moderate', study_habits: 'silent', gender_preference: 'any', smoking_ok: false, pets_ok: true, max_roommates: 2 },
    { student_id: userIds[1], budget_min: 8000, budget_max: 20000, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'extrovert', study_habits: 'light_noise', gender_preference: 'any', smoking_ok: false, pets_ok: false, max_roommates: 1 },
    { student_id: userIds[2], budget_min: 3000, budget_max: 10000, sleep_schedule: 'flexible', cleanliness_level: 'relaxed', social_level: 'introvert', study_habits: 'flexible', gender_preference: 'any', smoking_ok: true, pets_ok: true, max_roommates: 3 },
    { student_id: userIds[3], budget_min: 6000, budget_max: 18000, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'extrovert', study_habits: 'silent', gender_preference: 'any', smoking_ok: false, pets_ok: false, max_roommates: 2 },
    { student_id: userIds[4], budget_min: 4000, budget_max: 12000, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'moderate', study_habits: 'light_noise', gender_preference: 'any', smoking_ok: false, pets_ok: true, max_roommates: 1 },
  ];

  for (const pref of roommatePreferences) {
    const { error } = await supabase.from('roommate_preferences').upsert(pref);
    if (error) {
      console.error(`Error creating roommate preference for ${pref.student_id}:`, error.message);
    } else {
      console.log(`✓ Created roommate preference for ${pref.student_id}`);
    }
  }

  // Create friend profiles
  const friendProfiles = [
    { student_id: userIds[0], bio: 'Friendly and outgoing.', year_of_study: 3, personality_type: 'extrovert', interests: ['sports', 'music'], hobbies: ['gaming', 'hiking'], study_habits: 'light_noise', campozy_score: 90 },
    { student_id: userIds[1], bio: 'Quiet and studious.', year_of_study: 2, personality_type: 'introvert', interests: ['reading', 'coding'], hobbies: ['chess', 'painting'], study_habits: 'silent', campozy_score: 75 },
    { student_id: userIds[2], bio: 'Balanced personality.', year_of_study: 4, personality_type: 'ambivert', interests: ['travel', 'photography'], hobbies: ['cooking', 'yoga'], study_habits: 'flexible', campozy_score: 82 },
    { student_id: userIds[3], bio: 'Athletic and team-oriented.', year_of_study: 3, personality_type: 'extrovert', interests: ['sports', 'fitness'], hobbies: ['running', 'gaming'], study_habits: 'light_noise', campozy_score: 88 },
    { student_id: userIds[4], bio: 'Creative and expressive.', year_of_study: 2, personality_type: 'introvert', interests: ['music', 'art'], hobbies: ['drawing', 'singing'], study_habits: 'flexible', campozy_score: 79 },
  ];

  for (const profile of friendProfiles) {
    const { error } = await supabase.from('friend_profiles').upsert(profile);
    if (error) {
      console.error(`Error creating friend profile for ${profile.student_id}:`, error.message);
    } else {
      console.log(`✓ Created friend profile for ${profile.student_id}`);
    }
  }

  // Create friend preferences
  const friendPreferences = [
    { student_id: userIds[0], study_together_ok: true, event_attendance_ok: true, gaming_ok: false, fitness_ok: true },
    { student_id: userIds[1], study_together_ok: false, event_attendance_ok: true, gaming_ok: true, fitness_ok: false },
    { student_id: userIds[2], study_together_ok: true, event_attendance_ok: false, gaming_ok: true, fitness_ok: true },
    { student_id: userIds[3], study_together_ok: true, event_attendance_ok: true, gaming_ok: false, fitness_ok: true },
    { student_id: userIds[4], study_together_ok: false, event_attendance_ok: true, gaming_ok: true, fitness_ok: false },
  ];

  for (const pref of friendPreferences) {
    const { error } = await supabase.from('friend_preferences').upsert(pref);
    if (error) {
      console.error(`Error creating friend preference for ${pref.student_id}:`, error.message);
    } else {
      console.log(`✓ Created friend preference for ${pref.student_id}`);
    }
  }

  // Create roommate matches
  const roommateMatches = [
    { seeker_id: userIds[0], match_id: userIds[1], compatibility_score: 78.5, match_reasons: ['similar_budget', 'same_campus', 'compatible_schedule'], budget_score: 85.0, lifestyle_score: 72.0, location_score: 90.0, academic_score: 65.0, status: 'pending' },
    { seeker_id: userIds[0], match_id: userIds[2], compatibility_score: 65.2, match_reasons: ['similar_interests', 'flexible_schedule'], budget_score: 70.0, lifestyle_score: 68.0, location_score: 75.0, academic_score: 55.0, status: 'pending' },
    { seeker_id: userIds[1], match_id: userIds[3], compatibility_score: 82.0, match_reasons: ['compatible_schedule', 'similar_interests'], budget_score: 90.0, lifestyle_score: 80.0, location_score: 85.0, academic_score: 70.0, status: 'pending' },
    { seeker_id: userIds[2], match_id: userIds[4], compatibility_score: 71.3, match_reasons: ['same_campus', 'compatible_schedule'], budget_score: 75.0, lifestyle_score: 70.0, location_score: 72.0, academic_score: 68.0, status: 'pending' },
  ];

  for (const match of roommateMatches) {
    const { error } = await supabase.from('roommate_matches').upsert(match);
    if (error) {
      console.error(`Error creating roommate match:`, error.message);
    } else {
      console.log(`✓ Created roommate match`);
    }
  }

  // Create friend matches
  const friendMatches = [
    { seeker_id: userIds[0], match_id: userIds[3], compatibility_score: 82.0, match_reasons: ['shared_interests', 'similar_year'], academic_score: 75.0, interest_score: 90.0, social_score: 85.0, proximity_score: 80.0, status: 'suggested' },
    { seeker_id: userIds[1], match_id: userIds[0], compatibility_score: 71.3, match_reasons: ['same_campus', 'compatible_schedule'], academic_score: 80.0, interest_score: 65.0, social_score: 70.0, proximity_score: 72.0, status: 'pending' },
    { seeker_id: userIds[2], match_id: userIds[4], compatibility_score: 88.5, match_reasons: ['similar_hobbies', 'compatible_personality'], academic_score: 70.0, interest_score: 95.0, social_score: 88.0, proximity_score: 85.0, status: 'suggested' },
    { seeker_id: userIds[3], match_id: userIds[0], compatibility_score: 76.0, match_reasons: ['shared_interests', 'same_campus'], academic_score: 72.0, interest_score: 80.0, social_score: 75.0, proximity_score: 78.0, status: 'pending' },
  ];

  for (const match of friendMatches) {
    const { error } = await supabase.from('friend_matches').upsert(match);
    if (error) {
      console.error(`Error creating friend match:`, error.message);
    } else {
      console.log(`✓ Created friend match`);
    }
  }

  // Create some interactions
  const interactions = [
    { user_id: userIds[0], target_id: userIds[1], interaction_type: 'like' },
    { user_id: userIds[1], target_id: userIds[0], interaction_type: 'message' },
    { user_id: userIds[0], target_id: userIds[3], interaction_type: 'like' },
    { user_id: userIds[3], target_id: userIds[0], interaction_type: 'message' },
  ];

  for (const interaction of interactions) {
    const { error } = await supabase.from('roommate_interactions').upsert(interaction);
    if (error) {
      console.error(`Error creating interaction:`, error.message);
    } else {
      console.log(`✓ Created roommate interaction`);
    }
  }

  const friendInteractions = [
    { user_id: userIds[0], target_id: userIds[3], interaction_type: 'liked' },
    { user_id: userIds[3], target_id: userIds[0], interaction_type: 'viewed' },
    { user_id: userIds[1], target_id: userIds[0], interaction_type: 'viewed' },
  ];

  for (const interaction of friendInteractions) {
    const { error } = await supabase.from('friend_interactions').upsert(interaction);
    if (error) {
      console.error(`Error creating friend interaction:`, error.message);
    } else {
      console.log(`✓ Created friend interaction`);
    }
  }

  console.log('\n✓ Database seeded successfully!');
  console.log('\nTest accounts:');
  testUsers.forEach(u => {
    console.log(`  ${u.email} / ${u.password}`);
  });
}

seedDatabase().catch(console.error);
