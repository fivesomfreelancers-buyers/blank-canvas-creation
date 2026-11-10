import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Search, Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/categories';
import { WORLD_LANGUAGES } from '@/lib/languages';
import { JOB_DURATIONS, Job } from '@/lib/jobs';
import { useJobsData } from '@/hooks/useJobsData';
import JobCard from './JobCard';
import { isIndexableJob } from '@/lib/seo/publicJobs';
import { useAccountState } from '@/hooks/useAccountState';
import { canShowJobPosting } from '@/lib/jobPostingAccess';
export default function JobsMarketplace() {
  const { rows, loading, error, refresh } = useJobsData<Job>('jobs', 'status', 'published');
  const { state: account, isLoading: accountLoading } = useAccountState();
  const canPostJob = canShowJobPosting(account, accountLoading);
  const [query, setQuery] = useState(''); const [category, setCategory] = useState('');
  const [experience, setExperience] = useState(''); const [location, setLocation] = useState('');
  const [duration, setDuration] = useState(''); const [language, setLanguage] = useState('');
  const [min, setMin] = useState(''); const [max, setMax] = useState(''); const [filters, setFilters] = useState(false);
  const jobs = rows.filter(j => isIndexableJob(j) && (!query || `${j.title} ${j.description} ${j.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())) && (!category || j.category === category) && (!experience || j.experience === experience) && (!location || j.work_location === location) && (!duration || j.duration === duration) && (!language || j.languages.includes(language)) && (!min || Number(j.budget_max) >= Number(min)) && (!max || Number(j.budget_min) <= Number(max)));
  const selectClass = 'h-11 min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground';
  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-heading text-3xl font-bold text-foreground">Find your next opportunity</h1><p className="mt-2 text-muted-foreground">Projects from buyers. Clear scope. Your next collaboration.</p></div>{canPostJob && <Button asChild><Link to="/buyer/jobs/new"><Plus size={17} /> Post a Job</Link></Button>}</div>
    <div className="flex flex-wrap gap-3"><div className="relative min-w-0 flex-1 basis-60"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search jobs or skills" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search jobs or skills…" className="h-11 pl-10" /></div><select aria-label="Job category" className={selectClass} value={category} onChange={e => setCategory(e.target.value)}><option value="">All categories</option>{CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select><Button variant="outline" onClick={() => setFilters(!filters)}><SlidersHorizontal size={16} />Filters</Button></div>
    {filters && <div className="grid grid-cols-1 gap-3 border-y border-border py-4 sm:grid-cols-3 lg:grid-cols-6"><select aria-label="Experience level" className={selectClass} value={experience} onChange={e => setExperience(e.target.value)}><option value="">Any experience</option><option value="entry">Entry level</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option></select><select aria-label="Work location" className={selectClass} value={location} onChange={e => setLocation(e.target.value)}><option value="">Any location</option><option value="remote">Remote</option><option value="on_site">On-site</option><option value="hybrid">Hybrid</option></select><select aria-label="Work duration" className={selectClass} value={duration} onChange={e => setDuration(e.target.value)}><option value="">Any duration</option>{JOB_DURATIONS.map(d => <option key={d}>{d}</option>)}</select><select aria-label="Job language" className={selectClass} value={language} onChange={e => setLanguage(e.target.value)}><option value="">Any language</option>{WORLD_LANGUAGES.map(l => <option key={l.name}>{l.name}</option>)}</select><Input aria-label="Minimum budget" type="number" min="0" placeholder="Min budget ($)" value={min} onChange={e => setMin(e.target.value)} /><Input aria-label="Maximum budget" type="number" min="0" placeholder="Max budget ($)" value={max} onChange={e => setMax(e.target.value)} /></div>}
    <div className="flex items-center justify-between border-b border-border pb-3 text-sm text-muted-foreground"><span>{loading ? 'Loading jobs…' : `${jobs.length} published jobs`}</span><span>Latest first</span></div>
    {error ? <div role="alert">{error}<Button variant="outline" onClick={refresh}>Try again</Button></div> : loading ? <div className="py-20 text-center text-muted-foreground">Loading opportunities…</div> : jobs.length ? <div className="grid gap-5 lg:grid-cols-2">{jobs.map(j => <JobCard key={j.id} job={j} />)}</div> : <div className="py-16 text-center"><Briefcase className="mx-auto mb-4 h-10 w-10 text-primary" /><h2 className="text-xl font-semibold text-foreground">No published jobs yet</h2><p className="mt-2 text-muted-foreground">{rows.length ? 'No jobs match these filters.' : 'Approved opportunities will appear here.'}</p></div>}
  </section>;
}