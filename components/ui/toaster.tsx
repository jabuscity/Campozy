'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'loading'

interface Toast {
  id: string
  message: string
  type: ToastType
}

const ToastContext = React.createContext<{
  toast: (message: string, type?: ToastType) => void
} | null>(null)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    
    if (type !== 'loading') {
       setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
       }, 4000)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={cn(
              "flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border min-w-[320px] animate-in slide-in-from-right-10 duration-300 bg-white",
              t.type === 'success' && "border-success/20",
              t.type === 'error' && "border-danger/20",
              t.type === 'info' && "border-primary/20"
            )}
          >
            <div className={cn(
               "flex h-10 w-10 items-center justify-center rounded-xl",
               t.type === 'success' && "bg-success/10 text-success",
               t.type === 'error' && "bg-danger/10 text-danger",
               t.type === 'info' && "bg-primary/10 text-primary",
               t.type === 'loading' && "bg-neutral-100 text-neutral-400"
            )}>
               {t.type === 'success' && <CheckCircle2 className="h-6 w-6" />}
               {t.type === 'error' && <AlertCircle className="h-6 w-6" />}
               {t.type === 'info' && <Info className="h-6 w-6" />}
               {t.type === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
            <p className="flex-1 text-sm font-bold text-neutral-900">{t.message}</p>
            <button onClick={() => removeToast(t.id)} className="text-neutral-300 hover:text-neutral-900 transition-colors">
               <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToasterProvider')
  return context
}
