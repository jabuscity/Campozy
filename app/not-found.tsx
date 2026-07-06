import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, ArrowLeft, Search } from 'lucide-react'

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
      
      <h1 className="text-4xl font-black text-neutral-900 mb-4 tracking-tight uppercase italic">You're Off the Map.</h1>
      <p className="text-neutral-500 text-lg max-w-md mx-auto mb-10 leading-relaxed font-medium">
        The page you're looking for doesn't exist or has been moved to a new campus. Let's get you back to familiar territory.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
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

      <div className="mt-20 flex flex-col items-center gap-2">
         <p className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">Official Intelligence Alert</p>
         <div className="h-1 w-20 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full animate-progress" />
         </div>
      </div>
    </div>
  )
}
