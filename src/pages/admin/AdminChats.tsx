import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, Paperclip, Shield, Search, AlertCircle, RefreshCw } from 'lucide-react';
import SecureFileLink from '@/components/media/SecureFileLink';

interface Person {
  id: string;
  name: string;
  image: string | null;
}

interface Conv {
  id: string;
  buyer_id: string;
  freelancer_id: string;
  created_at: string;
  buyer: Person;
  freelancer: Person;
  message_count: number;
  unread_count: number;
  last_msg: string | null;
  last_at: string | null;
}

interface Msg {
  id: string;
  conversation_id: string | null;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  attachment_url: string | null;
  is_read: boolean | null;
  created_at: string;
}

const initials = (n?: string) =>
  (n || 'U').split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(Date.now() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

const AdminChats = () => {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const open = useMemo(() => convs.find((c) => c.id === openId) || null, [convs, openId]);

  const fetchAll = useCallback(async () => {
    setError(null);
    // 1. Conversations (admin RLS policy grants full read)
    const { data: rows, error: convErr } = await supabase
      .from('conversations')
      .select('id, buyer_id, freelancer_id, created_at')
      .order('created_at', { ascending: false });

    if (convErr) {
      setError(convErr.message);
      setLoading(false);
      return;
    }

    const list = rows || [];
    if (list.length === 0) {
      setConvs([]);
      setLoading(false);
      return;
    }

    // 2. All messages for those conversations in a single query
    const ids = list.map((c) => c.id);
    const { data: msgs, error: msgErr } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, receiver_id, message, attachment_url, is_read, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: true });

    if (msgErr) {
      setError(msgErr.message);
      setLoading(false);
      return;
    }

    // 3. Participant profiles via the admin-only security-definer RPC
    //    (the profiles table itself is not directly readable by clients).
    const userIds = Array.from(
      new Set(list.flatMap((c) => [c.buyer_id, c.freelancer_id]).filter(Boolean)),
    );
    const { data: people } = await (supabase as any).rpc('admin_get_profiles', { _ids: userIds });
    const byId = new Map<string, Person>(
      ((people || []) as any[]).map((p) => [
        p.id,
        { id: p.id, name: p.full_name || p.username || 'Unknown user', image: p.profile_image_url },
      ]),
    );
    const person = (id: string): Person =>
      byId.get(id) || { id, name: 'Unknown user', image: null };

    const grouped = new Map<string, Msg[]>();
    ((msgs || []) as Msg[]).forEach((m) => {
      if (!m.conversation_id) return;
      const arr = grouped.get(m.conversation_id) || [];
      arr.push(m);
      grouped.set(m.conversation_id, arr);
    });

    const enriched: Conv[] = list.map((c) => {
      const cm = grouped.get(c.id) || [];
      const last = cm[cm.length - 1];
      return {
        ...c,
        buyer: person(c.buyer_id),
        freelancer: person(c.freelancer_id),
        message_count: cm.length,
        unread_count: cm.filter((m) => m.is_read === false).length,
        last_msg: last?.message || (last?.attachment_url ? 'Attachment' : null),
        last_at: last?.created_at || c.created_at,
      };
    });

    enriched.sort((a, b) => new Date(b.last_at!).getTime() - new Date(a.last_at!).getTime());
    setConvs(enriched);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime: any new/updated message or conversation refreshes the monitor.
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        fetchAll();
        const m = payload.new as Msg | undefined;
        if (payload.eventType === 'INSERT' && m?.conversation_id && m.conversation_id === openId) {
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll, openId]);

  // Load the full history of the opened conversation.
  useEffect(() => {
    if (!openId) { setMessages([]); return; }
    setMsgLoading(true);
    supabase
      .from('messages')
      .select('id, conversation_id, sender_id, receiver_id, message, attachment_url, is_read, created_at')
      .eq('conversation_id', openId)
      .order('created_at', { ascending: true })
      .then(({ data, error: e }) => {
        setMessages((data || []) as Msg[]);
        if (e) setError(e.message);
        setMsgLoading(false);
      });
  }, [openId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return convs;
    return convs.filter((c) =>
      [c.buyer.name, c.freelancer.name, c.last_msg || ''].join(' ').toLowerCase().includes(q),
    );
  }, [convs, query]);

  const totalUnread = convs.reduce((s, c) => s + c.unread_count, 0);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Live Chat Monitor
            <Badge variant="outline" className="text-xs">{convs.length}</Badge>
            {totalUnread > 0 && (
              <Badge className="text-xs bg-destructive text-destructive-foreground">
                {totalUnread} unread
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users or messages"
                className="pl-8 h-9 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchAll()}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-lg border border-border bg-muted/30 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="py-14 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">
                {convs.length === 0 ? 'No conversations on the platform yet' : 'No conversations match your search'}
              </p>
            </div>
          )}

          {!loading && filtered.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition"
            >
              <div className="flex -space-x-2 shrink-0">
                <Avatar className="h-9 w-9 ring-2 ring-background">
                  <AvatarImage src={c.buyer.image || ''} />
                  <AvatarFallback className="text-xs bg-blue-500/20 text-blue-500">
                    {initials(c.buyer.name)}
                  </AvatarFallback>
                </Avatar>
                <Avatar className="h-9 w-9 ring-2 ring-background">
                  <AvatarImage src={c.freelancer.image || ''} />
                  <AvatarFallback className="text-xs bg-purple-500/20 text-purple-500">
                    {initials(c.freelancer.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  <span className="text-blue-500">{c.buyer.name}</span>
                  <span className="text-muted-foreground"> ↔ </span>
                  <span className="text-purple-500">{c.freelancer.name}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{c.last_msg || 'No messages yet'}</p>
              </div>
              <div className="hidden sm:block text-[11px] text-muted-foreground whitespace-nowrap">
                {c.last_at ? formatTime(c.last_at) : ''}
              </div>
              {c.unread_count > 0 && (
                <Badge className="text-xs bg-destructive text-destructive-foreground">{c.unread_count}</Badge>
              )}
              <Badge variant="outline" className="text-xs">{c.message_count}</Badge>
              <Button size="sm" variant="outline" onClick={() => setOpenId(c.id)}>
                <Eye className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">Open</span>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
          {open && (
            <>
              <DialogHeader className="px-5 py-3 border-b border-border bg-card flex-row items-center gap-3 space-y-0">
                <div className="flex -space-x-2">
                  <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarImage src={open.buyer.image || ''} />
                    <AvatarFallback className="bg-blue-500/20 text-blue-500">
                      {initials(open.buyer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarImage src={open.freelancer.image || ''} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-500">
                      {initials(open.freelancer.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-blue-500">{open.buyer.name}</span>
                    <span className="text-muted-foreground">↔</span>
                    <span className="text-purple-500">{open.freelancer.name}</span>
                  </DialogTitle>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Read-only admin view · {messages.length} messages
                  </p>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto bg-background/50 px-4 py-4 space-y-3">
                {msgLoading && (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-12 w-2/3 rounded-2xl bg-muted/40 animate-pulse" />
                    ))}
                  </div>
                )}
                {!msgLoading && messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">No messages in this conversation</p>
                )}
                {!msgLoading && messages.map((m, idx) => {
                  const fromBuyer = m.sender_id === open.buyer_id;
                  const sender = fromBuyer ? open.buyer : open.freelancer;
                  const receiver = fromBuyer ? open.freelancer : open.buyer;
                  const prev = messages[idx - 1];
                  const showHeader = !prev || prev.sender_id !== m.sender_id;
                  const showDay = !prev || dayLabel(prev.created_at) !== dayLabel(m.created_at);
                  return (
                    <React.Fragment key={m.id}>
                      {showDay && (
                        <div className="flex justify-center">
                          <span className="rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
                            {dayLabel(m.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`flex items-end gap-2 ${fromBuyer ? 'justify-start' : 'justify-end'}`}>
                        {fromBuyer && (
                          <Avatar className={`h-7 w-7 ${showHeader ? '' : 'invisible'}`}>
                            <AvatarImage src={sender.image || ''} />
                            <AvatarFallback className="text-[10px] bg-blue-500/20 text-blue-500">
                              {initials(sender.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[78%] sm:max-w-[72%] ${fromBuyer ? 'items-start' : 'items-end'} flex flex-col`}>
                          {showHeader && (
                            <p className={`text-[10px] mb-0.5 px-1 ${fromBuyer ? 'text-blue-500' : 'text-purple-500'}`}>
                              {sender.name} → <span className="text-muted-foreground">{receiver.name}</span>
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                              fromBuyer
                                ? 'bg-blue-500/10 border border-blue-500/20 text-foreground rounded-bl-md'
                                : 'bg-purple-500/10 border border-purple-500/20 text-foreground rounded-br-md'
                            }`}
                          >
                            {m.message && <p className="whitespace-pre-wrap break-words">{m.message}</p>}
                            {m.attachment_url && (
                              <SecureFileLink
                                url={m.attachment_url}
                                className="mt-1 text-xs flex items-center gap-1 underline opacity-80 hover:opacity-100"
                              >
                                <Paperclip className="h-3 w-3" /> Attachment
                              </SecureFileLink>
                            )}
                          </div>
                          <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
                            {formatTime(m.created_at)}
                            {m.is_read === false && ' · unread'}
                          </span>
                        </div>
                        {!fromBuyer && (
                          <Avatar className={`h-7 w-7 ${showHeader ? '' : 'invisible'}`}>
                            <AvatarImage src={sender.image || ''} />
                            <AvatarFallback className="text-[10px] bg-purple-500/20 text-purple-500">
                              {initials(sender.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChats;
