import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RoleSelection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'buyer' | null>(null);
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!authLoading && user && userRole) {
      navigate(userRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard');
    }
  }, [user, userRole, authLoading, navigate]);

  const handleRoleSelect = async (role: 'freelancer' | 'buyer') => {
    if (!user) return;
    setSelectedRole(role);
    setIsLoading(true);

    try {
      // Insert role into user_roles
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: user.id,
        role: role,
      } as any);

      if (roleError) throw roleError;

      // Update profile with role
      await supabase.from('profiles').update({ role } as any).eq('id', user.id);

      // Create freelancer or buyer record
      if (role === 'freelancer') {
        await supabase.from('freelancers').insert({ user_id: user.id } as any);
      } else {
        await supabase.from('buyers').insert({ user_id: user.id } as any);
      }

      toast({ title: 'Role Selected!', description: `You joined as a ${role}.` });
      navigate(`/complete-profile/${role}`);
    } catch (err: any) {
      console.error('Role selection error:', err);
      toast({ title: 'Error', description: 'Could not set your role. Please try again.', variant: 'destructive' });
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">How do you want to use FIVSOM?</h1>
          <p className="text-muted-foreground text-lg">Choose your role to get started. You can always update this later.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Freelancer Card */}
          <button
            onClick={() => handleRoleSelect('freelancer')}
            disabled={isLoading}
            className="bg-card rounded-2xl p-8 shadow-xl border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 group text-left disabled:opacity-60"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-3">Freelancer</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Start selling your services and earn money on FIVSOM.
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground text-sm">
              <li className="flex items-center"><div className="w-2 h-2 bg-cyan-500 rounded-full mr-3" />Create and manage gigs</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-cyan-500 rounded-full mr-3" />Set your own prices</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-cyan-500 rounded-full mr-3" />Build your reputation</li>
            </ul>
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold">
              {isLoading && selectedRole === 'freelancer' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Continue as Freelancer <ArrowRight className="w-4 h-4" /></>
              )}
            </div>
          </button>

          {/* Buyer Card */}
          <button
            onClick={() => handleRoleSelect('buyer')}
            disabled={isLoading}
            className="bg-card rounded-2xl p-8 shadow-xl border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 group text-left disabled:opacity-60"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-3">Buyer</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Hire skilled freelancers and get your work done easily.
            </p>
            <ul className="space-y-2 mb-8 text-muted-foreground text-sm">
              <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />Browse thousands of services</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />Secure payment system</li>
              <li className="flex items-center"><div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />Quality guarantee</li>
            </ul>
            <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
              {isLoading && selectedRole === 'buyer' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Continue as Buyer <ArrowRight className="w-4 h-4" /></>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
