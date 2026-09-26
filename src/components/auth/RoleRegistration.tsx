import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Circle, Eye, EyeOff, Loader2, ShoppingBag, Upload, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AuthShell from '@/components/auth/AuthShell';
import GoogleIcon from '@/components/auth/GoogleIcon';
import { CATEGORIES } from '@/lib/categories';
import { readOnboardingDraft, saveOnboardingDraft, clearOnboardingDraft, type OnboardingRole } from '@/lib/onboardingDraft';
import { saveOnboardingRole } from '@/lib/onboardingRole';
import { compressImage } from '@/lib/imageCompress';
import { authCooldownRemaining, cooldownMessage, recordAuthFailure } from '@/lib/authThrottle';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAccountState } from '@/hooks/useAccountState';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/profile/LanguageSelector';
import { accountLandingPath, parseAccountState } from '@/lib/accountState';
import { notifyMyPhotoChanged } from '@/hooks/useMyPhoto';

const BUYER_INDUSTRIES = [
  'Technology / IT', 'E-commerce / Retail', 'Marketing / Media', 'Local Business',
  'Agency / Consulting', 'Education', 'Healthcare', 'Finance', 'Real Estate',
  'Non-Profit / NGO', 'Personal Project', 'Other',
];

interface RoleRegistrationProps { role: OnboardingRole }

const RoleRegistration = ({ role }: RoleRegistrationProps) => {
  const isFreelancer = role === 'freelancer';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, emailVerified, isLoading: authLoading, refreshRole } = useAuth();
  const { state: accountState, refresh: refreshAccountState } = useAccountState();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [industry, setIndustry] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Choose a photo under 5MB.', variant: 'destructive' });
      return;
    }
    setUploadingPhoto(true);
    try {
      const optimized = await compressImage(file, { maxDimension: 800 });
      setPhotoFile(optimized);
      setPhotoPreview(URL.createObjectURL(optimized));
      // Signed-in accounts upload straight away so the photo is stored against
      // their user id in Supabase Storage, never only in browser memory.
      if (user) {
        const ext = (optimized.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${user.id}/avatar.${ext}`;
        const { error } = await supabase.storage.from('profile-images').upload(path, optimized, { upsert: true, contentType: optimized.type });
        if (error) throw error;
        const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
        setPhotoUrl(`${data.publicUrl}?t=${Date.now()}`);
      }
    } catch (error) {
      toast({ title: 'Photo upload failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setPhotoUrl('');
  };

  /** Uploads a photo picked before authentication, once the account exists. */
  const uploadPendingPhoto = async (userId: string) => {
    if (!photoFile) return photoUrl || '';
    const ext = (photoFile.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from('profile-images').upload(path, photoFile, { upsert: true, contentType: photoFile.type });
    if (error) return photoUrl || '';
    const { data } = supabase.storage.from('profile-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const title = isFreelancer ? 'Create your Freelancer account' : 'Create your Buyer account';
  const subtitle = isFreelancer
    ? 'Build your profile, showcase your skills and start selling on FIVESOM.'
    : 'Find talented freelancers and bring your projects to life.';

  const draft = useMemo(() => readOnboardingDraft(), []);

  useEffect(() => {
    if (draft?.role === role) {
      setFirstName(draft.firstName ?? '');
      setLastName(draft.lastName ?? '');
      setEmail(draft.email ?? '');
      setCountry(draft.country ?? '');
      setProfessionalTitle(draft.professionalTitle ?? '');
      setCategory(draft.category ?? '');
      setBio(draft.bio ?? '');
      setIndustry(draft.industry ?? '');
      setTermsAccepted(Boolean(draft.termsAccepted));
    }
  }, [draft, role]);

  useEffect(() => {
    if (!user) return;
    const fullName = String(user.user_metadata?.full_name || user.user_metadata?.name || '').trim();
    const parts = fullName.split(/\s+/).filter(Boolean);
    setFirstName((current) => current || parts[0] || '');
    setLastName((current) => current || parts.slice(1).join(' '));
    setEmail(user.email ?? '');
  }, [user]);

  // Only a finished account leaves this page for a dashboard. An account that
  // holds a role but never finished the form stays here.
  useEffect(() => {
    if (authLoading || !accountState) return;
    if (accountState.onboardingStatus === 'complete' && accountState.selectedRole) {
      navigate(accountState.selectedRole === 'freelancer' ? '/freelancer/dashboard' : '/buyer/dashboard', { replace: true });
    }
  }, [authLoading, accountState, navigate]);

  // Prefill with what the account already has saved, so a person returning in
  // another browser sees their existing details instead of an empty form.
  useEffect(() => {
    const profile = accountState?.profile;
    if (!profile) return;
    const parts = String(profile.full_name ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length) {
      setFirstName((current) => current || parts[0]);
      setLastName((current) => current || parts.slice(1).join(' '));
    }
    setCountry((current) => current || (profile.location ?? ''));
    setProfessionalTitle((current) => current || (profile.professional_title ?? ''));
    setBio((current) => current || (profile.bio ?? ''));
    setIndustry((current) => current || (profile.industry ?? ''));
    setPhotoUrl((current) => current || (profile.profile_image_url ?? ''));
  }, [accountState]);

  // Languages and the saved photo come from the account, so they survive a
  // logout, a new browser, or a different device.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await (supabase as any)
        .from('profiles')
        .select('languages, profile_image_url')
        .eq('id', user.id)
        .maybeSingle();
      if (!active || !data) return;
      const saved = Array.isArray(data.languages) ? data.languages.filter(Boolean) : [];
      if (saved.length) setLanguages((current) => (current.length ? current : saved));
      if (data.profile_image_url) setPhotoUrl((current) => current || data.profile_image_url);
    })();
    return () => { active = false; };
  }, [user]);

  // Signed in through Google: the account is linked already, so there is no
  // role to change here — the person must finish this form.
  const isGoogleUser = Boolean(
    user && (
      (user.app_metadata as any)?.provider === 'google' ||
      ((user.app_metadata as any)?.providers as string[] | undefined)?.includes('google') ||
      (user as any).identities?.some((identity: any) => identity.provider === 'google')
    ),
  );
  const onboardingIncomplete = Boolean(user) && accountState?.onboardingStatus !== 'complete';

  // Lock the first selected account type in Postgres. This follows the account
  // across browsers and devices, but does not grant Buyer/Freelancer access.
  useEffect(() => {
    if (authLoading || !user || !accountState) return;
    if (accountState.onboardingStatus === 'complete') return;
    let active = true;
    (async () => {
      try {
        const saved = accountState.selectedRole ?? await saveOnboardingRole(role);
        if (active && saved !== role) navigate(`/register/${saved}`, { replace: true });
      } catch (error) {
        if (!active) return;
        toast({
          title: 'Could not save your account type',
          description: error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
      }
    })();
    return () => { active = false; };
  }, [authLoading, user, accountState, role, navigate, toast]);

  const savedProfile = accountState?.profile;
  const displayName = String(
    savedProfile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
  ).trim();
  const filled = (value: string | null | undefined) => Boolean(value && value.trim().length > 0);
  const requiredFields = isFreelancer
    ? [
        { label: 'Full name', done: filled(savedProfile?.full_name) },
        { label: 'Country', done: filled(savedProfile?.location) },
        { label: 'Professional title', done: filled(savedProfile?.professional_title) },
        { label: 'Professional introduction', done: filled(savedProfile?.bio) },
      ]
    : [
        { label: 'Full name', done: filled(savedProfile?.full_name) },
        { label: 'Country', done: filled(savedProfile?.location) },
        { label: 'Industry or hiring context', done: filled(savedProfile?.industry) },
      ];
  const completionPercent = Math.round(
    (requiredFields.filter((field) => field.done).length / requiredFields.length) * 100,
  );

  const currentDraft = () => ({
    role, firstName, lastName, email, country, professionalTitle, category, bio, industry, termsAccepted,
  });

  // Each rule names the single field that still needs attention, so the person
  // is never told to fix something they already filled in.
  const validate = () => {
    if (firstName.trim().length < 2 || lastName.trim().length < 2) return 'Enter your first and last name.';
    if (!country.trim()) return 'Add the country you work from.';
    if (!user && !email.trim()) return 'Enter the email address for your account.';
    if (!user && password.length < 8) return 'Choose a password with at least 8 characters.';
    if (isFreelancer) {
      if (!professionalTitle.trim()) return 'Add your professional title, for example “Brand Designer”.';
      if (!category) return 'Open “Primary skill” and choose the service you offer.';
      if (bio.trim().length < 50) {
        return `Your professional introduction needs at least 50 characters — ${50 - bio.trim().length} to go.`;
      }
    }
    if (!isFreelancer && !industry) return 'Choose your industry or hiring context.';
    if (!languages.length) return 'Add at least one language you speak.';
    if (!termsAccepted) return 'Accept the Terms of Service and Privacy Policy to continue.';
    return null;
  };

  const handleGoogle = async () => {
    saveOnboardingDraft(currentDraft());
    setAuthIntent('signup');
    setGoogleLoading(true);
    try {
      const redirectTo = new URL('/auth/callback', window.location.origin).toString();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' }, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Google did not return a valid sign-in URL.');
      window.location.assign(data.url);
    } catch (error) {
      setGoogleLoading(false);
      toast({ title: 'Google sign-up failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    }
  };

  const completeProfile = async (activeUserId?: string) => {
    const userId = activeUserId ?? user?.id;
    if (!userId) return;
    if (!activeUserId && !emailVerified) {
      saveOnboardingDraft(currentDraft());
      navigate('/verify-email');
      return;
    }

    const savedPhoto = await uploadPendingPhoto(userId);

    // One database call saves the role, profile, languages, photo and the
    // matching freelancer/buyer record together. Either everything is saved or
    // nothing is, so an account is never left half-created.
    const { data, error } = await (supabase as any).rpc('complete_role_onboarding', {
      _role: role,
      _full_name: `${firstName.trim()} ${lastName.trim()}`,
      _country: country.trim(),
      _languages: languages,
      _profile_image_url: (savedPhoto || photoUrl || '').split('?')[0] || null,
      _professional_title: isFreelancer ? professionalTitle.trim() : null,
      _bio: isFreelancer ? bio.trim() : null,
      _primary_skill: isFreelancer ? category : null,
      _industry: isFreelancer ? null : industry,
    });
    if (error) throw error;

    const completedState = parseAccountState(data);
    if (completedState.onboardingStatus !== 'complete' || completedState.selectedRole !== role) {
      throw new Error('Your saved account could not be confirmed. Please try again.');
    }

    const { data: authResult, error: authError } = await supabase.auth.getUser();
    if (authError || authResult.user?.id !== userId) {
      throw new Error('Your session could not be confirmed. Please sign in again.');
    }

    clearOnboardingDraft();
    // Re-read the saved account from the database before leaving, so the guard
    // on the dashboard sees the finished state instead of a stale one.
    await Promise.all([refreshRole(), refreshAccountState().catch(() => undefined)]);
    notifyMyPhotoChanged(completedState.profile.profile_image_url);
    navigate(accountLandingPath(completedState), { replace: true });
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      toast({ title: 'Complete the required fields', description: validation, variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      if (user) {
        await completeProfile();
        return;
      }

      const wait = authCooldownRemaining('signup', email);
      if (wait > 0) throw new Error(cooldownMessage(wait));
      recordAuthFailure('signup', email);
      saveOnboardingDraft(currentDraft());
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: {
          emailRedirectTo: new URL('/auth/callback', window.location.origin).toString(),
          data: { full_name: `${firstName.trim()} ${lastName.trim()}` },
        },
      });
      if (error) throw error;
      if (data.session?.user) {
        await completeProfile(data.session.user.id);
      } else {
        await supabase.functions.invoke('send-verification-email', {
          body: { email: email.trim(), redirect_to: new URL('/auth/callback', window.location.origin).toString() },
        });
        setCheckEmail(true);
      }
    } catch (error) {
      toast({
        title: user ? 'Could not finish your setup' : 'Could not create your account',
        description: error instanceof Error ? error.message : 'Please review your information and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkEmail) {
    return (
      <AuthShell eyebrow="One final security step" title="Confirm your email" description="Your chosen role and form details are saved in this browser until you confirm your identity.">
        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <p className="text-sm font-semibold text-primary">Verification sent</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Check your inbox</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Open the confirmation link sent to <span className="font-semibold text-foreground">{email.trim()}</span>. You will return here to finish your {role} account.</p>
          <Button asChild className="mt-7 w-full"><Link to="/login">Return to sign in</Link></Button>
        </div>
      </AuthShell>
    );
  }

  const RoleIcon = isFreelancer ? BriefcaseBusiness : ShoppingBag;
  return (
    <AuthShell
      eyebrow={isFreelancer ? 'Sell your skills' : 'Hire with confidence'}
      title={isFreelancer ? 'Turn your expertise into opportunity.' : 'Bring your next project to life.'}
      description={isFreelancer ? 'Create a trusted professional presence and connect with clients who value your work.' : 'Find skilled professionals, manage work clearly, and pay securely through FIVESOM.'}
      benefits={isFreelancer ? ['Showcase your professional skills', 'Create services clients can discover', 'Earn through secure orders'] : ['Discover skilled professionals', 'Hire with escrow protection', 'Manage projects in one place']}
    >
      <div className="mb-7 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><RoleIcon className="h-6 w-6" /></span>
        <div>
          <p className="text-sm font-semibold text-primary">{isFreelancer ? 'Freelancer selected' : 'Buyer selected'}</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {user && onboardingIncomplete && (
        <div className="mb-7 animate-fade-in rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {accountState?.profile.profile_image_url ? (
                <img src={accountState.profile.profile_image_url} alt={displayName ? `${displayName} profile photo` : 'Your profile photo'} className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-7 w-7" />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold text-foreground">{displayName || 'Your Fivesom account'}</p>
              <p className="truncate text-sm text-muted-foreground">{accountState?.profile.email || user.email} · {isFreelancer ? 'Freelancer' : 'Buyer'}</p>
            </div>
            <span className="ml-auto shrink-0 text-right">
              <span className="block font-heading text-xl font-bold text-primary">{completionPercent}%</span>
              <span className="block text-xs text-muted-foreground">complete</span>
            </span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
            <span className="block h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPercent}%` }} />
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground">Your account exists — finish setting up your profile.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {requiredFields.map((field) => (
              <li key={field.label} className="flex items-center gap-3">
                {field.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className={field.done ? 'text-muted-foreground' : 'font-medium text-foreground'}>{field.label}</span>
                {!field.done && <span className="ml-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missing</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!user && (
        <>
          <Button type="button" variant="outline" className="h-12 w-full bg-card font-semibold" onClick={handleGoogle} disabled={googleLoading || submitting}>

            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><GoogleIcon /><span className="ml-3">Continue with Google</span></>}
          </Button>
          <div className="relative my-6 flex items-center justify-center"><div className="absolute inset-x-0 border-t border-border" /><span className="relative bg-background px-4 text-xs font-semibold text-muted-foreground">OR</span></div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor={`${role}-firstName`}>First name</Label><Input id={`${role}-firstName`} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} autoComplete="given-name" required /></div>
          <div className="space-y-2"><Label htmlFor={`${role}-lastName`}>Last name</Label><Input id={`${role}-lastName`} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} autoComplete="family-name" required /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor={`${role}-email`}>Email</Label><Input id={`${role}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={Boolean(user)} autoComplete="email" required /></div>
          <div className="space-y-2"><Label htmlFor={`${role}-country`}>Country</Label><Input id={`${role}-country`} value={country} onChange={(e) => setCountry(e.target.value)} maxLength={120} placeholder="e.g. Somalia" autoComplete="country-name" required /></div>
        </div>
        {!user && (
          <div className="space-y-2"><Label htmlFor={`${role}-password`}>Password</Label><div className="relative"><Input id={`${role}-password`} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={72} autoComplete="new-password" required className="pr-11" /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div><p className="text-xs text-muted-foreground">Use at least 8 characters.</p></div>
        )}

        {isFreelancer ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="professionalTitle">Professional title</Label><Input id="professionalTitle" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} maxLength={100} placeholder="e.g. Brand Designer" required /></div>
              <div className="space-y-2"><Label htmlFor="category">Primary skill</Label><Select value={category} onValueChange={setCategory} required><SelectTrigger id="category"><SelectValue placeholder="Choose a skill" /></SelectTrigger><SelectContent>{CATEGORIES.map((item) => <SelectItem key={item.slug} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label htmlFor="bio">Professional introduction</Label><Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} minLength={50} maxLength={500} className="min-h-28 resize-none" placeholder="Describe your experience, strengths, and the work you deliver." required /><p className="text-right text-xs text-muted-foreground">{bio.length}/500</p></div>
          </>
        ) : (
          <div className="space-y-2"><Label htmlFor="industry">Industry or hiring context</Label><Select value={industry} onValueChange={setIndustry} required><SelectTrigger id="industry"><SelectValue placeholder="What best describes you?" /></SelectTrigger><SelectContent>{BUYER_INDUSTRIES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
        )}

        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <Label className="text-sm font-semibold text-foreground">Profile photo</Label>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
              {photoPreview || photoUrl ? (
                <img src={photoPreview || photoUrl} alt="Your profile photo preview" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-8 w-8" />
              )}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                {uploadingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {photoPreview || photoUrl ? 'Replace photo' : 'Upload photo'}
              </Button>
              {(photoPreview || photoUrl) && (
                <Button type="button" variant="ghost" size="sm" onClick={clearPhoto}><X className="mr-2 h-4 w-4" />Remove</Button>
              )}
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">A clear photo helps clients trust your profile. JPG or PNG, up to 5MB.</p>
        </div>

        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <Label htmlFor={`${role}-languages`} className="text-sm font-semibold text-foreground">Languages you speak</Label>
          <LanguageSelector id={`${role}-languages`} value={languages} onChange={setLanguages} />
        </div>


        <div className="flex items-start gap-3 rounded-md border border-border bg-card p-4">
          <Checkbox id={`${role}-terms`} checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-0.5" />
          <Label htmlFor={`${role}-terms`} className="text-sm font-normal leading-6 text-muted-foreground">I agree to the <Link to="/legal/terms" className="font-semibold text-primary hover:underline">Terms of Service</Link> and <Link to="/legal/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>.</Label>
        </div>

        <Button type="submit" className="h-12 w-full font-semibold" disabled={submitting || googleLoading || authLoading}>{submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{user ? `Complete ${isFreelancer ? 'Freelancer' : 'Buyer'} setup` : 'Create my account'}<ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
      </form>

      <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-border pt-5 text-sm sm:flex-row">
        {user ? (
          <p className="text-muted-foreground">Finish this form to activate your {isFreelancer ? 'Freelancer' : 'Buyer'} account.</p>
        ) : (
          <Button variant="ghost" asChild className="px-0 text-muted-foreground"><Link to="/register"><ArrowLeft className="mr-2 h-4 w-4" />Change role</Link></Button>
        )}
        <p className="text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
      </div>
    </AuthShell>
  );
};

export default RoleRegistration;