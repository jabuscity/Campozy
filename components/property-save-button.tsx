'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { togglePropertySave } from '@/app/actions/housing-actions'

function PropertySaveButton({ propertyId, userId, initialIsSaved }: { propertyId: string; userId: string | undefined; initialIsSaved: boolean }) {
  const [saved, setSaved] = useState(initialIsSaved)

  const handleToggleSave = async () => {
    if (!userId) {
      console.warn('User not authenticated. Cannot save property.')
      return
    }
    setSaved(prev => !prev)
    await togglePropertySave(propertyId, saved)
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={handleToggleSave}
      className={cn('transition-colors', saved ? 'text-red-500 hover:text-red-600' : 'text-neutral-500 hover:text-neutral-600')}
    >
      <Heart className={cn('h-5 w-5', saved && 'fill-red-500')} />
    </Button>
  )
}

export default PropertySaveButton