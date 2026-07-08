import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Trophy, DollarSign, Scale, LogOut, Shield, Sparkles,
  ShieldCheck, Package, MessageSquare, CreditCard, Wallet, Star, FolderTree,
  LifeBuoy, Bell, Lock, Activity, Settings as SettingsIcon, Flag, Megaphone, Headphones, Crown, BadgeCheck,
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
import AdminReports from './AdminReports';
import AdminFivesomSupport from './AdminFivesomSupport';
import AdminFivesomNews from './AdminFivesomNews';
import AdminVip from './AdminVip';
import AdminBlueTick from './AdminBlueTick';
import AdminSomAdz from './AdminSomAdz';
import { useAdminBadges, type AdminBadgeKey } from '@/hooks/useAdminBadges';
import { useTheme } from '@/components/ThemeProvider';

const menuGroups: { label: string; items: { key: string; label: string; icon: any }[] }[] = [
  { label: 'Overview', items: [
    { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'Operations', items: [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'verifications', label: 'Verifications', icon: ShieldCheck },
    { key: 'blue_tick', label: 'Blue Tick Requests', icon: BadgeCheck },
    { key: 'orders', label: 'Orders', icon: Package },
    { key: 'chats', label: 'Live Chats', icon: MessageSquare },
  ]},
  { label: 'Finance', items: [
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'withdrawals', label: 'Withdrawals', icon: Wallet },
    { key: 'escrow', label: 'Escrow', icon: DollarSign },
    { key: 'vip', label: 'VIP Memberships', icon: Crown },
  ]},
  { label: 'Fivesom Channels', items: [
    { key: 'fivesom_support', label: 'Fivesom Support', icon: Headphones },
    { key: 'fivesom_news', label: 'Fivesom News', icon: Megaphone },
    { key: 'somadz', label: 'SomAdz', icon: Sparkles },
  ]},
  { label: 'Trust & Safety', items: [
    { key: 'disputes', label: 'Disputes', icon: Scale },
    { key: 'reports', label: 'Reports', icon: Flag },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'support', label: 'Support Tickets', icon: LifeBuoy },
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
  const { badges } = useAdminBadges();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'verifications': return <AdminVerifications />;
      case 'blue_tick': return <AdminBlueTick />;
      case 'orders': return <AdminOrders />;
      case 'chats': return <AdminChats />;
      case 'payments': return <AdminPayments />;
      case 'withdrawals': return <AdminWithdrawals />;
      case 'escrow': return <AdminEscrow />;
      case 'vip': return <AdminVip />;
      case 'disputes': return <AdminDisputes />;
      case 'reports': return <AdminReports />;
      case 'reviews': return <AdminReviews />;
      case 'support': return <AdminSupport />;
      case 'fivesom_support': return <AdminFivesomSupport />;
      case 'fivesom_news': return <AdminFivesomNews />;
      case 'somadz': return <AdminSomAdz />;
      case 'security': return <AdminSecurity />;
      case 'categories': return <AdminCategories />;
      case 'notifications': return <AdminNotifications />;
      case 'ranking': return <AdminRanking />;
      case 'logs': return <AdminLogs />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  // Theme-aware palette
  const shellBg = isDark
    ? 'radial-gradient(1200px 600px at 10% -10%, rgba(0,163,255,0.15), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(0,204,255,0.12), transparent 60%), #0B0E14'
    : 'radial-gradient(1200px 600px at 10% -10%, rgba(0,123,255,0.08), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(0,204,255,0.06), transparent 60%), #F5F8FC';
  const sidebarBg = isDark
    ? 'linear-gradient(180deg, rgba(13,17,26,0.85), rgba(11,14,20,0.9))'
    : 'linear-gradient(180deg, #ffffff, #f1f5f9)';
  const headerBg = isDark ? '#0B0E14' : '#ffffff';
  const headerBorder = isDark ? 'rgba(0,163,255,0.25)' : 'rgba(0,123,255,0.15)';
  const sidebarBorder = isDark ? 'rgba(0,163,255,0.18)' : 'rgba(0,123,255,0.12)';
  const titleGradient = isDark ? 'linear-gradient(90deg,#ffffff,#9bdcff)' : 'linear-gradient(90deg,#0b3a66,#007BFF)';
  const brandGradient = isDark ? 'linear-gradient(90deg,#fff,#9bdcff)' : 'linear-gradient(90deg,#0b3a66,#007BFF)';
  const mutedText = isDark ? 'text-[#7aa7c4]' : 'text-slate-500';
  const labelText = isDark ? 'text-[#7aa7c4]/70' : 'text-slate-400';
  const inactiveItemText = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900';
  const activeItemText = isDark ? 'text-white font-semibold' : 'text-slate-900 font-semibold';
  const activeItemStyle = isDark ? {
    background: 'linear-gradient(90deg, rgba(0,163,255,0.22), rgba(0,204,255,0.06))',
    boxShadow: 'inset 0 0 0 1px rgba(0,163,255,0.4), 0 0 18px rgba(0,163,255,0.25)',
  } : {
    background: 'linear-gradient(90deg, rgba(0,123,255,0.10), rgba(0,204,255,0.04))',
    boxShadow: 'inset 0 0 0 1px rgba(0,123,255,0.30)',
  };
  const triggerText = isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900';

  return (
    <SidebarProvider>
      <div className={`admin-vip min-h-screen flex w-full relative overflow-hidden ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
           style={{ background: shellBg }}>
        {/* Decorative grid + orbs */}
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${isDark ? 'opacity-[0.06]' : 'opacity-[0.04]'}`}
             style={{ backgroundImage: isDark
               ? 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)'
               : 'linear-gradient(rgba(0,80,160,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,80,160,.5) 1px, transparent 1px)',
               backgroundSize: '40px 40px' }} />
        <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(0,163,255,0.25), transparent)' }} />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] rounded-full blur-3xl" style={{ background: 'radial-gradient(closest-side, rgba(0,204,255,0.18), transparent)' }} />

        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarContent
            className="backdrop-blur-xl border-r"
            style={{ background: sidebarBg, borderColor: sidebarBorder }}
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
                       style={{ backgroundImage: brandGradient }}>FIVESOM ADMIN</p>
                    <p className={`text-[10px] flex items-center gap-1 ${mutedText}`}><Sparkles className="h-3 w-3" /> VIP Control Center</p>
                  </div>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <SidebarMenu className="gap-1">
                  {menuGroups.map((group) => (
                    <React.Fragment key={group.label}>
                      <div className={`px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider font-semibold ${labelText}`}>{group.label}</div>
                      {group.items.map((item) => {
                        const active = activeTab === item.key;
                        const count = (badges as any)[item.key as AdminBadgeKey] as number | undefined;
                        return (
                          <SidebarMenuItem key={item.key}>
                            <SidebarMenuButton
                              onClick={() => setActiveTab(item.key)}
                              className={`group relative rounded-lg transition-all duration-200 h-9 ${active ? activeItemText : inactiveItemText}`}
                              style={active ? activeItemStyle : undefined}
                            >
                              {active && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r"
                                      style={{ background: 'linear-gradient(180deg,#00A3FF,#00CCFF)', boxShadow: '0 0 10px #00A3FF' }} />
                              )}
                              <item.icon className={`h-4 w-4 ${active ? 'text-[#00A3FF]' : ''}`} />
                              <span className="flex-1">{item.label}</span>
                              {count && count > 0 ? (
                                <span
                                  className="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-bold text-white animate-pulse"
                                  style={{ background: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.7)' }}
                                  title={`${count} new`}
                                >
                                  {count > 99 ? '99+' : count}
                                </span>
                              ) : null}
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
                      className={`rounded-lg h-10 ${isDark ? 'text-rose-300 hover:text-white hover:bg-rose-500/15' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-500/10'}`}
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
          {activeTab !== 'fivesom_support' && (
            <header className="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-30 shadow-sm"
                    style={{ background: headerBg, borderColor: headerBorder }}>
              <div className="flex items-center gap-3">
                <SidebarTrigger className={triggerText} />
                <div>
                  <h1 className="text-lg font-bold capitalize bg-clip-text text-transparent"
                      style={{ backgroundImage: titleGradient }}>{activeTab}</h1>
                  <p className={`text-[11px] ${mutedText}`}>Real-time platform monitoring</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline"
                       className={`border-0 px-2.5 py-1 text-[11px] ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}
                       style={{ background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.10)', boxShadow: 'inset 0 0 0 1px rgba(16,185,129,0.35)' }}>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mr-1.5 inline-block animate-pulse" style={{ boxShadow: '0 0 8px #10b981' }} />
                  Live
                </Badge>
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                     style={{ background: 'linear-gradient(135deg,#007BFF,#00CCFF)', boxShadow: '0 0 14px rgba(0,163,255,0.5)' }}>
                  A
                </div>
              </div>
            </header>
          )}
          {activeTab === 'fivesom_support' && (
            <div className="sticky top-2 left-2 z-30 w-fit">
              <SidebarTrigger className={`${triggerText} ml-2 mt-2`} />
            </div>
          )}
          <main className={`flex-1 ${activeTab === 'fivesom_support' ? 'p-3 pt-0' : 'p-6'} overflow-auto relative z-[1]`}>
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
