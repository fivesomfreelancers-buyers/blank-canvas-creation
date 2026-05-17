import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Shield, Loader2, Paperclip, ScaleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AttachmentPreview from '@/components/chat/AttachmentPreview';

interface DisputeChatProps {
  /** Pass orderId OR disputeId. orderId will resolve to the latest dispute on that order. */
  orderId?: string;
  disputeId?: string;
  /** Role of the current viewer. */
  viewerRole: 'buyer' | 'freelancer' | 'admin';
  className?: string;
}

interface DisputeMessage {
  id: string;
  dispute_id: string;
  sender_id: string;
  sender_role: 'buyer' | 'freelancer' | 'admin';
  body: string;
  attachment_url: string | null;
  created_at: string;
}

const roleStyles: Record<string, string> = {
  buyer: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  freelancer: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  admin: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
};

const DisputeChat: React.FC<DisputeChatProps> = ({ orderId, disputeId: initialDisputeId, viewerRole, className }) => {
  const { toast } = useToast();
  const [disputeId, setDisputeId] = useState<string | null>(initialDisputeId || null);
  const [dispute, setDispute] = useState<any>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
  }, []);

  // Resolve dispute id from orderId if needed
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      let id = initialDisputeId;
      if (!id && orderId) {
        const { data } = await supabase
          .from('disputes')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data) { id = data.id; if (active) setDispute(data); }
      } else if (id) {
        const { data } = await supabase.from('disputes').select('*').eq('id', id).maybeSingle();
        if (active) setDispute(data);
      }
      if (active) { setDisputeId(id || null); setLoading(false); }
    })();
    return () => { active = false; };
  }, [orderId, initialDisputeId]);

  // Load messages + realtime
  useEffect(() => {
    if (!disputeId) { setMessages([]); return; }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from('dispute_messages')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });
      if (active) setMessages((data || []) as DisputeMessage[]);
    })();

    const channel = supabase
      .channel(`dispute_messages:${disputeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dispute_messages', filter: `dispute_id=eq.${disputeId}` },
        (payload) => {
          setMessages((prev) => prev.some(m => m.id === (payload.new as any).id) ? prev : [...prev, payload.new as DisputeMessage]);
        })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, [disputeId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const send = async (attachmentUrl?: string | null) => {
    if (!disputeId || !userId) return;
    const body = text.trim();
    if (!body && !attachmentUrl) return;
    setSending(true);
    const { error } = await supabase.from('dispute_messages').insert({
      dispute_id: disputeId,
      sender_id: userId,
      sender_role: viewerRole,
      body: body || '',
      attachment_url: attachmentUrl || null,
    });
    setSending(false);
    if (error) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' });
      return;
    }
    setText('');
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 50MB. Use a link for larger files.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('message-attachments').upload(path, file);
    if (upErr) {
      setUploading(false);
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      return;
    }
    const { data: signed } = await supabase.storage.from('message-attachments').createSignedUrl(path, 60 * 60 * 24 * 7);
    setUploading(false);
    await send(signed?.signedUrl || path);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 flex items-center justify-center text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading dispute chat…
        </CardContent>
      </Card>
    );
  }

  if (!disputeId) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No dispute opened for this order.
        </CardContent>
      </Card>
    );
  }

  const isResolved = dispute?.status === 'resolved';

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-base">
            <ScaleIcon className="w-4 h-4 text-amber-500" />
            Dispute Chat
            <Badge variant={isResolved ? 'secondary' : 'destructive'} className="text-xs">
              {dispute?.status || 'open'}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="w-3 h-3" /> Private — Buyer · Freelancer · Admin
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px] min-h-[280px]">
          {messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Share your side of the story — admin will mediate.
            </div>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === userId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="outline" className={`text-[10px] py-0 px-1.5 capitalize ${roleStyles[m.sender_role]}`}>
                        {m.sender_role}
                      </Badge>
                    </div>
                    {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                    {m.attachment_url && <AttachmentPreview url={m.attachment_url} isOwn={mine} />}
                    <p className={`text-[10px] mt-1 ${mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(m.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {isResolved ? (
          <div className="border-t p-3 text-center text-xs text-muted-foreground">
            This dispute has been resolved{dispute?.resolution ? ` — ${dispute.resolution}` : ''}. Chat is read-only.
          </div>
        ) : (
          <div className="border-t p-2 flex items-center gap-2">
            <input ref={fileRef} type="file" hidden onChange={onFile} accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip" />
            <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={uploading || sending} title="Attach proof">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
            </Button>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Type your message…"
              disabled={sending}
            />
            <Button onClick={() => send()} disabled={sending || !text.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeChat;
