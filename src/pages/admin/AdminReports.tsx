import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flag, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  related_gig_id: string | null;
  related_order_id: string | null;
  related_message_id: string | null;
  category: string;
  reason: string;
  details: string | null;
  context_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  investigating: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  resolved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  dismissed: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
};

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('user_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Failed to load reports', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    const list = (data || []) as Report[];
    setReports(list);

    const ids = Array.from(new Set(list.flatMap(r => [r.reporter_id, r.reported_user_id]).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profs } = await supabase.from('profiles').select('id, full_name, email').in('id', ids);
      const map: Record<string, any> = {};
      (profs || []).forEach((p: any) => { map[p.id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_reports' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setSavingId(id);
    const payload: any = { status, admin_notes: notes[id] ?? null };
    if (status === 'resolved' || status === 'dismissed') {
      payload.resolved_at = new Date().toISOString();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.resolved_by = user.id;
    }
    const { error } = await (supabase as any).from('user_reports').update(payload).eq('id', id);
    setSavingId(null);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Report updated' });
      load();
    }
  };

  const filtered = statusFilter === 'all' ? reports : reports.filter(r => r.status === statusFilter);
  const counts = {
    all: reports.length,
    open: reports.filter(r => r.status === 'open').length,
    investigating: reports.filter(r => r.status === 'investigating').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Flag className="w-6 h-6 text-rose-400" /> User Reports</h2>
          <p className="text-sm text-muted-foreground">Complaints submitted by users across the platform</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(counts).map(([k, v]) => (
            <Button key={k} size="sm" variant={statusFilter === k ? 'default' : 'outline'} onClick={() => setStatusFilter(k)}>
              {k} ({v})
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No reports.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => {
            const reporter = profiles[r.reporter_id];
            const reported = r.reported_user_id ? profiles[r.reported_user_id] : null;
            return (
              <Card key={r.id} className="bg-slate-900/40 border-slate-700/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{r.category.replace('_', ' ')}</Badge>
                        <Badge className={STATUS_COLORS[r.status] || ''}>{r.status}</Badge>
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                    {r.context_url && (
                      <a href={r.context_url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Context
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Reporter</p>
                      <p className="font-medium">{reporter?.full_name || 'Unknown'} <span className="text-xs text-muted-foreground">({reporter?.email})</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reported user</p>
                      <p className="font-medium">{reported?.full_name || (r.reported_user_id ? 'Unknown user' : '—')} {reported?.email && <span className="text-xs text-muted-foreground">({reported.email})</span>}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Reason</p>
                    <p>{r.reason}</p>
                  </div>
                  {r.details && (
                    <div>
                      <p className="text-xs text-muted-foreground">Details</p>
                      <p className="whitespace-pre-wrap">{r.details}</p>
                    </div>
                  )}
                  {(r.related_gig_id || r.related_order_id || r.related_message_id) && (
                    <div className="text-xs text-muted-foreground">
                      {r.related_gig_id && <span className="mr-3">Gig: {r.related_gig_id}</span>}
                      {r.related_order_id && <span className="mr-3">Order: {r.related_order_id}</span>}
                      {r.related_message_id && <span>Message: {r.related_message_id}</span>}
                    </div>
                  )}
                  <div className="space-y-2 pt-2 border-t border-slate-700/50">
                    <Textarea
                      placeholder="Admin notes..."
                      defaultValue={r.admin_notes || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                      rows={2}
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Select defaultValue={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" disabled={savingId === r.id} onClick={() => updateStatus(r.id, r.status)}>
                        {savingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Notes'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
