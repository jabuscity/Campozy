import Link from 'next/link'

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Roadmap
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Campozy&apos;s vision for student life infrastructure in Kenya.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-neutral-200 p-8">
            <h2 className="text-2xl font-black text-neutral-900 mb-4">Phase 1: Foundation</h2>
            <p className="text-neutral-500 leading-relaxed">
              Verified housing, identity verification, and trust scoring for students, owners, and businesses.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-neutral-200 p-8">
            <h2 className="text-2xl font-black text-neutral-900 mb-4">Phase 2: Community</h2>
            <p className="text-neutral-500 leading-relaxed">
              Campus and neighborhood communities, discussions, reviews, and recommendations.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-neutral-200 p-8">
            <h2 className="text-2xl font-black text-neutral-900 mb-4">Phase 3: Opportunities</h2>
            <p className="text-neutral-500 leading-relaxed">
              Internships, scholarships, mentorships, jobs, and employer network.
            </p>
          </div>
          <div className="bg-white rounded-3xl border border-neutral-200 p-8">
            <h2 className="text-2xl font-black text-neutral-900 mb-4">Phase 4: Governance</h2>
            <p className="text-neutral-500 leading-relaxed">
              Founders, ambassadors, scouts, and community moderation.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/founders">
            <span className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary/90 transition-all">
              Join the Founders Council
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
