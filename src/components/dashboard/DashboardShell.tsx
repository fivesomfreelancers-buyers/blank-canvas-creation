import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Menu, MessageSquare, Search, LogOut, type LucideIcon } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/fivesom-logo.png';

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
      <button
        key={item.key}
        type="button"
        onClick={() => onSelect(item.key)}
        className={`group flex w-full items-center gap-3 rounded-l-full py-2.5 pl-4 pr-3 text-sm transition-all ${
          on ? 'bg-background font-semibold text-primary' : 'text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground'
        }`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.title}</span>
        {!!item.count && item.count > 0 && (
          <span className="min-w-[20px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-destructive-foreground">
            {item.count > 99 ? '99+' : item.count}
          </span>
        )}
      </button>
    );
  };
  return (
    <nav className="space-y-1">
      {main.map(row)}
      {secondary.length > 0 && <div className="mx-4 my-4 h-px bg-primary-foreground/20" />}
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
    <div className="flex h-full flex-col bg-primary py-6 pl-3 text-primary-foreground">
      <Link to="/" className="mb-8 flex items-center gap-2 px-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background"><img src={logo} alt="Fivesom" className="h-6 w-6 object-contain" /></span>
        <span className="text-xl font-bold tracking-tight">Fivesom</span>
      </Link>
      <div className="flex-1 overflow-y-auto">
        <NavList items={items} active={active} onSelect={(k) => { onSelect(k); close?.(); }} />
        {sidebarExtra && <div className="mt-6 pr-3">{sidebarExtra}</div>}
      </div>
      <div className="mr-3 mt-4 flex items-center gap-3 rounded-2xl bg-primary-foreground/10 p-3">
        <Avatar className="h-9 w-9"><AvatarImage src={photo || undefined} className="object-cover" /><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-primary-foreground/70">{roleLabel}</p>
        </div>
        <button type="button" aria-label="Log out" className="rounded-full p-1.5 hover:bg-primary-foreground/15"
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}>
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary lg:p-3">
      <div className="flex min-h-screen lg:min-h-[calc(100vh-1.5rem)]">
        <aside className="hidden w-60 shrink-0 lg:block">{sidebar()}</aside>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 border-0 p-0">{sidebar(() => setMobileOpen(false))}</SheetContent>
        </Sheet>
        <main className="min-w-0 flex-1 bg-background lg:rounded-3xl">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:rounded-t-3xl sm:px-6">
            <button type="button" className="rounded-full p-2 hover:bg-muted lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
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
              <button type="button" aria-label="Messages" onClick={() => onSelect('messages')} className="relative rounded-full p-2 hover:bg-muted">
                <MessageSquare className="h-5 w-5" />
                {msgCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />}
              </button>
              <button type="button" aria-label="Notifications" onClick={() => onSelect('messages')} className="rounded-full p-2 hover:bg-muted"><Bell className="h-5 w-5" /></button>
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
  <div className={`rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${featured ? 'border-transparent bg-primary text-primary-foreground shadow-lg' : 'bg-card'}`}>
    <div className="flex items-start justify-between gap-2">
      <p className={`text-sm font-semibold ${featured ? '' : 'text-foreground'}`}>{label}</p>
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${featured ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'}`}><Icon className="h-4 w-4" /></span>
    </div>
    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    {hint && <p className={`mt-1 text-xs ${featured ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{hint}</p>}
  </div>
);
