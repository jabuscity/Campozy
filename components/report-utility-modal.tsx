'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, X } from 'lucide-react'
import { ReportForm } from '@/components/report-form'
import { useRouter } from 'next/navigation'

export function ReportUtilityModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="report-modal-scroll relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-neutral-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Report Utility Issue</h2>
              <p className="text-xs text-neutral-500">Help the community stay informed</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-4">
          <ReportForm
            onSuccess={() => {
              setTimeout(() => {
                onClose()
                router.refresh()
              }, 1500)
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
