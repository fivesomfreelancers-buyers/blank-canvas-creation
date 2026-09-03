import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Globe2, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const POPULAR = [
  'Logo Design',
  'Video Editing',
  'Web Development',
  'Content Writing',
  'App UI Design',
  'Digital Marketing',
];

interface HomeHeroProps {
  gigCount: number;
  freelancerCount: number;
}

const HomeHero: React.FC<HomeHeroProps> = ({ gigCount, freelancerCount }) => {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/explore?q=${encodeURIComponent(term)}` : '/explore');
  };

  return (
    <section className="pt-20 sm:pt-24 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Globe2 className="w-3.5 h-3.5" />
          Global freelance marketplace with an African heart
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground mb-5">
          Hire skilled freelancers.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
            Turn your skills into income.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
          FIVESOM is a global freelance marketplace that connects clients with skilled
          freelancers in design, web development, video editing, writing, translation and
          digital marketing. Every order is protected by escrow: your payment is held
          securely and released to the freelancer only after you accept the delivered work.
        </p>

        <div className="max-w-2xl mx-auto mb-6">
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row items-stretch gap-2 p-1 rounded-2xl bg-card/60 backdrop-blur-lg border border-border shadow-xl"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search freelance services
            </label>
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 mr-3 text-muted-foreground shrink-0" aria-hidden />
              <input
                id="hero-search"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What service do you need? e.g. logo design"
                className="w-full py-3.5 bg-transparent outline-none text-sm sm:text-base text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              Search <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-8">
          <Link
            to="/explore"
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
          >
            Find a Freelancer
          </Link>
          <Link
            to="/register/freelancer"
            className="px-8 py-4 rounded-xl bg-card/60 backdrop-blur-lg border border-border text-foreground font-semibold hover:bg-card transition-all"
          >
            Become a Freelancer
          </Link>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground mb-8">
          <li className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" aria-hidden /> Escrow-protected payments
          </li>
          <li className="inline-flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" aria-hidden /> Verified freelancer profiles
          </li>
          {gigCount > 0 && (
            <li className="inline-flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" aria-hidden />
              {gigCount} service{gigCount === 1 ? '' : 's'} available now
            </li>
          )}
          {freelancerCount > 0 && (
            <li className="inline-flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-primary" aria-hidden />
              {freelancerCount} registered freelancer{freelancerCount === 1 ? '' : 's'}
            </li>
          )}
        </ul>

        <div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">Popular right now:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR.map((term) => (
              <Link
                key={term}
                to={`/explore?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs sm:text-sm font-medium transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
