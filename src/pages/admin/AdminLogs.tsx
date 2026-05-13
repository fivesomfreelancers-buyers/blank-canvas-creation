import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Package, DollarSign, ShieldCheck, Scale, Wallet } from 'lucide-react';

type Entry = { time: string; type: string; icon: any; label: string; meta?: string };

const AdminLogs = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [orders, withdrawals, verifs, disputes, accepted, logs] = await Promise.all([
        supabase.from('orders').select('id, status, amount, created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('withdrawals').select('id, status, amount, requested_at').order('requested_at', { ascending: false }).limit(20),
        supabase.from('verification_documents').select('id, status, submitted_at').order('submitted_at', { ascending: false }).limit(20),
        supabase.from('disputes').select('id, status, created_at').order('created_at', { ascending: false }).limit(20),
        supabase.from('accepted_deliveries').select('id, amount, accepted_at').order('accepted_at', { ascending: false }).limit(20),
        supabase.from('admin_action_logs' as any).select('*').order('created_at', { ascending: false }).limit(20),
      ]);
      const all: Entry[] = [];
      (orders.data || []).forEach(o => all.push({ time: o.created_at, type: 'order', icon: Package, label: `Order ${o.status}`, meta: `$${o.amount}` }));
      (withdrawals.data || []).forEach(w => all.push({ time: w.requested_at!, type: 'withdraw', icon: Wallet, label: `Withdrawal ${w.status}`, meta: `$${w.amount}` }));
      (verifs.data || []).forEach(v => all.push({ time: v.submitted_at!, type: 'verif', icon: ShieldCheck, label: `Verification ${v.status}` }));
      (disputes.data || []).forEach(d => all.push({ time: d.created_at!, type: 'dispute', icon: Scale, label: `Dispute ${d.status}` }));
      (accepted.data || []).forEach(a => all.push({ time: a.accepted_at!, type: 'accept', icon: DollarSign, label: 'Delivery accepted', meta: `$${a.amount}` }));
      ((logs as any).data || []).forEach((l: any) => all.push({ time: l.created_at, type: 'admin', icon: Activity, label: l.action, meta: `${l.target_table}/${l.target_id}` }));
      all.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setEntries(all.slice(0, 100));
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  return (
    <Card className="border-border bg-card">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" /> Activity Log (last 100)</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-3 p-2 border-b border-border/50 text-sm">
            <e.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground flex-1">{e.label}</span>
            {e.meta && <Badge variant="outline" className="text-xs">{e.meta}</Badge>}
            <span className="text-xs text-muted-foreground">{new Date(e.time).toLocaleString()}</span>
          </div>
        ))}
        {entries.length === 0 && <p className="text-center text-muted-foreground py-8">No activity</p>}
      </CardContent>
    </Card>
  );
};

export default AdminLogs;
