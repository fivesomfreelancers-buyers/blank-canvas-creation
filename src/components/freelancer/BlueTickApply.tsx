import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, ArrowRight, Camera, CheckCircle2, Clock, Loader2, RotateCcw,
  ScanFace, Send, ShieldCheck, Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import BlueTickBadge from '@/components/BlueTickBadge';
import { useBlueTickEligibility } from '@/hooks/useBlueTickEligibility';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface Props { userId: string; freelancerId?: string }

/** The 9 official FIVESOM service categories — the only allowed specialties. */
const SPECIALTY_OPTIONS = CATEGORIES.map((c) => c.name);

const SOCIAL_FIELDS = [
  { key: 'website', label: 'Website' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'linkedin', label: 'LinkedIn' },
] as const;

type SocialKey = typeof SOCIAL_FIELDS[number]['key'];

const ID_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID card' },
  { value: 'driving_licence', label: 'Driving licence' },
] as const;

const EXPERIENCE_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '6–10 years', 'More than 10 years'];

const STEPS = [
  { n: 1, title: 'Professional Information' },
  { n: 2, title: 'Identity Information' },
  { n: 3, title: 'Face Verification' },
];

const Stepper: React.FC<{ step: number; done: boolean[] }> = ({ step, done }) => (
  <div className="space-y-2">
    <div className="flex items-center">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
              done[i] ? 'bg-emerald-500 border-emerald-500 text-white'
                : step === s.n ? 'border-[#1d9bf0] bg-[#1d9bf0]/15 text-[#1d9bf0]'
                  : 'border-border text-muted-foreground')}>
              {done[i] ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={cn('text-[10px] sm:text-[11px] text-center max-w-[86px] leading-tight',
              step === s.n ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              {s.title}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn('h-0.5 flex-1 mx-1 sm:mx-2 -mt-5 rounded-full', done[i] ? 'bg-emerald-500' : 'bg-border')} />
          )}
        </React.Fragment>
      ))}
    </div>
    <p className="text-xs text-center text-muted-foreground">Step {step} of 3</p>
  </div>
);

const BlueTickApply: React.FC<Props> = ({ userId }) => {
  const { eligibility: e, application, loading, refresh } = useBlueTickEligibility(userId);

  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);

  const [experience, setExperience] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [social, setSocial] = useState<Record<SocialKey, string>>({ website: '', instagram: '', facebook: '', tiktok: '', linkedin: '' });
  const [idType, setIdType] = useState('');
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Live camera (face verification)
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!application || hydrated) return;
    setExperience(application.experience || '');
    setProjectSummary(application.project_summary || '');
    setSpecialties(application.specialties || []);
    const s = (application.social_links || {}) as Record<string, string>;
    setSocial({ website: s.website || '', instagram: s.instagram || '', facebook: s.facebook || '', tiktok: s.tiktok || '', linkedin: s.linkedin || '' });
    const a = application as any;
    setYearsExperience(a.years_experience || '');
    setIdType(a.id_type || '');
    setIdFront(a.id_front_url || null);
    setIdBack(a.id_back_url || null);
    setSelfie(a.selfie_url || null);
    setStep(Math.min(3, Math.max(1, a.current_step || 1)));
    setHydrated(true);
  }, [application, hydrated]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };
  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
      });
    } catch {
      toast.error('Camera access was blocked. Allow the camera, or upload a photo instead.');
    }
  };

  const captureFace = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.9));
    if (!blob) return;
    stopCamera();
    await upload('selfie', new File([blob], 'face-check.jpg', { type: 'image/jpeg' }));
  };

  const toggleSpecialty = (name: string) =>
    setSpecialties((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  const socialPayload = () => Object.fromEntries(Object.entries(social).filter(([, v]) => v.trim()));

  const persist = async (extra?: { id_front?: string | null; id_back?: string | null; selfie?: string | null; step?: number }) => {
    const { data, error } = await (supabase as any).rpc('save_blue_tick_application_draft', {
      _experience: experience.trim() || null,
      _specialties: specialties,
      _project_summary: projectSummary.trim() || null,
      _social_links: socialPayload(),
      _id_front_url: extra?.id_front ?? idFront,
      _id_back_url: extra?.id_back ?? idBack,
      _selfie_url: extra?.selfie ?? selfie,
      _id_type: idType || null,
      _years_experience: yearsExperience || null,
      _current_step: extra?.step ?? step,
    });
    if (error) throw new Error(error.message);
    return data as string;
  };

  const upload = async (kind: 'id_front' | 'id_back' | 'selfie', file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file');
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be smaller than 10MB');
    setUploading(kind);
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${userId}/blue-tick/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('verification-docs').upload(path, file, { upsert: true });
      if (upErr) throw new Error(upErr.message);
      const { data } = supabase.storage.from('verification-docs').getPublicUrl(path);
      const url = data.publicUrl;
      if (kind === 'id_front') setIdFront(url);
      if (kind === 'id_back') setIdBack(url);
      if (kind === 'selfie') setSelfie(url);
      setPreviews((p) => ({ ...p, [kind]: URL.createObjectURL(file) }));
      await persist({ [kind === 'id_front' ? 'id_front' : kind === 'id_back' ? 'id_back' : 'selfie']: url } as any);
      toast.success('Photo saved securely');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const step1Done = specialties.length > 0 && projectSummary.trim().length >= 30 && !!yearsExperience;
  const step2Done = !!idType && !!idFront && !!idBack;
  const step3Done = !!selfie;
  const stepsDone = [step1Done, step2Done, step3Done];
  const completedCount = stepsDone.filter(Boolean).length;
  const allSteps = completedCount === 3;

  const goNext = async () => {
    if (step === 1 && !step1Done) {
      return toast.error('Add your specialties, years of experience and a summary of at least 30 characters.');
    }
    if (step === 2 && !step2Done) {
      return toast.error('Choose your ID type and add both the front and back photos.');
    }
    setSaving(true);
    try {
      await persist({ step: step + 1 });
      setStep(step + 1);
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Could not save your progress');
    } finally {
      setSaving(false);
    }
  };

  const goBack = async () => {
    stopCamera();
    const target = Math.max(1, step - 1);
    setStep(target);
    try { await persist({ step: target }); } catch { /* progress is saved on next action */ }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const appId = await persist({ step: 3 });
      const { error } = await (supabase as any).rpc('submit_blue_tick_application', { _application_id: appId });
      if (error) throw new Error(error.message);
      toast.success('Application sent — our team reviews it within 3 days');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Could not submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !e) {
    return <Card><CardContent className="py-8 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</CardContent></Card>;
  }

  if (e.has_blue_tick) {
    return (
      <Card className="border-[#1d9bf0]/40 bg-[#1d9bf0]/5">
        <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
          <BlueTickBadge size="lg" />
          <h3 className="text-xl font-bold text-[#1d9bf0]">You have the Blue Tick</h3>
          <p className="text-sm text-muted-foreground max-w-md">Your badge is live across FIVESOM — on your profile, your gigs and in search results.</p>
        </CardContent>
      </Card>
    );
  }

  if (application?.status === 'pending') {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BlueTickBadge size="lg" /> Blue Tick Application</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="font-semibold text-yellow-600 flex items-center gap-2"><Clock className="w-4 h-4" /> Pending review</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your application was submitted{application?.submitted_at ? ` on ${new Date(application.submitted_at).toLocaleDateString()}` : ''}.
              Our team will review your application and respond within 3 days. You cannot edit or resubmit while it is under review.
            </p>
          </div>
          <div className="text-sm space-y-2">
            <p><span className="text-muted-foreground">Specialties:</span> {(application?.specialties || []).join(', ') || '—'}</p>
            <p><span className="text-muted-foreground">Received:</span> professional information, identity document (both sides) and face verification.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rejected = application?.status === 'rejected';
  const needsInfo = application?.status === 'more_info_requested';

  const DocBox = ({ kind, label, hint, inputRef, capture }: { kind: 'id_front' | 'id_back' | 'selfie'; label: string; hint: string; inputRef: React.RefObject<HTMLInputElement>; capture?: 'user' | 'environment' }) => {
    const stored = kind === 'id_front' ? idFront : kind === 'id_back' ? idBack : selfie;
    const src = previews[kind] || null;
    return (
      <div className="rounded-lg border border-border p-3 space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="aspect-[4/3] rounded-md bg-muted/40 border border-border overflow-hidden flex items-center justify-center">
          {src ? (
            <img src={src} alt={label} className="w-full h-full object-cover" />
          ) : stored ? (
            <div className="text-center text-xs text-emerald-500 px-2 flex flex-col items-center gap-1"><CheckCircle2 className="w-5 h-5" /> Saved securely</div>
          ) : (
            <p className="text-[11px] text-muted-foreground px-3 text-center">{hint}</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          {...(capture ? { capture } : {})}
          className="hidden"
          onChange={(ev) => { const f = ev.target.files?.[0]; if (f) upload(kind, f); ev.target.value = ''; }}
        />
        <Button variant="outline" size="sm" className="w-full" disabled={uploading === kind} onClick={() => inputRef.current?.click()}>
          {uploading === kind ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
            : stored ? <RotateCcw className="w-4 h-4 mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
          {stored ? 'Retake / replace' : 'Take or upload photo'}
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2"><BlueTickBadge size="lg" /> Blue Tick Application</CardTitle>
        <Stepper step={step} done={stepsDone} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-foreground"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Seller</span> confirms your identity documents.
          The <span className="font-medium text-[#1d9bf0]">Blue Tick</span> is the higher trust badge, reviewed and granted by the FIVESOM team.
          Eligibility (orders, earnings, rating, account age) is tracked separately in the “Blue Tick Eligibility” card on your dashboard.
        </div>

        {rejected && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm">
            <p className="font-semibold text-red-600">Previous application rejected</p>
            {(application?.rejection_reason || application?.admin_notes) && (
              <p className="text-muted-foreground mt-1">{application?.rejection_reason || application?.admin_notes}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">Correct the 3 steps and submit again.</p>
          </div>
        )}
        {needsInfo && (
          <div className="rounded-lg border border-[#1d9bf0]/30 bg-[#1d9bf0]/5 p-3 text-sm">
            <p className="font-semibold text-[#1d9bf0]">Changes required</p>
            {application?.more_info_request && <p className="text-muted-foreground mt-1">{application.more_info_request}</p>}
            <p className="text-xs text-muted-foreground mt-1">Update the information below and resubmit.</p>
          </div>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Professional information</h3>
              <p className="text-xs text-muted-foreground">Your specialties, expertise, years of experience and social links.</p>
            </div>
            <div className="space-y-2">
              <Label>Specialties * <span className="text-xs text-muted-foreground">(official FIVESOM categories)</span></Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                    className={cn('px-3 py-1.5 rounded-full border text-xs transition-colors',
                      specialties.includes(s) ? 'border-[#1d9bf0] bg-[#1d9bf0]/10 text-[#1d9bf0]' : 'border-border text-muted-foreground hover:bg-accent')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label>Years of experience *</Label>
              <Select value={yearsExperience} onValueChange={setYearsExperience}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expertise & summary of your best work * <span className="text-xs text-muted-foreground">({projectSummary.trim().length}/30 characters minimum)</span></Label>
              <Textarea rows={4} value={projectSummary} onChange={(ev) => setProjectSummary(ev.target.value)}
                placeholder="Describe your strongest projects on FIVESOM and the results you delivered." />
            </div>
            <div className="space-y-2">
              <Label>Additional experience details <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Textarea rows={2} value={experience} onChange={(ev) => setExperience(ev.target.value)} placeholder="Key clients, tools, certifications" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIAL_FIELDS.map((f) => (
                <div key={f.key} className="space-y-1.5">
                  <Label>{f.label} <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input value={social[f.key]} onChange={(ev) => setSocial((p) => ({ ...p, [f.key]: ev.target.value }))} placeholder="https://…" />
                </div>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Identity information</h3>
              <p className="text-xs text-muted-foreground">Choose your document type and photograph both sides. You can retake any photo.</p>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label>ID type *</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger><SelectValue placeholder="Passport, national ID or driving licence" /></SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DocBox kind="id_front" label="Front side *" hint="Front of your ID — all corners visible and readable" inputRef={frontRef} capture="environment" />
              <DocBox kind="id_back" label="Back side *" hint="Back of your ID — all corners visible and readable" inputRef={backRef} capture="environment" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Your documents are stored in a private, access-controlled location. They are never public — only authorised FIVESOM
              Admin/Founder verification staff can open them, through short-lived secure links.
            </p>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">Face verification</h3>
              <p className="text-xs text-muted-foreground">
                Start the check, allow camera access and look straight at the camera with your face fully visible in good light.
              </p>
            </div>

            {cameraOn ? (
              <div className="space-y-3 max-w-sm">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#1d9bf0]/50 bg-black">
                  <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
                </div>
                <ul className="text-[11px] text-muted-foreground list-disc pl-4 space-y-0.5">
                  <li>Keep your whole face inside the frame</li>
                  <li>Remove hats, masks and sunglasses</li>
                  <li>Hold still, then capture</li>
                </ul>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" onClick={captureFace} disabled={uploading === 'selfie'}>
                    {uploading === 'selfie' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />} Capture
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-w-sm">
                <div className="aspect-[3/4] rounded-lg border border-border bg-muted/40 overflow-hidden flex items-center justify-center">
                  {previews.selfie ? (
                    <img src={previews.selfie} alt="Face verification" className="w-full h-full object-cover" />
                  ) : selfie ? (
                    <div className="text-center text-xs text-emerald-500 flex flex-col items-center gap-1"><CheckCircle2 className="w-6 h-6" /> Face check completed</div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground px-6 flex flex-col items-center gap-2">
                      <ScanFace className="w-7 h-7 opacity-60" />
                      Your face check has not started yet.
                    </div>
                  )}
                </div>
                <Button className="w-full bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" onClick={startCamera}>
                  <Camera className="w-4 h-4 mr-2" /> {selfie ? 'Redo face verification' : 'Start verification'}
                </Button>
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(ev) => { const f = ev.target.files?.[0]; if (f) upload('selfie', f); ev.target.value = ''; }}
                />
                <Button variant="outline" size="sm" className="w-full" disabled={uploading === 'selfie'} onClick={() => selfieRef.current?.click()}>
                  {uploading === 'selfie' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />} Camera blocked? Upload a photo instead
                </Button>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              This face check is reviewed by the FIVESOM verification team to confirm the account belongs to you. FIVESOM does not
              perform automated biometric matching, and your face image is stored privately with your identity documents.
            </p>
          </section>
        )}

        {/* Navigation */}
        <div className="border-t border-border pt-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{completedCount} of 3 steps completed</span>
            <span className={cn('text-xs font-semibold', e.eligible ? 'text-emerald-500' : 'text-muted-foreground')}>
              Eligibility {e.requirements_complete}/{e.requirements_total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-[#1d9bf0] transition-all duration-500" style={{ width: `${(completedCount / 3) * 100}%` }} />
          </div>

          {step === 3 && !e.eligible && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              {e.requirements_total - e.requirements_complete} eligibility requirement(s) left. Your 3 steps are saved — submitting unlocks once your eligibility is complete.
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {step > 1 && (
              <Button variant="outline" className="sm:w-32" onClick={goBack} disabled={saving || submitting}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < 3 ? (
              <Button className="flex-1 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" onClick={goNext} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button className="flex-1 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" onClick={submit} disabled={!allSteps || !e.eligible || submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {allSteps && e.eligible ? 'Submit Blue Tick Application' : `🔒 Submit — ${completedCount} of 3 steps completed`}
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground text-center">
            Your progress is saved automatically — you can leave and resume from this step. Our team will review your application and respond within 3 days.
          </p>
          {application && !rejected && !needsInfo && (
            <div className="flex justify-center"><Badge variant="outline" className="text-[11px]">Progress saved</Badge></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlueTickApply;
