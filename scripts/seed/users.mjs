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

export const ids = {
  userIds: [],
  profileIds: [],
  ownerIds: [],
  studentIds: [],
  highSchoolIds: [],
  roleIds: {},
};

async function qSelect(table, data, label) {
  try {
    const { data: result, error } = await supabase.from(table).insert(data).select().single();
    if (error) {
      if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
        console.error(`  ✗ ${label}: ${error.message}`);
      }
      return null;
    }
    console.log(`  ✓ ${label}`);
    return result;
  } catch (e) {
    return null;
  }
}

async function seedRoles() {
  const roles = ['student', 'owner', 'scout', 'ambassador', 'employer', 'parent', 'mentor', 'alumni', 'moderator', 'admin'];
  for (const r of roles) {
    const { data } = await qSelect('roles', { name: r, description: `${r} role` }, `Role ${r}`);
    if (data) ids.roleIds[r] = data.id;
  }
  console.log('  ✓ Roles seeded');
  return ids.roleIds;
}

async function seedHighSchools(cityId) {
  const schools = ['Alliance High School', 'Maranda High School', 'Mangu High School', 'Nairobi School', 'Lenana School', 'Starehe Boys Centre', 'Kenya High School'];
  for (const hs of schools) {
    const { data } = await qSelect('high_schools', { name: hs, city_id: cityId }, `School ${hs}`);
    if (data) ids.highSchoolIds.push(data.id);
  }
  console.log('  ✓ High schools seeded');
}

export async function seedUsers(universityIds, campusIds, cityIds) {
  console.log('\n=== Users & Profiles ===\n');
  await seedRoles();

  const cityId = cityIds[0] || cityIds[0];
  await seedHighSchools(cityId);

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
    { email: 'founder1@campozy.ac', password: 'password123', fullName: 'Founder Alex', username: 'founder_alex', role: 'founder' },
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
  ];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      let uid;
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.fullName, username: user.username, role: user.role }
      });

      if (error && error.message.includes('already been registered')) {
        const existing = await supabase.auth.admin.listUsers();
        const found = existing?.users?.find(u => u.email === user.email);
        if (found) uid = found.id;
      } else if (data?.user) {
        uid = data.user.id;
      } else {
        continue;
      }

      ids.userIds.push(uid);
      console.log(`  ✓ Auth: ${user.email}`);

      const { data: profile } = await supabase.from('profiles').upsert({
        id: uid,
        username: user.username,
        full_name: user.fullName,
        bio: `${user.fullName} at a Nairobi university. Loves campus life.`,
        avatar_url: `https://i.pravatar.cc/300?u=${uid}`,
        university_id: universityIds[i % universityIds.length] || null,
        campus_id: campusIds[i % campusIds.length] || null,
        former_school_id: ids.highSchoolIds[i % ids.highSchoolIds.length] || null,
        trust_level: 'member',
        reputation_score: randInt(100, 800),
        contribution_score: randInt(50, 500),
        is_verified: randBool(),
        phone_number: `+2547${randInt(10000000, 99999999)}`,
      }, { onConflict: 'id' }).select().single();

      if (profile) {
        ids.profileIds.push(profile.id);
        console.log(`  ✓ Profile: ${user.fullName}`);
      }

      const roleId = ids.roleIds[user.role];
      if (roleId) {
        await supabase.from('user_roles').upsert({ user_id: uid, role_id: roleId }, { onConflict: ['user_id', 'role_id'] });
        console.log(`  ✓ Role ${user.role}: ${user.email}`);
      }

      if (['owner'].includes(user.role)) {
        ids.ownerIds.push(uid);
        await supabase.from('owners').upsert({ id: uid, address: 'Nairobi, Kenya' }, { onConflict: 'id' });
      }
      if (['student', 'mentor', 'alumni'].includes(user.role)) {
        ids.studentIds.push(uid);
        await supabase.from('students').upsert({
          id: uid,
          university_id: universityIds[i % universityIds.length] || null,
          campus_id: campusIds[i % campusIds.length] || null,
          enrollment_year: 2020 + randInt(0, 5),
          graduation_year: 2024 + randInt(0, 4),
          campozy_score: randInt(0, 100),
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.error(`  ✗ Error ${user.email}: ${e.message}`);
    }
  }

  console.log(`\nUsers: ${ids.userIds.length}, Profiles: ${ids.profileIds.length}, Owners: ${ids.ownerIds.length}, Students: ${ids.studentIds.length}`);
}
