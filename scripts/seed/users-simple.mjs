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
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randBool = () => Math.random() > 0.5;

async function seedAll() {
  console.log('=== Seeding Users ===\n');
  const users = [
    { email: 'alice@university.ac', password: 'password123', name: 'Alice Wanjiku', username: 'alice_w' },
    { email: 'bob@university.ac', password: 'password123', name: 'Bob Mwangi', username: 'bob_m' },
    { email: 'carol@university.ac', password: 'password123', name: 'Carol Njeri', username: 'carol_n' },
    { email: 'david@university.ac', password: 'password123', name: 'David Kipchoge', username: 'david_k' },
    { email: 'emma@university.ac', password: 'password123', name: 'Emma Achieng', username: 'emma_a' },
    { email: 'owner1@property.ac', password: 'password123', name: 'James Kamau', username: 'owner_james' },
    { email: 'owner2@property.ac', password: 'password123', name: 'Sarah Njoku', username: 'owner_sarah' },
    { email: 'scout1@campozy.ac', password: 'password123', name: 'Tom Ochieng', username: 'scout_tom' },
    { email: 'scout2@campozy.ac', password: 'password123', name: 'Lucy Wambui', username: 'scout_lucy' },
    { email: 'ambassador1@uon.ac', password: 'password123', name: 'Grace Muthoni', username: 'amb_grace' },
    { email: 'ambassador2@jkuat.ac', password: 'password123', name: 'Kevin Otieno', username: 'amb_kevin' },
    { email: 'mentor1@campozy.ac', password: 'password123', name: 'Dr. James K.', username: 'mentor_james' },
    { email: 'alumni1@uon.ac', password: 'password123', name: 'Alumni Peter', username: 'alumni_peter' },
    { email: 'employer1@tech.ac', password: 'password123', name: 'Tech HR', username: 'employer_tech' },
    { email: 'employer2@bank.ac', password: 'password123', name: 'Bank Recruiter', username: 'employer_bank' },
    { email: 'moderator1@campozy.ac', password: 'password123', name: 'Moderator Faith', username: 'mod_faith' },
    { email: 'admin1@campozy.ac', password: 'password123', name: 'Admin Irene', username: 'admin_irene' },
    { email: 'frank@university.ac', password: 'password123', name: 'Frank Mutua', username: 'frank_m' },
    { email: 'hannah@university.ac', password: 'password123', name: 'Hannah Chebet', username: 'hannah_c' },
    { email: 'isaac@university.ac', password: 'password123', name: 'Isaac Njoroge', username: 'isaac_n' },
    { email: 'joy@university.ac', password: 'password123', name: 'Joy Wairimu', username: 'joy_w' },
    { email: 'kevin@university.ac', password: 'password123', name: 'Kevin Ayega', username: 'kevin_a' },
    { email: 'mary@property.ac', password: 'password123', name: 'Mary Atieno', username: 'owner_mary' },
    { email: 'lisa@test.ac', password: 'password123', name: 'Lisa Simpson', username: 'lisa_s' },
    { email: 'homer@test.ac', password: 'password123', name: 'Homer Simpson', username: 'homer_s' },
  ];

  for (const u of users) {
    let uid;
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
      user_metadata: { full_name: u.name, username: u.username }
    });
    if (error?.message?.includes('already been registered')) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find(ex => ex.email === u.email);
      if (found) uid = found.id;
    } else if (data?.user?.id) {
      uid = data.user.id;
    } else {
      console.log(`SKIP ${u.email}: ${error?.message || 'no id returned'}`);
      continue;
    }

    if (!uid) {
      console.log(`SKIP ${u.email}: could not obtain uid`);
      continue;
    }

    console.log(`  auth OK: ${u.email} uid=${uid}`);

    const { error: pErr } = await supabase.from('profiles').upsert({
      id: uid, username: u.username, full_name: u.name,
      bio: `${u.name} at a Nairobi university.`,
      avatar_url: `https://i.pravatar.cc/300?u=${uid}`,
      trust_level: 'member', reputation_score: randInt(100, 800), contribution_score: randInt(50, 500),
      is_verified: randBool(), phone_number: `+2547${randInt(10000000, 99999999)}`,
    }, { onConflict: 'id' });
    if (pErr) { console.log(`  profile ERR ${u.username}: ${pErr.message}`); }
  }
  console.log('\nDone');
}

seedAll().catch(e => { console.error('Fatal:', e); process.exit(1); });
