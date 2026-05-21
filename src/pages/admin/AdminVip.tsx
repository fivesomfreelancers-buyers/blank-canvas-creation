import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Gem, Loader2, Search, X, Check } from 'lucide-react';
import { toast } from 'sonner';

type VipRow = {
  id: string;
  user_id: string;
  tier: 'golden' | 'platinum';
  payment_status: string;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
  notes: string | null;
  profile?: { full_name: string | null; email: string | null; profile_image_url: string | null } | null;
};

const TIER_STYLE: Record<'golden'|'platinum', { color: string; bg: string; label: string; icon: any }> = {
  golden: { color: '#FFD166', bg: 'rgba(255,209,102,0.12)', label: 'Golden VIP', icon: Crown },
  platinum: { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', label: 'Platinum VIP', icon: Gem },
};

const AdminVip: React.FC = () => {
  const [rows, setRows] = useState<VipRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'active'>('requests');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  // Grant form
  const [grantEmail, setGrantEmail] = useState('');
  const [grantTier, setGrantTier] = useState<'golden' | 'platinum'>('golden');

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('vip_memberships')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error(error.message); setLoading(false); return; }

    const ids = Array.from(new Set((data || []).map((r: any) => r.user_id)));
    let profiles: any[] = [];
    if (ids.length) {
      const { data: p } = await supabase.from('profiles').select('id, full_name, email, profile_image_url').in('id', ids);
      profiles = p || [];
    }
    const enriched = (data || []).map((r: any) => ({ ...r, profile: profiles.find((p) => p.id === r.user_id) || null }));
    setRows(enriched);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // also auto-expire on visit
    (supabase as any).rpc('expire_vip_memberships').then(() => {});
  }, [load]);

  const activate = async (row: VipRow) => {
    setBusy(row.id);
    const { error } = await (supabase as any).rpc('admin_set_vip', { _user_id: row.user_id, _tier: row.tier });
    if (error) toast.error(error.message); else toast.success(`${TIER_STYLE[row.tier].label} activated`);
    // mark request handled
    await (supabase as any).from('vip_memberships').update({ payment_status: 'activated' }).eq('id', row.id);
    setBusy(null);
    load();
  };

  const reject = async (row: VipRow) => {
    setBusy(row.id);
    const { error } = await (supabase as any).from('vip_memberships').update({ payment_status: 'rejected' }).eq('id', row.id);
    if (error) toast.error(error.message); else toast.success('Request rejected');
    setBusy(null);
    load();
  };

  const remove = async (row: VipRow) => {
    if (!confirm(`Remove VIP from ${row.profile?.full_name || row.profile?.email || 'user'}?`)) return;
    setBusy(row.id);
    const { error } = await (supabase as any).rpc('admin_remove_vip', { _user_id: row.user_id });
    if (error) toast.error(error.message); else toast.success('VIP removed');
    setBusy(null);
    load();
  };

  const grantToEmail = async () => {
    if (!grantEmail.trim()) return;
    setBusy('grant');
    const { data: p } = await supabase.from('profiles').select('id').eq('email', grantEmail.trim()).maybeSingle();
    if (!p) { toast.error('No user with that email'); setBusy(null); return; }
    const { error } = await (supabase as any).rpc('admin_set_vip', { _user_id: p.id, _tier: grantTier });
    if (error) toast.error(error.message);
    else { toast.success(`${TIER_STYLE[grantTier].label} granted`); setGrantEmail(''); }
    setBusy(null);
    load();
  };

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    const name = (r.profile?.full_name || '').toLowerCase();
    const email = (r.profile?.email || '').toLowerCase();
    const matchSearch = !q || name.includes(q) || email.includes(q);
    const matchTab = tab === 'requests' ? r.payment_status === 'pending' : r.payment_status === 'activated';
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-6">
      <Card style={{ background: 'linear-gradient(180deg, rgba(13,17,26,0.85), rgba(11,14,20,0.9))', borderColor: 'rgba(167,139,250,0.3)' }}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#FFD166]" /> Grant VIP to user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="user@example.com"
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Select value={grantTier} onValueChange={(v: any) => setGrantTier(v)}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="golden">🥇 Golden VIP (30 days)</SelectItem>
                <SelectItem value="platinum">💎 Platinum VIP (1 year)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={grantToEmail} disabled={busy === 'grant'} className="bg-gradient-to-r from-[#FFD166] to-[#A78BFA] text-slate-900 font-semibold">
              {busy === 'grant' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate VIP'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card style={{ background: 'linear-gradient(180deg, rgba(13,17,26,0.85), rgba(11,14,20,0.9))', borderColor: 'rgba(0,163,255,0.18)' }}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-2">
            <Button size="sm" variant={tab === 'requests' ? 'default' : 'outline'} onClick={() => setTab('requests')}>
              Pending Requests ({rows.filter(r => r.payment_status === 'pending').length})
            </Button>
            <Button size="sm" variant={tab === 'active' ? 'default' : 'outline'} onClick={() => setTab('active')}>
              Active VIPs ({rows.filter(r => r.payment_status === 'activated').length})
            </Button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="pl-9 bg-slate-900 border-slate-700 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-slate-400">No {tab === 'requests' ? 'pending requests' : 'active VIPs'}.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">User</TableHead>
                    <TableHead className="text-slate-400">Tier</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Activated</TableHead>
                    <TableHead className="text-slate-400">Expires</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => {
                    const ts = TIER_STYLE[r.tier];
                    const Icon = ts.icon;
                    return (
                      <TableRow key={r.id} className="border-slate-800">
                        <TableCell>
                          <div className="text-white font-medium">{r.profile?.full_name || '—'}</div>
                          <div className="text-xs text-slate-400">{r.profile?.email || '—'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className="border-0" style={{ background: ts.bg, color: ts.color, boxShadow: `inset 0 0 0 1px ${ts.color}55` }}>
                            <Icon className="h-3 w-3 mr-1" /> {ts.label}
                          </Badge>
                        </TableCell>
                        <TableCell><span className="capitalize text-slate-200">{r.payment_status}</span></TableCell>
                        <TableCell className="text-xs text-slate-300">{r.activated_at ? new Date(r.activated_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-xs text-slate-300">{r.expires_at ? new Date(r.expires_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right">
                          {r.payment_status === 'pending' ? (
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={() => activate(r)} disabled={busy === r.id} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Check className="h-4 w-4 mr-1" /> Activate
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => reject(r)} disabled={busy === r.id} className="border-slate-700 text-slate-300">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="destructive" onClick={() => remove(r)} disabled={busy === r.id}>
                              Remove VIP
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVip;
