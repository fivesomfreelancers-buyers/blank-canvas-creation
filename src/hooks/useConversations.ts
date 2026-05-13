import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationItem {
  conversationId: string;
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  partnerVerified: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string | null;
  message: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string | null;
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Update last_seen
      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);

      // Fetch all conversations where user is buyer or freelancer
      const { data: convosData } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!convosData || convosData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get partner IDs
      const partnerIds = convosData.map(c => c.buyer_id === user.id ? c.freelancer_id : c.buyer_id);
      const convoIds = convosData.map(c => c.id);

      // Fetch profiles and latest messages in parallel
      const [profilesRes, messagesRes] = await Promise.all([
        (supabase as any).from('public_profiles').select('id, full_name, profile_image_url').in('id', partnerIds),
        supabase.from('messages').select('*').in('conversation_id', convoIds).order('created_at', { ascending: false }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));

      // Group messages by conversation_id
      const msgByConvo = new Map<string, { last: any; unread: number }>();
      (messagesRes.data || []).forEach(msg => {
        const cid = msg.conversation_id!;
        if (!msgByConvo.has(cid)) {
          msgByConvo.set(cid, { last: msg, unread: 0 });
        }
        if (!msg.is_read && msg.receiver_id === user.id) {
          msgByConvo.get(cid)!.unread++;
        }
      });

      const items: ConversationItem[] = convosData.map(convo => {
        const partnerId = convo.buyer_id === user.id ? convo.freelancer_id : convo.buyer_id;
        const profile = profileMap.get(partnerId) as any;
        const msgInfo = msgByConvo.get(convo.id);
        return {
          conversationId: convo.id,
          partnerId,
          partnerName: profile?.full_name || 'Unknown User',
          partnerImage: profile?.profile_image_url || null,
          lastMessage: msgInfo?.last?.message || 'No messages yet',
          lastMessageTime: msgInfo?.last?.created_at || convo.created_at || '',
          unreadCount: msgInfo?.unread || 0,
        };
      });

      // Sort by last message time (most recent first)
      items.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

      setConversations(items);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages((data as ChatMessage[]) || []);
  }, []);

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!currentUserId) return;
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', currentUserId)
      .eq('is_read', false);
  }, [currentUserId]);

  const selectConversation = useCallback((conversationId: string, partnerId: string) => {
    setSelectedConversationId(conversationId);
    setSelectedPartnerId(partnerId);
  }, []);

  // When selected conversation changes, fetch messages
  useEffect(() => {
    if (selectedConversationId && currentUserId) {
      fetchMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId, currentUserId, fetchMessages, markAsRead]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel('chat-messages-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (selectedConversationId && msg.conversation_id === selectedConversationId) {
            setMessages(prev => [...prev, msg]);
            if (msg.sender_id !== currentUserId) markAsRead(selectedConversationId);
          }
          fetchConversations();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedConversationId, fetchConversations, markAsRead]);

  const getOrCreateConversation = useCallback(async (partnerId: string): Promise<string | null> => {
    if (!currentUserId) return null;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(buyer_id.eq.${currentUserId},freelancer_id.eq.${partnerId}),and(buyer_id.eq.${partnerId},freelancer_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (existing) return existing.id;

    // Create new conversation - determine who is buyer/freelancer
    // Check if current user is a buyer
    const { data: buyerCheck } = await supabase
      .from('buyers')
      .select('id')
      .eq('user_id', currentUserId)
      .maybeSingle();

    const buyerId = buyerCheck ? currentUserId : partnerId;
    const freelancerId = buyerCheck ? partnerId : currentUserId;

    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: buyerId, freelancer_id: freelancerId })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    return newConvo.id;
  }, [currentUserId]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversationId || !selectedPartnerId || !currentUserId) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedPartnerId,
      conversation_id: selectedConversationId,
      message: newMessage.trim(),
    });
    if (!error) {
      setNewMessage('');
      setShowEmojis(false);
    }
  }, [newMessage, selectedConversationId, selectedPartnerId, currentUserId]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !selectedConversationId || !selectedPartnerId) return;

    try {
      setUploadingImage(true);
      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase();
      const filePath = `${currentUserId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file, { contentType: file.type || undefined });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      const mime = file.type || '';
      let label = `Sent a file: ${file.name}`;
      if (mime.startsWith('image/')) label = 'Sent an image';
      else if (mime.startsWith('video/')) label = 'Sent a video';
      else label = `Sent a document: ${file.name}`;

      await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: selectedPartnerId,
        conversation_id: selectedConversationId,
        message: label,
        attachment_url: publicUrl,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingImage(false);
    }
  }, [currentUserId, selectedConversationId, selectedPartnerId]);

  const selectedConvo = conversations.find(c => c.conversationId === selectedConversationId);
  const filteredConvos = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    conversations: filteredConvos,
    messages,
    selectedConvo,
    selectedConversationId,
    currentUserId,
    loading,
    newMessage,
    setNewMessage,
    searchQuery,
    setSearchQuery,
    showEmojis,
    setShowEmojis,
    uploadingImage,
    messagesEndRef,
    fileInputRef,
    selectConversation,
    handleSend,
    handleImageUpload,
    fetchConversations,
    getOrCreateConversation,
  };
}
