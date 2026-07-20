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

async function checkTables() {
  console.log('Checking matching tables with service role...\n');
  
  const tables = [
    'roommate_preferences',
    'roommate_profiles',
    'roommate_matches',
    'roommate_interactions',
    'roommate_conversations',
    'roommate_messages',
    'friend_preferences',
    'friend_profiles',
    'friend_matches',
    'friend_connections',
    'friend_interactions'
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

async function checkIndexes() {
  const { data, error } = await supabase
    .from('pg_indexes')
    .select('indexname, tablename')
    .ilike('indexname', '%roommate%');

  if (error) {
    console.error('\nError checking indexes:', error.message);
    return;
  }
  
  console.log('\nRoommate indexes:');
  data?.forEach(idx => console.log(`  - ${idx.indexname} on ${idx.tablename}`));
  
  const friendIndexes = await supabase
    .from('pg_indexes')
    .select('indexname, tablename')
    .ilike('indexname', '%friend%');
    
  console.log('\nFriend indexes:');
  friendIndexes.data?.forEach(idx => console.log(`  - ${idx.indexname} on ${idx.tablename}`));
}

async function main() {
  await checkTables();
  await checkIndexes();
  console.log('\n✓ Verification complete!');
}

main();
