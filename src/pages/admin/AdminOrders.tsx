import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package } from 'lucide-react';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const enriched = await Promise.all((data || []).map(async (o: any) => {
      const [b, f, g] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', o.buyer_id).maybeSingle(),
        supabase.from('freelancers').select('user_id').eq('id', o.freelancer_id).maybeSingle(),
        o.gig_id ? supabase.from('gigs').select('title').eq('id', o.gig_id).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      let sn = 'Unknown';
      if (f.data?.user_id) {
        const { data: sp } = await supabase.from('profiles').select('full_name').eq('id', f.data.user_id).maybeSingle();
        sn = sp?.full_name || 'Unknown';
      }
      return { ...o, buyer_name: b.data?.full_name, seller_name: sn, gig_title: g.data?.title };
    }));
    setOrders(enriched);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const update = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) return toast.error('Failed');
    toast.success(`Order ${status}`);
    fetch();
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const matchS = !s || (o.buyer_name || '').toLowerCase().includes(s) || (o.seller_name || '').toLowerCase().includes(s) || (o.gig_title || '').toLowerCase().includes(s);
    const matchF = filter === 'all' || o.status === filter;
    return matchS && matchF;
  });

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: orders.length },
          { label: 'Active', value: orders.filter(o => o.status === 'in_progress' || o.status === 'pending').length },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
        ].map(s => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="pt-6"><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> All Orders</CardTitle>
          <div className="flex gap-2">
            <div className="relative w-56"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-9 h-9" /></div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="in_progress">Active</SelectItem><SelectItem value="delivered">Delivered</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Gig</TableHead><TableHead>Buyer</TableHead><TableHead>Seller</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(o => (
                <TableRow key={o.id}>
                  <TableCell className="text-sm font-medium truncate max-w-[200px]">{o.gig_title || o.id.slice(0, 8)}</TableCell>
                  <TableCell className="text-sm">{o.buyer_name}</TableCell>
                  <TableCell className="text-sm">{o.seller_name}</TableCell>
                  <TableCell className="font-bold">${Number(o.amount).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="outline">{o.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {o.status !== 'completed' && <Button size="sm" className="h-7 text-xs" onClick={() => update(o.id, 'completed')}>Force Complete</Button>}
                      {o.status !== 'cancelled' && <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => update(o.id, 'cancelled')}>Cancel</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No orders</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
