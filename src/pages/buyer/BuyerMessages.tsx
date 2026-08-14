import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import MessagesLayout from '@/components/chat/MessagesLayout';

const BuyerMessages = () => {
  const location = useLocation();
  const chat = useConversations();

  useEffect(() => {
    chat.fetchConversations();
  }, [location.state]);

  // Auto-open conversation when navigated with state
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
    if (location.state?.openConversation && window.innerWidth >= 768) {
      const first = chat.conversations[0];
      chat.selectConversation(first.conversationId, first.partnerId);
    }
  }, [location.state, chat.conversations, chat.selectedConversationId]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Communicate with your freelancers</p>
        </div>

        {chat.loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : (
          <MessagesLayout chat={chat} heightClass="h-[700px]" />
        )}
      </div>
    </div>
  );
};

export default BuyerMessages;
