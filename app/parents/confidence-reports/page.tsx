import { ParentService } from '@/services/parent-service'
import { HousingService } from '@/services/housing-service'
import { createClient } from '@/lib/supabase/server'
import type { Property } from '@/types'
import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'

export default async function ParentConfidenceReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Please sign in to view reports.</p>
      </div>
    )
  }

  const parent = await ParentService.getProfile(user.id)
  const linkedStudents = parent.student_links?.filter(link => link.status === 'confirmed') || []

  const properties: Property[] = []
  for (const link of linkedStudents) {
    const savedProperties = await HousingService.getSavedProperties(link.student_id)
    const raw = savedProperties as unknown as { properties: Property }[]
    const props = raw?.map(sp => sp.properties).filter(Boolean) as Property[] || []
    properties.push(...props)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Housing Confidence Reports
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Trust signals and intelligence for your student&apos;s housing
          </p>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link
                key={property.id}
                href={`/property/${property.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg hover:border-primary transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Home className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-neutral-900">{property.name}</h3>
                    <p className="text-sm text-neutral-500">{property.neighborhood?.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{property.neighborhood?.name}</span>
                  <span className="font-bold text-primary">{property.campozy_score} score</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No saved properties linked to your students yet.</p>
            <Link href="/discovery" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Browse housing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
