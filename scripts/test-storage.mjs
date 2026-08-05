import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadEnv() {
  const envPath = join(process.cwd(), '.env.local')
  const envContent = readFileSync(envPath, 'utf-8')
  const envVars = {}

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...valueParts] = trimmed.split('=')
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
    }
  }

  return envVars
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

async function runTests() {
  console.log('Testing Supabase Storage buckets...\n')

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Test each bucket
  const buckets = [
    { id: 'avatars', public: true },
    { id: 'properties', public: true },
    { id: 'businesses', public: true },
    { id: 'reviews', public: true },
    { id: 'hygiene', public: true },
    { id: 'logos', public: true },
    { id: 'documents', public: false },
    { id: 'verification', public: false },
    { id: 'messages', public: false },
    { id: 'claims', public: false },
    { id: 'scouts', public: false },
  ]

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.getBucket(bucket.id)
    if (error) {
      console.log(`[MISSING] ${bucket.id}: ${error.message}`)
    } else if (data) {
      const publicStatus = data.public ? 'public' : 'private'
      console.log(`[EXISTS] ${bucket.id} (${publicStatus})`)
    }
  }

  console.log('\nUpload tests (requires dev server on :3001):')
  
  // Create a small test image buffer (1x1 red pixel PNG)
  const testPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')

  // We'll test via direct Supabase upload since the API route requires auth
  for (const bucket of buckets.slice(0, 3)) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket.id)
        .upload(`test/${Date.now()}.png`, testPng, {
          contentType: 'image/png',
          cacheControl: '3600',
        })

      if (error) {
        console.log(`  [UPLOAD FAIL] ${bucket.id}: ${error.message}`)
      } else {
        const { data: publicUrl } = supabase.storage
          .from(bucket.id)
          .getPublicUrl(data.path)

        console.log(`  [UPLOAD OK] ${bucket.id}: ${publicUrl.publicUrl}`)
      }
    } catch (e) {
      console.log(`  [UPLOAD ERROR] ${bucket.id}: ${e}`)
    }
  }

  console.log('\nTests complete!')
}

runTests().catch(console.error)
