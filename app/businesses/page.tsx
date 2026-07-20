import { BusinessService } from '@/services/business-service'
import { BusinessCard } from '@/components/business-card'

export default async function BusinessesPage() {
  const businesses = await BusinessService.getBusinesses()

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Businesses
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Student-serving businesses with reviews, trust signals, and recommendations.
          </p>
        </div>

        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 text-lg">No businesses listed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
