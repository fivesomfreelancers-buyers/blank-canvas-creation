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
    <div className="bg-background -m-4 sm:-m-6 lg:-m-8">
      <div className="w-full">
        {chat.loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : (
          <MessagesLayout chat={chat} />
        )}
      </div>
    </div>
  );
};

export default FreelancerMessages;
