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
  console.log('Seeding database with comprehensive test data...\n');

  // ============================================
  // 1. CREATE USERS
  // ============================================
  console.log('--- Creating users ---');
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
        console.log(`~ User already exists: ${user.email}`);
        continue;
      }
    }

    if (error) {
      console.error(`Error creating user ${user.email}:`, error.message);
      continue;
    }

    if (data.user) {
      userIds.push(data.user.id);
      console.log(`✓ Created user: ${user.email}`);
    }
  }

  if (userIds.length === 0) {
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const found = existingUser?.users.find(u => testUsers.some(tu => tu.email === u.email));
    if (found) {
      userIds.push(found.id);
      console.log(`~ Using existing user: ${found.email}`);
    }
  }

  if (userIds.length < 5) {
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    for (const u of existingUser?.users || []) {
      const match = testUsers.find(tu => tu.email === u.email);
      if (match && !userIds.includes(u.id)) {
        userIds.push(u.id);
        console.log(`~ Recovered user: ${u.email}`);
      }
    }
  }

  console.log(`\nProcessing ${userIds.length} users...\n`);

  // ============================================
  // 2. CREATE PROFILES
  // ============================================
  console.log('--- Creating profiles ---');
  for (let i = 0; i < userIds.length; i++) {
    const user = testUsers[i];
    const { error } = await supabase.from('profiles').upsert({
      id: userIds[i],
      username: user.username,
      full_name: user.fullName,
      bio: `Student at University of Nairobi. ${user.fullName.split(' ')[0]} enjoys coding and meeting new people.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (error) {
      console.error(`Error creating profile for ${user.email}:`, error.message);
    } else {
      console.log(`✓ Created profile for ${user.fullName}`);
    }
  }

  // ============================================
  // 3. CREATE REFERENCE DATA
  // ============================================
  console.log('\n--- Creating reference data ---');

  // Property types
  const { error: ptError } = await supabase.from('property_types').upsert(
    [
      { name: 'Hostel', description: 'Student hostel' },
      { name: 'Apartment', description: 'Student apartment' },
      { name: 'Studio', description: 'Studio apartment' },
      { name: 'Boarding', description: 'Boarding house' },
    ],
    { onConflict: 'name' }
  );
  if (ptError) console.error('Error seeding property types:', ptError);
  else console.log('✓ Seeded property types');

  // Amenities
  const { error: amError } = await supabase.from('amenities').upsert(
    [
      { name: 'Wi-Fi', category: 'general' },
      { name: 'Parking', category: 'general' },
      { name: 'Security', category: 'general' },
      { name: 'Generator', category: 'general' },
      { name: 'Borehole', category: 'general' },
      { name: 'CCTV', category: 'general' },
      { name: 'Swimming Pool', category: 'general' },
      { name: 'Gym', category: 'general' },
      { name: 'Laundry', category: 'general' },
      { name: 'Study Room', category: 'general' },
    ],
    { onConflict: 'name' }
  );
  if (amError) console.error('Error seeding amenities:', amError);
  else console.log('✓ Seeded amenities');

  // Utility types
  const { error: utError } = await supabase.from('utility_types').upsert(
    [
      { name: 'electricity', icon: 'zap' },
      { name: 'water', icon: 'droplet' },
      { name: 'internet', icon: 'wifi' },
      { name: 'gas', icon: 'flame' },
      { name: 'sewage', icon: 'wind' },
      { name: 'waste collection', icon: 'trash' },
    ],
    { onConflict: 'name' }
  );
  if (utError) console.error('Error seeding utility types:', utError);
  else console.log('✓ Seeded utility types');

  // Discussion categories
  const { error: dcError } = await supabase.from('discussion_categories').upsert(
    [
      { name: 'General', description: 'General campus discussions' },
      { name: 'Academics', description: 'Academic advice' },
      { name: 'Hostels', description: 'Hostel life' },
      { name: 'Campus Life', description: 'Student life' },
      { name: 'Careers', description: 'Jobs and careers' },
    ],
    { onConflict: 'name' }
  );
  if (dcError) console.error('Error seeding discussion categories:', dcError);
  else console.log('✓ Seeded discussion categories');

  // Hygiene categories
  const { error: hcError } = await supabase.from('hygiene_categories').upsert(
    [
      { name: 'cleanliness' },
      { name: 'pest control' },
      { name: 'waste management' },
      { name: 'water quality' },
      { name: 'air quality' },
      { name: 'sanitation' },
    ],
    { onConflict: 'name' }
  );
  if (hcError) console.error('Error seeding hygiene categories:', hcError);
  else console.log('✓ Seeded hygiene categories');

  // ============================================
  // 4. CREATE CAMPUSES AND NEIGHBORHOODS
  // ============================================
  console.log('\n--- Creating campuses and neighborhoods ---');

  // Get or create country
  let countryId = null;
  const { data: countries } = await supabase.from('countries').select('id').eq('code', 'KE').single();
  if (countries?.id) {
    countryId = countries.id;
  } else {
    const { data: newCountry } = await supabase.from('countries').insert({ name: 'Kenya', code: 'KE' }).select('id').single();
    countryId = newCountry?.id;
  }

  // Create cities
  const { data: nairobi } = await supabase.from('cities').upsert({ country_id: countryId, name: 'Nairobi' }, { onConflict: 'country_id, name' }).select('id').single();
  const { data: thika } = await supabase.from('cities').upsert({ country_id: countryId, name: 'Thika' }, { onConflict: 'country_id, name' }).select('id').single();

  // Create universities
  const { data: universities } = await supabase.from('universities').upsert([
    { name: 'University of Nairobi', city_id: nairobi?.id },
    { name: 'JKUAT', city_id: thika?.id },
    { name: 'Kenyatta University', city_id: nairobi?.id },
    { name: 'Strathmore University', city_id: nairobi?.id },
    { name: 'Technical University of Kenya', city_id: nairobi?.id },
  ], { onConflict: 'name' }).select('id, name');

  const uniMap = new Map(universities?.map(u => [u.name, u.id]) || []);

  // Create campuses
  const { data: campuses } = await supabase.from('campuses').upsert([
    { name: 'Main Campus', university_id: uniMap.get('University of Nairobi'), city_id: nairobi?.id, address: 'University Way, Nairobi' },
    { name: 'Main Campus', university_id: uniMap.get('JKUAT'), city_id: thika?.id, address: 'Juja, Kiambu' },
    { name: 'Main Campus', university_id: uniMap.get('Kenyatta University'), city_id: nairobi?.id, address: 'Kasarani, Nairobi' },
    { name: 'Main Campus', university_id: uniMap.get('Strathmore University'), city_id: nairobi?.id, address: 'Madaraka Estate, Nairobi' },
    { name: 'Main Campus', university_id: uniMap.get('Technical University of Kenya'), city_id: nairobi?.id, address: 'Haile Selassie Avenue, Nairobi' },
  ], { onConflict: 'university_id, city_id, name' }).select('id, university_id');

  const campusMap = new Map(campuses?.map(c => [c.university_id, c.id]) || []);

  // Create student records for test users
  console.log('\n--- Creating student records ---');
  const campusIds = campuses?.map(c => c.id) || [];
  for (let i = 0; i < userIds.length; i++) {
    const studentRecord = {
      id: userIds[i],
      campus_id: campusIds[i % campusIds.length] || null,
      enrollment_year: 2022 + (i % 4),
      graduation_year: 2026 + (i % 4),
      campozy_score: Math.floor(Math.random() * 60 + 40),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { error: studentError } = await supabase.from('students').upsert(studentRecord, { onConflict: 'id' });
    if (studentError) {
      console.error(`Error creating student record for ${testUsers[i].email}:`, studentError.message);
    } else {
      console.log(`✓ Created student record for ${testUsers[i].fullName}`);
    }
  }

  // Create neighborhoods
  const { data: neighborhoods } = await supabase.from('neighborhoods').upsert([
    { name: 'Westlands', city_id: nairobi?.id, description: 'Upscale area.', reputation_score: 85 },
    { name: 'Kileleshwa', city_id: nairobi?.id, description: 'Quiet leafy suburb.', reputation_score: 78 },
    { name: 'Lavington', city_id: nairobi?.id, description: 'Affluent neighborhood.', reputation_score: 82 },
    { name: 'South B', city_id: nairobi?.id, description: 'Affordable hostels.', reputation_score: 65 },
    { name: 'Madaraka', city_id: nairobi?.id, description: 'Close to Strathmore.', reputation_score: 80 },
    { name: 'Kasarani', city_id: nairobi?.id, description: 'Home to KU.', reputation_score: 68 },
    { name: 'Juja', city_id: thika?.id, description: 'Student town.', reputation_score: 75 },
    { name: 'Parklands', city_id: nairobi?.id, description: 'Central Nairobi.', reputation_score: 76 },
    { name: 'Kilimani', city_id: nairobi?.id, description: 'Modern apartments.', reputation_score: 81 },
    { name: 'Kawangware', city_id: nairobi?.id, description: 'Budget-friendly.', reputation_score: 62 },
  ], { onConflict: 'city_id, name' }).select('id, name');

  console.log('Neighborhoods from upsert:', neighborhoods?.length || 0);

  let neighborhoodsList = neighborhoods;
  if (!neighborhoodsList || neighborhoodsList.length === 0) {
    const { data: fetched } = await supabase.from('neighborhoods').select('id, name');
    neighborhoodsList = fetched || [];
  }
  console.log('NeighborhoodsList:', neighborhoodsList?.length || 0);

  const neighborhoodMap = new Map(neighborhoodsList?.map(n => [n.name, n.id]) || []);

  // Create distances
  const distanceData = [];
  if (campuses && neighborhoodsList) {
    for (const c of campuses) {
      for (const n of neighborhoodsList) {
        distanceData.push({
          neighborhood_id: n.id,
          campus_id: c.id,
          distance_km: Math.round((Math.random() * 20 + 1) * 100) / 100,
          walking_time_min: Math.floor(Math.random() * 120 + 10),
          transport_time_min: Math.floor(Math.random() * 60 + 5),
          transport_cost: Math.floor(Math.random() * 200 + 10),
        });
      }
    }
  }
  if (distanceData.length > 0) {
    const { error: distError } = await supabase.from('neighborhood_campus_distances').upsert(distanceData, { onConflict: 'neighborhood_id, campus_id' });
    if (distError) console.error('Error seeding distances:', distError);
    else console.log(`✓ Seeded ${distanceData.length} campus-neighborhood distances`);
  }

  console.log('✓ Seeded campuses and neighborhoods');

  // ============================================
  // 5. CREATE PROPERTIES
  // ============================================
  console.log('\n--- Creating properties ---');

  const { data: propertyTypes } = await supabase.from('property_types').select('id, name');
  const propertyTypeMap = new Map(propertyTypes?.map(pt => [pt.name, pt.id]) || []);

  const propertyNames = [
    'The Westlands Residency', 'Kileleshwa Heights', 'Lavington Suites', 'South B Student Hostel',
    'Madaraka Estate Residences', 'Juja Student Town', 'Kasarani Student Lodge', 'Parklands Plaza',
    'Kilimani Studios', 'Kawangware Community Hostel', 'Ruiru Junction Hostel', 'Embakassi Student Hub',
    'Chiromo Student Apartments', 'Lower Kabete Hostel', 'Thika Student Residence', 'Strathmore Residency',
    'JKUAT Gateway Hostel', 'KU Student Lodge', 'TUK Towers', 'MMU Student Haven',
    'UoN International Hostel', 'Kiambu Student Village', 'Mombasa Road Apartments', 'Ngong Road Suites',
    'Riverbank Hostel'
  ];

  const propertyData = propertyNames.map((name, i) => {
    const neighborhood = neighborhoodsList?.[i % (neighborhoodsList?.length || 1)];
    const propertyType = propertyTypes?.[i % (propertyTypes?.length || 1)];
    return {
      name,
      description: `A well maintained student hostel in ${neighborhood?.name || 'Nairobi'}. Close to campus with excellent amenities.`,
      address: `${Math.floor(Math.random() * 200 + 1)} Nairobi Road`,
      neighborhood_id: neighborhood?.id,
      property_type_id: propertyType?.id,
      owner_id: userIds[0] || null,
      location_lat: -1.2 + (Math.random() - 0.5) * 0.5,
      location_lng: 36.8 + (Math.random() - 0.5) * 0.5,
      monthly_price: Math.floor(Math.random() * 15000 + 5000),
      currency: 'KES',
      status: 'active',
      verification_level: ['unverified', 'claimed', 'community_verified', 'scout_verified', 'campozy_verified'][Math.floor(Math.random() * 5)],
      campozy_score: Math.floor(Math.random() * 60 + 40),
      is_active: true,
      reputation_score: Math.floor(Math.random() * 60 + 40),
    };
  });
  const { data: properties, error: propError } = await supabase.from('properties').insert(propertyData).select('id, name');
  if (propError) console.error('Error seeding properties:', propError);
  else console.log(`✓ Seeded ${properties?.length || 0} properties`);
  const propertyMap = new Map(properties?.map(p => [p.name, p.id]) || []);

  // ============================================
  // 6. CREATE PROPERTY ROOMS, MEDIA, AMENITIES, UTILITIES
  // ============================================
  console.log('\n--- Creating property details ---');

  if (properties && properties.length > 0) {
    // Rooms
    const roomTypes = ['Single', 'Double', 'Triple', 'Self-contained', 'Bedsitter'];
    const roomData = [];
    for (const property of properties) {
      const numRooms = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numRooms; i++) {
        roomData.push({
          property_id: property.id,
          room_type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
          quantity: Math.floor(Math.random() * 5) + 1,
        });
      }
    }
    const { error: roomError } = await supabase.from('property_rooms').insert(roomData);
    if (roomError) console.error('Error seeding rooms:', roomError);
    else console.log(`✓ Seeded ${roomData.length} property rooms`);

    // Media
    const imageUrls = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1493809842364-b788880f84be?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1560185007-cde436f6f4be?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f43d6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512917772890-aee59a4d1a3c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600585154520-3ae6c3a93289?auto=format&fit=crop&q=80&w=800',
    ];

    const mediaData = [];
    for (const property of properties) {
      const numImages = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numImages; i++) {
        mediaData.push({
          property_id: property.id,
          url: imageUrls[Math.floor(Math.random() * imageUrls.length)],
          media_type: 'image',
          is_primary: i === 0,
        });
      }
    }
    const { error: mediaError } = await supabase.from('property_media').insert(mediaData);
    if (mediaError) console.error('Error seeding media:', mediaError);
    else console.log(`✓ Seeded ${mediaData.length} property media items`);

    // Property amenities
    const { data: amenities } = await supabase.from('amenities').select('id');
    const amenityData = [];
    for (const property of properties) {
      const numAmenities = Math.floor(Math.random() * 5) + 2;
      const shuffled = amenities?.sort(() => Math.random() - 0.5) || [];
      for (let i = 0; i < numAmenities && i < shuffled.length; i++) {
        amenityData.push({
          property_id: property.id,
          amenity_id: shuffled[i].id,
        });
      }
    }
    const { error: amenityError } = await supabase.from('property_amenities').insert(amenityData);
    if (amenityError) console.error('Error seeding amenities:', amenityError);
    else console.log(`✓ Seeded ${amenityData.length} property amenities`);

    // Property utilities
    const { data: utilities } = await supabase.from('utilities').select('id');
    const utilityData = [];
    for (const property of properties) {
      const numUtils = Math.floor(Math.random() * 3) + 2;
      const shuffled = utilities?.sort(() => Math.random() - 0.5) || [];
      for (let i = 0; i < numUtils && i < shuffled.length; i++) {
        utilityData.push({
          property_id: property.id,
          utility_id: shuffled[i].id,
          reliability_score: Math.floor(Math.random() * 50 + 50),
        });
      }
    }
    const { error: utilError } = await supabase.from('property_utilities').insert(utilityData);
    if (utilError) console.error('Error seeding utilities:', utilError);
    else console.log(`✓ Seeded ${utilityData.length} property utilities`);

    // Property reviews
    const reviewComments = [
      'Great place to stay!',
      'Management is responsive.',
      'Good value for money.',
      'Water issues sometimes but overall good.',
      'Excellent internet and study environment.',
      'Highly recommended for students.',
      'Peaceful and conducive for studies.',
    ];

    const reviewData = [];
    const reviewKeys = new Set();
    for (const property of properties) {
      const numReviews = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < numReviews; i++) {
        const reviewerId = userIds[Math.floor(Math.random() * userIds.length)];
        const key = `${property.id}:${reviewerId}`;
        if (reviewKeys.has(key)) continue;
        reviewKeys.add(key);
        reviewData.push({
          property_id: property.id,
          reviewer_id: reviewerId,
          overall_rating: Math.floor(Math.random() * 3 + 3),
          safety_rating: Math.floor(Math.random() * 3 + 3),
          hygiene_rating: Math.floor(Math.random() * 3 + 3),
          water_rating: Math.floor(Math.random() * 3 + 3),
          electricity_rating: Math.floor(Math.random() * 3 + 3),
          internet_rating: Math.floor(Math.random() * 3 + 3),
          management_rating: Math.floor(Math.random() * 3 + 3),
          accessibility_rating: Math.floor(Math.random() * 3 + 3),
          value_for_money_rating: Math.floor(Math.random() * 3 + 3),
          content: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        });
      }
    }
    const { error: reviewError } = await supabase.from('property_reviews').insert(reviewData, { onConflict: 'property_id, reviewer_id' });
    if (reviewError) console.error('Error seeding reviews:', reviewError);
    else console.log(`✓ Seeded ${reviewData.length} property reviews`);

    // Saved properties
    const savedData = [];
    const savedKeys = new Set();
    for (let i = 0; i < 30; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const propertyId = properties[Math.floor(Math.random() * properties.length)].id;
      const key = `${userId}:${propertyId}`;
      if (savedKeys.has(key)) continue;
      savedKeys.add(key);
      savedData.push({
        user_id: userId,
        property_id: propertyId,
        notes: ['Interested', 'Maybe later', 'Good option'][Math.floor(Math.random() * 3)],
        saved_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    const { error: savedError } = await supabase.from('saved_properties').insert(savedData, { onConflict: 'user_id, property_id' });
    if (savedError) console.error('Error seeding saved properties:', savedError);
    else console.log(`✓ Seeded ${savedData.length} saved properties`);
  }

  // ============================================
  // 7. CREATE DISCUSSIONS
  // ============================================
  console.log('\n--- Creating discussions ---');

  const { data: discussionCategories } = await supabase.from('discussion_categories').select('id');
  const discussionTitles = [
    'Best quiet study spots?',
    'Water supply issues',
    'Looking for a roommate',
    'Weekend events',
    'Career fair next month',
    'Tips for first-years',
    'Campus security needed',
    'Affordable hostels near Kasarani',
    'Internet issues in Madaraka',
    'Best cafes near campus',
  ];

  const discussionData = [];
  for (let i = 0; i < 30; i++) {
    discussionData.push({
      campus_id: campuses?.[Math.floor(Math.random() * campuses.length)]?.id,
      user_id: userIds[Math.floor(Math.random() * userIds.length)],
      category_id: discussionCategories?.[Math.floor(Math.random() * discussionCategories.length)]?.id,
      title: discussionTitles[Math.floor(Math.random() * discussionTitles.length)],
      content: 'Has anyone else experienced this? Looking for advice from fellow students.',
    });
  }
  const { data: discussions, error: discError } = await supabase.from('discussions').insert(discussionData).select('id');
  if (discError) console.error('Error seeding discussions:', discError);
  else console.log(`✓ Seeded ${discussions?.length || 0} discussions`);

  // Discussion replies
  if (discussions && discussions.length > 0) {
    const replyData = [];
    for (let i = 0; i < 80; i++) {
      replyData.push({
        discussion_id: discussions[Math.floor(Math.random() * discussions.length)].id,
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        content: ['Great point!', 'Same here.', 'Thanks for sharing.', 'I agree with this.'][Math.floor(Math.random() * 4)],
      });
    }
    const { error: replyError } = await supabase.from('discussion_replies').insert(replyData);
    if (replyError) console.error('Error seeding replies:', replyError);
    else console.log(`✓ Seeded ${replyData.length} discussion replies`);
  }

  // ============================================
  // 8. CREATE OPPORTUNITIES
  // ============================================
  console.log('\n--- Creating opportunities ---');

  // Create employers
  const employerNames = ['Tech Innovations Ltd', 'Safaricom PLC', 'Equity Bank', 'KCB Group', 'Kenya Airways'];
  const employerData = employerNames.map(name => ({
    name,
    description: 'Leading employer in Kenya',
    website: 'https://example.com',
    verification_level: ['unverified', 'claimed', 'community_verified', 'scout_verified', 'campozy_verified'][Math.floor(Math.random() * 5)],
    contact_user_id: userIds[Math.floor(Math.random() * userIds.length)],
    is_active: true,
  }));
  const { data: employers } = await supabase.from('employers').insert(employerData).select('id');
  console.log(`✓ Seeded ${employers?.length || 0} employers`);

  // Create opportunities
  const opportunityTitles = [
    'Software Engineering Internship',
    'Data Analyst Intern',
    'Marketing Intern',
    'Customer Service Rep',
    'Graduate Trainee',
    'Research Assistant',
    'Content Writer',
    'Sales Rep',
    'Finance Intern',
    'HR Intern',
  ];

  const opportunityData = [];
  for (let i = 0; i < 15; i++) {
    opportunityData.push({
      employer_id: employers?.[Math.floor(Math.random() * employers.length)]?.id,
      creator_id: userIds[Math.floor(Math.random() * userIds.length)],
      campus_id: campuses?.[Math.floor(Math.random() * campuses.length)]?.id,
      type: ['job', 'internship', 'scholarship', 'volunteer', 'event'][Math.floor(Math.random() * 5)],
      title: opportunityTitles[Math.floor(Math.random() * opportunityTitles.length)],
      description: 'Join our team and gain valuable experience.',
      requirements: { skills: ['Communication', 'Teamwork'], education: 'Bachelor' },
      location: ['Nairobi', 'Remote', 'Mombasa', 'Kisumu'][Math.floor(Math.random() * 4)],
      is_remote: Math.random() > 0.5,
      compensation: 'Stipend + benefits',
      application_url: 'https://apply.example.com',
      deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true,
    });
  }
  const { data: opportunities } = await supabase.from('opportunities').insert(opportunityData).select('id');
  console.log(`✓ Seeded ${opportunities?.length || 0} opportunities`);

  // ============================================
  // 9. CREATE FORUMS AND TOPICS
  // ============================================
  console.log('\n--- Creating forums ---');

  const forumNames = ['UoN Students Hub', 'JKUAT Campus Connect', 'Strathmore Life', 'KU Community', 'General Nairobi Student Life'];
  const forumData = forumNames.map(name => ({
    name,
    description: 'Campus forum for students',
    campus_id: campuses?.[Math.floor(Math.random() * campuses.length)]?.id,
    is_public: true,
    created_by: userIds[Math.floor(Math.random() * userIds.length)],
  }));
  const { data: forums } = await supabase.from('forums').insert(forumData).select('id');
  console.log(`✓ Seeded ${forums?.length || 0} forums`);

  if (forums && forums.length > 0) {
    const topicTitles = ['Welcome to the forum!', 'Study tips needed', 'Housing discussion', 'Weekend events', 'Campus news'];
    const topicData = [];
    for (let i = 0; i < 25; i++) {
      topicData.push({
        forum_id: forums[Math.floor(Math.random() * forums.length)].id,
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        title: topicTitles[Math.floor(Math.random() * topicTitles.length)],
        content: 'What do you think about this? Let us discuss.',
        is_pinned: Math.random() > 0.8,
        view_count: Math.floor(Math.random() * 500),
        reply_count: Math.floor(Math.random() * 20),
      });
    }
    const { data: topics } = await supabase.from('forum_topics').insert(topicData).select('id');
    console.log(`✓ Seeded ${topics?.length || 0} forum topics`);

    if (topics && topics.length > 0) {
      const postData = [];
      for (let i = 0; i < 100; i++) {
        postData.push({
          topic_id: topics[Math.floor(Math.random() * topics.length)].id,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          content: ['Great point!', 'I agree fully.', 'Interesting perspective.', 'Thanks for posting this.'][Math.floor(Math.random() * 4)],
        });
      }
      const { error: postError } = await supabase.from('forum_posts').insert(postData);
      if (postError) console.error('Error seeding posts:', postError);
      else console.log(`✓ Seeded ${postData.length} forum posts`);
    }
  }

  // ============================================
  // 10. CREATE UTILITY INCIDENTS AND REPORTS
  // ============================================
  console.log('\n--- Creating utility incidents ---');

  if (properties && properties.length > 0) {
    const { data: utilTypes } = await supabase.from('utility_types').select('id');
    const incidentData = [];
    for (let i = 0; i < 20; i++) {
      incidentData.push({
        property_id: properties[Math.floor(Math.random() * properties.length)].id,
        utility_type_id: utilTypes?.[Math.floor(Math.random() * (utilTypes?.length || 1))]?.id,
        reported_by: userIds[Math.floor(Math.random() * userIds.length)],
        description: ['KPLC outage reported in the area.', 'Water shortage affecting students.', 'Internet connectivity issues.', 'Sewage blockage reported.'][Math.floor(Math.random() * 4)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        resolved_at: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      });
    }
    const { error: incidentError } = await supabase.from('utility_incidents').insert(incidentData);
    if (incidentError) console.error('Error seeding incidents:', incidentError);
    else console.log(`✓ Seeded ${incidentData.length} utility incidents`);

    const reportData = incidentData.map(item => ({
      property_id: item.property_id,
      utility_type_id: item.utility_type_id,
      user_id: item.reported_by,
      reliability_rating: Math.floor(Math.random() * 3 + 3),
      hours_available_per_day: Math.floor(Math.random() * 12 + 6),
      comment: item.description,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
    const { error: reportError } = await supabase.from('utility_reports').insert(reportData);
    if (reportError) console.error('Error seeding reports:', reportError);
    else console.log(`✓ Seeded ${reportData.length} utility reports`);

    // Hygiene reports
    const { data: hygieneCategories } = await supabase.from('hygiene_categories').select('id');
    const hygieneData = [];
    for (let i = 0; i < 30; i++) {
      hygieneData.push({
        property_id: properties[Math.floor(Math.random() * properties.length)].id,
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        category_id: hygieneCategories?.[Math.floor(Math.random() * (hygieneCategories?.length || 1))]?.id,
        score: Math.floor(Math.random() * 5 + 1),
        comment: ['clean', 'could be better', 'needs improvement', 'well maintained', 'average'][Math.floor(Math.random() * 5)],
      });
    }
    const { error: hygieneError } = await supabase.from('hygiene_reports').insert(hygieneData);
    if (hygieneError) console.error('Error seeding hygiene reports:', hygieneError);
    else console.log(`✓ Seeded ${hygieneData.length} hygiene reports`);
  }

  // ============================================
  // 11. CREATE NEIGHBORHOOD REVIEWS
  // ============================================
  console.log('\n--- Creating neighborhood reviews ---');

  if (neighborhoodsList && neighborhoodsList.length > 0) {
    const neighborhoodReviewData = [];
    for (let i = 0; i < 20; i++) {
      neighborhoodReviewData.push({
        neighborhood_id: neighborhoodsList[Math.floor(Math.random() * neighborhoodsList.length)].id,
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        rating: Math.floor(Math.random() * 3 + 3),
        content: ['great neighborhood for students.', 'good transport links.', 'affordable and peaceful.', 'nice area but far from campus.'][Math.floor(Math.random() * 4)],
        safety_rating: Math.floor(Math.random() * 3 + 3),
        transport_rating: Math.floor(Math.random() * 3 + 3),
        amenities_rating: Math.floor(Math.random() * 3 + 3),
      });
    }
    const { error: nrError } = await supabase.from('neighborhood_reviews').insert(neighborhoodReviewData);
    if (nrError) console.error('Error seeding neighborhood reviews:', nrError);
    else console.log(`✓ Seeded ${neighborhoodReviewData.length} neighborhood reviews`);
  }

  // ============================================
  // 12. CREATE MATCHING DATA
  // ============================================
  console.log('\n--- Creating matching data ---');

  // Roommate profiles
  const roommateProfiles = [
    { student_id: userIds[0], bio: 'Looking for a quiet roommate who enjoys studying.', year_of_study: 3, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'moderate', study_habits: 'silent', interests: ['coding', 'reading'], smoking_ok: false, pets_ok: true, max_roommates: 2, campozy_score: 85 },
    { student_id: userIds[1], bio: 'Social person who loves gaming and movies.', year_of_study: 2, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'extrovert', study_habits: 'light_noise', interests: ['gaming', 'movies', 'music'], smoking_ok: false, pets_ok: false, max_roommates: 1, campozy_score: 72 },
    { student_id: userIds[2], bio: 'Chill student who likes flexibility.', year_of_study: 4, sleep_schedule: 'flexible', cleanliness_level: 'relaxed', social_level: 'introvert', study_habits: 'flexible', interests: ['art', 'photography'], smoking_ok: true, pets_ok: true, max_roommates: 3, campozy_score: 68 },
    { student_id: userIds[3], bio: 'Athletic and energetic, loves sports.', year_of_study: 3, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'extrovert', study_habits: 'silent', interests: ['sports', 'fitness', 'hiking'], smoking_ok: false, pets_ok: false, max_roommates: 2, campozy_score: 90 },
    { student_id: userIds[4] || userIds[userIds.length - 1], bio: 'Creative mind, loves music and art.', year_of_study: 2, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'moderate', study_habits: 'light_noise', interests: ['music', 'art', 'design'], smoking_ok: false, pets_ok: true, max_roommates: 1, campozy_score: 78 },
  ];

  for (const profile of roommateProfiles) {
    const { error } = await supabase.from('roommate_profiles').upsert(profile, { onConflict: 'student_id' });
    if (error) console.error(`Error creating roommate profile:`, error);
  }
  console.log('✓ Seeded roommate profiles');

  // Roommate preferences
  const roommatePrefs = [
    { student_id: userIds[0], budget_min: 5000, budget_max: 15000, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'moderate', study_habits: 'silent', gender_preference: 'any', smoking_ok: false, pets_ok: true, max_roommates: 2 },
    { student_id: userIds[1], budget_min: 8000, budget_max: 20000, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'extrovert', study_habits: 'light_noise', gender_preference: 'any', smoking_ok: false, pets_ok: false, max_roommates: 1 },
    { student_id: userIds[2], budget_min: 3000, budget_max: 10000, sleep_schedule: 'flexible', cleanliness_level: 'relaxed', social_level: 'introvert', study_habits: 'flexible', gender_preference: 'any', smoking_ok: true, pets_ok: true, max_roommates: 3 },
    { student_id: userIds[3], budget_min: 6000, budget_max: 18000, sleep_schedule: 'early_bird', cleanliness_level: 'neat', social_level: 'extrovert', study_habits: 'silent', gender_preference: 'any', smoking_ok: false, pets_ok: false, max_roommates: 2 },
    { student_id: userIds[4] || userIds[userIds.length - 1], budget_min: 4000, budget_max: 12000, sleep_schedule: 'night_owl', cleanliness_level: 'moderate', social_level: 'moderate', study_habits: 'light_noise', gender_preference: 'any', smoking_ok: false, pets_ok: true, max_roommates: 1 },
  ];

  for (const pref of roommatePrefs) {
    const { error } = await supabase.from('roommate_preferences').upsert(pref, { onConflict: 'student_id' });
    if (error) console.error(`Error creating roommate pref:`, error);
  }
  console.log('✓ Seeded roommate preferences');

  // Friend profiles
  const friendProfiles = [
    { student_id: userIds[0], bio: 'Friendly and outgoing.', year_of_study: 3, personality_type: 'extrovert', interests: ['sports', 'music'], hobbies: ['gaming', 'hiking'], study_habits: 'light_noise', campozy_score: 90 },
    { student_id: userIds[1], bio: 'Quiet and studious.', year_of_study: 2, personality_type: 'introvert', interests: ['reading', 'coding'], hobbies: ['chess', 'painting'], study_habits: 'silent', campozy_score: 75 },
    { student_id: userIds[2], bio: 'Balanced personality.', year_of_study: 4, personality_type: 'ambivert', interests: ['travel', 'photography'], hobbies: ['cooking', 'yoga'], study_habits: 'flexible', campozy_score: 82 },
    { student_id: userIds[3], bio: 'Athletic and team-oriented.', year_of_study: 3, personality_type: 'extrovert', interests: ['sports', 'fitness'], hobbies: ['running', 'gaming'], study_habits: 'light_noise', campozy_score: 88 },
    { student_id: userIds[4] || userIds[userIds.length - 1], bio: 'Creative and expressive.', year_of_study: 2, personality_type: 'introvert', interests: ['music', 'art'], hobbies: ['drawing', 'singing'], study_habits: 'flexible', campozy_score: 79 },
  ];

  for (const profile of friendProfiles) {
    const { error } = await supabase.from('friend_profiles').upsert(profile, { onConflict: 'student_id' });
    if (error) console.error(`Error creating friend profile:`, error);
  }
  console.log('✓ Seeded friend profiles');

  // Friend preferences
  const friendPrefs = [
    { student_id: userIds[0], study_together_ok: true, event_attendance_ok: true, gaming_ok: false, fitness_ok: true },
    { student_id: userIds[1], study_together_ok: false, event_attendance_ok: true, gaming_ok: true, fitness_ok: false },
    { student_id: userIds[2], study_together_ok: true, event_attendance_ok: false, gaming_ok: true, fitness_ok: true },
    { student_id: userIds[3], study_together_ok: true, event_attendance_ok: true, gaming_ok: false, fitness_ok: true },
    { student_id: userIds[4] || userIds[userIds.length - 1], study_together_ok: false, event_attendance_ok: true, gaming_ok: true, fitness_ok: false },
  ];

  for (const pref of friendPrefs) {
    const { error } = await supabase.from('friend_preferences').upsert(pref, { onConflict: 'student_id' });
    if (error) console.error(`Error creating friend pref:`, error);
  }
  console.log('✓ Seeded friend preferences');

  // Roommate matches
  const roommateMatches = [
    { seeker_id: userIds[0], match_id: userIds[1], compatibility_score: 78.5, match_reasons: ['similar_budget', 'same_campus', 'compatible_schedule'], budget_score: 85.0, lifestyle_score: 72.0, location_score: 90.0, academic_score: 65.0, status: 'pending' },
    { seeker_id: userIds[0], match_id: userIds[2], compatibility_score: 65.2, match_reasons: ['similar_interests', 'flexible_schedule'], budget_score: 70.0, lifestyle_score: 68.0, location_score: 75.0, academic_score: 55.0, status: 'pending' },
    { seeker_id: userIds[1], match_id: userIds[3], compatibility_score: 82.0, match_reasons: ['compatible_schedule', 'similar_interests'], budget_score: 90.0, lifestyle_score: 80.0, location_score: 85.0, academic_score: 70.0, status: 'pending' },
    { seeker_id: userIds[2], match_id: userIds[4] || userIds[userIds.length - 1], compatibility_score: 71.3, match_reasons: ['same_campus', 'compatible_schedule'], budget_score: 75.0, lifestyle_score: 70.0, location_score: 72.0, academic_score: 68.0, status: 'pending' },
  ];

  for (const match of roommateMatches) {
    const { error } = await supabase.from('roommate_matches').upsert(match, { onConflict: 'seeker_id, match_id' });
    if (error) console.error(`Error creating roommate match:`, error);
  }
  console.log('✓ Seeded roommate matches');

  // Friend matches
  const friendMatches = [
    { seeker_id: userIds[0], match_id: userIds[3], compatibility_score: 82.0, match_reasons: ['shared_interests', 'similar_year'], academic_score: 75.0, interest_score: 90.0, social_score: 85.0, proximity_score: 80.0, status: 'suggested' },
    { seeker_id: userIds[1], match_id: userIds[0], compatibility_score: 71.3, match_reasons: ['same_campus', 'compatible_schedule'], academic_score: 80.0, interest_score: 65.0, social_score: 70.0, proximity_score: 72.0, status: 'pending' },
    { seeker_id: userIds[2], match_id: userIds[4] || userIds[userIds.length - 1], compatibility_score: 88.5, match_reasons: ['similar_hobbies', 'compatible_personality'], academic_score: 70.0, interest_score: 95.0, social_score: 88.0, proximity_score: 85.0, status: 'suggested' },
    { seeker_id: userIds[3], match_id: userIds[0], compatibility_score: 76.0, match_reasons: ['shared_interests', 'same_campus'], academic_score: 72.0, interest_score: 80.0, social_score: 75.0, proximity_score: 78.0, status: 'pending' },
  ];

  for (const match of friendMatches) {
    const { error } = await supabase.from('friend_matches').upsert(match, { onConflict: 'seeker_id, match_id' });
    if (error) console.error(`Error creating friend match:`, error);
  }
  console.log('✓ Seeded friend matches');

  // Interactions
  const interactions = [
    { user_id: userIds[0], target_id: userIds[1], interaction_type: 'like' },
    { user_id: userIds[1], target_id: userIds[0], interaction_type: 'message' },
    { user_id: userIds[0], target_id: userIds[3], interaction_type: 'like' },
    { user_id: userIds[3], target_id: userIds[0], interaction_type: 'message' },
  ];

  for (const interaction of interactions) {
    const { error } = await supabase.from('roommate_interactions').upsert(interaction, { onConflict: 'user_id, target_id, interaction_type' });
    if (error) console.error(`Error creating interaction:`, error);
  }
  console.log('✓ Seeded roommate interactions');

  const friendInteractions = [
    { user_id: userIds[0], target_id: userIds[3], interaction_type: 'liked' },
    { user_id: userIds[3], target_id: userIds[0], interaction_type: 'viewed' },
    { user_id: userIds[1], target_id: userIds[0], interaction_type: 'viewed' },
  ];

  for (const interaction of friendInteractions) {
    const { error } = await supabase.from('friend_interactions').upsert(interaction, { onConflict: 'user_id, target_id, interaction_type' });
    if (error) console.error(`Error creating friend interaction:`, error);
  }
  console.log('✓ Seeded friend interactions');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest accounts:');
  testUsers.forEach(u => {
    console.log(`  ${u.email} / ${u.password}`);
  });
}

seedDatabase().catch(console.error);
