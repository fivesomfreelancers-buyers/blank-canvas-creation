import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";

type Role = "freelancer" | "buyer";

export default function DashboardLayout({ role }: { role: Role }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar role={role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30 px-3">
            <SidebarTrigger aria-label="Open menu" />
            <span className="text-sm font-medium text-muted-foreground capitalize">
              {role} Dashboard
            </span>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
