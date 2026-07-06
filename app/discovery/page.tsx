import { HousingService } from '@/services/housing-service'
import { PropertyCard } from '@/components/property-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Filter, MapPin, SlidersHorizontal } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: { q?: string; campus?: string; sort?: string }
}) {
  const campuses = await HousingService.getCampuses()
  
  const query = searchParams.q || ''
  const campusId = searchParams.campus
  const sort = searchParams.sort || 'highest_score'

  const properties = campusId 
    ? await HousingService.getPropertiesByCampus(campusId, { sort })
    : []

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Header / Search Bar */}
      <div className="bg-white border-b border-neutral-200 pt-8 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl">
                 <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight uppercase">
                    Housing Intel
                 </h1>
                 <p className="text-neutral-500 text-lg">
                    Discover verified student housing with trusted utility scores and community insights.
                 </p>
              </div>

              <div className="flex gap-2">
                 <Button variant="outline" className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" /> Filters
                 </Button>
                 <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input 
                       type="text" 
                       placeholder="Search neighborhood or hostel..." 
                       className="w-full pl-10 pr-4 h-11 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                       defaultValue={query}
                       onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newSearchParams = new URLSearchParams(window.location.search)
                            newSearchParams.set('q', e.currentTarget.value)
                            redirect(`/discovery?${newSearchParams.toString()}`)
                          }
                        }}
                    />
                 </div>
              </div>

           {/* Quick Campus Filter */}
           <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <Badge 
                variant={!campusId ? 'primary' : 'outline'}
                className="py-2 px-6 rounded-xl cursor-pointer"
                onClick={() => {
                  const newSearchParams = new URLSearchParams(window.location.search)
                  newSearchParams.delete('campus')
                  redirect(`/discovery?${newSearchParams.toString()}`)
                }}
              >
                 All Campuses
              </Badge>
              {campuses.map(campus => (
                 <Badge 
                    key={campus.id} 
                    variant={campusId === campus.id ? 'primary' : 'outline'}
                    className="py-2 px-6 rounded-xl cursor-pointer hover:bg-neutral-50 whitespace-nowrap"
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(window.location.search)
                      newSearchParams.set('campus', campus.id)
                      redirect(`/discovery?${newSearchParams.toString()}`)
                    }}
                 >
                   {campus.name}
                 </Badge>
              ))}
           </div>
        </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-8">
           <div className="text-neutral-900">
              <span className="font-bold text-lg">{properties.length}</span>
              <span className="text-neutral-500 ml-2 italic">verified properties found</span>
           </div>
           
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
               Sort by: 
               <select 
                 className="bg-transparent border-none focus:ring-0 font-bold text-neutral-900 cursor-pointer"
                 value={sort}
                 onChange={(e) => {
                    const newSearchParams = new URLSearchParams(window.location.search)
                    newSearchParams.set('sort', e.currentTarget.value)
                    redirect(`/discovery?${newSearchParams.toString()}`)
                  }}
               >
                  <option value="highest_score">Highest Score</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="latest">Latest</option>
               </select>
            </div>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-neutral-200">
            <div className="h-20 w-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
               <MapPin className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-2">No Verified Housing Found</h3>
            <p className="text-neutral-500 max-w-xs mx-auto mb-8">
               We're still mapping this campus. Be a pioneer and nominate your first hostel!
            </p>
            <Button size="lg" className="px-10">Nominate Property</Button>
          </div>
        )}
      </div>

      {/* Map Toggle Floating Button (Mobile) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:hidden">
         <Button variant="primary" className="rounded-full shadow-2xl px-8 gap-2 h-12 text-lg">
            <MapPin className="h-5 w-5" /> View Map
         </Button>
      </div>
    </div>
  )
}
