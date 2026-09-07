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
  console.log('Testing corrected queries for property:', pid);
  
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
    
  const amenityIds = (amenities || []).map(a => a.amenity_id);
  const amenityMap = new Map();
  if (amenityIds.length > 0) {
    const { data: amenityTypes } = await supabase
      .from('amenities')
      .select('id, name, icon')
      .in('id', amenityIds);
    (amenityTypes || []).forEach(t => amenityMap.set(t.id, t));
  }
  
  const enrichedAmenities = (amenities || []).map(a => ({
    ...a,
    amenity_type: amenityMap.get(a.amenity_id) || null,
  }));
  
  console.log('Amenities count:', enrichedAmenities.length);
  if (enrichedAmenities.length > 0) {
    console.log('First amenity type:', enrichedAmenities[0].amenity_type?.name || 'unknown');
  }
  
  const { data: utilities } = await supabase
    .from('property_utilities')
    .select('*')
    .eq('property_id', pid);
    
  const utilityIds = (utilities || []).map(u => u.utility_id);
  const utilityMap = new Map();
  if (utilityIds.length > 0) {
    const { data: utilityTypes } = await supabase
      .from('utilities')
      .select('id, name')
      .in('id', utilityIds);
    (utilityTypes || []).forEach(t => utilityMap.set(t.id, t));
  }
  
  const enrichedUtilities = (utilities || []).map(u => ({
    ...u,
    utility_type: utilityMap.get(u.utility_id) || null,
  }));
  
  console.log('Utilities count:', enrichedUtilities.length);
  if (enrichedUtilities.length > 0) {
    console.log('First utility type:', enrichedUtilities[0].utility_type?.name || 'unknown');
  }
}

test().catch(e => console.error(e));
