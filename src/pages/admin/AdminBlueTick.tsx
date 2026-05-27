import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Search, Check, X, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import BlueTickBadge from '@/components/BlueTickBadge';

type App = {
  id: string; user_id: string; freelancer_id: string;
  reason: string; experience: string | null; portfolio_links: string[];
  status: string; admin_notes: string | null;
  created_at: string;
  profile?: { full_name: string | null; email: string | null; profile_image_url: string | null } | null;
  stats?: { orders: number; rating: number; last_seen: string | null; is_verified: boolean; has_blue_tick: boolean };
};

const AdminBlueTick: React.FC = () => {
  const [rows, setRows] = useState<App[]>([]);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'active'>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<App | null>(null);
  const [notes, setNotes] = useState('');
  const [activeTicks, setActiveTicks] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: apps } = await (supabase as any)
      .from('blue_tick_applications').select('*').order('created_at', { ascending: false });
    const ids = Array.from(new Set((apps || []).map((r: any) => r.user_id))) as string[];
    const flIds = Array.from(new Set((apps || []).map((r: any) => r.freelancer_id))) as string[];

    const [{ data: profiles }, { data: freelancers }] = await Promise.all([
      ids.length ? supabase.from('profiles').select('id, full_name, email, profile_image_url, last_seen').in('id', ids) : Promise.resolve({ data: [] as any[] }),
      flIds.length ? supabase.from('freelancers').select('id, rating, is_verified, has_blue_tick, completed_orders').in('id', flIds) : Promise.resolve({ data: [] as any[] }),
    ]);

    const enriched: App[] = (apps || []).map((r: any) => {
      const p = (profiles || []).find((x: any) => x.id === r.user_id);
      const f = (freelancers || []).find((x: any) => x.id === r.freelancer_id);
      return {
        ...r,
        profile: p || null,
        stats: { orders: f?.completed_orders || 0, rating: Number(f?.rating) || 0, last_seen: p?.last_seen || null, is_verified: !!f?.is_verified, has_blue_tick: !!f?.has_blue_tick },
      };
    });
    setRows(enriched);

    // active blue ticks
    const { data: active } = await supabase
      .from('freelancers')
      .select('id, user_id, has_blue_tick, blue_tick_granted_at, completed_orders, rating')
      .eq('has_blue_tick', true);
    if (active && active.length) {
      const uids = active.map((a: any) => a.user_id);
      const { data: aprof } = await supabase.from('profiles').select('id, full_name, email, profile_image_url').in('id', uids);
      setActiveTicks(active.map((a: any) => ({ ...a, profile: (aprof || []).find((p: any) => p.id === a.user_id) })));
    } else setActiveTicks([]);

    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (a: App) => {
    setBusy(a.id);
    const { error } = await (supabase as any).rpc('admin_grant_blue_tick', { _user_id: a.user_id, _application_id: a.id, _notes: notes || null });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success('Blue Tick granted');
    setSelected(null); setNotes(''); load();
  };
  const reject = async (a: App) => {
    setBusy(a.id);
    const { error } = await (supabase as any).rpc('admin_reject_blue_tick', { _application_id: a.id, _notes: notes || null });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success('Application rejected');
    setSelected(null); setNotes(''); load();
  };
  const revoke = async (userId: string) => {
    const reason = prompt('Reason for removing Blue Tick?');
    if (!reason) return;
    const { error } = await (supabase as any).rpc('admin_revoke_blue_tick', { _user_id: userId, _reason: reason });
    if (error) return toast.error(error.message);
    toast.success('Blue Tick removed');
    load();
  };

  const filtered = rows.filter(r => {
    if (tab === 'active') return false;
    if (r.status !== tab) return false;
    const q = search.toLowerCase();
    return !q || (r.profile?.full_name || '').toLowerCase().includes(q) || (r.profile?.email || '').toLowerCase().includes(q);
  });

  const counts = {
    pending: rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
    active: activeTicks.length,
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2"><BlueTickBadge size="lg" /> Blue Tick Requests</CardTitle>
          <div className="flex gap-2 flex-wrap">
            {(['pending','approved','rejected','active'] as const).map(t => (
              <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)} ({counts[t]})
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name / email" className="pl-9" />
          </div>

          {loading ? (
            <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
          ) : tab === 'active' ? (
            <Table>
              <TableHeader><TableRow>
                <TableHead>User</TableHead><TableHead>Orders</TableHead><TableHead>Rating</TableHead><TableHead>Granted</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {activeTicks.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No active blue ticks</TableCell></TableRow>
                ) : activeTicks.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><div className="font-medium">{a.profile?.full_name || '—'}</div><div className="text-xs text-muted-foreground">{a.profile?.email}</div></TableCell>
                    <TableCell>{a.completed_orders || 0}</TableCell>
                    <TableCell>{Number(a.rating).toFixed(1)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{a.blue_tick_granted_at ? new Date(a.blue_tick_granted_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="destructive" onClick={() => revoke(a.user_id)}>
                        <ShieldOff className="w-3.5 h-3.5 mr-1" /> Remove Tick
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>User</TableHead><TableHead>Orders</TableHead><TableHead>Rating</TableHead><TableHead>Verified</TableHead><TableHead>Submitted</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No {tab} applications</TableCell></TableRow>
                ) : filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><div className="font-medium">{a.profile?.full_name || '—'}</div><div className="text-xs text-muted-foreground">{a.profile?.email}</div></TableCell>
                    <TableCell>{a.stats?.orders || 0}</TableCell>
                    <TableCell>{(a.stats?.rating || 0).toFixed(1)}</TableCell>
                    <TableCell>{a.stats?.is_verified ? <Badge variant="outline" className="text-emerald-600">Yes</Badge> : <Badge variant="outline">No</Badge>}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setSelected(a); setNotes(a.admin_notes || ''); }}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setNotes(''); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><BlueTickBadge size="md" /> Blue Tick Application</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{selected.profile?.full_name}</p></div>
                  <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{selected.profile?.email}</p></div>
                  <div><p className="text-muted-foreground text-xs">Completed orders</p><p className="font-medium">{selected.stats?.orders}</p></div>
                  <div><p className="text-muted-foreground text-xs">Rating</p><p className="font-medium">{(selected.stats?.rating || 0).toFixed(1)}</p></div>
                  <div><p className="text-muted-foreground text-xs">Verified</p><p className="font-medium">{selected.stats?.is_verified ? 'Yes' : 'No'}</p></div>
                  <div><p className="text-muted-foreground text-xs">Last active</p><p className="font-medium">{selected.stats?.last_seen ? new Date(selected.stats.last_seen).toLocaleDateString() : '—'}</p></div>
                </div>
                <div><p className="text-xs uppercase text-muted-foreground mb-1">Reason</p><p className="text-sm whitespace-pre-wrap">{selected.reason}</p></div>
                {selected.experience && (<div><p className="text-xs uppercase text-muted-foreground mb-1">Experience</p><p className="text-sm whitespace-pre-wrap">{selected.experience}</p></div>)}
                {selected.portfolio_links?.length > 0 && (
                  <div><p className="text-xs uppercase text-muted-foreground mb-1">Portfolio</p>
                    <ul className="space-y-1">{selected.portfolio_links.map((l, i) => <li key={i}><a href={l} target="_blank" rel="noreferrer" className="text-[#1d9bf0] hover:underline text-sm break-all">{l}</a></li>)}</ul>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase text-muted-foreground mb-1">Admin notes (optional)</p>
                  <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes / reason for rejection" />
                </div>
                {selected.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button className="flex-1 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" disabled={busy === selected.id} onClick={() => approve(selected)}>
                      <Check className="w-4 h-4 mr-1" /> Approve & Grant Tick
                    </Button>
                    <Button variant="destructive" className="flex-1" disabled={busy === selected.id} onClick={() => reject(selected)}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlueTick;
