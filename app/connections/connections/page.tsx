/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, MessageCircle } from "lucide-react";
import type { FriendConnection } from '@/types';

export default function FriendConnectionsPage() {
  const [connections, setConnections] = useState<FriendConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    try {
      const { getFriendConnections } = await import('@/services/matching-service');
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUserId(user.id);

      const result = await getFriendConnections(user.id);
      setConnections(result);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight mb-2">
              My Connections
            </h1>
            <p className="text-neutral-600">Your connections and study buddies.</p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-neutral-600">Loading connections...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
              <UserPlus className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-neutral-900 mb-2">No Connections Yet</h2>
              <p className="text-neutral-600 mb-6">Start connecting with people to see them here.</p>
              <Link href="/connections"><Button>Find Friends</Button></Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map(conn => (
                <div key={conn.id} className="bg-white rounded-2xl border border-neutral-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-neutral-200 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-neutral-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-neutral-900 capitalize">{conn.connection_type.replace('_', ' ')}</h3>
                      <p className="text-sm text-neutral-500">
                        {conn.user_a === userId ? conn.user_b : conn.user_a}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
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
