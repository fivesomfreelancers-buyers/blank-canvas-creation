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
import { Loader2, Trash2, LayoutGrid, GraduationCap, ChevronDown, Users, Crown, BookOpen, FilePlus2, Layers, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ACADEMY_PLANS, courseLimit, db, uploadAcademyFile, uploadPublicCourseMedia, videoDurationSeconds } from '@/lib/academy';

const emptyCourse = { title: '', short_description: '', description: '', category: '', language: 'English', level: 'Beginner', price: '0', duration: '', objectives: '', requirements: '' };

const InstructorStudio = () => {
  const [view, setView] = useState('overview');
  const [open, setOpen] = useState<Record<string, boolean>>({ courses: true });
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
    setSelected(c); setView('content');
    const { data } = await db.from('academy_lessons').select('*').eq('course_id', c.id).order('position');
    setLessons(data ?? []);
  };

  const createCourse = async (submitForReview: boolean) => {
    if (!user) return;
    if (!form.title.trim() || !form.short_description.trim() || !form.description.trim() || !form.category.trim()) { toast.error('Title, short description, description and category are required.'); return; }
    try {
      setBusy('Saving course…');
      const thumbnail_url = thumb ? await uploadPublicCourseMedia(user.id, thumb) : null;
      const intro_video_url = intro ? await uploadPublicCourseMedia(user.id, intro) : null;
      const { error } = await db.from('academy_courses').insert({ ...form, price: Number(form.price) || 0, instructor_id: user.id, thumbnail_url, intro_video_url, status: submitForReview ? 'pending_review' : 'draft' });
      if (error) throw new Error(error.message);
      toast.success(submitForReview ? 'Course submitted for Fivesom review.' : 'Course saved as draft.');
      setForm(emptyCourse); setThumb(null); setIntro(null); setView('all'); load();
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

  const shell = (c: React.ReactNode) => (<div className="min-h-screen bg-background"><SEO title="Instructor Studio — Fivesom Academy" description="Manage your Fivesom Academy courses." canonical="/academy/studio" /><Navbar /><main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-10">{c}</main><Footer /></div>);
  if (plan === undefined) return shell(<Loader2 className="h-6 w-6 animate-spin mx-auto" />);
  if (!plan) return shell(<Card><CardContent className="p-8 text-center space-y-3"><p>Instructor Studio opens after your instructor application is approved.</p><Button asChild><Link to="/academy/become-instructor">Become an Instructor</Link></Button></CardContent></Card>);

  const limit = courseLimit(plan);
  const used = courses.filter((c) => c.status !== 'rejected').length;
  const p = ACADEMY_PLANS[plan as keyof typeof ACADEMY_PLANS];
  const totalStudents = Object.values(students).reduce((a, b) => a + b, 0);
  const by = (s: string[]) => courses.filter((c) => s.includes(c.status));
  const txt = (k: string, label: string, area = false) => (<div className={`space-y-1.5 ${area ? 'sm:col-span-2' : ''}`}><Label>{label}</Label>{area ? <Textarea rows={3} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /> : <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />}</div>);

  const nav: { key: string; title: string; icon: any; children?: { key: string; title: string; count?: number }[] }[] = [
    { key: 'overview', title: 'Overview', icon: LayoutGrid },
    { key: 'courses', title: 'Courses', icon: GraduationCap, children: [
      { key: 'all', title: 'My Courses', count: courses.length }, { key: 'create', title: 'Add New Course' },
      { key: 'draft', title: 'Drafts', count: by(['draft', 'changes_requested', 'unpublished']).length },
      { key: 'pending', title: 'Pending Review', count: by(['pending_review']).length },
      { key: 'published', title: 'Published', count: by(['published']).length },
      { key: 'rejected', title: 'Rejected', count: by(['rejected']).length } ] },
    { key: 'content', title: 'Course Content', icon: Layers },
    { key: 'students', title: 'Students', icon: Users },
    { key: 'plan', title: 'Subscription & Plan', icon: Crown },
  ];
  const titles: Record<string, string> = { overview: 'Overview', all: 'My Courses', create: 'Add New Course', draft: 'Draft Courses', pending: 'Pending Review', published: 'Published Courses', rejected: 'Rejected Courses', content: 'Course Content', students: 'Students', plan: 'Subscription & Plan' };

  const sidebar = (<aside className="lg:w-64 shrink-0 rounded-3xl border border-border bg-card p-3 lg:sticky lg:top-24 self-start">
    <p className="px-3 pt-2 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instructor Studio</p>
    <nav className="space-y-1">{nav.map((n) => {
      const active = view === n.key || n.children?.some((c) => c.key === view);
      return (<div key={n.key}>
        <button type="button" onClick={() => n.children ? setOpen({ ...open, [n.key]: !open[n.key] }) : setView(n.key)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active && !n.children ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}>
          <n.icon className="h-4 w-4" /><span className="flex-1 text-left">{n.title}</span>
          {n.children && <ChevronDown className={`h-4 w-4 transition-transform ${open[n.key] ? 'rotate-180 text-primary' : ''}`} />}
        </button>
        {n.children && open[n.key] && (<div className="ml-5 mt-1 space-y-1 border-l-2 border-primary/30 pl-3 animate-fade-in">{n.children.map((c) => (
          <button key={c.key} type="button" onClick={() => setView(c.key)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${view === c.key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            <span>{c.title}</span>{c.count !== undefined && <span className="text-xs opacity-80">{c.count}</span>}</button>))}</div>)}
      </div>);
    })}</nav>
  </aside>);

  const stat = (label: string, value: React.ReactNode, Icon: any) => (<div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Icon className="h-6 w-6" /></span><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div></div>);

  const table = (list: any[]) => (<div className="overflow-hidden rounded-2xl border border-border bg-card">
    {list.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No courses here yet.</p> : (<div className="overflow-x-auto"><table className="w-full text-sm">
      <thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="p-4 w-10">#</th><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Students</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
      <tbody>{list.map((c, i) => (<tr key={c.id} className="border-t border-border hover:bg-muted/30">
        <td className="p-4 text-muted-foreground">{i + 1}</td>
        <td className="p-4"><p className="font-semibold">{c.title}</p>{c.review_reason && <p className="text-xs text-muted-foreground">Fivesom note: {c.review_reason}</p>}</td>
        <td className="p-4"><Badge variant="secondary">{c.category}</Badge></td>
        <td className="p-4">{students[c.id] ?? 0}</td>
        <td className="p-4 capitalize">{c.status.replace('_', ' ')}</td>
        <td className="p-4"><div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => loadLessons(c)}><Layers className="h-4 w-4" /> Lessons</Button>
          {['draft', 'changes_requested', 'unpublished'].includes(c.status) && <Button size="sm" onClick={() => setStatus(c, 'pending_review')}>Submit</Button>}
          {c.status === 'published' && <Button size="sm" variant="ghost" asChild><Link to={`/academy/course/${c.id}`}><Eye className="h-4 w-4" /></Link></Button>}
        </div></td></tr>))}</tbody></table></div>)}
  </div>);

  const content = selected ? (<div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <h2 className="text-xl font-bold">{selected.title}</h2>
      <p className="text-sm text-muted-foreground">Organise your course into sections. Each section can hold many lessons.</p>
      {Array.from(new Set(lessons.map((l) => l.module))).map((m, si) => (
        <div key={m} className="rounded-xl border border-border">
          <div className="flex items-center gap-3 border-b border-border p-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">{String(si + 1).padStart(2, '0')}</span><b className="flex-1">{m}</b><span className="text-xs text-muted-foreground">{lessons.filter((l) => l.module === m).length} lessons</span><Button size="sm" variant="ghost" onClick={() => setLf({ ...lf, module: m })}>+ Lesson</Button></div>
          <ul className="space-y-1 p-2">{lessons.map((l, i) => l.module !== m ? null : (<li key={l.id} className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-muted/50">
            <span className="flex-1">{l.title}{l.is_preview && <Badge variant="secondary" className="ml-2">FREE</Badge>}</span>
            <Button size="sm" variant="ghost" onClick={() => move(i, -1)} aria-label="Move up">↑</Button>
            <Button size="sm" variant="ghost" onClick={() => move(i, 1)} aria-label="Move down">↓</Button>
            <Button size="sm" variant="ghost" onClick={() => removeLesson(l.id)} aria-label="Delete lesson"><Trash2 className="h-4 w-4" /></Button></li>))}</ul>
        </div>))}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Section / chapter *</Label><Input list="academy-sections" placeholder="e.g. 01 AI Foundations" value={lf.module} onChange={(e) => setLf({ ...lf, module: e.target.value })} /><datalist id="academy-sections">{Array.from(new Set(lessons.map((l) => l.module))).map((m) => <option key={m} value={m} />)}</datalist></div>
        <div className="space-y-1.5"><Label>Lesson title *</Label><Input value={lf.title} onChange={(e) => setLf({ ...lf, title: e.target.value })} /></div>
        <div className="space-y-1.5 sm:col-span-2"><Label>Lesson description</Label><Input value={lf.description} onChange={(e) => setLf({ ...lf, description: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" value={lf.duration} onChange={(e) => setLf({ ...lf, duration: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Video lesson</Label><Input type="file" accept="video/*" onChange={(e) => setLv(e.target.files?.[0] ?? null)} /></div>
        <div className="space-y-1.5"><Label>PDF / document</Label><Input type="file" onChange={(e) => setLa(e.target.files?.[0] ?? null)} /></div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={lf.preview} onCheckedChange={(v) => setLf({ ...lf, preview: !!v })} /> Free preview lesson</label>
        <div className="space-y-1.5 sm:col-span-2"><Label>Text lesson</Label><Textarea rows={3} value={lf.text} onChange={(e) => setLf({ ...lf, text: e.target.value })} /></div>
      </div>
      <Button disabled={!!busy} onClick={addLesson}>{busy || 'Add lesson'}</Button>
    </div>) : (<div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3"><BookOpen className="mx-auto h-8 w-8 text-primary" /><p className="text-muted-foreground">Choose a course to add sections and lessons.</p>
      <div className="flex flex-wrap justify-center gap-2">{courses.map((c) => <Button key={c.id} size="sm" variant="outline" onClick={() => loadLessons(c)}>{c.title}</Button>)}</div></div>);

  const create = used < limit ? (<div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {txt('title', 'Course title *')}{txt('category', 'Category *')}
        {txt('short_description', 'Short description *', true)}{txt('description', 'Full course description *', true)}
        {txt('language', 'Teaching language')}
        <div className="space-y-1.5"><Label>Difficulty level</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced'].map((l) => <option key={l}>{l}</option>)}</select></div>
        <div className="space-y-1.5"><Label>Course price (USD, 0 = free)</Label><Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
        {txt('duration', 'Estimated duration')}
        {txt('objectives', 'What students will learn', true)}{txt('requirements', 'Requirements', true)}
        <div className="space-y-1.5"><Label>Thumbnail</Label><Input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] ?? null)} /></div>
        <div className="space-y-1.5"><Label>Intro video</Label><Input type="file" accept="video/*" onChange={(e) => setIntro(e.target.files?.[0] ?? null)} /></div>
      </div>
      <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={!!busy} onClick={() => createCourse(false)}>Save draft</Button><Button disabled={!!busy} onClick={() => createCourse(true)}>{busy || 'Submit for approval'}</Button></div>
    </div>) : <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">You have used all {limit} course slot(s) on your {p.name} plan.</p>;

  const body: Record<string, React.ReactNode> = {
    overview: (<div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stat('Active courses', by(['published']).length, GraduationCap)}{stat('Pending review', by(['pending_review']).length, Loader2)}{stat('Drafts', by(['draft', 'changes_requested', 'unpublished']).length, FilePlus2)}{stat('Students', totalStudents, Users)}</div>
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Course List</h2><Button onClick={() => setView('create')}><FilePlus2 className="h-4 w-4" /> New course</Button></div>{table(courses)}</div>),
    all: table(courses), draft: table(by(['draft', 'changes_requested', 'unpublished'])), pending: table(by(['pending_review'])), published: table(by(['published'])), rejected: table(by(['rejected'])),
    create, content,
    students: (<div className="overflow-hidden rounded-2xl border border-border bg-card"><table className="w-full text-sm"><thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="p-4">Course</th><th className="p-4">Enrolled students</th></tr></thead><tbody>{courses.map((c) => <tr key={c.id} className="border-t border-border"><td className="p-4 font-medium">{c.title}</td><td className="p-4">{students[c.id] ?? 0}</td></tr>)}</tbody></table>{courses.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No students yet.</p>}</div>),
    plan: (<div className="grid gap-4 sm:grid-cols-3">{stat('Current plan', p.name, Crown)}{stat('Courses used', `${used}/${limit}`, GraduationCap)}{stat('Live days / week', p.liveDays, Users)}</div>),
  };

  return shell(<div className="flex flex-col gap-6 lg:flex-row">
    {sidebar}
    <section className="flex-1 min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-6 py-5">
        <div><h1 className="text-2xl font-bold">{titles[view]}</h1><p className="text-sm text-muted-foreground">{p.name} plan · {used}/{limit} courses · {totalStudents} students</p></div>
        <Button asChild variant="outline"><Link to="/academy">View Academy</Link></Button>
      </div>
      {body[view]}
    </section>
  </div>);
};
export default InstructorStudio;
