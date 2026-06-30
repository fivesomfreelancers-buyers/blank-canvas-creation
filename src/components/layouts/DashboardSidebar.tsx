import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Wallet,
  Briefcase,
  Settings,
  HelpCircle,
  ShoppingBag,
  Search,
  CreditCard,
  User,
  ShieldCheck,
  Upload,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";

type Role = "freelancer" | "buyer";

const freelancerItems = [
  { title: "Dashboard", url: "/freelancer/dashboard", icon: LayoutDashboard },
  { title: "My Gigs", url: "/freelancer/gigs", icon: Briefcase },
  { title: "Orders", url: "/freelancer/orders", icon: Package },
  { title: "Deliver Work", url: "/freelancer/deliver", icon: Upload },
  { title: "Messages", url: "/freelancer/messages", icon: MessageSquare },
  { title: "Wallet", url: "/freelancer/wallet", icon: Wallet },
  { title: "Profile", url: "/freelancer/profile", icon: User },
  { title: "Verify", url: "/freelancer/verify", icon: ShieldCheck },
  { title: "Settings", url: "/freelancer/settings", icon: Settings },
  { title: "Help", url: "/freelancer/help", icon: HelpCircle },
];

const buyerItems = [
  { title: "Dashboard", url: "/buyer/dashboard", icon: LayoutDashboard },
  { title: "Browse Gigs", url: "/buyer/browse", icon: Search },
  { title: "My Orders", url: "/buyer/orders", icon: ShoppingBag },
  { title: "Messages", url: "/buyer/messages", icon: MessageSquare },
  { title: "Payments", url: "/buyer/payments", icon: CreditCard },
  { title: "Settings", url: "/buyer/settings", icon: Settings },
  { title: "Help", url: "/buyer/help", icon: HelpCircle },
];

export function DashboardSidebar({ role }: { role: Role }) {
  const items = role === "freelancer" ? freelancerItems : buyerItems;
  const { pathname } = useLocation();
  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <div className="p-4 border-b border-sidebar-border">
          <Logo />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="capitalize">{role} Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
