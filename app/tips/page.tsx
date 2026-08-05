import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText, Video, ExternalLink } from 'lucide-react'

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

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="text-6xl mb-6">💡</div>
          <h1 className="text-3xl font-black text-neutral-900 mb-4 tracking-tight">Tips &amp; Tricks</h1>
          <p className="text-neutral-500">Guides, tutorials, and tools to help you make the most of Campozy.</p>
        </div>

        <div className="space-y-4">
          {resources.map((resource) => (
            <Link
              key={resource.href}
              href={resource.href}
              className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200 hover:shadow-lg transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <resource.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-neutral-900">{resource.title}</h3>
                <p className="text-sm text-neutral-500 line-clamp-1">{resource.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 pt-10 border-t border-neutral-100 text-center">
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
          <span className="text-neutral-400 mx-2">|</span>
          <Link href="/signup" className="text-primary font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}