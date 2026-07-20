'use client';

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RoommateCard } from "@/components/roommate/roommate-card";
import { ArrowLeft, Heart, Settings, Sparkles, RefreshCw } from "lucide-react";
import type { RoommateMatch, RoommateProfile } from "@/types";

export default function RoommatesPage() {
  const [matches, setMatches] = useState<(RoommateMatch & { profile?: RoommateProfile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { getRoommateMatches, getRoommateProfile } = await import('@/services/matching-service');
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }
        setUserId(user.id);

        const profileResult = await getRoommateProfile(user.id);
        setHasProfile(!!profileResult?.profile);

        if (profileResult?.profile) {
          const matchesResult = await getRoommateMatches(user.id, 20, 0);
          const matchesWithProfiles = await Promise.all(
            matchesResult.map(async (match) => {
              const { data: profile } = await supabase
                .from('roommate_profiles')
                .select('*')
                .eq('student_id', match.match_id)
                .single();
              return { ...match, profile: profile as RoommateProfile };
            })
          );
          setMatches(matchesWithProfiles.filter(m => m.profile));
        }
      } catch (error) {
        console.error('Error loading matches:', error);
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    })();
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
          <div className="flex items-center gap-3">
            <Link href="/roommates/preferences">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-3 md:mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Roommate Finder</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-3 md:mb-4">
              Find Your <span className="text-primary italic">Perfect Roommate</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
              Smart matching based on lifestyle, budget, and academic preferences.
            </p>
          </div>

          {!hasProfile ? (
            <div className="text-center py-12 md:py-20 bg-white rounded-2xl border border-neutral-200">
              <Sparkles className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-2">Set Up Your Profile</h2>
              <p className="text-neutral-600 mb-4 md:mb-6 text-sm md:text-base">Complete your roommate profile to start getting matches.</p>
              <Link href="/roommates/preferences"><Button>Get Started</Button></Link>
            </div>
          ) : loading ? (
            <div className="text-center py-12 md:py-20">
              <RefreshCw className="h-6 md:h-8 w-6 md:w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-neutral-600 text-sm md:text-base">Finding your best matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12 md:py-20 bg-white rounded-2xl border border-neutral-200">
              <Heart className="h-10 md:h-12 w-10 md:w-12 text-neutral-300 mx-auto mb-3 md:mb-4" />
              <h2 className="text-xl md:text-2xl font-black text-neutral-900 mb-2">No Matches Yet</h2>
              <p className="text-neutral-600 mb-4 md:mb-6 text-sm md:text-base">Check back later or update your preferences.</p>
              <Link href="/roommates/preferences"><Button>Update Preferences</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {matches.map(match => match.profile && (
                <RoommateCard
                  key={match.id}
                  match={match}
                  profile={match.profile}
                  onLike={() => {
                    if (!userId) return;
                    import('@/services/matching-service').then(({ recordRoommateInteraction }) =>
                      recordRoommateInteraction(userId, match.match_id, 'like')
                    );
                  }}
                  onPass={() => {
                    if (!userId) return;
                    import('@/services/matching-service').then(({ recordRoommateInteraction }) =>
                      recordRoommateInteraction(userId, match.match_id, 'pass')
                    );
                  }}
                  onMessage={() => {
                    window.location.href = `/roommates/conversations/${match.id}`;
                  }}
                />
              ))}
            </div>
          )}
          {error && <p className="text-center text-danger mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
}
