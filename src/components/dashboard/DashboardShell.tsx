import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, MessageSquare, Search, LogOut, type LucideIcon } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/fivesom-logo.png';
import { Button } from '@/components/ui/button';

export interface DashNavItem { key: string; title: string; icon: LucideIcon; count?: number; group?: 'main' | 'secondary' }

interface Props {
  items: DashNavItem[];
  active: string;
  onSelect: (key: string) => void;
  roleLabel: string;
  name: string;
  email?: string | null;
  photo?: string | null;
  sidebarExtra?: React.ReactNode;
  children: React.ReactNode;
}

const NavList = ({ items, active, onSelect }: Pick<Props, 'items' | 'active' | 'onSelect'>) => {
  const main = items.filter(i => i.group !== 'secondary');
  const secondary = items.filter(i => i.group === 'secondary');
  const row = (item: DashNavItem) => {
    const on = item.key === active;
    return (
      <Button
        key={item.key}
        type="button"
        variant="ghost"
        aria-current={on ? 'page' : undefined}
        onClick={() => onSelect(item.key)}
        className={`group flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm ${
          on ? 'bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.title}</span>
        {!!item.count && item.count > 0 && (
          <span className="min-w-[20px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-destructive-foreground">
            {item.count > 99 ? '99+' : item.count}
          </span>
        )}
      </Button>
    );
  };
  return (
    <nav className="space-y-1">
      {main.map(row)}
      {secondary.length > 0 && <div className="mx-3 my-5 h-px bg-border" />}
      {secondary.map(row)}
    </nav>
  );
};

const DashboardShell: React.FC<Props> = ({ items, active, onSelect, roleLabel, name, email, photo, sidebarExtra, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = items.find(i => i.key === active);
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const msgCount = items.find(i => i.key === 'messages')?.count || 0;

  const sidebar = (close?: () => void) => (
    <div className="flex h-full flex-col bg-card px-3 py-6 text-foreground">
      <Link to="/" className="mb-8 flex items-center gap-2 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background"><img src={logo} alt="Fivesom" className="h-6 w-6 object-contain" /></span>
        <span className="text-xl font-semibold">Fivesom</span>
      </Link>
      <div className="flex-1 overflow-y-auto">
        <NavList items={items} active={active} onSelect={(k) => { onSelect(k); close?.(); }} />
        {sidebarExtra && <div className="mt-6 pr-3">{sidebarExtra}</div>}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-border px-2 pt-5">
        <Avatar className="h-9 w-9"><AvatarImage src={photo || undefined} className="object-cover" /><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
        </div>
        <Button variant="ghost" size="icon" type="button" title="Log out" aria-label="Log out" className="h-9 w-9 shrink-0"
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-workspace min-h-screen bg-background">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border lg:block">{sidebar()}</aside>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 border-0 p-0">{sidebar(() => setMobileOpen(false))}</SheetContent>
        </Sheet>
        <main className="min-w-0 flex-1 bg-background">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card px-4 sm:px-6">
            <Button variant="ghost" size="icon" type="button" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search Fivesom"
                className="h-10 w-full rounded-full border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                onKeyDown={(e) => { if (e.key === 'Enter') { const q = (e.target as HTMLInputElement).value.trim(); if (q) window.location.href = `/explore?q=${encodeURIComponent(q)}`; } }}
              />
            </div>
            <p className="truncate font-semibold md:hidden">{current?.title}</p>
            <div className="ml-auto flex items-center gap-1.5">
              <Button variant="ghost" size="icon" type="button" title="Messages" aria-label="Messages" onClick={() => onSelect('messages')} className="relative">
                <MessageSquare className="h-5 w-5" />
                {msgCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />}
              </Button>
              <div className="ml-2 hidden items-center gap-2 border-l pl-3 sm:flex">
                <Avatar className="h-8 w-8"><AvatarImage src={photo || undefined} className="object-cover" /><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
                <div className="leading-tight">
                  <p className="max-w-[140px] truncate text-xs font-semibold">{name}</p>
                  <p className="max-w-[140px] truncate text-[11px] text-muted-foreground">{email || roleLabel}</p>
                </div>
              </div>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">
            {active !== 'dashboard' && current && <h1 className="mb-6 hidden text-2xl font-bold tracking-tight md:block">{current.title}</h1>}
            <div key={active} >{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;

export const StatTile: React.FC<{ label: string; value: React.ReactNode; hint?: string; icon: LucideIcon; featured?: boolean }> = ({ label, value, hint, icon: Icon, featured }) => (
  <div className={`rounded-lg border bg-card p-5 ${featured ? 'border-primary/40' : 'border-border'}`}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
    </div>
    <p className="mt-3 break-words text-3xl font-semibold tabular-nums text-foreground">{value}</p>
    {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const OrderActivity = ({ active, completed }: { active: number; completed: number }) => (
  <section className="border-y border-border py-5" aria-label="Order activity">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold">Order activity</h2>
      <span className="text-xs tabular-nums text-muted-foreground">{active} active · {completed} completed</span>
    </div>
    <meter className="order-activity-meter block h-2 w-full" min={0} max={Math.max(1, active + completed)} value={completed} aria-label="Completed orders" />
    {active + completed === 0 && <p className="mt-2 text-xs text-muted-foreground">No orders yet</p>}
  </section>
);
