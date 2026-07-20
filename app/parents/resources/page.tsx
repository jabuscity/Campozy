import Link from 'next/link'
import { Shield, FileText, Droplet, Zap } from 'lucide-react'

const resources = [
  {
    title: 'Housing Confidence Reports',
    description: 'Understand verification signals, utility reliability, and community reviews for student housing.',
    href: '/resources/housing-confidence',
    icon: Shield,
  },
  {
    title: 'Safety Information',
    description: 'Neighborhood safety scores, scout reports, and community warnings.',
    href: '/resources/safety',
    icon: FileText,
  },
  {
    title: 'Utility Reports',
    description: 'Water, electricity, and internet reliability reports for properties.',
    href: '/resources/utilities',
    icon: Zap,
  },
  {
    title: 'Parent Resources',
    description: 'Guides for parents on supporting students through housing and career transitions.',
    href: '/resources/guides',
    icon: Droplet,
  },
]

export default function ParentResourcesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Parent Resources
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Tools and information to help parents support their students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Link
              key={resource.href}
              href={resource.href}
              className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-all h-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <resource.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-neutral-900">{resource.title}</h3>
              </div>
              <p className="text-sm text-neutral-500 line-clamp-2">{resource.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
