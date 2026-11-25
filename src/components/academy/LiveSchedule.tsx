import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Video,CalendarDays} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {db} from '@/lib/academy';
import {useAuth} from '@/hooks/useAuth';
export default function LiveSchedule({courseId}:{courseId?:string}){
 const {user}=useAuth();const [sessions,setSessions]=useState<any[]>([]);
 const load=async()=>{if(!user)return;let q=db.from('academy_live_sessions').select('*,academy_courses(title)').in('status',['scheduled','live']).order('starts_at');if(courseId)q=q.eq('course_id',courseId);const {data}=await q;setSessions(data??[]);};
 useEffect(()=>{load();if(!user)return;const c=db.channel(`learning-live-${crypto.randomUUID()}`).on('postgres_changes',{event:'*',schema:'public',table:'academy_live_sessions'},()=>load()).subscribe();return()=>{db.removeChannel(c);};},[user,courseId]);
 if(!user)return null;
 return <section className="space-y-4"><h2 className="text-xl font-bold flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/>Upcoming live classes</h2>{sessions.length===0?<p className="text-sm text-muted-foreground">No upcoming live classes.</p>:sessions.map(s=><div key={s.id} className="flex flex-wrap items-center gap-4 border border-border rounded-lg p-4 bg-card"><Video className="h-6 w-6 text-primary"/><div className="flex-1 min-w-0"><p className="font-semibold">{s.title}</p><p className="text-sm text-muted-foreground">{s.academy_courses?.title} · {new Date(s.starts_at).toLocaleString()}</p></div><Button asChild variant={s.status==='live'?'default':'outline'}><Link to={`/academy/classroom/${s.id}`}>{s.status==='live'?'Join live class':'Open classroom'}</Link></Button></div>)}</section>;
}
