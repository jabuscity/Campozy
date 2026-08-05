import { Button } from '@/components/ui/button'
import { ArrowLeft, PenSquare } from 'lucide-react'
import Link from 'next/link'
import { createDiscussionAction } from '@/app/actions/community-actions'

export default function AskQuestionPage() {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-white border-b border-neutral-200 py-8 md:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Link href="/community" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Community
          </Link>
          <h1 className="text-3xl font-black text-neutral-900 mb-2 tracking-tight uppercase">Ask a Question</h1>
          <p className="text-neutral-600">Get answers from students who know the area.</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <form action={createDiscussionAction} className="bg-white rounded-3xl border border-neutral-200 p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-xs font-black text-neutral-900 uppercase tracking-widest">Your Question</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g., Is water reliable at Westlands Residency?"
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-xs font-black text-neutral-900 uppercase tracking-widest">Details (optional)</label>
            <textarea
              id="content"
              name="content"
              placeholder="Add more context to help others understand your question..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32"
            />
          </div>

          <input type="hidden" name="categoryId" value="general" />

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-bold text-base"
          >
            <PenSquare className="h-4 w-4 mr-2" /> Post Question
          </Button>
        </form>
      </div>
    </div>
  )
}
