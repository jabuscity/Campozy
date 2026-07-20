import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft, Search, GraduationCap, Building2, Users } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-12">
         <div className="h-40 w-40 bg-primary/5 rounded-full flex items-center justify-center animate-pulse">
            <MapPin className="h-20 w-20 text-primary opacity-20" />
         </div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-neutral-900 leading-none italic select-none">
            404
         </div>
      </div>

      <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight uppercase italic">You&apos;re Off the Map.</h1>
      <p className="text-neutral-500 text-lg max-w-md mx-auto mb-10 leading-relaxed font-medium">
        The page you&apos;re looking for doesn&apos;t exist or has been moved to a new campus. Let&apos;s get you back to familiar territory.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
         <Link href="/">
            <Button size="lg" className="px-10 h-16 text-lg font-bold gap-2">
               <ArrowLeft className="h-5 w-5" /> Back to Home
            </Button>
         </Link>
         <Link href="/discovery">
            <Button variant="outline" size="lg" className="px-10 h-16 text-lg font-bold border-2 gap-2">
               <Search className="h-5 w-5" /> Browse Housing
            </Button>
         </Link>
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-xs font-black text-neutral-300 uppercase tracking-[0.3em] mb-6">Explore Campozy</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NavLink href="/universities" icon={<GraduationCap className="h-4 w-4" />} label="Universities" />
          <NavLink href="/campuses" icon={<GraduationCap className="h-4 w-4" />} label="Campuses" />
          <NavLink href="/neighborhoods" icon={<MapPin className="h-4 w-4" />} label="Neighborhoods" />
          <NavLink href="/community" icon={<Users className="h-4 w-4" />} label="Community" />
          <NavLink href="/opportunities" icon={<Building2 className="h-4 w-4" />} label="Opportunities" />
          <NavLink href="/businesses" icon={<Building2 className="h-4 w-4" />} label="Businesses" />
          <NavLink href="/founders" icon={<Users className="h-4 w-4" />} label="Founders" />
          <NavLink href="/alumni" icon={<GraduationCap className="h-4 w-4" />} label="Alumni" />
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-2">
         <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">Official Intelligence Alert</p>
         <div className="h-1 w-20 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full animate-progress" />
         </div>
      </div>
    </div>
  )
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 hover:border-primary hover:text-primary transition-all text-sm font-bold text-neutral-600 uppercase tracking-tight"
    >
      {icon}
      {label}
    </Link>
  )
}
