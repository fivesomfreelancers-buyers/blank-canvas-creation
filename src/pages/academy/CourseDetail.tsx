import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, PlayCircle, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { db, signedUrl } from '@/lib/academy';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [open, setOpen] = useState<{ lesson: any; video: string | null; file: string | null; text: string | null } | null>(null);

  const load = async () => {
    const { data: c } = await db.from('academy_courses').select('*').eq('id', courseId).maybeSingle();
    setCourse(c);
    const { data: l } = await db.from('academy_lessons').select('*').eq('course_id', courseId).order('position');
    setLessons(l ?? []);
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
            <h2 className="text-xl font-bold mb-2">Curriculum</h2>
            {modules.map((m) => (
              <div key={m} className="mb-4">
                <p className="font-semibold mb-2">{m}</p>
                <ul className="space-y-2">{lessons.filter((l) => l.module === m).map((l) => (
                  <li key={l.id}>
                    <button onClick={() => openLesson(l)} disabled={!canWatch(l)} className="w-full text-left flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 disabled:cursor-not-allowed">
                      {canWatch(l) ? (enrollment?.completed_lessons.includes(l.id) ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <PlayCircle className="h-5 w-5 text-primary" />) : <Lock className="h-5 w-5 text-muted-foreground" />}
                      <span className="flex-1"><span className="block font-medium">{l.title}</span>{l.description && <span className="block text-xs text-muted-foreground">{l.description}</span>}</span>
                      {l.duration_minutes && <span className="text-xs text-muted-foreground">{l.duration_minutes} min</span>}
                    </button>
                  </li>))}</ul>
              </div>
            ))}
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
