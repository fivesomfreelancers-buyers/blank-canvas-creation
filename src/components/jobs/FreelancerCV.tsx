import { forwardRef } from 'react';
import { BadgeCheck, Briefcase, Globe, GraduationCap, MapPin, Star, Wrench } from 'lucide-react';
import { CV } from '@/lib/jobs';
export const FreelancerCV = forwardRef<HTMLDivElement, { cv: CV }>(function FreelancerCV({ cv }, ref) {
  const tools = Array.isArray(cv.software_tools) ? cv.software_tools.map(t => typeof t === 'string' ? t : (t as { name?: string }).name).filter(Boolean).join(', ') : cv.software_tools && typeof cv.software_tools === 'object' ? Object.values(cv.software_tools).flat().map(t => typeof t === 'string' ? t : '').filter(Boolean).join(', ') : '';
  return <div ref={ref} className="cv-sheet grid min-w-0 gap-6 rounded-lg border border-border p-5 sm:grid-cols-[210px_minmax(0,1fr)] sm:p-7">
    <aside className="min-w-0 space-y-6"><div className="text-center">{cv.profile_image_url ? <img src={cv.profile_image_url} crossOrigin="anonymous" alt={cv.full_name} className="mx-auto mb-4 h-32 w-32 rounded-full object-cover" /> : <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-secondary text-3xl font-bold">{cv.full_name.slice(0, 1)}</div>}<h2 className="font-heading text-2xl font-bold">{cv.full_name}</h2>{cv.professional_title && <p className="mt-1">{cv.professional_title}</p>}{cv.verified && <p className="mt-2 flex items-center justify-center gap-1 text-sm text-primary"><BadgeCheck size={16} />Verified Seller</p>}{cv.blue_tick && <p className="text-sm text-primary">Blue Tick</p>}{cv.review_count > 0 && <p className="mt-3 flex items-center justify-center gap-1 text-sm"><Star size={15} />{cv.rating} · {cv.review_count} reviews</p>}</div>
      {!!cv.skills?.length && <CVSection title="Skills" icon={<Briefcase size={17} />}><div className="flex flex-wrap gap-2">{cv.skills.map(s => <span key={s} className="rounded-md bg-secondary px-2 py-1 text-xs">{s}</span>)}</div></CVSection>}
      {!!cv.languages?.length && <CVSection title="Languages" icon={<Globe size={17} />}>{cv.languages.join(', ')}</CVSection>}
      {cv.years_experience && <CVSection title="Experience" icon={<Briefcase size={17} />}>{cv.years_experience}</CVSection>}
      {cv.education && <CVSection title="Education" icon={<GraduationCap size={17} />}>{cv.education}</CVSection>}
      {tools && <CVSection title="Software & Tools" icon={<Wrench size={17} />}>{tools}</CVSection>}
      {cv.location && <CVSection title="Location" icon={<MapPin size={17} />}>{cv.location}</CVSection>}
    </aside>
    <div className="min-w-0">{cv.bio && <section className="mb-7 border-b border-border pb-6"><h3 className="mb-3 font-heading text-2xl font-bold">About Me</h3><p className="whitespace-pre-wrap text-sm leading-7">{cv.bio}</p></section>}{cv.portfolio?.length > 0 && <section><h3 className="mb-4 font-heading text-2xl font-bold">Portfolio</h3><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{cv.portfolio.map((p, i) => <figure key={`${p.media_url}-${i}`} className="min-w-0 overflow-hidden rounded-md bg-secondary">{p.media_type === 'video' ? <><video crossOrigin="anonymous" controls preload="metadata" src={p.media_url} className="aspect-[4/3] w-full object-cover" /><figcaption className="p-3 text-sm">Video Portfolio</figcaption></> : <><img crossOrigin="anonymous" src={p.media_url} alt={`Portfolio work ${i + 1}`} className="aspect-[4/3] w-full object-cover" /><figcaption className="p-3 text-sm">Portfolio · {i + 1}</figcaption></>}</figure>)}</div></section>}</div>
    <footer className="border-t border-border pt-4 text-right text-xs text-muted-foreground sm:col-span-2">Fivesom.net</footer>
  </div>;
});
function CVSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="border-t border-border pt-4 text-sm"><h3 className="mb-2 flex items-center gap-2 font-semibold">{icon}{title}</h3>{children}</section>;
}