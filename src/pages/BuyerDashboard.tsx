
import React, { useState, useEffect } from 'react';
import SomAdSlot from '@/components/ads/SomAdSlot';
import { Link, useNavigate } from 'react-router-dom';
import fivesomLogo from '@/assets/fivesom-logo.png';
import { 
  Home, 
  ShoppingBag, 
  MessageSquare, 
  HelpCircle, 
  Settings, 
  User,
  Clock,
  CheckCircle,
  DollarSign,
  Wallet,
  ArrowLeft,
  Scale,
  Search,
  Briefcase,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMyPhoto } from '@/hooks/useMyPhoto';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DisputeChat from '@/components/dispute/DisputeChat';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerMessages from './buyer/BuyerMessages';
import BuyerHelp from './buyer/BuyerHelp';
import BuyerSettings from './buyer/BuyerSettings';
import { useNewDeliveries } from '@/hooks/useNewDeliveries';
import MyJobs from './jobs/MyJobs';
import DashboardShell, { StatTile } from '@/components/dashboard/DashboardShell';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const sidebarItems = [
  { title: "Dashboard", icon: Home, key: "dashboard" },
  { title: "My Orders", icon: ShoppingBag, key: "orders" },
  { title: "My Jobs", icon: ShoppingBag, key: "jobs" },
  { title: "Messages", icon: MessageSquare, key: "messages" },
  { title: "Help Center", icon: HelpCircle, key: "help" },
  { title: "Settings", icon: Settings, key: "settings" },
];

interface ProfileData {
  full_name: string | null;
  username: string | null;
  email: string | null;
  profile_image_url: string | null;
  location: string | null;
  bio: string | null;
}

const BuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({ activeOrders: 0, completedOrders: 0, totalSpent: 0, walletBalance: 0 });
  const [activeDisputes, setActiveDisputes] = useState<any[]>([]);
  const { user } = useAuth();
  const myIdentity = useMyPhoto();
  const navigate = useNavigate();
  const { newDeliveryCount, markSeen } = useNewDeliveries();
  const { unreadCount } = useUnreadMessages();

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, profile_image_url, location, bio')
      .eq('id', user.id)
      .maybeSingle();

    const meta: any = user.user_metadata || {};
    const metaAvatar = meta.avatar_url || meta.picture || null;
    const metaName = meta.full_name || meta.name || null;
    setProfile({
      ...(data as any),
      full_name: (data as any)?.full_name?.trim() || metaName || null,
      email: user.email || null,
      profile_image_url: (data as any)?.profile_image_url || metaAvatar,
    } as any);

    // Update last_seen
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
  };

  const fetchStats = async () => {
    if (!user) return;
    const { count: activeCount } = await (supabase as any).from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).in('status', ['pending', 'in_progress', 'disputed']);
    const { count: completedCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).eq('status', 'completed');
    const { data: completedOrders } = await supabase.from('orders').select('amount').eq('buyer_id', user.id).eq('status', 'completed');
    const totalSpent = completedOrders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
    setStats({
      activeOrders: activeCount || 0,
      completedOrders: completedCount || 0,
      totalSpent,
      walletBalance: wallet?.balance || 0,
    });

    const { data: disputes } = await (supabase as any)
      .from('disputes')
      .select('*')
      .eq('buyer_id', user.id)
      .neq('status', 'resolved')
      .order('created_at', { ascending: false });

    const orderIds = [...new Set<string>((disputes || []).map((d: any) => d.order_id).filter(Boolean))];
    if (orderIds.length === 0) {
      setActiveDisputes([]);
      return;
    }

    const { data: disputeOrders } = await supabase
      .from('orders')
      .select('id, amount, gigs(title)')
      .in('id', orderIds);
    const orderMap = new Map((disputeOrders || []).map((o: any) => [o.id, o]));
    setActiveDisputes((disputes || []).map((d: any) => ({
      ...d,
      amount: orderMap.get(d.order_id)?.amount || 0,
      gig_title: orderMap.get(d.order_id)?.gigs?.title || 'Order',
    })));
  };

  useEffect(() => {
    fetchProfile();
    fetchStats();
    if (!user) return;
    const channel = supabase
      .channel(`buyer-dashboard:${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `buyer_id=eq.${user.id}` }, () => fetchStats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'B';
  // Same shared photo as the website header.
  const myPhoto = myIdentity.photoUrl || profile?.profile_image_url || undefined;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <SomAdSlot placement="dashboard_banner" viewerRole="buyer" className="rounded-lg overflow-hidden" >
              <div className="p-1">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={myPhoto} className="object-cover" />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Welcome back, {profile?.full_name || 'Buyer'}! 👋</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {profile?.email}{profile?.location ? ` · ${profile.location}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </SomAdSlot>

            {activeDisputes.length > 0 && (
              <section className="space-y-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
                <div className="flex items-center gap-2 text-base font-semibold text-destructive">
                  <Scale className="h-5 w-5" />
                  Active Dispute Chat
                </div>
                  {activeDisputes.map((dispute) => (
                    <div key={dispute.id} className="space-y-3 rounded-lg border border-border bg-background p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{dispute.gig_title}</p>
                          <p className="text-xs text-muted-foreground">{dispute.reason}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/buyer/orders/${dispute.order_id}`)}>
                          Open Order
                        </Button>
                      </div>
                      <DisputeChat disputeId={dispute.id} viewerRole="buyer" />
                    </div>
                  ))}
              </section>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile featured label="Active Orders" value={stats.activeOrders} hint={stats.activeOrders ? 'In progress now' : 'No active orders'} icon={ShoppingBag} />
              <StatTile label="Completed Projects" value={stats.completedOrders} hint="Successfully completed" icon={CheckCircle} />
              <StatTile label="Total Spent" value={`$${stats.totalSpent.toFixed(2)}`} hint="All time" icon={DollarSign} />
              <StatTile label="Available Balance" value={`$${Number(stats.walletBalance).toFixed(2)}`} hint="Wallet balance" icon={Wallet} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { t: 'Find talent', d: 'Browse professional services', icon: Search, go: () => navigate('/explore') },
                { t: 'Post a job', d: 'Get proposals from freelancers', icon: Briefcase, go: () => setActiveSection('jobs') },
                { t: 'My orders', d: newDeliveryCount ? `${newDeliveryCount} new deliveries` : 'Track your work', icon: Clock, go: () => setActiveSection('orders') },
              ].map(c => (
                <button key={c.t} type="button" onClick={c.go} className="group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></span>
                  <span><span className="block font-semibold">{c.t}</span><span className="text-sm text-muted-foreground">{c.d}</span></span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return <BuyerOrders />;
      case 'jobs':
        return <MyJobs />;
      case 'messages':
        return <BuyerMessages />;
      case 'help':
        return <BuyerHelp />;
      case 'settings':
        return <BuyerSettings onProfileUpdated={fetchProfile} />;
      default:
        return null;
    }
  };

  const navItems = [
    { title: 'Dashboard', icon: Home, key: 'dashboard' },
    { title: 'My Orders', icon: ShoppingBag, key: 'orders', count: newDeliveryCount },
    { title: 'My Jobs', icon: Briefcase, key: 'jobs' },
    { title: 'Messages', icon: MessageSquare, key: 'messages', count: unreadCount },
    { title: 'Help Center', icon: HelpCircle, key: 'help', group: 'secondary' as const },
    { title: 'Settings', icon: Settings, key: 'settings', group: 'secondary' as const },
  ];

  return (
    <DashboardShell
      items={navItems}
      active={activeSection}
      onSelect={(k) => { if (k === 'orders') markSeen(); setActiveSection(k); }}
      roleLabel="Buyer"
      name={profile?.full_name || 'Buyer'}
      email={profile?.email}
      photo={myPhoto}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default BuyerDashboard;
