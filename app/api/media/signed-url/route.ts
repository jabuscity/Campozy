import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bucket = searchParams.get('bucket')
    const path = searchParams.get('path')
    const rawExpiresIn = parseInt(searchParams.get('expiresIn') || '3600', 10)
    const expiresIn = Number.isNaN(rawExpiresIn) ? 3600 : Math.min(Math.max(rawExpiresIn, 60), 86400)

    if (!bucket || !path) {
      return NextResponse.json({ error: 'Missing bucket or path' }, { status: 400 })
    }

    const privateBuckets = ['documents', 'verification', 'messages', 'claims', 'scouts']

    if (!privateBuckets.includes(bucket)) {
      return NextResponse.json({ error: 'Not a private bucket' }, { status: 400 })
    }

    const expectedPrefix = `${user.id}/`
    if (!path.startsWith(expectedPrefix)) {
      return NextResponse.json({ error: 'Path does not match user ownership' }, { status: 403 })
    }

    const { data: signedUrlData, error: signError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (signError) {
      return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      signedUrl: signedUrlData.signedUrl,
    })
  } catch (error) {
    console.error('Signed URL error:', error)
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }
}
