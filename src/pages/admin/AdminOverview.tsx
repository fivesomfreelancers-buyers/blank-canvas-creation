import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Scale, Users } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({ escrowFunds: 0, activeOrders: 0, openDisputes: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, disputesRes, profilesRes] = await Promise.all([
          supabase.from('orders').select('amount, status, payment_status'),
          supabase.from('disputes').select('id, status'),
          supabase.from('profiles').select('id'),
        ]);

        const orders = ordersRes.data || [];
        const escrowFunds = orders
          .filter(o => o.status === 'in_progress' || o.status === 'delivered')
          .reduce((sum, o) => sum + Number(o.amount), 0);
        const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
        const openDisputes = (disputesRes.data || []).filter(d => d.status === 'open' || d.status === 'under_review').length;

        setStats({
          escrowFunds,
          activeOrders,
          openDisputes,
          totalUsers: (profilesRes.data || []).length,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Funds Secured (Escrow)', value: `$${stats.escrowFunds.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-500' },
    { title: 'Active Orders', value: stats.activeOrders, icon: Package, color: 'text-primary' },
    { title: 'Open Disputes', value: stats.openDisputes, icon: Scale, color: 'text-destructive' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-green-500' },
  ];

  if (loading) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
