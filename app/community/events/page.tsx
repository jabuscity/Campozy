import { CalendarDays, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EventsPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="lg:hidden bg-white border-b border-neutral-200 py-6">
        <div className="px-4 sm:px-6">
          <Link href="/community" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Community
          </Link>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Events</h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Stay tuned for upcoming campus events, workshops, and webinars.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center py-16 md:py-20 bg-white rounded-3xl border border-neutral-200">
          <CalendarDays className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-neutral-900 mb-2">No Events Yet</h2>
          <p className="text-neutral-500 text-sm">
            Stay tuned for upcoming campus events, workshops, and webinars.
          </p>
        </div>
      </div>
    </div>
  )
}
