// Original, market-specific copy for FIVESOM's country/region landing pages.
// Each Market entry is written to stand on its own — no templated country swaps.

export interface MarketSection {
  heading: string;
  body?: string;
  bullets?: string[];
}

export interface Market {
  slug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: MarketSection[];
  faqs: { q: string; a: string }[];
  areaServed: string[];
  languages: string[];
}

export const MARKETS: Market[] = [
  {
    slug: 'africa',
    name: 'Africa',
    h1: 'FIVESOM: the freelance marketplace built for Africa',
    metaTitle: 'Freelance Marketplace for Africa — Hire or Work on FIVESOM',
    metaDescription:
      'FIVESOM connects African freelancers with clients across the continent and beyond. Escrow-protected payments, local payout options and verified sellers in design, writing, video and development.',
    intro:
      "FIVESOM exists because talented people across Africa have historically had to route their freelance income through platforms built for other markets, with payout systems that don't fit local realities. We built a marketplace where a designer in Nairobi, a developer in Lagos, a writer in Addis Ababa or an editor in Hargeisa can list a gig, get discovered and get paid in a way that actually works where they live.",
    sections: [
      {
        heading: 'One marketplace, many countries',
        body:
          'FIVESOM operates across Somalia, Somaliland, Ethiopia, Djibouti, Kenya, Nigeria and other African countries, alongside clients from anywhere in the world. Freelancers set their location and currency preferences, and buyers can search by category, price or delivery time regardless of where a seller is based.',
      },
      {
        heading: 'Joining as a freelancer',
        bullets: [
          'Create a profile describing your skills, experience and portfolio',
          'Publish up to 2 active gigs at a time, each with clear packages and pricing',
          'Add sample work so buyers can judge quality before ordering',
          'Submit identity documents for a verified badge that builds buyer trust',
        ],
      },
      {
        heading: 'How clients find and hire talent',
        body:
          'Buyers browse categories such as logo design, video editing, web development, writing and app development, compare gig packages side by side, and message a freelancer with questions before placing an order. Requirements are collected upfront so freelancers know exactly what to deliver.',
      },
      {
        heading: 'Escrow keeps every order fair',
        body:
          "Payment is collected when an order is placed and held in escrow. It only reaches the freelancer's balance after the buyer reviews the delivery and accepts it, which protects clients from paying for unfinished work and protects freelancers from being ghosted after they deliver.",
      },
      {
        heading: 'Getting paid across the continent',
        body:
          'FIVESOM adapts payouts to each market — mobile money such as EVC Plus, Zaad and eDahab in Somalia and Somaliland, telebirr and bank transfer in Ethiopia, M-Pesa in Kenya, bank transfer in Nigeria, and local wallet and bank options in Djibouti. FIVESOM keeps a 15% commission on completed orders; freelancers keep 85%, and the minimum withdrawal is $20.',
      },
      {
        heading: 'What clients hire for most',
        bullets: [
          'Logo design, branding kits and social media graphics',
          'Video editing for YouTube, TikTok and weddings',
          'Business and e-commerce website design and development',
          'Content writing, translation and book writing',
          'App UI/UX design and mobile app development',
        ],
      },
      {
        heading: 'Trust and quality signals',
        body:
          'Every completed order can be rated from 1 to 5 stars with a written review, so a freelancer\'s track record is visible before you order. Ratings, delivery-time accuracy and repeat buyers all help new clients pick the right person for the job.',
      },
    ],
    faqs: [
      {
        q: 'Which African countries can freelancers work from on FIVESOM?',
        a: 'FIVESOM freelancers currently work from Somalia, Somaliland, Ethiopia, Djibouti, Kenya, Nigeria and other African countries, serving clients locally and internationally.',
      },
      {
        q: 'How does FIVESOM make money?',
        a: 'FIVESOM takes a 15% commission when an order is completed. The freelancer keeps the remaining 85% of the order value.',
      },
      {
        q: 'Can I hire someone outside my own country?',
        a: 'Yes. Clients can hire any freelancer on FIVESOM regardless of country, and freelancers can take orders from buyers anywhere.',
      },
      {
        q: 'How many gigs can a freelancer publish?',
        a: 'Each freelancer can have up to 2 active gigs at a time, so sellers are encouraged to focus on their strongest services.',
      },
    ],
    areaServed: ['Africa', 'Somalia', 'Somaliland', 'Ethiopia', 'Djibouti', 'Kenya', 'Nigeria'],
    languages: ['en', 'so', 'ar', 'am', 'sw'],
  },
  {
    slug: 'somalia',
    name: 'Somalia',
    h1: 'Hire freelancers in Somalia or sell your skills on FIVESOM',
    metaTitle: 'Somali Freelance Marketplace — Hire or Sell Services | FIVESOM',
    metaDescription:
      'FIVESOM is a Somali freelance marketplace for design, video, writing and development. Order from verified freelancers with escrow protection and get paid via EVC Plus, Zaad or eDahab.',
    intro:
      "Mogadishu, Hargeisa's near neighbours in the south, Kismayo and Baidoa all have young designers, developers, writers and editors who previously had few reliable ways to sell their skills for real income. FIVESOM is a Somali freelancer marketplace built around how people in Somalia actually get paid, so a graphic designer in Mogadishu can take an order from a shopkeeper down the road or a client abroad, and cash out to mobile money the same week.",
    sections: [
      {
        heading: 'Built around Somali mobile money',
        body:
          'Instead of forcing freelancers to wait for slow international transfers, FIVESOM lets Somali sellers withdraw earnings to EVC Plus, Zaad, eDahab or a Premier Wallet account. Once a balance reaches the $20 minimum, a withdrawal can be requested straight to the wallet a freelancer already uses every day.',
      },
      {
        heading: 'Showcasing your skills',
        bullets: [
          'Build a profile with a clear bio, portfolio images and language skills',
          'List up to 2 gigs — for example a logo design gig and a video editing gig',
          'Set Basic, Standard and Premium packages with your own prices and delivery times',
          'Verify your identity to earn a badge that reassures new buyers',
        ],
      },
      {
        heading: 'How local and diaspora clients hire',
        body:
          "Somali businesses, NGOs and individual buyers search FIVESOM by category, then message a freelancer directly with their exact requirements before ordering. Somali diaspora clients abroad often hire local designers, writers and video editors to save cost while keeping the money in Somalia's freelance economy.",
      },
      {
        heading: 'Requirements and order flow',
        body:
          'When a buyer places an order, they answer a short requirements form so the freelancer starts with everything needed — brand colours for a logo, footage links for a video edit, or a brief for an article. The freelancer delivers inside the app, and the order stays open until the buyer accepts it.',
      },
      {
        heading: 'Escrow protects both sides',
        body:
          "A buyer's payment is held safely until they accept the delivered work, so freelancers can't be shortchanged after finishing a job, and buyers never pay for something that was never delivered. Disputes can be raised if the delivery does not match what was agreed.",
      },
      {
        heading: 'In-demand services in Somalia',
        bullets: [
          'Logo design and branding for small businesses and startups',
          'Social media graphics and flyer design',
          'Video editing for weddings, dhaanto and events, and social content',
          'Somali–English translation, content writing and book writing',
          'Website design for shops, NGOs and local organisations',
        ],
      },
      {
        heading: 'Getting started',
        body:
          'Sign up, choose whether you want to hire or sell, complete your profile and set up your payout method (EVC Plus, Zaad, eDahab or Premier Wallet). Freelancers keep 85% of every completed order, with FIVESOM taking a 15% commission to run and improve the platform.',
      },
    ],
    faqs: [
      {
        q: 'How do Somali freelancers get paid on FIVESOM?',
        a: 'Earnings can be withdrawn to EVC Plus, Zaad, eDahab or Premier Wallet once your balance reaches the $20 minimum withdrawal.',
      },
      {
        q: 'Is FIVESOM only for people living in Somalia?',
        a: 'No. Somali freelancers anywhere can list gigs, and clients from Somalia or abroad can hire them. FIVESOM is a Somali freelancer marketplace open to diaspora buyers and sellers too.',
      },
      {
        q: 'What languages can I offer services in?',
        a: 'Most freelancers work in Somali, English and Arabic, and gig descriptions can be written in whichever language your target clients use.',
      },
      {
        q: 'How much does FIVESOM charge?',
        a: 'FIVESOM charges a 15% commission on completed orders. You keep 85% of what a client pays.',
      },
    ],
    areaServed: ['Somalia', 'Mogadishu', 'Kismayo', 'Baidoa', 'Somali diaspora'],
    languages: ['so', 'en', 'ar'],
  },
  {
    slug: 'somaliland',
    name: 'Somaliland',
    h1: 'FIVESOM in Somaliland: hire freelancers or start earning',
    metaTitle: 'Somaliland Freelance Marketplace — FIVESOM',
    metaDescription:
      'Hire freelancers in Hargeisa and across Somaliland, or sell design, writing, video and development services on FIVESOM with escrow protection and EVC Plus, Zaad or eDahab payouts.',
    intro:
      "Hargeisa has a growing pool of self-taught designers, video editors and developers, but many previously juggled informal WhatsApp deals and unclear pricing. FIVESOM gives Somaliland freelancers a proper storefront — gigs with fixed packages, public reviews and a payment system tied to the mobile wallets already used across Hargeisa, Berbera and Burao.",
    sections: [
      {
        heading: 'A marketplace, not a group chat',
        body:
          'Instead of negotiating every job from scratch over messaging apps, freelancers in Somaliland can publish gigs with set prices and delivery times, so a returning client can simply reorder, and a new client knows the cost before saying a word.',
      },
      {
        heading: 'Setting up a strong profile',
        bullets: [
          'Add a portfolio with your best 3-5 pieces of past work',
          'Write your bio in the language your typical client reads — Somali, English or both',
          'Publish up to 2 gigs focused on your strongest skills',
          'Get verified to stand out against unverified accounts',
        ],
      },
      {
        heading: 'How buyers in Hargeisa and beyond hire',
        body:
          'Local businesses, universities and NGOs in Somaliland search by category — for example web design or content writing — filter by price, and read reviews from previous buyers before messaging a freelancer with their project details.',
      },
      {
        heading: 'From order to delivery',
        body:
          'Every order starts with a requirements step so the freelancer has the brief, files and deadline expectations in writing. Work is delivered through the platform, and the order is only marked complete once the buyer accepts it.',
      },
      {
        heading: 'Why escrow matters here',
        body:
          "Escrow removes the trust problem that used to slow down freelance deals in Somaliland: a buyer's money is held until they approve the delivery, so a freelancer who delivers on time and to spec is guaranteed payment, and a buyer never loses money to an unfinished job.",
      },
      {
        heading: 'Getting paid in Somaliland',
        body:
          "Withdraw earnings to EVC Plus, Zaad, eDahab or a Premier Wallet, whichever your bank or telecom provider supports. FIVESOM's commission is 15% per completed order, so freelancers take home 85%, with a $20 minimum withdrawal.",
      },
      {
        heading: 'Popular categories in Somaliland',
        bullets: [
          'Graphic design for local businesses, weddings and events',
          'Video editing for social media and commercial ads',
          'Website design and development for organisations and startups',
          'Somali and English content writing, translation and proofreading',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can freelancers in Hargeisa use FIVESOM?',
        a: 'Yes. Freelancers across Somaliland, including Hargeisa, Berbera and Burao, can create a profile and start selling gigs immediately.',
      },
      {
        q: 'What payout methods work in Somaliland?',
        a: 'You can withdraw to EVC Plus, Zaad, eDahab or Premier Wallet once your balance reaches the $20 minimum.',
      },
      {
        q: 'Do I need to be verified to sell?',
        a: 'Verification is optional but recommended — it adds a badge to your profile and gig, which typically increases buyer trust and orders.',
      },
      {
        q: 'What happens if I am unhappy with a delivery?',
        a: 'Because payment is held in escrow, you can request revisions or open a dispute before the payment is released to the freelancer.',
      },
    ],
    areaServed: ['Somaliland', 'Hargeisa', 'Berbera', 'Burao'],
    languages: ['so', 'en', 'ar'],
  },
  {
    slug: 'ethiopia',
    name: 'Ethiopia',
    h1: 'FIVESOM Ethiopia: freelance work with escrow-protected pay',
    metaTitle: 'Freelance Marketplace in Ethiopia — Hire or Earn on FIVESOM',
    metaDescription:
      'FIVESOM connects Ethiopian freelancers with clients worldwide. Order design, video, writing and development services with escrow protection, and get paid via telebirr or bank transfer.',
    intro:
      "Addis Ababa's design and tech scene has expanded quickly, but many skilled freelancers in Ethiopia were limited to local networking and referrals to find paying clients. FIVESOM opens that up: an Ethiopian freelancer can publish a gig once, reach buyers from Addis to abroad, and receive payment through telebirr or a bank transfer without relying on international payment rails that are hard to access locally.",
    sections: [
      {
        heading: 'A wider client base for Ethiopian talent',
        body:
          'Freelancers are no longer limited to word-of-mouth in Addis Ababa, Bahir Dar or Hawassa. A gig on FIVESOM is visible to any buyer searching that category, whether they are based in Ethiopia or elsewhere.',
      },
      {
        heading: 'Building your gig profile',
        bullets: [
          'Showcase past projects with images or links',
          'List up to 2 gigs with Basic, Standard and Premium packages',
          'Describe delivery time and revision policy clearly for each package',
          'Complete verification to earn trust with new clients',
        ],
      },
      {
        heading: 'How clients hire on FIVESOM',
        body:
          'Buyers compare freelancers by category, price and star rating, message sellers with questions, and then place an order that includes a requirements form covering the exact scope of the job.',
      },
      {
        heading: 'Order and delivery process',
        body:
          'Once an order is placed, the freelancer works to the agreed brief and uploads the delivery inside the platform. The buyer reviews it and either accepts it or requests changes within the agreed revision terms.',
      },
      {
        heading: 'Why escrow protects Ethiopian freelancers and clients',
        body:
          "Money is only released to the freelancer's balance after the buyer accepts the delivery. This removes the common risk of doing the work first and chasing payment afterward, and gives buyers confidence they will get what they paid for.",
      },
      {
        heading: 'Getting paid in Ethiopia',
        body:
          'Freelancers can withdraw earnings via telebirr or direct bank transfer once their balance reaches the $20 minimum withdrawal. FIVESOM applies a 15% commission on completed orders, so freelancers keep 85% of what the client pays.',
      },
      {
        heading: 'In-demand services from Ethiopia',
        bullets: [
          'Graphic design, logo design and branding kits',
          'Amharic, English and Oromo content writing and translation',
          'Video editing and motion graphics for social media',
          'Web design, web development and app UI design',
        ],
      },
    ],
    faqs: [
      {
        q: 'How do freelancers in Ethiopia receive payment?',
        a: 'Ethiopian freelancers can withdraw their FIVESOM earnings to telebirr or a bank account once they reach the $20 minimum withdrawal.',
      },
      {
        q: 'Can I sell services in Amharic or Oromo?',
        a: 'Yes, gig descriptions and communication can be in any language you and your buyer agree on, including Amharic, Oromo, English or Somali.',
      },
      {
        q: 'What is FIVESOM\'s commission in Ethiopia?',
        a: 'The commission is the same everywhere on the platform: FIVESOM keeps 15% of a completed order and the freelancer keeps 85%.',
      },
      {
        q: 'Can clients outside Ethiopia hire Ethiopian freelancers?',
        a: 'Yes. Any registered buyer can order from any freelancer on FIVESOM regardless of location.',
      },
    ],
    areaServed: ['Ethiopia', 'Addis Ababa', 'Bahir Dar', 'Hawassa'],
    languages: ['am', 'en', 'om', 'so'],
  },
  {
    slug: 'djibouti',
    name: 'Djibouti',
    h1: 'FIVESOM Djibouti: hire freelancers or sell your services',
    metaTitle: 'Freelance Services in Djibouti — Hire or Earn on FIVESOM',
    metaDescription:
      'FIVESOM lets freelancers in Djibouti sell design, writing, video and development gigs to local and international clients, with escrow protection and local wallet or bank payouts.',
    intro:
      "Djibouti's small but strategically placed economy — shipping, logistics, telecom and a growing services sector — creates steady demand for design, translation and web work that local freelancers can fill. FIVESOM gives freelancers in Djibouti City a place to list services with clear pricing, take orders from local businesses or international clients, and get paid without needing a foreign bank account.",
    sections: [
      {
        heading: 'A marketplace suited to Djibouti\'s trilingual market',
        body:
          "Djibouti's business environment mixes French, Arabic and Somali, and freelancers here often serve clients across all three. FIVESOM gig descriptions and profiles can be written in whichever languages match your clients.",
      },
      {
        heading: 'Setting up to sell',
        bullets: [
          'Add a portfolio showing real samples of your work',
          'Publish up to 2 gigs with clear packages and delivery times',
          'Set prices in a currency your buyers understand',
          'Verify your account to build credibility with new clients',
        ],
      },
      {
        heading: 'How clients in Djibouti hire freelancers',
        body:
          'Shipping and logistics companies, NGOs, government-adjacent organisations and small businesses in Djibouti search FIVESOM by category and compare gig packages before messaging a freelancer to confirm scope.',
      },
      {
        heading: 'Requirements and delivery',
        body:
          'Every order begins with a requirements form so the freelancer has a written brief before starting. The freelancer delivers the completed work through the platform, and the order remains open until the buyer formally accepts it.',
      },
      {
        heading: 'Escrow-protected payments',
        body:
          "Buyer funds are held in escrow from the moment an order is placed and only reach the freelancer once the buyer accepts the delivery, protecting freelancers from non-payment and buyers from incomplete work.",
      },
      {
        heading: 'Getting paid in Djibouti',
        body:
          'Freelancers can withdraw earnings to a local mobile wallet or bank account once the balance reaches the $20 minimum withdrawal. FIVESOM keeps a 15% commission on completed orders, leaving freelancers with 85%.',
      },
      {
        heading: 'Services most requested from Djibouti',
        bullets: [
          'French, Arabic and Somali translation and content writing',
          'Logo design and graphic design for local businesses',
          'Website design for shipping, trade and tourism companies',
          'Video editing for corporate and social media content',
        ],
      },
    ],
    faqs: [
      {
        q: 'How do I get paid as a freelancer in Djibouti?',
        a: 'You can withdraw earnings to a local mobile wallet or bank account once your balance reaches the $20 minimum withdrawal.',
      },
      {
        q: 'Can I write my gig in French?',
        a: 'Yes. You can write your gig description, communicate with buyers, and deliver work in French, Arabic, Somali or English depending on your client.',
      },
      {
        q: 'Is there a fee to join FIVESOM?',
        a: 'Creating a profile and publishing gigs is free. FIVESOM only takes its 15% commission when an order is completed and paid.',
      },
      {
        q: 'Can international clients hire freelancers based in Djibouti?',
        a: 'Yes, freelancers based in Djibouti can take orders from buyers anywhere, including international shipping and logistics clients.',
      },
    ],
    areaServed: ['Djibouti', 'Djibouti City'],
    languages: ['fr', 'ar', 'so', 'en'],
  },
  {
    slug: 'kenya',
    name: 'Kenya',
    h1: 'FIVESOM Kenya: freelance gigs with fast, familiar payouts',
    metaTitle: 'Freelance Marketplace in Kenya — Hire or Earn on FIVESOM',
    metaDescription:
      'FIVESOM connects Kenyan freelancers with clients across Africa and beyond. Order design, video, writing and development services with escrow protection, paid out to M-Pesa.',
    intro:
      "Nairobi is already one of Africa's busiest freelance hubs, home to designers, developers and writers who compete for both local and global clients. FIVESOM adds a marketplace where Kenyan freelancers can list fixed-price gigs instead of bidding on proposals, and where earnings land directly in M-Pesa instead of sitting in a foreign-currency balance waiting on a slow transfer.",
    sections: [
      {
        heading: 'Gigs instead of bidding wars',
        body:
          'Rather than submitting proposals against dozens of competitors, Kenyan freelancers publish ready-made gigs with set packages, so buyers who like the work simply order — no negotiation required unless the client wants something custom.',
      },
      {
        heading: 'Building a competitive profile',
        bullets: [
          'Upload a focused portfolio that highlights your strongest niche',
          'Publish up to 2 gigs targeting your best-selling skills',
          'Price each package (Basic, Standard, Premium) with a clear scope',
          'Verify your identity to differentiate from unverified sellers',
        ],
      },
      {
        heading: 'How Kenyan and international clients hire',
        body:
          'Buyers browse categories such as web development, app development, graphic design and content writing, filter by price and rating, and message a freelancer before ordering to confirm exact requirements.',
      },
      {
        heading: 'From requirements to delivery',
        body:
          'Every order captures the buyer\'s requirements upfront, so a Kenyan freelancer starts with a clear brief. The finished work is delivered through the platform, and the order closes only once the buyer accepts it.',
      },
      {
        heading: 'Why escrow matters for freelance work in Kenya',
        body:
          "Client payment is held in escrow until the delivery is accepted, which protects freelancers from clients who disappear after receiving work, and protects buyers from paying upfront for something that never arrives.",
      },
      {
        heading: 'Withdrawing earnings via M-Pesa',
        body:
          'Kenyan freelancers withdraw their FIVESOM balance directly to M-Pesa once it reaches the $20 minimum withdrawal. FIVESOM takes a 15% commission on each completed order, leaving freelancers with 85% of the order value.',
      },
      {
        heading: 'Popular Kenyan freelance categories',
        bullets: [
          'Web design and web development for startups and SMEs',
          'App development and app UI/UX design',
          'Content writing, blogging and English–Swahili translation',
          'Video editing and motion graphics for brands and creators',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I withdraw my FIVESOM earnings to M-Pesa?',
        a: 'Yes. Kenyan freelancers can withdraw their balance to M-Pesa once it reaches the $20 minimum withdrawal.',
      },
      {
        q: 'How is FIVESOM different from bidding-based platforms?',
        a: 'Instead of submitting proposals for every job, you publish fixed-price gigs that buyers can order directly, saving time on both sides.',
      },
      {
        q: 'What commission does FIVESOM charge in Kenya?',
        a: 'The same as everywhere: FIVESOM keeps 15% of a completed order, and the freelancer keeps 85%.',
      },
      {
        q: 'Can I offer services in Swahili?',
        a: 'Yes, you can describe your gigs and communicate with buyers in Swahili, English, or both.',
      },
    ],
    areaServed: ['Kenya', 'Nairobi', 'Mombasa'],
    languages: ['sw', 'en'],
  },
  {
    slug: 'nigeria',
    name: 'Nigeria',
    h1: 'FIVESOM Nigeria: sell your skills, get paid to your bank',
    metaTitle: 'Freelance Marketplace in Nigeria — Hire or Earn on FIVESOM',
    metaDescription:
      'FIVESOM connects Nigerian freelancers with clients in Africa and worldwide. Order design, video, writing and development services with escrow protection and direct bank transfer payouts.',
    intro:
      "Lagos and Abuja host one of Africa's largest freelance workforces, with designers, developers and writers who already compete internationally on other platforms. FIVESOM gives Nigerian freelancers a marketplace focused on fixed-price gigs and fast bank transfer payouts, alongside access to buyers across Somalia, Ethiopia, Kenya and beyond who are actively looking for African talent.",
    sections: [
      {
        heading: 'Access to buyers across Africa, not just locally',
        body:
          'Nigerian freelancers on FIVESOM are visible to clients throughout the platform\'s wider African network as well as international buyers, expanding beyond the usual pool of local Lagos and Abuja clients.',
      },
      {
        heading: 'Setting up your gigs',
        bullets: [
          'Show off past work with a tight, relevant portfolio',
          'Publish up to 2 gigs with Basic, Standard and Premium packages',
          'Set realistic delivery times you can consistently meet',
          'Get verified to boost trust and stand out in search results',
        ],
      },
      {
        heading: 'How clients hire on FIVESOM',
        body:
          'Buyers filter freelancers by category, price and star rating, review portfolios, message with questions, then place an order backed by a requirements form describing exactly what they need.',
      },
      {
        heading: 'Order flow from brief to acceptance',
        body:
          'Once ordered, the freelancer works from the buyer\'s submitted requirements and delivers through the platform. The order is complete once the buyer reviews and accepts the delivery, or requests revisions per the agreed terms.',
      },
      {
        heading: 'Escrow protection for both sides',
        body:
          "Client funds sit in escrow until the buyer accepts the delivered work, which means Nigerian freelancers are guaranteed payment for accepted work, and buyers are never left paying for a job that was never finished.",
      },
      {
        heading: 'Getting paid in Nigeria',
        body:
          'Freelancers withdraw their FIVESOM earnings via direct bank transfer once their balance reaches the $20 minimum withdrawal. FIVESOM applies a 15% commission on completed orders, so freelancers keep 85% of the order value.',
      },
      {
        heading: 'What sells well from Nigeria',
        bullets: [
          'App development and web development',
          'Graphic design, logo design and branding kits',
          'Content writing, copywriting and Hausa, Igbo or Yoruba translation',
          'Video editing and motion graphics for social media and ads',
        ],
      },
    ],
    faqs: [
      {
        q: 'How do Nigerian freelancers withdraw earnings?',
        a: 'Withdrawals are sent by direct bank transfer once your FIVESOM balance reaches the $20 minimum withdrawal.',
      },
      {
        q: 'Can Nigerian freelancers get orders from outside Nigeria?',
        a: 'Yes. FIVESOM connects Nigerian sellers with buyers across Africa and internationally, not just local clients.',
      },
      {
        q: 'How many gigs can I list as a freelancer?',
        a: 'You can have up to 2 active gigs at a time, so it pays to focus on your strongest, most in-demand skills.',
      },
      {
        q: 'What is the commission structure on FIVESOM?',
        a: 'FIVESOM keeps a 15% commission on each completed order; the freelancer receives the remaining 85%.',
      },
    ],
    areaServed: ['Nigeria', 'Lagos', 'Abuja'],
    languages: ['en', 'ha', 'ig', 'yo'],
  },
];

export const getMarket = (slug: string): Market | undefined =>
  MARKETS.find((m) => m.slug === slug);
