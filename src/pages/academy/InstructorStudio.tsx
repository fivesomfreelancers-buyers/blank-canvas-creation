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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ACADEMY_PLANS, courseLimit, db, uploadAcademyFile, uploadPublicCourseMedia, videoDurationSeconds } from '@/lib/academy';

const emptyCourse = { title: '', short_description: '', description: '', category: '', language: 'English', level: 'Beginner', price: '0', duration: '', objectives: '', requirements: '' };

const InstructorStudio = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<string | null | undefined>(undefined);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<Record<string, number>>({});
  const [form, setForm] = useState<any>(emptyCourse);
  const [thumb, setThumb] = useState<File | null>(null);
  const [intro, setIntro] = useState<File | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [lf, setLf] = useState<any>({ module: 'Module 1', title: '', description: '', duration: '', text: '', preview: false });
  const [lv, setLv] = useState<File | null>(null);
  const [la, setLa] = useState<File | null>(null);
  const [busy, setBusy] = useState('');

  const load = async () => {
    if (!user) return;
    const { data: p } = await db.rpc('is_approved_instructor', { _uid: user.id });
    setPlan(p ?? null);
    const { data } = await db.from('academy_courses').select('*').eq('instructor_id', user.id).order('created_at');
    setCourses(data ?? []);
    const { data: en } = await db.from('academy_enrollments').select('course_id').in('course_id', (data ?? []).map((c: any) => c.id));
    const counts: Record<string, number> = {};
    (en ?? []).forEach((e: any) => { counts[e.course_id] = (counts[e.course_id] ?? 0) + 1; });
    setStudents(counts);
  };
  useEffect(() => { load(); }, [user]);
  const loadLessons = async (c: any) => {
    setSelected(c);
    const { data } = await db.from('academy_lessons').select('*').eq('course_id', c.id).order('position');
    setLessons(data ?? []);
  };

  const createCourse = async (submitForReview: boolean) => {
    if (!user) return;
    if (!form.title.trim() || !form.short_description.trim() || !form.description.trim() || !form.category.trim()) { toast.error('Title, short description, description and category are required.'); return; }
    if (intro && (await videoDurationSeconds(intro)) > 65) { toast.error('The course introduction video must be 1 minute or less.'); return; }
    try {
      setBusy('Saving course…');
      const thumbnail_url = thumb ? await uploadPublicCourseMedia(user.id, thumb) : null;
      const intro_video_url = intro ? await uploadPublicCourseMedia(user.id, intro) : null;
      const { error } = await db.from('academy_courses').insert({ ...form, price: Number(form.price) || 0, instructor_id: user.id, thumbnail_url, intro_video_url, status: submitForReview ? 'pending_review' : 'draft' });
      if (error) throw new Error(error.message);
      toast.success(submitForReview ? 'Course submitted for Fivesom review.' : 'Course saved as draft.');
      setForm(emptyCourse); setThumb(null); setIntro(null); load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(''); }
  };

  const setStatus = async (c: any, status: string) => {
    const { error } = await db.from('academy_courses').update({ status }).eq('id', c.id);
    if (error) toast.error(error.message); else { toast.success(status === 'pending_review' ? 'Submitted for review' : 'Updated'); load(); }
  };

  const addLesson = async () => {
    if (!user || !selected || !lf.title.trim()) { toast.error('Lesson title is required.'); return; }
    try {
      setBusy('Uploading lesson…');
      const { data: l, error } = await db.from('academy_lessons').insert({ course_id: selected.id, module: lf.module || 'Module 1', title: lf.title, description: lf.description || null, duration_minutes: parseInt(lf.duration) || null, position: lessons.length, is_preview: lf.preview }).select().single();
      if (error) throw new Error(error.message);
      const video_path = lv ? await uploadAcademyFile('academy-lessons', user.id, lv, selected.id) : null;
      const attachment_path = la ? await uploadAcademyFile('academy-lessons', user.id, la, selected.id) : null;
      const { error: e2 } = await db.from('academy_lesson_content').insert({ lesson_id: l.id, video_path, attachment_path, text_body: lf.text || null });
      if (e2) throw new Error(e2.message);
      toast.success('Lesson added');
      setLf({ ...lf, title: '', description: '', duration: '', text: '', preview: false }); setLv(null); setLa(null); loadLessons(selected);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(''); }
  };
  const move = async (i: number, d: number) => {
    const a = lessons[i], b = lessons[i + d]; if (!b) return;
    await db.from('academy_lessons').update({ position: i + d }).eq('id', a.id);
    await db.from('academy_lessons').update({ position: i }).eq('id', b.id);
    loadLessons(selected);
  };
  const removeLesson = async (id: string) => { await db.from('academy_lessons').delete().eq('id', id); loadLessons(selected); };

  const shell = (c: React.ReactNode) => (<div className="min-h-screen bg-background"><SEO title="Instructor Studio — Fivesom Academy" description="Manage your Fivesom Academy courses." canonical="/academy/studio" /><Navbar /><main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">{c}</main><Footer /></div>);
  if (plan === undefined) return shell(<Loader2 className="h-6 w-6 animate-spin mx-auto" />);
  if (!plan) return shell(<Card><CardContent className="p-8 text-center space-y-3"><p>Instructor Studio opens after your instructor application is approved.</p><Button asChild><Link to="/academy/become-instructor">Become an Instructor</Link></Button></CardContent></Card>);

  const limit = courseLimit(plan);
  const used = courses.filter((c) => c.status !== 'rejected').length;
  const p = ACADEMY_PLANS[plan as keyof typeof ACADEMY_PLANS];
  const txt = (k: string, label: string, area = false) => (<div className={`space-y-1.5 ${area ? 'sm:col-span-2' : ''}`}><Label>{label}</Label>{area ? <Textarea rows={3} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}</div>);

  return shell(<>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-bold">Instructor Studio</h1><p className="text-muted-foreground">{p.name} plan · {p.liveDays} live day(s)/week · {used}/{limit} courses used · {Object.values(students).reduce((a, b) => a + b, 0)} students</p></div>
      <Button asChild variant="outline"><Link to="/academy">View Academy</Link></Button>
    </div>

    <section className="space-y-3"><h2 className="text-xl font-bold">My Courses</h2>
      {courses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
      {courses.map((c) => (<Card key={c.id}><CardContent className="p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0"><p className="font-semibold truncate">{c.title}</p><p className="text-xs text-muted-foreground">{students[c.id] ?? 0} students{c.review_reason ? ` · Fivesom note: ${c.review_reason}` : ''}</p></div>
        <Badge variant="secondary">{c.status.replace('_', ' ')}</Badge>
        <Button size="sm" variant="outline" onClick={() => loadLessons(c)}>Lessons</Button>
        {['draft', 'changes_requested', 'unpublished'].includes(c.status) && <Button size="sm" onClick={() => setStatus(c, 'pending_review')}>Submit for review</Button>}
        {c.status === 'published' && <Button size="sm" variant="outline" asChild><Link to={`/academy/course/${c.id}`}>Open</Link></Button>}
      </CardContent></Card>))}
    </section>

    {selected && (<Card><CardContent className="p-5 space-y-4">
      <h2 className="text-xl font-bold">Lessons — {selected.title}</h2>
      <ul className="space-y-2">{lessons.map((l, i) => (<li key={l.id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
        <span className="flex-1"><b>{l.module}</b> · {l.title}{l.is_preview && ' (free preview)'}</span>
        <Button size="sm" variant="ghost" onClick={() => move(i, -1)} aria-label="Move up">↑</Button>
        <Button size="sm" variant="ghost" onClick={() => move(i, 1)} aria-label="Move down">↓</Button>
        <Button size="sm" variant="ghost" onClick={() => removeLesson(l.id)} aria-label="Delete lesson"><Trash2 className="h-4 w-4" /></Button></li>))}</ul>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Module</Label><Input value={lf.module} onChange={(e) => setLf({ ...lf, module: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Lesson title *</Label><Input value={lf.title} onChange={(e) => setLf({ ...lf, title: e.target.value })} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Lesson description</Label><Input value={lf.description} onChange={(e) => setLf({ ...lf, description: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" value={lf.duration} onChange={(e) => setLf({ ...lf, duration: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Video lesson</Label><Input type="file" accept="video/*" onChange={(e) => setLv(e.target.files?.[0] ?? null)} /></div>
        <div className="space-y-1.5"><Label>PDF / document</Label><Input type="file" onChange={(e) => setLa(e.target.files?.[0] ?? null)} /></div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={lf.preview} onCheckedChange={(v) => setLf({ ...lf, preview: !!v })} /> Free preview lesson</label>
        <div className="space-y-1.5 sm:col-span-2"><Label>Text lesson</Label><Textarea rows={3} value={lf.text} onChange={(e) => setLf({ ...lf, text: e.target.value })} /></div>
      </div>
      <Button disabled={!!busy} onClick={addLesson}>{busy || 'Add lesson'}</Button>
    </CardContent></Card>)}

    {used < limit ? (<Card><CardContent className="p-5 space-y-4">
      <h2 className="text-xl font-bold">Create Course</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {txt('title', 'Course title *')}{txt('category', 'Category *')}
        {txt('short_description', 'Short description *', true)}{txt('description', 'Full course description *', true)}
        {txt('language', 'Teaching language')}
        <div className="space-y-1.5"><Label>Difficulty level</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced'].map((l) => <option key={l}>{l}</option>)}</select></div>
        <div className="space-y-1.5"><Label>Course price (USD, 0 = free)</Label><Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        {txt('duration', 'Estimated duration')}
        {txt('objectives', 'What students will learn', true)}{txt('requirements', 'Requirements', true)}
        <div className="space-y-1.5"><Label>Thumbnail</Label><Input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] ?? null)} /></div>
        <div className="space-y-1.5"><Label>Intro video (max 1 minute)</Label><Input type="file" accept="video/*" onChange={(e) => setIntro(e.target.files?.[0] ?? null)} /></div>
      </div>
      <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={!!busy} onClick={() => createCourse(false)}>Save draft</Button><Button disabled={!!busy} onClick={() => createCourse(true)}>{busy || 'Submit for approval'}</Button></div>
    </CardContent></Card>) : <p className="text-sm text-muted-foreground">You have used all {limit} course slot(s) on your {p.name} plan.</p>}
  </>);
};
export default InstructorStudio;
