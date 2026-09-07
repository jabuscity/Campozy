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

async function migrate() {
  console.log('Creating temporary exec function...');
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });

  if (createError && !createError.message.includes('already exists')) {
    console.error('Error creating function:', createError.message);
  } else {
    console.log('✓ Function created or already exists');
  }

  console.log('Applying migration...');
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE properties
        ADD COLUMN IF NOT EXISTS pros TEXT,
        ADD COLUMN IF NOT EXISTS known_issues TEXT;
    `
  });

  if (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
  console.log('✓ Migration applied successfully');

  console.log('Dropping temporary function...');
  const { error: dropError } = await supabase.rpc('exec_sql', {
    sql: `DROP FUNCTION IF EXISTS exec_sql(text);`
  });

  if (dropError) {
    console.error('Error dropping function:', dropError.message);
  } else {
    console.log('✓ Function dropped');
  }
}

migrate().catch(e => console.error(e));
