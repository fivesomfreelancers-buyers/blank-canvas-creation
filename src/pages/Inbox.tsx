import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import MessagesLayout from '@/components/chat/MessagesLayout';

/**
 * Universal inbox — usable by every signed-in account (member, buyer,
 * freelancer, admin). Email links and "Contact" buttons land here so nobody is
 * bounced out of messaging because of their role.
 */
const Inbox: React.FC = () => {
  const location = useLocation();
  const chat = useConversations();

  useEffect(() => {
    chat.fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (chat.conversations.length === 0 || chat.selectedConversationId) return;
    const search = new URLSearchParams(location.search);
    const targetId = (location.state as any)?.openConversationId || search.get('c') || undefined;
    const partnerId = (location.state as any)?.partnerId || search.get('u') || undefined;

    if (targetId) {
      const match = chat.conversations.find((c) => c.conversationId === targetId);
      if (match) { chat.selectConversation(match.conversationId, match.partnerId); return; }
    }
    if (partnerId) {
      const match = chat.conversations.find((c) => c.partnerId === partnerId);
      if (match) { chat.selectConversation(match.conversationId, match.partnerId); return; }
    }
    // On phones keep the conversation list visible first (WhatsApp behaviour)
    if (window.innerWidth < 768) return;
    const first = chat.conversations[0];
    if (first) chat.selectConversation(first.conversationId, first.partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.search, chat.conversations, chat.selectedConversationId]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Chat with members, sellers and the Fivesom team
          </p>
        </div>

        {chat.loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : (
          <MessagesLayout chat={chat} heightClass="h-[640px]" />
        )}
      </div>
    </div>
  );
};

export default Inbox;
