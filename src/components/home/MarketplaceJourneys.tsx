import React from 'react';
import { Link } from 'react-router-dom';
import ExchangeNetwork from '@/components/home/ExchangeNetwork';
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Globe2,
  Handshake,
  MessageSquare,
  PackageCheck,
  Search,
  Sparkles,
  Star,
  Store,
  UserRoundCheck,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const FREELANCER_JOURNEY = [
  { icon: UserRoundCheck, title: 'Create your profile', text: 'Present your skills, experience, languages and portfolio to clients.' },
  { icon: Store, title: 'Create your gig', text: 'Package a clear service with samples, delivery times and transparent pricing.' },
  { icon: Search, title: 'Find buyers', text: 'Be discovered by clients browsing the African freelancer marketplace.' },
  { icon: PackageCheck, title: 'Complete orders', text: 'Collaborate in one place and deliver the finished work securely.' },
  { icon: Star, title: 'Build your reputation', text: 'Earn genuine reviews from buyers after completed marketplace orders.' },
  { icon: Banknote, title: 'Earn money', text: 'Approved earnings move to your FIVESOM wallet for withdrawal.' },
];

const BUYER_JOURNEY = [
  { icon: Compass, title: 'Discover', text: 'Browse useful freelance services by category, skill and delivery need.' },
  { icon: UserRoundCheck, title: 'Choose', text: 'Compare packages, portfolios, verified status and real buyer reviews.' },
  { icon: BriefcaseBusiness, title: 'Order', text: 'Select the package that fits and fund the protected order.' },
  { icon: MessageSquare, title: 'Collaborate', text: 'Share requirements, messages and project files in one workspace.' },
  { icon: CheckCircle2, title: 'Approve', text: 'Review the delivery, request a revision if needed, then release payment.' },
];

const MarketplaceJourneys: React.FC = () => (
  <div className="home-story-band overflow-hidden">
    <section aria-labelledby="freelancer-journey-heading" className="home-story-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="max-w-3xl" from="left">
          <span className="home-kicker"><Sparkles className="h-3.5 w-3.5" aria-hidden /> For freelancers</span>
          <h2 id="freelancer-journey-heading" className="home-story-title">Build a freelance career, one trusted order at a time</h2>
          <p className="home-story-copy">FIVESOM gives African freelancers a professional path from creating a profile to earning from clients worldwide. Every stage stays connected, clear and visible.</p>
        </ScrollReveal>

        <ol className="journey-rail mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {FREELANCER_JOURNEY.map(({ icon: Icon, title, text }, index) => (
            <ScrollReveal as="li" key={title} delay={index * 85} from="depth" className="journey-card">
              <span className="journey-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="journey-icon"><Icon className="h-5 w-5" aria-hidden /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </ScrollReveal>
          ))}
        </ol>
        <ScrollReveal delay={180}>
          <Link to="/register/freelancer" className="home-story-link">Become a Freelancer <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </ScrollReveal>
      </div>
    </section>

    <section aria-labelledby="buyer-journey-heading" className="home-story-section home-buyer-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ScrollReveal className="ml-auto max-w-3xl lg:text-right" from="right">
          <span className="home-kicker lg:ml-auto"><Handshake className="h-3.5 w-3.5" aria-hidden /> For buyers</span>
          <h2 id="buyer-journey-heading" className="home-story-title">From discovering talent to approving great work</h2>
          <p className="home-story-copy lg:ml-auto">Hiring freelancers should feel simple, not uncertain. Compare services, collaborate around a clear order and approve the result only when the delivery is ready.</p>
        </ScrollReveal>

        <ol className="buyer-flow mt-12 grid gap-4 md:grid-cols-5">
          {BUYER_JOURNEY.map(({ icon: Icon, title, text }, index) => (
            <ScrollReveal as="li" key={title} delay={index * 100} from={index % 2 ? 'up' : 'depth'} className="buyer-stage">
              <span className="buyer-stage-icon"><Icon className="h-5 w-5" aria-hidden /></span>
              <span className="text-xs font-semibold text-primary">Stage {index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </ScrollReveal>
          ))}
        </ol>
        <ScrollReveal delay={180} className="lg:text-right">
          <Link to="/explore" className="home-story-link">Find a Freelancer <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </ScrollReveal>
      </div>
    </section>

    <section aria-labelledby="africa-global-heading" className="home-story-section px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <ScrollReveal from="left">
          <span className="home-kicker"><Globe2 className="h-3.5 w-3.5" aria-hidden /> African talent, global opportunities</span>
          <h2 id="africa-global-heading" className="home-story-title">A marketplace built to connect African skill with worldwide demand</h2>
          <p className="home-story-copy">FIVESOM helps businesses hire African freelancers for design, development, video, writing and digital services while giving professionals across the continent a route to international clients.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/freelancers/africa" className="home-story-link">Explore African freelancers <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <Link to="/freelancers/somalia" className="home-secondary-link">Discover Somali freelancers</Link>
          </div>
        </ScrollReveal>

        <ScrollReveal from="depth" delay={120}>
          <ExchangeNetwork />
        </ScrollReveal>
      </div>
    </section>
  </div>
);

export default MarketplaceJourneys;