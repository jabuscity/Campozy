'use client'

import * as React from 'react'
import { ThumbsUp, ThumbsDown, Eye, CornerDownRight, ChevronDown } from 'lucide-react'
import type { TipSuggestionWithCategory } from '@/services/tip-service'
import type { OpportunitySuggestion } from '@/services/opportunity-suggestion-service'
import type { Opportunity, OpportunityApplication, Discussion, PropertyReview, ForumPost, CommunityPost } from '@/types'

export interface PostsData {
  tips: {
    pending: TipSuggestionWithCategory[]
    approved: TipSuggestionWithCategory[]
  }
  opportunities: {
    pending: OpportunitySuggestion[]
    applications: Array<OpportunityApplication & { opportunity?: Opportunity }>
  }
  community: {
    discussions: Array<Discussion & { campus?: { name: string }; neighborhood?: { name: string } }>
    forumPosts: Array<ForumPost & { topic?: { title?: string; forum?: { name?: string } }; replyTo?: string }>
    reviews: Array<PropertyReview & { property?: { id: string; name: string; neighborhood?: { name: string } } }>
    feedPosts: CommunityPost[]
  }
}

const fmt = (value?: string) => (value ? new Date(value).toLocaleDateString() : '')

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

type BadgeTone = 'amber' | 'green' | 'red' | 'blue' | 'neutral'

const BADGE_STYLES: Record<BadgeTone, string> = {
  amber: 'bg-amber-100 text-amber-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  neutral: 'bg-neutral-100 text-neutral-700',
}

function PostCard({
  title,
  preview,
  full,
  stats,
  replyTo,
  badge,
  badgeTone = 'amber',
  meta,
  date,
  isExpanded,
  onToggle,
}: {
  title?: string | null
  preview: string
  full: string
  stats: { likes: number; dislikes: number; views: number }
  replyTo?: string
  badge?: string | null
  badgeTone?: BadgeTone
  meta?: string | null
  date?: string
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={`rounded-2xl border p-4 md:p-6 cursor-pointer transition-all duration-300 ease-in-out ${
        isExpanded
          ? 'bg-orange-50 border-orange-200 shadow-md'
          : 'bg-white border-neutral-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-200/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          {title && <p className="font-bold text-neutral-900 truncate">{title}</p>}
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-black rounded-full shrink-0 ${BADGE_STYLES[badgeTone]}`}>{badge}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {date && <span className="text-xs text-neutral-400">{date}</span>}
          <ChevronDown
            className={`h-5 w-5 text-neutral-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {meta && <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide mb-1">{meta}</p>}

      {!isExpanded ? (
        <p className="text-sm text-neutral-600 line-clamp-2">{preview}</p>
      ) : (
        <div className="space-y-3">
          {replyTo && (
            <div className="border-l-2 border-neutral-300 pl-3">
              <p className="text-xs text-neutral-500 line-clamp-1">{replyTo}</p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wide mt-1">
                <CornerDownRight className="h-3.5 w-3.5" /> Reply
              </span>
            </div>
          )}
          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">{full}</p>
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 pt-3 border-t-2 border-orange-200 flex items-center gap-4 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {stats.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            {stats.dislikes}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {stats.views}
          </span>
        </div>
      )}
    </div>
  )
}

export function PostsTab({ data }: { data: PostsData }) {
  const { tips, opportunities, community } = data
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const togglePost = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  const hasTips = tips.pending.length > 0 || tips.approved.length > 0
  const hasOpps = opportunities.pending.length > 0 || opportunities.applications.length > 0
  const hasCommunity =
    community.discussions.length > 0 || community.forumPosts.length > 0 || community.reviews.length > 0
  const hasFeed = community.feedPosts.length > 0

  if (!hasTips && !hasOpps && !hasCommunity) {
    return (
      <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-neutral-200">
        <p className="text-neutral-500">No posts yet.</p>
        <p className="text-sm text-neutral-400 mt-1">Your tips, opportunities, and posts will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {hasTips && (
        <Section title="Tips">
          {tips.pending.map((s) => (
            <PostCard
              key={s.id}
              isExpanded={expandedId === s.id}
              onToggle={() => togglePost(s.id)}
              title={s.title}
              preview={s.description}
              full={s.description}
              badge="PENDING"
              badgeTone="amber"
              meta="Tip Suggestion"
              stats={{ likes: s.upvotes || 0, dislikes: s.downvotes || 0, views: 0 }}
            />
          ))}
          {tips.approved.map((tip) => (
            <PostCard
              key={tip.id}
              isExpanded={expandedId === tip.id}
              onToggle={() => togglePost(tip.id)}
              title={tip.title}
              preview={tip.description}
              full={tip.description}
              meta={tip.category?.name}
              date={fmt(tip.created_at)}
              stats={{ likes: tip.upvotes || 0, dislikes: tip.downvotes || 0, views: 0 }}
            />
          ))}
        </Section>
      )}

      {hasOpps && (
        <Section title="Opportunities">
          {opportunities.pending.map((s) => (
            <PostCard
              key={s.id}
              isExpanded={expandedId === s.id}
              onToggle={() => togglePost(s.id)}
              title={s.title}
              preview={s.description}
              full={s.description}
              badge="PENDING"
              badgeTone="amber"
              meta={s.type}
              stats={{ likes: 0, dislikes: 0, views: 0 }}
            />
          ))}
          {opportunities.applications.map((app) => (
            <PostCard
              key={app.id}
              isExpanded={expandedId === app.id}
              onToggle={() => togglePost(app.id)}
              title={app.opportunity?.title || 'Opportunity'}
              preview={app.opportunity?.description || ''}
              full={app.opportunity?.description || ''}
              badge={app.status.toUpperCase()}
              badgeTone={
                app.status === 'accepted'
                  ? 'green'
                  : app.status === 'rejected'
                    ? 'red'
                    : app.status === 'shortlisted'
                      ? 'blue'
                      : 'neutral'
              }
              date={fmt(app.applied_at)}
              stats={{ likes: 0, dislikes: 0, views: 0 }}
            />
          ))}
        </Section>
      )}

      {hasCommunity && (
        <Section title="Community">
          {community.discussions.map((d) => (
            <PostCard
              key={d.id}
              isExpanded={expandedId === d.id}
              onToggle={() => togglePost(d.id)}
              title={d.title}
              preview={d.content}
              full={d.content}
              meta={d.category?.name}
              date={fmt(d.created_at)}
              stats={{ likes: 0, dislikes: 0, views: d.view_count || 0 }}
            />
          ))}
          {community.forumPosts.map((p) => (
            <PostCard
              key={p.id}
              isExpanded={expandedId === p.id}
              onToggle={() => togglePost(p.id)}
              title={p.topic?.title || 'Forum Post'}
              preview={p.content}
              full={p.content}
              meta={p.topic?.forum?.name}
              date={fmt(p.created_at)}
              replyTo={p.replyTo}
              stats={{ likes: p.upvotes || 0, dislikes: p.downvotes || 0, views: 0 }}
            />
          ))}
          {community.reviews.map((r) => (
            <PostCard
              key={r.id}
              isExpanded={expandedId === r.id}
              onToggle={() => togglePost(r.id)}
              title={r.property?.name || 'Property Review'}
              preview={r.content || ''}
              full={r.content || ''}
              meta={r.property?.neighborhood?.name}
              date={fmt(r.created_at)}
              stats={{ likes: r.helpful_count || 0, dislikes: 0, views: 0 }}
            />
          ))}
        </Section>
      )}

      {hasFeed && (
        <Section title="Feed">
          {community.feedPosts.map((post) => (
            <PostCard
              key={post.id}
              isExpanded={expandedId === post.id}
              onToggle={() => togglePost(post.id)}
              title={post.title}
              preview={post.content}
              full={post.content}
              meta={post.campus?.name}
              date={fmt(post.created_at)}
              stats={{ likes: post.upvotes || 0, dislikes: post.downvotes || 0, views: post.comment_count || 0 }}
            />
          ))}
        </Section>
      )}
    </div>
  )
}
