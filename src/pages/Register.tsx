
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Briefcase } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState<'freelancer' | 'buyer' | null>(null);
  const navigate = useNavigate();

  const handleRoleSelection = (role: 'freelancer' | 'buyer') => {
    setSelectedRole(role);
    // Redirect to appropriate registration form
    setTimeout(() => {
      if (role === 'freelancer') {
        navigate('/register/freelancer');
      } else {
        navigate('/register/buyer');
      }
    }, 500);
  };

  if (selectedRole) {
    return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to your dashboard...</p>
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
          <div 
            onClick={() => handleRoleSelection('freelancer')}
            className="bg-card rounded-2xl p-8 shadow-xl border border-border cursor-pointer hover:transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Join as a Freelancer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Showcase your skills, create gigs, and connect with buyers looking for your expertise. 
                Start earning by offering your professional services.
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
              <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2">
                <span>Start Freelancing</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Buyer Card */}
          <div 
            onClick={() => handleRoleSelection('buyer')}
            className="bg-card rounded-2xl p-8 shadow-xl border border-border cursor-pointer hover:transform hover:scale-105 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-card-foreground mb-4">Join as a Buyer</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Find skilled freelancers for your projects. Browse services, compare prices, 
                and get your work done by talented professionals.
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
              <Button className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2">
                <span>Start Buying</span>
                <ArrowRight className="w-5 h-5" />
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
