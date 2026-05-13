import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Trophy, DollarSign, Scale, LogOut, Shield, Sparkles,
  ShieldCheck, Package, MessageSquare, CreditCard, Wallet, Star, FolderTree,
  LifeBuoy, Bell, Lock, Activity, Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarInset, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminEscrow from './AdminEscrow';
import AdminDisputes from './AdminDisputes';
import AdminRanking from './AdminRanking';
import AdminVerifications from './AdminVerifications';
import AdminOrders from './AdminOrders';
import AdminChats from './AdminChats';
import AdminPayments from './AdminPayments';
import AdminWithdrawals from './AdminWithdrawals';
import AdminReviews from './AdminReviews';
import AdminCategories from './AdminCategories';
import AdminSupport from './AdminSupport';
import AdminNotifications from './AdminNotifications';
import AdminSecurity from './AdminSecurity';
import AdminLogs from './AdminLogs';
import AdminSettings from './AdminSettings';

const menuGroups: { label: string; items: { key: string; label: string; icon: any }[] }[] = [
  { label: 'Overview', items: [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'Operations', items: [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'chats', label: 'Live Chats', icon: MessageSquare },
  ]},
  { label: 'Finance', items: [
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'withdrawals', label: 'Withdrawals', icon: Wallet },
    { key: 'escrow', label: 'Escrow', icon: DollarSign },
  ]},
  { label: 'Trust & Safety', items: [
    { key: 'disputes', label: 'Disputes', icon: Scale },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'support', label: 'Support', icon: LifeBuoy },
    { key: 'security', label: 'Security', icon: Lock },
  ]},
  { label: 'System', items: [
    { key: 'categories', label: 'Categories', icon: FolderTree },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'ranking', label: 'Ranking', icon: Trophy },
    { key: 'logs', label: 'Activity Logs', icon: Activity },
    { key: 'settings', label: 'Settings', icon: SettingsIcon },
  ]},
];

const AdminDashboardInner = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'verifications': return <AdminVerifications />;
      case 'orders': return <AdminOrders />;
      case 'chats': return <AdminChats />;
      case 'payments': return <AdminPayments />;
      case 'withdrawals': return <AdminWithdrawals />;
      case 'escrow': return <AdminEscrow />;
      case 'disputes': return <AdminDisputes />;
      case 'reviews': return <AdminReviews />;
      case 'support': return <AdminSupport />;
      case 'security': return <AdminSecurity />;
      case 'categories': return <AdminCategories />;
      case 'notifications': return <AdminNotifications />;
      case 'ranking': return <AdminRanking />;
      case 'logs': return <AdminLogs />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <SidebarProvider>
      {/* VIP Admin shell — dark gradient + ambient neon glow */}
      <div className="admin-vip min-h-screen flex w-full relative overflow-hidden text-slate-100"
           style={{ background: 'radial-gradient(1200px 600px at 10% -10%, rgba(0,163,255,0.15), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(0,204,255,0.12), transparent 60%), #0B0E14' }}>
        {/* Decorative grid + orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]"
             style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(0,163,255,0.35), transparent)' }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(0,204,255,0.25), transparent)' }} />

        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarContent
            className="backdrop-blur-xl border-r"
            style={{ background: 'linear-gradient(180deg, rgba(13,17,26,0.85), rgba(11,14,20,0.9))', borderColor: 'rgba(0,163,255,0.18)' }}
          >
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                       style={{ background: 'linear-gradient(135deg, #007BFF, #00CCFF)', boxShadow: '0 0 20px rgba(0,163,255,0.55)' }}>
                    <Shield className="h-5 w-5 text-white" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#00CCFF] animate-pulse" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-bold text-sm tracking-wide bg-clip-text text-transparent"
                       style={{ backgroundImage: 'linear-gradient(90deg,#fff,#9bdcff)' }}>FIVESOM ADMIN</p>
                    <p className="text-[10px] text-[#7aa7c4] flex items-center gap-1"><Sparkles className="h-3 w-3" /> VIP Control Center</p>
                  </div>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <SidebarMenu className="gap-1">
                  {menuGroups.map((group) => (
                    <React.Fragment key={group.label}>
                      <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-[#7aa7c4]/70 font-semibold">{group.label}</div>
                      {group.items.map((item) => {
                        const active = activeTab === item.key;
                        return (
                          <SidebarMenuItem key={item.key}>
                            <SidebarMenuButton
                              onClick={() => setActiveTab(item.key)}
                              className={`group relative rounded-lg transition-all duration-200 h-9 ${active ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
                              style={active ? {
                                background: 'linear-gradient(90deg, rgba(0,163,255,0.22), rgba(0,204,255,0.06))',
                                boxShadow: 'inset 0 0 0 1px rgba(0,163,255,0.4), 0 0 18px rgba(0,163,255,0.25)',
                              } : undefined}
                            >
                              {active && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                                      style={{ background: 'linear-gradient(180deg,#00A3FF,#00CCFF)', boxShadow: '0 0 10px #00A3FF' }} />
                              )}
                              <item.icon className={`h-4 w-4 ${active ? 'text-[#00CCFF]' : ''}`} />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </React.Fragment>
                  ))}
                  <div className="my-2 mx-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,163,255,0.4), transparent)' }} />
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={handleSignOut}
                      className="rounded-lg h-10 text-rose-300 hover:text-white hover:bg-rose-500/15"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          <header className="h-16 flex items-center justify-between px-6 backdrop-blur-xl border-b sticky top-0 z-10"
                  style={{ background: 'rgba(11,14,20,0.55)', borderColor: 'rgba(0,163,255,0.15)' }}>
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-300 hover:text-white" />
              <div>
                <h1 className="text-lg font-bold capitalize bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(90deg,#ffffff,#9bdcff)' }}>{activeTab}</h1>
                <p className="text-[11px] text-[#7aa7c4]">Real-time platform monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline"
                     className="border-0 text-emerald-300 px-2.5 py-1 text-[11px]"
                     style={{ background: 'rgba(16,185,129,0.12)', boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.35)' }}>
                <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1.5 inline-block animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
                Live
              </Badge>
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                   style={{ background: 'linear-gradient(135deg,#007BFF,#00CCFF)', boxShadow: '0 0 14px rgba(0,163,255,0.5)' }}>
                A
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto relative z-[1]">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const AdminDashboard = () => (
  <AdminGuard>
    <AdminDashboardInner />
  </AdminGuard>
);

export default AdminDashboard;
