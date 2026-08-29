'use client'

import * as React from 'react'
import { type LucideIcon } from 'lucide-react'

interface MobileCategorySectionProps {
  id: string
  label: string
  icon: LucideIcon
  headerHidden: boolean
  children: React.ReactNode
  className?: string
}

export function MobileCategorySection({
  id,
  label,
  icon: Icon,
  headerHidden,
  children,
  className = '',
}: MobileCategorySectionProps) {
  return (
    <div id={id} className={`mb-8 md:mb-10 ${headerHidden ? 'mt-20' : ''} ${className}`}>
      <div className="flex items-center gap-3 mb-4 md:mb-5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg md:text-xl font-black text-neutral-900 uppercase tracking-tight">
          {label}
        </h2>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {children}
      </div>
    </div>
  )
}
