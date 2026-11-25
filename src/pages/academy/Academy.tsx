import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, PlayCircle, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ACADEMY_PLANS, db } from '@/lib/academy';

const Academy = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [learning, setLearning] = useState<any[]>([]);
  const [instructor, setInstructor] = useState<string | null>(null);

  useEffect(() => {
    db.from('academy_courses').select('*').eq('status', 'published').order('created_at', { ascending: false })
      .then(({ data }: any) => setCourses(data ?? []));
  }, []);
  useEffect(() => {
    if (!user) return;
    db.from('academy_enrollments').select('*, academy_courses(id,title,thumbnail_url)').eq('student_id', user.id)
      .then(({ data }: any) => setLearning(data ?? []));
    db.rpc('is_approved_instructor', { _uid: user.id }).then(({ data }: any) => setInstructor(data ?? null));
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Fivesom Academy — Learn from professional freelancers" description="Courses, recorded lessons and live classes taught by approved Fivesom instructors." canonical="/academy" />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        <section className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4"><GraduationCap className="h-3.5 w-3.5 mr-1" /> Fivesom Academy</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Learn skills that clients pay for</h1>
          <p className="mt-4 text-muted-foreground text-lg">Courses taught by approved Fivesom professionals. Watch lessons, join the community and grow your career.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild><a href="#courses">Browse courses</a></Button>
            {instructor ? <Button asChild variant="outline"><Link to="/academy/studio">Instructor Studio</Link></Button>
              : <Button asChild variant="outline"><Link to="/academy/become-instructor">Become an Instructor</Link></Button>}
          </div>
        </section>

        {user && learning.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">My Learning</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {learning.map((e) => (
                <Link key={e.id} to={`/academy/course/${e.course_id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition">
                    {e.academy_courses?.thumbnail_url && <img src={e.academy_courses.thumbnail_url} alt="" className="aspect-video w-full object-cover" />}
                    <CardContent className="p-3"><p className="font-semibold line-clamp-2">{e.academy_courses?.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{e.completed_lessons.length} lessons completed · Continue learning</p></CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="courses">
          <h2 className="text-2xl font-bold mb-4">Courses</h2>
          {courses.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No published courses yet. Approved instructors' courses will appear here.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {courses.map((c) => (
                <Link key={c.id} to={`/academy/course/${c.id}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition">
                    {c.thumbnail_url ? <img src={c.thumbnail_url} alt="" className="aspect-video w-full object-cover" />
                      : <div className="aspect-video bg-muted flex items-center justify-center"><PlayCircle className="h-8 w-8 text-muted-foreground" /></div>}
                    <CardContent className="p-3 space-y-1">
                      <p className="font-semibold line-clamp-2">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.level} · {c.language}</p>
                      <p className="font-bold text-primary">{Number(c.price) === 0 ? 'Free' : `$${Number(c.price).toFixed(2)}`}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">Teach on Fivesom Academy</h2>
          <p className="text-muted-foreground mb-6">Share your skills, publish courses and teach students live.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {(Object.keys(ACADEMY_PLANS) as (keyof typeof ACADEMY_PLANS)[]).map((k) => {
              const p = ACADEMY_PLANS[k];
              return (
                <Card key={k}><CardContent className="p-6">
                  <h3 className="text-xl font-bold">{p.name} Plan</h3>
                  <p className="mt-1"><span className="text-3xl font-bold">${p.price}</span>/month · <span className="text-primary font-semibold">first month ${p.firstMonth}</span></p>
                  <ul className="mt-4 space-y-1.5 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0" />{f}</li>)}</ul>
                </CardContent></Card>
              );
            })}
          </div>
          <Button asChild className="mt-6"><Link to="/academy/become-instructor">Apply as Instructor</Link></Button>
        </section>
      </main>
      <Footer />
    </div>
  );
};
export default Academy;
