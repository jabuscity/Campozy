'use client'

import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { ReportUtilityModal } from '@/components/report-utility-modal'

export function ReportTrigger() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        aria-label="Report Utility Issue"
      >
        <AlertTriangle className="h-5 w-5" />
      </button>
      {isOpen && (
        <ReportUtilityModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}
