import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllAdminProfiles, displayName, type AdminProfile } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, Briefcase, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { fetchFreelancerEarnings } from '@/lib/freelancerEarnings';

interface FreelancerRow {
  id: string;
  user_id: string;
  rating: number | null;
  completed_orders: number | null;
  is_verified: boolean | null;
  is_featured: boolean | null;
  ranking_score: number | null;
  bio: string | null;
  total_earnings: number;
}

interface UserRow extends AdminProfile {
  freelancer?: FreelancerRow;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [editBio, setEditBio] = useState('');
  const [removeUser, setRemoveUser] = useState<UserRow | null>(null);
  const [removeReason, setRemoveReason] = useState('');

  const load = useCallback(async () => {
    const [profiles, flRes] = await Promise.all([
      fetchAllAdminProfiles(),
      (supabase as any)
        .from('freelancers')
        .select('id, user_id, rating, completed_orders, is_verified, is_featured, ranking_score, bio'),
    ]);

    const freelancers = (flRes?.data || []) as FreelancerRow[];
    const earnings = await fetchFreelancerEarnings(freelancers.map((f) => f.id));
    const byUser = new Map(
      freelancers.map((f) => [f.user_id, { ...f, total_earnings: earnings.get(f.id) ?? 0 }]),
    );

    const rows: UserRow[] = profiles
      .map((p) => ({ ...p, freelancer: byUser.get(p.id) }))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    setUsers(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => load(), 600);
    };
    const channel = supabase.channel('admin-users-live');
    ['profiles', 'freelancers', 'buyers', 'user_roles'].forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, schedule);
    });
    channel.subscribe();
    const poll = setInterval(() => load(), 60000);
    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const verifyUser = async (u: UserRow) => {
    if (!u.freelancer) return;
    const payload: any = {
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_removed_at: null,
      verification_removal_reason: null,
      verification_removed_by: null,
    };
    const { error } = await (supabase as any).from('freelancers').update(payload).eq('id', u.freelancer.id);
    if (error) { toast.error(error.message || 'Failed to update'); return; }

    const { data: latest } = await supabase
      .from('verification_documents')
      .select('id')
      .eq('user_id', u.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id) {
      await supabase.from('verification_documents').update({ status: 'approved', note: 'Approved by admin' }).eq('id', latest.id);
    }

    toast.success('User verified ✓');
    load();
  };

  const confirmRemoveVerification = async () => {
    if (!removeUser?.freelancer) return;
    const { data: { user: admin } } = await supabase.auth.getUser();
    const reason = removeReason.trim() || 'Verification revoked by admin.';
    const payload: any = {
      is_verified: false,
      verified_at: null,
      verification_removed_at: new Date().toISOString(),
      verification_removal_reason: reason,
      verification_removed_by: admin?.id || null,
    };
    const { error } = await (supabase as any).from('freelancers').update(payload).eq('id', removeUser.freelancer.id);
    if (error) { toast.error(error.message || 'Failed to remove'); return; }

    const { data: latest } = await supabase
      .from('verification_documents')
      .select('id')
      .eq('user_id', removeUser.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id) {
      await supabase.from('verification_documents').update({ status: 'rejected', note: reason }).eq('id', latest.id);
    }

    toast.success('Verification removed');
    setRemoveUser(null);
    setRemoveReason('');
    load();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('freelancers').update({ is_featured: !current }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(!current ? 'User featured!' : 'Feature removed');
    load();
  };

  const openEdit = (u: UserRow) => {
    setEditUser(u);
    setEditScore(Number(u.freelancer?.ranking_score || 0));
    setEditBio(u.freelancer?.bio || u.bio || '');
  };

  const saveEdit = async () => {
    if (!editUser?.freelancer) return;
    const { error } = await supabase.from('freelancers').update({
      ranking_score: editScore,
      bio: editBio,
    }).eq('id', editUser.freelancer.id);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('User updated');
    setEditUser(null);
    load();
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchS = !s
        || (u.full_name || '').toLowerCase().includes(s)
        || (u.username || '').toLowerCase().includes(s)
        || (u.email || '').toLowerCase().includes(s);
      const matchR = roleFilter === 'all' || (u.role || 'user') === roleFilter;
      return matchS && matchR;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;
  const freelancerCount = users.filter((u) => u.role === 'freelancer' || u.freelancer).length;
  const buyerCount = users.filter((u) => u.role === 'buyer').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users, tone: 'bg-primary/10 text-primary' },
          { label: 'Freelancers', value: freelancerCount, icon: Briefcase, tone: 'bg-green-500/10 text-green-500' },
          { label: 'Buyers', value: buyerCount, icon: ShoppingCart, tone: 'bg-yellow-500/10 text-yellow-500' },
        ].map((c) => (
          <Card key={c.label} className="border-border">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.tone}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">All Users ({filtered.length})</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="user">Members</SelectItem>
                <SelectItem value="buyer">Buyers</SelectItem>
                <SelectItem value="freelancer">Freelancers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => {
                const f = u.freelancer;
                return (
                  <TableRow key={u.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {u.profile_image_url ? (
                          <img src={u.profile_image_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                            {displayName(u)[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{displayName(u)}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email || '—'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="text-foreground">{f ? `⭐ ${Number(f.rating || 0).toFixed(1)}` : '—'}</TableCell>
                    <TableCell className="text-foreground">{f ? (f.completed_orders || 0) : '—'}</TableCell>
                    <TableCell className="text-foreground font-medium">{f ? `$${Number(f.total_earnings || 0).toFixed(0)}` : '—'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {f?.is_verified && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-500/10 text-xs">✓ Verified</Badge>}
                        {f?.is_featured && <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-500/10 text-xs">⭐ Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!f ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {f.is_verified ? (
                            <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setRemoveUser(u); setRemoveReason(''); }}>
                              ✕ Remove Verification
                            </Button>
                          ) : (
                            <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => verifyUser(u)}>
                              ✓ Verify
                            </Button>
                          )}
                          <Button size="sm" variant={f.is_featured ? 'outline' : 'secondary'} className="h-7 text-xs" onClick={() => toggleFeatured(f.id, !!f.is_featured)}>
                            {f.is_featured ? '✕ Unfeature' : '⭐ Feature'}
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(u)}>
                            ✏️ Edit
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {displayName(editUser)}</DialogTitle>
            <DialogDescription>Modify freelancer data directly. Admin has full control.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Ranking Score</label>
              <Input type="number" value={editScore} onChange={(e) => setEditScore(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Verification Dialog */}
      <Dialog open={!!removeUser} onOpenChange={(o) => { if (!o) { setRemoveUser(null); setRemoveReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Verification</DialogTitle>
            <DialogDescription>
              Removing verification from <strong>{displayName(removeUser)}</strong> will instantly hide the blue badge across the marketplace and notify the freelancer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Reason (shown to the freelancer)</label>
            <Textarea
              value={removeReason}
              onChange={(e) => setRemoveReason(e.target.value)}
              rows={3}
              placeholder="e.g. Reported for using stolen portfolio work."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRemoveUser(null); setRemoveReason(''); }}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemoveVerification}>Remove Verification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
