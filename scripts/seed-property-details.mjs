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

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154520-3ae6c3a93289?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
];

async function seedPropertyDetails() {
  console.log('Seeding rich property details...\n');

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name')
    .limit(3);

  if (!properties || properties.length === 0) {
    console.error('No properties found. Run seed-comprehensive.mjs first.');
    process.exit(1);
  }

  const { data: amenities } = await supabase.from('amenities').select('id');
  const { data: utilities } = await supabase.from('utilities').select('id');

  for (const property of properties) {
    const { data: existingMedia } = await supabase
      .from('property_media')
      .select('url')
      .eq('property_id', property.id);

    const existingUrls = new Set((existingMedia || []).map(m => m.url));

    const mediaData = [];
    for (let idx = 0; idx < IMAGE_URLS.length; idx++) {
      const url = IMAGE_URLS[idx];
      if (existingUrls.has(url)) continue;
      mediaData.push({
        property_id: property.id,
        url,
        media_type: 'image',
        is_primary: idx === 0 && existingMedia?.length === 0,
      });
    }

    if (mediaData.length > 0) {
      const { error: mediaError } = await supabase
        .from('property_media')
        .insert(mediaData);

      if (mediaError) console.error(`Error seeding media for ${property.name}:`, mediaError.message);
      else console.log(`✓ Seeded ${mediaData.length} media items for ${property.name}`);
    }

    const roomData = [];
    const roomTypes = ['Single', 'Double', 'Triple', 'Self-contained', 'Bedsitter'];
    for (let i = 0; i < 3; i++) {
      roomData.push({
        property_id: property.id,
        room_type: roomTypes[i % roomTypes.length],
        quantity: Math.floor(Math.random() * 5) + 1,
      });
    }

    const { error: roomError } = await supabase
      .from('property_rooms')
      .insert(roomData, { onConflict: 'property_id,room_type' });

    if (roomError) console.error(`Error seeding rooms for ${property.name}:`, roomError.message);
    else console.log(`✓ Seeded ${roomData.length} rooms for ${property.name}`);

    const amenityData = [];
    if (amenities && amenities.length > 0) {
      const shuffled = amenities.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(4, shuffled.length); i++) {
        amenityData.push({
          property_id: property.id,
          amenity_id: shuffled[i].id,
        });
      }
    }

    if (amenityData.length > 0) {
      const { error: amenityError } = await supabase
        .from('property_amenities')
        .insert(amenityData, { onConflict: 'property_id,amenity_id' });

      if (amenityError) console.error(`Error seeding amenities for ${property.name}:`, amenityError.message);
      else console.log(`✓ Seeded ${amenityData.length} amenities for ${property.name}`);
    }

    const utilityData = [];
    if (utilities && utilities.length > 0) {
      const shuffled = utilities.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(3, shuffled.length); i++) {
        utilityData.push({
          property_id: property.id,
          utility_id: shuffled[i].id,
          reliability_score: Math.floor(Math.random() * 40 + 60),
        });
      }
    }

    if (utilityData.length > 0) {
      const { error: utilityError } = await supabase
        .from('property_utilities')
        .insert(utilityData, { onConflict: 'property_id,utility_id' });

      if (utilityError) console.error(`Error seeding utilities for ${property.name}:`, utilityError.message);
      else console.log(`✓ Seeded ${utilityData.length} utilities for ${property.name}`);
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        description: `A modern student hostel in ${property.name} featuring spacious rooms, 24/7 security, and a vibrant community. Perfect for students seeking comfort and convenience. Close to major campuses with easy access to public transport.`,
        monthly_price: 15000,
      })
      .eq('id', property.id);

    if (updateError) console.error(`Error updating property ${property.name}:`, updateError.message);
    else console.log(`✓ Updated property details for ${property.name}`);
  }

  console.log('\n✓ Done seeding property details');
}

seedPropertyDetails().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
