import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJobsData } from '@/hooks/useJobsData';
import { useAuth } from '@/hooks/useAuth';
import { Agreement, Application, jobLabel } from '@/lib/jobs';
import AgreementPanel from '@/components/jobs/AgreementPanel';
export default function MyApplications() {
  const { user } = useAuth(); const applications = useJobsData<Application>('job_applications', 'freelancer_user_id', user?.id); const agreements = useJobsData<Agreement>('job_agreements', 'freelancer_user_id', user?.id);
  return <section className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-heading text-3xl font-bold">My Applications</h1><Button asChild variant="outline"><Link to="/explore?view=jobs">Find Jobs</Link></Button></div>{applications.error && <p role="alert">{applications.error}</p>}{applications.loading ? <p>Loading applications…</p> : applications.rows.length === 0 ? <p className="py-12 text-muted-foreground">You have not applied to any jobs yet.</p> : applications.rows.map(a => { const agreement = agreements.rows.find(g => g.application_id === a.id); return <article className="space-y-4 rounded-lg border border-border bg-card p-5" key={a.id}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{agreement?.title || `Application · ${new Date(a.created_at).toLocaleDateString()}`}</h2><Badge variant="outline">{jobLabel(a.status)}</Badge></div><p className="whitespace-pre-wrap text-sm text-muted-foreground">{a.proposal}</p><p className="text-sm">${a.proposed_price} · {a.delivery_days} days</p><Button variant="outline" size="sm" asChild><Link to={`/jobs/${a.job_id}`}>View Job</Link></Button>{agreement && <AgreementPanel agreement={agreement} refresh={() => { void agreements.refresh(); }} />}</article>; })}</section>;
}