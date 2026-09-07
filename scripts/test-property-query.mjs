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

async function test() {
  const { data: props } = await supabase.from('properties').select('id, name').limit(1);
  if (!props?.length) { console.log('No properties'); return; }

  const pid = props[0].id;
  console.log('Testing property ID:', pid);

  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_types(name),
      property_rooms(*),
      property_media(*),
      property_amenities(*, amenity_types(name, icon)),
      property_utilities(*, utility_types(name)),
      neighborhoods(*)
    `)
    .eq('id', pid)
    .single();

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Property found:', data?.name);
    console.log('Media count:', data?.property_media?.length || 0);
    console.log('Rooms count:', data?.property_rooms?.length || 0);
    console.log('Amenities count:', data?.property_amenities?.length || 0);
    console.log('Utilities count:', data?.property_utilities?.length || 0);
  }
}

test().catch(e => console.error(e));
