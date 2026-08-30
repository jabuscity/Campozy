import { BusinessService } from '@/services/business-service'
import { BusinessCard } from '@/components/business-card'
import Link from 'next/link'

export default async function BusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category
  const businesses = category
    ? await BusinessService.getBusinesses({ category })
    : await BusinessService.getBusinesses()

  const allBusinesses = await BusinessService.getBusinesses()
  const categories = Array.from(new Set(allBusinesses.map(b => b.category).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight uppercase">
            Businesses
          </h1>
        </div>

        {categories.length > 0 && (
          <div className="mb-6 md:mb-8 flex flex-wrap gap-2">
            <Link
              href="/businesses"
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                !category
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/businesses?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  category === cat
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
             <p className="text-neutral-500 text-base md:text-lg">Nothing listed yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
