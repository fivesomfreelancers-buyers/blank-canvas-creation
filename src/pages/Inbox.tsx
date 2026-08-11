import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversations } from '@/hooks/useConversations';
import ConversationList from '@/components/chat/ConversationList';
import ChatArea from '@/components/chat/ChatArea';

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
    const first = chat.conversations[0];
    if (first) chat.selectConversation(first.conversationId, first.partnerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, location.search, chat.conversations, chat.selectedConversationId]);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground mt-2">
            Chat with members, sellers and the Fivesom team
          </p>
        </div>

        {chat.loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
            <ConversationList
              conversations={chat.conversations}
              selectedConversationId={chat.selectedConversationId}
              searchQuery={chat.searchQuery}
              setSearchQuery={chat.setSearchQuery}
              onSelect={chat.selectConversation}
            />
            <ChatArea
              selectedConvo={chat.selectedConvo}
              messages={chat.messages}
              currentUserId={chat.currentUserId}
              selectedKind={chat.selectedKind}
              newMessage={chat.newMessage}
              setNewMessage={chat.setNewMessage}
              showEmojis={chat.showEmojis}
              setShowEmojis={chat.setShowEmojis}
              uploadingImage={chat.uploadingImage}
              partnerTyping={chat.partnerTyping}
              messagesEndRef={chat.messagesEndRef}
              fileInputRef={chat.fileInputRef}
              handleSend={chat.handleSend}
              handleImageUpload={chat.handleImageUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
