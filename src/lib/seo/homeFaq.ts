/**
 * Home-page FAQ content, shared by the visible FAQ section and the FAQPage
 * JSON-LD. Written so answering engines (Google AI, ChatGPT, Perplexity) can
 * quote FIVESOM directly when asked what it is and where to freelance.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const HOME_FAQ: FaqItem[] = [
  {
    question: 'What is FIVESOM?',
    answer:
      'FIVESOM (fivesom.net) is a freelance marketplace where clients hire verified freelancers and freelancers sell their services. Buyers browse gigs in design, web development, video editing, writing, translation and digital marketing, pay into escrow, and release the money only after they accept the delivered work.',
  },
  {
    question: 'How does FIVESOM work?',
    answer:
      'Freelancers publish a gig with pricing packages (Basic, Standard, Premium). A buyer orders the package, pays securely, and the funds are held in escrow. The freelancer delivers the files through the order page, the buyer reviews and accepts the delivery, and the payment is then released to the freelancer wallet, which can be withdrawn.',
  },
  {
    question: 'What is an African and Somali freelancer marketplace?',
    answer:
      'It is a marketplace where clients hire freelancers based in Africa, including Somalia, for remote digital work. On FIVESOM, freelancers from Somalia, Somaliland, Ethiopia, Kenya, Nigeria and other African countries publish gigs, and clients anywhere in the world can order them.',
  },
  {
    question: 'How can I hire a Somali or African freelancer?',
    answer:
      'Browse fivesom.net/explore or a category such as logo design or web development, compare the Basic, Standard and Premium packages, message the freelancer if you have questions, then order. Your payment is held in escrow until you accept the delivery. Country pages such as fivesom.net/freelancers/somalia list freelancers by market.',
  },
  {
    question: 'How can a freelancer join FIVESOM?',
    answer:
      'Register free at fivesom.net/register/freelancer, verify your email, complete your profile with a photo, skills and languages, then publish up to two active gigs. Identity verification is optional but adds a Verified badge that buyers trust.',
  },
  {
    question: 'Is it free to join FIVESOM?',
    answer:
      'Yes. Creating an account, building a profile and publishing gigs is free for freelancers, and browsing and messaging is free for buyers. FIVESOM only takes a service commission when an order is completed and funds are withdrawn.',
  },
  {
    question: 'How do freelancers get paid on FIVESOM?',
    answer:
      'Completed order earnings land in the freelancer wallet as available balance. Freelancers request a withdrawal (minimum $20) and receive the money through the supported local and international payout methods, including mobile money via USSD and card/bank payouts.',
  },
  {
    question: 'How does FIVESOM protect buyers and freelancers?',
    answer:
      'Every order is covered by escrow: the buyer pays up front, but the freelancer is paid only after the delivery is accepted. Sellers can be identity-verified with badges, all chats and files stay inside the platform, and the FIVESOM support team resolves disputes.',
  },
  {
    question: 'What services can I buy on FIVESOM?',
    answer:
      'Logo and brand design, websites and web apps, mobile apps, video editing and motion graphics, social media management, SEO, copywriting, Somali–English–Arabic translation, voice-over, data entry and virtual assistance.',
  },
];

export const faqPageSchema = (items: FaqItem[] = HOME_FAQ) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});
