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

export async function seedOpportunities(profileIds) {
  console.log('\n=== Opportunities ===\n');

  const employers = [
    { name: 'Tech Innovations Ltd', industry: 'Technology', owner_id: rand(profileIds) },
    { name: 'Safaricom PLC', industry: 'Telecommunications', owner_id: rand(profileIds) },
    { name: 'Equity Bank', industry: 'Finance', owner_id: rand(profileIds) },
    { name: 'KCB Group', industry: 'Finance', owner_id: rand(profileIds) },
    { name: 'Kenya Airways', industry: 'Aviation', owner_id: rand(profileIds) },
  ];

  const employerIds = [];
  for (const e of employers) {
    const { data } = await supabase.from('employers').insert(e).select().single();
    if (data) employerIds.push(data.id);
  }
  console.log('  ✓ Employers seeded');

  const opportunityTitles = [
    'Software Engineering Internship', 'Data Analyst Intern', 'Marketing Intern',
    'Customer Service Representative', 'Graduate Trainee Program', 'Research Assistant',
    'Content Writer', 'Sales Representative', 'Finance Intern', 'HR Intern',
    'IT Support Technician', 'Business Development Intern'
  ];

  for (let i = 0; i < opportunityTitles.length; i++) {
    await supabase.from('opportunities').insert({
      employer_id: rand(employerIds),
      title: opportunityTitles[i],
      description: `Join our team as a ${opportunityTitles[i].toLowerCase()} and gain valuable experience.`,
      type: rand(['job', 'internship', 'scholarship', 'volunteer', 'event']),
      is_remote: randBool(),
      location: rand(['Nairobi', 'Remote', 'Mombasa', 'Kisumu']),
      requirements: { skills: ['Communication', 'Teamwork'], education: 'Bachelor degree' },
      benefits: { stipend: true, mentorship: true },
      application_deadline: new Date(Date.now() + randInt(7, 60) * 86400000).toISOString(),
      is_active: true,
    });
  }
  console.log('  ✓ Opportunities seeded');
}

function randBool() { return Math.random() > 0.5; }
