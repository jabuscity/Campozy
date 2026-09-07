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
  console.log('Testing enriched queries for property:', pid);
  
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_types(name), property_rooms(*), property_media(*), neighborhoods(*)')
    .eq('id', pid)
    .single();
    
  if (error) {
    console.log('Property query error:', error.message);
    return;
  }
  
  console.log('Property found:', data?.name);
  console.log('Media:', data?.property_media?.length || 0);
  console.log('Rooms:', data?.property_rooms?.length || 0);
  
  const { data: amenities } = await supabase
    .from('property_amenities')
    .select('*')
    .eq('property_id', pid);
    
  const amenityTypeIds = (amenities || []).map(a => a.amenity_type_id);
  const amenityTypeMap = new Map();
  if (amenityTypeIds.length > 0) {
    const { data: amenityTypes } = await supabase
      .from('amenity_types')
      .select('id, name, icon')
      .in('id', amenityTypeIds);
    (amenityTypes || []).forEach(t => amenityTypeMap.set(t.id, t));
  }
  
  const enrichedAmenities = (amenities || []).map(a => ({
    ...a,
    amenity_type: amenityTypeMap.get(a.amenity_type_id) || null,
  }));
  
  console.log('Amenities count:', enrichedAmenities.length);
  if (enrichedAmenities.length > 0) {
    console.log('First amenity type:', enrichedAmenities[0].amenity_type?.name || 'unknown');
  }
  
  const { data: utilities } = await supabase
    .from('property_utilities')
    .select('*')
    .eq('property_id', pid);
    
  const utilityTypeIds = (utilities || []).map(u => u.utility_type_id);
  const utilityTypeMap = new Map();
  if (utilityTypeIds.length > 0) {
    const { data: utilityTypes } = await supabase
      .from('utility_types')
      .select('id, name')
      .in('id', utilityTypeIds);
    (utilityTypes || []).forEach(t => utilityTypeMap.set(t.id, t));
  }
  
  const enrichedUtilities = (utilities || []).map(u => ({
    ...u,
    utility_type: utilityTypeMap.get(u.utility_type_id) || null,
  }));
  
  console.log('Utilities count:', enrichedUtilities.length);
  if (enrichedUtilities.length > 0) {
    console.log('First utility type:', enrichedUtilities[0].utility_type?.name || 'unknown');
  }
}

test().catch(e => console.error(e));
