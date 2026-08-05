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

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const buckets = [
  {
    id: 'avatars',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
    description: 'User profile avatars - publicly readable, server-side upload only',
  },
  {
    id: 'properties',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/avif', 'video/mp4'],
    description: 'Property listing photos and videos - publicly readable',
  },
  {
    id: 'businesses',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/avif', 'video/mp4'],
    description: 'Business listing photos - publicly readable',
  },
  {
    id: 'reviews',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
    description: 'Review photos - publicly readable',
  },
  {
    id: 'hygiene',
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
    description: 'Hygiene report photos - publicly readable',
  },
  {
    id: 'logos',
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'],
    description: 'University, badge, and employer logos - publicly readable',
  },
  {
    id: 'documents',
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/pdf', 'application/pdf'],
    description: 'Private ID documents (student ID, NID, passport) - private',
  },
  {
    id: 'verification',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pdf', 'application/pdf', 'video/mp4'],
    description: 'Private verification evidence - private',
  },
  {
    id: 'messages',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/pdf', 'application/pdf', 'video/mp4'],
    description: 'Private chat/messaging attachments - private',
  },
  {
    id: 'claims',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pdf', 'application/pdf', 'video/mp4'],
    description: 'Private property claim evidence - private',
  },
  {
    id: 'scouts',
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/pdf', 'application/pdf', 'video/mp4'],
    description: 'Private scout audit evidence - private',
  },
]

async function setupStorage() {
  console.log('Setting up Supabase Storage buckets...\n')

  for (const bucketConfig of buckets) {
    const { id, ...config } = bucketConfig
    const { data: existingBucket } = await supabase.storage.getBucket(id)

    if (existingBucket) {
      console.log(`Bucket "${id}" already exists - updating configuration...`)

      const { error: updateError } = await supabase.storage.updateBucket(id, config)

      if (updateError) {
        console.error(`  Error updating bucket "${id}":`, updateError.message)
      } else {
        console.log(`  Bucket "${id}" updated: ${bucketConfig.description}`)
      }
    } else {
      const { data: bucket, error: createError } = await supabase.storage.createBucket(id, config)

      if (createError) {
        console.error(`  Error creating bucket "${id}":`, createError.message)
      } else {
        console.log(`  Created bucket "${id}": ${bucketConfig.description}`)
      }
    }
  }

  console.log('\nAll buckets configured!')
  console.log('\nSecurity model:')
  console.log('  PUBLIC buckets (avatars, properties, businesses, reviews, hygiene, logos):')
  console.log('    - Read: Anyone (CDN-optimized)')
  console.log('    - Write: Server-side only (service role key)')
  console.log('  PRIVATE buckets (documents, verification, messages, claims, scouts):')
  console.log('    - Read: Only authenticated users with valid signed URLs')
  console.log('    - Write: Server-side only (service role key)')
  console.log('\nNote: All uploads are server-side through API routes,')
  console.log('so RLS policies are enforced at the application level.')
}

setupStorage().catch((err) => {
  console.error('Setup failed:', err)
  process.exit(1)
})
