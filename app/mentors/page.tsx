import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GraduationCap } from 'lucide-react'

export default async function MentorsPage() {
  const supabase = await createClient()
  const { data: mentors } = await supabase
    .from('mentorship_profiles')
    .select(`
      *,
      profile:profiles(id, full_name, avatar_url, bio)
    `)
    .eq('is_accepting', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Mentors
          </h1>
          <p className="mt-2 text-neutral-500 text-base md:text-lg">
            Alumni and professionals offering mentorship to students.
          </p>
        </div>

        {mentors && mentors.length > 0 ? (
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
                <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                  {mentor.bio || 'Available for mentorship.'}
                </p>
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>Max mentees: {mentor.max_mentees}</span>
                  <span className="capitalize">{mentor.is_accepting ? 'Accepting' : 'Full'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-neutral-200">
            <GraduationCap className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
            <p className="text-neutral-500 text-base md:text-lg">No mentors available yet.</p>
            <Link href="/signup" className="mt-4 md:mt-6 inline-flex">
              <Button size="lg" className="px-8 md:px-10 h-12 md:h-14 text-base md:text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                Become a Mentor
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
