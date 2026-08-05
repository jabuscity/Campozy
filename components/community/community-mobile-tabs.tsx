'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DiscussionCard } from '@/components/ui/discussion-card'
import { MessageCircle, Users, ArrowRight } from 'lucide-react'
import type { Discussion } from '@/types'

interface CommunityMobileTabsProps {
  discussions: Discussion[]
}

export function CommunityMobileTabs({ discussions }: CommunityMobileTabsProps) {
  const [activeTab, setActiveTab] = useState<'discussions' | 'connections'>('discussions')
  const trendingDiscussions = (discussions || []).slice(0, 5)

  return (
    <div className="lg:hidden">
      <div className="bg-white border-b border-neutral-200 py-6">
        <div className="px-4 sm:px-6">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Student Community</h1>
          <p className="text-neutral-600 mt-1 text-sm">
            Ask questions, share tips, and connect with students.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4">
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-4">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'discussions'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Discussions
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'connections'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Users className="h-4 w-4" />
            Connections
          </button>
        </div>

        {activeTab === 'discussions' && (
          <div className="space-y-4">
            {trendingDiscussions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
                <MessageCircle className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">No discussions yet</p>
                <Link href="/community/ask">
                  <Button className="mt-4 rounded-full font-bold">Start a Discussion</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {trendingDiscussions.map((discussion) => (
                  <DiscussionCard
                    key={discussion.id}
                    id={discussion.id}
                    title={discussion.title}
                    content={discussion.content}
                    authorName={discussion.author?.full_name || 'Anonymous'}
                    createdAt={discussion.created_at}
                    commentCount={discussion.reply_count || 0}
                    categoryName={discussion.category?.name}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center">
              <Users className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-black text-neutral-900 mb-2">Discover Your People</h3>
              <p className="text-neutral-500 mb-4 text-sm">Browse students at your institution and see your compatibility scores.</p>
              <Link href="/connections">
                <Button className="rounded-full font-bold">Browse Connections</Button>
              </Link>
            </div>

            <Link href="/connections" className="flex items-center gap-4 bg-white border border-neutral-200 rounded-2xl p-4 hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-neutral-900">All Connections</h3>
                <p className="text-xs text-neutral-500">View all students and compatibility scores</p>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-400 flex-shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
