import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface EscrowOrder {
  id: string;
  amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  buyer_id: string;
  freelancer_id: string;
  buyer_name?: string;
  seller_name?: string;
  gig_title?: string;
}

const AdminEscrow = () => {
  const [orders, setOrders] = useState<EscrowOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('id, amount, status, payment_status, created_at, buyer_id, freelancer_id, gig_id')
      .order('created_at', { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const enriched = await Promise.all(
      (data || []).map(async (o) => {
        const [buyerRes, freelancerRes] = await Promise.all([
          supabase.from('profiles').select('full_name').eq('id', o.buyer_id).maybeSingle(),
          supabase.from('freelancers').select('user_id').eq('id', o.freelancer_id).maybeSingle(),
        ]);
        let sellerName = 'Unknown';
        if (freelancerRes.data?.user_id) {
          const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', freelancerRes.data.user_id).maybeSingle();
          sellerName = sp?.full_name || 'Unknown';
        }
        let gigTitle = '';
        if (o.gig_id) {
          const { data: g } = await supabase.from('gigs').select('title').eq('id', o.gig_id).maybeSingle();
          gigTitle = g?.title || '';
        }
        return {
          ...o,
          buyer_name: buyerRes.data?.full_name || 'Unknown',
          seller_name: sellerName,
          gig_title: gigTitle,
        };
      })
    );

    setOrders(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const getEscrowStatus = (status: string) => {
    if (status === 'in_progress' || status === 'delivered') return { label: 'Secured 🟡', variant: 'outline' as const };
    if (status === 'completed') return { label: 'Released 🟢', variant: 'default' as const };
    if (status === 'cancelled') return { label: 'Refunded 🔴', variant: 'destructive' as const };
    return { label: status, variant: 'secondary' as const };
  };

  const handleRelease = async (order: EscrowOrder) => {
    // Update order to completed
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ status: 'completed', payment_status: 'released' })
      .eq('id', order.id);
    if (orderErr) { toast.error('Failed to release'); return; }

    // Credit freelancer wallet
    const { data: freelancer } = await supabase.from('freelancers').select('user_id').eq('id', order.freelancer_id).maybeSingle();
    if (freelancer?.user_id) {
      const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', freelancer.user_id).maybeSingle();
      if (wallet) {
        await supabase.from('wallets').update({ balance: Number(wallet.balance || 0) + Number(order.amount) }).eq('id', wallet.id);
      }
      // Update freelancer stats
      const { data: fData } = await supabase.from('freelancers').select('completed_orders, total_earnings, ranking_score').eq('id', order.freelancer_id).maybeSingle();
      if (fData) {
        await supabase.from('freelancers').update({
          completed_orders: (fData.completed_orders || 0) + 1,
          total_earnings: Number(fData.total_earnings || 0) + Number(order.amount),
          ranking_score: Number(fData.ranking_score || 0) + 10,
        }).eq('id', order.freelancer_id);
      }
    }

    toast.success('Funds released to seller!');
    fetchOrders();
  };

  const handleRefund = async (order: EscrowOrder) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'refunded' })
      .eq('id', order.id);
    if (error) { toast.error('Failed to refund'); return; }
    toast.success('Funds refunded to buyer!');
    fetchOrders();
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escrow Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Escrow Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const es = getEscrowStatus(o.status);
              const canAct = o.status === 'in_progress' || o.status === 'delivered';
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-medium text-foreground text-sm">{o.gig_title || o.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell className="text-foreground">{o.buyer_name}</TableCell>
                  <TableCell className="text-foreground">{o.seller_name}</TableCell>
                  <TableCell className="font-semibold text-foreground">${Number(o.amount).toFixed(2)}</TableCell>
                  <TableCell><Badge variant={es.variant}>{es.label}</Badge></TableCell>
                  <TableCell className="space-x-2">
                    {canAct && (
                      <>
                        <Button size="sm" onClick={() => handleRelease(o)}>
                          ✔️ Release
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRefund(o)}>
                          🔄 Refund
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminEscrow;
