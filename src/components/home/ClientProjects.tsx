import lifeWolf from '@/assets/clients/lifewolf-cropped.png.asset.json';
import waliNews from '@/assets/clients/walinews-cropped.png.asset.json';

const clients = [
  { name: 'LifeWolf', logo: lifeWolf.url, service: "Luxury Streetwear / Premium Men's Fashion Branding", attribution: 'LifeWolf — Branding Client', quote: 'FIVESOM helped us bring our luxury streetwear vision to life with a professional brand identity that reflects the quality and direction of our business. The attention to detail and creative execution exceeded our expectations.' },
  { name: 'WaliNews', logo: waliNews.url, service: 'Professional News Website Development', attribution: 'WaliNews — Website Development Client', quote: 'FIVESOM transformed our vision into a professional news website with a clean design and an excellent user experience. The development process and final result gave our news platform a strong digital foundation.' },
];
export default function ClientProjects() {
  return <section className="px-4 py-16 sm:px-6 lg:px-8" aria-labelledby="clients-heading">
    <div className="mx-auto max-w-7xl">
      <div className="mb-9 text-center"><p className="mb-3 text-xs font-semibold text-primary">CLIENT PROJECTS</p><h2 id="clients-heading" className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Trusted by Businesses We've Helped Grow</h2><p className="mt-4 text-muted-foreground">Real businesses. Real projects. Real results.</p></div>
      <div className="grid gap-6 md:grid-cols-2">{clients.map(client => <article key={client.name} className="rounded-lg border border-border bg-card p-6 transition-transform duration-300 motion-safe:hover:-translate-y-1 sm:p-8">
        <div className="client-logo-surface flex h-44 items-center justify-center rounded-lg"><img src={client.logo} alt={`${client.name} logo`} loading="lazy" className="h-40 w-full object-contain" /></div>
        <h3 className="mt-6 text-xl font-semibold text-foreground">{client.name}</h3><p className="mt-2 text-sm font-medium text-primary">{client.service}</p>
        <p className="mt-5 text-xs font-semibold text-muted-foreground">Draft testimonial — awaiting client approval</p><blockquote className="mt-3 text-sm leading-7 text-muted-foreground">“{client.quote}”</blockquote><p className="mt-5 text-sm font-semibold text-foreground">{client.attribution}</p>
      </article>)}</div>
    </div>
  </section>;
}
