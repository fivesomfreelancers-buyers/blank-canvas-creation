import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'freelancer' | 'buyer' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  isLoading: boolean;
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            ensureProfileExists(session.user);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        ensureProfileExists(session.user);
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

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
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data?.role) {
        setUserRole(data.role as UserRole);
        return;
      }

      // Fallback to profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileData?.role) {
        setUserRole(profileData.role as UserRole);
        return;
      }

      // Last fallback: user_metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role as UserRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
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
      isLoading,
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
