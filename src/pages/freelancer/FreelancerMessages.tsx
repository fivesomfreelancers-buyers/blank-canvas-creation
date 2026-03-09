import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, Smile, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EMOJIS = ['👍', '😊', '✔️', '🔥', '🎉', '💬', '👌', '⭐', '📩', '🚀'];

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string | null;
}

const FreelancerMessages = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedChat && currentUserId) {
      fetchMessages(selectedChat);
      markAsRead(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel('freelancer-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (selectedChat && (msg.sender_id === selectedChat || msg.receiver_id === selectedChat)) {
            setMessages(prev => [...prev, msg]);
            if (msg.sender_id !== currentUserId) markAsRead(selectedChat);
          }
          fetchConversations();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedChat]);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Update last_seen
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Group by partner
      const partnerMap = new Map<string, { msgs: any[]; unread: number }>();
      messagesData.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!partnerMap.has(partnerId)) {
          partnerMap.set(partnerId, { msgs: [], unread: 0 });
        }
        const entry = partnerMap.get(partnerId)!;
        entry.msgs.push(msg);
        if (!msg.is_read && msg.receiver_id === user.id) entry.unread++;
      });

      // Fetch partner profiles
      const partnerIds = Array.from(partnerMap.keys());
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, profile_image_url')
        .in('id', partnerIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      const convos: Conversation[] = partnerIds.map(pid => {
        const entry = partnerMap.get(pid)!;
        const profile = profileMap.get(pid);
        const lastMsg = entry.msgs[0];
        return {
          partnerId: pid,
          partnerName: profile?.full_name || 'Unknown User',
          partnerImage: profile?.profile_image_url || null,
          lastMessage: lastMsg.message,
          lastMessageTime: lastMsg.created_at,
          unreadCount: entry.unread,
        };
      });

      setConversations(convos);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: string) => {
    if (!currentUserId) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const markAsRead = async (partnerId: string) => {
    if (!currentUserId) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', currentUserId)
      .eq('is_read', false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedChat,
      message: newMessage.trim(),
    });
    if (!error) {
      setNewMessage('');
    }
  };

  const selectedConvo = conversations.find(c => c.partnerId === selectedChat);
  const filteredConvos = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="mt-2 text-muted-foreground">Communicate with your buyers</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle>Conversations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {filteredConvos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No conversations yet</div>
                ) : (
                  <div className="space-y-0">
                    {filteredConvos.map((conv) => {
                      const initials = conv.partnerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <div
                          key={conv.partnerId}
                          onClick={() => setSelectedChat(conv.partnerId)}
                          className={`p-4 cursor-pointer hover:bg-accent border-b transition-colors ${
                            selectedChat === conv.partnerId ? 'bg-accent border-l-4 border-l-primary' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conv.partnerImage || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="font-medium text-foreground text-sm truncate">{conv.partnerName}</p>
                                {conv.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs ml-2">{conv.unreadCount}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                              <p className="text-xs text-muted-foreground">{new Date(conv.lastMessageTime).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle>
                  {selectedConvo ? (
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedConvo.partnerImage || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {selectedConvo.partnerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedConvo.partnerName}</span>
                    </div>
                  ) : 'Select a conversation'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 min-h-0">
                {!selectedChat ? (
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
                              <p className={`text-xs mt-1 ${msg.sender_id === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex space-x-2 pt-2 border-t">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerMessages;
