'use server'

import { HousingService } from '@/services/housing-service'
import { revalidatePath } from 'next/cache'

export async function searchProperties(campusId: string, options?: { limit?: number; offset?: number }) {
  return await HousingService.getPropertiesByCampus(campusId, options)
}

export async function togglePropertySave(userId: string, propertyId: string, isCurrentlySaved: boolean) {
  if (isCurrentlySaved) {
    await HousingService.unsaveProperty(userId, propertyId)
  } else {
    await HousingService.saveProperty(userId, propertyId)
  }
  revalidatePath(`/property/${propertyId}`)
}
