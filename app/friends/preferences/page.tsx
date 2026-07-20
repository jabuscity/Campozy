'use client';

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PreferenceForm } from "@/components/roommate/preference-form";
import type { FriendProfile, FriendPreference } from "@/types";

export default function FriendPreferencesPage() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = useCallback(async (data: { profile: Partial<FriendProfile>; preferences: Partial<FriendPreference> }) => {
    try {
      const { createOrUpdateFriendProfile, createOrUpdateFriendPreferences } = await import('@/services/matching-service');
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await createOrUpdateFriendProfile({ ...data.profile, student_id: user.id });
      await createOrUpdateFriendPreferences({ ...data.preferences, student_id: user.id });
      setSaved(true);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
              <span className="text-xl font-bold italic">C</span>
            </div>
            <span className="text-xl font-black tracking-tight text-neutral-900 uppercase italic">Campozy</span>
          </Link>
          <Link href="/friends">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
              Friend Preferences
            </h1>
            <p className="text-neutral-600">Tell us about yourself and who you&apos;d like to meet.</p>
          </div>

          {saved ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Preferences Saved!</h2>
              <p className="text-neutral-600 mb-6">We&apos;ll use these to find your ideal friends.</p>
              <Link href="/friends"><Button>View Suggestions</Button></Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <PreferenceForm onSubmit={handleSubmit} step={1} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
