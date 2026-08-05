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

export async function seedNotifications(profileIds, campusIds) {
  console.log('\n=== Notifications & Events ===\n');

  for (let i = 0; i < 30; i++) {
    await supabase.from('notifications').insert({
      user_id: rand(profileIds),
      type: rand(['message', 'review', 'opportunity', 'system', 'verification', 'alert']),
      title: rand(['New message received', 'Property review update', 'New opportunity posted', 'System notification', 'Verification complete']),
      content: 'You have a new notification on Campozy.',
      link: '/dashboard',
      is_read: randBool(),
    });
  }
  console.log('  ✓ Notifications seeded');

  for (let i = 0; i < 15; i++) {
    await supabase.from('events').insert({
      title: rand(['Campus Career Fair', 'Student Orientation', 'Sports Day', 'Tech Talk', 'Networking Night']),
      description: 'Join us for this exciting campus event.',
      event_type: rand(['academic', 'social', 'sports', 'career', 'cultural']),
      location: rand(['Main Hall', 'Sports Field', 'Auditorium', 'Online', 'Campus Grounds']),
      start_time: new Date(Date.now() + randInt(1, 30) * 86400000).toISOString(),
      end_time: new Date(Date.now() + randInt(1, 30) * 86400000 + 7200000).toISOString(),
      campus_id: rand(campusIds),
      organizer_id: rand(profileIds),
      max_attendees: randInt(50, 500),
      is_public: true,
    });
  }
  console.log('  ✓ Events seeded');
}

export async function seedScoutsAmbassadorsFounders(profileIds, campusIds) {
  console.log('\n=== Scouts, Ambassadors, Founders ===\n');

  const scouts = profileIds.filter(p => true).slice(0, 5);
  for (const sid of scouts) {
    await supabase.from('scouts').insert({ user_id: sid, region: 'Nairobi', is_active: true });
  }
  console.log('  ✓ Scouts seeded');

  for (let i = 0; i < 5; i++) {
    const { data: program } = await supabase.from('ambassador_programs').insert({
      campus_id: rand(campusIds),
      name: `Ambassador Program ${i + 1}`,
      description: 'Student ambassador program',
      is_active: true,
    }).select().single();

    if (program) {
      await supabase.from('ambassadors').insert({ user_id: rand(profileIds), program_id: program.id, is_active: true });
    }
  }
  console.log('  ✓ Ambassadors seeded');

  const { data: cohort } = await supabase.from('founder_cohorts').insert({
    name: 'Campus Pioneer Cohort',
    scope: 'campus',
    campus_id: rand(campusIds),
    description: 'First cohort of campus founders',
    is_active: true,
  }).select().single();

  if (cohort) {
    for (let i = 0; i < 5; i++) {
      await supabase.from('founder_memberships').insert({ cohort_id: cohort.id, user_id: rand(profileIds), role: 'member' });
    }
  }
  console.log('  ✓ Founders seeded');
}

export async function seedUtilityAndHygiene(propertyIds, profileIds, utilityTypeIds, neighborhoodIds) {
  console.log('\n=== Utility Incidents & Hygiene Reports ===\n');

  for (let i = 0; i < 20; i++) {
    await supabase.from('utility_incidents').insert({
      property_id: rand(propertyIds) || null,
      utility_type_id: rand(utilityTypeIds),
      reported_by: rand(profileIds),
      title: rand(['KPLC Outage', 'Water Shortage', 'Internet Down', 'Sewage Blockage']),
      description: 'Reported by a student in the area.',
      severity: rand(['low', 'medium', 'high']),
      location_type: 'property',
      location_description: rand(['Madaraka Estate', 'Westlands', 'Juja', 'Kasarani', 'Parklands']),
      resolved_at: randBool() ? new Date(Date.now() - randInt(1, 7) * 86400000).toISOString() : null,
    });
  }
  console.log('  ✓ Utility incidents seeded');

  const hygieneCategoryIds = [];
  for (const h of ['Restrooms', 'Kitchen', 'Common Areas', 'Bedrooms', 'Outdoor Spaces', 'Waste Management']) {
    const { data } = await supabase.from('hygiene_categories').upsert({ name: h }, { onConflict: 'name' }).select().single();
    if (data) hygieneCategoryIds.push(data.id);
  }

  for (let i = 0; i < 30; i++) {
    await supabase.from('hygiene_reports').insert({
      property_id: rand(propertyIds),
      user_id: rand(profileIds),
      category_id: rand(hygieneCategoryIds),
      score: randInt(1, 5),
      comment: rand(['Clean', 'Could be better', 'Needs improvement', 'Well maintained']),
    });
  }
  console.log('  ✓ Hygiene reports seeded');

  for (let i = 0; i < 20; i++) {
    await supabase.from('neighborhood_reviews').insert({
      neighborhood_id: rand(neighborhoodIds),
      user_id: rand(profileIds),
      rating: randInt(3, 5),
      content: rand(['Great neighborhood for students.', 'Good transport links.', 'Affordable and peaceful.', 'Nice area but a bit far from campus.']),
      safety_rating: randInt(3, 5),
      transport_rating: randInt(3, 5),
      amenities_rating: randInt(3, 5),
    });
  }
  console.log('  ✓ Neighborhood reviews seeded');
}

export async function seedMessaging(profileIds) {
  console.log('\n=== Messaging ===\n');

  for (let i = 0; i < 20; i++) {
    const a = rand(profileIds);
    let b = rand(profileIds);
    while (b === a) b = rand(profileIds);

    await supabase.from('conversations').insert({
      participant_a: a,
      participant_b: b,
      last_message_at: new Date(Date.now() - randInt(0, 7) * 86400000).toISOString(),
      is_active: true,
    });
  }
  console.log('  ✓ Conversations seeded');
}

export async function seedMessages(profileIds) {
  console.log('\n=== Messages ===\n');

  const conversations = await supabase.from('conversations').select('id').limit(20);
  if (conversations.data) {
    for (const conv of conversations.data) {
      for (let m = 0; m < randInt(2, 10); m++) {
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          sender_id: rand(profileIds),
          content: rand(['Hey, how are you?', 'Did you see the new housing listing?', 'Let us meet up!', 'Thanks for the help.']),
          is_read: randBool(),
        });
      }
    }
  }
  console.log('  ✓ Messages seeded');
}

function randBool() { return Math.random() > 0.5; }
