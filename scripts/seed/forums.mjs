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

export async function seedForums(profileIds, campusIds) {
  console.log('\n=== Forums ===\n');

  const forumNames = ['UoN Students Hub', 'JKUAT Campus Connect', 'Strathmore Life', 'KU Community', 'General Nairobi Student Life'];

  for (let i = 0; i < forumNames.length; i++) {
    const { data: forum } = await supabase.from('forums').insert({
      campus_id: campusIds[i % campusIds.length],
      name: forumNames[i],
      description: `Campus forum for ${forumNames[i]}`,
      is_public: true,
      created_by: rand(profileIds),
    }).select().single();

    if (forum) {
      console.log(`  ✓ Forum: ${forum.name}`);
      for (let t = 0; t < 5; t++) {
        const { data: topic } = await supabase.from('forum_topics').insert({
          forum_id: forum.id,
          user_id: rand(profileIds),
          title: `Discussion topic ${t + 1} in ${forum.name}`,
          content: 'What do you think about this? Let us discuss.',
          is_pinned: t === 0,
        }).select().single();

        if (topic) {
          for (let p = 0; p < randInt(2, 8); p++) {
            await supabase.from('forum_posts').insert({
              topic_id: topic.id,
              user_id: rand(profileIds),
              content: rand(['Great point!', 'I agree fully.', 'Interesting perspective.', 'Thanks for posting this.']),
            });
          }
        }
      }
    }
  }
  console.log('  ✓ Forums seeded');
}
