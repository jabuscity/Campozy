'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { Button } from './ui/button'
import { SearchModal } from './search-modal'

export function SearchTrigger() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-neutral-500"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>
      
      <SearchModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}
