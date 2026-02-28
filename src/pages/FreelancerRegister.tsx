import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, User, Mail, Lock, MapPin, Briefcase } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';

const FreelancerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
    profileImage: null as File | null,
    shortBio: '',
    languageLevel: '',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userRole) {
      if (userRole === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else if (userRole === 'buyer') {
        navigate('/buyer/dashboard');
      }
    }
  }, [user, userRole, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Please ensure both passwords match.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (formData.shortBio.length < 50) {
      toast({
        title: "Bio Too Short",
        description: "Please write at least 50 characters for your bio.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      'freelancer',
      formData.location
    );
    
    if (error) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.message.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please login instead.";
      } else if (error.message.includes('Invalid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message.includes('Password')) {
        errorMessage = "Password must be at least 6 characters long.";
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "Registration Successful!",
      description: "Welcome to FIVESOM! Redirecting to your dashboard...",
    });
    setIsLoading(false);
    
    // Redirect to freelancer dashboard after successful registration
    setTimeout(() => {
      navigate('/freelancer/dashboard');
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, profileImage: e.target.files![0] }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Join as a Freelancer</h1>
            <p className="text-muted-foreground">Create your profile and start offering your services</p>
          </div>

          {/* Registration Form */}
          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="fullName"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">Email Address *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-foreground font-medium">Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      placeholder="Create a password (min 6 chars)"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 h-12"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <Label htmlFor="category" className="text-foreground font-medium">Primary Skill Category *</Label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    placeholder="e.g., Web Development, Graphic Design, Writing"
                  />
                </div>
              </div>

              {/* Short Bio */}
              <div>
                <Label htmlFor="shortBio" className="text-foreground font-medium">Professional Bio *</Label>
                <Textarea
                  id="shortBio"
                  name="shortBio"
                  required
                  value={formData.shortBio}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[100px] resize-none"
                  placeholder="Describe your skills, experience, and what makes you unique (minimum 50 characters)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.shortBio.length}/500 characters
                </p>
              </div>

              {/* Profile Image Upload */}
              <div>
                <Label htmlFor="profileImage" className="text-foreground font-medium">Profile Image (Optional)</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label htmlFor="profileImage" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80">
                        <span>Upload a professional photo</span>
                        <input id="profileImage" name="profileImage" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                    {formData.profileImage && (
                      <p className="text-sm text-green-600">✓ {formData.profileImage.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-foreground font-medium">Location *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="location"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Freelancer Account</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreelancerRegister;
