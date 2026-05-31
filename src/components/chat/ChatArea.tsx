import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Smile, Paperclip, Loader2, Pin } from 'lucide-react';
import newsLogo from '@/assets/fivesom-news-logo.png';
import supportLogo from '@/assets/fivesom-support-logo.png';
import VerifiedBadge from '@/components/VerifiedBadge';
import ReportDialog from '@/components/ReportDialog';
import AttachmentPreview from './AttachmentPreview';
import OnlineIndicator from '@/components/presence/OnlineIndicator';
import type { ConversationItem, ChatMessage, ConversationKind } from '@/hooks/useConversations';

const EMOJIS = ['👍', '😊', '✔️', '🔥', '🎉', '💬', '👌', '⭐', '📩', '🚀'];

interface ChatAreaProps {
  selectedConvo: ConversationItem | undefined;
  messages: ChatMessage[];
  currentUserId: string | null;
  selectedKind?: ConversationKind;
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
  selectedKind = 'dm',
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

  const isSystem = selectedKind !== 'dm';
  const isNews = selectedKind === 'news';

  return (
    <Card className="lg:col-span-2 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>
          {selectedConvo ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={selectedConvo.partnerImage || undefined} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(selectedConvo.partnerName)}
                  </AvatarFallback>
                </Avatar>
                {!isSystem ? (
                  <span className="absolute -bottom-0 -right-0">
                    <OnlineIndicator userId={selectedConvo.partnerId} dotOnly />
                  </span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                )}
              </div>
              <div className="flex flex-col leading-tight flex-1 min-w-0">
                <span className="text-sm sm:text-base inline-flex items-center gap-1">
                  {selectedConvo.partnerName}
                  {selectedConvo.partnerVerified && <VerifiedBadge size="sm" />}
                  {selectedConvo.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                </span>
                {isSystem ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {isNews ? <><img src={newsLogo} alt="" className="w-4 h-4 object-contain" /> Official announcements</> : <><img src={supportLogo} alt="" className="w-4 h-4 object-contain" /> Official Fivesom support · 24/7</>}
                  </span>
                ) : (
                  <OnlineIndicator userId={selectedConvo.partnerId} />
                )}
              </div>
              {!isSystem && (
                <ReportDialog reportedUserId={selectedConvo.partnerId} buttonLabel="Report" />
              )}
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
                <div className="text-center py-4 text-muted-foreground">
                  {isNews ? 'No announcements yet.' : 'No messages yet. Start the conversation!'}
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                        isMine
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        <p>{msg.message}</p>
                        {msg.attachment_url && (
                          <AttachmentPreview url={msg.attachment_url} isOwn={isMine} />
                        )}
                        <p className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
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

            {isNews ? (
              <div className="pt-2 border-t text-center text-xs text-muted-foreground py-3">
                📣 Fivesom News waa hal-dhinac. Halkaan wax ku qori maysid — kaliya warbixinada rasmiga ah ayaa kuugu imanaya.
              </div>
            ) : (
              <div className="flex space-x-2 pt-2 border-t items-center relative">
                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} title="Attach file">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-5 h-5 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowEmojis(!showEmojis)}>
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isSystem ? 'Qor fariin u dirta Fivesom Support…' : 'Type your message...'}
                  className="flex-1"
                />
                <Button onClick={handleSend} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatArea;
