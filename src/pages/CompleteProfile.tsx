import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, MapPin, Briefcase, Globe, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

const AVAILABLE_LANGUAGES = [
  'English', 'Somali', 'Arabic', 'Italian', 'French', 'Spanish', 'German',
  'Portuguese', 'Turkish', 'Swahili', 'Amharic', 'Hindi', 'Urdu', 'Chinese',
  'Japanese', 'Korean', 'Russian', 'Dutch', 'Swedish', 'Norwegian'
];

const CompleteProfile = () => {
  const { role } = useParams<{ role: string }>();
  const isFreelancer = role === 'freelancer';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    professionalTitle: '',
    bio: '',
    location: '',
    languages: [] as string[],
    profileImage: null as File | null,
  });
  const [langSearch, setLangSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingAvatar, setExistingAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
      }));
      setExistingAvatar(user.user_metadata?.avatar_url || null);
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    let profileImageUrl = existingAvatar;

    // Upload profile image if new one selected
    if (formData.profileImage) {
      const fileExt = formData.profileImage.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, formData.profileImage, { upsert: true });

      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from('profile-images').getPublicUrl(fileName);
        profileImageUrl = publicUrl.publicUrl;
      }
    }

    // Update profile
    await supabase.from('profiles').update({
      full_name: formData.fullName,
      professional_title: formData.professionalTitle || null,
      bio: formData.bio || null,
      location: formData.location || null,
      languages: formData.languages,
      ...(profileImageUrl ? { profile_image_url: profileImageUrl } : {}),
    }).eq('id', user.id);

    // Update freelancer record if applicable
    if (isFreelancer) {
      await (supabase as any).from('freelancers').update({
        bio: formData.bio || null,
        skills: formData.professionalTitle ? [formData.professionalTitle] : [],
      }).eq('user_id', user.id);
    }

    toast({ title: 'Profile Complete!', description: 'Your profile has been set up successfully.' });
    setIsLoading(false);

    if (isFreelancer) {
      navigate('/freelancer/dashboard');
    } else {
      navigate('/buyer/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({ ...prev, profileImage: e.target.files![0] }));
    }
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

  const initials = formData.fullName
    ? formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4 pt-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              {isFreelancer
                ? 'Set up your freelancer profile to start offering services'
                : 'Complete your profile to start hiring freelancers'}
            </p>
          </div>

          <div className="bg-card/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
            {/* Avatar preview */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  {formData.profileImage ? (
                    <AvatarImage src={URL.createObjectURL(formData.profileImage)} alt="Preview" className="object-cover" />
                  ) : existingAvatar ? (
                    <AvatarImage src={existingAvatar} alt="Google avatar" className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input id="profileImage" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-foreground font-medium">Full Name *</Label>
                <Input id="fullName" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="mt-1 h-12" placeholder="Your full name" />
              </div>

              {isFreelancer && (
                <div>
                  <Label htmlFor="professionalTitle" className="text-foreground font-medium">Professional Title *</Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input id="professionalTitle" name="professionalTitle" required value={formData.professionalTitle} onChange={handleInputChange} className="pl-10 h-12" placeholder="e.g., Web Developer, Graphic Designer" />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="bio" className="text-foreground font-medium">
                  {isFreelancer ? 'Professional Bio' : 'About You'} {isFreelancer && '*'}
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  required={isFreelancer}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="mt-1 min-h-[100px] resize-none"
                  placeholder={isFreelancer ? 'Describe your skills, experience, and what makes you unique (min 50 characters)' : 'Tell us a bit about yourself'}
                />
                {isFreelancer && <p className="text-sm text-muted-foreground mt-1">{formData.bio.length}/500 characters</p>}
              </div>

              <div>
                <Label htmlFor="location" className="text-foreground font-medium">Location</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input id="location" name="location" value={formData.location} onChange={handleInputChange} className="pl-10 h-12" placeholder="City, Country" />
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-foreground font-medium">Languages Spoken</Label>
                <div className="flex flex-wrap gap-2 my-2">
                  {formData.languages.map(lang => (
                    <Badge key={lang} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {lang}
                      <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeLanguage(lang)} />
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input value={langSearch} onChange={(e) => setLangSearch(e.target.value)} className="pl-10 h-12" placeholder="Search and select languages..." />
                </div>
                {langSearch && filteredLanguages.length > 0 && (
                  <div className="mt-1 border border-border rounded-md bg-popover max-h-40 overflow-y-auto">
                    {filteredLanguages.map(lang => (
                      <button key={lang} type="button" onClick={() => addLanguage(lang)} className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors">
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full h-12">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Profile</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => navigate(isFreelancer ? '/freelancer/dashboard' : '/buyer/dashboard')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip for now →
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteProfile;
