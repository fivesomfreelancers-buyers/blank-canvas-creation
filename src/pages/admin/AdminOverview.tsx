import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Scale, Users, TrendingUp, ShoppingCart, CheckCircle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0,
    escrowFunds: 0, totalUsers: 0, activeUsers: 0,
    totalOrders: 0, monthOrders: 0, completedOrders: 0, pendingOrders: 0,
    openDisputes: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, disputesRes, profilesRes] = await Promise.all([
          supabase.from('orders').select('amount, status, payment_status, created_at'),
          supabase.from('disputes').select('id, status'),
          supabase.from('profiles').select('id, last_seen'),
        ]);

        const orders = ordersRes.data || [];
        const profiles = profilesRes.data || [];
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalRevenue = orders
          .filter(o => o.status === 'completed')
          .reduce((s, o) => s + Number(o.amount), 0);
        const monthlyRevenue = orders
          .filter(o => o.status === 'completed' && new Date(o.created_at) >= monthAgo)
          .reduce((s, o) => s + Number(o.amount), 0);
        const weeklyRevenue = orders
          .filter(o => o.status === 'completed' && new Date(o.created_at) >= weekAgo)
          .reduce((s, o) => s + Number(o.amount), 0);
        const escrowFunds = orders
          .filter(o => o.status === 'in_progress' || o.status === 'delivered')
          .reduce((s, o) => s + Number(o.amount), 0);
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress').length;
        const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo).length;
        const activeUsers = profiles.filter(p => p.last_seen && new Date(p.last_seen) >= weekAgo).length;
        const openDisputes = (disputesRes.data || []).filter(d => d.status === 'open' || d.status === 'under_review').length;

        setStats({
          totalRevenue, monthlyRevenue, weeklyRevenue, escrowFunds,
          totalUsers: profiles.length, activeUsers,
          totalOrders: orders.length, monthOrders, completedOrders, pendingOrders,
          openDisputes,
        });

        // Monthly chart data (last 6 months)
        const months: any[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
          const label = d.toLocaleDateString('en', { month: 'short' });
          const rev = orders
            .filter(o => o.status === 'completed' && new Date(o.created_at) >= d && new Date(o.created_at) <= end)
            .reduce((s, o) => s + Number(o.amount), 0);
          const cnt = orders.filter(o => new Date(o.created_at) >= d && new Date(o.created_at) <= end).length;
          months.push({ name: label, revenue: rev, orders: cnt });
        }
        setMonthlyData(months);

        // Order status pie
        const statusCounts: Record<string, number> = {};
        orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
        setOrderStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)', 'hsl(var(--muted-foreground))'];

  const statCards = [
    { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, trend: '+12%', up: true, desc: 'All time' },
    { title: 'Monthly Revenue', value: `$${stats.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, trend: '', up: true, desc: 'This month' },
    { title: 'Weekly Revenue', value: `$${stats.weeklyRevenue.toFixed(2)}`, icon: TrendingUp, trend: '', up: true, desc: 'Last 7 days' },
    { title: 'Escrow Funds', value: `$${stats.escrowFunds.toFixed(2)}`, icon: DollarSign, trend: '', up: true, desc: 'Secured' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, trend: '', up: true, desc: 'Registered' },
    { title: 'Active Users', value: stats.activeUsers, icon: Users, trend: '', up: true, desc: 'Last 7 days' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, trend: '', up: true, desc: 'All time' },
    { title: 'Orders This Month', value: stats.monthOrders, icon: Package, trend: '', up: true, desc: 'Current month' },
    { title: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, trend: '', up: true, desc: 'Successfully done' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, trend: '', up: false, desc: 'In progress' },
    { title: 'Open Disputes', value: stats.openDisputes, icon: Scale, trend: '', up: false, desc: 'Needs attention' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <card.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Pie */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {orderStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Orders Bar Chart */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Monthly Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
