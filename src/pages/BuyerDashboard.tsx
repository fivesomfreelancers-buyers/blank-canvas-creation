
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ShoppingBag, 
  MessageSquare, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  User,
  Star,
  Clock,
  CheckCircle,
  DollarSign
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
import BuyerBrowse from './buyer/BuyerBrowse';
import BuyerOrders from './buyer/BuyerOrders';
import BuyerMessages from './buyer/BuyerMessages';
import BuyerPayments from './buyer/BuyerPayments';
import BuyerHelp from './buyer/BuyerHelp';
import BuyerSettings from './buyer/BuyerSettings';

const sidebarItems = [
  { title: "Dashboard", icon: Home, key: "dashboard" },
  { title: "Browse Services", icon: Search, key: "browse" },
  { title: "My Orders", icon: ShoppingBag, key: "orders" },
  { title: "Messages", icon: MessageSquare, key: "messages" },
  { title: "Payments", icon: CreditCard, key: "payments" },
  { title: "Help Center", icon: HelpCircle, key: "help" },
  { title: "Settings", icon: Settings, key: "settings" },
];

const BuyerSidebar = ({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (section: string) => void }) => {
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
                        activeSection === item.key ? 'text-blue-600 font-medium' : ''
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
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Buyer</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const BuyerDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-lg">
              <h1 className="text-xl sm:text-2xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-purple-100 text-sm sm:text-base">Ready to find amazing talent for your projects?</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No active orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Start ordering services</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Rating Given</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-</div>
                  <p className="text-xs text-muted-foreground">Complete orders first</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Orders */}
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

            {/* Recommended Services */}
            <Card>
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Browse our marketplace to find talented freelancers for your projects
                  </p>
                  <Button 
                    onClick={() => setActiveSection('browse')}
                  >
                    Browse All Services
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'browse':
        return <BuyerBrowse />;

      case 'orders':
        return <BuyerOrders />;

      case 'messages':
        return <BuyerMessages />;

      case 'payments':
        return <BuyerPayments />;

      case 'help':
        return <BuyerHelp />;

      case 'settings':
        return <BuyerSettings />;

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This section is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <BuyerSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center space-x-4">
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
