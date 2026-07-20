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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testDataAccess() {
  console.log('Testing data access with service role...\n');
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', '752f3dd3-4cee-4124-8d49-2fc322fed16c');

  console.log('Profiles:', profiles?.length || 0);
  console.log('Profile:', profiles?.[0]?.full_name);

  const { data: roommateProfiles } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('student_id', '752f3dd3-4cee-4124-8d49-2fc322fed16c');

  console.log('Roommate profiles:', roommateProfiles?.length || 0);
  console.log('Roommate profile:', roommateProfiles?.[0]?.bio);

  const { data: matches } = await supabase
    .from('roommate_matches')
    .select('*')
    .eq('seeker_id', '752f3dd3-4cee-4124-8d49-2fc322fed16c');

  console.log('Roommate matches:', matches?.length || 0);
}

testDataAccess().catch(console.error);
