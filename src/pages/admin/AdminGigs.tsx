import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2, Search, ExternalLink, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { deleteGigCompletely, DELETE_GIG_CONFIRM } from '@/lib/deleteGig';

interface AdminGig {
  id: string;
  title: string;
  status: string | null;
  base_price: number | null;
  created_at: string | null;
  is_vip: boolean | null;
  category_slug: string | null;
  freelancer_id: string;
  seller?: string;
}

const AdminGigs = () => {
  const [gigs, setGigs] = useState<AdminGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminGig | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gigs')
      .select('id, title, status, base_price, created_at, is_vip, category_slug, freelancer_id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading gigs:', error);
      toast({ title: 'Could not load gigs', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const rows = (data || []) as AdminGig[];

    // Resolve seller names for display.
    const freelancerIds = [...new Set(rows.map(r => r.freelancer_id).filter(Boolean))];
    if (freelancerIds.length) {
      const { data: freelancers } = await supabase
        .from('freelancers').select('id, user_id').in('id', freelancerIds);
      const userIds = [...new Set((freelancers || []).map(f => f.user_id))];
      const { data: profiles } = await supabase
        .from('profiles').select('id, full_name, username').in('id', userIds);
      const nameByUser = new Map((profiles || []).map(p => [p.id, p.full_name || p.username || 'Unknown']));
      const nameByFreelancer = new Map((freelancers || []).map(f => [f.id, nameByUser.get(f.user_id) || 'Unknown']));
      rows.forEach(r => { r.seller = nameByFreelancer.get(r.freelancer_id) || 'Unknown'; });
    }

    setGigs(rows);
    setLoading(false);
  };

  useEffect(() => {
    fetchGigs();
    const channel = supabase
      .channel('admin-gigs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, () => fetchGigs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gigs;
    return gigs.filter(g =>
      g.title?.toLowerCase().includes(q) ||
      g.seller?.toLowerCase().includes(q) ||
      g.category_slug?.toLowerCase().includes(q)
    );
  }, [gigs, query]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setDeleting(true);
    try {
      await deleteGigCompletely(target.id);
      setGigs(prev => prev.filter(g => g.id !== target.id));
      setPendingDelete(null);
      toast({ title: 'Gig deleted', description: 'The gig, its related records and files were permanently removed.' });
      fetchGigs();
    } catch (error: any) {
      console.error('Error deleting gig:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete gig. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gigs</h2>
          <p className="text-sm text-muted-foreground">Review and permanently remove any gig on the platform</p>
        </div>
        <Badge variant="outline">{filtered.length} gigs</Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, seller or category"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />Loading gigs…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No gigs found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map(gig => (
            <Card key={gig.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <CardTitle className="text-base font-semibold break-words">{gig.title}</CardTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {gig.is_vip && <Badge variant="outline">VIP</Badge>}
                    <Badge variant={gig.status === 'active' ? 'default' : 'secondary'}>{gig.status || 'draft'}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Seller: <span className="text-foreground">{gig.seller || '—'}</span></span>
                  <span>Price: <span className="text-foreground">${Number(gig.base_price ?? 0).toFixed(2)}</span></span>
                  {gig.category_slug && <span>Category: <span className="text-foreground">{gig.category_slug}</span></span>}
                  {gig.created_at && <span>{new Date(gig.created_at).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                    <a href={`/gig/${gig.id}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />View gig
                    </a>
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    onClick={() => setPendingDelete(gig)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && !deleting && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gig?</AlertDialogTitle>
            <AlertDialogDescription>
              {DELETE_GIG_CONFIRM}
              {pendingDelete?.title && (
                <span className="block mt-2 font-medium text-foreground break-words">{pendingDelete.title}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGigs;
