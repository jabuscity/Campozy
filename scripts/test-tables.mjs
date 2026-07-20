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
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  const tables = [
    'profiles',
    'universities',
    'campuses',
    'neighborhoods',
    'hygiene_categories',
    'properties',
    'businesses',
    'community_posts',
    'discussions'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('count')
      .limit(1);

    if (error) {
      console.log(`  ✗ ${table}: ${error.message}`);
    } else {
      console.log(`  ✓ ${table}: accessible`);
    }
  }
}

async function main() {
  console.log('Testing basic tables from migration 0001...\n');
  await testTables();
}

main();
