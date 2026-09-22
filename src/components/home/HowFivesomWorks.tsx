import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Compass, MessagesSquare, ShieldCheck } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const STEPS = [
  {
    icon: Compass,
    title: 'Choose your path',
    text: 'Buyers explore useful freelance services. Freelancers create a professional profile and publish the skills they sell.',
  },
  {
    icon: ShieldCheck,
    title: 'Start a protected order',
    text: 'The buyer chooses a package, shares the brief and funds the order. Payment stays secured in escrow while work is underway.',
  },
  {
    icon: MessagesSquare,
    title: 'Collaborate clearly',
    text: 'Requirements, messages, progress and delivery files stay connected to the order for both sides to follow.',
  },
  {
    icon: CheckCircle2,
    title: 'Review and complete',
    text: 'The buyer reviews the delivery, requests a revision when needed, or accepts the work so freelancer earnings can be released.',
  },
];

const HowFivesomWorks: React.FC = () => (
  <section aria-labelledby="how-heading" className="home-story-section px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border">
    <div className="max-w-7xl mx-auto">
      <ScrollReveal className="max-w-3xl mb-12" from="left">
        <span className="home-kicker">One marketplace, one clear process</span>
        <h2 id="how-heading" className="home-story-title">How FIVESOM works</h2>
        <p className="home-story-copy">
          FIVESOM connects the client journey and the freelancer journey through one protected order.
          Each step moves naturally from finding the right service to delivering, reviewing and completing the work.
        </p>
      </ScrollReveal>

      <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4 [perspective:1200px]">
        <span className="escrow-flow-line hidden lg:block" aria-hidden />
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <ScrollReveal
            as="li"
            key={title}
            delay={index * 110}
            from="depth"
            className="relative z-[1] min-h-56 rounded-xl border border-border bg-card/95 p-6 shadow-lg"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
            </div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </ScrollReveal>
        ))}
      </ol>

      <ScrollReveal delay={160} className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Continue through the detailed buyer and freelancer journeys below, or read the complete process in the FIVESOM guide.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/how-it-works" className="home-story-link !mt-0">How it works <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          <Link to="/docs" className="home-secondary-link !mt-0">Documentation</Link>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default HowFivesomWorks;