import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import lifeWolf from '@/assets/clients/lifewolf-cropped.png.asset.json';
import waliNews from '@/assets/clients/walinews-cropped.png.asset.json';

const clients = [
  { name: 'LifeWolf', heading: 'Build your Brand', tags: ['Brand identity', 'Luxury streetwear', 'Fashion branding'], logo: lifeWolf.url, service: "Luxury Streetwear / Premium Men's Fashion Branding", attribution: 'LifeWolf — Branding Client', quote: 'FIVESOM helped us bring our luxury streetwear vision to life with a professional brand identity that reflects the quality and direction of our business. The attention to detail and creative execution exceeded our expectations.' },
  { name: 'WaliNews', heading: 'Build your Digital Presence', tags: ['Website development', 'News platform', 'Digital publishing'], logo: waliNews.url, service: 'Professional News Website Development', attribution: 'WaliNews — Website Development Client', quote: 'FIVESOM transformed our vision into a professional news website with a clean design and an excellent user experience. The development process and final result gave our news platform a strong digital foundation.' },
];
export default function ClientProjects() {
  const [active, setActive] = useState('LifeWolf');
  return <section className="client-showcase px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="clients-heading">
    <div className="mx-auto max-w-7xl">
      <div className="mb-9 text-center"><p className="mb-3 text-xs font-semibold text-primary">CLIENT PROJECTS</p><h2 id="clients-heading" className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Trusted by Businesses We've Helped Grow</h2><p className="mt-4 text-muted-foreground">Real businesses. Real projects. Real results.</p></div>
      <div className="client-showcase-panels">{clients.map(client => {
        const selected = active === client.name;
        return <article key={client.name} data-active={selected} className="client-project-panel" onMouseEnter={() => setActive(client.name)} onFocusCapture={() => setActive(client.name)}>
          <Button variant="ghost" aria-expanded={selected} aria-controls={`client-${client.name}`} onClick={() => setActive(client.name)} className="client-project-selector h-auto w-full items-start justify-between gap-4 whitespace-normal rounded-none p-0 text-left text-foreground hover:bg-transparent hover:text-foreground">
            <span><span className="block text-xl font-semibold sm:text-2xl">{client.heading}</span><span className="mt-3 block text-sm font-medium text-muted-foreground">{client.name}</span></span>
            {selected ? <ArrowUpRight className="mt-1 shrink-0" /> : <Plus className="mt-1 shrink-0" />}
          </Button>
          <div id={`client-${client.name}`} hidden={!selected} className="client-project-details mt-5">
            <div className="mb-6 flex flex-wrap gap-2">{client.tags.map(tag => <span key={tag} className="rounded-full border border-border px-3 py-1 text-xs text-foreground">{tag}</span>)}</div>
            <div className="grid items-start gap-6 sm:grid-cols-[0.8fr_1.2fr]">
              <div className="client-logo-surface flex h-56 items-center justify-center rounded-lg p-5"><img src={client.logo} alt={`${client.name} logo`} loading="lazy" className="h-full w-full object-contain" /></div>
              <div><h3 className="text-base font-semibold leading-6 text-foreground">{client.service}</h3><p className="mt-4 text-xs font-medium text-muted-foreground">Draft testimonial — awaiting client approval</p><blockquote className="mt-3 text-sm leading-7 text-muted-foreground">“{client.quote}”</blockquote><p className="mt-5 text-sm font-semibold text-foreground">{client.attribution}</p></div>
            </div>
          </div>
        </article>;
      })}</div>
    </div>
  </section>;
}
