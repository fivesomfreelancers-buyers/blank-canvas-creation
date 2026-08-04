import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureNormalUserRole } from '@/lib/roleUpgrade';

type UserRole = 'freelancer' | 'buyer' | 'user' | null;

const toUserRole = (role: unknown): UserRole => {
  return role === 'freelancer' || role === 'buyer' || role === 'user' ? role : null;
};

// A user can hold several role rows; the strongest one wins.
const pickRole = (roles: unknown[]): UserRole => {
  const normalized = roles.map(toUserRole).filter(Boolean) as Exclude<UserRole, null>[];
  if (normalized.includes('freelancer')) return 'freelancer';
  if (normalized.includes('buyer')) return 'buyer';
  if (normalized.includes('user')) return 'user';
  return null;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  isNormalUser: boolean;
  isLoading: boolean;
  refreshRole: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'freelancer' | 'buyer', location?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let bootstrappedFor: string | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_OUT' || !session?.user) {
          bootstrappedFor = null;
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        // Token refreshes must never re-run bootstrap or clear the role —
        // that is what made sessions look like they "dropped" randomly.
        if (event === 'TOKEN_REFRESHED' && bootstrappedFor === session.user.id) {
          return;
        }

        if (bootstrappedFor === session.user.id && event !== 'USER_UPDATED') {
          return;
        }

        bootstrappedFor = session.user.id;
        const authUser = session.user;
        setTimeout(() => {
          ensureProfileExists(authUser);
          fetchUserRole(authUser.id);
        }, 0);
      }
    );

    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && bootstrappedFor !== session.user.id) {
          bootstrappedFor = session.user.id;
          await ensureProfileExists(session.user);
          await fetchUserRole(session.user.id);
        }
      })
      .catch((err) => console.error('getSession error:', err))
      .finally(() => setIsLoading(false));

    return () => subscription.unsubscribe();
  }, []);


  const ensureProfileExists = async (authUser: User) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!data) {
        // Profile doesn't exist - create it (trigger should handle this, but as fallback)
        const meta = authUser.user_metadata || {};
        await (supabase as any).from('profiles').insert({
          id: authUser.id,
          full_name: meta.full_name || meta.name || '',
          email: authUser.email || '',
          location: meta.location || null,
        });
      }
    } catch (err) {
      console.error('ensureProfileExists error:', err);
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const roleFromTable = pickRole((data || []).map((r: any) => r.role));
      if (!error && roleFromTable) {
        setUserRole(roleFromTable);
        return;
      }

      const { data: userRes } = await supabase.auth.getUser();
      const roleFromMetadata = toUserRole(userRes.user?.user_metadata?.role);
      if (userRes.user?.id === userId && roleFromMetadata && roleFromMetadata !== 'user') {
        await (supabase as any).from('user_roles').upsert(
          { user_id: userId, role: roleFromMetadata },
          { onConflict: 'user_id,role' }
        );
        if (roleFromMetadata === 'freelancer') {
          await (supabase as any).from('freelancers').upsert({ user_id: userId }, { onConflict: 'user_id' });
        } else {
          await (supabase as any).from('buyers').upsert({ user_id: userId }, { onConflict: 'user_id' });
        }
        setUserRole(roleFromMetadata);
        return;
      }

      // No role at all → this is a brand new account: make it a normal user.
      await ensureNormalUserRole(userId);
      setUserRole('user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  const refreshRole = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await fetchUserRole(data.user.id);
  };



  const signUp = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'freelancer' | 'buyer',
    location?: string
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role,
            location: location || null
          }
        }
      });

      if (error) {
        return { error };
      }

      if (data?.user) {
        await (supabase as any).from('user_roles').upsert(
          { user_id: data.user.id, role },
          { onConflict: 'user_id,role' }
        );
        await (supabase as any).from('profiles').update({ role }).eq('id', data.user.id);

        if (role === 'freelancer') {
          await supabase.from('freelancers').upsert({ user_id: data.user.id } as any, { onConflict: 'user_id' });
        } else {
          await supabase.from('buyers').upsert({ user_id: data.user.id } as any, { onConflict: 'user_id' });
        }
        setUserRole(role);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      isNormalUser: !!user && userRole === 'user',
      isLoading,
      refreshRole,
      signUp,
      signIn,
      signOut
    }}>

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
