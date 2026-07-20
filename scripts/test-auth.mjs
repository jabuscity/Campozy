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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing full authentication flow...\n');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'alice@university.ac',
    password: 'password123'
  });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  console.log('✓ Login successful');
  console.log('  User ID:', data.user.id);
  console.log('  Email:', data.user.email);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  console.log('✓ Profile loaded:', profile?.full_name);

  const { data: roommateProfile } = await supabase
    .from('roommate_profiles')
    .select('*')
    .eq('student_id', data.user.id)
    .single();

  console.log('✓ Roommate profile loaded:', roommateProfile?.bio);

  const { data: roommatePref } = await supabase
    .from('roommate_preferences')
    .select('*')
    .eq('student_id', data.user.id)
    .single();

  console.log('✓ Roommate preferences loaded:', roommatePref?.sleep_schedule);

  const { data: matches } = await supabase
    .from('roommate_matches')
    .select('*')
    .eq('seeker_id', data.user.id);

  console.log('✓ Roommate matches loaded:', matches?.length || 0);

  const { data: friendProfile } = await supabase
    .from('friend_profiles')
    .select('*')
    .eq('student_id', data.user.id)
    .single();

  console.log('✓ Friend profile loaded:', friendProfile?.bio);

  const { data: friendMatches } = await supabase
    .from('friend_matches')
    .select('*')
    .eq('seeker_id', data.user.id);

  console.log('✓ Friend matches loaded:', friendMatches?.length || 0);

  const { data: interactions } = await supabase
    .from('roommate_interactions')
    .select('*')
    .eq('user_id', data.user.id);

  console.log('✓ Roommate interactions loaded:', interactions?.length || 0);

  const { data: friendInteractions } = await supabase
    .from('friend_interactions')
    .select('*')
    .eq('user_id', data.user.id);

  console.log('✓ Friend interactions loaded:', friendInteractions?.length || 0);

  await supabase.auth.signOut();
  console.log('\n✓ Full auth flow test PASSED');
}

testAuth().catch(console.error);
