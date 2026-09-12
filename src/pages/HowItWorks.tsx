import React from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  FileCheck2,
  IdCard,
  Laptop,
  MessageSquareText,
  PackageCheck,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRoundCheck,
  WalletCards,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO, { SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { breadcrumbSchema } from '@/lib/seo/schemas';
import findFreelancerAsset from '@/assets/how-it-works/find-perfect-freelancer.webp.asset.json';
import collaborateAsset from '@/assets/how-it-works/collaborate-securely.webp.asset.json';
import escrowAsset from '@/assets/how-it-works/secure-escrow-payment.webp.asset.json';
import releaseAsset from '@/assets/how-it-works/release-payment.webp.asset.json';

// Lovable CDN assets are served from the project preview origin. Using that
// absolute origin keeps images available on the custom domain and crawlable.
const IMAGE_ORIGIN = 'https://id-preview--a04b010f-bbe6-48c6-afb1-7f7fee82c826.lovable.app';
const publicImageUrl = (path: string) => `${IMAGE_ORIGIN}${path}`;

const JOURNEY = ['Discover', 'Choose', 'Pay', 'Collaborate', 'Work', 'Deliver', 'Review', 'Complete', 'Earn', 'Grow'];

const CORE_STEPS = [
  {
    eyebrow: 'Discover & choose',
    title: 'Find Your Perfect Freelancer',
    summary:
      'FIVESOM connects buyers with freelancers offering design, development, writing, video, and other professional digital services.',
    details: [
      'Browse available services and explore the category that matches your project.',
      'Open freelancer profiles and Gig pages to review skills, portfolios, work samples, and delivery times.',
      'Compare package prices, included work, revisions, genuine ratings, and buyer reviews.',
      'Choose the best match and start the order securely through FIVESOM.',
    ],
    image: publicImageUrl(findFreelancerAsset.url),
    width: 918,
    height: 769,
    alt: 'Buyer comparing FIVESOM freelancer profiles, ratings, and professional services',
    icon: Search,
  },
  {
    eyebrow: 'Order & collaborate',
    title: 'Collaborate Securely',
    summary:
      'Every requirement, message, file, revision, delivery, and status update stays connected to the correct FIVESOM order.',
    details: [
      'Select a Gig, review the package and requirements, then complete the required payment.',
      'The order becomes active after successful payment, and the buyer submits the project requirements.',
      'The freelancer receives the order, reviews the brief, and communicates with the buyer through FIVESOM.',
      'The freelancer completes the project and submits the finished work through the delivery system for buyer review.',
    ],
    image: publicImageUrl(collaborateAsset.url),
    width: 1152,
    height: 768,
    alt: 'Buyer and freelancer collaborating through secure FIVESOM messages and shared project files',
    icon: MessageSquareText,
  },
  {
    eyebrow: 'Protected payment flow',
    title: 'Secure Escrow Payment',
    summary:
      'A successful buyer payment is secured within the order process while the freelancer works; it is not immediately available as freelancer earnings.',
    details: [
      'Buyer pays the Gig price plus the separate $1 Buyer Service Fee.',
      'Payment is secured while the freelancer completes the agreed work and submits the delivery.',
      'The buyer reviews the delivery before the payment-release process begins.',
      'The Buyer Service Fee belongs to FIVESOM and is never counted as freelancer earnings.',
    ],
    image: publicImageUrl(escrowAsset.url),
    width: 1365,
    height: 768,
    alt: 'FIVESOM escrow payment flow securing an order between a buyer and freelancer',
    icon: ShieldCheck,
  },
  {
    eyebrow: 'Review & release',
    title: 'Release Payment',
    summary:
      'After delivery, the buyer reviews the completed work and decides whether to accept it, request a revision, or use the dispute process.',
    details: [
      'The freelancer completes the order and submits the delivery through FIVESOM.',
      'The buyer reviews the files and accepts the delivery when the work meets the agreed requirements.',
      'After acceptance, eligible Gig earnings move to the freelancer wallet under FIVESOM payment rules.',
      'The freelancer can request a withdrawal when eligible; unresolved work can follow the revision or dispute process instead.',
    ],
    image: publicImageUrl(releaseAsset.url),
    width: 1365,
    height: 768,
    alt: 'Buyer accepting delivered work so eligible freelancer earnings can be released on FIVESOM',
    icon: PackageCheck,
  },
];

const FREELANCER_STEPS = [
  {
    icon: UserRoundCheck,
    title: 'Create a Freelancer Account',
    text: 'Choose to become a freelancer, add accurate professional information and relevant skills, and build a profile around services you can genuinely deliver.',
    points: ['Create your profile', 'Add professional information', 'Select relevant skills', 'Prepare your services'],
  },
  {
    icon: BriefcaseBusiness,
    title: 'Create & Publish Your Gig',
    text: 'Create a clear offer so buyers understand exactly what they receive before ordering. A freelancer can publish up to two active Gigs.',
    points: ['Title, category, and subcategory', 'Description, requirements, and inclusions', 'Packages, price, delivery time, and revisions', 'Gallery and work examples'],
  },
  {
    icon: FileCheck2,
    title: 'Get Clients & Complete Orders',
    text: 'Buyers can discover your published Gig and place an order. After successful payment, review the requirements, communicate professionally, complete the work, and deliver through FIVESOM.',
    points: ['Receive paid orders', 'Review the buyer brief', 'Deliver through the order page', 'Build ratings and reputation'],
  },
  {
    icon: WalletCards,
    title: 'Get Paid',
    text: 'Buyer pays → payment is secured → you complete the work → buyer accepts → eligible earnings become available → you can request a withdrawal under FIVESOM rules.',
    points: ['FIVESOM fee: 15% of Gig earnings', '$1 Buyer Service Fee stays separate', 'Withdraw eligible wallet funds', 'Track your payment activity'],
  },
];

const VERIFICATION_STEPS = [
  { title: 'Basic Information', text: 'Review your full name, profile information, and basic account details.', icon: IdCard },
  { title: 'Skills', text: 'Select the FIVESOM categories and subcategories that accurately represent your professional work.', icon: Sparkles },
  { title: 'Portfolio', text: 'Submit exactly 3 portfolio images and 1 short portfolio video showing your own original work.', icon: Upload },
  { title: 'Experience', text: 'Describe your years of experience, projects, and areas of specialization truthfully.', icon: BriefcaseBusiness },
  { title: 'Education & Tools', text: 'Add relevant education, training, and the professional software or tools you actually use.', icon: Laptop },
];

const BLUE_TICK_REQUIREMENTS = [
  'Verified account / verified seller',
  'Member for at least 40 days',
  'Active within the last 30 days',
  'At least 10 completed orders',
  'At least $50 earned',
  'Average rating of 4.5+ stars',
  'No more than 3 warnings',
];

const FAQS = [
  {
    question: 'What is FIVESOM?',
    answer: 'FIVESOM is a freelance marketplace where buyers discover digital services and freelancers publish Gigs, complete paid orders, and build a professional reputation.',
  },
  {
    question: 'How does a buyer find a freelancer?',
    answer: 'Buyers browse categories and Gig pages, then compare profiles, skills, work samples, packages, delivery times, ratings, and genuine reviews.',
  },
  {
    question: 'How does payment protection work?',
    answer: 'The buyer pays before work begins. The payment remains connected to the order while the freelancer works and is released under the order rules after delivery review and acceptance.',
  },
  {
    question: 'How does a freelancer get paid?',
    answer: 'After an eligible delivery is accepted, the freelancer’s Gig earnings move to the appropriate wallet balance. FIVESOM charges 15% of Gig earnings; the separate $1 Buyer Service Fee is not freelancer income.',
  },
  {
    question: 'How does freelancer verification work?',
    answer: 'After completing the required first order, a freelancer can submit the verification application with accurate skills, portfolio samples, experience, education, and tools for admin review.',
  },
  {
    question: 'How does the Blue Tick work?',
    answer: 'Blue Tick consideration unlocks only after every eligibility requirement is met, including verification, account age, activity, completed orders, earnings, rating, and warning limits.',
  },
];

const SectionHeading = ({ label, title, text }: { label: string; title: string; text: string }) => (
  <div className="max-w-3xl">
    <p className="mb-3 text-sm font-semibold uppercase text-primary">{label}</p>
    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h2>
    <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{text}</p>
  </div>
);

const NumberedIcon = ({ number, icon: Icon }: { number: number; icon: LucideIcon }) => (
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
    <Icon className="h-5 w-5" aria-hidden />
    <span className="sr-only">Step {number}</span>
  </div>
);

const HowItWorks = () => {
  const pageUrl = `${SITE_URL}/how-it-works`;
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: 'How Fivesom Works | Hire Freelancers & Grow Your Skills',
      description: 'Learn how buyers hire freelancers and how freelancers create Gigs, complete orders, get verified, and earn through FIVESOM.',
      inLanguage: 'en',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: publicImageUrl(findFreelancerAsset.url),
        width: 918,
        height: 769,
      },
    },
    breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'How It Works', path: '/how-it-works' },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="How Fivesom Works | Hire Freelancers & Grow Your Skills"
        description="Learn how buyers hire freelancers and how freelancers create Gigs, complete orders, get verified, and earn securely through Fivesom."
        canonical="/how-it-works"
        image={publicImageUrl(findFreelancerAsset.url)}
        jsonLd={schemas}
      />
      <Navbar />

      <header className="border-b border-border bg-background px-4 pb-14 pt-28 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase text-primary">The complete FIVESOM guide</p>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              How FIVESOM works, from first search to finished work
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
              Find the right freelancer, place a protected order, collaborate in one place, and release payment after delivery—or publish your skills, complete projects, and grow your freelance business.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/explore">Find a service <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register/freelancer">Become a freelancer</Link>
              </Button>
            </div>
          </div>

          <nav aria-label="FIVESOM journey" className="mt-12 overflow-x-auto border-y border-border py-5 no-scrollbar">
            <ol className="flex min-w-max items-center gap-3">
              {JOURNEY.map((item, index) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span>
                    {item}
                  </span>
                  {index < JOURNEY.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </header>

      <main>
        <section aria-labelledby="buyer-process" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              label="For buyers"
              title="Hire with clarity at every step"
              text="From comparing services to accepting a delivery, FIVESOM keeps the complete project journey connected to one order."
            />
            <h2 id="buyer-process" className="sr-only">How buyers hire freelancers on FIVESOM</h2>

            <div className="mt-14 divide-y divide-border border-y border-border">
              {CORE_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
                    <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                      <div className="mb-6 flex items-center gap-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">{index + 1}</span>
                        <div>
                          <p className="text-sm font-semibold uppercase text-primary">{step.eyebrow}</p>
                          <p className="text-sm text-muted-foreground">Buyer journey</p>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-foreground sm:text-4xl">{step.title}</h2>
                      <p className="mt-4 text-base leading-7 text-muted-foreground">{step.summary}</p>
                      <ul className="mt-7 space-y-4">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex gap-3 text-sm leading-6 text-foreground sm:text-base">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Check className="h-3.5 w-3.5" aria-hidden />
                            </span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <figure className={index % 2 === 1 ? 'lg:order-1' : ''}>
                      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                        <img
                          src={step.image}
                          alt={step.alt}
                          width={step.width}
                          height={step.height}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : 'auto'}
                          className="aspect-[16/10] w-full bg-muted/20 object-contain"
                        />
                      </div>
                      <figcaption className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 text-primary" aria-hidden /> {step.eyebrow} on FIVESOM
                      </figcaption>
                    </figure>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="freelancer-heading" className="border-y border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              label="Freelancer — how it works"
              title="Turn your professional skills into a clear service"
              text="Build a credible profile, publish focused Gigs, manage every order professionally, and earn from completed work."
            />
            <h2 id="freelancer-heading" className="sr-only">The freelancer journey on FIVESOM</h2>

            <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
              {FREELANCER_STEPS.map((step, index) => (
                <li key={step.title} className="bg-card p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <NumberedIcon number={index + 1} icon={step.icon} />
                    <span className="text-5xl font-bold text-muted/80">0{index + 1}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.text}</p>
                  <ul className="mt-5 space-y-2 border-t border-border pt-5">
                    {step.points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {point}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="verification-heading" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              label="Freelancer verification"
              title="How to get verified on FIVESOM"
              text="Verification is not automatic. A freelancer must first complete the required first order before the application unlocks, then submit truthful professional information for review."
            />
            <h2 id="verification-heading" className="sr-only">FIVESOM freelancer verification steps</h2>

            <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {VERIFICATION_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.title} className="border-t-2 border-primary pt-5">
                    <div className="mb-4 flex items-center justify-between">
                      <Icon className="h-6 w-6 text-primary" aria-hidden />
                      <span className="text-sm font-bold text-muted-foreground">0{index + 1}</span>
                    </div>
                    <h3 className="font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                  </li>
                );
              })}
            </ol>

            <div className="mt-12 grid gap-8 border-t border-border pt-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Verification review</h3>
                <p className="mt-4 leading-7 text-muted-foreground">
                  FIVESOM Admin reviews the submitted information and portfolio for relevance and apparent ownership. Applications normally receive a response within approximately 24 hours. Admin can approve, reject, or request changes, and the latest status appears in the freelancer dashboard.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {['Approve', 'Reject', 'Request changes'].map((decision) => (
                    <span key={decision} className="rounded-full border border-border bg-muted/40 px-4 py-2 text-sm font-medium text-foreground">{decision}</span>
                  ))}
                </div>
              </div>
              <aside className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-primary" aria-hidden />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Original work only</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Portfolio files must represent the applicant’s own work. Copied work—or another person’s work presented as your own—must not be submitted.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section aria-labelledby="blue-tick-heading" className="border-y border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <BadgeCheck className="h-8 w-8" aria-hidden />
              </span>
              <p className="mb-3 text-sm font-semibold uppercase text-primary">Trust & recognition</p>
              <h2 id="blue-tick-heading" className="text-3xl font-bold text-foreground sm:text-4xl">How to get the Blue Tick</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Blue Tick consideration has a separate eligibility check. Every requirement must be satisfied before the application form unlocks.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {BLUE_TICK_REQUIREMENTS.map((requirement) => (
                  <li key={requirement} className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              <article className="bg-card p-7">
                <BriefcaseBusiness className="h-7 w-7 text-primary" aria-hidden />
                <h3 className="mt-5 text-xl font-bold text-foreground">Application information</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Explain why your work qualifies, and optionally add years of experience, notable projects, specialization, and portfolio links. Relevant links such as TikTok, Instagram, Facebook, and other supported professional or social profiles can help Admin understand your work.
                </p>
              </article>
              <article className="bg-card p-7">
                <IdCard className="h-7 w-7 text-primary" aria-hidden />
                <h3 className="mt-5 text-xl font-bold text-foreground">Identity information</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  If an identity document such as a passport, national ID, or driving licence is requested through an approved verification process, submit it only through the secure private flow shown in your account.
                </p>
              </article>
              <article className="bg-card p-7 sm:col-span-2">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="flex gap-3">
                    <QrCode className="h-7 w-7 shrink-0 text-primary" aria-hidden />
                    <Laptop className="h-7 w-7 shrink-0 text-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Face or camera verification</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      If FIVESOM introduces an approved identity-verification provider, you may be asked to continue on a phone by scanning a QR code, allow camera access, and follow on-screen movement instructions. FIVESOM does not currently claim to perform biometric verification itself; always follow only the secure instructions displayed inside your account.
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="ecosystem-heading" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              label="The complete ecosystem"
              title="Two journeys, one connected order"
              text="Buyers get a clear path from discovery to review. Freelancers get a professional path from publishing skills to earning and growing."
            />
            <h2 id="ecosystem-heading" className="sr-only">The complete FIVESOM buyer and freelancer ecosystem</h2>
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <article className="border-l-2 border-primary pl-6 sm:pl-8">
                <h3 className="text-2xl font-bold text-foreground">For buyers</h3>
                <p className="mt-3 leading-7 text-muted-foreground">Find freelancers → compare services → choose a Gig → pay → submit requirements → collaborate → review delivery → request revisions if needed → accept completed work → leave a genuine review.</p>
              </article>
              <article className="border-l-2 border-primary pl-6 sm:pl-8">
                <h3 className="text-2xl font-bold text-foreground">For freelancers</h3>
                <p className="mt-3 leading-7 text-muted-foreground">Create a profile → add skills → publish up to 2 Gigs → receive paid orders → complete projects → deliver work → receive reviews → build reputation → qualify for verification and Blue Tick consideration → withdraw eligible funds.</p>
              </article>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-heading" className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              label="Quick answers"
              title="FIVESOM questions, answered"
              text="The essentials for starting as a buyer or growing as a freelancer."
            />
            <h2 id="faq-heading" className="sr-only">Frequently asked questions about FIVESOM</h2>
            <div className="mt-10 divide-y divide-border border-y border-border">
              {FAQS.map((faq) => (
                <article key={faq.question} className="grid gap-3 py-6 md:grid-cols-[0.75fr_1.25fr] md:gap-10">
                  <h3 className="font-bold text-foreground">{faq.question}</h3>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-base">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-primary-foreground/80">Start your journey</p>
              <h2 className="mt-2 text-3xl font-bold text-primary-foreground">Ready to find talent or share your skills?</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="secondary"><Link to="/explore">Explore services</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/register/freelancer">Create freelancer account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;