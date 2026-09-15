import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Loader2, RotateCcw, ScanFace, Send, ShieldCheck, Upload } from 'lucide-react';
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

const StepHeader = ({ n, title, done, subtitle }: { n: number; title: string; done: boolean; subtitle: string }) => (
  <div className="flex items-start gap-3">
    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
      done ? 'bg-emerald-500 text-white' : 'bg-[#1d9bf0]/15 text-[#1d9bf0]')}>
      {done ? <CheckCircle2 className="w-4 h-4" /> : n}
    </div>
    <div className="min-w-0">
      <p className="text-sm font-semibold leading-tight">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const BlueTickApply: React.FC<Props> = ({ userId }) => {
  const { eligibility: e, application, loading, refresh } = useBlueTickEligibility(userId);

  const [experience, setExperience] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [social, setSocial] = useState<Record<SocialKey, string>>({ website: '', instagram: '', facebook: '', tiktok: '', linkedin: '' });
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!application) return;
    setExperience(application.experience || '');
    setProjectSummary(application.project_summary || '');
    setSpecialties(application.specialties || []);
    const s = (application.social_links || {}) as Record<string, string>;
    setSocial({ website: s.website || '', instagram: s.instagram || '', facebook: s.facebook || '', tiktok: s.tiktok || '', linkedin: s.linkedin || '' });
    const a = application as any;
    setIdFront(a.id_front_url || null);
    setIdBack(a.id_back_url || null);
    setSelfie(a.selfie_url || null);
  }, [application?.id, application?.status]);

  const locked = application?.status === 'pending';

  const toggleSpecialty = (name: string) =>
    setSpecialties((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));

  const socialPayload = () => Object.fromEntries(Object.entries(social).filter(([, v]) => v.trim()));

  const persist = async (extra?: { id_front?: string | null; id_back?: string | null; selfie?: string | null }) => {
    const { data, error } = await (supabase as any).rpc('save_blue_tick_application_draft', {
      _experience: experience.trim() || null,
      _specialties: specialties,
      _project_summary: projectSummary.trim() || null,
      _social_links: socialPayload(),
      _id_front_url: extra?.id_front ?? idFront,
      _id_back_url: extra?.id_back ?? idBack,
      _selfie_url: extra?.selfie ?? selfie,
    });
    if (error) throw new Error(error.message);
    return data as string;
  };

  const upload = async (kind: 'id_front' | 'id_back' | 'selfie', file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file');
    if (file.size > 10 * 1024 * 1024) return toast.error('Image must be smaller than 10MB');
    setUploading(kind);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
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
      toast.success('Photo saved');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const step1Done = specialties.length > 0 && projectSummary.trim().length >= 30;
  const step2Done = !!idFront && !!idBack;
  const step3Done = !!selfie;
  const stepsDone = [step1Done, step2Done, step3Done].filter(Boolean).length;
  const allSteps = stepsDone === 3;

  const saveDraft = async () => {
    setSaving(true);
    try { await persist(); toast.success('Progress saved'); refresh(); }
    catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const appId = await persist();
      const { error } = await (supabase as any).rpc('submit_blue_tick_application', { _application_id: appId });
      if (error) throw new Error(error.message);
      toast.success('Application submitted — our team reviews it within 3 days');
      refresh();
    } catch (err: any) {
      toast.error(err.message || 'Could not submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const shot = useMemo(() => (kind: string, stored: string | null) => previews[kind] || stored || null, [previews]);

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

  if (locked) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BlueTickBadge size="lg" /> Blue Tick Application</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="font-semibold text-yellow-600 flex items-center gap-2"><Clock className="w-4 h-4" /> Pending review</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your application was submitted{application?.submitted_at ? ` on ${new Date(application.submitted_at).toLocaleDateString()}` : ''}.
              The FIVESOM team reviews applications within 3 days. You cannot edit or resubmit while it is under review.
            </p>
          </div>
          <div className="text-sm space-y-2">
            <p><span className="text-muted-foreground">Specialties:</span> {(application?.specialties || []).join(', ') || '—'}</p>
            <p><span className="text-muted-foreground">Documents:</span> ID front, ID back and face photo received.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rejected = application?.status === 'rejected';
  const needsInfo = application?.status === 'more_info_requested';
  const remaining = e.requirements_total - e.requirements_complete;

  const DocBox = ({ kind, label, hint, inputRef, capture }: { kind: 'id_front' | 'id_back' | 'selfie'; label: string; hint: string; inputRef: React.RefObject<HTMLInputElement>; capture?: 'user' | 'environment' }) => {
    const stored = kind === 'id_front' ? idFront : kind === 'id_back' ? idBack : selfie;
    const src = shot(kind, previews[kind] ? previews[kind] : null);
    return (
      <div className="rounded-lg border border-border p-3 space-y-2">
        <p className="text-sm font-medium">{label}</p>
        <div className="aspect-[4/3] rounded-md bg-muted/40 border border-border overflow-hidden flex items-center justify-center">
          {src ? (
            <img src={src} alt={label} className="w-full h-full object-cover" />
          ) : stored ? (
            <div className="text-center text-xs text-emerald-500 px-2 flex flex-col items-center gap-1"><CheckCircle2 className="w-5 h-5" /> Saved</div>
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BlueTickBadge size="lg" /> Blue Tick Application</CardTitle>
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
            <p className="text-xs text-muted-foreground mt-1">Update the 3 steps below and submit again.</p>
          </div>
        )}
        {needsInfo && (
          <div className="rounded-lg border border-[#1d9bf0]/30 bg-[#1d9bf0]/5 p-3 text-sm">
            <p className="font-semibold text-[#1d9bf0]">Changes required</p>
            {application?.more_info_request && <p className="text-muted-foreground mt-1">{application.more_info_request}</p>}
            <p className="text-xs text-muted-foreground mt-1">Fix the points above and resubmit.</p>
          </div>
        )}

        {/* Step 1 */}
        <section className="space-y-4">
          <StepHeader n={1} title="Professional information" done={step1Done} subtitle="Your specialties, a short summary of your work and (optionally) your links." />
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
          <div className="space-y-2">
            <Label>Summary of your best work * <span className="text-xs text-muted-foreground">({projectSummary.trim().length}/30 characters minimum)</span></Label>
            <Textarea rows={4} value={projectSummary} onChange={(ev) => setProjectSummary(ev.target.value)}
              placeholder="Describe your strongest projects on FIVESOM and the results you delivered." />
          </div>
          <div className="space-y-2">
            <Label>Experience <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Textarea rows={2} value={experience} onChange={(ev) => setExperience(ev.target.value)} placeholder="Years of experience, key clients, expertise" />
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

        {/* Step 2 */}
        <section className="space-y-4 border-t border-border pt-6">
          <StepHeader n={2} title="Identity document" done={step2Done} subtitle="Photograph both sides of your ID, passport or driving licence. You can retake any photo." />
          <div className="grid gap-3 sm:grid-cols-2">
            <DocBox kind="id_front" label="Front side *" hint="Front of your ID — all corners visible and readable" inputRef={frontRef} capture="environment" />
            <DocBox kind="id_back" label="Back side *" hint="Back of your ID — all corners visible and readable" inputRef={backRef} capture="environment" />
          </div>
          <p className="text-[11px] text-muted-foreground">Your documents are stored privately and only the FIVESOM review team can open them.</p>
        </section>

        {/* Step 3 */}
        <section className="space-y-4 border-t border-border pt-6">
          <StepHeader n={3} title="Face verification" done={step3Done} subtitle="Take a clear selfie holding your ID next to your face, in good light." />
          <div className="max-w-xs">
            <DocBox kind="selfie" label="Selfie with ID *" hint="Face clearly visible, ID next to your face" inputRef={selfieRef} capture="user" />
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1"><ScanFace className="w-3 h-3" /> Used only to confirm that the account belongs to you.</p>
        </section>

        {/* Submit */}
        <div className="border-t border-border pt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{stepsDone} of 3 steps completed</span>
            <span className={cn('text-xs font-semibold', e.eligible ? 'text-emerald-500' : 'text-muted-foreground')}>
              Eligibility {e.requirements_complete}/{e.requirements_total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-[#1d9bf0] transition-all duration-500" style={{ width: `${(stepsDone / 3) * 100}%` }} />
          </div>
          {!e.eligible && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              {remaining} eligibility requirement(s) left. You can prepare all 3 steps now — submitting unlocks once your eligibility is complete.
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={saveDraft} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Save progress
            </Button>
            <Button className="flex-1 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white" onClick={submit} disabled={!allSteps || !e.eligible || submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {allSteps && e.eligible ? 'Submit application' : `Locked — ${stepsDone} of 3 steps completed`}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">After submitting, our team reviews your application within 3 days.</p>
          {application?.status && !rejected && !needsInfo && (
            <div className="flex justify-center"><Badge variant="outline" className="text-[11px]">Draft saved</Badge></div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BlueTickApply;
