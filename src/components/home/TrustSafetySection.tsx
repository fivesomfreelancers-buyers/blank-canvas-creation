import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BadgeCheck,
  Star,
  ListChecks,
  FileDown,
  RefreshCcw,
  Scale,
  Headphones,
  MessagesSquare,
} from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const ITEMS = [
  {
    icon: ShieldCheck,
    title: 'Escrow-held payments',
    text: 'Every order is funded up front and held by FIVESOM until the buyer accepts the delivery.',
  },
  {
    icon: BadgeCheck,
    title: 'Identity-verified sellers',
    text: 'Freelancers can submit identity documents for review and earn a verified badge on their profile and gigs.',
  },
  {
    icon: Star,
    title: 'Real reviews and ratings',
    text: 'Only buyers who actually ordered a gig can rate it, so the star ratings you see come from completed work.',
  },
  {
    icon: ListChecks,
    title: 'Order tracking',
    text: 'Buyers and freelancers see the same live order status, requirements and history from purchase to completion.',
  },
  {
    icon: FileDown,
    title: 'Deliveries inside the platform',
    text: 'Files are delivered through the order page with private, access-controlled links — not lost in email threads.',
  },
  {
    icon: RefreshCcw,
    title: 'Revision requests',
    text: 'If a delivery misses the brief, the buyer can request a revision instead of accepting work that is not ready.',
  },
  {
    icon: MessagesSquare,
    title: 'In-platform messaging',
    text: 'Chat, images and attachments stay on FIVESOM, so there is a record of what was agreed for every order.',
  },
  {
    icon: Scale,
    title: 'Dispute handling',
    text: 'Disagreements can be escalated to the FIVESOM team, who review the order evidence before resolving the escrow.',
  },
  {
    icon: Headphones,
    title: 'Platform support',
    text: 'A support inbox and help centre are available to both buyers and freelancers for account and order issues.',
  },
];

const TrustSafetySection: React.FC = () => (
  <section
    aria-labelledby="trust-heading"
    className="home-story-section px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border"
  >
    <div className="max-w-6xl mx-auto">
      <ScrollReveal className="max-w-3xl mb-12" from="left">
        <span className="home-kicker"><ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Trust built into every order</span>
        <h2 id="trust-heading" className="home-story-title">
          Why people trust FIVESOM
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Trust on a marketplace is built from systems, not slogans. These are the protections that
          are actually built into FIVESOM today for both sides of every order.
        </p>
      </ScrollReveal>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, text }, index) => (
          <ScrollReveal as="li" key={title} delay={(index % 3) * 95} from="depth" className="rounded-xl border border-border bg-card/95 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          </ScrollReveal>
        ))}
      </ul>

      <p className="text-sm text-muted-foreground mt-8">
        More detail in our{' '}
        <Link to="/docs" className="text-primary underline">
          documentation
        </Link>
        ,{' '}
        <Link to="/legal/terms" className="text-primary underline">
          terms of service
        </Link>{' '}
        and{' '}
        <Link to="/legal/privacy" className="text-primary underline">
          privacy policy
        </Link>
        .
      </p>
    </div>
  </section>
);

export default TrustSafetySection;
