/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MatchBadge } from "@/components/matching/match-badge";
import Image from "next/image";
import { createClient } from '@/lib/supabase/client';
import type { FriendMatch, FriendProfile } from '@/types';

export default function FriendSuggestionsPage() {
  const [matches, setMatches] = useState<(FriendMatch & { profile?: FriendProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const { getFriendMatches } = await import('@/services/matching-service');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await getFriendMatches(user.id, 20, 0);
      const matchesWithProfiles = await Promise.all(
        result.map(async (match) => {
          const { data: profile } = await supabase
            .from('friend_profiles')
            .select('*')
            .eq('student_id', match.match_id)
            .single();
          return { ...match, profile: profile as FriendProfile };
        })
      );
      setMatches(matchesWithProfiles.filter(m => m.profile));
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Suggestions</span>
            </div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
              People You Might Like
            </h1>
            <p className="text-neutral-600">Based on your preferences and activity.</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-neutral-600">Loading suggestions...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <Sparkles className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-neutral-900 mb-2">No Suggestions Yet</h2>
              <p className="text-neutral-600 mb-6">Complete your preferences to get suggestions.</p>
              <Link href="/friends/preferences"><Button>Set Preferences</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map(match => match.profile && (
                <div key={match.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 bg-neutral-100">
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db344?auto=format&fit=crop&q=80&w=600"
                      alt="Friend"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 left-3">
                      <MatchBadge score={Math.round(match.compatibility_score)} size="sm" />
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-neutral-900">Student {match.profile.student_id.slice(-4)}</h3>
                      <p className="text-sm text-neutral-500 line-clamp-2">{match.profile.bio || 'No bio yet'}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {match.match_reasons.slice(0, 3).map((reason, i) => (
                        <span key={i} className="text-[10px] font-bold uppercase tracking-tight text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Connect
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
