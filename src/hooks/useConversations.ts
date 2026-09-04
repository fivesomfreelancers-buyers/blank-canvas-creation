import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import supportLogoAsset from '@/assets/fivesom-support-logo.png';
import newsLogoAsset from '@/assets/fivesom-news-logo.png';
import { toast } from 'sonner';
import { moderateText, moderateImageFile, recordStrike, isChatBlocked } from '@/lib/chatModeration';
import { getOrCreateConversation as createConversation } from '@/lib/conversations';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';


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

  const { partnerTyping, notifyTyping, notifyStopTyping } = useTypingIndicator(
    selectedConversationId,
    currentUserId,
    selectedKind === 'dm',
  );

  /** Composer setter that also broadcasts the typing state (WhatsApp-style). */
  const setNewMessageTyping = useCallback((val: string) => {
    setNewMessage(val);
    if (val.trim()) notifyTyping();
    else notifyStopTyping();
  }, [notifyTyping, notifyStopTyping]);


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

        // Both `profiles` and `freelancers` are locked down for clients — read the
        // public views so partner names/photos/badges always resolve.
        const [profilesRes, messagesRes, freelancersRes] = await Promise.all([
          (supabase as any).from('public_profiles').select('id, full_name, username, profile_image_url').in('id', partnerIds),
          supabase.from('messages').select('*').in('conversation_id', convoIds).order('created_at', { ascending: false }),
          (supabase as any).from('public_freelancers').select('user_id, is_verified').in('user_id', partnerIds),
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

  const clearSelection = useCallback(() => {
    setSelectedConversationId(null);
    setSelectedPartnerId(null);
    setSelectedKind('dm');
    setMessages([]);
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
    // Per-user channel name so several tabs/accounts never share a topic.
    const channel = supabase
      .channel(`chat-messages-rt-${currentUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (selectedConversationId && selectedKind === 'dm' && msg.conversation_id === selectedConversationId) {
            setMessages(prev => (prev.some(p => p.id === msg.id) ? prev : [...prev, msg]));
            if (msg.sender_id !== currentUserId) markAsRead(selectedConversationId, 'dm');
          }
          fetchConversations();
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as ChatMessage;
        if (msg.sender_id !== currentUserId && msg.receiver_id !== currentUserId) return;
        setMessages(prev => prev.map(p => (p.id === msg.id ? { ...p, ...msg } : p)));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_messages' }, (payload) => {
        const m: any = payload.new;
        if (selectedConversationId && selectedKind !== 'dm' && m.conversation_id === selectedConversationId) {
          setMessages(prev => (prev.some(p => p.id === m.id) ? prev : [...prev, {
            id: m.id,
            sender_id: m.sender_type === 'user' ? currentUserId : 'system',
            receiver_id: m.sender_type === 'user' ? 'system' : currentUserId,
            conversation_id: m.conversation_id,
            message: m.body,
            created_at: m.created_at,
            is_read: false,
            attachment_url: m.attachment_url,
          }]));
          if (m.sender_type !== 'user') markAsRead(selectedConversationId, selectedKind);
        }
        fetchConversations();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_messages' }, (payload) => {
        const m: any = payload.new;
        setMessages(prev => prev.map(p => (p.id === m.id
          ? { ...p, message: m.body, attachment_url: m.attachment_url, is_read: !!m.is_read_user }
          : p)));
        fetchConversations();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'system_messages' }, (payload) => {
        const old: any = payload.old;
        setMessages(prev => prev.filter(p => p.id !== old.id));
        fetchConversations();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        const old: any = payload.old;
        setMessages(prev => prev.filter(p => p.id !== old.id));
        fetchConversations();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        fetchConversations();
      })
      .subscribe();

    // Safety net if realtime drops (mobile networks, background tabs).
    const poll = setInterval(() => {
      fetchConversations();
      if (selectedConversationId) fetchMessages(selectedConversationId, selectedKind);
    }, 20_000);

    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [currentUserId, selectedConversationId, selectedKind, fetchConversations, fetchMessages, markAsRead]);

  const getOrCreateConversation = useCallback(async (partnerId: string): Promise<string | null> => {
    if (!currentUserId) return null;
    return createConversation(currentUserId, partnerId);
  }, [currentUserId]);

  /**
   * Inserts a message and only reports success when the database confirms the
   * row. Returns false on failure so the caller can keep the draft + retry.
   */
  const deliverText = useCallback(async (text: string): Promise<boolean> => {
    if (!selectedConversationId || !currentUserId) return false;

    if (selectedKind === 'support') {
      const { data, error } = await (supabase as any).from('system_messages').insert({
        conversation_id: selectedConversationId,
        sender_type: 'user',
        body: text,
      }).select('*').single();
      if (error || !data) return false;
      setMessages(prev => (prev.some(p => p.id === data.id) ? prev : [...prev, {
        id: data.id,
        sender_id: currentUserId,
        receiver_id: 'system',
        conversation_id: data.conversation_id,
        message: data.body,
        created_at: data.created_at,
        is_read: true,
        attachment_url: data.attachment_url,
      }]));
      fetchConversations();
      return true;
    }

    if (!selectedPartnerId) {
      toast.error('This conversation has no recipient.');
      return false;
    }
    const { data, error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedPartnerId,
      conversation_id: selectedConversationId,
      message: text,
    }).select('*').single();
    if (error || !data) {
      console.error('message insert failed', error);
      return false;
    }
    const row = data as ChatMessage;
    setMessages(prev => (prev.some(p => p.id === row.id) ? prev : [...prev, row]));
    fetchConversations();
    return true;
  }, [selectedConversationId, selectedPartnerId, selectedKind, currentUserId, fetchConversations]);

  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text || !selectedConversationId || !currentUserId) return;
    if (selectedKind === 'news') return; // read-only

    const ok = await deliverText(text);
    if (ok) {
      setNewMessage('');
      notifyStopTyping();
      setShowEmojis(false);
      return;
    }
    // Keep the draft in the composer and offer an explicit retry.
    toast.error('Message not sent', {
      description: 'Check your connection — your message was kept so you can retry.',
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: async () => {
          const retried = await deliverText(text);
          if (retried) { setNewMessage(''); notifyStopTyping(); }
          else toast.error('Still not sent. Please try again.');
        },
      },
    });
  }, [newMessage, selectedConversationId, selectedKind, currentUserId, deliverText, notifyStopTyping]);


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

    // Storage rejects oversized uploads — fail with a clear, actionable message.
    const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error('File too large (max 50MB)', {
        description: 'Upload smaller files, or share large files with a Google Drive / Dropbox link.',
        duration: 6000,
      });
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
      // DM attachments live in the conversation folder so BOTH participants are
      // allowed to sign/download them. Support uploads stay under the user id.
      const folder = selectedKind === 'dm' ? selectedConversationId : currentUserId;
      const filePath = `${folder}/${crypto.randomUUID()}.${fileExt}`;
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
        const { error: insertError } = await supabase.from('messages').insert({
          sender_id: currentUserId,
          receiver_id: selectedPartnerId,
          conversation_id: selectedConversationId,
          message: label,
          attachment_url: publicUrl,
        });
        if (insertError) throw insertError;
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchConversations();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Attachment not sent', { description: error?.message || 'Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  }, [currentUserId, selectedConversationId, selectedPartnerId, selectedKind, fetchConversations]);

  /** Best-effort removal of the stored object behind a deleted/replaced attachment. */
  const removeStoredFile = useCallback(async (ref: any) => {
    if (!ref?.bucket || !ref?.path) return;
    try {
      await supabase.storage.from(ref.bucket).remove([ref.path]);
    } catch (err) {
      console.warn('storage cleanup failed', err);
    }
  }, []);

  /** Permanently removes an attachment the current user sent (or an admin owns). */
  const deleteAttachment = useCallback(async (messageId: string): Promise<boolean> => {
    const rpc = selectedKind === 'dm' ? 'delete_message_attachment' : 'delete_system_message_attachment';
    const { data, error } = await (supabase as any).rpc(rpc, { _message_id: messageId });
    if (error) {
      toast.error('Could not delete attachment', { description: error.message });
      return false;
    }
    await removeStoredFile((data as any)?.file);
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, attachment_url: null, message: '🗑️ Attachment deleted' } : m
    ));
    fetchConversations();
    toast.success('Attachment deleted');
    return true;
  }, [selectedKind, removeStoredFile, fetchConversations]);

  /** Replaces an already-sent attachment with a newly uploaded file. */
  const replaceAttachment = useCallback(async (messageId: string, file: File): Promise<boolean> => {
    if (!currentUserId || !selectedConversationId) return false;
    const MAX_ATTACHMENT_BYTES = 50 * 1024 * 1024;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error('File too large (max 50MB)');
      return false;
    }
    try {
      setUploadingImage(true);
      const fileExt = (file.name.split('.').pop() || 'bin').toLowerCase();
      const folder = selectedKind === 'dm' ? selectedConversationId : currentUserId;
      const filePath = `${folder}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file, { contentType: file.type || undefined });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('message-attachments').getPublicUrl(filePath);

      const mime = file.type || '';
      const label = mime.startsWith('image/')
        ? 'Sent an image'
        : mime.startsWith('video/')
          ? 'Sent a video'
          : `Sent a document: ${file.name}`;

      const rpc = selectedKind === 'dm' ? 'replace_message_attachment' : 'replace_system_message_attachment';
      const { data, error } = await (supabase as any).rpc(rpc, {
        _message_id: messageId,
        _url: publicUrl,
        _label: label,
      });
      if (error) throw error;
      await removeStoredFile((data as any)?.file);
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, attachment_url: publicUrl, message: label } : m
      ));
      fetchConversations();
      toast.success('Attachment replaced');
      return true;
    } catch (err: any) {
      toast.error('Could not replace attachment', { description: err?.message });
      return false;
    } finally {
      setUploadingImage(false);
    }
  }, [currentUserId, selectedConversationId, selectedKind, removeStoredFile, fetchConversations]);

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
    setNewMessage: setNewMessageTyping,
    partnerTyping,

    searchQuery,
    setSearchQuery,
    showEmojis,
    setShowEmojis,
    uploadingImage,
    messagesEndRef,
    fileInputRef,
    selectConversation,
    clearSelection,

    handleSend,
    handleImageUpload,
    deleteAttachment,
    replaceAttachment,
    fetchConversations,
    getOrCreateConversation,
  };
}
