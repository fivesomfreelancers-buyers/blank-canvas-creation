import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Eye, Paperclip } from 'lucide-react';

interface Conv { id: string; buyer_id: string; freelancer_id: string; created_at: string; buyer_name?: string; freelancer_name?: string; message_count?: number; last_msg?: string; }

const AdminChats = () => {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchConvs = async () => {
    const { data } = await supabase.from('conversations').select('*').order('created_at', { ascending: false });
    const enriched = await Promise.all((data || []).map(async (c: any) => {
      const [b, f, m] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', c.buyer_id).maybeSingle(),
        supabase.from('profiles').select('full_name').eq('id', c.freelancer_id).maybeSingle(),
        supabase.from('messages').select('id, message', { count: 'exact' }).eq('conversation_id', c.id).order('created_at', { ascending: false }).limit(1),
      ]);
      return { ...c, buyer_name: b.data?.full_name, freelancer_name: f.data?.full_name, message_count: m.count || 0, last_msg: m.data?.[0]?.message };
    }));
    setConvs(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchConvs(); }, []);

  useEffect(() => {
    if (!open) return;
    supabase.from('messages').select('*').eq('conversation_id', open.id).order('created_at').then(({ data }) => setMessages(data || []));
  }, [open]);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Live Chat Monitor ({convs.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {convs.length === 0 && <p className="text-center text-muted-foreground py-8">No conversations</p>}
          {convs.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground">👤 {c.buyer_name || '?'} ↔ 👨‍💻 {c.freelancer_name || '?'}</p>
                <p className="text-xs text-muted-foreground truncate">{c.last_msg || 'No messages'}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.message_count} msgs</span>
              <Button size="sm" variant="outline" onClick={() => setOpen(c)}><Eye className="h-3.5 w-3.5 mr-1" /> Open</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.buyer_name} ↔ {open.freelancer_name}</DialogTitle></DialogHeader>
              <div className="space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`p-2 rounded-lg text-sm ${m.sender_id === open.buyer_id ? 'bg-muted' : 'bg-primary/10'}`}>
                    <p className="text-xs text-muted-foreground mb-1">{m.sender_id === open.buyer_id ? open.buyer_name : open.freelancer_name} • {new Date(m.created_at).toLocaleString()}</p>
                    <p className="text-foreground whitespace-pre-wrap">{m.message}</p>
                    {m.attachment_url && <a href={m.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1"><Paperclip className="h-3 w-3" /> Attachment</a>}
                  </div>
                ))}
                {messages.length === 0 && <p className="text-center text-muted-foreground py-8">No messages</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChats;
