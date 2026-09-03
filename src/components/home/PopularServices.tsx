import React from 'react';
import { Link } from 'react-router-dom';
import {
  Palette,
  Video,
  Monitor,
  Code2,
  Smartphone,
  PenTool,
  LayoutTemplate,
  Clapperboard,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface ServiceCategory {
  slug: string;
  title: string;
  icon: React.ElementType;
  what: string;
}

const SERVICES: ServiceCategory[] = [
  {
    slug: 'logo-design',
    title: 'Logo & Graphic Design',
    icon: Palette,
    what:
      'Logos, brand kits, flyers, posters and social media graphics. Designers deliver editable source files plus web-ready exports so you can use the artwork everywhere.',
  },
  {
    slug: 'video-editing',
    title: 'Video Editing',
    icon: Video,
    what:
      'Editing for YouTube, TikTok, Instagram Reels and business promos — cutting, subtitles, colour correction, sound and motion graphics delivered as a finished export.',
  },
  {
    slug: 'web-design',
    title: 'Web Design',
    icon: Monitor,
    what:
      'Landing pages, business sites and online shops designed for conversion, with responsive layouts that work on phones as well as desktops.',
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    icon: Code2,
    what:
      'Building and coding websites, dashboards and web apps — including forms, payments, admin panels, bug fixes and speed improvements on an existing site.',
  },
  {
    slug: 'app-development',
    title: 'App Development',
    icon: Smartphone,
    what:
      'Android, iOS and cross-platform mobile apps built with Flutter or React Native, from a first prototype to a store-ready release.',
  },
  {
    slug: 'content-writing',
    title: 'Content Writing',
    icon: PenTool,
    what:
      'Blog articles, website copy, product descriptions and scripts written for a specific audience, researched and structured for search engines.',
  },
  {
    slug: 'app-ui-design',
    title: 'UI/UX Design',
    icon: LayoutTemplate,
    what:
      'Interface design and clickable prototypes for apps and dashboards — wireframes, design systems and screens ready for a developer to build.',
  },
  {
    slug: 'motion-graphics',
    title: 'Motion Graphics',
    icon: Clapperboard,
    what:
      'Animated logos, intros, explainer videos and animated ads — including typography, character and UI animation for social media and campaigns.',
  },
  {
    slug: 'graphic-design',
    title: 'Marketing Graphics',
    icon: TrendingUp,
    what:
      'Social media posts, thumbnails, banners, packaging and print material designed to keep one consistent brand look across every channel.',
  },
];

const PopularServices: React.FC = () => (
  <section aria-labelledby="services-heading" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <div className="max-w-3xl mb-12">
        <h2 id="services-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
          What you can get done on FIVESOM
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          FIVESOM covers the digital work small businesses, startups and creators need most.
          Every category below is an active part of the marketplace — pick one to see the
          freelancers, packages and prices available today.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ slug, title, icon: Icon, what }) => (
          <li key={slug}>
            <Link
              to={`/explore?category=${slug}`}
              className="group h-full flex flex-col rounded-2xl p-6 bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-6 h-6" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{what}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Browse {title.split(' ')[0].toLowerCase()} services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default PopularServices;
