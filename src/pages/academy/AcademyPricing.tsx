import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Crown, Gem, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ACADEMY_PLANS, type AcademyPlan } from '@/lib/academy';

const META: Record<AcademyPlan, { Icon: typeof Crown; tag: string; featured: boolean }> = {
  golden: { Icon: Crown, tag: 'Start teaching', featured: false },
  platinum: { Icon: Gem, tag: 'Most popular', featured: true },
};

const AcademyPricing: React.FC = () => {
  React.useEffect(() => { document.title = 'Academy Instructor Pricing | Fivesom'; }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">Fivesom Academy — Instructor Program</span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">Simple pricing for instructors</h1>
          <p className="mt-4 text-lg text-muted-foreground">Teach your skills, publish courses and grow a community of students. Pick the plan that fits how you teach.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {(Object.keys(ACADEMY_PLANS) as AcademyPlan[]).map((k) => {
            const p = ACADEMY_PLANS[k];
            const { Icon, tag, featured } = META[k];
            return (
              <article key={k} className={`relative flex flex-col rounded-3xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${featured ? 'border-primary shadow-[0_24px_60px_-28px_hsl(var(--primary)/0.6)]' : 'border-border'}`}>
                {featured && <span className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{tag}</span>}
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{p.name}</h2>
                    {!featured && <p className="text-xs text-muted-foreground">{tag}</p>}
                  </div>
                </div>
                <p className="mt-6 flex items-end gap-1 text-foreground"><span className="text-5xl font-bold">${p.price}</span><span className="pb-1.5 text-muted-foreground">/month</span></p>
                <p className="mt-2 text-sm font-medium text-primary">First month only ${p.firstMonth}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{f}</li>
                  ))}
                </ul>
                <Link to="/academy/become-instructor" className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full font-semibold transition-colors ${featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-border text-foreground hover:border-primary hover:text-primary'}`}>
                  Apply as instructor <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto">Monthly recurring subscription; cancel any time before renewal. Publishing starts only after Fivesom approves your application. Rejected applications are refunded.</p>
      </main>
      <Footer />
    </div>
  );
};
export default AcademyPricing;
