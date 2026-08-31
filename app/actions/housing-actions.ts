'use server'

import { HousingService } from '@/services/housing-service'
import { IdentityService } from '@/services/identity-service'
import { revalidatePath } from 'next/cache'

export async function searchProperties(campusId: string, options?: { limit?: number; offset?: number }) {
  return await HousingService.getPropertiesByCampus(campusId, options)
}

export async function togglePropertySave(propertyId: string, isCurrentlySaved: boolean) {
  await HousingService.togglePropertySave(propertyId, isCurrentlySaved)
  revalidatePath(`/property/${propertyId}`)
}

export async function getSavedProperties() {
  const currentUser = await IdentityService.getCurrentUser()
  if (!currentUser) return []
  return await HousingService.getSavedProperties()
}

export async function removeSavedPropertyAction(formData: FormData) {
  const propertyId = formData.get('propertyId') as string
  const currentUser = await IdentityService.getCurrentUser()
  
  if (currentUser) {
    await HousingService.togglePropertySave(propertyId, true)
    revalidatePath('/housing/saved')
  }
}
