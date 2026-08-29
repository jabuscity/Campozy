'use client'

import dynamic from 'next/dynamic'
import * as React from 'react'

const ReplyList = dynamic(() => import('./reply-list'), { ssr: false })

export default function ReplyListClient(props: { discussionId: string; initialReplies?: any[] }) {
  return <ReplyList {...props} />
}
