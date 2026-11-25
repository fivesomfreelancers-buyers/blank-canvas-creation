import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, PlayCircle, CheckCircle2, FileText, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db, signedUrl } from '@/lib/academy';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [open, setOpen] = useState<{ lesson: any; video: string | null; file: string | null; text: string | null } | null>(null);

  const load = async () => {
    const { data: c } = await db.from('academy_courses').select('*').eq('id', courseId).maybeSingle();
    setCourse(c);
    const { data: l } = await db.from('academy_lessons').select('*').eq('course_id', courseId).order('position');
    setLessons(l ?? []);
    if (l?.length) setExpanded((e) => (e.length ? e : [l[0].module]));
    if (user) {
      const { data: e } = await db.from('academy_enrollments').select('*').eq('course_id', courseId).eq('student_id', user.id).maybeSingle();
      setEnrollment(e);
    }
  };
  useEffect(() => { load(); }, [courseId, user]);

  const isOwner = user && course && course.instructor_id === user.id;
  const canWatch = (l: any) => isOwner || enrollment || l.is_preview;

  const enroll = async () => {
    if (!user) { toast.error('Please sign in to enroll'); return; }
    const { error } = await db.from('academy_enrollments').insert({ course_id: courseId, student_id: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success('You are enrolled. Lessons are unlocked.');
    load();
  };

  const openLesson = async (l: any) => {
    if (!canWatch(l)) return;
    const { data, error } = await db.from('academy_lesson_content').select('*').eq('lesson_id', l.id).maybeSingle();
    if (error) { toast.error(error.message); return; }
    setOpen({ lesson: l, video: await signedUrl('academy-lessons', data?.video_path), file: await signedUrl('academy-lessons', data?.attachment_path), text: data?.text_body ?? null });
    if (enrollment && !enrollment.completed_lessons.includes(l.id)) {
      const done = [...enrollment.completed_lessons, l.id];
      await db.from('academy_enrollments').update({ completed_lessons: done }).eq('id', enrollment.id);
      setEnrollment({ ...enrollment, completed_lessons: done });
    }
  };

  if (!course) return <div className="min-h-screen bg-background"><Navbar /><p className="p-10 text-center text-muted-foreground">Course not found.</p></div>;
  const modules = Array.from(new Set(lessons.map((l) => l.module)));
  const free = Number(course.price) === 0;
  const total = lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0);
  const fmt = (n: number) => (n >= 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n}m`);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${course.title} — Fivesom Academy`} description={course.short_description} canonical={`/academy/course/${course.id}`} />
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Link to="/academy" className="text-sm text-primary">← Fivesom Academy</Link>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">{course.short_description}</p>
          {open ? (
            <Card><CardContent className="p-4 space-y-3">
              <h2 className="font-semibold">{open.lesson.title}</h2>
              {open.video && <video src={open.video} controls controlsList="nodownload" className="w-full rounded-lg bg-muted" />}
              {open.text && <p className="whitespace-pre-wrap text-sm">{open.text}</p>}
              {open.file && <a href={open.file} target="_blank" rel="noreferrer" className="text-primary text-sm inline-flex gap-1"><FileText className="h-4 w-4" /> Open lesson material</a>}
            </CardContent></Card>
          ) : course.intro_video_url ? (
            <video src={course.intro_video_url} controls className="w-full rounded-xl bg-muted" poster={course.thumbnail_url ?? undefined} />
          ) : course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full rounded-xl" />}
          <section><h2 className="text-xl font-bold mb-2">About this course</h2><p className="whitespace-pre-wrap text-sm">{course.description}</p></section>
          {course.objectives && <section><h2 className="text-xl font-bold mb-2">What you will learn</h2><p className="whitespace-pre-wrap text-sm">{course.objectives}</p></section>}
          {course.requirements && <section><h2 className="text-xl font-bold mb-2">Requirements</h2><p className="whitespace-pre-wrap text-sm">{course.requirements}</p></section>}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
              <div><h2 className="text-2xl font-bold">Curriculum</h2>
              <p className="text-sm text-muted-foreground"><b className="text-foreground">{modules.length}</b> sections · <b className="text-foreground">{lessons.length}</b> lessons{total > 0 && <> · <b className="text-foreground">{fmt(total)}</b> total</>}</p></div>
              {modules.length > 0 && <button className="text-sm font-medium text-primary" onClick={() => setExpanded(expanded.length === modules.length ? [] : modules)}>{expanded.length === modules.length ? 'Collapse all' : 'Expand all'}</button>}
            </div>
            <div className="space-y-3">{modules.map((m, si) => {
              const ls = lessons.filter((l) => l.module === m);
              const isOpen = expanded.includes(m);
              const mins = ls.reduce((a, l) => a + (l.duration_minutes || 0), 0);
              const previews = ls.filter((l) => l.is_preview).length;
              return (
              <div key={m} className="rounded-2xl border border-border bg-card overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? expanded.filter((x) => x !== m) : [...expanded, m])} aria-expanded={isOpen} className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/40">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${isOpen ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{String(si + 1).padStart(2, '0')}</span>
                  <span className="flex-1 min-w-0"><span className="block font-semibold">{m}</span>
                    <span className="block text-xs text-muted-foreground">{ls.length} lessons{mins > 0 && ` · ${fmt(mins)}`}{previews > 0 && <b className="text-foreground"> · {previews} free preview{previews > 1 ? 's' : ''}</b>}</span></span>
                  {isOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                </button>
                {isOpen && <ul className="border-t border-border p-2 space-y-1">{ls.map((l, li) => (
                  <li key={l.id}>
                    <button onClick={() => openLesson(l)} disabled={!canWatch(l)} className={`w-full text-left flex items-center gap-3 rounded-xl p-3 disabled:cursor-not-allowed ${canWatch(l) ? 'hover:bg-muted/60' : ''} ${open?.lesson.id === l.id ? 'bg-muted' : ''}`}>
                      <span className="w-6 text-xs text-muted-foreground">{String(li + 1).padStart(2, '0')}</span>
                      {canWatch(l) ? (enrollment?.completed_lessons.includes(l.id) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <PlayCircle className="h-5 w-5 text-primary" />) : <Lock className="h-5 w-5 text-muted-foreground" />}
                      <span className="flex-1 min-w-0"><span className={`font-medium ${canWatch(l) ? '' : 'text-muted-foreground'}`}>{l.title}</span>{l.is_preview && <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">FREE</span>}{l.description && <span className="block text-xs text-muted-foreground">{l.description}</span>}</span>
                      {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
                    </button>
                  </li>))}</ul>}
              </div>);
            })}</div>
            {lessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons yet.</p>}
          </section>
        </div>
        <aside>
          <Card className="sticky top-24"><CardContent className="p-5 space-y-3">
            <p className="text-3xl font-bold">{free ? 'Free' : `$${Number(course.price).toFixed(2)}`}</p>
            <p className="text-sm text-muted-foreground">{course.level} · {course.language}{course.duration ? ` · ${course.duration}` : ''}</p>
            {isOwner ? <Button asChild className="w-full"><Link to="/academy/studio">Manage in Studio</Link></Button>
              : enrollment ? <p className="text-sm font-semibold text-primary">You are enrolled — {enrollment.completed_lessons.length}/{lessons.length} lessons completed</p>
              : free ? <Button className="w-full" onClick={enroll}>Enroll for free</Button>
              : <p className="text-sm text-muted-foreground">Paid enrollment opens soon. Preview lessons are available now.</p>}
          </CardContent></Card>
        </aside>
      </main>
      <Footer />
    </div>
  );
};
export default CourseDetail;
