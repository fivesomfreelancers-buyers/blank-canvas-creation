import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck, CheckCircle, Clock, Lock, Camera, ChevronLeft, ChevronRight,
  Briefcase, GraduationCap, Wrench, Image as ImageIcon, Video, X, Plus, Search,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BlueTickApply from '@/components/freelancer/BlueTickApply';
import ToolIcon from '@/components/ToolIcon';
import { FREELANCER_PUBLIC_COLUMNS } from '@/lib/freelancerEarnings';
import {
  CATEGORIES, SOFTWARE_CATALOG, EXPERIENCE_OPTIONS, EDUCATION_OPTIONS, toolsForCategories, searchTools, SoftwareDef,
} from '@/lib/verificationCatalog';

type Status = 'none' | 'pending' | 'approved' | 'rejected';

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Camera },
  { id: 2, name: 'Skills', icon: Briefcase },
  { id: 3, name: 'Portfolio', icon: ImageIcon },
  { id: 4, name: 'Experience', icon: Briefcase },
  { id: 5, name: 'Education', icon: GraduationCap },
  { id: 6, name: 'Software', icon: Wrench },
];

const FreelancerVerify: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>('none');
  const [completedOrders, setCompletedOrders] = useState(0);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string>('');
  const [freelancerId, setFreelancerId] = useState<string>('');

  // Step 1
  const [fullName, setFullName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [location, setLocation] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [languageInput, setLanguageInput] = useState('');
  const [bio, setBio] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  // Step 3
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioVideo, setPortfolioVideo] = useState<File | null>(null);

  // Step 4 & 5
  const [yearsExperience, setYearsExperience] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  // Step 6
  const [selectedTools, setSelectedTools] = useState<SoftwareDef[]>([]);
  const [toolSearch, setToolSearch] = useState('');
  const [showAllTools, setShowAllTools] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const [{ data: profile }, { data: freelancer }, { data: vDoc }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, profile_image_url, bio, professional_title, location, skills, languages, industry, member_since, last_seen, created_at, role').eq('id', user.id).maybeSingle(),
        supabase.from('freelancers').select(FREELANCER_PUBLIC_COLUMNS).eq('user_id', user.id).maybeSingle(),
        supabase.from('verification_documents').select('status').eq('user_id', user.id)
          .order('submitted_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      if (profile) {
        setFullName(profile.full_name || '');
        setProfileImageUrl(profile.profile_image_url || '');
        setLocation(profile.location || '');
        setProfessionalTitle((profile as any).professional_title || '');
        setLanguages((profile as any).languages || []);
        setBio((profile as any).bio || '');
      }
      if (freelancer) {
        setFreelancerId(freelancer.id);
        setBio(freelancer.bio || bio);
        setYearsExperience((freelancer as any).years_experience || '');
        setEducationLevel((freelancer as any).education_level || '');
        const tools = (freelancer as any).software_tools as SoftwareDef[] | null;
        if (Array.isArray(tools)) setSelectedTools(tools);
        if (freelancer.is_verified) {
          setStatus('approved');
        } else if (vDoc?.status && vDoc.status !== 'approved') {
          setStatus(vDoc.status as Status);
        }
      }

      // Gating: count completed orders
      if (freelancer?.id) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('freelancer_id', freelancer.id)
          .eq('status', 'completed');
        setCompletedOrders(count || 0);
      }

      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadProfilePhoto = async (file: File) => {
    const path = `${userId}/avatar-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return; }
    const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
    setProfileImageUrl(data.publicUrl);
    await supabase.from('profiles').update({ profile_image_url: data.publicUrl }).eq('id', userId);
  };

  const addLanguage = () => {
    const v = languageInput.trim();
    if (!v || languages.includes(v)) return;
    setLanguages([...languages, v]);
    setLanguageInput('');
  };

  const toggleSub = (s: string) => {
    setSelectedSubs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const onPortfolioImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    const next = [...portfolioImages, ...files].slice(0, 3);
    setPortfolioImages(next);
  };

  const onPortfolioVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast({ title: 'Invalid file', description: 'Please upload a video file.', variant: 'destructive' });
      return;
    }
    // duration check
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (v.duration > 65) {
        toast({ title: 'Video too long', description: 'Portfolio video must be 1 minute or less.', variant: 'destructive' });
        return;
      }
      setPortfolioVideo(file);
    };
  };

  const toggleTool = (t: SoftwareDef) => {
    setSelectedTools(prev =>
      prev.find(x => x.slug === t.slug) ? prev.filter(x => x.slug !== t.slug) : [...prev, t]
    );
  };

  // Tools -> Skills -> Categories: suggest the software used in the chosen category first.
  const categoryTools = React.useMemo(
    () => (showAllTools ? SOFTWARE_CATALOG : toolsForCategories(selectedCategory ? [selectedCategory] : [])),
    [selectedCategory, showAllTools],
  );
  const filteredTools = React.useMemo(() => searchTools(categoryTools, toolSearch), [categoryTools, toolSearch]);

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      if (!fullName.trim() || !location.trim() || !professionalTitle.trim()) {
        toast({ title: 'Missing info', description: 'Fill name, professional title and location.', variant: 'destructive' });
        return false;
      }
    }
    if (s === 2 && selectedSubs.length === 0) {
      toast({ title: 'Pick at least one skill', variant: 'destructive' }); return false;
    }
    if (s === 3) {
      if (portfolioImages.length < 3) {
        toast({ title: 'Need 3 portfolio images', variant: 'destructive' }); return false;
      }
      if (!portfolioVideo) {
        toast({ title: 'Need 1 portfolio video (max 1 min)', variant: 'destructive' }); return false;
      }
    }
    if (s === 4 && !yearsExperience) {
      toast({ title: 'Select your experience', variant: 'destructive' }); return false;
    }
    if (s === 5 && !educationLevel) {
      toast({ title: 'Select your education level', variant: 'destructive' }); return false;
    }
    if (s === 6 && selectedTools.length === 0) {
      toast({ title: 'Add at least one software/tool', variant: 'destructive' }); return false;
    }
    return true;
  };

  const next = () => { if (validateStep(step)) setStep(s => Math.min(6, s + 1)); };
  const prev = () => setStep(s => Math.max(1, s - 1));

  const submit = async () => {
    if (!validateStep(6)) return;
    setSubmitting(true);
    try {
      // 1. Update profile
      await supabase.from('profiles').update({
        full_name: fullName,
        location,
        languages,
        bio,
        professional_title: professionalTitle,
        profile_image_url: profileImageUrl,
      } as any).eq('id', userId);

      // 2. Update freelancer
      const skills = selectedSubs;
      await supabase.from('freelancers').update({
        bio,
        skills,
        years_experience: yearsExperience,
        education_level: educationLevel,
        software_tools: selectedTools as any,
        professional_title: professionalTitle,
      } as any).eq('user_id', userId);

      // 3. Upload portfolio
      const portfolioRows: { freelancer_id: string; media_url: string; media_type: 'image'|'video'; position: number }[] = [];
      // clear existing portfolio for this freelancer to avoid duplicates on resubmit
      await (supabase as any).from('freelancer_portfolio').delete().eq('freelancer_id', freelancerId);

      for (let i = 0; i < portfolioImages.length; i++) {
        const f = portfolioImages[i];
        const path = `${userId}/portfolio-${Date.now()}-${i}-${f.name}`;
        const { error } = await supabase.storage.from('verification-portfolio').upload(path, f);
        if (!error) {
          const { data } = supabase.storage.from('verification-portfolio').getPublicUrl(path);
          portfolioRows.push({ freelancer_id: freelancerId, media_url: data.publicUrl, media_type: 'image', position: i });
        }
      }
      if (portfolioVideo) {
        const path = `${userId}/portfolio-video-${Date.now()}-${portfolioVideo.name}`;
        const { error } = await supabase.storage.from('verification-portfolio').upload(path, portfolioVideo);
        if (!error) {
          const { data } = supabase.storage.from('verification-portfolio').getPublicUrl(path);
          portfolioRows.push({ freelancer_id: freelancerId, media_url: data.publicUrl, media_type: 'video', position: 99 });
        }
      }
      if (portfolioRows.length > 0) {
        await (supabase as any).from('freelancer_portfolio').insert(portfolioRows);
      }

      // 4. Create verification request
      await supabase.from('verification_documents').insert({
        user_id: userId,
        document_type: 'id',
        document_url: profileImageUrl || 'profile-verification',
        status: 'pending',
        professional_info: {
          professional_title: professionalTitle,
          category: selectedCategory,
          skills,
          years_experience: yearsExperience,
          education_level: educationLevel,
          software_tools: selectedTools,
        },
        personal_info: { full_name: fullName, location, languages },
      } as any);

      setStatus('pending');
      toast({ title: '✅ Submitted', description: 'Your verification is under review (24h).' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Submission failed', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen p-6 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  // ====== Locked / status screens ======
  if (status === 'approved') {
    return (
      <div className="min-h-screen p-4 sm:p-6 bg-background">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-12 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">You're Verified ✓</h2>
              <p className="text-muted-foreground max-w-md">Your profile shows a verified badge to all buyers.</p>
            </CardContent>
          </Card>
          <BlueTickApply userId={userId} freelancerId={freelancerId} />
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen p-4 sm:p-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="py-12 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-600">Under Review</h2>
              <p className="text-muted-foreground max-w-md">
                Our admin team is reviewing your application. You'll get a result within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (completedOrders < 1) {
    return (
      <div className="min-h-screen p-4 sm:p-6 bg-background">
        <div className="max-w-3xl mx-auto">
          <Card className="border-muted">
            <CardContent className="py-12 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold">Verification Locked</h2>
              <p className="text-muted-foreground max-w-md">
                Complete at least <strong>1 order</strong> on Fivesom to unlock the verification application.
                This keeps the platform trusted and protects buyers.
              </p>
              <Badge variant="outline" className="mt-2">Completed Orders: {completedOrders} / 1</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ====== Wizard ======
  const progress = (step / 6) * 100;

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold">Become a Verified Freelancer</h1>
          </div>
          <p className="text-muted-foreground text-sm">Complete all 6 sections to submit your verification.</p>
        </div>

        {/* Progress + step pills */}
        <div className="mb-8">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
            {STEPS.map(s => {
              const Active = s.id === step;
              const Done = s.id < step;
              return (
                <div
                  key={s.id}
                  className={`text-center p-2 rounded-lg border text-xs transition-colors ${
                    Active ? 'border-primary bg-primary/10 text-primary' :
                    Done ? 'border-green-500/30 bg-green-500/10 text-green-600' :
                    'border-muted text-muted-foreground'
                  }`}
                >
                  <s.icon className="w-4 h-4 mx-auto mb-1" />
                  <div className="font-medium">{s.id}. {s.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step - 1].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profileImageUrl} className="object-cover" />
                    <AvatarFallback>{fullName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      ref={photoInputRef} type="file" accept="image/*" hidden
                      onChange={(e) => e.target.files?.[0] && uploadProfilePhoto(e.target.files[0])}
                    />
                    <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                      <Camera className="w-4 h-4 mr-2" /> Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 5MB.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Professional Title *</Label>
                    <Input value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g. UI/UX Designer" />
                  </div>
                  <div>
                    <Label>Location *</Label>
                    <Input value={location} onChange={(e) => setLocation(e.target.value)}
                      placeholder="Mogadishu, Somalia" />
                  </div>
                  <div>
                    <Label>Languages</Label>
                    <div className="flex gap-2">
                      <Input value={languageInput} onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                        placeholder="Somali, English..." />
                      <Button type="button" variant="outline" size="icon" onClick={addLanguage}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {languages.map(l => (
                        <Badge key={l} variant="secondary" className="gap-1">
                          {l}
                          <button onClick={() => setLanguages(languages.filter(x => x !== l))}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>About / Bio</Label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                    placeholder="Introduce yourself to buyers..." />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={selectedCategory} onValueChange={(v) => { setSelectedCategory(v); setSelectedSubs([]); }}>
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCategory && (
                  <div>
                    <Label className="mb-2 block">Skills (pick all that apply)</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.find(c => c.id === selectedCategory)?.subcategories.map(sub => {
                        const active = selectedSubs.includes(sub);
                        return (
                          <button key={sub} type="button" onClick={() => toggleSub(sub)}
                            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                              active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                            }`}>
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedSubs.length > 0 && (
                  <p className="text-xs text-muted-foreground">{selectedSubs.length} skill(s) selected</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Portfolio Images (3 required)</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
                        {portfolioImages[i] ? (
                          <div className="relative w-full h-full group">
                            <img src={URL.createObjectURL(portfolioImages[i])} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setPortfolioImages(portfolioImages.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  {portfolioImages.length < 3 && (
                    <label className="mt-3 inline-flex items-center gap-2 text-sm cursor-pointer text-primary hover:underline">
                      <Plus className="w-4 h-4" /> Add image(s)
                      <input type="file" accept="image/*" multiple hidden onChange={onPortfolioImages} />
                    </label>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">Portfolio Video (1 required, max 1 min)</Label>
                  <div className="aspect-video rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
                    {portfolioVideo ? (
                      <div className="relative w-full h-full">
                        <video src={URL.createObjectURL(portfolioVideo)} controls className="w-full h-full" />
                        <button onClick={() => setPortfolioVideo(null)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 rounded-full">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                        <Video className="w-10 h-10" />
                        <span className="text-sm">Click to upload video</span>
                        <input type="file" accept="video/*" hidden onChange={onPortfolioVideo} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <Label>Years of Experience *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {EXPERIENCE_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => setYearsExperience(opt)}
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        yearsExperience === opt ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:bg-accent'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <Label>Education Level *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {EDUCATION_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => setEducationLevel(opt)}
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        educationLevel === opt ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border hover:bg-accent'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={toolSearch} onChange={(e) => setToolSearch(e.target.value)}
                    placeholder="Search software/tools..." className="pl-10" />
                </div>
                {selectedTools.length > 0 && (
                  <div>
                    <Label className="text-xs mb-2 block">Selected ({selectedTools.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTools.map(t => (
                        <Badge key={t.slug} variant="secondary" className="gap-1.5 py-1 pr-1">
                          <ToolIcon slug={t.slug} name={t.name} className="w-4 h-4" />
                          {t.name}
                          <button onClick={() => toggleTool(t)}><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {showAllTools
                      ? 'Showing every tool on FIVESOM.'
                      : `Recommended tools for ${CATEGORIES.find(c => c.id === selectedCategory)?.name || 'your category'}.`}
                  </p>
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
                    onClick={() => setShowAllTools(v => !v)}>
                    {showAllTools ? 'Show category tools' : 'Show all tools'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-1">
                  {filteredTools.map(t => {
                    const active = !!selectedTools.find(x => x.slug === t.slug);
                    return (
                      <button key={t.slug} type="button" onClick={() => toggleTool(t)}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-sm transition-colors ${
                          active ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'
                        }`}>
                        <ToolIcon slug={t.slug} name={t.name} className="w-5 h-5" />
                        <span className="truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={prev} disabled={step === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {step < 6 ? (
                <Button onClick={next}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
              ) : (
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerVerify;
