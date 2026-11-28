
import React, { useState, useEffect } from 'react';
import SomAdSlot from '@/components/ads/SomAdSlot';
import { supabase } from '@/integrations/supabase/client';
import { Link, Navigate } from 'react-router-dom';
import fivesomLogo from '@/assets/fivesom-logo.png';
import { 
  Home, Briefcase, ShoppingBag, MessageSquare, Package, Wallet, Settings, User,
  Plus, Eye, DollarSign, FileText, GraduationCap, Clock, CheckCircle, UserCheck, HelpCircle, ShieldCheck, Loader2, RefreshCw, ArrowLeft, Scale
} from 'lucide-react';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useMyPhoto } from '@/hooks/useMyPhoto';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarInset, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import FreelancerOrders from './freelancer/FreelancerOrders';
import FreelancerMessages from './freelancer/FreelancerMessages';
import FreelancerDeliverWork from './freelancer/FreelancerDeliverWork';
import FreelancerGigs from './freelancer/FreelancerGigs';
import FreelancerWallet from './freelancer/FreelancerWallet';
import FreelancerHelp from './freelancer/FreelancerHelp';
import FreelancerSettings from './freelancer/FreelancerSettings';
import FreelancerProfile from './freelancer/FreelancerProfile';
import FreelancerVerify from './freelancer/FreelancerVerify';
import VerifiedBadge from '@/components/VerifiedBadge';
import DisputeChat from '@/components/dispute/DisputeChat';
import BlueTickCard from '@/components/freelancer/BlueTickCard';
import { useNewOrders } from '@/hooks/useNewOrders';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import MyApplications from './jobs/MyApplications';
import DashboardShell, { StatTile, OrderActivity } from '@/components/dashboard/DashboardShell';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface UserProfile {
  full_name: string;
  email: string;
  profile_image_url: string | null;
}

const FreelancerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected' | 'removed'>('none');
  const [removalInfo, setRemovalInfo] = useState<{ at: string | null; reason: string | null } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  useEffect(() => { if (!userId) return; (supabase as any).rpc('is_approved_instructor', { _uid: userId }).then(({ data }: any) => setIsInstructor(!!data)); }, [userId]);
  const [stats, setStats] = useState({ totalGigs: 0, activeOrders: 0, pendingEarnings: 0, completedOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revisionRequests, setRevisionRequests] = useState<any[]>([]);
  const [activeDisputes, setActiveDisputes] = useState<any[]>([]);
  const navigate = useNavigate();
  const { newOrderCount, markSeen } = useNewOrders();
  const { unreadCount } = useUnreadMessages();
  const myIdentity = useMyPhoto();
  const [weekly, setWeekly] = useState<{ day: string; orders: number }[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, profile_image_url')
        .eq('id', user.id)
        .maybeSingle();
      
      const meta: any = user.user_metadata || {};
      const metaAvatar = meta.avatar_url || meta.picture || null;
      const metaName = meta.full_name || meta.name || null;
      setUserProfile({
        full_name: profileData?.full_name?.trim() || metaName || 'Freelancer',
        email: user.email || '',
        profile_image_url: profileData?.profile_image_url || metaAvatar,
      });

      const { data: freelancer } = await (supabase as any)
        .from('freelancers')
        .select('is_verified, verified_at, completed_orders, id, verification_removed_at, verification_removal_reason')
        .eq('user_id', user.id)
        .single();
      
      if (freelancer) {
        setIsVerified(freelancer.is_verified || false);

        const { data: vDoc } = await supabase
          .from('verification_documents')
          .select('status')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (freelancer.is_verified) {
          setVerificationStatus('approved');
          setRemovalInfo(null);
        } else if (freelancer.verification_removed_at) {
          setVerificationStatus('removed');
          setRemovalInfo({ at: freelancer.verification_removed_at, reason: freelancer.verification_removal_reason });
        } else if (vDoc?.status && vDoc.status !== 'approved') {
          setVerificationStatus(vDoc.status as any);
          setRemovalInfo(null);
        } else {
          setVerificationStatus('none');
          setRemovalInfo(null);
        }

        const { count: gigsCount } = await supabase
          .from('gigs')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', freelancer.id);

        const { count: ordersCount } = await (supabase as any)
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', freelancer.id)
          .in('status', ['pending', 'in_progress', 'disputed']);

        const { data: pendingOrders } = await supabase
          .from('orders')
          .select('amount')
          .eq('freelancer_id', freelancer.id)
          .in('status', ['in_progress', 'delivered']);

        const pendingEarnings = pendingOrders?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

        setStats({
          totalGigs: gigsCount || 0,
          activeOrders: ordersCount || 0,
          pendingEarnings,
          completedOrders: freelancer.completed_orders || 0
        });

        const { data: disputes } = await (supabase as any)
          .from('disputes')
          .select('*')
          .eq('freelancer_id', freelancer.id)
          .neq('status', 'resolved')
          .order('created_at', { ascending: false });

        const disputeOrderIds = [...new Set<string>((disputes || []).map((d: any) => d.order_id).filter(Boolean))];
        if (disputeOrderIds.length > 0) {
          const { data: disputeOrders } = await supabase
            .from('orders')
            .select('id, amount, gigs(title)')
            .in('id', disputeOrderIds);
          const orderMap = new Map((disputeOrders || []).map((o: any) => [o.id, o]));
          setActiveDisputes((disputes || []).map((d: any) => ({
            ...d,
            amount: orderMap.get(d.order_id)?.amount || 0,
            gig_title: orderMap.get(d.order_id)?.gigs?.title || 'Order',
          })));
        } else {
          setActiveDisputes([]);
        }

        const since = new Date(); since.setHours(0,0,0,0); since.setDate(since.getDate() - 6);
        const { data: weekOrders } = await supabase
          .from('orders').select('created_at').eq('freelancer_id', freelancer.id).gte('created_at', since.toISOString());
        const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(since); d.setDate(since.getDate() + i); return d; });
        setWeekly(days.map(d => ({
          day: d.toLocaleDateString([], { weekday: 'short' }),
          orders: (weekOrders || []).filter((o: any) => new Date(o.created_at).toDateString() === d.toDateString()).length,
        })));

        const { data: latestOrders } = await supabase
          .from('orders')
          .select('*, gigs(title)')
          .eq('freelancer_id', freelancer.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (latestOrders && latestOrders.length > 0) {
          const buyerIds = [...new Set(latestOrders.map(o => o.buyer_id))];
          const { data: profiles } = await (supabase as any)
            .from('public_profiles')
            .select('id, full_name')
            .in('id', buyerIds);
          
          const profileMap = new Map((profiles as any[] | null)?.map((p: any) => [p.id, p.full_name]) || []);
          
          const enrichedOrders = latestOrders.map(order => ({
            ...order,
            buyer_name: profileMap.get(order.buyer_id) || 'Buyer'
          }));
          setRecentOrders(enrichedOrders);
        }

        // Fetch revision-requested deliveries for this freelancer's orders
        const { data: freelancerOrders } = await supabase
          .from('orders')
          .select('id, buyer_id, gigs(title)')
          .eq('freelancer_id', freelancer.id);

        const orderIds = (freelancerOrders || []).map((o: any) => o.id);
        if (orderIds.length > 0) {
          const { data: revs } = await (supabase as any)
            .from('order_deliveries')
            .select('id, order_id, revision_feedback, revision_requested_at, status')
            .eq('status', 'revision_requested')
            .in('order_id', orderIds)
            .order('revision_requested_at', { ascending: false });

          if (revs && revs.length > 0) {
            // dedupe to latest per order
            const seen = new Set<string>();
            const latestPerOrder = (revs as any[]).filter((r) => {
              if (seen.has(r.order_id)) return false;
              seen.add(r.order_id);
              return true;
            });

            const orderMap = new Map((freelancerOrders || []).map((o: any) => [o.id, o]));
            const buyerIds = [...new Set(latestPerOrder.map((r: any) => orderMap.get(r.order_id)?.buyer_id).filter(Boolean))];
            const { data: buyerProfiles } = await (supabase as any)
              .from('public_profiles')
              .select('id, full_name, profile_image_url')
              .in('id', buyerIds);
            const bMap = new Map(((buyerProfiles as any[]) || []).map((p: any) => [p.id, p]));

            setRevisionRequests(latestPerOrder.map((r: any) => {
              const ord: any = orderMap.get(r.order_id);
              const buyer: any = bMap.get(ord?.buyer_id);
              return {
                ...r,
                gig_title: ord?.gigs?.title || 'Order',
                buyer_name: buyer?.full_name || 'Buyer',
                buyer_avatar: buyer?.profile_image_url || '',
              };
            }));
          } else {
            setRevisionRequests([]);
          }
        }
      }
    };

    loadDashboardData();

    // Realtime: instantly reflect admin verification changes
    let cleanup: (() => void) | undefined;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: freelancer } = await supabase
        .from('freelancers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      const channel = supabase
        .channel(`freelancer-self-${user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'freelancers', filter: `user_id=eq.${user.id}` }, () => loadDashboardData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `freelancer_id=eq.${freelancer?.id || 'none'}` }, () => loadDashboardData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'disputes', filter: `freelancer_id=eq.${freelancer?.id || 'none'}` }, () => loadDashboardData())
        .subscribe();
      cleanup = () => { supabase.removeChannel(channel); };
    })();
    return () => { cleanup?.(); };
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <SomAdSlot placement="dashboard_banner" viewerRole="freelancer" className="rounded-lg overflow-hidden">
              <div className="p-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 inline-flex items-center gap-2">Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Freelancer'}{isVerified && <VerifiedBadge size="lg" />}! 👋</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Here is what is happening with your work today.</p>
              </div>
            </SomAdSlot>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile featured label="Active Orders" value={stats.activeOrders} hint={stats.activeOrders ? 'In progress now' : 'No active orders'} icon={ShoppingBag} />
              <StatTile label="Total Gigs" value={stats.totalGigs} hint={stats.totalGigs ? 'Service offerings' : 'Create your first gig'} icon={Briefcase} />
              <StatTile label="Pending Earnings" value={`$${stats.pendingEarnings.toFixed(2)}`} hint="From active orders" icon={DollarSign} />
              <StatTile label="Completed Orders" value={stats.completedOrders} hint="Successfully delivered" icon={CheckCircle} />
            </div>

            <OrderActivity active={stats.activeOrders} completed={stats.completedOrders} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="rounded-lg border bg-card p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-semibold">Orders this week</p>
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Weekly</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} fontSize={12} width={28} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))', borderRadius: 8 }} />
                      <Bar dataKey="orders" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-3 rounded-lg border bg-card p-5">
                <p className="font-semibold">Quick actions</p>
                <Button className="w-full justify-start" onClick={() => setActiveSection('gigs')}><Plus className="mr-2 h-4 w-4" />Create new gig</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveSection('deliver')}><Package className="mr-2 h-4 w-4" />Deliver work</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveSection('wallet')}><Wallet className="mr-2 h-4 w-4" />View wallet</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveSection('messages')}><MessageSquare className="mr-2 h-4 w-4" />Messages{unreadCount > 0 ? ` (${unreadCount})` : ''}</Button>
              </div>
            </div>

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
                        <Button size="sm" variant="outline" onClick={() => navigate(`/freelancer/order/${dispute.order_id}`)}>
                          Open Order
                        </Button>
                      </div>
                      <DisputeChat disputeId={dispute.id} viewerRole="freelancer" />
                    </div>
                  ))}
              </section>
            )}

            {!isVerified && verificationStatus === 'removed' ? (
              <Card className="border-destructive/40 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Verification Removed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-background rounded-lg border border-destructive/20 space-y-2">
                    <p className="font-medium text-sm sm:text-base text-destructive">Your verification has been removed by admin.</p>
                    {removalInfo?.reason && (
                      <p className="text-xs sm:text-sm text-muted-foreground"><span className="font-semibold text-foreground">Reason:</span> {removalInfo.reason}</p>
                    )}
                    {removalInfo?.at && (
                      <p className="text-xs text-muted-foreground">Removed on {new Date(removalInfo.at).toLocaleString()}</p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <Button size="sm" variant="outline" onClick={() => setActiveSection('verify')}>Re-submit Verification</Button>
                      <Button size="sm" variant="ghost" onClick={() => setActiveSection('help')}>Contact Support</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isVerified ? null : verificationStatus === 'pending' ? (
              <Card className="border-yellow-500/30 bg-yellow-500/10">
                <CardHeader>
                  <CardTitle className="text-yellow-600 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Verification Under Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background rounded-lg border border-yellow-500/20 gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base text-yellow-600">Your submission is being reviewed</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">We're reviewing your documents. You'll be notified within 24–48 hours.</p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-500/30 bg-yellow-500/10 self-start sm:self-center">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2" />
                    {verificationStatus === 'rejected' ? 'Verification Rejected' : 'Verify Your Account'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-card rounded-lg border border-red-100 gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm sm:text-base text-red-700">
                        {verificationStatus === 'rejected' ? 'Your verification was not approved' : 'Complete your verification'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {verificationStatus === 'rejected'
                          ? 'Please re-submit your documents to try again.'
                          : 'Verify your identity to unlock full access and build buyer trust'}
                      </p>
                      {stats.completedOrders < 1 && verificationStatus !== 'rejected' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Blue Tick requires a verified account and at least 1 completed order.
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveSection('verify')}
                      className="text-xs px-3 py-1 self-start sm:self-center bg-red-600 hover:bg-red-700 text-white"
                    >
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {verificationStatus === 'rejected' ? 'Re-submit' : 'Verify Now'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {revisionRequests.length > 0 && (
              <Card className="border-yellow-400/50 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
                <CardHeader>
                  <CardTitle className="text-yellow-700 dark:text-yellow-200 flex items-center">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Revision Requests ({revisionRequests.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {revisionRequests.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-lg border border-yellow-300 bg-background dark:border-yellow-800"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={r.buyer_avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(r.buyer_name || 'B').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{r.buyer_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.gig_title}</p>
                            </div>
                            {r.revision_requested_at && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(r.revision_requested_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                          {r.revision_feedback ? (
                            <div className="mt-2 p-3 rounded-md bg-yellow-100/60 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm whitespace-pre-wrap text-foreground">{r.revision_feedback}</p>
                            </div>
                          ) : (
                            <p className="mt-2 text-xs italic text-muted-foreground">No feedback provided.</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 text-white"
                              onClick={() => navigate(`/freelancer/order/${r.order_id}`)}
                            >
                              View Order
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Recent Order Requests</span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection('orders')} className="text-sm font-normal">
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">No recent orders</div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <div>
                            <p className="font-medium text-sm">{order.gigs?.title || 'Order'}</p>
                            <p className="text-xs text-muted-foreground">From: {order.buyer_name}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={order.status === 'pending' ? 'secondary' : 'default'} className="mb-1 text-[10px]">
                              {order.status}
                            </Badge>
                            <p className="text-sm font-bold text-primary">${Number(order.amount).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        );
      case 'gigs': return <FreelancerGigs />;
      case 'instructor': return <Navigate to={isInstructor ? '/academy/studio' : '/academy/become-instructor'} replace />;
      case 'applications': return <MyApplications />;
      case 'orders': return <FreelancerOrders />;
      case 'messages': return <FreelancerMessages />;
      case 'deliver': return <FreelancerDeliverWork />;
      case 'wallet': return <FreelancerWallet />;
      case 'help': return <FreelancerHelp />;
      case 'profile': return <FreelancerProfile />;
      case 'settings': return <FreelancerSettings />;
      case 'verify': return <FreelancerVerify />;
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  const navItems = [
    { title: 'Dashboard', icon: Home, key: 'dashboard' },
    { title: 'My Gigs', icon: Briefcase, key: 'gigs' },
    { title: 'Orders Received', icon: ShoppingBag, key: 'orders', count: newOrderCount },
    { title: 'Deliver Work', icon: Package, key: 'deliver' },
    { title: 'My Applications', icon: FileText, key: 'applications' },
    { title: 'Messages', icon: MessageSquare, key: 'messages', count: unreadCount },
    { title: 'Wallet', icon: Wallet, key: 'wallet' },
    { title: 'My Profile', icon: User, key: 'profile' },
    { title: isInstructor ? 'Instructor Studio' : 'Become an Instructor', icon: GraduationCap, key: 'instructor', group: 'secondary' as const },
    { title: 'Help Center', icon: HelpCircle, key: 'help', group: 'secondary' as const },
    { title: 'Settings', icon: Settings, key: 'settings', group: 'secondary' as const },
  ];

  return (
    <DashboardShell
      items={navItems}
      active={activeSection}
      onSelect={(k) => { if (k === 'orders') markSeen(); setActiveSection(k); }}
      roleLabel={isVerified ? 'Verified freelancer' : 'Freelancer'}
      name={userProfile?.full_name || 'Freelancer'}
      email={userProfile?.email}
      photo={myIdentity.photoUrl || userProfile?.profile_image_url}
      sidebarExtra={isVerified && stats.completedOrders >= 1 ? <BlueTickCard userId={userId} onOpen={() => setActiveSection('verify')} /> : undefined}
    >
      {renderContent()}
    </DashboardShell>
  );
};

export default FreelancerDashboard;
