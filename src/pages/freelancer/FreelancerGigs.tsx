import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, Plus, Briefcase, Crown, Gem, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { gigPath } from '@/lib/urls';
import { getGigLimitForVipTier, resolveVipTier } from '@/lib/vipTheme';
import { deleteGigCompletely, DELETE_GIG_CONFIRM } from '@/lib/deleteGig';

const FreelancerGigs = () => {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vipTier, setVipTier] = useState<'golden' | 'platinum' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const gigLimit = getGigLimitForVipTier(vipTier);
  const activeGigsUsed = gigs.filter(g => g.status === 'active').length;
  const remainingGigs = Math.max(gigLimit - activeGigsUsed, 0);
  const hasReachedLimit = activeGigsUsed >= gigLimit;

  useEffect(() => { fetchGigs(); }, []);

  const fetchGigs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('id, vip_tier, vip_expires_at')
        .eq('user_id', user.id)
        .single();
      if (!freelancer) return;

      setVipTier(resolveVipTier((freelancer as any).vip_tier, (freelancer as any).vip_expires_at));

      const { data: gigsData, error } = await supabase
        .from('gigs').select('*').eq('freelancer_id', freelancer.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setGigs(gigsData || []);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGig = () => {
    if (hasReachedLimit) {
      toast({ title: "You've reached your gig limit", description: vipTier ? "Your VIP gig limit is full. Delete a gig or upgrade your VIP plan." : "Please delete an existing gig or upgrade to VIP to add a new one.", variant: "destructive" });
      return;
    }
    navigate('/create-gig');
  };

  const toggleVip = async (gig: any) => {
    if (!vipTier) {
      toast({ title: 'VIP required', description: 'Upgrade to Golden or Platinum VIP to mark gigs.', variant: 'destructive' });
      return;
    }
    const newVal = !gig.is_vip;
    if (newVal && activeGigsUsed > gigLimit) {
      toast({ title: 'VIP limit reached', description: `Your ${vipTier === 'platinum' ? 'Platinum' : 'Golden'} VIP plan allows ${gigLimit} active gigs.`, variant: 'destructive' });
      return;
    }
    const { error } = await (supabase as any).from('gigs').update({ is_vip: newVal }).eq('id', gig.id);
    if (error) {
      toast({ title: 'Cannot update', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: newVal ? '✨ Marked as VIP gig' : 'Removed VIP status' });
    fetchGigs();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setDeleting(true);
    try {
      await deleteGigCompletely(target.id);
      setGigs(prev => prev.filter(g => g.id !== target.id));
      setPendingDelete(null);
      toast({ title: 'Gig deleted', description: 'The gig and all of its files were permanently removed.' });
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
    <div className="min-h-screen bg-background px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Gigs</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Manage all your service offerings</p>
            </div>
            <Button onClick={handleCreateNewGig} disabled={loading || hasReachedLimit} className="flex items-center justify-center space-x-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" /><span>Create New Gig</span>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="text-muted-foreground">{activeGigsUsed} / {gigLimit} active gigs used</div>
            {vipTier && (
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-foreground shadow-sm">
                {vipTier === 'platinum' ? <Gem className="w-3.5 h-3.5 mr-1 text-primary" /> : <Crown className="w-3.5 h-3.5 mr-1 text-primary" />}
                VIP Gigs: {activeGigsUsed} / {gigLimit} · {remainingGigs} left
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading gigs...</div>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {gigs.map((gig) => (
                <Card key={gig.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 sm:pb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg sm:text-xl leading-tight">{gig.title}</CardTitle>
                          {gig.is_vip && (
                            <Badge className="border-0 text-[10px]" style={{ background: 'linear-gradient(135deg,#FFD166,#A78BFA)', color: '#0B0E14' }}>
                              ✨ VIP GIG
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4 mt-2">
                          <span className="text-xl sm:text-2xl font-bold text-green-600">${Number(gig.base_price).toFixed(2)}</span>
                          <span className="text-sm text-muted-foreground">{gig.delivery_time_days} days delivery</span>
                        </div>
                      </div>
                      <Badge variant={gig.status === 'active' ? 'default' : 'secondary'} className="w-fit">{gig.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      <div className="text-sm text-muted-foreground line-clamp-2">{gig.description}</div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                        {vipTier && (
                          <Button variant={gig.is_vip ? 'default' : 'outline'} size="sm" className="w-full sm:w-auto" onClick={() => toggleVip(gig)}>
                            <Crown className="w-4 h-4 mr-1" />{gig.is_vip ? 'Unmark VIP' : 'Mark VIP'}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate(gigPath(gig))}>
                          <Eye className="w-4 h-4 mr-1" />View
                        </Button>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate(`/edit-gig/${gig.id}`)}>
                          <Edit className="w-4 h-4 mr-1" />Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 w-full sm:w-auto" onClick={() => setPendingDelete({ id: gig.id, title: gig.title })}>
                          <Trash2 className="w-4 h-4 mr-1" />Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {gigs.length === 0 && !loading && (
            <Card>
              <CardContent className="p-6 sm:p-12 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-foreground">No gigs yet</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">Create your first gig to start offering your services</p>
                  </div>
                  <Button onClick={handleCreateNewGig} className="mt-4 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />Create Your First Gig
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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

export default FreelancerGigs;
