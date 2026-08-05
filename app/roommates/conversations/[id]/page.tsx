/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import * as React from "react";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from '@/lib/utils';
import type { RoommateConversation, RoommateMessage } from '@/types';

export default function ConversationPage({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = React.useState<RoommateConversation | null>(null);
  const [messages, setMessages] = React.useState<RoommateMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    try {
      const { getRoommateMessages, getOrCreateRoommateConversation } = await import('@/services/matching-service');
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUserId(user.id);

      const conv = await getOrCreateRoommateConversation(user.id, params.id);
      setConversation(conv);
      if (conv) {
        const msgs = await getRoommateMessages(conv.id, 50, 0);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !userId) return;
    try {
      const { sendRoommateMessage } = await import('@/services/matching-service');
      const msg = await sendRoommateMessage(conversation.id, userId, newMessage);
      if (msg) {
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, conversation, userId]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-neutral-600">Loading conversation...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 flex flex-col h-[calc(100vh-120px)]">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="font-black text-neutral-900">Roommate Chat</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-neutral-500 py-8">Nothing here yet.</p>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-sm",
                        msg.sender_id === userId
                          ? 'bg-primary text-white ml-auto rounded-br-sm'
                          : 'bg-neutral-100 text-neutral-900 rounded-bl-sm'
                      )}
                    >
                      {msg.content}
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-neutral-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 h-12 rounded-xl border border-neutral-200 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Button onClick={sendMessage} size="icon">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
