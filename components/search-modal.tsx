'use client'

import * as React from 'react'
import { Search, X, MapPin, Building, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = React.useState('')
  const router = useRouter()
  
  // Close on Escape
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-neutral-100 flex items-center gap-4">
          <Search className="h-6 w-6 text-primary" />
          <input 
            autoFocus
            type="text" 
            placeholder="Search campuses, neighborhoods, or hostels..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold placeholder:text-neutral-300 text-neutral-900 h-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
           {query.length > 0 ? (
             <div className="space-y-6">
                <div>
                   <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Top Results</h4>
                   <div className="space-y-2">
                      <SearchResultItem 
                         icon={<GraduationCap className="h-4 w-4" />} 
                         title="University of Nairobi" 
                         subtitle="Main Campus" 
                         onClick={() => { router.push('/discovery?campus=uon'); onClose(); }}
                      />
                      <SearchResultItem 
                         icon={<MapPin className="h-4 w-4" />} 
                         title="Kenyatta University" 
                         subtitle="84 Properties Verified" 
                         onClick={() => { router.push('/discovery?campus=ku'); onClose(); }}
                      />
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-8">
                <div>
                   <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Trending Campuses</h4>
                   <div className="flex flex-wrap gap-2">
                      {['UON', 'JKUAT', 'KU', 'Daystar', 'Strathmore'].map(c => (
                        <button key={c} className="px-4 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm font-bold text-neutral-700 hover:border-primary hover:text-primary transition-all">
                           {c}
                        </button>
                      ))}
                   </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Quick Links</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <QuickLink 
                         icon={<Building className="h-5 w-5" />} 
                         label="Map New Property" 
                         color="bg-primary text-white" 
                      />
                      <QuickLink 
                         icon={<ShieldCheck className="h-5 w-5 text-success" />} 
                         label="Verification Queue" 
                         color="bg-neutral-50" 
                      />
                   </div>
                </div>
             </div>
           )}
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
           <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <span>ESC to Close</span>
              <span>ENTER to Search</span>
           </div>
           <Badge variant="outline" className="text-[10px]">Campozy Search v1.0</Badge>
        </div>
      </div>
    </div>
  )
}

function SearchResultItem({ icon, title, subtitle, onClick }: { icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary group transition-all text-left">
       <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
             {icon}
          </div>
          <div>
             <div className="font-bold text-neutral-900 group-hover:text-white transition-colors">{title}</div>
             <div className="text-xs text-neutral-400 group-hover:text-white/70 transition-colors uppercase font-bold tracking-tighter">{subtitle}</div>
          </div>
       </div>
       <ArrowRight className="h-5 w-5 text-neutral-300 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0" />
    </button>
  )
}

function QuickLink({ icon, label, color }: { icon: React.ReactNode, label: string, color: string }) {
  return (
    <button className={cn("flex items-center gap-3 p-4 rounded-2xl border border-neutral-200 transition-all hover:shadow-lg font-bold text-sm", color)}>
       {icon}
       {label}
    </button>
  )
}

