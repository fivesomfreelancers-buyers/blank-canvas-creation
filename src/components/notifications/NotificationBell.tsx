import React from 'react';
import { Bell, MessageSquare, Megaphone, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';
import supportLogo from '@/assets/fivesom-support-logo.png';
import newsLogo from '@/assets/fivesom-news-logo.png';

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString();
};

const NotificationIcon: React.FC<{ item: AppNotification }> = ({ item }) => {
  if (item.kind === 'news') {
    return <img src={newsLogo} alt="Fivesom News" className="h-9 w-9 rounded-full object-cover" />;
  }
  if (item.kind === 'support') {
    return <img src={supportLogo} alt="Fivesom Support" className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <Avatar className="h-9 w-9">
      {item.avatarUrl ? <AvatarImage src={item.avatarUrl} alt={item.title} /> : null}
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
        {item.title.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

const KindLabel: React.FC<{ kind: AppNotification['kind'] }> = ({ kind }) => {
  const Icon = kind === 'news' ? Megaphone : kind === 'support' ? Headphones : MessageSquare;
  const label = kind === 'news' ? 'News' : kind === 'support' ? 'Support' : 'Message';
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
};

/** Header notification bell with a live dropdown of recent activity. */
const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { items, unreadCount, loading, inboxBase } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
          className="relative p-2 rounded-full hover:bg-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none ring-2 ring-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] max-w-[92vw] p-0">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="text-[11px] font-semibold text-destructive">{unreadCount} new</span>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto">
          {loading && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading…</p>}
          {!loading && items.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">You're all caught up 🎉</p>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.href)}
              className={`w-full text-left flex gap-3 px-3 py-2.5 border-b border-border/60 last:border-0 hover:bg-accent transition-colors ${
                item.unread ? 'bg-primary/5' : ''
              }`}
            >
              <NotificationIcon item={item} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 break-words">{item.body || '—'}</p>
                <div className="pt-1"><KindLabel kind={item.kind} /></div>
              </div>
              {item.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-destructive" />}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate(inboxBase)}
          className="w-full py-2.5 text-sm font-semibold text-primary hover:bg-accent transition-colors border-t border-border"
        >
          Open inbox
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
