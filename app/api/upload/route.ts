import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  avatars: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  properties: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
  businesses: ['image/jpeg', 'image/png', 'image/webp'],
  reviews: ['image/jpeg', 'image/png', 'image/webp'],
  logos: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'image/jpeg', 'image/png'],
  verification: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  messages: ['image/jpeg', 'image/png', 'image/webp'],
  claims: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  scouts: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  hygiene: ['image/jpeg', 'image/png', 'image/webp'],
}

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  avatars: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
  properties: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'],
  businesses: ['jpg', 'jpeg', 'png', 'webp'],
  reviews: ['jpg', 'jpeg', 'png', 'webp'],
  logos: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
  documents: ['pdf', 'jpg', 'jpeg', 'png'],
  verification: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  messages: ['jpg', 'jpeg', 'png', 'webp'],
  claims: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  scouts: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
  hygiene: ['jpg', 'jpeg', 'png', 'webp'],
}

async function verifyMagicBytes(file: File, expectedMime: string): Promise<boolean> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const header = buffer.slice(0, 12)

  if (expectedMime === 'image/jpeg' || expectedMime === 'image/jpg') {
    return header[0] === 0xFF && header[1] === 0xD8
  }
  if (expectedMime === 'image/png') {
    return header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47
  }
  if (expectedMime === 'image/webp') {
    return header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
  }
  if (expectedMime === 'application/pdf') {
    return header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46
  }
  return true
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = formData.get('bucket') as string | null

    if (!file || !bucket) {
      return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 })
    }

    const allowedBuckets = Object.keys(ALLOWED_MIME_TYPES)
    if (!allowedBuckets.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB size limit' }, { status: 413 })
    }

    const ext = (file.name.split('.').pop() || 'bin').toLowerCase()
    const allowedExts = ALLOWED_EXTENSIONS[bucket] || []
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: `File extension .${ext} is not allowed for ${bucket}` }, { status: 415 })
    }

    const expectedMime = ALLOWED_MIME_TYPES[bucket]?.find(m => file.type === m)
    if (!expectedMime) {
      return NextResponse.json({ error: `Content type ${file.type || 'unknown'} is not allowed for ${bucket}` }, { status: 415 })
    }

    const magicValid = await verifyMagicBytes(file, expectedMime)
    if (!magicValid) {
      return NextResponse.json({ error: 'File content does not match its declared type' }, { status: 415 })
    }

    const path = `${bucket}/${user.id}/${Date.now()}.${ext}`

    const isPrivate = ['documents', 'verification', 'messages', 'claims', 'scouts'].includes(bucket)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        upsert: false,
        cacheControl: isPrivate ? '300' : '3600',
        contentType: file.type || 'application/octet-stream',
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    const publicUrl = publicUrlData.publicUrl

    return NextResponse.json({
      success: true,
      path,
      url: publicUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
