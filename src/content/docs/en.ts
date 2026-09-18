import type { DocsDictionary } from './types';

const en: DocsDictionary = {
  dir: 'ltr',
  ui: {
    docsLabel: 'Documentation',
    home: 'Home',
    h1: 'FIVESOM Documentation',
    intro:
      'Clear, step-by-step guides for buying services, selling as a freelancer, managing orders, and getting paid on FIVESOM. Pick a chapter on the left to read only that topic.',
    metaTitle: 'FIVESOM Documentation — Guides for Buyers and Freelancers',
    metaDescription:
      'Official FIVESOM documentation: creating an account, building a freelancer profile, publishing gigs, ordering services, escrow payments, withdrawals, verification, Blue Tick and support.',
    searchPlaceholder: 'Search the documentation…',
    clearSearch: 'Clear search',
    browseHeading: 'Browse by chapter',
    browseIntro: 'Start with a group, then open the exact chapter you need.',
    noResults: 'No documentation chapter matched your search.',
    noResultsHint: 'Try a simpler word like order, payment, gig, support or verification.',
    chaptersLabel: 'Chapters',
    relatedLabel: 'Related chapters',
    nextChapter: 'Next chapter',
    previousChapter: 'Previous chapter',
    backToDocs: 'All chapters',
    languageLabel: 'Language',
    videoCaption: 'This tutorial video belongs to this chapter.',
    openMenu: 'Open chapters',
    closeMenu: 'Close chapters',
    needHelpTitle: 'Still need help?',
    needHelpBody: 'If a chapter does not answer your question, the FIVESOM support team can review your account or order directly.',
    needHelpCta: 'Contact FIVESOM Support',
  },
  groups: {
    'getting-started': { title: 'Getting Started', description: 'What FIVESOM is, how to open an account, and how to keep it safe.' },
    freelancers: { title: 'Freelancers', description: 'Build a profile, publish gigs, price your work and get paid.' },
    buyers: { title: 'Buyers', description: 'Find the right freelancer, order safely and review the delivery.' },
    orders: { title: 'Orders & Delivery', description: 'Communication, delivery, revisions and disputes.' },
    payments: { title: 'Payments & Security', description: 'Escrow protection, privacy and safe marketplace behaviour.' },
    verification: { title: 'Verification & VIP', description: 'Identity verification, the Blue Tick and VIP membership.' },
    support: { title: 'Support', description: 'How to reach FIVESOM Support and what to include.' },
  },
  chapters: {
    'getting-started': {
      title: 'Getting Started with FIVESOM',
      eyebrow: 'Platform overview',
      summary: 'Understand what FIVESOM is, who it serves, and how work moves safely from discovery to payment release.',
      ctaLabel: 'See how FIVESOM works',
      sections: [
        {
          heading: 'What is FIVESOM?',
          body: 'FIVESOM is a freelance marketplace for clients and skilled freelancers, with a strong focus on African and Somali talent. Buyers find services, freelancers publish gigs, and every paid order is tracked through the platform from requirements to delivery.',
        },
        {
          heading: 'How the platform works',
          bullets: [
            'A buyer finds a gig or freelancer and chooses a service package.',
            'The buyer pays through FIVESOM so the order is protected by escrow.',
            'The freelancer receives the requirements, completes the work and submits the delivery.',
            'The buyer accepts the delivery, requests a revision, or opens a dispute if needed.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Create an account, then choose whether you want to hire freelancers, sell your skills, or do both from the same FIVESOM account.',
        },
      ],
    },
    'creating-account': {
      title: 'Creating Your Account',
      eyebrow: 'Account setup',
      summary: 'Create a FIVESOM account, choose your role, and prepare your profile for buying or selling services.',
      ctaLabel: 'Create an account',
      videoLabel: 'Creating a FIVESOM account tutorial',
      sections: [
        {
          heading: 'What is this?',
          body: 'Your FIVESOM account is the identity you use to buy gigs, publish services, message users, manage orders and receive platform notifications.',
        },
        {
          heading: 'Steps to create an account',
          bullets: [
            'Open the registration page and continue with the available sign-in option.',
            'Choose the role you need first: buyer, freelancer, or upgrade later when needed.',
            'Add your name, profile photo, location and a short bio so other users know who they are working with.',
            'Review your account settings and keep your login protected.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Buyers can browse services immediately. Freelancers should complete their profile before publishing a gig so buyers see a professional first impression.',
        },
      ],
    },
    'account-security': {
      title: 'Account & Security',
      eyebrow: 'Privacy and protection',
      summary: 'Keep your account safe and understand which information is public, private, or used only for platform security.',
      ctaLabel: 'Read the privacy policy',
      sections: [
        {
          heading: 'What is protected?',
          body: 'FIVESOM separates public profile information from private account, payment, order and verification data. Sensitive files such as identity documents and order attachments are never shown publicly.',
        },
        {
          heading: 'How to protect your account',
          bullets: [
            'Use the official FIVESOM website and never share your login session.',
            'Keep order communication and file exchange inside the platform.',
            'Ignore requests to move payments or delivery outside FIVESOM.',
            'Report suspicious profiles, fake portfolios or payment requests immediately.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'If you notice unusual activity, contact FIVESOM Support with the account email, order ID or gig link so the team can investigate quickly.',
        },
      ],
    },
    'freelancer-profile': {
      title: 'Freelancer Profile',
      eyebrow: 'Seller foundation',
      summary: 'Build a profile that clearly explains your skills, experience, languages, tools, portfolio and trust signals.',
      ctaLabel: 'Edit your freelancer profile',
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
            'List relevant skills, languages, tools and portfolio samples that prove your work quality.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'After your profile is complete, create a gig with clear packages, examples, buyer requirements and delivery expectations.',
        },
      ],
    },
    'creating-gig': {
      title: 'Creating a Gig',
      eyebrow: 'Service publishing',
      summary: 'Turn a service into a clear offer buyers can understand, compare, purchase and review.',
      ctaLabel: 'Create a gig',
      videoLabel: 'Creating a gig on FIVESOM tutorial',
      sections: [
        {
          heading: 'What is a gig?',
          body: 'A gig is a packaged freelance service. It explains what you offer, which category it belongs to, what each package includes, what the buyer must provide and how long delivery takes.',
        },
        {
          heading: 'How to build a strong gig',
          bullets: [
            'Choose the most accurate category and write a specific service title.',
            'Explain the outcome the buyer receives, not only the task you perform.',
            'Add Basic, Standard and Premium packages with clear deliverables.',
            'Collect buyer requirements up front so you can start without delays.',
            'Use portfolio media that shows your own original work.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Once published, your gig can appear in search and category pages. Keep the title, thumbnail, packages and delivery time accurate so buyers know exactly what they are ordering.',
        },
      ],
    },
    'packages-pricing': {
      title: 'Gig Packages & Pricing',
      eyebrow: 'Basic, Standard, Premium',
      summary: 'Use three package tiers to make your offer easy to compare and easier for buyers to purchase.',
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
            'Premium should include the most complete delivery, faster turnaround or extra deliverables.',
            'Each tier should clearly list delivery time, included items, revisions and any limits.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'When a buyer orders a package, its price and deliverables become part of the order record. Keep package details realistic so disputes are easier to avoid.',
        },
      ],
    },
    'earnings-fees': {
      title: 'Freelancer Earnings & Fees',
      eyebrow: 'Wallet balance',
      summary: 'Understand how completed orders become freelancer earnings and how the FIVESOM fee is applied.',
      ctaLabel: 'Open your wallet',
      sections: [
        {
          heading: 'When do freelancers earn?',
          body: 'Freelancers earn when a buyer accepts the delivery. Before acceptance, the buyer payment stays protected in escrow and is not available for withdrawal.',
        },
        {
          heading: 'How fees work',
          bullets: [
            'FIVESOM applies a 15% platform commission to freelancer earnings when withdrawals are processed.',
            'The freelancer receives the remaining 85% after the platform fee.',
            'Wallet balances are calculated by the platform, never edited in the browser.',
            'Withdrawal availability depends on completed orders and pending withdrawal requests.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Once funds are available in your wallet, request a withdrawal using the supported payout options in your account.',
        },
      ],
    },
    withdrawals: {
      title: 'Withdrawals',
      eyebrow: 'Payouts',
      summary: 'Request a payout from your FIVESOM wallet once eligible earnings are available.',
      ctaLabel: 'Open your wallet',
      videoLabel: 'Withdrawing FIVESOM earnings tutorial',
      sections: [
        {
          heading: 'What is a withdrawal?',
          body: 'A withdrawal is a request to transfer available freelancer earnings from your FIVESOM wallet to a supported payout method, including local mobile money.',
        },
        {
          heading: 'How withdrawals work',
          bullets: [
            'Complete orders and wait until buyer acceptance releases funds to your wallet.',
            'Confirm your payout details before requesting a withdrawal.',
            'The minimum withdrawal amount is $20.',
            'FIVESOM reviews and processes eligible withdrawal requests according to platform rules.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Track the withdrawal status from your wallet. If a request needs review, support may ask for updated payout details.',
        },
      ],
    },
    'finding-freelancers': {
      title: 'Finding Freelancers',
      eyebrow: 'Search and compare',
      summary: 'Find the right freelancer by category, gig details, reviews, portfolio quality, delivery time and communication.',
      ctaLabel: 'Explore services',
      sections: [
        {
          heading: 'What can buyers search for?',
          body: 'Buyers can browse FIVESOM by service category, search terms, freelancer profile, rating, package price and delivery fit.',
        },
        {
          heading: 'How to choose well',
          bullets: [
            'Open the gig and read what each package includes before ordering.',
            'Check portfolio samples, reviews, rating and any verified badges.',
            'Message the freelancer first for complex, custom or urgent work.',
            'Confirm the delivery format, timeline and source files before paying.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'After choosing a freelancer, select the package that matches your project and continue to the secure checkout.',
        },
      ],
    },
    'buying-gig': {
      title: 'Buying a Gig',
      eyebrow: 'Place an order',
      summary: 'Choose a package, pay securely, submit requirements and track the order from your buyer dashboard.',
      ctaLabel: 'Browse gigs',
      videoLabel: 'Ordering a service on FIVESOM tutorial',
      sections: [
        {
          heading: 'What is buying a gig?',
          body: 'Buying a gig means selecting a freelancer service package and creating an order through FIVESOM. The order holds the package details, payment status, requirements, delivery files, messages and review actions.',
        },
        {
          heading: 'How to place an order',
          bullets: [
            'Open the gig and compare Basic, Standard and Premium packages.',
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
    },
    'order-requirements': {
      title: 'Order Requirements',
      eyebrow: 'Project details',
      summary: 'Give the freelancer the instructions, files, references and goals needed to start correctly.',
      ctaLabel: 'View your orders',
      sections: [
        {
          heading: 'What are requirements?',
          body: 'Order requirements are the instructions and files a buyer submits after checkout. They tell the freelancer what to create, which format to deliver and which details matter most.',
        },
        {
          heading: 'What to include',
          bullets: [
            'A short project goal and the exact deliverable you expect.',
            'Brand names, colours, text, files, links, dimensions or technical notes.',
            'Examples of what you like and what the freelancer should avoid.',
            'A clear deadline if the project depends on a launch or campaign date.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'When requirements are submitted, the order moves into active work. Missing requirements delay the freelancer and push back delivery.',
        },
      ],
    },
    'reviewing-delivery': {
      title: 'Reviewing a Delivery',
      eyebrow: 'Accept, rate or ask for changes',
      summary: 'Check the delivered work carefully before accepting, because acceptance releases the escrow payment.',
      ctaLabel: 'View your orders',
      videoLabel: 'Buyer acceptance and payment release tutorial',
      sections: [
        {
          heading: 'What is delivery review?',
          body: 'Delivery review is the buyer decision point. You compare the delivered work with the package and requirements, then accept, request a revision or dispute the order.',
        },
        {
          heading: 'How to review safely',
          bullets: [
            'Open all files and links before clicking Accept Delivery.',
            'Compare the work against the requirements you submitted.',
            'Use revision requests for clear, fixable changes.',
            'Open a dispute only when the delivery does not match the order and a revision cannot solve it.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'When you accept the delivery, escrow is released to the freelancer and you can leave a 1–5 star review with a written comment.',
        },
      ],
    },
    'messaging-communication': {
      title: 'Messaging & Communication',
      eyebrow: 'Work together clearly',
      summary: 'Use FIVESOM messages to confirm scope, share files, answer questions and keep a protected project record.',
      ctaLabel: 'Open your inbox',
      videoLabel: 'FIVESOM messaging tutorial',
      sections: [
        {
          heading: 'Why messages matter',
          body: 'Clear written communication prevents most order problems. Messages also create a record that support can review if a dispute is opened.',
        },
        {
          heading: 'Best practices',
          bullets: [
            'Confirm scope, timeline, file formats and expectations before work begins.',
            'Keep all important project decisions inside FIVESOM chat.',
            'Use attachments and links only when they support the order.',
            'Respond quickly and professionally, especially when revisions are requested.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Once the freelancer has the information needed, they complete the work and submit the delivery through the order page.',
        },
      ],
    },
    'delivering-order': {
      title: 'Delivering an Order',
      eyebrow: 'Freelancer workflow',
      summary: 'Submit completed work through the order page so the buyer can review it and escrow can be released after acceptance.',
      ctaLabel: 'Open your orders',
      videoLabel: 'Managing and delivering orders on FIVESOM tutorial',
      sections: [
        {
          heading: 'What counts as delivery?',
          body: 'A delivery is the completed work, message, files, links or instructions the freelancer submits for buyer review. It should match the purchased package and the buyer requirements.',
        },
        {
          heading: 'How to deliver professionally',
          bullets: [
            'Review the original requirements before submitting final files.',
            'Upload the correct files and explain what is included in the delivery message.',
            'Mention any usage notes, file formats or next steps the buyer needs.',
            'Never mark incomplete work as delivered just to stop the deadline.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'The buyer reviews the delivery and can accept it, request a revision, or open a dispute if the work does not match the order.',
        },
      ],
    },
    revisions: {
      title: 'Revisions',
      eyebrow: 'Request changes',
      summary: 'Use revisions to ask for specific changes before accepting the delivery.',
      sections: [
        {
          heading: 'What is a revision?',
          body: 'A revision is a request for the freelancer to adjust a delivery that is close but not yet right. It should stay inside the original order scope and requirements.',
        },
        {
          heading: 'How to request a useful revision',
          bullets: [
            'Be specific about what should change and where the issue appears.',
            'Attach screenshots, timestamps, file names or examples when helpful.',
            'Keep the request within the package you purchased.',
            'Avoid asking for a completely new project as a revision.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'The freelancer reviews your request, updates the work and submits a new delivery for you to review again.',
        },
      ],
    },
    disputes: {
      title: 'Disputes',
      eyebrow: 'When an order needs review',
      summary: 'Open a dispute when buyer and freelancer cannot resolve an order issue through messages or revisions.',
      videoLabel: 'FIVESOM dispute process tutorial',
      sections: [
        {
          heading: 'What is a dispute?',
          body: 'A dispute asks FIVESOM support to review an order and decide the fairest outcome based on the order details, messages, files and evidence from both sides.',
        },
        {
          heading: 'How disputes work',
          bullets: [
            'Either side explains the problem from the order page.',
            'Both sides can provide messages, files, screenshots or other order evidence.',
            'The support team reviews the original scope and the delivery history.',
            'The result can include revision guidance, refund handling or payment release depending on the evidence.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Funds stay protected while the dispute is reviewed. Keep communication professional and respond quickly when support asks for details.',
        },
      ],
    },
    'escrow-payments': {
      title: 'Escrow & Payments',
      eyebrow: 'Payment protection',
      summary: 'Learn how FIVESOM holds buyer funds safely until work is delivered and accepted.',
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
            'The buyer accepts the delivery and payment is released to the freelancer wallet.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'If the delivery does not match the order, the buyer can request a revision or open a dispute before accepting.',
        },
      ],
    },
    'privacy-trust': {
      title: 'Privacy & Trust',
      eyebrow: 'Safe marketplace behaviour',
      summary: 'Understand how FIVESOM protects private data and what users should do to keep orders safe.',
      ctaLabel: 'Read the terms',
      sections: [
        {
          heading: 'What stays private?',
          body: 'Private account details, identity documents, payment records, order attachments and internal verification decisions are never part of public profiles or gig pages.',
        },
        {
          heading: 'How users keep trust high',
          bullets: [
            'Use real portfolio work and honest profile information.',
            'Never ask for off-platform payment or private contact details to bypass FIVESOM.',
            'Report fake accounts, stolen work, abusive messages or suspicious payment behaviour.',
            'Use disputes only for genuine order problems and provide clear evidence.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Reports and disputes are reviewed by the FIVESOM team. Accounts that break marketplace rules can receive warnings, restrictions or removal.',
        },
      ],
    },
    verification: {
      title: 'Account Verification',
      eyebrow: 'Verified seller badge',
      summary: 'Confirm your identity so buyers can see that a real, checked person is behind your gigs.',
      ctaLabel: 'Start verification',
      videoLabel: 'Verifying your FIVESOM account tutorial',
      sections: [
        {
          heading: 'What is verification?',
          body: 'Verification is an identity check. You submit an official identity document from your freelancer dashboard, the FIVESOM team reviews it, and an approved account receives the green Verified badge on its profile and gigs.',
        },
        {
          heading: 'How to get verified',
          bullets: [
            'Open Verification from your freelancer dashboard and complete your profile details first.',
            'Upload a clear photo of an accepted identity document, such as a passport, national ID or driving licence.',
            'Make sure the name on the document matches the name on your FIVESOM profile.',
            'Submit the request and wait for the review — documents are stored privately and seen only by authorised staff.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'If the review succeeds, the Verified badge appears on your public profile. If something is unclear, the team asks for a new document and you can resubmit. Verification is not the same thing as the Blue Tick.',
        },
      ],
    },
    'blue-tick': {
      title: 'Blue Tick',
      eyebrow: 'Awarded by FIVESOM only',
      summary: 'The Blue Tick is the highest trust signal on FIVESOM and is granted only by the FIVESOM team after review.',
      ctaLabel: 'Open the Blue Tick application',
      sections: [
        {
          heading: 'What is the Blue Tick?',
          body: 'The Blue Tick marks experienced, reliable freelancers. It cannot be bought and it is not automatic: the FIVESOM team reviews each application and grants the badge manually. It is separate from the green Verified badge.',
        },
        {
          heading: 'Eligibility and the application',
          bullets: [
            'Your account must be at least 100 days old, measured from your real signup date.',
            'Eligibility is calculated from real activity: completed orders, ratings, earnings and profile quality.',
            'The application has three steps — professional information, identity information, and a face or camera check.',
            'Progress is saved as you go, and all three steps must be complete before the application can be submitted.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'The FIVESOM team can approve, reject or ask for changes. Approved freelancers show the Blue Tick across the platform. Documents and face images stay private and are used only for this review.',
        },
      ],
    },
    'vip-membership': {
      title: 'VIP Membership',
      eyebrow: 'Growth features',
      summary: 'Understand VIP visibility features, seller limits and how membership supports more serious freelancers.',
      ctaLabel: 'View VIP membership',
      sections: [
        {
          heading: 'What is VIP?',
          body: 'VIP membership is for freelancers who want more visibility and growth tools. It complements strong work quality; it does not replace reviews, delivery performance or marketplace rules.',
        },
        {
          heading: 'How to use VIP responsibly',
          bullets: [
            'Keep gig quality high before paying for more visibility.',
            'Use extra gig capacity only for services you can deliver well.',
            'Maintain fast responses, on-time delivery and clear buyer communication.',
            'Review your performance before upgrading or renewing.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Visit the VIP page to compare the available options and make sure the plan matches your current freelance workload.',
        },
      ],
    },
    support: {
      title: 'FIVESOM Support',
      eyebrow: 'Help and contact',
      summary: 'Find answers, contact support and include the right information so the team can help faster.',
      ctaLabel: 'Contact support',
      sections: [
        {
          heading: 'When should you contact support?',
          body: 'Contact FIVESOM Support for account access issues, payment questions, order disputes, verification problems, suspicious behaviour or anything the documentation does not answer.',
        },
        {
          heading: 'What to include',
          bullets: [
            'Your order ID, gig link or profile link when the question relates to a specific page.',
            'A short explanation of what happened and what you expected instead.',
            'Screenshots or files only when they help support understand the issue.',
            'Your preferred reply language if you need Somali, Arabic, French or English support.',
          ],
        },
        {
          heading: 'What happens next?',
          body: 'Support reviews the request, checks the relevant account or order records, and replies with the next action or decision.',
        },
      ],
    },
  },
};

export default en;
