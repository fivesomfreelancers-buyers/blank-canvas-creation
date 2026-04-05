import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

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
  buyer_name?: string;
  seller_name?: string;
  amount?: number;
}

const AdminDisputes = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

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
          supabase.from('orders').select('amount, freelancer_id').eq('id', d.order_id).maybeSingle(),
        ]);
        let sellerName = 'Unknown';
        if (d.freelancer_id) {
          const { data: f } = await supabase.from('freelancers').select('user_id').eq('id', d.freelancer_id).maybeSingle();
          if (f?.user_id) {
            const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', f.user_id).maybeSingle();
            sellerName = sp?.full_name || 'Unknown';
          }
        }
        return {
          ...d,
          buyer_name: buyerRes.data?.full_name || 'Unknown',
          seller_name: sellerName,
          amount: orderRes.data?.amount || 0,
        };
      })
    );

    setDisputes(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchDisputes(); }, []);

  const resolveDispute = async (dispute: Dispute, resolution: 'refunded' | 'released') => {
    // Update dispute
    const { error } = await supabase.from('disputes').update({
      status: 'resolved',
      resolution,
      resolved_by: user?.id,
      resolved_at: new Date().toISOString(),
    }).eq('id', dispute.id);

    if (error) { toast.error('Failed to resolve dispute'); return; }

    // Handle the order
    if (resolution === 'refunded') {
      await supabase.from('orders').update({ status: 'cancelled', payment_status: 'refunded' }).eq('id', dispute.order_id);
      toast.success('Dispute resolved — Buyer refunded');
    } else {
      await supabase.from('orders').update({ status: 'completed', payment_status: 'released' }).eq('id', dispute.order_id);
      // Credit wallet
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

    fetchDisputes();
  };

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Disputes Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-sm text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-foreground">{d.buyer_name}</TableCell>
                <TableCell className="text-foreground">{d.seller_name}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">{d.reason}</p>
                  {d.details && <p className="text-xs text-muted-foreground mt-1">{d.details}</p>}
                </TableCell>
                <TableCell className="font-semibold text-foreground">${Number(d.amount || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={d.status === 'open' ? 'destructive' : d.status === 'under_review' ? 'outline' : 'default'}>
                    {d.status}
                  </Badge>
                  {d.resolution && (
                    <Badge variant="secondary" className="ml-1 text-xs">{d.resolution}</Badge>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  {d.status !== 'resolved' && (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => resolveDispute(d, 'refunded')}>
                        🔄 Refund Buyer
                      </Button>
                      <Button size="sm" onClick={() => resolveDispute(d, 'released')}>
                        ✔️ Release to Seller
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {disputes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No disputes</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminDisputes;
