'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronDown, type LucideIcon } from 'lucide-react'

interface ExpandableCardProps {
  id: string
  title: string
  description: string
  icon: LucideIcon
  isExpanded: boolean
  onMobileClick: (id: string) => void
  href?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function ExpandableCard({
  id,
  title,
  description,
  icon: Icon,
  isExpanded,
  onMobileClick,
  href,
  children,
  footer,
  className = '',
}: ExpandableCardProps) {
  return (
    <Link
      href={href || '#'}
      className={`block ${className}`}
      id={`mobile-card-${id}`}
      onClick={(e) => {
        if (window.innerWidth < 1024) {
          e.preventDefault()
          onMobileClick(id)
        }
      }}
    >
      <div
        className={`rounded-2xl border p-4 md:p-6 transition-all duration-300 ease-in-out h-full ${
          isExpanded ? 'bg-orange-50 border-orange-200 shadow-md' : 'bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/60'
        }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-lg font-black text-neutral-900 flex-1">{title}</h3>
          {href && (
            <ChevronDown
              className={`h-5 w-5 text-neutral-400 transition-transform duration-300 lg:hidden ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>

        {isExpanded && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {children}
            {footer}
          </div>
        )}

        {!isExpanded && (
          <>
            <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{description}</p>
          </>
        )}
      </div>
    </Link>
  )
}
