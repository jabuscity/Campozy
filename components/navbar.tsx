import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavbarActions } from './navbar-actions'
import { DesktopNav } from './desktop-nav'
import { StudentService } from '@/services/student-service'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let student = null
  if (user) {
    try {
      student = await StudentService.getStudent(user.id)
    } catch {
      student = null
    }
  }

  const campus = student?.campus as { id: string; name: string; universities?: { name: string } } | undefined
  const campusId = campus?.id || ''
  const campusName = campus?.name || ''
  const universityName = campus?.universities?.name || ''

  const housingHref = '/neighborhoods'

  const navGroups = [
    { label: 'Housing', items: [] },
    { label: 'Community', items: [
        { href: '/community', label: 'Discussions' },
        { href: '/connections', label: 'Connections' },
      ]},
    { label: 'Opportunities', items: [
        { href: '/opportunities', label: 'Opportunities' },
        { href: '/resources', label: 'Resources' },
      ]},
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg transition-transform group-hover:scale-110">
              <span className="text-xl font-bold italic">C</span>
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900 uppercase italic">
              Campozy
            </span>
          </Link>

          <DesktopNav navGroups={navGroups} housingHref={housingHref} />
        </div>

        <NavbarActions user={user} />
      </div>
    </nav>
  )
}
