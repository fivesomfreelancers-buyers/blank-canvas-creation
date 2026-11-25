import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { db, signedUrl } from '@/lib/academy';

const AdminAcademy = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [open, setOpen] = useState<any>(null);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    const { data } = await db.from('instructor_applications').select('*').order('created_at', { ascending: false });
    setApps(data ?? []);
    const { data: c } = await db.from('academy_courses').select('*').order('created_at', { ascending: false });
    setCourses(c ?? []);
  };
  useEffect(() => { load(); }, []);

  const view = async (a: any) => {
    setOpen(a); setReason(a.review_reason ?? ''); setNotes(a.internal_notes ?? '');
    const certs = await Promise.all((a.certificate_paths ?? []).map((p: string) => signedUrl('academy-applications', p)));
    const u: Record<string, string | null> = { id: await signedUrl('academy-applications', a.id_document_path), selfie: await signedUrl('academy-applications', a.selfie_path), video: await signedUrl('academy-applications', a.intro_video_path) };
    certs.forEach((c, i) => { u[`cert${i}`] = c; });
    setUrls(u);
  };
  const decide = async (decision: string) => {
    const { error } = await db.rpc('review_instructor_application', { _id: open.id, _decision: decision, _reason: reason || null, _notes: notes || null });
    if (error) { toast.error(error.message); return; }
    toast.success(`Application ${decision.replace('_', ' ')}`); setOpen(null); load();
  };
  const reviewCourse = async (id: string, decision: string) => {
    const r = decision === 'published' ? '' : (window.prompt('Reason for the instructor') ?? '');
    const { error } = await db.rpc('review_academy_course', { _id: id, _decision: decision, _reason: r });
    if (error) toast.error(error.message); else { toast.success('Course updated'); load(); }
  };
  const pending = apps.filter((a) => a.status === 'pending_review').length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fivesom Academy</h1>
      <Tabs defaultValue="apps">
        <TabsList><TabsTrigger value="apps">Instructor Applications {pending > 0 && <Badge className="ml-2">{pending}</Badge>}</TabsTrigger><TabsTrigger value="courses">Courses</TabsTrigger></TabsList>
        <TabsContent value="apps" className="space-y-3">
          {open ? (<Card><CardContent className="p-5 space-y-3 text-sm">
            <Button size="sm" variant="ghost" onClick={() => setOpen(null)}>← Back</Button>
            <h2 className="text-xl font-bold">{open.legal_name} ({open.display_name}) — {open.plan} plan</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {[['Phone', open.phone], ['Location', `${open.city}, ${open.country}`], ['Date of birth', open.date_of_birth], ['Languages', open.teaching_languages?.join(', ')], ['Subjects', open.subjects], ['Expertise', open.expertise], ['Experience', `${open.years_experience} years`], ['Levels', open.student_levels?.join(', ')], ['Taught before', open.taught_before ? 'Yes' : 'No'], ['Availability', `${open.availability_days?.join(', ')} ${open.availability_times ?? ''} ${open.time_zone ?? ''}`], ['Links', open.links]].map(([k, v]) => <p key={k as string}><b>{k}:</b> {v || '—'}</p>)}
            </div>
            <p><b>Background:</b> {open.background}</p><p><b>Qualifications:</b> {open.qualifications || '—'}</p><p><b>Why qualified:</b> {open.why_qualified}</p><p><b>Bio:</b> {open.bio}</p>
            <div className="flex flex-wrap gap-3">{urls.id && <a className="text-primary" href={urls.id} target="_blank" rel="noreferrer">ID document</a>}{urls.selfie && <a className="text-primary" href={urls.selfie} target="_blank" rel="noreferrer">Selfie</a>}
              {Object.keys(urls).filter((k) => k.startsWith('cert')).map((k, i) => urls[k] && <a key={k} className="text-primary" href={urls[k]!} target="_blank" rel="noreferrer">Certificate {i + 1}</a>)}</div>
            {urls.video && <video src={urls.video} controls className="w-full max-h-96 rounded-lg bg-muted" />}
            <Textarea placeholder="Reason for the applicant (required to reject or request changes)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Textarea placeholder="Internal review notes (staff only)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex flex-wrap gap-2"><Button onClick={() => decide('approved')}>Approve</Button><Button variant="outline" onClick={() => decide('changes_requested')}>Request more info</Button><Button variant="destructive" onClick={() => decide('rejected')}>Reject</Button>{open.status === 'approved' && <Button variant="outline" onClick={() => decide('suspended')}>Suspend</Button>}</div>
          </CardContent></Card>) : apps.length === 0 ? <p className="text-muted-foreground text-sm">No applications yet.</p> : apps.map((a) => (
            <Card key={a.id}><CardContent className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-0"><p className="font-semibold">{a.legal_name}</p><p className="text-xs text-muted-foreground">{a.expertise} · {a.plan} · {new Date(a.created_at).toLocaleString()}</p></div>
              <Badge variant={a.status === 'pending_review' ? 'default' : 'secondary'}>{a.status.replace('_', ' ')}</Badge>
              <Button size="sm" onClick={() => view(a)}>Review</Button>
            </CardContent></Card>))}
        </TabsContent>
        <TabsContent value="courses" className="space-y-3">
          {courses.length === 0 && <p className="text-muted-foreground text-sm">No courses yet.</p>}
          {courses.map((c) => (<Card key={c.id}><CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0"><a href={`/academy/course/${c.id}`} target="_blank" rel="noreferrer" className="font-semibold hover:underline">{c.title}</a><p className="text-xs text-muted-foreground">{c.category} · ${Number(c.price).toFixed(2)}</p></div>
            <Badge variant="secondary">{c.status.replace('_', ' ')}</Badge>
            {c.status !== 'published' && <Button size="sm" onClick={() => reviewCourse(c.id, 'published')}>Approve & Publish</Button>}
            {c.status === 'pending_review' && <Button size="sm" variant="outline" onClick={() => reviewCourse(c.id, 'changes_requested')}>Request changes</Button>}
            {c.status === 'published' && <Button size="sm" variant="outline" onClick={() => reviewCourse(c.id, 'unpublished')}>Unpublish</Button>}
            {c.status !== 'rejected' && <Button size="sm" variant="destructive" onClick={() => reviewCourse(c.id, 'rejected')}>Reject</Button>}
          </CardContent></Card>))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default AdminAcademy;
