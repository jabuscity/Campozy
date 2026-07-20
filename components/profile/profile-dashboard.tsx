'use client'

import { User, ShieldCheck, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function ProfileDashboard({ profile, userId }: { profile: object; userId: string }) {
  const fullName = profile && typeof profile === 'object' && 'full_name' in profile ? String((profile as Record<string, unknown>).full_name || 'User') : 'User'
  const username = profile && typeof profile === 'object' && 'username' in profile ? String((profile as Record<string, unknown>).username || userId.slice(0, 8)) : userId.slice(0, 8)
  const isVerified = profile && typeof profile === 'object' && 'is_verified' in profile ? Boolean((profile as Record<string, unknown>).is_verified) : false

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8 text-center">
          <div className="h-24 w-24 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900">
            {fullName}
          </h2>
          <p className="text-neutral-500 text-sm mt-1">@{username}</p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-500">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            <span>{isVerified ? 'Verified' : 'Unverified'}</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl border border-neutral-200 p-8">
          <h3 className="text-xl font-black text-neutral-900 mb-6 uppercase tracking-tight">
            Account Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <GraduationCap className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-neutral-900">Student Profile</p>
                <p className="text-sm text-neutral-500">Manage your academic and housing preferences.</p>
              </div>
              <Link href="/profile/student">
                <Button variant="ghost" size="sm" className="ml-auto text-primary">Edit</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
