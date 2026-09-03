import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CreditCard,
  Upload,
  PackageCheck,
  CheckCircle2,
  UserPlus,
  FileText,
  Bell,
  Send,
  Wallet,
  ArrowRight,
} from 'lucide-react';

const BUYER_STEPS = [
  {
    icon: Search,
    title: 'Discover',
    text: 'Search services or browse a category, compare freelancers, ratings and packages.',
  },
  {
    icon: CreditCard,
    title: 'Order & pay securely',
    text: 'Choose Basic, Standard or Premium and pay. The money goes into escrow, not to the freelancer yet.',
  },
  {
    icon: Upload,
    title: 'Send requirements',
    text: 'Add your instructions plus images, videos, documents or links so the freelancer can start.',
  },
  {
    icon: PackageCheck,
    title: 'Receive the delivery',
    text: 'The freelancer uploads the finished files to the order page and you get notified.',
  },
  {
    icon: CheckCircle2,
    title: 'Accept or request a revision',
    text: 'Happy with the work? Accept it and the payment is released. Not yet? Ask for a revision.',
  },
];

const FREELANCER_STEPS = [
  {
    icon: UserPlus,
    title: 'Create your profile',
    text: 'Register free, add your skills, languages, portfolio and a professional title.',
  },
  {
    icon: FileText,
    title: 'Publish a gig',
    text: 'Describe your service, upload samples and set your own prices across three packages.',
  },
  {
    icon: Bell,
    title: 'Receive an order',
    text: 'When a buyer pays, the order and all their requirements appear in your dashboard instantly.',
  },
  {
    icon: Send,
    title: 'Deliver the work',
    text: 'Chat with the buyer, then upload the completed files through the order page.',
  },
  {
    icon: Wallet,
    title: 'Get paid',
    text: 'Once the buyer accepts, the earnings land in your wallet and can be withdrawn.',
  },
];

const StepColumn: React.FC<{
  label: string;
  heading: string;
  intro: string;
  steps: typeof BUYER_STEPS;
  cta: { to: string; text: string };
}> = ({ label, heading, intro, steps, cta }) => (
  <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
    <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-primary mb-3">
      {label}
    </span>
    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">{heading}</h3>
    <p className="text-sm text-muted-foreground mb-7">{intro}</p>

    <ol className="space-y-5">
      {steps.map((s, i) => (
        <li key={s.title} className="flex gap-4">
          <span className="relative shrink-0">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <s.icon className="w-5 h-5" aria-hidden />
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute left-1/2 top-10 h-5 w-px -translate-x-1/2 bg-border" />
            )}
          </span>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {i + 1}. {s.title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>

    <Link
      to={cta.to}
      className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
    >
      {cta.text} <ArrowRight className="w-4 h-4" aria-hidden />
    </Link>
  </div>
);

const HowFivesomWorks: React.FC = () => (
  <section aria-labelledby="how-heading" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted/20 border-y border-border">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl mb-12">
        <h2 id="how-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
          How FIVESOM works
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          The same order powers two experiences: a client getting work delivered, and a freelancer
          getting paid for it. Here is exactly what happens on each side.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <StepColumn
          label="For clients"
          heading="Find the right freelancer for your project"
          intro="No contracts to negotiate and no upfront risk — you pay into escrow and release the money only when the work is right."
          steps={BUYER_STEPS}
          cta={{ to: '/explore', text: 'Find a Freelancer' }}
        />
        <StepColumn
          label="For freelancers"
          heading="Turn your skills into real income"
          intro="Publish your services once, then receive orders from clients around the world and build a reputation with every review."
          steps={FREELANCER_STEPS}
          cta={{ to: '/register/freelancer', text: 'Become a Freelancer' }}
        />
      </div>

      <p className="text-sm text-muted-foreground mt-8">
        Want more detail?{' '}
        <Link to="/how-it-works" className="text-primary underline">
          Read the full how-it-works guide
        </Link>{' '}
        or{' '}
        <Link to="/docs" className="text-primary underline">
          browse the FIVESOM documentation
        </Link>
        .
      </p>
    </div>
  </section>
);

export default HowFivesomWorks;
