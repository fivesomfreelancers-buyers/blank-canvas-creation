import { Link } from 'react-router-dom';
import { Briefcase, Clock, ArrowUpRight, MapPin, Languages } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { budgetLabel, Job, jobLabel } from '@/lib/jobs';
export default function JobCard({ job }: { job: Job }) {
  return <Link to={`/jobs/${job.id}`} className="group block min-w-0 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-xs font-bold text-primary"><Briefcase size={16} /> JOBS</span><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock size={14} /> {formatDistanceToNow(new Date(job.published_at || job.created_at), { addSuffix: true })}</span></div>
    <div className="flex items-start justify-between gap-4"><h2 className="font-heading text-xl font-semibold text-foreground group-hover:text-primary">{job.title}</h2><ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" /></div>
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-4"><strong className="text-lg text-foreground">{budgetLabel(job)}</strong><span className="text-xs text-muted-foreground">{jobLabel(job.payment_type)} price</span><span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Languages size={15} />{job.languages.join(', ')}</span></div>
    <p className="my-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
    <div className="flex flex-wrap gap-2">{job.skills.slice(0, 5).map(s => <span key={s} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{s}</span>)}</div>
    <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><MapPin size={13} />{jobLabel(job.work_location)}</span><span>{jobLabel(job.experience)}</span><span>{job.duration}</span></div>
  </Link>;
}