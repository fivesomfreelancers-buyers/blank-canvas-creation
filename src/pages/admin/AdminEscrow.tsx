import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DollarSign, ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchTotalEarnings } from '@/lib/freelancerEarnings';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        let sellerName = 'Fivesom User';
        if (freelancerRes.data?.user_id) {
          const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', freelancerRes.data.user_id).maybeSingle();
          sellerName = sp?.full_name || 'Fivesom User';
        }
        let gigTitle = '';
        if (o.gig_id) {
          const { data: g } = await supabase.from('gigs').select('title').eq('id', o.gig_id).maybeSingle();
          gigTitle = g?.title || '';
        }
        return { ...o, buyer_name: buyerRes.data?.full_name || 'Fivesom User', seller_name: sellerName, gig_title: gigTitle };
      })
    );

    setOrders(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const getEscrowBadge = (status: string) => {
    if (status === 'in_progress' || status === 'delivered') return { label: '🟡 Secured', cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' };
    if (status === 'completed') return { label: '🟢 Released', cls: 'bg-green-500/10 text-green-600 border-green-200' };
    if (status === 'cancelled') return { label: '🔴 Refunded', cls: 'bg-destructive/10 text-destructive border-destructive/20' };
    return { label: status, cls: '' };
  };

  const handleRelease = async (order: EscrowOrder) => {
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ status: 'completed', payment_status: 'released' })
      .eq('id', order.id);
    if (orderErr) { toast.error('Failed to release'); return; }

    const { data: freelancer } = await supabase.from('freelancers').select('user_id, completed_orders, ranking_score').eq('id', order.freelancer_id).maybeSingle();
    const priorEarnings = await fetchTotalEarnings(order.freelancer_id);
    if (freelancer?.user_id) {
      const { data: wallet } = await supabase.from('wallets').select('id, balance').eq('user_id', freelancer.user_id).maybeSingle();
      if (wallet) {
        await supabase.from('wallets').update({ balance: Number(wallet.balance || 0) + Number(order.amount) }).eq('id', wallet.id);
      }
      await supabase.from('freelancers').update({
        completed_orders: (freelancer.completed_orders || 0) + 1,
        total_earnings: priorEarnings + Number(order.amount),
        ranking_score: Number(freelancer.ranking_score || 0) + 10,
      }).eq('id', order.freelancer_id);
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

  const secured = orders.filter(o => o.status === 'in_progress' || o.status === 'delivered');
  const totalSecured = secured.reduce((s, o) => s + Number(o.amount), 0);
  const totalReleased = orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.amount), 0);
  const totalRefunded = orders.filter(o => o.status === 'cancelled').reduce((s, o) => s + Number(o.amount), 0);

  const filtered = orders.filter(o => {
    const matchSearch = (o.buyer_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.seller_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.gig_title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || (statusFilter === 'secured' && (o.status === 'in_progress' || o.status === 'delivered')) ||
      (statusFilter === 'released' && o.status === 'completed') ||
      (statusFilter === 'refunded' && o.status === 'cancelled');
    return matchSearch && matchStatus;
  });

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
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalSecured.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Secured in Escrow</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalReleased.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Released</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">${totalRefunded.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Refunded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-base font-semibold">All Transactions</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="secured">Secured</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const badge = getEscrowBadge(o.status);
                const canAct = o.status === 'in_progress' || o.status === 'delivered';
                return (
                  <TableRow key={o.id} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="font-medium text-foreground text-sm truncate max-w-[200px]">{o.gig_title || o.id.slice(0, 8)}</p>
                    </TableCell>
                    <TableCell className="text-foreground text-sm">{o.buyer_name}</TableCell>
                    <TableCell className="text-foreground text-sm">{o.seller_name}</TableCell>
                    <TableCell className="font-bold text-foreground">${Number(o.amount).toFixed(2)}</TableCell>
                    <TableCell><Badge variant="outline" className={badge.cls}>{badge.label}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {canAct && (
                        <div className="flex gap-1">
                          <Button size="sm" className="h-7 text-xs" onClick={() => handleRelease(o)}>✔️ Release</Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleRefund(o)}>🔄 Refund</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No transactions found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEscrow;
