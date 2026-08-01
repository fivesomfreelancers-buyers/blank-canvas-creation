import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import supportLogoAsset from '@/assets/fivesom-support-logo.png';
import newsLogoAsset from '@/assets/fivesom-news-logo.png';
import { toast } from 'sonner';
import { moderateText, moderateImageFile, recordStrike, isChatBlocked } from '@/lib/chatModeration';

export type ConversationKind = 'dm' | 'support' | 'news';

export interface ConversationItem {
  conversationId: string;
  partnerId: string;
  partnerName: string;
  partnerImage: string | null;
  partnerVerified: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  kind: ConversationKind;
  pinned?: boolean;
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

const SUPPORT_LOGO = supportLogoAsset;
const NEWS_LOGO = newsLogoAsset;

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [selectedKind, setSelectedKind] = useState<ConversationKind>('dm');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSystemConversations = useCallback(async (userId: string): Promise<ConversationItem[]> => {
    // Ensure user has both system conversations (idempotent)
    await (supabase as any).rpc('bootstrap_system_conversations', { _user_id: userId });

    const { data } = await (supabase as any)
      .from('system_conversations')
      .select('*')
      .eq('user_id', userId);

    const list = (data || []) as any[];
    return list.map(c => ({
      conversationId: c.id,
      partnerId: c.type === 'support' ? 'system:support' : 'system:news',
      partnerName: c.type === 'support' ? 'Fivesom Support' : 'Fivesom News',
      partnerImage: c.type === 'support' ? SUPPORT_LOGO : NEWS_LOGO,
      partnerVerified: true,
      lastMessage: c.last_message || (c.type === 'support' ? 'How can we help?' : 'Welcome to Fivesom News'),
      lastMessageTime: c.last_message_at || c.created_at,
      unreadCount: c.unread_user || 0,
      kind: c.type as ConversationKind,
      pinned: true,
    }));
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);

      const [systemItems, convosRes] = await Promise.all([
        fetchSystemConversations(user.id),
        supabase
          .from('conversations')
          .select('*')
          .or(`buyer_id.eq.${user.id},freelancer_id.eq.${user.id}`)
          .order('created_at', { ascending: false }),
      ]);

      const convosData = convosRes.data || [];
      let dmItems: ConversationItem[] = [];

      if (convosData.length > 0) {
        const partnerIds = convosData.map(c => c.buyer_id === user.id ? c.freelancer_id : c.buyer_id);
        const convoIds = convosData.map(c => c.id);

        const [profilesRes, messagesRes, freelancersRes] = await Promise.all([
          (supabase as any).from('public_profiles').select('id, full_name, username, profile_image_url').in('id', partnerIds),
          supabase.from('messages').select('*').in('conversation_id', convoIds).order('created_at', { ascending: false }),
          (supabase as any).from('freelancers').select('user_id, is_verified').in('user_id', partnerIds),
        ]);

        const profileMap = new Map((profilesRes.data || []).map((p: any) => [p.id, p]));
        const verifiedMap = new Map((freelancersRes.data || []).map((f: any) => [f.user_id, !!f.is_verified]));

        const msgByConvo = new Map<string, { last: any; unread: number }>();
        (messagesRes.data || []).forEach(msg => {
          const cid = msg.conversation_id!;
          if (!msgByConvo.has(cid)) msgByConvo.set(cid, { last: msg, unread: 0 });
          if (!msg.is_read && msg.receiver_id === user.id) msgByConvo.get(cid)!.unread++;
        });

        dmItems = convosData.map(convo => {
          const partnerId = convo.buyer_id === user.id ? convo.freelancer_id : convo.buyer_id;
          const profile = profileMap.get(partnerId) as any;
          const msgInfo = msgByConvo.get(convo.id);
          return {
            conversationId: convo.id,
            partnerId,
            partnerName: profile?.full_name?.trim() || profile?.username?.trim() || 'Fivesom User',
            partnerImage: profile?.profile_image_url || null,
            partnerVerified: verifiedMap.get(partnerId) === true,
            lastMessage: msgInfo?.last?.message || 'No messages yet',
            lastMessageTime: msgInfo?.last?.created_at || convo.created_at || '',
            unreadCount: msgInfo?.unread || 0,
            kind: 'dm' as ConversationKind,
          };
        });
        dmItems.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      }

      // Pinned (support first, then news) on top
      const supportFirst = systemItems.find(s => s.kind === 'support');
      const newsItem = systemItems.find(s => s.kind === 'news');
      const pinned = [supportFirst, newsItem].filter(Boolean) as ConversationItem[];

      setConversations([...pinned, ...dmItems]);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchSystemConversations]);

  const fetchMessages = useCallback(async (conversationId: string, kind: ConversationKind) => {
    if (kind === 'dm') {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      setMessages((data as ChatMessage[]) || []);
    } else {
      const { data } = await (supabase as any)
        .from('system_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      const mapped: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.id,
        sender_id: m.sender_type === 'user' ? (currentUserId || '') : 'system',
        receiver_id: m.sender_type === 'user' ? 'system' : (currentUserId || ''),
        conversation_id: m.conversation_id,
        message: m.body,
        created_at: m.created_at,
        is_read: !!m.is_read_user,
        attachment_url: m.attachment_url,
      }));
      setMessages(mapped);
    }
  }, [currentUserId]);

  const markAsRead = useCallback(async (conversationId: string, kind: ConversationKind) => {
    if (!currentUserId) return;
    // Optimistically clear the unread badge in the list immediately
    setConversations(prev =>
      prev.map(c => c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c)
    );
    if (kind === 'dm') {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false);
    } else {
      await (supabase as any)
        .from('system_messages')
        .update({ is_read_user: true })
        .eq('conversation_id', conversationId)
        .eq('is_read_user', false);
      await (supabase as any)
        .from('system_conversations')
        .update({ unread_user: 0 })
        .eq('id', conversationId)
        .eq('user_id', currentUserId);
    }
  }, [currentUserId]);

  const selectConversation = useCallback((conversationId: string, partnerId: string) => {
    setSelectedConversationId(conversationId);
    setSelectedPartnerId(partnerId);
    const kind: ConversationKind = partnerId === 'system:support' ? 'support'
      : partnerId === 'system:news' ? 'news' : 'dm';
    setSelectedKind(kind);
    // Optimistically clear the red dot immediately on open
    setConversations(prev =>
      prev.map(c => c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c)
    );
  }, []);

  useEffect(() => {
    if (selectedConversationId && currentUserId) {
      fetchMessages(selectedConversationId, selectedKind);
      markAsRead(selectedConversationId, selectedKind);
    }
  }, [selectedConversationId, selectedKind, currentUserId, fetchMessages, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime: DM messages
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel('chat-messages-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (selectedConversationId && selectedKind === 'dm' && msg.conversation_id === selectedConversationId) {
            setMessages(prev => [...prev, msg]);
            if (msg.sender_id !== currentUserId) markAsRead(selectedConversationId, 'dm');
          }
          fetchConversations();
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_messages' }, (payload) => {
        const m: any = payload.new;
        if (selectedConversationId && selectedKind !== 'dm' && m.conversation_id === selectedConversationId) {
          setMessages(prev => [...prev, {
            id: m.id,
            sender_id: m.sender_type === 'user' ? currentUserId : 'system',
            receiver_id: m.sender_type === 'user' ? 'system' : currentUserId,
            conversation_id: m.conversation_id,
            message: m.body,
            created_at: m.created_at,
            is_read: false,
            attachment_url: m.attachment_url,
          }]);
          if (m.sender_type !== 'user') markAsRead(selectedConversationId, selectedKind);
        }
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedConversationId, selectedKind, fetchConversations, markAsRead]);

  const getOrCreateConversation = useCallback(async (partnerId: string): Promise<string | null> => {
    if (!currentUserId) return null;
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(buyer_id.eq.${currentUserId},freelancer_id.eq.${partnerId}),and(buyer_id.eq.${partnerId},freelancer_id.eq.${currentUserId})`
      )
      .maybeSingle();
    if (existing) return existing.id;
    const { data: buyerCheck } = await supabase
      .from('buyers').select('id').eq('user_id', currentUserId).maybeSingle();
    const buyerId = buyerCheck ? currentUserId : partnerId;
    const freelancerId = buyerCheck ? partnerId : currentUserId;
    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: buyerId, freelancer_id: freelancerId })
      .select('id').single();
    if (error) { console.error(error); return null; }
    return newConvo.id;
  }, [currentUserId]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversationId || !currentUserId) return;
    if (selectedKind === 'news') return; // read-only

    const blockState = isChatBlocked(currentUserId);
    if (blockState.blocked) {
      toast.error(`Chat suspended. Try again in ${blockState.minutesLeft} minutes.`);
      return;
    }

    const check = moderateText(newMessage);
    if (check.allowed === false) {
      const strike = recordStrike(currentUserId);
      toast.error(check.message, { description: strike.warning, duration: 6000 });
      return;
    }

    if (selectedKind === 'support') {
      const { error } = await (supabase as any).from('system_messages').insert({
        conversation_id: selectedConversationId,
        sender_type: 'user',
        body: newMessage.trim(),
      });
      if (!error) { setNewMessage(''); setShowEmojis(false); }
      return;
    }
    if (!selectedPartnerId) return;
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedPartnerId,
      conversation_id: selectedConversationId,
      message: newMessage.trim(),
    });
    if (!error) { setNewMessage(''); setShowEmojis(false); }
  }, [newMessage, selectedConversationId, selectedPartnerId, selectedKind, currentUserId]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId || !selectedConversationId) return;
    if (selectedKind === 'news') return;

    const blockState = isChatBlocked(currentUserId);
    if (blockState.blocked) {
      toast.error(`Chat suspended. Try again in ${blockState.minutesLeft} minutes.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setUploadingImage(true);

      // Moderate images before uploading
      if (file.type.startsWith('image/')) {
        const check = await moderateImageFile(file);
        if (check.allowed === false) {
          const strike = recordStrike(currentUserId);
          toast.error(check.message, { description: strike.warning, duration: 6000 });
          if (fileInputRef.current) fileInputRef.current.value = '';
          setUploadingImage(false);
          return;
        }
      }

      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase();
      const filePath = `${currentUserId}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file, { contentType: file.type || undefined });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(filePath);

      const mime = file.type || '';
      let label = `Sent a file: ${file.name}`;
      if (mime.startsWith('image/')) label = 'Sent an image';
      else if (mime.startsWith('video/')) label = 'Sent a video';
      else label = `Sent a document: ${file.name}`;

      if (selectedKind === 'support') {
        await (supabase as any).from('system_messages').insert({
          conversation_id: selectedConversationId,
          sender_type: 'user',
          body: label,
          attachment_url: publicUrl,
        });
      } else if (selectedPartnerId) {
        await supabase.from('messages').insert({
          sender_id: currentUserId,
          receiver_id: selectedPartnerId,
          conversation_id: selectedConversationId,
          message: label,
          attachment_url: publicUrl,
        });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingImage(false);
    }
  }, [currentUserId, selectedConversationId, selectedPartnerId, selectedKind]);

  const selectedConvo = conversations.find(c => c.conversationId === selectedConversationId);
  const filteredConvos = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    conversations: filteredConvos,
    messages,
    selectedConvo,
    selectedConversationId,
    selectedKind,
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
