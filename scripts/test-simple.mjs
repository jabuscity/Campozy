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
const serviceRoleKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

console.log('URL:', supabaseUrl);
console.log('Key prefix:', serviceRoleKey?.slice(0, 15) + '...');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  const { data, error } = await supabase
    .from('profiles')
    .select('count');

  console.log('Count query:', data, error);

  const { data: rows, error: rowsError } = await supabase
    .from('profiles')
    .select('id, username')
    .limit(3);

  console.log('Rows query:', rows, rowsError);
}

test().catch(console.error);
