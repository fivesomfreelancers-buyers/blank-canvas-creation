import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Briefcase } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'buyer' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in with a role
  useEffect(() => {
    if (!authLoading && user && userRole) {
      if (userRole === 'freelancer') navigate('/freelancer/dashboard');
      else if (userRole === 'buyer') navigate('/buyer/dashboard');
    }
  }, [user, userRole, authLoading, navigate]);

  const handleGoogleSignUp = async (role: 'freelancer' | 'buyer') => {
    setSelectedRole(role);
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Could not sign up with Google.",
        variant: "destructive",
      });
      setIsLoading(false);
      setSelectedRole(null);
      return;
    }

    // Store the selected role in localStorage so the callback page can use it
    localStorage.setItem('fivesom_signup_role', role);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to Google...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3">
            <Logo />
            <span className="text-3xl font-bold text-foreground">FIVESOM</span>
          </div>
          <p className="text-muted-foreground mt-4 text-lg">Join our community of talented professionals</p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Freelancer Card */}
          <div className="bg-card rounded-2xl p-8 shadow-xl border border-border hover:transform hover:scale-105 transition-all duration-300 group">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Join as a Freelancer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Showcase your skills, create gigs, and connect with buyers looking for your expertise.
              </p>
              <ul className="text-left space-y-2 mb-8 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  Create and manage gigs
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  Set your own prices
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  Build your reputation
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3"></div>
                  Work with global clients
                </li>
              </ul>
              <Button
                onClick={() => handleGoogleSignUp('freelancer')}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign up with Google</span>
              </Button>
            </div>
          </div>

          {/* Buyer Card */}
          <div className="bg-card rounded-2xl p-8 shadow-xl border border-border hover:transform hover:scale-105 transition-all duration-300 group">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Join as a Buyer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Find skilled freelancers for your projects. Browse services, compare prices, and get work done.
              </p>
              <ul className="text-left space-y-2 mb-8 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Browse thousands of services
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Secure payment system
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  24/7 customer support
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Quality guarantee
                </li>
              </ul>
              <Button
                onClick={() => handleGoogleSignUp('buyer')}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Sign up with Google</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
