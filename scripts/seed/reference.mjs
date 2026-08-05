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

export const ids = {
  countryIds: [],
  cityIds: [],
  universityIds: [],
  campusIds: [],
  neighborhoodIds: [],
};

async function q(table, data, label) {
  try {
    await supabase.from(table).insert(data);
    console.log(`  ✓ ${label}`);
  } catch (e) {
    console.error(`  ✗ ${label}: ${e.message}`);
  }
}

async function qSelect(table, data, label) {
  try {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) {
      if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
        console.error(`  ✗ ${label}: ${error.message}`);
      }
      return null;
    }
    console.log(`  ✓ ${label}`);
    return result;
  } catch (e) {
    return null;
  }
}

export async function seedReferenceData() {
  console.log('\n=== Reference Data ===\n');

  // Countries
  const countries = [
    { name: 'Kenya', code: 'KE' },
    { name: 'Uganda', code: 'UG' },
    { name: 'Tanzania', code: 'TZ' },
  ];
  for (const c of countries) {
    const { data } = await qSelect('countries', c, `Country ${c.name}`);
    if (data) ids.countryIds.push(data.id);
  }

  // Cities
  const cities = [
    { country_id: ids.countryIds[0], name: 'Nairobi' },
    { country_id: ids.countryIds[0], name: 'Mombasa' },
    { country_id: ids.countryIds[0], name: 'Kisumu' },
    { country_id: ids.countryIds[0], name: 'Nakuru' },
    { country_id: ids.countryIds[0], name: 'Eldoret' },
    { country_id: ids.countryIds[0], name: 'Thika' },
  ];
  for (const c of cities) {
    const { data } = await qSelect('cities', c, `City ${c.name}`);
    if (data) ids.cityIds.push(data.id);
  }

  // Universities
  const universities = [
    { name: 'University of Nairobi', short_name: 'UoN', city_id: ids.cityIds[0], website: 'https://uonbi.ac.ke' },
    { name: 'Jomo Kenyatta University of Agriculture and Technology', short_name: 'JKUAT', city_id: ids.cityIds[5], website: 'https://jkuat.ac.ke' },
    { name: 'Kenyatta University', short_name: 'KU', city_id: ids.cityIds[0], website: 'https://kenyatta.ac.ke' },
    { name: 'Strathmore University', short_name: 'Strathmore', city_id: ids.cityIds[0], website: 'https://strathmore.edu' },
    { name: 'Technical University of Kenya', short_name: 'TUK', city_id: ids.cityIds[0], website: 'https://tukenya.ac.ke' },
  ];
  for (const u of universities) {
    const { data } = await qSelect('universities', u, `University ${u.short_name}`);
    if (data) ids.universityIds.push(data.id);
  }

  // Campuses
  const campuses = [
    { name: 'Main Campus', university_id: ids.universityIds[0], city_id: ids.cityIds[0], address: 'University Way, Nairobi' },
    { name: 'Main Campus', university_id: ids.universityIds[1], city_id: ids.cityIds[5], address: 'Juja, Kiambu' },
    { name: 'Main Campus', university_id: ids.universityIds[2], city_id: ids.cityIds[0], address: 'Kasarani, Nairobi' },
    { name: 'Main Campus', university_id: ids.universityIds[3], city_id: ids.cityIds[0], address: 'Madaraka Estate, Nairobi' },
  ];
  for (const c of campuses) {
    const { data } = await qSelect('campuses', c, `Campus ${c.name} @ ${c.address}`);
    if (data) ids.campusIds.push(data.id);
  }

  // Neighborhoods
  const neighborhoods = [
    { name: 'Westlands', city_id: ids.cityIds[0], description: 'Upscale area close to many universities.', reputation_score: 85 },
    { name: 'Kileleshwa', city_id: ids.cityIds[0], description: 'Quiet leafy suburb with great student housing.', reputation_score: 78 },
    { name: 'Lavington', city_id: ids.cityIds[0], description: 'Affluent neighborhood popular with expats and students.', reputation_score: 82 },
    { name: 'South B', city_id: ids.cityIds[0], description: 'Dense residential area with affordable hostels.', reputation_score: 65 },
    { name: 'Madaraka', city_id: ids.cityIds[0], description: 'Close to Strathmore University with many student hostels.', reputation_score: 80 },
    { name: 'Kasarani', city_id: ids.cityIds[0], description: 'Home to Kenyatta University and affordable housing.', reputation_score: 68 },
    { name: 'Juja', city_id: ids.cityIds[5], description: 'Student town surrounding JKUAT main campus.', reputation_score: 75 },
  ];
  for (const n of neighborhoods) {
    const { data } = await qSelect('neighborhoods', n, `Neighborhood ${n.name}`);
    if (data) ids.neighborhoodIds.push(data.id);
  }

  // Distances
  for (let i = 0; i < 15; i++) {
    await supabase.from('neighborhood_campus_distances').upsert({
      neighborhood_id: rand(ids.neighborhoodIds),
      campus_id: rand(ids.campusIds),
      distance_km: randInt(1, 20),
      walking_time_min: randInt(10, 120),
      transport_time_min: randInt(5, 60),
      transport_cost: randInt(10, 200)
    }, { onConflict: ['neighborhood_id', 'campus_id'] });
  }
  console.log('  ✓ Neighborhood-campus distances seeded');

  // Roles
  const roles = ['student', 'owner', 'scout', 'ambassador', 'employer', 'parent', 'mentor', 'alumni', 'moderator', 'admin'];
  for (const r of roles) {
    await qSelect('roles', { name: r, description: `${r} role` }, `Role ${r}`);
  }
  console.log('  ✓ Roles seeded');
}
