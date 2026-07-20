'use client'

import * as React from 'react'
import { Search, X, MapPin, Building, GraduationCap, MessageSquare, Users, Home, Briefcase } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'

type ResultItem = {
  id: string
  title: string
  subtitle: string
  href: string
  icon: React.ReactNode
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<ResultItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  React.useEffect(() => {
    if (!query.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      const q = query.trim()
      const supabase = createClient()
      const items: ResultItem[] = []

      const [
        uniData,
        campusData,
        neighborhoodData,
        propertyData,
        businessData,
        discussionData,
        opportunityData,
        alumniData,
        founderData,
        roommateData,
        friendData,
      ] = await Promise.all([
        supabase.from('universities').select('id, name').ilike('name', `%${q}%`).limit(3),
        supabase.from('campuses').select('id, name').ilike('name', `%${q}%`).limit(3),
        supabase.from('neighborhoods').select('id, name').ilike('name', `%${q}%`).limit(3),
        supabase.from('properties').select('id, name').ilike('name', `%${q}%`).limit(3),
        supabase.from('businesses').select('id, name').ilike('name', `%${q}%`).limit(3),
        supabase.from('discussions').select('id, title').ilike('title', `%${q}%`).limit(3),
        supabase.from('opportunities').select('id, title').ilike('title', `%${q}%`).limit(3),
        supabase.from('alumni_profiles').select('id, current_position, current_company').or(`current_position.ilike.%${q}%,current_company.ilike.%${q}%`).limit(3),
        supabase.from('founder_memberships').select('id, profile:profiles(full_name)').limit(3),
        supabase.from('roommate_profiles').select('id, bio, student:profiles(full_name)').or(`bio.ilike.%${q}%`).limit(3),
        supabase.from('friend_profiles').select('id, bio, student:profiles(full_name)').or(`bio.ilike.%${q}%`).limit(3),
      ])

      for (const u of uniData.data || []) items.push({ id: u.id, title: u.name, subtitle: 'University', href: `/universities/${u.id}`, icon: <GraduationCap className="h-4 w-4" /> })
      for (const c of campusData.data || []) items.push({ id: c.id, title: c.name, subtitle: 'Campus', href: `/campuses/${c.id}`, icon: <GraduationCap className="h-4 w-4" /> })
      for (const n of neighborhoodData.data || []) items.push({ id: n.id, title: n.name, subtitle: 'Neighborhood', href: `/neighborhoods/${n.id}`, icon: <MapPin className="h-4 w-4" /> })
      for (const p of propertyData.data || []) items.push({ id: p.id, title: p.name, subtitle: 'Property', href: `/property/${p.id}`, icon: <Home className="h-4 w-4" /> })
      for (const b of businessData.data || []) items.push({ id: b.id, title: b.name, subtitle: 'Business', href: `/businesses/${b.id}`, icon: <Building className="h-4 w-4" /> })
      for (const d of discussionData.data || []) items.push({ id: d.id, title: d.title, subtitle: 'Discussion', href: `/community`, icon: <MessageSquare className="h-4 w-4" /> })
      for (const o of opportunityData.data || []) items.push({ id: o.id, title: o.title, subtitle: 'Opportunity', href: `/opportunities/${o.id}`, icon: <Briefcase className="h-4 w-4" /> })
      for (const a of alumniData.data || []) items.push({ id: a.id, title: a.current_position || 'Alumni', subtitle: a.current_company || '', href: `/alumni`, icon: <GraduationCap className="h-4 w-4" /> })
      for (const f of founderData.data || []) {
        const profileArr = f && typeof f === 'object' && 'profile' in f ? (f as { profile: { full_name: string }[] }).profile : []
        const profile = Array.isArray(profileArr) ? profileArr[0] : null
        items.push({ id: f.id, title: profile?.full_name || 'Founder', subtitle: `Score: ${(f as unknown as { contribution_score: number }).contribution_score}`, href: `/founders`, icon: <Users className="h-4 w-4" /> })
      }
      for (const r of roommateData.data || []) {
        const studentArr = r && typeof r === 'object' && 'student' in r ? (r as { student: { full_name: string }[] }).student : []
        const student = Array.isArray(studentArr) ? studentArr[0] : null
        items.push({ id: r.id, title: student?.full_name || 'Student', subtitle: r.bio || 'Roommate', href: `/roommates`, icon: <Users className="h-4 w-4" /> })
      }
      for (const fr of friendData.data || []) {
        const studentArr = fr && typeof fr === 'object' && 'student' in fr ? (fr as { student: { full_name: string }[] }).student : []
        const student = Array.isArray(studentArr) ? studentArr[0] : null
        items.push({ id: fr.id, title: student?.full_name || 'Student', subtitle: fr.bio || 'Friend', href: `/friends`, icon: <Users className="h-4 w-4" /> })
      }

      setResults(items)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

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
            ref={searchRef}
            type="text" 
            placeholder="Search Campozy..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold placeholder:text-neutral-300 text-neutral-900 h-12"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
          {query.length > 0 && loading && (
            <div className="text-center py-8">
              <p className="text-sm text-neutral-400">Searching...</p>
            </div>
          )}

          {query.length > 0 && !loading && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-neutral-500">No results found for &quot;{query}&quot;</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((item) => (
                <button
                  key={`${item.href}-${item.id}`}
                  onClick={() => { router.push(item.href); onClose(); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary group transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500 group-hover:bg-white/20 group-hover:text-white transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-neutral-900 group-hover:text-white transition-colors">{item.title}</div>
                      <div className="text-xs text-neutral-400 group-hover:text-white/70 transition-colors uppercase font-bold tracking-tighter">{item.subtitle}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length === 0 && (
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Quick Links</h4>
                <div className="grid grid-cols-2 gap-4">
                  <QuickLink icon={<Home className="h-5 w-5" />} label="Browse Housing" href="/discovery" color="bg-primary text-white" onClose={onClose} />
                  <QuickLink icon={<MessageSquare className="h-5 w-5" />} label="Community" href="/community" color="bg-neutral-50" onClose={onClose} />
                  <QuickLink icon={<GraduationCap className="h-5 w-5" />} label="Universities" href="/universities" color="bg-neutral-50" onClose={onClose} />
                  <QuickLink icon={<Briefcase className="h-5 w-5" />} label="Opportunities" href="/opportunities" color="bg-neutral-50" onClose={onClose} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-between items-center">
          <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            <span>ESC to Close</span>
            <span>Type to Search</span>
          </div>
          <Badge variant="outline" className="text-[10px]">Campozy Search</Badge>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ icon, label, href, color, onClose }: { icon: React.ReactNode; label: string; href: string; color: string; onClose: () => void }) {
  const router = useRouter()
  return (
    <button onClick={() => { router.push(href); onClose() }} className={cn("flex items-center gap-3 p-4 rounded-2xl border border-neutral-200 transition-all hover:shadow-lg font-bold text-sm", color)}>
      {icon}
      {label}
    </button>
  )
}