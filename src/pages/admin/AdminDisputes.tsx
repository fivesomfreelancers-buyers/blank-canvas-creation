import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Scale, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import DisputeChat from '@/components/dispute/DisputeChat';

interface Dispute {
  id: string;
  order_id: string;
  buyer_id: string;
  freelancer_id: string;
  reason: string;
  details: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  buyer_name?: string;
  seller_name?: string;
  amount?: number;
  gig_title?: string;
}

const AdminDisputes = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Dispute | null>(null);

  const fetchDisputes = async () => {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const enriched = await Promise.all(
      (data || []).map(async (d) => {
        const [buyerRes, orderRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', d.buyer_id).maybeSingle(),
          supabase.from('orders').select('amount, freelancer_id, gig_id').eq('id', d.order_id).maybeSingle(),
        ]);
        let sellerName = 'Unknown';
        if (d.freelancer_id) {
          const { data: f } = await supabase.from('freelancers').select('user_id').eq('id', d.freelancer_id).maybeSingle();
          if (f?.user_id) {
            const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', f.user_id).maybeSingle();
            sellerName = sp?.full_name || 'Unknown';
          }
        }
        let gigTitle = '';
        if (orderRes.data?.gig_id) {
          const { data: g } = await supabase.from('gigs').select('title').eq('id', orderRes.data.gig_id).maybeSingle();
          gigTitle = g?.title || '';
        }
        return {
          ...d,
          buyer_name: buyerRes.data?.full_name || 'Unknown',
          seller_name: sellerName,
          amount: orderRes.data?.amount || 0,
          gig_title: gigTitle,
        };
      })
    );

    setDisputes(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchDisputes(); }, []);

  const resolveDispute = async (dispute: Dispute, resolution: 'refunded' | 'released') => {
    const { error } = await supabase.from('disputes').update({
      status: 'resolved',
      resolution,
      resolved_by: user?.id,
      resolved_at: new Date().toISOString(),
    }).eq('id', dispute.id);

    if (error) { toast.error('Failed to resolve dispute'); return; }

    if (resolution === 'refunded') {
      await supabase.from('orders').update({ status: 'cancelled', payment_status: 'refunded' }).eq('id', dispute.order_id);
      toast.success('Dispute resolved — Buyer refunded');
    } else {
      await supabase.from('orders').update({ status: 'completed', payment_status: 'released' }).eq('id', dispute.order_id);
      const { data: f } = await supabase.from('freelancers').select('user_id, completed_orders, total_earnings, ranking_score').eq('id', dispute.freelancer_id).maybeSingle();
      if (f?.user_id) {
        const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', f.user_id).maybeSingle();
        if (wallet) {
          await supabase.from('wallets').update({ balance: Number(wallet.balance || 0) + Number(dispute.amount || 0) }).eq('id', wallet.id);
        }
        await supabase.from('freelancers').update({
          completed_orders: (f.completed_orders || 0) + 1,
          total_earnings: Number(f.total_earnings || 0) + Number(dispute.amount || 0),
          ranking_score: Number(f.ranking_score || 0) + 10,
        }).eq('id', dispute.freelancer_id);
      }
      toast.success('Dispute resolved — Funds released to seller');
    }

    setSelected(null);
    fetchDisputes();
  };

  const openCount = disputes.filter(d => d.status === 'open').length;
  const reviewCount = disputes.filter(d => d.status === 'under_review').length;
  const resolvedCount = disputes.filter(d => d.status === 'resolved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open Disputes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Scale className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reviewCount}</p>
              <p className="text-xs text-muted-foreground">Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">All Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Gig</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-sm text-foreground truncate max-w-[150px]">{d.gig_title || '-'}</TableCell>
                  <TableCell className="text-sm text-foreground">{d.buyer_name}</TableCell>
                  <TableCell className="text-sm text-foreground">{d.seller_name}</TableCell>
                  <TableCell className="font-bold text-foreground">${Number(d.amount || 0).toFixed(2)}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm font-medium text-foreground truncate">{d.reason}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.status === 'open' ? 'destructive' : d.status === 'under_review' ? 'outline' : 'default'}>
                      {d.status}
                    </Badge>
                    {d.resolution && <Badge variant="secondary" className="ml-1 text-xs">{d.resolution}</Badge>}
                  </TableCell>
                  <TableCell>
                    {d.status !== 'resolved' ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelected(d)}>
                        ⚖️ Review
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Closed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {disputes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No disputes found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dispute Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Dispute Resolution
            </DialogTitle>
            <DialogDescription>Review the dispute and make a final decision</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Buyer</p>
                  <p className="font-medium text-foreground">{selected.buyer_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seller</p>
                  <p className="font-medium text-foreground">{selected.seller_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-bold text-foreground text-lg">${Number(selected.amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gig</p>
                  <p className="font-medium text-foreground">{selected.gig_title || '-'}</p>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-muted-foreground text-xs mb-1">Reason</p>
                <p className="text-foreground font-medium">{selected.reason}</p>
                {selected.details && (
                  <>
                    <p className="text-muted-foreground text-xs mb-1 mt-3">Details</p>
                    <p className="text-foreground text-sm">{selected.details}</p>
                  </>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground mb-2">Private Mediation Chat — Buyer · Freelancer · Admin</p>
                <DisputeChat disputeId={selected.id} viewerRole="admin" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={() => selected && resolveDispute(selected, 'refunded')} className="gap-1">
              <XCircle className="h-4 w-4" /> Refund Buyer
            </Button>
            <Button onClick={() => selected && resolveDispute(selected, 'released')} className="gap-1">
              <CheckCircle className="h-4 w-4" /> Release to Seller
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDisputes;
