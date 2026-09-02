import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Discussion, DiscussionCategory } from '@/types'
import { CommunityMobileTabs } from '@/components/community/community-mobile-tabs'
import { CommunityDesktopTabs } from '@/components/community/community-desktop-tabs'

export default async function CommunityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let discussions: Discussion[] = []
  let categories: DiscussionCategory[] = []
  let fetchError = 'none'

  try {
    const { data: discussionsData, error: dErr } = await supabaseAdmin
      .from('discussions')
      .select('*, author:profiles!discussions_user_id_fkey(username, full_name, avatar_url, trust_level), category:discussion_categories(name, id)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)

    if (dErr) fetchError = dErr.message
    discussions = (discussionsData || []) as Discussion[]

    const { data: categoriesData } = await supabaseAdmin
      .from('discussion_categories')
      .select('*')
      .order('name')

    categories = (categoriesData || []) as DiscussionCategory[]
  } catch (err) {
    fetchError = String(err)
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <CommunityMobileTabs discussions={discussions} userId={user?.id || null} />

      <div className="hidden lg:block">
        <CommunityDesktopTabs discussions={discussions} categories={categories} defaultTab="discussions" showEventsTab={false} showDiscussionsTab={false} />
      </div>
    </div>
  )
}
