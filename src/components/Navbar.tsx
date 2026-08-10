import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, User, LogOut, Settings, LayoutDashboard, MessageSquare, Shield } from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAdminRole } from '@/hooks/useAdminRole';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useUnreadMessages();
  const { isAdmin } = useAdminRole();
  const [profile, setProfile] = useState<{ full_name: string; profile_image_url: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, profile_image_url')
        .eq('id', user.id)
        .maybeSingle();
      
      const meta: any = user.user_metadata || {};
      setProfile({
        full_name: data?.full_name?.trim() || meta.full_name || meta.name || user.email || 'User',
        profile_image_url: data?.profile_image_url || meta.avatar_url || meta.picture || null,
      });
      if (error) console.error('Navbar profile fetch error:', error);
    };
    fetchProfile();
  }, [user]);

  const isNormal = userRole === 'user';
  const dashboardPath = userRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard';
  const profilePath = userRole === 'freelancer' ? '/freelancer/profile' : '/buyer/settings';
  const settingsPath = userRole === 'freelancer' ? '/freelancer/settings' : '/buyer/settings';
  const messagesPath = userRole === 'freelancer' ? '/freelancer/messages' : '/buyer/messages';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-[12px] bg-background/80 border-b border-border/20 shadow-lg supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/explore" className="text-foreground hover:text-primary transition-colors">Explore</Link>
            <Link to="/how-it-works" className="text-foreground hover:text-primary transition-colors">How It Works</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button

              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/30 hover:bg-primary/20 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </Link>
                )}
                <NotificationBell />
                {!isNormal && (
                <Link
                  to={messagesPath}
                  aria-label="Messages"
                  className="relative p-2 rounded-full hover:bg-accent transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none ring-2 ring-background">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 focus:outline-none relative">
                      <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
                        {profile?.profile_image_url ? (
                          <AvatarImage src={profile.profile_image_url} alt={profile?.full_name || 'User'} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{isNormal ? 'Member' : (userRole || 'User')}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {isNormal ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/explore')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Explore Services
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/become-buyer')}>
                        <User className="mr-2 h-4 w-4" />
                        Become a Buyer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/become-freelancer')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Become a Freelancer
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(profilePath)}>
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(settingsPath)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Join
                  </button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {user && <NotificationBell />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/explore" className="block text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Explore</Link>
            <Link to="/how-it-works" className="block text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>How It Works</Link>
            <button onClick={toggleTheme} className="flex items-center space-x-2 w-full text-left">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>Toggle Theme</span>
            </button>
            {user ? (
              <>
                <div className="flex items-center space-x-3 py-2 border-t border-border pt-4">
                  <Avatar className="h-8 w-8">
                    {profile?.profile_image_url ? (
                      <AvatarImage src={profile.profile_image_url} alt={profile?.full_name || 'User'} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile?.full_name || user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                </div>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 text-primary font-semibold" onClick={() => setIsMenuOpen(false)}>
                    <Shield className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                <Link to={dashboardPath} className="block text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                <Link to={profilePath} className="block text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
                <Link to={settingsPath} className="block text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left text-destructive">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-6 py-2 border border-border rounded-lg hover:bg-accent transition-colors">Sign In</button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Join</button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
