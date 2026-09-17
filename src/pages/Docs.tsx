import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck2,
  FileText,
  HelpCircle,
  IdCard,
  LifeBuoy,
  LockKeyhole,
  Menu,
  MessageSquare,
  PackageCheck,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Trophy,
  UploadCloud,
  UserPlus,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO, { SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import SmartVideo from '@/components/media/SmartVideo';
import {
  accountMp4 as accountVideo,
  buyerAcceptMp4 as buyerAcceptVideo,
  disputeMp4 as disputeVideo,
  gigMp4 as gigVideo,
  messagingMp4 as messagingVideo,
  orderingMp4 as orderingVideo,
  ordersMp4 as ordersVideo,
  withdrawMoneyMp4 as withdrawalVideo,
} from '@/lib/mediaUrls';

type TopicGroup =
  | 'Getting Started'
  | 'Freelancers'
  | 'Buyers'
  | 'Orders & Delivery'
  | 'Payments & Security'
  | 'Verification & VIP'
  | 'Support';

interface TopicSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

interface Topic {
  id: string;
  group: TopicGroup;
  title: string;
  eyebrow: string;
  summary: string;
  icon: LucideIcon;
  video?: string;
  videoLabel?: string;
  cta?: { label: string; to: string };
  sections: TopicSection[];
  related: string[];
}

const TOPICS: Topic[] = [
  {
    id: 'getting-started',
    group: 'Getting Started',
    title: 'Getting Started with FIVESOM',
    eyebrow: 'Platform overview',
    summary: 'Understand what FIVESOM is, who it serves, and how work moves safely from discovery to payment release.',
    icon: BookOpen,
    cta: { label: 'See how FIVESOM works', to: '/how-it-works' },
    sections: [
      {
        heading: 'What is FIVESOM?',
        body: 'FIVESOM is a freelance marketplace for clients and skilled freelancers. Buyers find services, freelancers publish gigs, and every paid order is tracked through the platform from requirements to delivery.',
      },
      {
        heading: 'How the platform works',
        bullets: [
          'A buyer finds a gig or freelancer and chooses a service package.',
          'The buyer pays through FIVESOM so the order can be protected by escrow.',
          'The freelancer receives the requirements, completes the work, and submits the delivery.',
          'The buyer reviews the delivery, accepts it, requests a revision, or opens a dispute if needed.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Start by creating an account, then choose whether you want to hire freelancers, sell your skills, or do both from the same FIVESOM account.',
      },
    ],
    related: ['creating-account', 'finding-freelancers', 'freelancer-profile'],
  },
  {
    id: 'creating-account',
    group: 'Getting Started',
    title: 'Creating Your Account',
    eyebrow: 'Account setup',
    summary: 'Create a FIVESOM account, choose your role, and prepare your profile for buying or selling services.',
    icon: UserPlus,
    video: accountVideo.url,
    videoLabel: 'Creating a FIVESOM account tutorial',
    cta: { label: 'Create an account', to: '/register' },
    sections: [
      {
        heading: 'What is this?',
        body: 'Your FIVESOM account is the identity you use to buy gigs, publish services, message users, manage orders, and receive platform notifications.',
      },
      {
        heading: 'Steps to create an account',
        bullets: [
          'Open the registration page and continue with the available sign-in option.',
          'Choose the role you need first: buyer, freelancer, or upgrade later when needed.',
          'Add your name, profile photo, location, and short bio so other users know who they are working with.',
          'Review your account settings and keep your login protected.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Buyers can start browsing services immediately. Freelancers should complete their profile before publishing a gig so buyers see a professional first impression.',
      },
    ],
    related: ['account-security', 'freelancer-profile', 'finding-freelancers'],
  },
  {
    id: 'account-security',
    group: 'Getting Started',
    title: 'Account & Security',
    eyebrow: 'Privacy and protection',
    summary: 'Keep your account safe and understand which information is public, private, or used only for platform security.',
    icon: LockKeyhole,
    cta: { label: 'Read privacy policy', to: '/legal/privacy' },
    sections: [
      {
        heading: 'What is protected?',
        body: 'FIVESOM separates public profile information from private account, payment, order, and verification data. Sensitive files such as identity documents and order attachments are not shown publicly.',
      },
      {
        heading: 'How to protect your account',
        bullets: [
          'Use the official FIVESOM website and do not share your login session with anyone.',
          'Keep all order communication and file exchange inside the platform.',
          'Ignore requests to move payments or delivery outside FIVESOM.',
          'Report suspicious profiles, fake portfolios, or payment requests immediately.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'If you notice unusual activity, contact FIVESOM Support with the account email, order ID, or gig link so the team can investigate quickly.',
      },
    ],
    related: ['privacy-trust', 'support', 'escrow-payments'],
  },
  {
    id: 'freelancer-profile',
    group: 'Freelancers',
    title: 'Freelancer Profile',
    eyebrow: 'Seller foundation',
    summary: 'Build a profile that clearly explains your skills, experience, languages, tools, portfolio, and trust signals.',
    icon: IdCard,
    cta: { label: 'Edit freelancer profile', to: '/freelancer/profile' },
    sections: [
      {
        heading: 'Why the profile matters',
        body: 'Your profile is the first place buyers judge whether you look professional and trustworthy. A complete profile helps buyers understand what you do before they open a gig.',
      },
      {
        heading: 'What to complete',
        bullets: [
          'Use a clear profile photo and a professional display name.',
          'Write a specific title such as Brand Logo Designer or React Web Developer.',
          'Add a short bio explaining who you help and what results you deliver.',
          'List relevant skills, languages, tools, and portfolio samples that prove your work quality.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'After your profile is complete, create a gig with clear packages, examples, buyer requirements, and delivery expectations.',
      },
    ],
    related: ['creating-gig', 'verification-blue-tick', 'earnings-fees'],
  },
  {
    id: 'creating-gig',
    group: 'Freelancers',
    title: 'Creating a Gig',
    eyebrow: 'Service publishing',
    summary: 'Turn a service into a clear offer buyers can understand, compare, purchase, and review.',
    icon: BriefcaseBusiness,
    video: gigVideo.url,
    videoLabel: 'Creating a gig on FIVESOM tutorial',
    cta: { label: 'Create a gig', to: '/create-gig' },
    sections: [
      {
        heading: 'What is a gig?',
        body: 'A gig is a packaged freelance service. It explains what you offer, which category it belongs to, what each package includes, what the buyer must provide, and how long delivery takes.',
      },
      {
        heading: 'How to build a strong gig',
        bullets: [
          'Choose the most accurate category and write a specific service title.',
          'Explain the outcome the buyer receives, not only the task you perform.',
          'Add Basic, Standard, and Premium packages with clear deliverables.',
          'Collect buyer requirements up front so you can start without delays.',
          'Use portfolio media that shows your own original work.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Once published, your gig can appear in search and category pages. Keep the title, thumbnail, packages, and delivery time accurate so buyers know exactly what they are ordering.',
      },
    ],
    related: ['packages-pricing', 'order-requirements', 'delivering-order'],
  },
  {
    id: 'packages-pricing',
    group: 'Freelancers',
    title: 'Gig Packages & Pricing',
    eyebrow: 'Basic, Standard, Premium',
    summary: 'Use three package tiers to make your offer easy to compare and easier for buyers to purchase.',
    icon: SlidersHorizontal,
    sections: [
      {
        heading: 'What are packages?',
        body: 'Packages are the pricing tiers on a gig. They help buyers choose the level of service they need without negotiating every detail from zero.',
      },
      {
        heading: 'How to structure packages',
        bullets: [
          'Basic should solve the smallest version of the buyer problem.',
          'Standard should be the best value for most buyers.',
          'Premium should include the most complete delivery, faster turnaround, or extra deliverables.',
          'Each tier should list delivery time, included items, revisions, and any limits clearly.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'When a buyer orders a package, its price and deliverables become part of the order record. Keep package details realistic so disputes are easier to avoid.',
      },
    ],
    related: ['creating-gig', 'buying-gig', 'earnings-fees'],
  },
  {
    id: 'finding-freelancers',
    group: 'Buyers',
    title: 'Finding Freelancers',
    eyebrow: 'Search and compare',
    summary: 'Find the right freelancer by category, gig details, reviews, portfolio quality, delivery time, and communication.',
    icon: Search,
    cta: { label: 'Explore services', to: '/explore' },
    sections: [
      {
        heading: 'What can buyers search for?',
        body: 'Buyers can browse FIVESOM by service category, search terms, freelancer profile, rating, package price, and delivery fit.',
      },
      {
        heading: 'How to choose well',
        bullets: [
          'Open the gig and read what each package includes before ordering.',
          'Check portfolio samples, reviews, rating, and any verified badges.',
          'Message the freelancer first for complex, custom, or urgent work.',
          'Confirm the delivery format, timeline, and source files before paying.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'After choosing a freelancer, select the package that matches your project and continue to the secure checkout.',
      },
    ],
    related: ['buying-gig', 'messaging-communication', 'reviewing-delivery'],
  },
  {
    id: 'buying-gig',
    group: 'Buyers',
    title: 'Buying a Gig',
    eyebrow: 'Place an order',
    summary: 'Choose a package, pay securely, submit requirements, and track the order from your buyer dashboard.',
    icon: CreditCard,
    video: orderingVideo.url,
    videoLabel: 'Ordering a service on FIVESOM tutorial',
    cta: { label: 'Browse gigs', to: '/explore' },
    sections: [
      {
        heading: 'What is buying a gig?',
        body: 'Buying a gig means selecting a freelancer service package and creating an order through FIVESOM. The order contains the package details, payment status, requirements, delivery files, messages, and review actions.',
      },
      {
        heading: 'How to place an order',
        bullets: [
          'Open the gig and compare Basic, Standard, and Premium packages.',
          'Ask questions before ordering if your project is complex.',
          'Pay through FIVESOM so the order is protected by escrow.',
          'Submit the requirements the freelancer needs to begin work.',
          'Track progress from My Orders and keep messages on the platform.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'After payment and requirements are complete, the freelancer starts work and submits the delivery inside the order page.',
      },
    ],
    related: ['order-requirements', 'escrow-payments', 'reviewing-delivery'],
  },
  {
    id: 'order-requirements',
    group: 'Buyers',
    title: 'Order Requirements',
    eyebrow: 'Project details',
    summary: 'Give the freelancer the instructions, files, references, and goals needed to start correctly.',
    icon: FileText,
    cta: { label: 'View buyer orders', to: '/buyer/orders' },
    sections: [
      {
        heading: 'What are requirements?',
        body: 'Order requirements are the instructions and files a buyer submits after checkout. They tell the freelancer what to create, what format to deliver, and what details matter most.',
      },
      {
        heading: 'What to include',
        bullets: [
          'A short project goal and the exact deliverable you expect.',
          'Brand names, colors, text, files, links, dimensions, or technical notes.',
          'Examples of what you like and what you want the freelancer to avoid.',
          'A clear deadline if the project depends on a launch or campaign date.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'When requirements are submitted, the order can move into active work. Missing requirements can delay the freelancer and push back delivery.',
      },
    ],
    related: ['buying-gig', 'messaging-communication', 'revisions'],
  },
  {
    id: 'messaging-communication',
    group: 'Orders & Delivery',
    title: 'Messaging & Communication',
    eyebrow: 'Work together clearly',
    summary: 'Use FIVESOM messages to confirm scope, share files, answer questions, and keep a protected project record.',
    icon: MessageSquare,
    video: messagingVideo.url,
    videoLabel: 'FIVESOM messaging tutorial',
    cta: { label: 'Open inbox', to: '/inbox' },
    sections: [
      {
        heading: 'Why messages matter',
        body: 'Clear written communication prevents most order problems. Messages also create a record that support can review if a dispute is opened.',
      },
      {
        heading: 'Best practices',
        bullets: [
          'Confirm scope, timeline, file formats, and expectations before work begins.',
          'Keep all important project decisions inside FIVESOM chat.',
          'Use attachments and links only when they support the order.',
          'Respond quickly and professionally, especially when revisions are requested.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Once the freelancer has the information needed, they can complete the work and submit the delivery through the order page.',
      },
    ],
    related: ['order-requirements', 'delivering-order', 'disputes'],
  },
  {
    id: 'delivering-order',
    group: 'Orders & Delivery',
    title: 'Delivering an Order',
    eyebrow: 'Freelancer workflow',
    summary: 'Submit completed work through the order page so the buyer can review it and escrow can be released after acceptance.',
    icon: UploadCloud,
    video: ordersVideo.url,
    videoLabel: 'Managing and delivering orders on FIVESOM tutorial',
    cta: { label: 'Open freelancer orders', to: '/freelancer/orders' },
    sections: [
      {
        heading: 'What counts as delivery?',
        body: 'A delivery is the completed work, message, files, links, or instructions the freelancer submits for buyer review. It should match the purchased package and the buyer requirements.',
      },
      {
        heading: 'How to deliver professionally',
        bullets: [
          'Review the original requirements before submitting final files.',
          'Upload the correct files and explain what is included in the delivery message.',
          'Mention any usage notes, file formats, or next steps the buyer needs.',
          'Do not mark incomplete work as delivered just to stop the deadline.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'The buyer reviews the delivery. They can accept it, request a revision, or open a dispute if the work does not match the order.',
      },
    ],
    related: ['reviewing-delivery', 'revisions', 'earnings-fees'],
  },
  {
    id: 'reviewing-delivery',
    group: 'Buyers',
    title: 'Reviewing a Delivery',
    eyebrow: 'Accept, rate, or ask for changes',
    summary: 'Check the delivered work carefully before accepting, because acceptance releases the escrow payment.',
    icon: PackageCheck,
    video: buyerAcceptVideo.url,
    videoLabel: 'Buyer acceptance and payment release tutorial',
    cta: { label: 'View buyer orders', to: '/buyer/orders' },
    sections: [
      {
        heading: 'What is delivery review?',
        body: 'Delivery review is the buyer decision point. You compare the delivered work with the package and requirements, then accept, request a revision, or dispute the order.',
      },
      {
        heading: 'How to review safely',
        bullets: [
          'Open all files and links before clicking Accept Delivery.',
          'Compare the work against the requirements you submitted.',
          'Use revision requests for clear, fixable changes.',
          'Open a dispute only when the delivery does not match the order and normal revision does not solve it.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'When you accept the delivery, escrow is released to the freelancer and you can leave a 1–5 star review with a written comment.',
      },
    ],
    related: ['revisions', 'disputes', 'escrow-payments'],
  },
  {
    id: 'revisions',
    group: 'Orders & Delivery',
    title: 'Revisions',
    eyebrow: 'Request changes',
    summary: 'Use revisions to ask for specific changes before accepting the delivery.',
    icon: RotateCcw,
    sections: [
      {
        heading: 'What is a revision?',
        body: 'A revision is a request for the freelancer to adjust a delivery that is close but not yet right. It should be based on the original order scope and requirements.',
      },
      {
        heading: 'How to request a useful revision',
        bullets: [
          'Be specific about what should change and where the issue appears.',
          'Attach screenshots, timestamps, file names, or examples when helpful.',
          'Keep the request within the package you purchased.',
          'Avoid asking for a completely new project as a revision.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'The freelancer reviews your request, updates the work, and submits a new delivery for you to review again.',
      },
    ],
    related: ['reviewing-delivery', 'messaging-communication', 'disputes'],
  },
  {
    id: 'disputes',
    group: 'Orders & Delivery',
    title: 'Disputes',
    eyebrow: 'When an order needs review',
    summary: 'Open a dispute when the buyer and freelancer cannot resolve an order issue through normal messages or revisions.',
    icon: FileCheck2,
    video: disputeVideo.url,
    videoLabel: 'FIVESOM dispute process tutorial',
    sections: [
      {
        heading: 'What is a dispute?',
        body: 'A dispute asks FIVESOM support to review an order and decide the fairest outcome based on the order details, messages, files, and evidence from both sides.',
      },
      {
        heading: 'How disputes work',
        bullets: [
          'Either side explains the problem from the order page.',
          'Both sides can provide messages, files, screenshots, or other order evidence.',
          'The support team reviews the original scope and delivery history.',
          'The result can include revision guidance, refund handling, or payment release depending on the evidence.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Funds remain protected while the dispute is reviewed. Keep communication professional and respond quickly when support asks for details.',
      },
    ],
    related: ['escrow-payments', 'revisions', 'support'],
  },
  {
    id: 'escrow-payments',
    group: 'Payments & Security',
    title: 'Escrow & Payments',
    eyebrow: 'Payment protection',
    summary: 'Learn how FIVESOM holds buyer funds safely until work is delivered and accepted.',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'What is escrow?',
        body: 'Escrow means the buyer pays through FIVESOM, but the freelancer does not receive the money immediately. The payment is held while the work is being completed.',
      },
      {
        heading: 'How payment protection works',
        bullets: [
          'The buyer pays through an approved FIVESOM checkout method.',
          'The order becomes active after the payment is confirmed.',
          'The freelancer delivers the work through the order page.',
          'The buyer accepts the delivery, and payment is released to the freelancer wallet.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'If the delivery does not match the order, the buyer can request a revision or open a dispute before accepting.',
      },
    ],
    related: ['buying-gig', 'reviewing-delivery', 'withdrawals'],
  },
  {
    id: 'earnings-fees',
    group: 'Freelancers',
    title: 'Freelancer Earnings & Fees',
    eyebrow: 'Wallet balance',
    summary: 'Understand how completed orders become freelancer earnings and how the FIVESOM fee is applied.',
    icon: Banknote,
    cta: { label: 'Open wallet', to: '/freelancer/wallet' },
    sections: [
      {
        heading: 'When do freelancers earn?',
        body: 'Freelancers earn when a buyer accepts the delivery. Before acceptance, the buyer payment remains protected in escrow and is not available for withdrawal.',
      },
      {
        heading: 'How fees work',
        bullets: [
          'FIVESOM applies a 15% platform commission to freelancer earnings when withdrawals are processed.',
          'The freelancer receives the remaining 85% after the platform fee.',
          'Wallet balances are calculated by the platform, not manually edited in the browser.',
          'Withdrawal availability depends on completed orders and pending withdrawal requests.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Once funds are available in your wallet, you can request a withdrawal using the supported payout options in your account.',
      },
    ],
    related: ['withdrawals', 'delivering-order', 'packages-pricing'],
  },
  {
    id: 'withdrawals',
    group: 'Freelancers',
    title: 'Withdrawals',
    eyebrow: 'Payouts',
    summary: 'Request a payout from your FIVESOM wallet after eligible earnings are available.',
    icon: Wallet,
    video: withdrawalVideo.url,
    videoLabel: 'Withdrawing FIVESOM earnings tutorial',
    cta: { label: 'Request withdrawal', to: '/freelancer/wallet/withdraw' },
    sections: [
      {
        heading: 'What is a withdrawal?',
        body: 'A withdrawal is a request to transfer available freelancer earnings from your FIVESOM wallet to a supported payout method.',
      },
      {
        heading: 'How withdrawals work',
        bullets: [
          'Complete orders and wait until buyer acceptance releases funds to your wallet.',
          'Confirm your payout details before requesting a withdrawal.',
          'Submit the withdrawal request from your wallet page.',
          'FIVESOM reviews and processes eligible withdrawal requests according to platform rules.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'You can track the withdrawal status from your wallet. If a request needs review, support may ask for updated payout details.',
      },
    ],
    related: ['earnings-fees', 'escrow-payments', 'support'],
  },
  {
    id: 'privacy-trust',
    group: 'Payments & Security',
    title: 'Privacy & Trust',
    eyebrow: 'Safe marketplace behavior',
    summary: 'Understand how FIVESOM protects private data and what users should do to keep orders safe.',
    icon: ShieldCheck,
    cta: { label: 'Read terms', to: '/legal/terms' },
    sections: [
      {
        heading: 'What stays private?',
        body: 'Private account details, identity documents, payment records, order attachments, and internal verification decisions are not part of public profiles or gig pages.',
      },
      {
        heading: 'How users help keep trust high',
        bullets: [
          'Use real portfolio work and honest profile information.',
          'Do not ask for off-platform payment or private contact details to bypass FIVESOM.',
          'Report fake accounts, stolen work, abusive messages, or suspicious payment behavior.',
          'Use disputes only for genuine order problems and provide clear evidence.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Reports and disputes are reviewed by the FIVESOM team. Accounts that break marketplace rules can receive warnings, restrictions, or removal.',
      },
    ],
    related: ['account-security', 'disputes', 'support'],
  },
  {
    id: 'verification-blue-tick',
    group: 'Verification & VIP',
    title: 'Verification & Blue Tick',
    eyebrow: 'Trust signal',
    summary: 'Learn what freelancer verification means, how Blue Tick eligibility works, and how applications are reviewed.',
    icon: BadgeCheck,
    cta: { label: 'Start verification', to: '/freelancer/verify' },
    sections: [
      {
        heading: 'What is the Blue Tick?',
        body: 'The Blue Tick is a trust signal for freelancers who meet the platform eligibility requirements and complete the application review process.',
      },
      {
        heading: 'How verification works',
        bullets: [
          'Eligibility is checked from real account activity such as account age, completed orders, ratings, earnings, and profile quality.',
          'The application is completed in three steps: professional information, identity information, and face or camera verification.',
          'Identity documents are stored privately and reviewed only by authorized verification staff.',
          'Admins can approve, reject, or request changes before the application is accepted.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Approved freelancers receive the Blue Tick across the platform. If changes are required, update the application and resubmit it for review.',
      },
    ],
    related: ['freelancer-profile', 'creating-gig', 'privacy-trust'],
  },
  {
    id: 'vip-membership',
    group: 'Verification & VIP',
    title: 'VIP Membership',
    eyebrow: 'Growth features',
    summary: 'Understand VIP visibility features, seller limits, and how membership supports more serious freelancers.',
    icon: Trophy,
    cta: { label: 'View VIP membership', to: '/vip' },
    sections: [
      {
        heading: 'What is VIP?',
        body: 'VIP membership is designed for freelancers who want more visibility and growth tools. It complements strong work quality; it does not replace reviews, delivery performance, or marketplace rules.',
      },
      {
        heading: 'How to use VIP responsibly',
        bullets: [
          'Keep gig quality high before paying for more visibility.',
          'Use extra gig capacity only for services you can deliver well.',
          'Maintain fast responses, on-time delivery, and clear buyer communication.',
          'Review your performance before upgrading or renewing.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Visit the VIP page to compare available options and make sure the plan matches your current freelance workload.',
      },
    ],
    related: ['verification-blue-tick', 'creating-gig', 'earnings-fees'],
  },
  {
    id: 'support',
    group: 'Support',
    title: 'FIVESOM Support',
    eyebrow: 'Help and contact',
    summary: 'Find answers, contact support, and include the right information so the team can help faster.',
    icon: LifeBuoy,
    cta: { label: 'Contact support', to: '/buyer/help' },
    sections: [
      {
        heading: 'When should you contact support?',
        body: 'Contact FIVESOM Support when you have account access issues, payment questions, order disputes, verification problems, suspicious behavior, or questions not answered in the documentation.',
      },
      {
        heading: 'What to include',
        bullets: [
          'Your order ID, gig link, or profile link when the question relates to a specific page.',
          'A short explanation of what happened and what you expected instead.',
          'Screenshots or files only when they help support understand the issue.',
          'Your preferred reply language if you need Somali or English support.',
        ],
      },
      {
        heading: 'What happens next?',
        body: 'Support reviews the request, checks the relevant account or order records, and replies with the next action or decision.',
      },
    ],
    related: ['account-security', 'disputes', 'privacy-trust'],
  },
];

const GROUPS: { title: TopicGroup; description: string }[] = [
  { title: 'Getting Started', description: 'Account setup, platform basics, and security foundations.' },
  { title: 'Freelancers', description: 'Profile, gigs, orders, earnings, and withdrawals.' },
  { title: 'Buyers', description: 'Finding talent, ordering work, requirements, and delivery review.' },
  { title: 'Orders & Delivery', description: 'Communication, delivery, revisions, and dispute handling.' },
  { title: 'Payments & Security', description: 'Escrow, privacy, safe payments, and marketplace trust.' },
  { title: 'Verification & VIP', description: 'Blue Tick verification and VIP growth options.' },
  { title: 'Support', description: 'Where to get help and what details support needs.' },
];

const topicMap = TOPICS.reduce<Record<string, Topic>>((acc, topic) => {
  acc[topic.id] = topic;
  return acc;
}, {});

const docsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/docs#documentation`,
  name: 'FIVESOM Documentation',
  description: 'Official FIVESOM documentation for buyers and freelancers: accounts, gigs, orders, escrow, verification, VIP, payments, withdrawals, and support.',
  url: `${SITE_URL}/docs`,
  inLanguage: 'en',
  isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
  hasPart: TOPICS.map((topic) => ({
    '@type': 'TechArticle',
    '@id': `${SITE_URL}/docs#${topic.id}`,
    headline: topic.title,
    description: topic.summary,
    url: `${SITE_URL}/docs#${topic.id}`,
  })),
};

const topicMatches = (topic: Topic, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const searchable = [
    topic.group,
    topic.title,
    topic.eyebrow,
    topic.summary,
    ...topic.sections.flatMap((section) => [section.heading, section.body ?? '', ...(section.bullets ?? [])]),
  ]
    .join(' ')
    .toLowerCase();
  return searchable.includes(normalized);
};

const Docs: React.FC = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(TOPICS[0]?.id ?? 'getting-started');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filteredTopics = useMemo(() => TOPICS.filter((topic) => topicMatches(topic, query)), [query]);
  const filteredIds = useMemo(() => new Set(filteredTopics.map((topic) => topic.id)), [filteredTopics]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      setActiveId(id);
    }
  }, [location.hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-28% 0px -58% 0px', threshold: [0.1, 0.35, 0.7] }
    );

    TOPICS.forEach((topic) => {
      const el = document.getElementById(topic.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="FIVESOM Documentation — Buyer & Freelancer Guides"
        description="Official FIVESOM docs for accounts, gigs, orders, escrow, payments, withdrawals, Blue Tick verification, VIP, security and support."
        canonical="/docs"
        jsonLd={docsJsonLd}
      />
      <Navbar />

      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open documentation menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </Button>
            <div>
              <p className="text-sm font-semibold">FIVESOM Documentation</p>
              <p className="hidden text-xs text-muted-foreground sm:block">20 focused guides for buyers, freelancers, payments and support</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1">Updated for the current platform flow</span>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Documentation navigation">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeMobileNav}
            aria-label="Close documentation menu"
          />
          <div className="absolute inset-y-0 left-0 w-[min(22rem,90vw)] overflow-y-auto border-r border-border bg-card p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="font-semibold">Documentation</p>
              <Button type="button" variant="ghost" size="icon" onClick={closeMobileNav} aria-label="Close documentation menu">
                <X className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            <DocsNav activeId={activeId} filteredIds={filteredIds} onNavigate={closeMobileNav} />
          </div>
        </div>
      )}

      <main>
        <section className="border-b border-border bg-muted/20 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-primary">
                <BookOpen className="h-4 w-4" aria-hidden />
                Official platform guide
              </div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                FIVESOM Documentation
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Clear, practical guides for using FIVESOM as a buyer or freelancer. Learn how accounts, gigs, orders, escrow, payments, delivery, verification and support work without reading a long mixed page.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/explore">
                    Find a freelancer <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link to="/register/freelancer">
                    Become a freelancer <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <label htmlFor="docs-search" className="text-sm font-semibold">Search documentation</label>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-input bg-background px-3 py-2">
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
                <input
                  id="docs-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Try escrow, Blue Tick, withdrawal..."
                  className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Showing {filteredTopics.length} of {TOPICS.length} topics.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-8">
          <aside className="hidden lg:block">
            <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-4">
              <DocsNav activeId={activeId} filteredIds={filteredIds} />
            </div>
          </aside>

          <div className="min-w-0">
            <section aria-labelledby="docs-topics" className="mb-14">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="docs-topics" className="text-2xl font-bold sm:text-3xl">Browse by topic</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Start with a category, then jump into the exact guide you need.</p>
                </div>
                {query && (
                  <Button type="button" variant="ghost" onClick={() => setQuery('')}>Clear search</Button>
                )}
              </div>

              {filteredTopics.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <HelpCircle className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
                  <p className="mt-3 font-semibold">No documentation topics matched your search.</p>
                  <p className="mt-1 text-sm text-muted-foreground">Try a simpler word like order, payment, gig, support or verification.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {GROUPS.map((group) => {
                    const topics = TOPICS.filter((topic) => topic.group === group.title && filteredIds.has(topic.id));
                    if (topics.length === 0) return null;
                    return (
                      <div key={group.title}>
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold">{group.title}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {topics.map((topic) => {
                            const Icon = topic.icon;
                            return (
                              <Link
                                key={topic.id}
                                to={`/docs#${topic.id}`}
                                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/20"
                              >
                                <div className="mb-4 flex items-start justify-between gap-4">
                                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" aria-hidden />
                                  </span>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
                                </div>
                                <p className="text-xs font-semibold text-primary">{topic.eyebrow}</p>
                                <h4 className="mt-1 font-semibold leading-snug">{topic.title}</h4>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <div className="space-y-12">
              {TOPICS.map((topic, topicIndex) => (
                <article key={topic.id} id={topic.id} className="scroll-mt-32 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
                  <TopicHeader topic={topic} index={topicIndex + 1} />

                  {topic.video && (
                    <figure className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
                      <div className="aspect-video w-full">
                        <SmartVideo src={topic.video} label={topic.videoLabel ?? `${topic.title} tutorial video`} controls lazy />
                      </div>
                      <figcaption className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                        This instructional video is placed here because it supports the {topic.title.toLowerCase()} topic.
                      </figcaption>
                    </figure>
                  )}

                  <div className="mt-7 grid gap-4 md:grid-cols-3">
                    {topic.sections.map((section) => (
                      <section key={section.heading} className="rounded-xl border border-border bg-muted/20 p-4">
                        <h3 className="text-base font-semibold">{section.heading}</h3>
                        {section.body && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.body}</p>}
                        {section.bullets && (
                          <ul className="mt-3 space-y-2">
                            {section.bullets.map((bullet) => (
                              <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-col gap-4 border-t border-border pt-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold">Related documentation</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {topic.related.map((id) => {
                          const related = topicMap[id];
                          if (!related) return null;
                          return (
                            <Link
                              key={id}
                              to={`/docs#${id}`}
                              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                            >
                              {related.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    {topic.cta && (
                      <Button asChild variant="outline" className="shrink-0 gap-2">
                        <Link to={topic.cta.to}>
                          {topic.cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const DocsNav = ({ activeId, filteredIds, onNavigate }: { activeId: string; filteredIds: Set<string>; onNavigate?: () => void }) => (
  <nav aria-label="Documentation topics" className="space-y-6">
    {GROUPS.map((group) => {
      const topics = TOPICS.filter((topic) => topic.group === group.title && filteredIds.has(topic.id));
      if (topics.length === 0) return null;
      return (
        <div key={group.title}>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">{group.title}</p>
          <div className="space-y-1">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const active = activeId === topic.id;
              return (
                <Link
                  key={topic.id}
                  to={`/docs#${topic.id}`}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span>{topic.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      );
    })}
  </nav>
);

const TopicHeader = ({ topic, index }: { topic: Topic; index: number }) => {
  const Icon = topic.icon;
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-full border border-border bg-background px-2.5 py-1">{String(index).padStart(2, '0')}</span>
          <span>{topic.group}</span>
          <span aria-hidden>•</span>
          <span className="text-primary">{topic.eyebrow}</span>
        </div>
        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{topic.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{topic.summary}</p>
      </div>
    </header>
  );
};

export default Docs;
