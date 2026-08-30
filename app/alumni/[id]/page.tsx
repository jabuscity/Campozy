import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GraduationCap, ArrowLeft } from 'lucide-react'

export default async function AlumniProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: alumni } = await supabase
    .from('alumni_profiles')
    .select(`
      *,
      profile:profiles(id, username, full_name, avatar_url, bio),
      university:universities(id, name)
    `)
    .eq('id', params.id)
    .single()

  if (!alumni) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Alumni profile not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/alumni" className="inline-flex items-center gap-2 text-neutral-500 hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to alumni
          </Link>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black text-2xl shrink-0">
              {alumni.profile?.full_name?.[0] || 'A'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase">
                {alumni.profile?.full_name || 'Alumni'}
              </h1>
              <p className="mt-2 text-neutral-500 text-lg">
                {alumni.university?.name || 'University'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
                About
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                {alumni.profile?.bio || 'No bio available.'}
              </p>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-3xl border border-neutral-200 p-8">
              <h3 className="text-lg font-black text-neutral-900 mb-4 uppercase tracking-tight">
                Details
              </h3>
              <div className="space-y-3">
                {alumni.current_position && (
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">{alumni.current_position}</span>
                  </div>
                )}
                {alumni.current_company && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 w-24">Company:</span>
                    <span className="text-neutral-700">{alumni.current_company}</span>
                  </div>
                )}
                {alumni.graduation_year && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 w-24">Graduated:</span>
                    <span className="text-neutral-700">{alumni.graduation_year}</span>
                  </div>
                )}
                {alumni.degree && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500 w-24">Degree:</span>
                    <span className="text-neutral-700">{alumni.degree}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
