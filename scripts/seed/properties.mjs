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

export async function seedProperties(profileIds, neighborhoodIds, propertyTypeIds, amenityIds, utilityIds, utilityTypeIds) {
  console.log('\n=== Properties ===\n');

  const HOSTEL_NAMES = [
    'The Westlands Residency', 'Kileleshwa Heights', 'Lavington Suites', 'South B Student Hostel',
    'Madaraka Estate Residences', 'Juja Student Town', 'Kasarani Student Lodge', 'Parklands Plaza',
    'Kilimani Studios', 'Kawangware Community Hostel', 'Ruiru Junction Hostel', 'Embakassi Student Hub',
    'Chiromo Student Apartments', 'Lower Kabete Hostel', 'Thika Student Residence',
    'Strathmore Residency', 'JKUAT Gateway Hostel', 'KU Student Lodge', 'TUK Towers', 'MMU Student Haven'
  ];

  const ROOM_TYPES = ['Single', 'Double', 'Triple', 'Self-contained', 'Bedsitter'];
  const photos = [
    '1522708323590-d24dbb6b0267', '1560518883-ce09059eeffa', '1502672260266-1c1ef2d93688',
    '1493809842364-b788880f84be', '1560448204-e02f11c3d0e2', '1560185007-cde436f6f4be',
    '1522771739844-6a9f6d5f43d6', '1512917772890-aee59a4d1a3c', '1505693416388-ac5ce068fe85',
    '1600585154520-3ae6c3a93289'
  ];

  for (let i = 0; i < 25; i++) {
    const property = {
      owner_id: rand(profileIds.slice(0, 8)),
      neighborhood_id: rand(neighborhoodIds),
      property_type_id: rand(propertyTypeIds),
      name: HOSTEL_NAMES[i] || `Student Hostel ${i + 1}`,
      description: `A well maintained ${['hostel', 'apartment', 'studio', 'boarding'][randInt(0, 3)]} in ${rand(neighborhoodIds).name}. Close to campus with excellent amenities.`,
      address: `${randInt(1, 200)} ${rand(neighborhoodIds).name} Road, Nairobi`,
      location_lat: -1.2 + (Math.random() - 0.5) * 0.5,
      location_lng: 36.8 + (Math.random() - 0.5) * 0.5,
      monthly_price: 5000 + randInt(0, 15) * 2000,
      currency: 'KES',
      status: rand(['active', 'pending', 'active', 'active']),
      verification_level: rand(['unverified', 'claimed', 'community_verified', 'scout_verified', 'campozy_verified']),
      campozy_score: randInt(40, 100),
      is_active: true,
    };

    const { data: prop } = await supabase.from('properties').insert(property).select().single();
    if (!prop) continue;

    console.log(`  ✓ Property: ${prop.name}`);

    // Rooms
    for (let r = 0; r < randInt(2, 6); r++) {
      await supabase.from('property_rooms').insert({
        property_id: prop.id,
        room_type: rand(ROOM_TYPES),
        quantity: randInt(1, 10),
        price_per_month: 5000 + randInt(0, 15) * 1000,
        price_per_semester: 20000 + randInt(0, 40) * 5000,
        is_available: randBool(),
        capacity: randInt(1, 4),
      });
    }

    // Media
    await supabase.from('property_media').insert({
      property_id: prop.id,
      url: `https://images.unsplash.com/photo-${photos[i % photos.length]}?auto=format&fit=crop&q=80&w=800`,
      media_type: 'image',
      is_primary: true,
    });
    for (let m = 0; m < randInt(2, 5); m++) {
      await supabase.from('property_media').insert({
        property_id: prop.id,
        url: `https://images.unsplash.com/photo-${photos[(i + m + 1) % photos.length]}?auto=format&fit=crop&q=80&w=600`,
        media_type: 'image',
        is_primary: false,
      });
    }

    // Amenities
    const shuffled = [...amenityIds].sort(() => Math.random() - 0.5);
    for (let a = 0; a < randInt(4, 8); a++) {
      await supabase.from('property_amenities').insert({ property_id: prop.id, amenity_id: shuffled[a] });
    }

    // Utilities
    for (const utilId of utilityIds) {
      await supabase.from('property_utilities').insert({ property_id: prop.id, utility_id: utilId, reliability_score: randInt(50, 100) });
    }

    // Reviews
    for (let rv = 0; rv < randInt(3, 8); rv++) {
      await supabase.from('property_reviews').insert({
        property_id: prop.id,
        reviewer_id: rand(profileIds),
        overall_rating: randInt(3, 5),
        safety_rating: randInt(3, 5),
        hygiene_rating: randInt(3, 5),
        water_rating: randInt(3, 5),
        electricity_rating: randInt(3, 5),
        internet_rating: randInt(3, 5),
        management_rating: randInt(3, 5),
        accessibility_rating: randInt(3, 5),
        value_for_money_rating: randInt(3, 5),
        content: rand([
          'Great place to stay! Very secure and clean.',
          'Management is responsive and the amenities are top notch.',
          'Good value for money. Close to campus.',
          'Water issues sometimes but overall good.',
          'Excellent internet and study environment.',
        ]),
      });
    }
  }

  console.log('  ✓ Properties seeded');
}
