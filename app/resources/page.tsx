import Link from 'next/link'
import { BookOpen, FileText, Video, ExternalLink } from 'lucide-react'

const resources = [
  {
    title: 'Housing Guide',
    description: 'Everything you need to know about finding safe, verified student housing in Kenya.',
    href: '/resources/housing-guide',
    icon: BookOpen,
  },
  {
    title: 'Community Guidelines',
    description: 'How to engage respectfully and safely on Campozy.',
    href: '/resources/community-guidelines',
    icon: FileText,
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step guides for students and campus communities.',
    href: '/resources/tutorials',
    icon: Video,
  },
  {
    title: 'External Links',
    description: 'Useful resources from partner institutions and organizations.',
    href: '/resources/external-links',
    icon: ExternalLink,
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight uppercase italic">
            Resources
          </h1>
          <p className="mt-2 text-neutral-500 text-lg">
            Guides, tutorials, and tools to help you make the most of Campozy.
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
