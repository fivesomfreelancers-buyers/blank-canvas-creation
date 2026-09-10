// SEO copy for the dedicated category / service landing pages.
// Keyed by the category slugs in `@/lib/categories`.

export interface CategoryContent {
  /** Short marketing headline used as the H1 suffix and in the meta title. */
  headline: string;
  /** 1-2 sentence summary — used for the meta description. */
  summary: string;
  /** Longer intro paragraphs rendered above the gig grid. */
  intro: string[];
  /** "What you can order" bullets. */
  deliverables: string[];
  faqs: { q: string; a: string }[];
}

const genericFaqs = (name: string): { q: string; a: string }[] => [
  {
    q: `How much does ${name.toLowerCase()} cost on FIVESOM?`,
    a: `Every freelancer sets their own packages, so prices start low for small jobs and rise with scope. Open any gig below to see the Basic, Standard and Premium price and delivery time before you order.`,
  },
  {
    q: `How do I pay safely?`,
    a: `Your payment is held in escrow. The freelancer only gets paid after you receive the work and accept the delivery, and you can open a dispute if something is wrong.`,
  },
  {
    q: `How fast is delivery?`,
    a: `Each gig shows its own delivery time — many ${name.toLowerCase()} orders are delivered within 1 to 3 days.`,
  },
  {
    q: `Are the freelancers verified?`,
    a: `Freelancers can submit identity documents and skill proof for review. Verified sellers carry a badge on their gig and profile.`,
  },
];

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  'logo-design': {
    headline: 'Hire a logo designer',
    summary:
      'Order a professional logo from verified freelance designers. Minimal, 3D, mascot and typography logos with source files and escrow-protected payment.',
    intro: [
      'A logo is the first thing customers remember about your business. On FIVESOM you can hire freelance logo designers who build a mark that works on a signboard, a shop receipt, a phone screen and a social media profile.',
      'Compare packages, delivery times and real reviews, then order directly. Payment stays in escrow until you accept the finished files.',
    ],
    deliverables: [
      'Primary logo plus alternate and icon versions',
      'Editable source files (AI, PSD, SVG) and web-ready PNG/JPG exports',
      'Colour and black-and-white variations',
      'Basic brand guidelines and font details',
    ],
    faqs: genericFaqs('Logo design'),
  },
  'video-editing': {
    headline: 'Hire a video editor',
    summary:
      'Freelance video editors for YouTube, TikTok, Reels, weddings and commercials — subtitles, colour, sound and motion graphics with escrow-protected payment.',
    intro: [
      'Raw footage becomes watchable when someone cuts it properly. FIVESOM video editors handle YouTube episodes, short-form TikTok and Reels content, wedding films and business commercials.',
      'Send your clips, agree the style, and receive a finished export ready to publish.',
    ],
    deliverables: [
      'Cutting, pacing and story structure',
      'Subtitles and captions in English or Somali',
      'Colour correction and sound cleanup',
      'Titles, lower thirds and simple motion graphics',
    ],
    faqs: genericFaqs('Video editing'),
  },
  'motion-graphics': {
    headline: 'Hire a motion graphics designer',
    summary:
      'Animated logos, intros, explainer videos and animated ads from freelance motion designers. Escrow-protected orders and clear delivery times.',
    intro: [
      'Motion makes a brand feel alive. Order an animated logo, an intro or outro for your channel, an explainer video or an animated advert for social media.',
      'Freelancers here work in After Effects, Blender and Lottie, and deliver files in the exact format your platform needs.',
    ],
    deliverables: [
      'Logo animation, intros and outros',
      'Explainer and product videos',
      'Animated social media ads',
      'Typography, character and UI animation, including Lottie files',
    ],
    faqs: genericFaqs('Motion graphics'),
  },
  'web-design': {
    headline: 'Hire a web designer',
    summary:
      'Freelance web designers for landing pages, business websites, portfolios, blogs and online shops — responsive layouts designed to convert.',
    intro: [
      'A well-designed page turns visitors into customers. FIVESOM web designers plan the layout, the wording placement and the visual style for landing pages, business sites, portfolios and online shops.',
      'You receive designs that look right on phones as well as desktops, ready for a developer to build.',
    ],
    deliverables: [
      'Landing page and multi-page website designs',
      'E-commerce and product page layouts',
      'Portfolio and blog designs',
      'Mobile and desktop versions with a reusable style system',
    ],
    faqs: genericFaqs('Web design'),
  },
  'content-writing': {
    headline: 'Hire a content writer',
    summary:
      'Blog articles, website copy, product descriptions, translation and book writing from freelance writers. Ordered and paid safely through escrow.',
    intro: [
      'Good writing sells before anyone speaks to you. FIVESOM writers produce blog articles structured for search engines, website copy, product descriptions, social captions, translations and full books.',
      'Book writing includes kids books, story books, eBooks, Islamic and religious titles, poetry, plus editing and proofreading.',
    ],
    deliverables: [
      'SEO blog posts and website copy',
      'Product descriptions and social media captions',
      'English, Somali and Arabic translation',
      'Book, eBook and kids book writing, editing and proofreading',
    ],
    faqs: genericFaqs('Content writing'),
  },
  'app-ui-design': {
    headline: 'Hire an app UI/UX designer',
    summary:
      'App UI and UX design from freelance designers — mobile app screens, dashboards, wireframes and clickable prototypes ready for development.',
    intro: [
      'Before an app is built, someone has to decide how it feels to use. FIVESOM UI/UX designers create wireframes, full screen designs, dashboards and clickable prototypes.',
      'You get a design file a developer can build from without guessing.',
    ],
    deliverables: [
      'Mobile app and web app screens',
      'Dashboard and admin panel design',
      'Wireframes and user flows',
      'Clickable prototypes and a reusable design system',
    ],
    faqs: genericFaqs('App UI design'),
  },
  'graphic-design': {
    headline: 'Hire a graphic designer',
    summary:
      'Flyers, posters, banners, business cards, menus, packaging, book covers and social media graphics from verified freelance graphic designers.',
    intro: [
      'From a restaurant menu to a product package, graphic design carries your message in print and on screen. FIVESOM designers cover flyers, posters, banners, business cards, brochures, invitations, T-shirts, book covers, infographics and photo editing.',
      'Order a single piece or a full branding kit that keeps every channel consistent.',
    ],
    deliverables: [
      'Flyers, posters, banners and brochures',
      'Business cards, menus and invitations',
      'Social media graphics and thumbnails',
      'Packaging, T-shirt art, book covers and branding kits',
    ],
    faqs: genericFaqs('Graphic design'),
  },
  'app-development': {
    headline: 'Hire an app developer',
    summary:
      'Android, iOS and cross-platform app development from freelance developers — Flutter, React Native, maintenance, bug fixing and store publishing.',
    intro: [
      'Turn an idea into an app people can install. FIVESOM developers build Android and iOS apps natively or with Flutter and React Native, from a first prototype to a store-ready release.',
      'You can also hire someone just to fix bugs, add a feature or publish an existing app.',
    ],
    deliverables: [
      'Android and iOS app development',
      'Cross-platform apps with Flutter or React Native',
      'Maintenance, updates and bug fixing',
      'App Store and Google Play publishing',
    ],
    faqs: genericFaqs('App development'),
  },
  'web-development': {
    headline: 'Hire a web developer',
    summary:
      'Freelance web developers for landing pages, business sites, e-commerce, WordPress, web apps, APIs and website bug fixing.',
    intro: [
      'Hire a developer to build the site or the system behind it. FIVESOM covers landing pages, business websites, online shops, WordPress builds, web applications, APIs and backends.',
      'Already have a site? Order a bug fix, a speed improvement or a new feature.',
    ],
    deliverables: [
      'Landing page and business website development',
      'E-commerce stores and WordPress builds',
      'Web applications, dashboards and admin panels',
      'API and backend work, bug fixing and speed improvements',
    ],
    faqs: genericFaqs('Web development'),
  },
};

export const getCategoryContent = (slug?: string | null): CategoryContent | undefined =>
  slug ? CATEGORY_CONTENT[slug] : undefined;
