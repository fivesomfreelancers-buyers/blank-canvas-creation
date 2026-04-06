import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Trophy, DollarSign, Scale, LogOut, Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarInset, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminEscrow from './AdminEscrow';
import AdminDisputes from './AdminDisputes';
import AdminRanking from './AdminRanking';

const menuItems = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'escrow', label: 'Escrow', icon: DollarSign },
  { key: 'disputes', label: 'Disputes', icon: Scale },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
];

const AdminDashboardInner = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'escrow': return <AdminEscrow />;
      case 'disputes': return <AdminDisputes />;
      case 'ranking': return <AdminRanking />;
      default: return <AdminOverview />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Admin Panel</p>
                    <p className="text-[10px] text-muted-foreground">Full Control</p>
                  </div>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.key)}
                        className={activeTab === item.key
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'hover:bg-muted/50'
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut} className="text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="h-14 flex items-center justify-between border-b border-border px-6 bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <h1 className="text-lg font-bold text-foreground capitalize">{activeTab}</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 inline-block animate-pulse" />
                Online
              </Badge>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                A
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
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
