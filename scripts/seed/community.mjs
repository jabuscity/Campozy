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

export async function seedCommunity(profileIds, campusIds) {
  console.log('\n=== Community ===\n');

  const categories = [
    { name: 'General', description: 'General campus discussions' },
    { name: 'Academics', description: 'Academic advice and resources' },
    { name: 'Hostels', description: 'Hostel life and housing discussions' },
    { name: 'Campus Life', description: 'Student life and events' },
    { name: 'Careers', description: 'Jobs, internships, and career advice' },
  ];

  const categoryIds = [];
  for (const c of categories) {
    const { data } = await supabase.from('discussion_categories').upsert(c, { onConflict: 'name' }).select().single();
    if (data) categoryIds.push(data.id);
  }
  console.log('  ✓ Discussion categories seeded');

  const titles = [
    'Best quiet study spots near UoN?', 'Water supply issues in Westlands', 'Looking for a roommate at JKUAT',
    'Weekend events at Strathmore', 'Career fair coming up next month', 'Tips for first-year students',
    'Campus security improvements needed', 'Affordable hostels near Kasarani', 'Internet issues in Madaraka',
    'Best cafes near campus for studying'
  ];

  for (let i = 0; i < 30; i++) {
    const { data: disc } = await supabase.from('discussions').insert({
      campus_id: rand(campusIds),
      user_id: rand(profileIds),
      category_id: rand(categoryIds),
      title: titles[i % titles.length] + (i >= titles.length ? ` ${Math.floor(i / titles.length) + 1}` : ''),
      content: 'Has anyone else experienced this? Looking for advice from fellow students.',
      reply_count: 0,
    }).select().single();

    if (disc) {
      for (let r = 0; r < randInt(1, 6); r++) {
        await supabase.from('discussion_replies').insert({
          discussion_id: disc.id,
          user_id: rand(profileIds),
          content: rand(['Great point!', 'Same here.', 'Thanks for sharing.', 'I agree with this.']),
        });
      }
    }
  }
  console.log('  ✓ Discussions seeded');
}
