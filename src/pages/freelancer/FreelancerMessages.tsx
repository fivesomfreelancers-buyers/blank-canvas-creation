import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import MessagesLayout from '@/components/chat/MessagesLayout';

const FreelancerMessages = () => {
  const location = useLocation();
  const chat = useConversations();

  useEffect(() => {
    chat.fetchConversations();
  }, [location.state]);

  useEffect(() => {
    if (chat.conversations.length === 0 || chat.selectedConversationId) return;
    const search = new URLSearchParams(location.search);
    const targetId = location.state?.openConversationId || search.get('c') || undefined;
    const partnerId = location.state?.partnerId || search.get('u') || undefined;
    if (targetId) {
      const match = chat.conversations.find(c => c.conversationId === targetId);
      if (match) { chat.selectConversation(match.conversationId, match.partnerId); return; }
    }
    if (partnerId) {
      const match = chat.conversations.find(c => c.partnerId === partnerId);
      if (match) { chat.selectConversation(match.conversationId, match.partnerId); return; }
    }
  }, [location.state, chat.conversations, chat.selectedConversationId]);

  return (
    <div className="min-h-screen p-3 sm:p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
          <p className="mt-1 sm:mt-2 text-muted-foreground text-sm sm:text-base">Communicate with your buyers</p>
        </div>

        {chat.loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : (
          <MessagesLayout chat={chat} heightClass="h-[600px]" />
        )}
      </div>
    </div>
  );
};

export default FreelancerMessages;
