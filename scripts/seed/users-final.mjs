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
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function qInsert(table, data, label) {
  const { error } = await supabase.from(table).insert(data);
  if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
    console.error(`  ✗ ${label}: ${error.message}`);
  }
}

async function qUpsert(table, data, label) {
  const { error } = await supabase.from(table).upsert(data);
  if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
    console.error(`  ✗ ${label}: ${error.message}`);
  }
}

async function seedUsers() {
  console.log('=== Users & Profiles ===');
  const users = [
    { email: 'alice@university.ac', password: 'password123', fullName: 'Alice Wanjiku', username: 'alice_w', role: 'student' },
    { email: 'bob@university.ac', password: 'password123', fullName: 'Bob Mwangi', username: 'bob_m', role: 'student' },
    { email: 'carol@university.ac', password: 'password123', fullName: 'Carol Njeri', username: 'carol_n', role: 'student' },
    { email: 'david@university.ac', password: 'password123', fullName: 'David Kipchoge', username: 'david_k', role: 'student' },
    { email: 'emma@university.ac', password: 'password123', fullName: 'Emma Achieng', username: 'emma_a', role: 'student' },
    { email: 'owner1@property.ac', password: 'password123', fullName: 'James Kamau', username: 'owner_james', role: 'owner' },
    { email: 'owner2@property.ac', password: 'password123', fullName: 'Sarah Njoku', username: 'owner_sarah', role: 'owner' },
    { email: 'scout1@campozy.ac', password: 'password123', fullName: 'Tom Ochieng', username: 'scout_tom', role: 'scout' },
    { email: 'scout2@campozy.ac', password: 'password123', fullName: 'Lucy Wambui', username: 'scout_lucy', role: 'scout' },
    { email: 'ambassador1@uon.ac', password: 'password123', fullName: 'Grace Muthoni', username: 'amb_grace', role: 'ambassador' },
    { email: 'ambassador2@jkuat.ac', password: 'password123', fullName: 'Kevin Otieno', username: 'amb_kevin', role: 'ambassador' },
    { email: 'mentor1@campozy.ac', password: 'password123', fullName: 'Dr. James K.', username: 'mentor_james', role: 'mentor' },
    { email: 'alumni1@uon.ac', password: 'password123', fullName: 'Alumni Peter', username: 'alumni_peter', role: 'alumni' },
    { email: 'employer1@tech.ac', password: 'password123', fullName: 'Tech HR Manager', username: 'employer_tech', role: 'employer' },
    { email: 'employer2@bank.ac', password: 'password123', fullName: 'Bank Recruiter', username: 'employer_bank', role: 'employer' },
    { email: 'moderator1@campozy.ac', password: 'password123', fullName: 'Moderator Faith', username: 'mod_faith', role: 'moderator' },
    { email: 'admin1@campozy.ac', password: 'password123', fullName: 'Admin Irene', username: 'admin_irene', role: 'admin' },
    { email: 'frank@university.ac', password: 'password123', fullName: 'Frank Mutua', username: 'frank_m', role: 'student' },
    { email: 'hannah@university.ac', password: 'password123', fullName: 'Hannah Chebet', username: 'hannah_c', role: 'student' },
    { email: 'isaac@university.ac', password: 'password123', fullName: 'Isaac Njoroge', username: 'isaac_n', role: 'student' },
    { email: 'joy@university.ac', password: 'password123', fullName: 'Joy Wairimu', username: 'joy_w', role: 'student' },
    { email: 'kevin@university.ac', password: 'password123', fullName: 'Kevin Ayega', username: 'kevin_a', role: 'student' },
    { email: 'mary@property.ac', password: 'password123', fullName: 'Mary Atieno', username: 'owner_mary', role: 'owner' },
    { email: 'lisasimpson@test.ac', password: 'password123', fullName: 'Lisa Simpson', username: 'lisa_s', role: 'student' },
    { email: 'homersimpson@test.ac', password: 'password123', fullName: 'Homer Simpson', username: 'homer_s', role: 'student' },
  ];

  const { data: roles } = await supabase.from('roles').select('name, id');
  const roleMap = {};
  roles?.forEach(r => roleMap[r.name] = r.id);

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    let uid;
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email, password: u.password, email_confirm: true,
      user_metadata: { full_name: u.fullName, username: u.username, role: u.role }
    });
    if (error && error.message.includes('already been registered')) {
      const existing = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find(ex => ex.email === u.email);
      if (found) uid = found.id;
    } else if (data?.user) {
      uid = data.user.id;
    } else {
      continue;
    }

    console.log(`auth: ${u.email}`);

    await qUpsert('profiles', {
      id: uid, username: u.username, full_name: u.fullName,
      bio: `${u.fullName} at a Nairobi university. Loves campus life.`,
      avatar_url: `https://i.pravatar.cc/300?u=${uid}`,
      trust_level: 'member', reputation_score: randInt(100, 800), contribution_score: randInt(50, 500),
      is_verified: randBool(), phone_number: `+2547${randInt(10000000, 99999999)}`,
    }, `profile ${u.username}`);

    const roleId = roleMap[u.role];
    if (roleId) {
      await qUpsert('user_roles', { user_id: uid, role_id: roleId, assigned_at: new Date().toISOString() }, `role ${u.role} ${u.username}`);
    }

    if (u.role === 'owner') {
      await qUpsert('owners', { id: uid, address: 'Nairobi, Kenya' }, `owner ${u.username}`);
    }
    if (['student', 'mentor', 'alumni', 'parent'].includes(u.role)) {
      await qUpsert('students', {
        id: uid,
        enrollment_year: 2020 + randInt(0, 5), graduation_year: 2024 + randInt(0, 4),
        campozy_score: randInt(0, 100),
      }, `student ${u.username}`);
    }
  }
  console.log(' Users done');
}

seedUsers().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
