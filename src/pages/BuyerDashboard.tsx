
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Scale
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import DisputeChat from '@/components/dispute/DisputeChat';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerMessages from './buyer/BuyerMessages';
import BuyerHelp from './buyer/BuyerHelp';
import BuyerSettings from './buyer/BuyerSettings';

const sidebarItems = [
  { title: "Dashboard", icon: Home, key: "dashboard" },
  { title: "My Orders", icon: ShoppingBag, key: "orders" },
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

const BuyerSidebar = ({ activeSection, setActiveSection, profile }: { activeSection: string; setActiveSection: (section: string) => void; profile: ProfileData | null }) => {
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'B';

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Link to="/" className="flex items-center space-x-2 p-2">
              <img 
                src="https://i.postimg.cc/SsmSvr3z/Logo-with-Glowing-Fist-Silhouette-removebg-preview.png" 
                alt="FIVESOM Logo" 
                width="40"
                height="40"
                className="w-[40px] h-[40px] object-contain cursor-pointer"
              />
              <span className="font-bold text-lg">FIVESOM</span>
            </Link>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => setActiveSection(item.key)}
                      className={`flex items-center space-x-2 w-full ${
                        activeSection === item.key ? 'text-primary font-medium' : ''
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.profile_image_url || undefined} />
              <AvatarFallback className="bg-purple-500 text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{profile?.full_name || 'Buyer'}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const BuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({ activeOrders: 0, completedOrders: 0, totalSpent: 0, walletBalance: 0 });
  const [activeDisputes, setActiveDisputes] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('full_name, username, email, profile_image_url, location, bio')
      .eq('id', user.id)
      .maybeSingle();
    if (data) setProfile(data);

    // Update last_seen
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
  };

  const fetchStats = async () => {
    if (!user) return;
    const { count: activeCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', user.id).in('status', ['pending', 'in_progress']);
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

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-white/50">
                  <AvatarImage src={profile?.profile_image_url || undefined} />
                  <AvatarFallback className="bg-card/20 text-white text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold mb-1">Welcome back, {profile?.full_name || 'Buyer'}! 👋</h1>
                  <p className="text-purple-100 text-sm sm:text-base">
                    {profile?.email}{profile?.location ? ` · ${profile.location}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeOrders}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeOrders === 0 ? 'No active orders' : 'Orders in progress'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedOrders}</div>
                  <p className="text-xs text-muted-foreground">{stats.completedOrders === 0 ? 'Start ordering services' : 'Successfully completed'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${Number(stats.walletBalance).toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Wallet balance</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Active Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No active orders yet. Browse services to get started!
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'orders':
        return <BuyerOrders />;
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BuyerSidebar activeSection={activeSection} setActiveSection={setActiveSection} profile={profile} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            {activeSection !== 'dashboard' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveSection('dashboard')}
                className="ml-1"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Button>
            )}
            <div className="ml-auto flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.profile_image_url || undefined} />
                <AvatarFallback className="bg-purple-500 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
              <Badge variant="outline">Buyer</Badge>
            </div>
          </header>
          
          <div className="flex-1 p-4 sm:p-6">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default BuyerDashboard;
