
import React, { useEffect, useState } from 'react';
import { Palette, Video, Clapperboard, Monitor, PenTool, Smartphone, Brush, Code, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CategoryStat { sellers: number; rating: number }

/** Real seller counts: exact up to 99, then bucketed as 100+, 200+, ... */
const formatSellers = (n: number) => (n < 100 ? String(n) : `${Math.floor(n / 100) * 100}+`);

const FeaturedCategories = () => {
  const [stats, setStats] = useState<Record<string, CategoryStat>>({});

  useEffect(() => {
    (async () => {
      try {
        const { data: gigs } = await supabase
          .from('gigs')
          .select('id, category_slug, freelancer_id')
          .eq('status', 'active');
        const { data: reviews } = await (supabase as any)
          .from('public_gig_reviews')
          .select('gig_id, rating');

        const gigCategory = new Map<string, string>();
        const sellersByCat = new Map<string, Set<string>>();
        (gigs || []).forEach((g: any) => {
          const slug = g.category_slug || '';
          if (!slug) return;
          gigCategory.set(g.id, slug);
          if (!sellersByCat.has(slug)) sellersByCat.set(slug, new Set());
          if (g.freelancer_id) sellersByCat.get(slug)!.add(g.freelancer_id);
        });

        const ratingByCat = new Map<string, { sum: number; count: number }>();
        (reviews || []).forEach((r: any) => {
          const slug = gigCategory.get(r.gig_id);
          if (!slug) return;
          const cur = ratingByCat.get(slug) || { sum: 0, count: 0 };
          cur.sum += Number(r.rating) || 0;
          cur.count += 1;
          ratingByCat.set(slug, cur);
        });

        const next: Record<string, CategoryStat> = {};
        sellersByCat.forEach((set, slug) => {
          const r = ratingByCat.get(slug);
          next[slug] = { sellers: set.size, rating: r && r.count ? r.sum / r.count : 0 };
        });
        setStats(next);
      } catch (err) {
        console.error('Failed to load category stats', err);
      }
    })();
  }, []);


  const categories = [
    {
      id: 'logo-design',
      title: 'Logo Design',
      icon: Palette,
      description: 'Professional logo design for your brand',
      subcategories: ['Minimalist Design', 'Mascot Design', 'Typography Design'],
      gradient: 'from-pink-400 to-red-500'
    },
    {
      id: 'video-editing',
      title: 'Video Editing',
      icon: Video,
      description: 'Professional video editing services',
      subcategories: ['YouTube Editing', 'Social Media', 'Commercial Video'],
      gradient: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'motion-graphics',
      title: 'Motion Graphics',
      icon: Clapperboard,
      description: 'Logo animation, explainers & animated ads',
      subcategories: ['Logo Animation', 'Explainer Videos', 'Lottie Animation'],
      gradient: 'from-violet-400 to-purple-600'
    },
    {
      id: 'web-design',
      title: 'Web Design',
      icon: Monitor,
      description: 'Modern and responsive web design',
      subcategories: ['Landing Pages', 'E-commerce', 'Portfolio Sites'],
      gradient: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'content-writing',
      title: 'Content Writing',
      icon: PenTool,
      description: 'High-quality content for your business',
      subcategories: ['Blog Writing', 'Product Descriptions', 'Website Copy'],
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      id: 'app-ui-design',
      title: 'App UI Design',
      icon: Smartphone,
      description: 'Beautiful UI/UX design for apps',
      subcategories: ['Mobile App UI', 'Web App Design', 'UX Prototyping'],
      gradient: 'from-orange-400 to-red-500'
    },
    {
      id: 'graphic-design',
      title: 'Graphic Design',
      icon: Brush,
      description: 'Flyers, posters, branding & more',
      subcategories: ['Flyer Design', 'Poster Design', 'Social Media Graphics'],
      gradient: 'from-fuchsia-400 to-pink-500'
    },
    {
      id: 'app-development',
      title: 'App Development',
      icon: Code,
      description: 'iOS, Android & cross-platform apps',
      subcategories: ['iOS Apps', 'Android Apps', 'Flutter / React Native'],
      gradient: 'from-amber-400 to-orange-500'
    },
    {
      id: 'web-development',
      title: 'Web Development',
      icon: Globe,
      description: 'Modern websites & web applications',
      subcategories: ['Business Websites', 'E-commerce', 'Web Apps'],
      gradient: 'from-teal-400 to-cyan-500'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Explore Our Featured Categories
            </h2>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Discover professional services across specialized categories, 
              each designed to help your business grow and succeed.
            </p>
          </div>

          {/* Alternating Category Layout */}
          <div className="space-y-16">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Category Card */}
                <div className="flex-1 lg:max-w-md">
                  <Link
                    to={`/explore?category=${category.id}`}
                    className="group block backdrop-blur-lg rounded-3xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-card/70 border border-border hover:bg-card/90"
                  >
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <category.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-foreground">
                      {category.title}
                    </h3>
                    
                    <p className="text-base mb-6 leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>
                    
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-primary">
                        SPECIALTIES
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub) => (
                          <div key={sub} className="text-sm px-4 py-2 rounded-full bg-muted/70 text-muted-foreground">
                            {sub}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 inline-flex items-center text-sm font-medium text-primary group-hover:text-primary-foreground transition-colors">
                      Explore Category
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </Link>
                </div>

                {/* Content Side */}
                <div className={`flex-1 ${index % 2 === 1 ? 'lg:pr-8' : 'lg:pl-8'}`}>
                  <div className={`${index % 2 === 1 ? 'lg:text-right' : 'lg:text-left'} text-center`}>
                    <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                      Featured Category
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                      Professional {category.title}
                    </h3>
                    
                    <p className="text-xl leading-relaxed mb-8 text-muted-foreground">
                      Connect with expert freelancers who specialize in {category.title.toLowerCase()}. 
                      From concept to completion, get professional results that exceed your expectations.
                    </p>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold mb-1 text-primary">
                            {formatSellers(stats[category.id]?.sellers ?? 0)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expert Freelancers
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold mb-1 text-primary">
                            {(stats[category.id]?.rating ?? 0).toFixed(1)}★
                          </div>
                          <p className="text-sm text-muted-foreground">
                          Average Rating
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
