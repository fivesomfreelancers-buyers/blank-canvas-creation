import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Trophy, DollarSign, Scale, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarInset, SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
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

const AdminDashboard = () => {
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
              <SidebarGroupLabel className="text-primary font-bold text-lg px-4 py-3">
                Admin Panel
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.key)}
                        className={activeTab === item.key ? 'bg-primary/10 text-primary font-medium' : ''}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut} className="text-destructive">
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
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold text-foreground capitalize">{activeTab}</h1>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
