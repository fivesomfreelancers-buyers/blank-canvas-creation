import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AutoGrowTextarea from './AutoGrowTextarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Smile, Paperclip, Loader2, Pin, Check, CheckCheck, ArrowLeft } from 'lucide-react';

import newsLogo from '@/assets/fivesom-news-logo.png';
import supportLogo from '@/assets/fivesom-support-logo.png';
import VerifiedBadge from '@/components/VerifiedBadge';
import ReportDialog from '@/components/ReportDialog';
import AttachmentPreview from './AttachmentPreview';
import MessageActions from './MessageActions';
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
  partnerTyping?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleSend: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Permanently delete a message the current user sent (text or file) */
  deleteMessage?: (messageId: string) => void | Promise<unknown>;
  /** Legacy alias of deleteMessage */
  deleteAttachment?: (messageId: string) => void | Promise<unknown>;
  /** Replace an attachment the current user sent */
  replaceAttachment?: (messageId: string, file: File) => void | Promise<unknown>;
  /** Shown on mobile to return to the conversation list */
  onBack?: () => void;
}


const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return 'Today';
  if (same(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const TypingBubble: React.FC = () => (
  <div className="flex justify-start">
    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce"
          style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
        />
      ))}
    </div>
  </div>
);

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
  partnerTyping = false,
  messagesEndRef,
  fileInputRef,
  handleSend,
  handleImageUpload,
  deleteMessage,
  deleteAttachment,
  replaceAttachment,
  onBack,
}) => {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const isSystem = selectedKind !== 'dm';
  const isNews = selectedKind === 'news';
  const removeMessage = deleteMessage || deleteAttachment;

  return (
    <Card className="lg:col-span-2 flex flex-col flex-1 h-full min-h-0 min-w-0 overflow-hidden">
      <CardHeader className="pb-3 border-b bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <CardTitle>
          {selectedConvo ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -ml-1 shrink-0"
                  onClick={onBack}
                  title="Back"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="relative">

                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
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
                <span className="text-sm sm:text-base inline-flex items-center gap-1 truncate">
                  {selectedConvo.partnerName}
                  {selectedConvo.partnerVerified && <VerifiedBadge size="sm" />}
                  {selectedConvo.pinned && <Pin className="w-3 h-3 text-muted-foreground" />}
                </span>
                {isSystem ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {isNews ? <><img src={newsLogo} alt="" className="w-4 h-4 object-contain" /> Official announcements</> : <><img src={supportLogo} alt="" className="w-4 h-4 object-contain" /> Official Fivesom support · 24/7</>}
                  </span>
                ) : partnerTyping ? (
                  <span className="text-xs font-medium text-primary animate-pulse">typing…</span>
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
      <CardContent className="flex flex-col flex-1 min-h-0 min-w-0 p-0 overflow-hidden">
        {!selectedConvo ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden space-y-1.5 px-3 sm:px-5 py-4 bg-muted/20">

              {messages.length === 0 && !partnerTyping ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {isNews ? 'No announcements yet.' : 'No messages yet. Start the conversation!'}
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender_id === currentUserId;
                  // Only the author may remove a message (news is one-way, never deletable here).
                  const canDelete = isMine && !isNews && !!removeMessage;
                  const prev = messages[i - 1];
                  const next = messages[i + 1];
                  const showDay = !prev || dayLabel(prev.created_at) !== dayLabel(msg.created_at);
                  const groupedWithPrev = !!prev && !showDay && (prev.sender_id === msg.sender_id);
                  const lastOfGroup = !next || next.sender_id !== msg.sender_id
                    || dayLabel(next.created_at) !== dayLabel(msg.created_at);

                  return (
                    <React.Fragment key={msg.id}>
                      {showDay && (
                        <div className="flex justify-center py-3">
                          <span className="text-[11px] uppercase tracking-wide bg-background/80 text-muted-foreground border rounded-full px-3 py-1">
                            {dayLabel(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`group flex w-full min-w-0 items-start gap-1 ${isMine ? 'justify-end' : 'justify-start'} ${groupedWithPrev ? 'mt-0.5' : 'mt-2'}`}>
                        {canDelete && (
                          <MessageActions
                            onDelete={() => removeMessage!(msg.id)}
                            className="mt-1 opacity-70 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 data-[state=open]:opacity-100"
                          />
                        )}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] min-w-0 px-3.5 py-2 text-sm chat-text shadow-sm rounded-2xl ${
                            isMine
                              ? `bg-primary text-primary-foreground ${lastOfGroup ? 'rounded-br-md' : ''}`
                              : `bg-card text-foreground border ${lastOfGroup ? 'rounded-bl-md' : ''}`
                          }`}
                        >
                          <p className="chat-text">{msg.message}</p>
                          {msg.attachment_url && (
                            <AttachmentPreview
                              url={msg.attachment_url}
                              isOwn={isMine}
                              canManage={canDelete}
                              managing={uploadingImage}
                              onDelete={canDelete ? () => removeMessage!(msg.id) : undefined}
                              onReplace={replaceAttachment && isMine && !isNews ? (file) => replaceAttachment(msg.id, file) : undefined}
                            />
                          )}
                          <span className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {timeLabel(msg.created_at)}
                            {isMine && !isSystem && (
                              msg.is_read
                                ? <CheckCheck className="w-3.5 h-3.5" />
                                : <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>
                      </div>

                    </React.Fragment>
                  );
                })
              )}
              {partnerTyping && <TypingBubble />}
              <div ref={messagesEndRef} />
            </div>

            {isNews ? (
              <div className="border-t text-center text-xs text-muted-foreground py-4 px-4">
                📣 Fivesom News is one-way. You cannot write here — you will only receive official announcements.
              </div>
            ) : (
              <div className="relative border-t bg-card px-3 sm:px-4 py-3">
                {showEmojis && (
                  <div className="absolute bottom-full left-3 mb-2 bg-popover border rounded-xl p-2 shadow-lg flex flex-wrap gap-1 z-20 max-w-[260px]">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewMessage(newMessage + emoji)}
                        className="hover:bg-accent p-1.5 rounded-lg text-xl leading-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />

                <div className="flex w-full min-w-0 items-end gap-2">
                  <div className="flex-1 min-w-0 flex items-end gap-1 bg-muted/60 border rounded-3xl px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/40 transition">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full shrink-0"
                      onClick={() => setShowEmojis(!showEmojis)}
                      title="Emoji"
                    >
                      <Smile className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <AutoGrowTextarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={isSystem ? 'Write a message to Fivesom Support…' : 'Type a message'}
                      className="min-h-[36px]"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      title="Attach file"
                    >
                      {uploadingImage
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Paperclip className="w-5 h-5 text-muted-foreground" />}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    size="icon"
                    className="h-11 w-11 rounded-full shadow-md shrink-0"
                    title="Send"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatArea;
