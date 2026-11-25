import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { categoryIcon } from '@/components/nav/ExploreMegaMenu';

const CategoryGrid: React.FC = () => (
  <section aria-labelledby="category-grid-heading" className="home-story-section">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 id="category-grid-heading" className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
        Find freelancers for every type of work
      </h2>
      <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {CATEGORIES.map((c) => {
          const Icon = categoryIcon(c.slug);
          return (
            <li key={c.slug}>
              <Link
                to={`/services/${c.slug}`}
                className="group relative flex h-full min-h-[9.5rem] flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" aria-hidden />
                </span>
                <span>
                  <span className="block text-base font-medium text-foreground leading-snug">{c.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{c.subcategories.length} services</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default CategoryGrid;
