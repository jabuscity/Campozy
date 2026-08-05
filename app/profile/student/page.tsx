import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentProfileForm } from '@/components/profile/student-profile-form'
import type { Student } from '@/types'

export default async function StudentProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: student, error } = await supabase
    .from('students')
    .select(`
      *,
      campus:campuses(*, universities(*)),
      program:academic_programs(*),
      former_school:high_schools(*)
    `)
    .eq('id', user.id)
    .maybeSingle()

  let studentRecord = student
  if (!studentRecord && !error) {
    const { data: newStudent } = await supabase
      .from('students')
      .insert({
        id: user.id,
        enrollment_year: null,
        expected_graduation_year: null,
      })
      .select(`
        *,
        campus:campuses(*, universities(*)),
        program:academic_programs(*),
        former_school:high_schools(*)
      `)
      .single()

    studentRecord = newStudent
  }

  if (error || !studentRecord) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center">
            <h2 className="text-2xl font-black text-neutral-900 mb-2">No Student Profile Found</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Your account does not have a student profile yet. Contact an administrator to set up your student record, or go back to your profile.
            </p>
            <a
              href="/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 transition-colors text-sm font-bold"
            >
              Back to Profile
            </a>
          </div>
        </div>
      </div>
    )
  }

  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name, universities(id, name)')
    .order('name')

  const { data: programs } = await supabase
    .from('academic_programs')
    .select('id, name, degree_level')
    .order('name')

  const { data: highSchools } = await supabase
    .from('high_schools')
    .select('id, name')
    .order('name')

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
         <StudentProfileForm
           student={studentRecord as Student}
           campuses={((campuses || []) as unknown) as Array<{ id: string; name: string; universities?: { id: string; name: string } }>}
           programs={((programs || []) as unknown) as Array<{ id: string; name: string; degree_level?: string | null }>}
           highSchools={((highSchools || []) as unknown) as Array<{ id: string; name: string }>}
         />
      </div>
    </div>
  )
}
