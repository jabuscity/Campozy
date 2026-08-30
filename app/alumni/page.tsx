import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GraduationCap, ArrowRight } from 'lucide-react'

export default async function AlumniPage() {
  const supabase = await createClient()
  const { data: alumni } = await supabase
    .from('alumni_profiles')
    .select(`
      *,
      profile:profiles(id, username, full_name, avatar_url),
      university:universities(id, name)
    `)
    .order('created_at', { ascending: false })

  const { data: mentors } = await supabase
    .from('mentorship_profiles')
    .select(`
      *,
      profile:profiles(id, username, full_name, avatar_url)
    `)
    .eq('is_accepting', true)
    .limit(6)

  const { data: employers } = await supabase
    .from('employers')
    .select('*')
    .eq('is_active', true)
    .limit(6)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Alumni
          </h1>

        </div>

        {mentors && mentors.length > 0 ? (
          <section className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-4 md:mb-6 uppercase tracking-tight">
              Available Mentors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black">
                      {mentor.profile?.full_name?.[0] || 'M'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        {mentor.profile?.full_name || 'Mentor'}
                      </p>
                      <p className="text-xs text-neutral-500 uppercase tracking-tight">
                        Mentor
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    {mentor.bio || 'Available for mentorship.'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-4 md:mb-6 uppercase tracking-tight">
            Alumni Directory
          </h2>
          {alumni && alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {alumni.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-black">
                      {entry.profile?.full_name?.[0] || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        {entry.profile?.full_name || 'Alumni'}
                      </p>
                      <p className="text-xs text-neutral-500 uppercase tracking-tight">
                        {entry.university?.name || 'University'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <GraduationCap className="h-4 w-4 text-secondary" />
                    <span>
                      {entry.current_position || 'Graduate'}
                      {entry.current_company ? ` at ${entry.current_company}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
              <GraduationCap className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
              <p className="text-neutral-500 text-base md:text-lg">None yet.</p>
              <Link href="/signup" className="mt-4 md:mt-6 inline-flex">
                <Button size="lg" className="px-8 md:px-10 h-12 md:h-14 text-base md:text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                  Join Network
                </Button>
              </Link>
            </div>
          )}

        <section className="mt-12">
          <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
            Akwet Transition
          </h2>
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center">
            <p className="text-neutral-500 text-lg mb-4">Plan your transition from campus to career.</p>
            <Link href="/alumni/transition" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              View your transition plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
        </section>

        {employers && employers.length > 0 && (
          <section className="mt-8 md:mt-12">
            <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-4 md:mb-6 uppercase tracking-tight">
              Employer Network
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {employers.map((employer) => (
                <div
                  key={employer.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                      {employer.name?.[0] || 'E'}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{employer.name}</p>
                      <p className="text-xs text-neutral-500 uppercase tracking-tight">
                        {employer.verification_level || 'Unverified'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    {employer.description || 'No description available.'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
