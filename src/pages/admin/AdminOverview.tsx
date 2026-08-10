import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign, Package, Scale, Users, TrendingUp, ShoppingCart, CheckCircle, Clock,
  XCircle, Wallet, Star, MessageSquare, LifeBuoy, Flag, ShieldCheck, BadgeCheck, Crown,
  UserCheck, Briefcase, Radio,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface Stats {
  totalUsers: number; buyers: number; freelancers: number; activeUsers: number; onlineUsers: number;
  totalGigs: number; activeGigs: number;
  totalOrders: number; pendingOrders: number; activeOrders: number; completedOrders: number; cancelledOrders: number;
  totalRevenue: number; monthlyRevenue: number; weeklyRevenue: number; escrowFunds: number;
  pendingFunds: number; fivesomRevenue: number; payableToSellers: number;
  withdrawals: number; pendingWithdrawals: number; pendingWithdrawalAmount: number;
  reviews: number; messages: number; supportTickets: number; reports: number;
  verificationRequests: number; blueTickUsers: number; vipMembers: number;
  openDisputes: number;
}

const EMPTY: Stats = {
  totalUsers: 0, buyers: 0, freelancers: 0, activeUsers: 0, onlineUsers: 0,
  totalGigs: 0, activeGigs: 0,
  totalOrders: 0, pendingOrders: 0, activeOrders: 0, completedOrders: 0, cancelledOrders: 0,
  totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0, escrowFunds: 0,
  pendingFunds: 0, fivesomRevenue: 0, payableToSellers: 0,
  withdrawals: 0, pendingWithdrawals: 0, pendingWithdrawalAmount: 0,
  reviews: 0, messages: 0, supportTickets: 0, reports: 0,
  verificationRequests: 0, blueTickUsers: 0, vipMembers: 0,
  openDisputes: 0,
};

/** Fivesom keeps a flat $1 service fee per paid order plus the withdrawal commission. */
const SERVICE_FEE_PER_ORDER = 1;


const countOf = (res: any) => Number(res?.count || 0);

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const sb: any = supabase;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const head = (table: string, build?: (q: any) => any) => {
      const base = sb.from(table).select('id', { count: 'exact', head: true });
      return build ? build(base) : base;
    };

    const results = await Promise.allSettled([
      // 0 orders rows (needed for money math + charts)
      sb.from('orders').select('amount, status, payment_status, created_at'),
      // 1..3 users
      head('profiles'),
      head('buyers'),
      head('freelancers'),
      head('profiles', (q: any) => q.gte('last_seen', weekAgo)),
      head('profiles', (q: any) => q.gte('last_seen', fiveMinAgo)),
      // 6..7 gigs
      head('gigs'),
      head('gigs', (q: any) => q.eq('status', 'active')),
      // 8..9 withdrawals
      sb.from('withdrawals').select('amount, status, fee_amount'),
      head('withdrawals', (q: any) => q.eq('status', 'pending')),
      // 10..15 misc
      head('gig_reviews'),
      head('messages'),
      head('support_tickets'),
      head('buyer_support_tickets'),
      head('freelancer_support_tickets'),
      head('user_reports'),
      // 16..19
      head('verification_documents', (q: any) => q.eq('status', 'pending')),
      head('freelancers', (q: any) => q.eq('has_blue_tick', true)),
      head('vip_memberships', (q: any) => q.eq('payment_status', 'paid')),
      head('disputes', (q: any) => q.eq('status', 'open')),
      // 20 wallet balances (money still owed to sellers)
      sb.from('wallets').select('balance'),
    ]);

    const at = (i: number) => (results[i].status === 'fulfilled' ? (results[i] as any).value : null);
    const failed = results.filter(r => r.status === 'rejected' || (r as any).value?.error);
    if (failed.length) console.warn('AdminOverview: some stat queries failed', failed);

    const orders = (at(0)?.data || []) as Array<{ amount: number; status: string; payment_status: string | null; created_at: string }>;
    const withdrawalRows = (at(8)?.data || []) as Array<{ amount: number; status: string; fee_amount: number | null }>;
    const walletRows = (at(20)?.data || []) as Array<{ balance: number | null }>;

    const sum = (rows: typeof orders) => rows.reduce((s, o) => s + Number(o.amount || 0), 0);
    const completed = orders.filter(o => o.status === 'completed');

    const PAID = ['paid', 'succeeded', 'held', 'released', 'verified'];
    const isPaid = (o: typeof orders[number]) => PAID.includes(String(o.payment_status || '').toLowerCase());
    const paidOrders = orders.filter(isPaid);

    // Money that has been paid by buyers but not yet released to the seller.
    const inEscrow = paidOrders.filter(o => o.status === 'pending' || o.status === 'in_progress' || o.status === 'delivered');
    // Payments still awaiting manual verification by an admin.
    const awaitingVerification = orders.filter(
      o => !isPaid(o) && o.status !== 'cancelled' && o.status !== 'completed',
    );

    const withdrawalFees = withdrawalRows
      .filter(w => w.status === 'approved' || w.status === 'completed')
      .reduce((s, w) => s + Number(w.fee_amount || 0), 0);
    const serviceFees = paidOrders.length * SERVICE_FEE_PER_ORDER;

    const next: Stats = {
      totalUsers: countOf(at(1)),
      buyers: countOf(at(2)),
      freelancers: countOf(at(3)),
      activeUsers: countOf(at(4)),
      onlineUsers: countOf(at(5)),
      totalGigs: countOf(at(6)),
      activeGigs: countOf(at(7)),
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      activeOrders: orders.filter(o => o.status === 'in_progress' || o.status === 'delivered').length,
      completedOrders: completed.length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: sum(completed),
      monthlyRevenue: sum(completed.filter(o => o.created_at >= monthStart)),
      weeklyRevenue: sum(completed.filter(o => o.created_at >= weekAgo)),
      escrowFunds: sum(inEscrow),
      pendingFunds: sum(awaitingVerification),
      fivesomRevenue: serviceFees + withdrawalFees,
      payableToSellers: walletRows.reduce((s, w) => s + Number(w.balance || 0), 0),
      withdrawals: withdrawalRows.reduce((s, w) => s + Number(w.amount || 0), 0),
      pendingWithdrawals: countOf(at(9)),
      pendingWithdrawalAmount: withdrawalRows
        .filter(w => w.status === 'pending')
        .reduce((s, w) => s + Number(w.amount || 0), 0),
      reviews: countOf(at(10)),
      messages: countOf(at(11)),
      supportTickets: countOf(at(12)) + countOf(at(13)) + countOf(at(14)),
      reports: countOf(at(15)),
      verificationRequests: countOf(at(16)),
      blueTickUsers: countOf(at(17)),
      vipMembers: countOf(at(18)),
      openDisputes: countOf(at(19)),
    };

    setStats(next);

    // Last 6 months revenue / order volume
    const months: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const inRange = orders.filter(o => {
        const t = new Date(o.created_at).getTime();
        return t >= d.getTime() && t < end.getTime();
      });
      months.push({
        name: d.toLocaleDateString('en', { month: 'short' }),
        revenue: sum(inRange.filter(o => o.status === 'completed')),
        orders: inRange.length,
      });
    }
    setMonthlyData(months);

    const statusCounts: Record<string, number> = {};
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    setOrderStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();

    // Realtime: any insert/update on these tables refreshes the numbers.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fetchStats(), 800); // debounce bursts
    };

    const tables = [
      'profiles', 'buyers', 'freelancers', 'gigs', 'orders', 'withdrawals',
      'gig_reviews', 'messages', 'disputes', 'user_reports',
      'support_tickets', 'buyer_support_tickets', 'freelancer_support_tickets',
      'verification_documents', 'vip_memberships',
    ];
    const channel = supabase.channel('admin-overview-stats');
    tables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, schedule);
    });
    channel.subscribe();

    // Safety net for anything realtime does not deliver (e.g. escrow releases).
    const poll = setInterval(() => fetchStats(), 60000);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [fetchStats]);

  const money = (n: number) => `$${n.toFixed(2)}`;

  const groups: { label: string; cards: { title: string; value: string | number; icon: any; desc: string }[] }[] = [
    {
      label: 'Revenue & Funds',
      cards: [
        { title: 'Total Revenue', value: money(stats.totalRevenue), icon: DollarSign, desc: 'Completed orders' },
        { title: 'Monthly Revenue', value: money(stats.monthlyRevenue), icon: TrendingUp, desc: 'This month' },
        { title: 'Weekly Revenue', value: money(stats.weeklyRevenue), icon: TrendingUp, desc: 'Last 7 days' },
        { title: 'Escrow Balance', value: money(stats.escrowFunds), icon: DollarSign, desc: 'Held in escrow' },
        { title: 'Withdrawals', value: money(stats.withdrawals), icon: Wallet, desc: 'All requests' },
        { title: 'Pending Withdrawals', value: stats.pendingWithdrawals, icon: Clock, desc: 'Awaiting review' },
      ],
    },
    {
      label: 'Users',
      cards: [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, desc: 'Registered' },
        { title: 'Buyers', value: stats.buyers, icon: ShoppingCart, desc: 'Buyer accounts' },
        { title: 'Freelancers', value: stats.freelancers, icon: Briefcase, desc: 'Seller accounts' },
        { title: 'Active Users', value: stats.activeUsers, icon: UserCheck, desc: 'Last 7 days' },
        { title: 'Online Users', value: stats.onlineUsers, icon: Radio, desc: 'Last 5 minutes' },
        { title: 'VIP Members', value: stats.vipMembers, icon: Crown, desc: 'Active VIP' },
      ],
    },
    {
      label: 'Marketplace',
      cards: [
        { title: 'Total Gigs', value: stats.totalGigs, icon: Package, desc: 'All gigs' },
        { title: 'Active Gigs', value: stats.activeGigs, icon: CheckCircle, desc: 'Published' },
        { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, desc: 'All time' },
        { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, desc: 'Awaiting start' },
        { title: 'Active Orders', value: stats.activeOrders, icon: Package, desc: 'In progress / delivered' },
        { title: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, desc: 'Successfully done' },
        { title: 'Cancelled Orders', value: stats.cancelledOrders, icon: XCircle, desc: 'Cancelled' },
        { title: 'Reviews', value: stats.reviews, icon: Star, desc: 'Buyer reviews' },
      ],
    },
    {
      label: 'Operations & Safety',
      cards: [
        { title: 'Messages', value: stats.messages, icon: MessageSquare, desc: 'Chat messages' },
        { title: 'Support Tickets', value: stats.supportTickets, icon: LifeBuoy, desc: 'All tickets' },
        { title: 'Reports', value: stats.reports, icon: Flag, desc: 'User reports' },
        { title: 'Open Disputes', value: stats.openDisputes, icon: Scale, desc: 'Needs attention' },
        { title: 'Verification Requests', value: stats.verificationRequests, icon: ShieldCheck, desc: 'Pending review' },
        { title: 'Blue Tick Users', value: stats.blueTickUsers, icon: BadgeCheck, desc: 'Verified badge' },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const glassCard = "border-0 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5";
  const glassStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(20,28,42,0.72), rgba(13,17,26,0.72))',
    boxShadow: 'inset 0 0 0 1px rgba(0,163,255,0.18), 0 10px 30px -12px rgba(0,0,0,0.6)',
  };

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label} className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7aa7c4]">{group.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {group.cards.map((card) => (
              <Card key={card.title} className={glassCard + " group hover:shadow-[0_0_30px_-5px_rgba(0,163,255,0.45)]"} style={glassStyle}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-semibold text-[#7aa7c4] uppercase tracking-[0.12em]">{card.title}</CardTitle>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background: 'linear-gradient(135deg, rgba(0,123,255,0.25), rgba(0,204,255,0.15))', boxShadow: 'inset 0 0 0 1px rgba(0,163,255,0.4)' }}>
                    <card.icon className="h-4 w-4 text-[#00CCFF]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white tracking-tight break-words">{card.value}</div>
                  <p className="text-[11px] text-[#7aa7c4] mt-1">{card.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={glassCard + " lg:col-span-2"} style={glassStyle}>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00CCFF]" style={{ boxShadow: '0 0 10px #00CCFF' }} />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00CCFF" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#00A3FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#7aa7c4" fontSize={12} />
                <YAxis stroke="#7aa7c4" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(11,14,20,0.95)',
                    border: '1px solid rgba(0,163,255,0.4)',
                    borderRadius: '10px',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(0,163,255,0.25)',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00CCFF" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className={glassCard} style={glassStyle}>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#00A3FF]" style={{ boxShadow: '0 0 10px #00A3FF' }} />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatusData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-[#7aa7c4]">No orders yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} stroke="rgba(11,14,20,0.6)">
                    {orderStatusData.map((_, i) => (
                      <Cell key={i} fill={['#00CCFF', '#ef4444', '#10b981', '#f59e0b', '#7aa7c4'][i % 5]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(11,14,20,0.95)',
                      border: '1px solid rgba(0,163,255,0.4)',
                      borderRadius: '10px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={glassCard} style={glassStyle}>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00CCFF]" style={{ boxShadow: '0 0 10px #00CCFF' }} />
            Monthly Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00CCFF" />
                  <stop offset="100%" stopColor="#007BFF" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" stroke="#7aa7c4" fontSize={12} />
              <YAxis stroke="#7aa7c4" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(11,14,20,0.95)',
                  border: '1px solid rgba(0,163,255,0.4)',
                  borderRadius: '10px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
