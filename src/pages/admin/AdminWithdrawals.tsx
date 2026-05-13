import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';

const AdminWithdrawals = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase.from('withdrawals').select('*').order('requested_at', { ascending: false });
    const enriched = await Promise.all((data || []).map(async (w: any) => {
      const { data: f } = await supabase.from('freelancers').select('user_id').eq('id', w.freelancer_id).maybeSingle();
      let name = 'Unknown';
      if (f?.user_id) {
        const { data: p } = await supabase.from('profiles').select('full_name, email').eq('id', f.user_id).maybeSingle();
        name = p?.full_name || p?.email || 'Unknown';
      }
      return { ...w, user_name: name };
    }));
    setItems(enriched);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const update = async (id: string, status: 'paid' | 'rejected' | 'pending') => {
    const payload: any = { status, processed_at: status === 'pending' ? null : new Date().toISOString() };
    const { error } = await supabase.from('withdrawals').update(payload).eq('id', id);
    if (error) return toast.error('Failed');
    toast.success(`Withdrawal ${status}`);
    fetch();
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  const pending = items.filter(i => i.status === 'pending');
  const totalPending = pending.reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = items.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-500">{pending.length}</p><p className="text-xs text-muted-foreground">Pending Requests</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-foreground">${totalPending.toFixed(2)}</p><p className="text-xs text-muted-foreground">Pending Amount</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-green-500">${totalPaid.toFixed(2)}</p><p className="text-xs text-muted-foreground">Total Paid Out</p></CardContent></Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" /> Withdrawal Requests</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Details</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="text-sm">{w.user_name}</TableCell>
                  <TableCell className="font-bold">${Number(w.amount).toFixed(2)}</TableCell>
                  <TableCell className="text-sm">{w.bank_name ? 'Bank' : w.mobile_provider || 'Mobile'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{w.account_number || w.mobile_number || '—'}</TableCell>
                  <TableCell><Badge variant="outline">{w.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(w.requested_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {w.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" className="h-7 text-xs" onClick={() => update(w.id, 'paid')}>Approve</Button>
                        <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => update(w.id, 'rejected')}>Reject</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No requests</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWithdrawals;
