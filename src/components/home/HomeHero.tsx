import React, { useEffect, useState } from 'react';
import { Search, ArrowRight, ShieldCheck, Globe2, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TypingHeadline from './TypingHeadline';
import { CATEGORIES } from '@/lib/categories';
import { Button } from '@/components/ui/button';

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

  // Rotating example service names (the 9 official categories) shown in the search box.
  const examples = CATEGORIES.map((c) => c.name);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [exampleVisible, setExampleVisible] = useState(true);

  useEffect(() => {
    if (examples.length < 2) return;
    const fadeOut = window.setInterval(() => {
      setExampleVisible(false);
      window.setTimeout(() => {
        setExampleIndex((i) => (i + 1) % examples.length);
        setExampleVisible(true);
      }, 350);
    }, 2600);
    return () => window.clearInterval(fadeOut);
  }, [examples.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/explore?q=${encodeURIComponent(term)}` : '/explore');
  };

  return (
    <section className="border-b border-border bg-background px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Globe2 className="w-3.5 h-3.5" />
          Global freelance marketplace with an African heart
        </div>

        <h1 className="mx-auto mb-6 min-h-[2.4em] max-w-5xl text-4xl font-bold leading-tight text-foreground sm:min-h-[2.3em] sm:text-5xl md:text-6xl">
          Hire skilled African freelancers.{' '}
          <TypingHeadline
            className="text-primary"
            phrases={[
              'Turn your skills into income.',
              'Find clients and grow your career.',
              'Work with clients worldwide.',
              'Build your freelance business.',
              'Get paid for your skills.',
            ]}
          />
        </h1>

        <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
          FIVESOM is a freelance marketplace connecting African freelancers — from Somalia,
          Somaliland, Ethiopia, Djibouti, Kenya, Nigeria and beyond — with clients worldwide,
          across design, web development, video editing, writing, translation and digital
          marketing. Every order is protected by escrow: your payment is held securely and
          released to the freelancer only after you accept the delivered work.
        </p>

        <div className="mx-auto mb-6 max-w-3xl">
          <form
            onSubmit={submit}
            className="flex items-stretch gap-2 rounded-lg border border-border bg-card p-1.5 shadow-lg"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search freelance services
            </label>
            <div className="flex-1 flex items-center px-4 relative">
              <Search className="w-5 h-5 mr-3 text-muted-foreground shrink-0" aria-hidden />
              <input
                id="hero-search"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`What service do you need? e.g. ${examples[exampleIndex]}`}
                className="w-full py-3.5 bg-transparent outline-none text-sm sm:text-base text-foreground placeholder:text-transparent relative z-10"
              />
              {!q && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-12 right-4 flex items-center gap-1.5 text-sm sm:text-base text-muted-foreground truncate"
                >
                  What service do you need? e.g.
                  <span
                    className={`text-primary font-medium transition-all duration-300 ${
                      exampleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                    }`}
                  >
                    {examples[exampleIndex]}
                  </span>
                </span>
              )}
            </div>
            <Button type="submit" size="lg" className="h-auto shrink-0 px-6">
              Search <ArrowRight className="w-4 h-4" aria-hidden />
            </Button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center mb-8">
          <Button size="lg" asChild><Link to="/explore">Find a freelancer</Link></Button>
          <Button size="lg" variant="outline" asChild><Link to="/register/freelancer">Sell your services</Link></Button>
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
