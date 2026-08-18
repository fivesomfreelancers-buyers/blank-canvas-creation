import React, { useState } from 'react';
import {
  LayoutDashboard, ShieldCheck, Package, MessageSquare, Headphones, Megaphone,
  Flag, Trophy, Scale, Crown, LogOut, Bell, Briefcase, Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarInset, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { useAdminBadges } from '@/hooks/useAdminBadges';
import FounderGuard from '@/components/founder/FounderGuard';
import FounderPresenceBar from '@/components/founder/FounderPresenceBar';
import FounderScreenGuard from '@/components/founder/FounderScreenGuard';

// Reuse the existing (already secured) management screens — no duplication.
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminVerifications from '@/pages/admin/AdminVerifications';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminChats from '@/pages/admin/AdminChats';
import AdminFivesomSupport from '@/pages/admin/AdminFivesomSupport';
import AdminFivesomNews from '@/pages/admin/AdminFivesomNews';
import AdminReports from '@/pages/admin/AdminReports';
import AdminRanking from '@/pages/admin/AdminRanking';
import AdminDisputes from '@/pages/admin/AdminDisputes';
import AdminGigs from '@/pages/admin/AdminGigs';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAboutTeam from '@/pages/admin/AdminAboutTeam';

type TabKey =
  | 'overview' | 'verifications' | 'orders' | 'chats'
  | 'fivesom_support' | 'fivesom_news' | 'reports' | 'ranking' | 'disputes'
  | 'gigs' | 'users' | 'about_team';

const menu: { key: TabKey; label: string; icon: any; badge?: string }[] = [
  { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'verifications', label: 'Verifications', icon: ShieldCheck, badge: 'verifications' },
  { key: 'gigs', label: 'Gigs', icon: Briefcase },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'chats', label: 'Live Chat', icon: MessageSquare },
  { key: 'fivesom_support', label: 'Fivesom Support', icon: Headphones, badge: 'fivesom_support' },
  { key: 'fivesom_news', label: 'Fivesom News', icon: Megaphone },
  { key: 'reports', label: 'User Reports', icon: Flag, badge: 'reports' },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
  { key: 'disputes', label: 'Disputes', icon: Scale, badge: 'disputes' },
];

const titles: Record<TabKey, string> = {
  overview: 'Founder Dashboard',
  verifications: 'Verifications',
  gigs: 'Gigs Management',
  users: 'Users Management',
  orders: 'Orders',
  chats: 'Live Chat',
  fivesom_support: 'Fivesom Support',
  fivesom_news: 'Fivesom News',
  reports: 'User Reports',
  ranking: 'Ranking',
  disputes: 'Disputes',
};

const FounderDashboardInner = () => {
  const [activeTab, setActiveTabState] = useState<TabKey>(() => {
    try {
      const hash = window.location.hash.replace('#', '') as TabKey;
      const stored = localStorage.getItem('fivesom.founder.tab') as TabKey | null;
      const candidate = (hash || stored) as TabKey;
      return candidate && candidate in titles ? candidate : 'overview';
    } catch { return 'overview'; }
  });

  const setActiveTab = (key: TabKey) => {
    setActiveTabState(key);
    try {
      localStorage.setItem('fivesom.founder.tab', key);
      window.history.replaceState(null, '', `#${key}`);
    } catch { /* ignore */ }
  };

  React.useEffect(() => {
    try { window.history.replaceState(null, '', `#${activeTab}`); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
      case 'verifications': return <AdminVerifications />;
      case 'gigs': return <AdminGigs />;
      case 'users': return <AdminUsers />;
      case 'orders': return <AdminOrders />;
      case 'chats': return <AdminChats />;
      case 'fivesom_support': return <AdminFivesomSupport />;
      case 'fivesom_news': return <AdminFivesomNews />;
      case 'reports': return <AdminReports />;
      case 'ranking': return <AdminRanking />;
      case 'disputes': return <AdminDisputes />;
      default: return <AdminOverview />;
    }
  };

  const shellBg = isDark
    ? 'radial-gradient(1200px 600px at 10% -10%, rgba(255,196,0,0.10), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(0,163,255,0.12), transparent 60%), #0B0E14'
    : 'radial-gradient(1200px 600px at 10% -10%, rgba(255,196,0,0.08), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(0,123,255,0.06), transparent 60%), #F5F8FC';
  const sidebarBg = isDark
    ? 'linear-gradient(180deg, rgba(13,17,26,0.85), rgba(11,14,20,0.9))'
    : 'linear-gradient(180deg, #ffffff, #f1f5f9)';
  const sidebarBorder = isDark ? 'rgba(255,196,0,0.18)' : 'rgba(0,123,255,0.12)';
  const headerBg = isDark ? '#0B0E14' : '#ffffff';
  const headerBorder = isDark ? 'rgba(255,196,0,0.22)' : 'rgba(0,123,255,0.15)';
  const brandGradient = isDark ? 'linear-gradient(90deg,#fff,#ffd77a)' : 'linear-gradient(90deg,#0b3a66,#b8860b)';
  const mutedText = isDark ? 'text-[#a89b7a]' : 'text-slate-500';
  const inactiveItemText = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900';
  const activeItemText = isDark ? 'text-white font-semibold' : 'text-slate-900 font-semibold';
  const activeItemStyle = isDark ? {
    background: 'linear-gradient(90deg, rgba(255,196,0,0.20), rgba(0,163,255,0.06))',
    boxShadow: 'inset 0 0 0 1px rgba(255,196,0,0.35)',
  } : {
    background: 'linear-gradient(90deg, rgba(255,196,0,0.14), rgba(0,123,255,0.04))',
    boxShadow: 'inset 0 0 0 1px rgba(184,134,11,0.25)',
  };

  return (
    <SidebarProvider>
      <div
        className={`fixed inset-0 flex w-full overflow-hidden ${isDark ? 'text-slate-100' : 'text-slate-800'}`}
        style={{ background: shellBg }}
      >
        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarContent className="backdrop-blur-xl border-r" style={{ background: sidebarBg, borderColor: sidebarBorder }}>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="relative h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #FFC400, #FF8A00)', boxShadow: '0 0 20px rgba(255,196,0,0.45)' }}
                  >
                    <Crown className="h-5 w-5 text-white" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-bold text-sm tracking-wide bg-clip-text text-transparent" style={{ backgroundImage: brandGradient }}>
                      FIVESOM FOUNDERS
                    </p>
                    <p className={`text-[10px] ${mutedText}`}>Private Management Console</p>
                  </div>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <SidebarMenu className="gap-1">
                  {menu.map((item) => {
                    const active = activeTab === item.key;
                    const count = item.badge ? (badges as any)?.[item.badge] ?? 0 : 0;
                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          onClick={() => setActiveTab(item.key)}
                          isActive={active}
                          tooltip={item.label}
                          className={`rounded-lg transition-all ${active ? activeItemText : inactiveItemText}`}
                          style={active ? activeItemStyle : undefined}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="flex-1">{item.label}</span>
                          {count > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center px-1 text-[10px]" variant="destructive">
                              {count}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="bg-transparent flex flex-col min-w-0 overflow-hidden">
          <header
            className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4"
            style={{ background: headerBg, borderColor: headerBorder }}
          >
            <SidebarTrigger className={inactiveItemText} />
            <h1 className="text-sm sm:text-base font-semibold truncate">{titles[activeTab]}</h1>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:flex items-center gap-1 border-amber-400/40 text-amber-500">
                <Crown className="h-3 w-3" /> Founder
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('fivesom_support')} aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
            <FounderPresenceBar />
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const FounderDashboard = () => (
  <FounderGuard>
    <FounderScreenGuard>
      <FounderDashboardInner />
    </FounderScreenGuard>
  </FounderGuard>
);

export default FounderDashboard;
