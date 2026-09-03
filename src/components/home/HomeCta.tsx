import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HomeCta: React.FC = () => (
  <section aria-labelledby="cta-heading" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 text-center">
      <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
        Ready to start on FIVESOM?
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
          Browse services <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
        <Link
          to="/register/freelancer"
          className="px-8 py-4 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
        >
          Start selling your skills
        </Link>
      </div>
    </div>
  </section>
);

export default HomeCta;
