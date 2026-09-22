import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const HomeCta: React.FC = () => (
  <section aria-labelledby="cta-heading" className="home-story-section px-4 sm:px-6 lg:px-8">
    <ScrollReveal from="depth" className="relative max-w-6xl mx-auto overflow-hidden rounded-2xl border border-primary/30 bg-card p-8 sm:p-14 lg:p-20 text-center shadow-2xl">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <span className="home-kicker mx-auto">The next step is yours</span>
      <h2 id="cta-heading" className="home-story-title mx-auto max-w-4xl">
        Ready to turn skills into opportunities?
      </h2>
      <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8">
        Creating an account is free. Clients can browse services and message freelancers before
        ordering, and freelancers can publish gigs and start selling the same day.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/explore"
          className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
        >
          Find a Freelancer <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
        <Link
          to="/register/freelancer"
          className="px-8 py-4 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
        >
          Become a Freelancer
        </Link>
      </div>
    </ScrollReveal>
  </section>
);

export default HomeCta;
