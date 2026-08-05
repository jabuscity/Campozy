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

const BUSINESS_CATEGORIES = ['Restaurant', 'Cafe', 'Pharmacy', 'Supermarket', 'Salon', 'Laundry', 'Print Shop', 'Cyber Cafe', 'Bookshop', 'Clinic'];

export async function seedBusinesses(profileIds, neighborhoodIds) {
  console.log('\n=== Businesses ===\n');

  const names = ['Kafeeres Kitchen', 'Westlands Cafe', 'JKUAT Student Shop', 'UoN Bookshop', 'Nairobi Cyber Cafe', 'Madaraka Salon', 'Juja Pharmacy', 'Kasarani Laundry'];

  for (let i = 0; i < names.length; i++) {
    const { data: biz } = await supabase.from('businesses').insert({
      owner_id: rand(profileIds.slice(10, 25)),
      neighborhood_id: rand(neighborhoodIds),
      name: names[i],
      description: `Popular ${rand(BUSINESS_CATEGORIES).toLowerCase()} near campus`,
      category: rand(BUSINESS_CATEGORIES),
      verification_level: rand(['unverified', 'claimed', 'community_verified', 'scout_verified', 'campozy_verified']),
      campozy_score: randInt(40, 100),
      address: `${randInt(1, 200)} ${rand(neighborhoodIds).name} Road, Nairobi`,
      phone: `+2547${randInt(10000000, 99999999)}`,
      is_active: true,
    }).select().single();

    if (biz) {
      console.log(`  ✓ Business: ${biz.name}`);
      await supabase.from('business_media').insert({ business_id: biz.id, url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600', media_type: 'image', is_primary: true });
      for (let rv = 0; rv < randInt(3, 10); rv++) {
        await supabase.from('business_reviews').insert({
          business_id: biz.id,
          reviewer_id: rand(profileIds),
          overall_rating: randInt(3, 5),
          service_rating: randInt(3, 5),
          quality_rating: randInt(3, 5),
          value_rating: randInt(3, 5),
          cleanliness_rating: randInt(3, 5),
          staff_rating: randInt(3, 5),
          title: rand(['Great service!', 'Average experience', 'Highly recommend']),
          review: 'Good food and atmosphere. Perfect for students.',
          would_recommend: randBool(),
          is_verified_visit: randBool(),
        });
      }
    }
  }
  console.log('  ✓ Businesses seeded');
}
