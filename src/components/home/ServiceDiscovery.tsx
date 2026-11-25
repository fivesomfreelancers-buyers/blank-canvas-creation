import { Link } from 'react-router-dom';
import { ArrowUpRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SearchGigResult } from '@/hooks/useGigSearch';
import { DISCOVERY_GROUPS } from '@/lib/homeDiscovery';

export default function ServiceDiscovery({ gigs, loading }: { gigs: SearchGigResult[]; loading: boolean }) {
  return <section className="px-4 pb-16 sm:px-6 lg:px-8" aria-label="Discover professional services"><div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
    {DISCOVERY_GROUPS.map(group => {
      const matches = gigs.filter(g => group.categories.includes(g.category));
      const featured = [...matches].sort((a,b) => b.completedOrders-a.completedOrders || b.rating-a.rating).slice(0,3);
      return <article key={group.title} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
        <div className="p-6"><h2 className="text-2xl font-semibold text-foreground">{group.title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{group.description}</p><div className="mt-4 flex flex-wrap gap-2">{group.tags.map(tag => <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{tag}</span>)}</div></div>
        <div className="mx-6 grid min-h-48 grid-cols-3 gap-2">{featured.length ? featured.map(gig => <Link key={gig.id} to={`/gig/${gig.slug || gig.id}`} className="group relative h-48 overflow-hidden rounded-lg bg-muted" title={gig.title}>
          {gig.freelancerAvatar || gig.image ? <img src={gig.freelancerAvatar || gig.image} alt={gig.freelancer} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-2xl font-semibold text-primary">{gig.freelancer.charAt(0)}</div>}
          <div className="absolute inset-x-0 bottom-0 bg-card/95 p-2"><p className="truncate text-xs font-semibold text-card-foreground">{gig.freelancer}</p><p className="mt-1 text-[11px] text-muted-foreground">From ${gig.price}</p></div>
        </Link>) : <div className={`col-span-3 flex h-48 items-center justify-center rounded-lg bg-muted text-muted-foreground ${loading ? 'animate-pulse' : ''}`}><ImageIcon className="h-8 w-8" aria-hidden /></div>}</div>
        <div className="mt-auto p-6"><Button variant="outline" asChild className="w-full"><Link to={`/services/${group.category}`}>Show talent <ArrowUpRight /></Link></Button></div>
      </article>;
    })}
  </div></section>;
}
