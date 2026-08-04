import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchAdminProfile, fetchAdminProfiles, fetchAllAdminProfiles, findAdminProfileByEmail, displayName } from '@/lib/adminUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { CheckCircle, Star, XCircle, Search, Shield, Ban, Trophy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { fetchFreelancerEarnings } from '@/lib/freelancerEarnings';

interface FreelancerUser {
  id: string;
  user_id: string;
  rating: number;
  completed_orders: number;
  is_verified: boolean;
  is_featured: boolean;
  ranking_score: number;
  bio: string | null;
  total_earnings: number;
  profile?: { full_name: string; email: string; profile_image_url: string | null; location: string | null; created_at: string | null };
}

const AdminUsers = () => {
  const [freelancers, setFreelancers] = useState<FreelancerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<FreelancerUser | null>(null);
  const [editScore, setEditScore] = useState(0);
  const [editBio, setEditBio] = useState('');
  const [removeUser, setRemoveUser] = useState<FreelancerUser | null>(null);
  const [removeReason, setRemoveReason] = useState('');

  const fetchFreelancers = async () => {
    const { data, error } = await (supabase as any)
      .from('freelancers')
      .select('id, user_id, rating, completed_orders, is_verified, is_featured, ranking_score, bio');

    if (error) { console.error(error); return; }

    // Earnings are not readable from the table directly (financial column); admins read them via RPC.
    const earnings = await fetchFreelancerEarnings((data || []).map((f: any) => f.id));

    const withProfiles = await Promise.all(
      (data || []).map(async (f) => {
        const profile = await fetchAdminProfile(f.user_id);
        return { ...f, total_earnings: earnings.get(f.id) ?? 0, profile: (profile as any) || { full_name: 'Fivesom User', email: '', profile_image_url: null, location: null, created_at: null } };
      })
    );

    setFreelancers(withProfiles as FreelancerUser[]);
    setLoading(false);
  };

  useEffect(() => { fetchFreelancers(); }, []);

  const verifyUser = async (f: FreelancerUser) => {
    const payload: any = {
      is_verified: true,
      verified_at: new Date().toISOString(),
      verification_removed_at: null,
      verification_removal_reason: null,
      verification_removed_by: null,
    };
    const { error } = await (supabase as any).from('freelancers').update(payload).eq('id', f.id);
    if (error) { toast.error(error.message || 'Failed to update'); return; }

    const { data: latest } = await supabase
      .from('verification_documents')
      .select('id')
      .eq('user_id', f.user_id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id) {
      await supabase.from('verification_documents').update({ status: 'approved', note: 'Approved by admin' }).eq('id', latest.id);
    }

    toast.success('User verified ✓');
    fetchFreelancers();
  };

  const confirmRemoveVerification = async () => {
    if (!removeUser) return;
    const { data: { user: admin } } = await supabase.auth.getUser();
    const reason = removeReason.trim() || 'Verification revoked by admin.';
    const payload: any = {
      is_verified: false,
      verified_at: null,
      verification_removed_at: new Date().toISOString(),
      verification_removal_reason: reason,
      verification_removed_by: admin?.id || null,
    };
    const { error } = await (supabase as any).from('freelancers').update(payload).eq('id', removeUser.id);
    if (error) { toast.error(error.message || 'Failed to remove'); return; }

    const { data: latest } = await supabase
      .from('verification_documents')
      .select('id')
      .eq('user_id', removeUser.user_id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest?.id) {
      await supabase.from('verification_documents').update({ status: 'rejected', note: reason }).eq('id', latest.id);
    }

    toast.success('Verification removed');
    setRemoveUser(null);
    setRemoveReason('');
    fetchFreelancers();
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('freelancers').update({ is_featured: !current }).eq('id', id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(!current ? 'User featured!' : 'Feature removed');
    fetchFreelancers();
  };

  const openEdit = (f: FreelancerUser) => {
    setEditUser(f);
    setEditScore(Number(f.ranking_score || 0));
    setEditBio(f.bio || '');
  };

  const saveEdit = async () => {
    if (!editUser) return;
    const { error } = await supabase.from('freelancers').update({
      ranking_score: editScore,
      bio: editBio,
    }).eq('id', editUser.id);
    if (error) { toast.error('Failed to save'); return; }
    toast.success('User updated');
    setEditUser(null);
    fetchFreelancers();
  };

  const filtered = freelancers.filter(f =>
    (f.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.profile?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = freelancers.length;
  const verifiedCount = freelancers.filter(f => f.is_verified).length;
  const featuredCount = freelancers.filter(f => f.is_featured).length;

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
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Freelancers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{featuredCount}</p>
              <p className="text-xs text-muted-foreground">Featured</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Freelancer Management</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow key={f.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {(f.profile?.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{f.profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{f.profile?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">⭐ {Number(f.rating || 0).toFixed(1)}</TableCell>
                  <TableCell className="text-foreground">{f.completed_orders || 0}</TableCell>
                  <TableCell className="text-foreground font-medium">${Number(f.total_earnings || 0).toFixed(0)}</TableCell>
                  <TableCell className="text-foreground">{Number(f.ranking_score || 0).toFixed(0)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {f.is_verified && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-500/10 text-xs">✓ Verified</Badge>}
                      {f.is_featured && <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-500/10 text-xs">⭐ Featured</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {f.is_verified ? (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => { setRemoveUser(f); setRemoveReason(''); }}>
                          ✕ Remove Verification
                        </Button>
                      ) : (
                        <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => verifyUser(f)}>
                          ✓ Verify
                        </Button>
                      )}
                      <Button size="sm" variant={f.is_featured ? "outline" : "secondary"} className="h-7 text-xs" onClick={() => toggleFeatured(f.id, !!f.is_featured)}>
                        {f.is_featured ? '✕ Unfeature' : '⭐ Feature'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openEdit(f)}>
                        ✏️ Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found</TableCell>
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
            <DialogTitle>Edit User: {editUser?.profile?.full_name}</DialogTitle>
            <DialogDescription>Modify user data directly. Admin has full control.</DialogDescription>
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
              Removing verification from <strong>{removeUser?.profile?.full_name}</strong> will instantly hide the blue badge across the marketplace and notify the freelancer.
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
