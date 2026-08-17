import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Upload, User, Mail, Lock, MapPin, Briefcase, Globe, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';

const AVAILABLE_LANGUAGES = [
  'English', 'Somali', 'Arabic', 'Italian', 'French', 'Spanish', 'German',
  'Portuguese', 'Turkish', 'Swahili', 'Amharic', 'Hindi', 'Urdu', 'Chinese',
  'Japanese', 'Korean', 'Russian', 'Dutch', 'Swedish', 'Norwegian'
];

const FreelancerRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    category: '',
    profileImage: null as File | null,
    shortBio: '',
    languages: [] as string[],
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const { toast } = useToast();
  const { signUp, user, userRole, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user && userRole) {
      if (userRole === 'freelancer') navigate('/freelancer/dashboard');
      else if (userRole === 'buyer') navigate('/buyer/dashboard');
    }
  }, [user, userRole, authLoading, navigate]);

  const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('profile-images').upload(fileName, file, { upsert: true });
      if (uploadError) return null;
      const { data: publicUrl } = supabase.storage.from('profile-images').getPublicUrl(fileName);
      return publicUrl.publicUrl;
    } catch { return null; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Please ensure both passwords match.", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Password Too Short", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }
    if (formData.shortBio.length < 50) {
      toast({ title: "Bio Too Short", description: "Please write at least 50 characters for your bio.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName, 'freelancer', formData.location);
    if (error) {
      let errorMessage = "Registration failed. Please try again.";
      if (error.message.includes('User already registered')) errorMessage = "An account with this email already exists. Please login instead.";
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser) {
      let profileImageUrl: string | null = null;
      if (formData.profileImage) profileImageUrl = await uploadProfileImage(newUser.id, formData.profileImage);

      await (supabase as any).from('profiles').update({
        bio: formData.shortBio,
        professional_title: formData.category,
        languages: formData.languages,
        ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {})
      }).eq('id', newUser.id);

      await (supabase as any).from('freelancers').update({
        bio: formData.shortBio,
        skills: formData.category ? [formData.category] : []
      }).eq('user_id', newUser.id);
    }

    toast({ title: "Registration Successful!", description: "Welcome to FIVESOM! Redirecting to your dashboard..." });
    setIsLoading(false);
    setTimeout(() => navigate('/freelancer/dashboard'), 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFormData(prev => ({ ...prev, profileImage: e.target.files![0] }));
  };

  const addLanguage = (lang: string) => {
    if (!formData.languages.includes(lang) && formData.languages.length < 10) {
      setFormData(prev => ({ ...prev, languages: [...prev.languages, lang] }));
      setLangSearch('');
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }));
  };

  const filteredLanguages = AVAILABLE_LANGUAGES.filter(
    l => l.toLowerCase().includes(langSearch.toLowerCase()) && !formData.languages.includes(l)
  );

  return (
    <>
      <SEO title="Sign Up as a Freelancer | Sell Your Skills on FIVESOM" description="Join FIVESOM free as a freelancer, publish your gigs and get paid securely through escrow with local mobile-money and card payouts." canonical="/register/freelancer" />
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Join as a Freelancer</h1>
            <p className="text-muted-foreground">Create your profile and start offering your services</p>
          </div>

          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName" className="text-foreground font-medium">Full Name *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input id="fullName" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="pl-10 h-12" placeholder="Enter your full name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">Email Address *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className="pl-10 h-12" placeholder="Enter your email" />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password" className="text-foreground font-medium">Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange} className="pl-10 h-12" placeholder="Create a password (min 6 chars)" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange} className="pl-10 h-12" placeholder="Confirm your password" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="category" className="text-foreground font-medium">Primary Skill Category *</Label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input id="category" name="category" required value={formData.category} onChange={handleInputChange} className="pl-10 h-12" placeholder="e.g., Web Development, Graphic Design, Writing" />
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-foreground font-medium">Languages Spoken</Label>
                <p className="text-sm text-muted-foreground mb-2">Select the languages you can communicate in</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.languages.map(lang => (
                    <Badge key={lang} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {lang}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeLanguage(lang)} />
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="pl-10 h-12"
                    placeholder="Search and select languages..."
                  />
                </div>
                {langSearch && filteredLanguages.length > 0 && (
                  <div className="mt-1 border rounded-md bg-popover max-h-40 overflow-y-auto">
                    {filteredLanguages.map(lang => (
                      <button key={lang} type="button" onClick={() => addLanguage(lang)} className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors">
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="shortBio" className="text-foreground font-medium">Professional Bio *</Label>
                <Textarea id="shortBio" name="shortBio" required value={formData.shortBio} onChange={handleInputChange} className="mt-1 min-h-[100px] resize-none" placeholder="Describe your skills, experience, and what makes you unique (minimum 50 characters)" />
                <p className="text-sm text-muted-foreground mt-1">{formData.shortBio.length}/500 characters</p>
              </div>

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
                    {formData.profileImage && <p className="text-sm text-green-600">✓ {formData.profileImage.name}</p>}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-foreground font-medium">Location *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input id="location" name="location" required value={formData.location} onChange={handleInputChange} className="pl-10 h-12" placeholder="City, Country" />
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-12">
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

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreelancerRegister;
