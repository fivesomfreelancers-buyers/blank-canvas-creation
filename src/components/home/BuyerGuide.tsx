import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUYER_GUIDE } from '@/content/buyerGuide';
import { trackBuyerEvent } from '@/lib/buyerAnalytics';

export default function BuyerGuide() {
  return (
    <section aria-labelledby="buyer-guide-heading" className="home-story-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <span className="home-kicker">For businesses, startups and creators</span>
        <h2 id="buyer-guide-heading" className="home-story-title">{BUYER_GUIDE.heading}</h2>
        <p className="home-story-copy">{BUYER_GUIDE.intro}</p>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {BUYER_GUIDE.steps.map((step, index) => (
            <li key={step.title} className="border-t border-border pt-5">
              <span className="text-sm font-semibold text-primary">0{index + 1}</span>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-3xl border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">{BUYER_GUIDE.fee}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link to="/buyer/jobs/new" onClick={() => trackBuyerEvent('post_project_click')}>Post Your Project <ArrowRight className="h-4 w-4" aria-hidden /></Link></Button>
          <Button asChild variant="outline"><Link to="/services">Compare freelance services <ArrowRight className="h-4 w-4" /></Link></Button>
          <Button asChild variant="outline"><Link to="/support/trust-safety">Payments and dispute support</Link></Button>
        </div>
      </div>
    </section>
  );
}