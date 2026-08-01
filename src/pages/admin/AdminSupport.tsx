import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAdminProfile, fetchAdminProfiles, fetchAllAdminProfiles, findAdminProfileByEmail, displayName } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { LifeBuoy, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Ticket = { id: string; user_id: string; subject: string; message: string; category: string | null; status: string; created_at: string; _table: string; user_name?: string };

const AdminSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [reply, setReply] = useState('');

  const fetch = async () => {
    setLoading(true);
    const sources = ['support_tickets', 'buyer_support_tickets', 'freelancer_support_tickets'] as const;
    const all: Ticket[] = [];
    for (const t of sources) {
      const { data } = await supabase.from(t).select('*');
      (data || []).forEach((d: any) => all.push({ ...d, _table: t }));
    }
    const enriched = await Promise.all(all.map(async (t) => {
      const p = await fetchAdminProfile(t.user_id);
      return { ...t, user_name: displayName(p) };
    }));
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setTickets(enriched);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (!open) return;
    supabase.from('support_ticket_replies' as any).select('*').eq('ticket_id', open.id).order('created_at').then(({ data }: any) => setReplies(data || []));
  }, [open]);

  const setStatus = async (t: Ticket, status: string) => {
    const { error } = await supabase.from(t._table as any).update({ status }).eq('id', t.id);
    if (error) return toast.error('Failed');
    toast.success(`Ticket ${status}`);
    fetch();
    if (open) setOpen({ ...open, status });
  };

  const sendReply = async () => {
    if (!open || !reply.trim() || !user) return;
    const { error } = await supabase.from('support_ticket_replies' as any).insert({ ticket_id: open.id, ticket_table: open._table, sender_id: user.id, is_admin: true, message: reply });
    if (error) return toast.error('Failed');
    setReply('');
    const { data }: any = await supabase.from('support_ticket_replies' as any).select('*').eq('ticket_id', open.id).order('created_at');
    setReplies(data || []);
    toast.success('Reply sent');
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-500">{tickets.filter(t => t.status === 'open').length}</p><p className="text-xs text-muted-foreground">Open</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-green-500">{tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><LifeBuoy className="h-4 w-4" /> Support Tickets</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {tickets.map(t => (
            <div key={t._table + t.id} className="p-3 border border-border rounded-lg flex items-start gap-3 hover:bg-muted/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><span className="font-medium text-sm text-foreground">🎫 {t.subject}</span><Badge variant="outline" className="text-[10px]">{t._table.replace('_support_tickets', '').replace('_tickets', '') || 'general'}</Badge></div>
                <p className="text-xs text-muted-foreground">from {t.user_name} • {new Date(t.created_at).toLocaleString()}</p>
                <p className="text-sm text-foreground line-clamp-2 mt-1">{t.message}</p>
              </div>
              <Badge variant="outline" className={t.status === 'open' ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' : 'text-green-500 border-green-500/30 bg-green-500/10'}>{t.status}</Badge>
              <Button size="sm" variant="outline" onClick={() => setOpen(t)}>Open</Button>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-center text-muted-foreground py-8">No tickets</p>}
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader><DialogTitle>{open.subject}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded">
                  <p className="text-xs text-muted-foreground">{open.user_name} • {new Date(open.created_at).toLocaleString()}</p>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{open.message}</p>
                </div>
                {replies.map(r => (
                  <div key={r.id} className={`p-3 rounded ${r.is_admin ? 'bg-primary/10 ml-8' : 'bg-muted mr-8'}`}>
                    <p className="text-xs text-muted-foreground">{r.is_admin ? '👨‍💼 Admin' : '👤 User'} • {new Date(r.created_at).toLocaleString()}</p>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{r.message}</p>
                  </div>
                ))}
                <div>
                  <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply to user…" rows={3} />
                  <div className="flex gap-2 mt-2">
                    <Button onClick={sendReply}><Send className="h-4 w-4 mr-1" /> Send Reply</Button>
                    <Button variant="outline" onClick={() => setStatus(open, 'in_progress')}>In Progress</Button>
                    <Button variant="outline" onClick={() => setStatus(open, 'closed')}>Close Ticket</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;
