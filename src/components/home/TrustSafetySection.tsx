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
    className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border"
  >
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl mb-12">
        <h2 id="trust-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
          Why people trust FIVESOM
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Trust on a marketplace is built from systems, not slogans. These are the protections that
          are actually built into FIVESOM today for both sides of every order.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-border bg-card p-6">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Icon className="w-5 h-5" aria-hidden />
            </span>
            <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
          </li>
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
