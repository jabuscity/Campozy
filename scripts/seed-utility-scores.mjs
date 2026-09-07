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

async function seedUtilityScores() {
  console.log('Seeding utility reliability scores...\n');

  const { data: properties } = await supabase
    .from('properties')
    .select('id, name')
    .limit(3);

  if (!properties || properties.length === 0) {
    console.error('No properties found.');
    process.exit(1);
  }

  const { data: utilities } = await supabase.from('utilities').select('id, name');

  for (const property of properties) {
    const { data: existingUtils } = await supabase
      .from('property_utilities')
      .select('id, utility_id')
      .eq('property_id', property.id);

    if (!existingUtils || existingUtils.length === 0) {
      console.log(`- No utilities found for ${property.name}, skipping.`);
      continue;
    }

    const updates = existingUtils.map(u => ({
      id: u.id,
      reliability_score: Math.floor(Math.random() * 80 + 20),
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from('property_utilities')
        .update({ reliability_score: update.reliability_score })
        .eq('id', update.id);

      if (error) console.error(`  Error updating utility ${update.id}:`, error.message);
      else console.log(`  ✓ ${property.name}: utility ${update.id} → ${update.reliability_score}%`);
    }
  }

  console.log('\n✓ Done seeding utility scores');
}

seedUtilityScores().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
