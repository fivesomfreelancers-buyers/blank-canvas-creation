import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, RefreshCcw, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

const AdminPayments = () => {
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0, refunded: 0, fees: 0 });
  const [chart, setChart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase.from('orders').select('amount, status, created_at');
      const o = orders || [];
      const total = o.filter(x => x.status === 'completed').reduce((s, x) => s + Number(x.amount), 0);
      const processing = o.filter(x => x.status === 'in_progress' || x.status === 'delivered').reduce((s, x) => s + Number(x.amount), 0);
      const completed = o.filter(x => x.status === 'completed').length;
      const refunded = o.filter(x => x.status === 'cancelled').reduce((s, x) => s + Number(x.amount), 0);
      const fees = total * 0.1;

      const days: any[] = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        const rev = o.filter(x => x.status === 'completed' && new Date(x.created_at) >= d && new Date(x.created_at) < next).reduce((s, x) => s + Number(x.amount), 0);
        days.push({ date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), revenue: rev });
      }
      setChart(days);
      setStats({ total, processing, completed, refunded, fees });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>;

  const cards = [
    { label: 'Total Revenue', value: `$${stats.total.toFixed(2)}`, icon: DollarSign, c: 'green' },
    { label: 'Processing (Escrow)', value: `$${stats.processing.toFixed(2)}`, icon: TrendingUp, c: 'yellow' },
    { label: 'Platform Fees (10%)', value: `$${stats.fees.toFixed(2)}`, icon: CreditCard, c: 'blue' },
    { label: 'Refunded', value: `$${stats.refunded.toFixed(2)}`, icon: RefreshCcw, c: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Card key={c.label} className="border-border bg-card">
            <CardContent className="pt-6 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${c.c}-500/10`}><c.icon className={`h-5 w-5 text-${c.c}-500`} /></div>
              <div><p className="text-xl font-bold text-foreground">{c.value}</p><p className="text-xs text-muted-foreground">{c.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader><CardTitle className="text-base">Revenue (last 30 days)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
