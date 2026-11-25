import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ACADEMY_PLANS, AcademyPlan, db, uploadAcademyFile, videoDurationSeconds } from '@/lib/academy';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const MIN_VIDEO_SECONDS = 25 * 60;

const BecomeInstructor = () => {
  const { user } = useAuth();
  const [existing, setExisting] = useState<any>(undefined);
  const [f, setF] = useState<Record<string, string>>({});
  const [levels, setLevels] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [taught, setTaught] = useState(false);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [certs, setCerts] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [plan, setPlan] = useState<AcademyPlan | null>('golden');
  const [agree, setAgree] = useState({ terms: false, copyright: false, accurate: false });
  const [busy, setBusy] = useState('');

  useEffect(() => {
    if (!user) return;
    db.from('instructor_applications').select('*').eq('user_id', user.id).maybeSingle().then(({ data }: any) => setExisting(data ?? null));
    db.from('profiles').select('full_name, location').eq('id', user.id).maybeSingle().then(({ data }: any) => {
      if (data) setF((p) => ({ legal_name: data.full_name ?? '', display_name: data.full_name ?? '', country: data.location ?? '', ...p }));
    });
  }, [user]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const pickVideo = async (file: File | null) => {
    if (!file) return;
    const secs = await videoDurationSeconds(file);
    if (secs && secs < MIN_VIDEO_SECONDS) toast.message(`Your video is ${Math.round(secs / 60)} minutes. About 30 minutes is recommended, but you can still submit.`);
    setVideo(file); setVideoPreview(URL.createObjectURL(file));
  };

  const required = ['legal_name', 'display_name', 'phone', 'country', 'city', 'languages', 'subjects', 'expertise', 'years', 'background', 'why', 'bio'];
  const submit = async () => {
    if (!user) return;
    const missing = required.filter((k) => !(f[k] ?? '').trim());
    if (missing.length) { toast.error(`Please fill in: ${missing.map((k) => k.replace(/_/g, ' ')).join(', ')}`); return; }
    if (!levels.length) { toast.error('Choose at least one student level.'); return; }
    if (!idDoc) { toast.error('Upload your government-issued ID.'); return; }
    if (!video) { toast.error('Upload your 30-minute introduction video.'); return; }
    if (!plan) { toast.error('Select the Golden or Platinum plan.'); return; }
    if (!agree.terms || !agree.copyright || !agree.accurate) { toast.error('Please accept all agreements.'); return; }
    try {
      setBusy('Uploading ID…');
      const id_document_path = await uploadAcademyFile('academy-applications', user.id, idDoc, 'id');
      const selfie_path = selfie ? await uploadAcademyFile('academy-applications', user.id, selfie, 'id') : null;
      setBusy('Uploading certificates…');
      const certificate_paths = [];
      for (const c of certs) certificate_paths.push(await uploadAcademyFile('academy-applications', user.id, c, 'certificates'));
      setBusy('Uploading introduction video… (large files take time)');
      const intro_video_path = await uploadAcademyFile('academy-applications', user.id, video, 'video');
      setBusy('Submitting…');
      const row = {
        user_id: user.id, legal_name: f.legal_name, display_name: f.display_name, phone: f.phone, country: f.country, city: f.city,
        date_of_birth: f.dob || null, teaching_languages: f.languages.split(',').map((s) => s.trim()).filter(Boolean),
        subjects: f.subjects, expertise: f.expertise, years_experience: parseInt(f.years) || 0, background: f.background,
        student_levels: levels, qualifications: f.qualifications || null, taught_before: taught, why_qualified: f.why, bio: f.bio,
        links: f.links || null, availability_days: days, availability_times: f.times || null, time_zone: f.tz || null,
        id_document_path, selfie_path, certificate_paths, intro_video_path, plan, status: 'pending_review',
      };
      const q = existing ? db.from('instructor_applications').update(row).eq('id', existing.id) : db.from('instructor_applications').insert(row);
      const { error } = await q;
      if (error) throw new Error(error.message);
      const { data } = await db.from('instructor_applications').select('*').eq('user_id', user.id).maybeSingle();
      if (data?.status !== 'pending_review') throw new Error('Application could not be confirmed. Please try again.');
      setExisting(data);
      toast.success('Your instructor application has been submitted successfully. No payment is needed now.');
    } catch (e: any) { toast.error(e.message || 'Submission failed'); }
    finally { setBusy(''); }
  };

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-background"><SEO title="Become an Instructor — Fivesom Academy" description="Apply to teach on Fivesom Academy." canonical="/academy/become-instructor" />
      <Navbar /><main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">{children}</main><Footer /></div>
  );

  if (!user) return shell(<Card><CardContent className="p-8 text-center space-y-3"><p>Sign in to apply as an instructor.</p><Button asChild><Link to="/login">Sign in</Link></Button></CardContent></Card>);
  if (existing === undefined) return shell(<Loader2 className="h-6 w-6 animate-spin mx-auto" />);
  if (existing && !['changes_requested', 'rejected'].includes(existing.status)) return shell(
    <Card><CardContent className="p-8 space-y-3 text-center">
      <h1 className="text-2xl font-bold">Instructor application: {existing.status.replace('_', ' ')}</h1>
      {existing.status === 'pending_review' && <p className="text-muted-foreground">Your instructor application has been submitted successfully. Our Fivesom team will review your information and aim to provide a decision within 1 hour.</p>}
      {existing.status === 'approved' && <Button asChild><Link to="/academy/studio">Open Instructor Studio</Link></Button>}
      {existing.review_reason && <p className="text-sm">Note from Fivesom: {existing.review_reason}</p>}
    </CardContent></Card>);

  const field = (k: string, label: string, props: any = {}) => (
    <div className="space-y-1.5"><Label htmlFor={k}>{label}</Label><Input id={k} value={f[k] ?? ''} onChange={set(k)} {...props} /></div>);
  const area = (k: string, label: string) => (
    <div className="space-y-1.5 sm:col-span-2"><Label htmlFor={k}>{label}</Label><Textarea id={k} rows={3} value={f[k] ?? ''} onChange={set(k)} /></div>);
  const block = (title: string, children: React.ReactNode) => (
    <Card><CardContent className="p-5 space-y-4"><h2 className="text-lg font-bold">{title}</h2><div className="grid sm:grid-cols-2 gap-4">{children}</div></CardContent></Card>);
  const fileInput = (label: string, accept: string, onChange: (files: FileList | null) => void, hint?: string) => (
    <div className="space-y-1.5"><Label>{label}</Label><Input type="file" accept={accept} onChange={(e) => onChange(e.target.files)} />{hint && <p className="text-xs text-muted-foreground">{hint}</p>}</div>);

  return shell(<>
    <div><h1 className="text-3xl font-bold">Become an Instructor</h1>
      <p className="text-muted-foreground mt-1">Teach on Fivesom Academy with recorded lessons and live classes. Fields marked * are required.</p>
      {existing?.review_reason && <p className="mt-3 rounded-lg border border-border p-3 text-sm">Fivesom asked for changes: {existing.review_reason}</p>}</div>
    {block('A. Personal information', <>
      {field('legal_name', 'Full legal name *')}{field('display_name', 'Professional / display name *')}
      {field('phone', 'Phone with country code *', { placeholder: '+252 61 …' })}{field('country', 'Country *')}
      {field('city', 'City and current location *')}{field('dob', 'Date of birth', { type: 'date' })}
      {field('languages', 'Teaching language(s) * (comma separated)', { placeholder: 'Somali, English' })}
    </>)}
    {block('B. Identity verification (private — Fivesom staff only)', <>
      {fileInput('Government-issued ID *', 'image/*,application/pdf', (fl) => setIdDoc(fl?.[0] ?? null))}
      {fileInput('Selfie / verification photo', 'image/*', (fl) => setSelfie(fl?.[0] ?? null))}
    </>)}
    {block('C. Teaching information', <>
      {area('subjects', 'What subjects or skills can you teach? *')}{field('expertise', 'Area of expertise *')}
      {field('years', 'Years of experience *', { type: 'number', min: 0 })}{area('background', 'Professional background *')}
      <div className="space-y-1.5 sm:col-span-2"><Label>Student levels you can teach *</Label><div className="flex gap-4">{LEVELS.map((l) => (
        <label key={l} className="flex items-center gap-2 text-sm"><Checkbox checked={levels.includes(l)} onCheckedChange={() => toggle(levels, setLevels, l)} />{l}</label>))}</div></div>
      {area('qualifications', 'Qualifications or certificates')}
      <label className="flex items-center gap-2 text-sm sm:col-span-2"><Checkbox checked={taught} onCheckedChange={(v) => setTaught(!!v)} /> I have taught students before</label>
      {area('why', 'What makes you qualified to teach this subject? *')}
      {fileInput('Certificates, diplomas, portfolio or CV', 'image/*,application/pdf', (fl) => setCerts(Array.from(fl ?? [])), 'You can choose several files.')}
    </>)}
    <Card><CardContent className="p-5 space-y-3"><h2 className="text-lg font-bold">D. Introduction video (30 minutes) *</h2>
      <p className="text-sm text-muted-foreground">Explain who you are, your background, what you will teach, your experience and teaching method. Only Fivesom Admin and Founder reviewers can watch it.</p>
      <Input type="file" accept="video/*" onChange={(e) => pickVideo(e.target.files?.[0] ?? null)} />
      {videoPreview && <video src={videoPreview} controls className="w-full max-h-72 rounded-lg bg-muted" />}
    </CardContent></Card>
    {block('E. Teaching availability', <>
      <div className="space-y-1.5 sm:col-span-2"><Label>Available days for live classes</Label><div className="flex flex-wrap gap-3">{DAYS.map((d) => (
        <label key={d} className="flex items-center gap-2 text-sm"><Checkbox checked={days.includes(d)} onCheckedChange={() => toggle(days, setDays, d)} />{d}</label>))}</div></div>
      {field('times', 'Preferred live teaching times', { placeholder: '18:00–20:00' })}{field('tz', 'Time zone', { placeholder: 'EAT (UTC+3)' })}
    </>)}
    {block('F. Additional information', <>{area('bio', 'Instructor biography *')}{field('links', 'Website or social media links')}</>)}

    <div><h2 className="text-xl font-bold mb-3">Choose your plan *</h2>
      <div className="grid md:grid-cols-2 gap-4">{(Object.keys(ACADEMY_PLANS) as AcademyPlan[]).map((k) => { const p = ACADEMY_PLANS[k]; return (
        <button key={k} type="button" onClick={() => setPlan(k)} className={`text-left rounded-xl border-2 p-5 transition ${plan === k ? 'border-primary bg-primary/5' : 'border-border'}`}>
          <h3 className="text-lg font-bold">{p.name}</h3>
          <p><span className="text-2xl font-bold">${p.firstMonth}</span> first month, then <b>${p.price}/month</b></p>
          <ul className="mt-3 space-y-1 text-sm">{p.features.map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{x}</li>)}</ul>
        </button>); })}</div>
      <p className="text-xs text-muted-foreground mt-2">Monthly recurring subscription. Renews each month on the date your plan is activated; cancel any time before renewal. Publishing is only activated after Fivesom approves your application. If an application is rejected, any plan payment is refunded.</p>
    </div>

    <Card><CardContent className="p-5 space-y-2">
      <label className="flex gap-2 text-sm"><Checkbox checked={agree.terms} onCheckedChange={(v) => setAgree({ ...agree, terms: !!v })} /> I agree to the Fivesom Academy Instructor Terms.</label>
      <label className="flex gap-2 text-sm"><Checkbox checked={agree.copyright} onCheckedChange={(v) => setAgree({ ...agree, copyright: !!v })} /> I own or have the rights to all course content I publish.</label>
      <label className="flex gap-2 text-sm"><Checkbox checked={agree.accurate} onCheckedChange={(v) => setAgree({ ...agree, accurate: !!v })} /> I confirm the information I submitted is accurate.</label>
    </CardContent></Card>
    <Button size="lg" className="w-full" disabled={!!busy} onClick={submit}>{busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{busy}</> : 'Submit application'}</Button>
  </>);
};
export default BecomeInstructor;
