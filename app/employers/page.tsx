import { createClient } from '@/lib/supabase/server'
import { Building2 } from 'lucide-react'

export default async function EmployersPage() {
  const supabase = await createClient()
  const { data: employers } = await supabase
    .from('employers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Employers
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Companies and organizations offering opportunities to students.
          </p>
        </div>

        {employers && employers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500 text-lg">No employers listed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
