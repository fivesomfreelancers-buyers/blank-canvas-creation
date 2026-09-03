import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, CreditCard, Hourglass, Hammer, Eye, ThumbsUp, Banknote } from 'lucide-react';

const FLOW = [
  { icon: CreditCard, title: 'Buyer pays', text: 'The client pays for the package when placing the order.' },
  { icon: Hourglass, title: 'Payment is secured', text: 'FIVESOM holds the money in escrow — the freelancer cannot withdraw it yet.' },
  { icon: Hammer, title: 'Freelancer works', text: 'The order and the buyer’s requirements open in the freelancer’s dashboard.' },
  { icon: Eye, title: 'Buyer reviews delivery', text: 'The finished files are uploaded to the order page for the buyer to check.' },
  { icon: ThumbsUp, title: 'Buyer accepts', text: 'The buyer accepts the delivery, or asks for a revision first.' },
  { icon: Banknote, title: 'Payment is released', text: 'Only then does the money move into the freelancer’s wallet for withdrawal.' },
];

const EscrowSection: React.FC = () => (
  <section aria-labelledby="escrow-heading" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Lock className="w-3.5 h-3.5" aria-hidden /> Escrow protection
        </div>
        <h2 id="escrow-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
          Your payment stays protected until the work is delivered and accepted
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Escrow is the reason both sides can work with someone they have never met. The buyer’s
          money is held safely by FIVESOM instead of being sent straight to the freelancer — so the
          buyer is never paying for nothing, and the freelancer knows the funds for the job already
          exist before starting.
        </p>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FLOW.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <step.icon className="w-5 h-5" aria-hidden />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Step {i + 1}</span>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground leading-relaxed">
        If a delivery does not match what was ordered, the buyer can request a revision. If the two
        sides still cannot agree, the order can be escalated and the FIVESOM support team reviews the
        order, the requirements and the delivered files before deciding how the escrowed funds are
        handled.{' '}
        <Link to="/trust-safety" className="text-primary underline">
          Read about trust &amp; safety
        </Link>
        .
      </div>
    </div>
  </section>
);

export default EscrowSection;
