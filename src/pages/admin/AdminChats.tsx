import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, Paperclip, Shield } from 'lucide-react';

interface Conv {
  id: string;
  buyer_id: string;
  freelancer_id: string;
  created_at: string;
  buyer_name?: string;
  freelancer_name?: string;
  buyer_image?: string | null;
  freelancer_image?: string | null;
  message_count?: number;
  last_msg?: string;
}

const initials = (n?: string) =>
  (n || 'U').split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

const AdminChats = () => {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchConvs = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    const enriched = await Promise.all(
      (data || []).map(async (c: any) => {
        const [b, f, m] = await Promise.all([
          supabase.from('profiles').select('full_name, profile_image_url').eq('id', c.buyer_id).maybeSingle(),
          supabase.from('profiles').select('full_name, profile_image_url').eq('id', c.freelancer_id).maybeSingle(),
          supabase.from('messages')
            .select('id, message', { count: 'exact' })
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: false })
            .limit(1),
        ]);
        return {
          ...c,
          buyer_name: b.data?.full_name,
          buyer_image: b.data?.profile_image_url,
          freelancer_name: f.data?.full_name,
          freelancer_image: f.data?.profile_image_url,
          message_count: m.count || 0,
          last_msg: m.data?.[0]?.message,
        };
      })
    );
    setConvs(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchConvs(); }, []);

  useEffect(() => {
    if (!open) return;
    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', open.id)
      .order('created_at')
      .then(({ data }) => setMessages(data || []));
  }, [open]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Live Chat Monitor ({convs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {convs.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No conversations</p>
          )}
          {convs.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition"
            >
              <div className="flex -space-x-2">
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={c.buyer_image || ''} />
                  <AvatarFallback className="text-xs bg-blue-500/20 text-blue-500">
                    {initials(c.buyer_name)}
                  </AvatarFallback>
                </Avatar>
                <Avatar className="h-8 w-8 ring-2 ring-background">
                  <AvatarImage src={c.freelancer_image || ''} />
                  <AvatarFallback className="text-xs bg-purple-500/20 text-purple-500">
                    {initials(c.freelancer_name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">
                  <span className="text-blue-500">{c.buyer_name || 'Buyer'}</span>
                  <span className="text-muted-foreground"> ↔ </span>
                  <span className="text-purple-500">{c.freelancer_name || 'Freelancer'}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">{c.last_msg || 'No messages'}</p>
              </div>
              <Badge variant="outline" className="text-xs">{c.message_count}</Badge>
              <Button size="sm" variant="outline" onClick={() => setOpen(c)}>
                <Eye className="h-3.5 w-3.5 mr-1" /> Open
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
          {open && (
            <>
              <DialogHeader className="px-5 py-3 border-b border-border bg-card flex-row items-center gap-3 space-y-0">
                <div className="flex -space-x-2">
                  <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarImage src={open.buyer_image || ''} />
                    <AvatarFallback className="bg-blue-500/20 text-blue-500">
                      {initials(open.buyer_name)}
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarImage src={open.freelancer_image || ''} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-500">
                      {initials(open.freelancer_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-blue-500">{open.buyer_name}</span>
                    <span className="text-muted-foreground">↔</span>
                    <span className="text-purple-500">{open.freelancer_name}</span>
                  </DialogTitle>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Read-only admin view
                  </p>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto bg-background/50 px-4 py-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">No messages</p>
                )}
                {messages.map((m, idx) => {
                  const isBuyer = m.sender_id === open.buyer_id;
                  const name = isBuyer ? open.buyer_name : open.freelancer_name;
                  const image = isBuyer ? open.buyer_image : open.freelancer_image;
                  const prev = messages[idx - 1];
                  const showHeader = !prev || prev.sender_id !== m.sender_id;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-end gap-2 ${isBuyer ? 'justify-start' : 'justify-end'}`}
                    >
                      {isBuyer && (
                        <Avatar className={`h-7 w-7 ${showHeader ? '' : 'invisible'}`}>
                          <AvatarImage src={image || ''} />
                          <AvatarFallback className="text-[10px] bg-blue-500/20 text-blue-500">
                            {initials(name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[72%] ${isBuyer ? 'items-start' : 'items-end'} flex flex-col`}>
                        {showHeader && (
                          <p className={`text-[10px] mb-0.5 px-1 ${isBuyer ? 'text-blue-500' : 'text-purple-500'}`}>
                            {name} · <span className="text-muted-foreground">{formatTime(m.created_at)}</span>
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                            isBuyer
                              ? 'bg-blue-500/10 border border-blue-500/20 text-foreground rounded-bl-md'
                              : 'bg-purple-500/10 border border-purple-500/20 text-foreground rounded-br-md'
                          }`}
                        >
                          {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}
                          {m.attachment_url && (
                            <a
                              href={m.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 text-xs flex items-center gap-1 underline opacity-80 hover:opacity-100"
                            >
                              <Paperclip className="h-3 w-3" /> Attachment
                            </a>
                          )}
                        </div>
                      </div>
                      {!isBuyer && (
                        <Avatar className={`h-7 w-7 ${showHeader ? '' : 'invisible'}`}>
                          <AvatarImage src={image || ''} />
                          <AvatarFallback className="text-[10px] bg-purple-500/20 text-purple-500">
                            {initials(name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChats;
