/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FriendCard } from "@/components/friend/friend-card";
import { ArrowLeft, Users, Settings, Sparkles, RefreshCw } from "lucide-react";
import type { FriendMatch, FriendProfile } from "@/types";

export default function FriendsPage() {
  const [matches, setMatches] = useState<(FriendMatch & { profile?: FriendProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const { getFriendMatches, getFriendProfile } = await import('@/services/matching-service');
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUserId(user.id);

      const profileResult = await getFriendProfile(user.id);
      setHasProfile(!!profileResult?.profile);

      if (profileResult?.profile) {
        const matchesResult = await getFriendMatches(user.id, 20, 0);
        const matchesWithProfiles = await Promise.all(
          matchesResult.map(async (match) => {
            const { data: profile } = await supabase
              .from('friend_profiles')
              .select('*')
              .eq('student_id', match.match_id)
              .single();
            return { ...match, profile: profile as FriendProfile };
          })
        );
        setMatches(matchesWithProfiles.filter(m => m.profile));
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMatches();
  }, [loadMatches]);

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
          <div className="flex items-center gap-3">
            <Link href="/friends/preferences">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full mb-4">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Friendfinder</span>
            </div>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight mb-4">
              Find Your <span className="text-secondary italic">Crew</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Connect with students who share your interests and vibe.
            </p>
          </div>

          {!hasProfile ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <Sparkles className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-neutral-900 mb-2">Set Up Your Profile</h2>
              <p className="text-neutral-600 mb-6">Complete your friend profile to start getting suggestions.</p>
              <Link href="/friends/preferences"><Button>Get Started</Button></Link>
            </div>
          ) : loading ? (
            <div className="text-center py-20">
              <RefreshCw className="h-8 w-8 animate-spin text-secondary mx-auto mb-4" />
              <p className="text-neutral-600">Finding your best matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <Users className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-neutral-900 mb-2">No Suggestions Yet</h2>
              <p className="text-neutral-600 mb-6">Check back later or update your preferences.</p>
              <Link href="/friends/preferences"><Button>Update Preferences</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(match => match.profile && (
                <FriendCard
                  key={match.id}
                  match={match}
                  profile={match.profile}
                  onConnect={() => {
                    if (!userId) return;
                    import('@/services/matching-service').then(({ recordFriendInteraction }) =>
                      recordFriendInteraction(userId, match.match_id, 'liked')
                    );
                  }}
                  onMessage={() => {
                    window.location.href = `/roommates/conversations/${match.id}`;
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
