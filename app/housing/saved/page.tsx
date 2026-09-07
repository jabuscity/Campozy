import { HousingService } from '@/services/housing-service'
import { IdentityService } from '@/services/identity-service'
import { Button } from '@/components/ui/button'
import { PropertyCard } from '@/components/property-card'
import { ArrowLeft, Trash2, Heart } from 'lucide-react'
import Link from 'next/link'
import { removeSavedPropertyAction } from '@/app/actions/housing-actions'

interface SavedPropertyItem {
  property_id: string
  notes?: string
  saved_at?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any
}

export default async function SavedPropertiesPage() {
  const currentUser = await IdentityService.getCurrentUser()
  let savedProperties: SavedPropertyItem[] = []

  if (currentUser) {
    savedProperties = (await HousingService.getSavedProperties(currentUser.id)) as unknown as SavedPropertyItem[]
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-200 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight uppercase">Saved Properties</h1>
              <p className="text-neutral-600">{savedProperties.length} properties saved</p>
            </div>
            <Link href="/housing">
              <Button variant="secondary" className="rounded-full font-bold">
                <ArrowLeft className="h-4 w-4 mr-2" /> Browse Hostels
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {savedProperties.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center">
            <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-neutral-900 mb-2">No saved properties yet</h3>
            <p className="text-neutral-500 mb-6">Start exploring hostels and save the ones you like.</p>
            <Link href="/housing">
              <Button className="rounded-full font-bold">Find Hostels</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {savedProperties.map((saved) => (
              <div key={saved.property_id} className="relative">
                {saved.properties ? (
                  <>
                    <PropertyCard property={saved.properties} />
                    <form action={removeSavedPropertyAction} className="absolute top-3 right-3">
                      <input type="hidden" name="propertyId" value={saved.property_id} />
                      <button
                        type="submit"
                        className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
