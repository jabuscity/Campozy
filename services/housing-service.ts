import { supabaseAdmin } from '@/lib/supabase/admin'
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
    sort?: 'highest_score' | 'price_asc' | 'price_desc' | 'latest';
  }) {
    const supabase = supabaseAdmin
    const { data: distances, error: distError } = await supabase
      .from('neighborhood_campus_distances')
      .select('neighborhood_id')
      .eq('campus_id', campusId)

    if (distError || !distances?.length) return []

    const neighborhoodIds = distances.map(d => d.neighborhood_id)

    let dbQuery = supabase
      .from('properties')
      .select(`
      *,
      property_types(name),
      property_rooms(id, room_type, quantity),
      property_media(id, url, media_type, is_primary),
      neighborhoods(id, name, reputation_score)
    `)
      .in('neighborhood_id', neighborhoodIds)
      .eq('is_active', true)

    if (options?.sort === 'price_asc') {
      dbQuery = dbQuery.order('monthly_price', { ascending: true })
    } else if (options?.sort === 'price_desc') {
      dbQuery = dbQuery.order('monthly_price', { ascending: false })
    } else if (options?.sort === 'latest') {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else {
      dbQuery = dbQuery.order('campozy_score', { ascending: false })
    }

    if (options?.minScore) dbQuery = dbQuery.gte('campozy_score', options.minScore)
    if (options?.limit) dbQuery = dbQuery.limit(options.limit)
    if (options?.offset) dbQuery = dbQuery.range(options.offset, options.offset + (options.limit || 20) - 1)

    const { data, error } = await dbQuery
    if (error) return []
    return (data || []) as Property[]
  },

  async getAllProperties(options?: {
    minScore?: number;
    maxPrice?: number;
    propertyType?: string;
    verifiedOnly?: boolean;
    limit?: number;
    offset?: number;
    sort?: 'highest_score' | 'price_asc' | 'price_desc' | 'latest';
  }) {
    const supabase = supabaseAdmin
    let dbQuery = supabase
      .from('properties')
      .select(`
      *,
      property_types(name),
      property_rooms(id, room_type, quantity),
      property_media(id, url, media_type, is_primary),
      neighborhoods(id, name, reputation_score)
    `)
      .eq('is_active', true)

    if (options?.sort === 'price_asc') {
      dbQuery = dbQuery.order('monthly_price', { ascending: true })
    } else if (options?.sort === 'price_desc') {
      dbQuery = dbQuery.order('monthly_price', { ascending: false })
    } else if (options?.sort === 'latest') {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else {
      dbQuery = dbQuery.order('campozy_score', { ascending: false })
    }

    if (options?.minScore) dbQuery = dbQuery.gte('campozy_score', options.minScore)
    if (options?.limit) dbQuery = dbQuery.limit(options.limit)
    if (options?.offset) dbQuery = dbQuery.range(options.offset, options.offset + (options.limit || 20) - 1)

    const { data, error } = await dbQuery
    if (error) return []
    return (data || []) as Property[]
  },


  async getUniversityById(universityId: string) {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('universities')
      .select('*, campuses(*), country:countries(name, iso_code)')
      .eq('id', universityId)
      .single()

    if (error) throw new Error(`University not found: ${error.message}`)
    return data as University
  },

  async getCampuses(universityId?: string) {
    const supabase = supabaseAdmin
    let query = supabase
      .from('campuses')
      .select('*, universities(id, name, short_name)')
      .order('name')

    if (universityId) query = query.eq('university_id', universityId)

    const { data, error } = await query
    if (error) return []
    return (data || []) as Campus[]
  },

  async getUniversities() {
    const supabase = supabaseAdmin
    const query = supabase
      .from('universities')
      .select('*, country:countries(name)')
      .order('name')

    const { data, error } = await query
    if (error) return []
    return (data || []) as University[]
  },

  async getNeighborhoods() {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*, cities(name, country:countries(name))')
      .order('name')

    if (error) return []
    return (data || []) as import('@/types').Neighborhood[]
  },

  // ── Neighborhoods ────────────────────────────────────────────────────────

  async getNeighborhoodsByCampus(campusId: string) {
    const supabase = supabaseAdmin
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
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*, cities(name, country:countries(name)), neighborhood_campus_distances(*, campuses(name, universities(name)))')
      .eq('id', neighborhoodId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') throw new Error(`Neighborhood not found: ${neighborhoodId}`)
      throw new Error(`Failed to load neighborhood: ${error.message}`)
    }
    return data as Neighborhood
  },

  async getUtilityTypes() {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('utilities')
      .select('id, name')

    if (error) return []
    return (data || []) as Array<{ id: string; name: string }>
  },

  // ── Properties ───────────────────────────────────────────────────────────

  async getPropertiesByNeighborhood(neighborhoodId: string, options?: {
    minPrice?: number;
    maxPrice?: number;
    minScore?: number;
    sort?: 'highest_score' | 'price_asc' | 'price_desc' | 'latest';
  }) {
    const supabase = supabaseAdmin
    let dbQuery = supabase
      .from('properties')
      .select(`
        *,
        property_types(name),
        rooms:property_rooms(id, room_type, quantity),
        property_media(id, url, media_type, is_primary),
        neighborhoods(id, name),
        utilities:property_utilities(*),
        amenities:property_amenities(*)
      `)
      .eq('neighborhood_id', neighborhoodId)
      .eq('is_active', true)

    if (options?.minScore) {
      dbQuery = dbQuery.gte('campozy_score', options.minScore)
    }

    if (options?.sort === 'price_asc') {
      dbQuery = dbQuery.order('monthly_price', { ascending: true })
    } else if (options?.sort === 'price_desc') {
      dbQuery = dbQuery.order('monthly_price', { ascending: false })
    } else if (options?.sort === 'latest') {
      dbQuery = dbQuery.order('created_at', { ascending: false })
    } else {
      dbQuery = dbQuery.order('campozy_score', { ascending: false })
    }

    const { data, error } = await dbQuery

    if (error) throw new Error(`Failed to fetch properties: ${error.message}`)
    let results = (data || []) as Property[]

    if (options?.minPrice != null || options?.maxPrice != null) {
      results = results.filter((property) => {
        const price = property.monthly_price

        if (price == null || price <= 0) return true

        const min = options.minPrice ?? -Infinity
        const max = options.maxPrice ?? Infinity
        return price >= min && price <= max
      })
    }

    return results
  },

  async getPropertyById(propertyId: string) {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_types(name),
        property_rooms(*),
        property_media(*),
        neighborhoods(
          *,
          cities(name, countries(name)),
          neighborhood_campus_distances(*, campuses(name, universities(name)))
        ),
        profiles!properties_owner_id_fkey(id, username, full_name, avatar_url, is_verified, phone_number)
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
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) throw new Error(`Failed to create property: ${error.message}`)

    await supabase.from('events').insert({
      actor_id: propertyData.owner_id,
      event_type: 'property_created',
      target_id: data.id,
      target_type: 'property',
    })

    return data as Property
  },

  async updateProperty(propertyId: string, ownerId: string, updates: Partial<Property>) {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .eq('owner_id', ownerId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update property: ${error.message}`)
    return data as Property
  },

  // ── Rooms ────────────────────────────────────────────────────────────────

  async addRoom(room: Omit<PropertyRoom, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('property_rooms')
      .insert(room)
      .select()
      .single()

    if (error) throw new Error(`Failed to add room: ${error.message}`)
    return data as PropertyRoom
  },

  async updateRoom(roomId: string, updates: Partial<PropertyRoom>) {
    const supabase = supabaseAdmin
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
    const supabase = supabaseAdmin
    const { error } = await supabase
      .from('saved_properties')
      .upsert({ user_id: userId, property_id: propertyId, notes })

    if (error) throw new Error(`Failed to save property: ${error.message}`)

    await supabase.from('events').insert({
      actor_id: userId,
      event_type: 'property_saved',
      target_id: propertyId,
      target_type: 'property',
    })
  },

  async unsaveProperty(userId: string, propertyId: string) {
    const supabase = supabaseAdmin
    await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)
  },

  async getSavedProperties(userId: string) {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        property_id,
        notes,
        saved_at,
        properties(
          *,
          property_types(name),
          property_rooms(quantity),
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
    const supabase = supabaseAdmin
    const { data } = await supabase
      .from('saved_properties')
      .select('user_id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single()

    return !!data
  },

  async getSavedPropertiesForStudent(studentId: string) {
    const supabase = supabaseAdmin
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        notes,
        saved_at,
        properties(
          *,
          property_types(name),
          property_rooms(quantity),
          property_media(url, is_primary),
          neighborhoods(name)
        )
      `)
      .eq('user_id', studentId)
      .order('saved_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch saved properties: ${error.message}`)
    return data
  },

  async togglePropertySave(userId: string, propertyId: string, isCurrentlySaved: boolean) {
    if (isCurrentlySaved) {
      await this.unsaveProperty(userId, propertyId)
    } else {
      await this.saveProperty(userId, propertyId)
    }
  },

  // ── Search ───────────────────────────────────────────────────────────────

  async searchProperties(query: string, options?: { campusId?: string; limit?: number }) {
    const supabase = supabaseAdmin

    const escaped = query.replace(/[%_]/g, '\\$&')
    const dbQuery = supabase
      .from('properties')
      .select(`
        *,
        property_types(name),
                 property_rooms(quantity),
        property_media(url, is_primary),
        neighborhoods(name, city_id)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${escaped}%,address.ilike.%${escaped}%,description.ilike.%${escaped}%`)
      .order('campozy_score', { ascending: false })
      .limit(options?.limit || 20)

    const { data, error } = await dbQuery
    if (error) throw new Error(`Search failed: ${error.message}`)
    return data as Property[]
  },
}

