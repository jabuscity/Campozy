import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, Target, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase">
            About Campozy
          </h1>
          <p className="mt-2 text-neutral-500 text-lg max-w-3xl">
            Campozy is building the trust infrastructure for student life in Kenya.
            We connect students, housing, campuses, neighborhoods, and opportunities
            into one intelligent, verified ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">Community First</h3>
            <p className="text-sm text-neutral-500">
              Every feature is designed to strengthen trust between students, campuses, and the local community.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">Verification by Design</h3>
            <p className="text-sm text-neutral-500">
              Identity, reputation, and scout verification keep the ecosystem safe and accountable.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">Student Success</h3>
            <p className="text-sm text-neutral-500">
              From housing to careers, we measure success by how well students transition into the real world.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 p-8">
          <h2 className="text-2xl font-black text-neutral-900 mb-4">Our Mission</h2>
          <p className="text-neutral-500 leading-relaxed mb-6">
            To create a unified platform where students can find housing, build community,
            access opportunities, and transition into careers with confidence and trust.
          </p>
          <Link href="/signup">
            <Button>Join the Network</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
