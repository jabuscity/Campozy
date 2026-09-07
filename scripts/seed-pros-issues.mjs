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

async function seedProsAndIssues() {
  console.log('Seeding pros and known issues...\n');

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name')
    .limit(3);

  if (!properties || properties.length === 0) {
    console.error('No properties found.');
    process.exit(1);
  }

  const pros = [
    'Close to campus',
    '24/7 security',
    'High-speed internet',
    'Clean water supply',
    'Backup generator',
    'On-site laundry',
    'Ample parking',
    'Quiet study environment',
  ];

  const issues = [
    'Limited parking during peak hours',
    'Internet may slow down during evenings',
    'Water pressure can be low in the mornings',
    'Noise from nearby road during rush hour',
  ];

  for (const property of properties) {
    const propertyPros = pros.sort(() => Math.random() - 0.5).slice(0, 3).join('\n• ');
    const propertyIssues = issues.sort(() => Math.random() - 0.5).slice(0, 2).join('\n• ');

    const { error } = await supabase
      .from('properties')
      .update({
        pros: `• ${propertyPros}`,
        known_issues: `• ${propertyIssues}`,
      })
      .eq('id', property.id);

    if (error) console.error(`Error updating ${property.name}:`, error.message);
    else console.log(`✓ Seeded pros/issues for ${property.name}`);
  }

  console.log('\n✓ Done seeding pros and known issues');
}

seedProsAndIssues().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
