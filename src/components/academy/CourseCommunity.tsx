import { useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/academy';
import { toast } from 'sonner';

type Post = { id: string; author_id: string; body: string; created_at: string };
export default function CourseCommunity({ courseId, instructorId }: { courseId: string; instructorId: string }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    const { data, error } = await db.from('academy_community_posts').select('id,author_id,body,created_at').eq('course_id', courseId).order('created_at', { ascending: false });
    setError(error ? 'Could not load the course community.' : '');
    if (!error) setPosts(data ?? []);
  };
  useEffect(() => {
    if (!user) return;
    load();
    const channel = db.channel(`course-community-${courseId}-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'academy_community_posts', filter: `course_id=eq.${courseId}` }, load).subscribe();
    return () => { db.removeChannel(channel); };
  }, [courseId, user]);
  const send = async () => {
    if (!user || !body.trim() || busy) return;
    setBusy(true);
    try {
      const { error } = await db.from('academy_community_posts').insert({ course_id: courseId, author_id: user.id, body: body.trim() });
      if (error) throw error;
      setBody('');
      await load();
    } catch { toast.error('Could not send your community message. Please try again.'); }
    finally { setBusy(false); }
  };
  return <section className="chat-bg space-y-4 rounded-2xl p-4">
    <h2 className="flex items-center gap-2 text-xl font-bold"><MessageSquare className="h-5 w-5 text-primary" />Course community</h2>
    <Textarea aria-label="Community message" placeholder="Message your course community…" value={body} onChange={e => setBody(e.target.value)} rows={3} />
    <Button onClick={send} disabled={busy || !body.trim()}><Send className="h-4 w-4" />{busy ? 'Sending…' : 'Send message'}</Button>
    {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : posts.length === 0 ? <p className="text-sm text-muted-foreground">No community messages yet.</p> : <div className="divide-y divide-border">{posts.map(post => <article key={post.id} className="py-4 space-y-2">
      <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{post.author_id === user?.id ? 'You' : post.author_id === instructorId ? 'Instructor' : 'Student'} · {new Date(post.created_at).toLocaleString()}</p>
        {(post.author_id === user?.id || instructorId === user?.id) && <Button size="icon" variant="ghost" aria-label="Delete community message" onClick={async () => {
          const { error } = await db.from('academy_community_posts').delete().eq('id', post.id);
          if (error) toast.error('Could not delete this message.'); else load();
        }}><Trash2 className="h-4 w-4" /></Button>}
      </div><p className="whitespace-pre-wrap break-words text-sm">{post.body}</p>
    </article>)}</div>}
  </section>;
}