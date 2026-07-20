import { createClient } from '@/lib/supabase/server'
import type { Property, PropertyRoom, Neighborhood, University, Campus, NeighborhoodCampusDistance } from '@/types'

// ============================================================================
// HOUSING SERVICE
// Core housing intelligence: properties, rooms, neighborhoods, campuses.
// Implements the Housing Graph from doc 04.
// ============================================================================

export const HousingService = {
  // ── Universities & Campuses ──────────────────────────────────────────────

  async getPropertiesByCampus(campusId: string, options?: {
    minScore?: number;
    maxPrice?: number;
    propertyType?: string;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
    sort?: 'highest_score' | 'price_asc' | 'latest';
  }) {
    const supabase = await createClient()

    // Get neighborhood IDs connected to this campus
    const { data: distances, error: distError } = await supabase
      .from('neighborhood_campus_distances')
      .select('neighborhood_id')
      .eq('campus_id', campusId)

    if (distError) throw new Error(`Failed to fetch neighborhoods: ${distError.message}`)
    const neighborhoodIds = distances.map(d => d.neighborhood_id)

    if (neighborhoodIds.length === 0) return []

    let dbQuery = supabase
      .from('properties')
      .select(`
      *,
      property_types(name),
      property_rooms(id, room_type, price_per_month, price_per_semester, is_available, capacity),
      property_media(id, url, media_type, is_primary),
      neighborhoods(id, name, reputation_score)
    `)
      .in('neighborhood_id', neighborhoodIds)
      .eq('is_active', true)

    if (options?.sort === 'price_asc') {
      dbQuery = dbQuery.order('price_per_month', { ascending: true })
    } else if (options?.sort === 'latest') {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else {
      dbQuery = dbQuery.order('reputation_score', { ascending: false })
    }

    // Updated to use reputation_score instead of campozy_score
    if (options?.minScore) dbQuery = dbQuery.gte('reputation_score', options.minScore)

    // Note: We are bypassing verifiedOnly filter for now until your verification status column names are cross-referenced
    if (options?.limit) dbQuery = dbQuery.limit(options.limit)
    if (options?.offset) dbQuery = dbQuery.range(options.offset, options.offset + (options.limit || 20) - 1)

    const { data, error } = await dbQuery
    if (error) throw new Error(`Failed to fetch properties: ${error.message}`)
    return data as Property[]
  },


  async getUniversityById(universityId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('universities')
      .select('*, campuses(*), country:countries(name, iso_code)')
      .eq('id', universityId)
      .single()

    if (error) throw new Error(`University not found: ${error.message}`)
    return data as University
  },

  async getCampuses(universityId?: string) {
    const supabase = await createClient()
    let query = supabase
      .from('campuses')
      .select('*, universities(id, name, short_name)')
      .order('name')

    if (universityId) query = query.eq('university_id', universityId)

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch campuses: ${error.message}`)
    return data as Campus[]
  },

  async getUniversities() {
    const supabase = await createClient()
    const query = supabase
      .from('universities')
      .select('*, country:countries(name)')
      .order('name')

    const { data, error } = await query
    if (error) throw new Error(`Failed to fetch universities: ${error.message}`)
    return data as unknown as University[]
  },

  async getNeighborhoods() {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*, cities(name, country:countries(name))')
      .order('name')

    if (error) throw new Error(`Failed to fetch neighborhoods: ${error.message}`)
    return data as unknown as import('@/types').Neighborhood[]
  },

  // ── Neighborhoods ────────────────────────────────────────────────────────

  async getNeighborhoodsByCampus(campusId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('neighborhood_campus_distances')
      .select(`
        distance_km,
        walking_time_min,
        transport_time_min,
        transport_cost,
        neighborhoods(*)
      `)
      .eq('campus_id', campusId)
      .order('distance_km')

    if (error) throw new Error(`Failed to fetch neighborhoods: ${error.message}`)
    return data as unknown as (NeighborhoodCampusDistance & {
      neighborhoods: Neighborhood;
    })[]
  },

  async getNeighborhoodById(neighborhoodId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('neighborhoods')
      .select(`
        *,
        cities(name, countries(name)),
        neighborhood_landmarks(*),
        neighborhood_campus_distances(*, campuses(name, universities(name)))
      `)
      .eq('id', neighborhoodId)
      .single()

    if (error) throw new Error(`Neighborhood not found: ${error.message}`)
    return data as Neighborhood
  },

  // ── Properties ───────────────────────────────────────────────────────────

  async getPropertiesByNeighborhood(neighborhoodId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_types(name),
        property_rooms(id, room_type, price_per_month, price_per_semester, is_available, capacity),
        property_media(id, url, media_type, is_primary),
        neighborhoods(id, name)
      `)
      .eq('neighborhood_id', neighborhoodId)
      .eq('is_active', true)
      .order('campozy_score', { ascending: false })

    if (error) throw new Error(`Failed to fetch properties: ${error.message}`)
    return data as Property[]
  },

  async getPropertyById(propertyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_types(name),
        property_rooms(*),
        property_media(*),
        property_amenities(*, amenity_types(name, icon)),
        property_utilities(*, utility_types(name)),
        neighborhoods(
          *,
          cities(name, countries(name)),
          neighborhood_campus_distances(*, campuses(name, universities(name)))
        ),
        profiles!properties_owner_id_fkey(id, username, full_name, avatar_url, is_verified)
      `)
      .eq('id', propertyId)
      .single()

    if (error) throw new Error(`Property not found: ${error.message}`)
    return data as Property
  },

  async createProperty(propertyData: {
    name: string;
    address: string;
    neighborhood_id: string;
    owner_id: string;
    description?: string;
    property_type_id?: string;
    location_lat?: number;
    location_lng?: number;
    total_rooms?: number;
    floors?: number;
    year_built?: number;
  }) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create property: ${error.message}`)

    // Log event
    await supabase.from('events').insert({
      actor_id: propertyData.owner_id,
      event_type: 'property_created',
      target_id: data.id,
      target_type: 'property',
    })

    return data as Property
  },

  async updateProperty(propertyId: string, ownerId: string, updates: Partial<Property>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .eq('owner_id', ownerId) // Enforce ownership
      .select()
      .single()

    if (error) throw new Error(`Failed to update property: ${error.message}`)
    return data as Property
  },

  // ── Rooms ────────────────────────────────────────────────────────────────

  async addRoom(room: Omit<PropertyRoom, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('property_rooms')
      .insert(room)
      .select()
      .single()

    if (error) throw new Error(`Failed to add room: ${error.message}`)
    return data as PropertyRoom
  },

  async updateRoom(roomId: string, updates: Partial<PropertyRoom>) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('property_rooms')
      .update(updates)
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update room: ${error.message}`)
    return data as PropertyRoom
  },

  // ── Saved Properties ─────────────────────────────────────────────────────

  async saveProperty(userId: string, propertyId: string, notes?: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('saved_properties')
      .upsert({ user_id: userId, property_id: propertyId, notes })

    if (error) throw new Error(`Failed to save property: ${error.message}`)

    // Log event
    await supabase.from('events').insert({
      actor_id: userId,
      event_type: 'property_saved',
      target_id: propertyId,
      target_type: 'property',
    })
  },

  async unsaveProperty(userId: string, propertyId: string) {
    const supabase = await createClient()
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)
  },

  async getSavedProperties(userId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        notes,
        saved_at,
        properties(
          *,
          property_types(name),
          property_rooms(price_per_month, is_available),
          property_media(url, is_primary),
          neighborhoods(name)
        )
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch saved properties: ${error.message}`)
    return data
  },

  async isPropertySaved(userId: string, propertyId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('saved_properties')
      .select('user_id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()

    return !!data
  },

  // ── Search ───────────────────────────────────────────────────────────────

  async searchProperties(query: string, options?: { campusId?: string; limit?: number }) {
    const supabase = await createClient()

    const dbQuery = supabase
      .from('properties')
      .select(`
        *,
        property_types(name),
        property_rooms(price_per_month, is_available),
        property_media(url, is_primary),
        neighborhoods(name, city_id)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
      .order('campozy_score', { ascending: false })
      .limit(options?.limit || 20)

    const { data, error } = await dbQuery
    if (error) throw new Error(`Search failed: ${error.message}`)
    return data as Property[]
  },
}
