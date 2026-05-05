import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Smile, Paperclip, Loader2 } from 'lucide-react';
import AttachmentPreview from './AttachmentPreview';
import type { ConversationItem, ChatMessage } from '@/hooks/useConversations';

const EMOJIS = ['👍', '😊', '✔️', '🔥', '🎉', '💬', '👌', '⭐', '📩', '🚀'];

interface ChatAreaProps {
  selectedConvo: ConversationItem | undefined;
  messages: ChatMessage[];
  currentUserId: string | null;
  newMessage: string;
  setNewMessage: (val: string) => void;
  showEmojis: boolean;
  setShowEmojis: (val: boolean) => void;
  uploadingImage: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleSend: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConvo,
  messages,
  currentUserId,
  newMessage,
  setNewMessage,
  showEmojis,
  setShowEmojis,
  uploadingImage,
  messagesEndRef,
  fileInputRef,
  handleSend,
  handleImageUpload,
}) => {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="lg:col-span-2 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>
          {selectedConvo ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedConvo.partnerImage || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(selectedConvo.partnerName)}
                </AvatarFallback>
              </Avatar>
              <span>{selectedConvo.partnerName}</span>
            </div>
          ) : 'Select a conversation'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-h-0">
        {!selectedConvo ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {messages.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      msg.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}>
                      <p>{msg.message}</p>
                      {msg.attachment_url && (
                        <AttachmentPreview url={msg.attachment_url} isOwn={msg.sender_id === currentUserId} />
                      )}
                      <p className={`text-xs mt-1 ${msg.sender_id === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {showEmojis && (
              <div className="absolute bottom-20 bg-background border rounded-lg p-2 shadow-lg flex gap-2 z-10">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewMessage(newMessage + emoji)}
                    className="hover:bg-accent p-1 rounded text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex space-x-2 pt-2 border-t items-center relative">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowEmojis(!showEmojis)}>
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatArea;
