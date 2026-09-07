import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { HousingService } from '@/services/housing-service'
import type { PropertyAmenity, PropertyUtility } from '@/types'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const property = await HousingService.getPropertyById(id)
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 })

    const supabase = await createClient()

    const { data: amenities } = await supabase
      .from('property_amenities')
      .select('*')
      .eq('property_id', id)

    const amenityIds = (amenities || []).map(a => (a as PropertyAmenity).amenity_id)
    const amenityMap = new Map<string, { id: string; name: string; icon?: string }>()
    if (amenityIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: amenityTypes } = await (supabase as any)
        .from('amenities')
        .select('id, name, icon')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtered = (amenityTypes || []).filter((t: any) => amenityIds.includes(t.id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.forEach((t: any) => amenityMap.set(t.id, t))
    }

    const enrichedAmenities = (amenities || []).map(a => ({
      ...a,
      amenity_type: amenityMap.get((a as PropertyAmenity).amenity_id) || null,
    }))

    const { data: utilities } = await supabase
      .from('property_utilities')
      .select('*')
      .eq('property_id', id)

    const utilityIds = (utilities || []).map(u => (u as PropertyUtility).utility_id)
    const utilityMap = new Map<string, { id: string; name: string }>()
    if (utilityIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: utilityTypes } = await (supabase as any)
        .from('utilities')
        .select('id, name')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtered = (utilityTypes || []).filter((t: any) => utilityIds.includes(t.id))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.forEach((t: any) => utilityMap.set(t.id, t))
    }

    const enrichedUtilities = (utilities || []).map(u => ({
      ...u,
      utility_type: utilityMap.get((u as PropertyUtility).utility_id) || null,
    }))

    return NextResponse.json({
      property: {
        ...property,
        amenities: enrichedAmenities,
        utilities: enrichedUtilities,
      }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load property'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
