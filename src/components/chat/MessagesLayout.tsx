import React from 'react';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import { useIsMobile } from '@/hooks/use-mobile';
import type { useConversations } from '@/hooks/useConversations';

interface MessagesLayoutProps {
  chat: ReturnType<typeof useConversations>;
  /** Height of the desktop chat grid */
  heightClass?: string;
}

/**
 * Responsive messages layout.
 * - Desktop: conversation list + chat side by side.
 * - Mobile: WhatsApp-style — the list fills the screen, and selecting a
 *   conversation swaps to a full-width chat view with a back button.
 */
const MessagesLayout: React.FC<MessagesLayoutProps> = ({ chat, heightClass = 'h-[640px]' }) => {
  const isMobile = useIsMobile();
  const showChat = !!chat.selectedConversationId;

  if (isMobile) {
    return (
      <div className="h-[calc(100vh-9rem)] min-h-[420px] flex flex-col">
        {showChat ? (
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
            onBack={chat.clearSelection}
          />
        ) : (
          <ConversationList
            conversations={chat.conversations}
            selectedConversationId={chat.selectedConversationId}
            searchQuery={chat.searchQuery}
            setSearchQuery={chat.setSearchQuery}
            onSelect={chat.selectConversation}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${heightClass}`}>
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
  );
};

export default MessagesLayout;
