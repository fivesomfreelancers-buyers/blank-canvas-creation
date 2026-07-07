import { LangCode } from '@/lib/i18n/LanguageContext';

type ListSection = { id: string; title: string; intro?: string; items: string[] };
type TextSection = { id: string; title: string; body: string };

export interface TermsCopy {
  badge: string;
  title: string;
  subtitle: string;
  updatedLabel: string;
  toc: string;
  tocItems: { id: string; label: string }[];
  purpose: TextSection;
  eligibility: ListSection;
  buyerRights: ListSection;
  freelancerRights: ListSection;
  buyerDuties: ListSection;
  freelancerDuties: ListSection;
  payments: TextSection;
  refunds: ListSection;
  orders: TextSection;
  delivery: TextSection;
  reviews: TextSection;
  disputes: TextSection;
  suspension: TextSection;
  termination: TextSection;
  copyright: TextSection;
  ip: TextSection;
  prohibited: { title: string; intro: string; items: string[] };
  community: TextSection;
  fraud: TextSection;
  spam: TextSection;
  fake: TextSection;
  verification: TextSection;
  vip: TextSection;
  verified: TextSection;
  affiliate: TextSection;
  security: TextSection;
  abuse: TextSection;
  changes: TextSection;
  contact: { title: string; body: string; supportLink: string; privacyLink: string };
  consequencesTitle: string;
  consequences: { label: string; desc: string }[];
}

const PROHIBITED_KEYS = [
  'Nude images', 'Nude videos', 'Pornography', 'Nudity', 'Sexual content',
  'Prostitution', 'Harassment', 'Hate Speech', 'Racism', 'Bullying',
  'Threats', 'Blackmail', 'Scam', 'Fraud', 'Money Laundering',
  'Fake Reviews', 'Fake Orders', 'Fake Accounts', 'Copyright Violations',
  'Pirated Files', 'Malware', 'Viruses', 'Spam', 'Bot Activity',
  'Illegal Services', 'Illegal Products', 'Drug Sales', 'Weapons Sales',
  'Terrorism', 'Child Exploitation', 'Gambling', 'Human Trafficking',
  'Identity Theft', 'Impersonation',
];

export const termsCopy: Record<LangCode, TermsCopy> = {
  en: {
    badge: 'LEGAL DOCUMENT',
    title: 'Terms of Service',
    subtitle: 'The official rules governing use of the Fivesom platform. Please read carefully before using our service.',
    updatedLabel: 'Last updated',
    toc: 'Table of Contents',
    tocItems: [
      { id: 'purpose', label: '1. Purpose of Fivesom' },
      { id: 'eligibility', label: '2. Eligibility' },
      { id: 'buyer-rights', label: '3. Buyer Rights' },
      { id: 'freelancer-rights', label: '4. Freelancer Rights' },
      { id: 'buyer-duties', label: '5. Buyer Duties' },
      { id: 'freelancer-duties', label: '6. Freelancer Duties' },
      { id: 'payments', label: '7. Payment Rules' },
      { id: 'refunds', label: '8. Refund Policy' },
      { id: 'orders', label: '9. Order Rules' },
      { id: 'delivery', label: '10. Delivery Rules' },
      { id: 'reviews', label: '11. Review Policy' },
      { id: 'disputes', label: '12. Dispute Resolution' },
      { id: 'suspension', label: '13. Account Suspension' },
      { id: 'termination', label: '14. Account Termination' },
      { id: 'copyright', label: '15. Copyright Policy' },
      { id: 'ip', label: '16. Intellectual Property' },
      { id: 'prohibited', label: '17. Prohibited Activities' },
      { id: 'community', label: '18. Community Guidelines' },
      { id: 'fraud', label: '19. Fraud Prevention' },
      { id: 'spam', label: '20. Spam Policy' },
      { id: 'fake', label: '21. Fake & Multiple Accounts' },
      { id: 'verification', label: '22. Identity Verification' },
      { id: 'vip', label: '23. VIP Membership Terms' },
      { id: 'verified', label: '24. Verified Seller Terms' },
      { id: 'affiliate', label: '25. Affiliate & Advertising' },
      { id: 'security', label: '26. Security Policy' },
      { id: 'abuse', label: '27. Abuse Reporting' },
      { id: 'changes', label: '28. Changes to Terms' },
      { id: 'contact', label: '29. Contact Information' },
    ],
    purpose: {
      id: 'purpose', title: '1. Purpose of Fivesom',
      body: 'Fivesom is a Somali freelance marketplace connecting Buyers and Freelancers to buy and sell digital services such as design, development, video editing, content writing and more. Our mission is to give Somali professionals a formal platform where they safely earn their income through an escrow-based payment system.',
    },
    eligibility: {
      id: 'eligibility', title: '2. Eligibility to Use the Website',
      items: [
        'You must be at least 18 years old.',
        'You must provide accurate and legitimate information.',
        'You must not create multiple accounts.',
        'You must comply with the laws of your country and international law.',
      ],
    },
    buyerRights: {
      id: 'buyer-rights', title: '3. Buyer Rights',
      items: [
        'To receive a delivery matching what was promised in the gig.',
        'To request a revision if the work does not meet the requirements.',
        'To open a dispute if the freelancer fails to deliver.',
        'To receive a refund when the case is approved.',
        'To use a safe, monitored chat.',
      ],
    },
    freelancerRights: {
      id: 'freelancer-rights', title: '4. Freelancer Rights',
      items: [
        'To receive payment once the delivery is accepted (Available Balance).',
        'To defend their work when a dispute is opened.',
        'To decline work outside their skill set.',
        'To receive fair and accurate reviews.',
        'To apply for Verified or VIP status.',
      ],
    },
    buyerDuties: {
      id: 'buyer-duties', title: '5. Buyer Duties',
      items: [
        'Pay for the order before work begins.',
        'Provide clear and complete requirements.',
        'Respond to the freelancer within a reasonable time.',
        'Accept the delivery when it meets the requirements.',
        'Avoid false complaints.',
      ],
    },
    freelancerDuties: {
      id: 'freelancer-duties', title: '6. Freelancer Duties',
      items: [
        'Deliver quality work matching the gig.',
        'Respect the agreed deadline.',
        'Use respectful language.',
        'Do not deliver stolen or copyrighted work.',
        'Maintain professional communication.',
      ],
    },
    payments: {
      id: 'payments', title: '7. Payment Rules',
      body: 'All payments go through an escrow system. Buyer funds are held until the freelancer completes the work and the buyer accepts it. When the freelancer withdraws their earnings, Fivesom charges a 15% commission and the remaining 85% is paid out to the freelancer. Withdrawals are only possible from Available Balance — not Total Earned.',
    },
    refunds: {
      id: 'refunds', title: '8. Refund Policy',
      items: [
        'Refunds are issued if the freelancer fails to deliver.',
        'Refunds are issued if the delivery differs significantly from what was promised.',
        'No refund is issued if the buyer simply changes their mind after delivery.',
        'All refunds are decided by the admin dispute team.',
      ],
    },
    orders: {
      id: 'orders', title: '9. Order Rules',
      body: 'Every order follows: Requirements → In Progress → Delivered → Accepted/Revision/Disputed. Orders cannot be cancelled after the freelancer starts working, except through the dispute process.',
    },
    delivery: {
      id: 'delivery', title: '10. Delivery Rules',
      body: 'The freelancer must submit a delivery containing all agreed files, description, and materials. Deliveries are auto-accepted after 3 days if the buyer takes no action, and funds move to the freelancer\'s Available Balance.',
    },
    reviews: {
      id: 'reviews', title: '11. Review Policy',
      body: 'Reviews must be honest and fair. Fake reviews, paid reviews, or reviews unrelated to the work are prohibited and will be removed.',
    },
    disputes: {
      id: 'disputes', title: '12. Dispute Resolution',
      body: 'When the two parties disagree, the admin team mediates by reviewing chat history, delivery files, and the original requirements. The admin decision is final.',
    },
    suspension: {
      id: 'suspension', title: '13. Account Suspension',
      body: 'Accounts may be temporarily suspended for rule violations. Duration ranges from 24 hours to 30 days depending on severity.',
    },
    termination: {
      id: 'termination', title: '14. Account Termination',
      body: 'Fivesom reserves the right to permanently close any account that violates the rules, especially in cases of fraud, deception, or prohibited activity.',
    },
    copyright: {
      id: 'copyright', title: '15. Copyright Policy',
      body: 'Selling or delivering copyrighted work you do not own is not allowed. DMCA takedown requests are actioned within 48 hours.',
    },
    ip: {
      id: 'ip', title: '16. Intellectual Property',
      body: 'Delivered work belongs to the buyer once payment completes, unless the freelancer explicitly states another agreement.',
    },
    prohibited: {
      title: '17. Prohibited Activities',
      intro: 'Fivesom strictly bans all of the following. Involvement results in a permanent ban:',
      items: PROHIBITED_KEYS,
    },
    community: {
      id: 'community', title: '18. Community Guidelines',
      body: 'Use respectful language. Respect all users regardless of religion, ethnicity, gender, or language. The chat has automatic moderation that detects harmful content.',
    },
    fraud: {
      id: 'fraud', title: '19. Fraud Prevention',
      body: 'Any fraud — fake orders, chargeback abuse, payment fraud, or phishing — results in a permanent ban and, where necessary, referral to law enforcement.',
    },
    spam: {
      id: 'spam', title: '20. Spam Policy',
      body: 'Sending repeated messages, bulk messages, or contacting buyers outside Fivesom to avoid fees is prohibited.',
    },
    fake: {
      id: 'fake', title: '21. Fake & Multiple Accounts',
      body: 'Each person may have only one account. Fake accounts, impersonation, or creating multiple accounts to bypass a ban are prohibited.',
    },
    verification: {
      id: 'verification', title: '22. Identity Verification',
      body: 'Fivesom may request an ID for identity verification. Identity data is stored encrypted and never shared with third parties.',
    },
    vip: {
      id: 'vip', title: '23. VIP Membership Terms',
      body: 'VIP is a monthly subscription providing extra features like priority support, badges, and higher visibility. VIP payments are not refunded once the month begins.',
    },
    verified: {
      id: 'verified', title: '24. Verified Seller (Blue Tick) Terms',
      body: 'The Blue Tick is granted to freelancers with verified identity, quality work, and a positive track record. It can be revoked for violations.',
    },
    affiliate: {
      id: 'affiliate', title: '25. Affiliate & Advertising Rules',
      body: 'Gig promotions must be truthful and cannot use fake images or promises that cannot be fulfilled.',
    },
    security: {
      id: 'security', title: '26. Security Policy',
      body: 'Passwords are hashed. Chats are protected by RLS security. Never share your password with anyone.',
    },
    abuse: {
      id: 'abuse', title: '27. Abuse Reporting',
      body: 'Use the Report button to report harmful content, rule-breaking users, or fraud. Reports are reviewed within 24 hours.',
    },
    changes: {
      id: 'changes', title: '28. Changes to Terms',
      body: 'Fivesom reserves the right to change these terms at any time. Major changes are communicated by email or in-app notification.',
    },
    contact: {
      title: '29. Contact Information',
      body: 'For questions about these terms, please reach out through',
      supportLink: 'Contact Support',
      privacyLink: 'Privacy Policy',
    },
    consequencesTitle: 'What happens when rules are broken',
    consequences: [
      { label: 'Warning', desc: 'A formal warning is issued to the user.' },
      { label: 'Content Removal', desc: 'Content violating the rules is deleted.' },
      { label: 'Temporary Suspension', desc: 'The account is suspended for a limited period.' },
      { label: 'Permanent Ban', desc: 'The user is permanently removed from Fivesom.' },
      { label: 'Account Closure', desc: 'The account is fully closed; remaining lawful funds are released.' },
    ],
  },
  so: {
    badge: 'LEGAL DOCUMENT',
    title: 'Terms of Service',
    subtitle: 'Cinwaannada shuruudaha rasmiga ah ee xakameynaya isticmaalka madasha Fivesom. Fadlan si taxaddar leh u akhri kahor intaadan adeegsan adeegga.',
    updatedLabel: 'Waxaa la cusboonaysiiyay',
    toc: 'Tusmada Qaybaha',
    tocItems: [
      { id: 'purpose', label: '1. Ujeeddada Fivesom' },
      { id: 'eligibility', label: '2. Shuruudaha Isticmaalka' },
      { id: 'buyer-rights', label: '3. Xuquuqda Buyer' },
      { id: 'freelancer-rights', label: '4. Xuquuqda Freelancer' },
      { id: 'buyer-duties', label: '5. Waajibaadka Buyer' },
      { id: 'freelancer-duties', label: '6. Waajibaadka Freelancer' },
      { id: 'payments', label: '7. Xeerarka Payments' },
      { id: 'refunds', label: '8. Refund Policy' },
      { id: 'orders', label: '9. Order Rules' },
      { id: 'delivery', label: '10. Delivery Rules' },
      { id: 'reviews', label: '11. Review Policy' },
      { id: 'disputes', label: '12. Dispute Resolution' },
      { id: 'suspension', label: '13. Account Suspension' },
      { id: 'termination', label: '14. Account Termination' },
      { id: 'copyright', label: '15. Copyright Policy' },
      { id: 'ip', label: '16. Intellectual Property' },
      { id: 'prohibited', label: '17. Prohibited Activities' },
      { id: 'community', label: '18. Community Guidelines' },
      { id: 'fraud', label: '19. Fraud Prevention' },
      { id: 'spam', label: '20. Spam Policy' },
      { id: 'fake', label: '21. Fake & Multiple Accounts' },
      { id: 'verification', label: '22. Identity Verification' },
      { id: 'vip', label: '23. VIP Membership Terms' },
      { id: 'verified', label: '24. Verified Seller Terms' },
      { id: 'affiliate', label: '25. Affiliate & Advertising' },
      { id: 'security', label: '26. Security Policy' },
      { id: 'abuse', label: '27. Abuse Reporting' },
      { id: 'changes', label: '28. Changes to Terms' },
      { id: 'contact', label: '29. Contact Information' },
    ],
    purpose: {
      id: 'purpose', title: '1. Ujeeddada Fivesom',
      body: 'Fivesom waa marketplace freelance-ka Somaliyeed ee isku xira Buyers iyo Freelancers si loo iibiyo oo loo iibsado adeegyo digital ah sida design, development, video editing, content writing iyo kuwo kale. Ujeeddadeenu waa in aan siino xirfadleyda Soomaaliyeed madasha rasmiga ah ee ay ku helaan mushaharkooda si ammaan ah iyadoo la adeegsanayo escrow-based payment system.',
    },
    eligibility: {
      id: 'eligibility', title: '2. Shuruudaha Isticmaalka Website-ka',
      items: [
        'Waa inaad ka weyn tahay 18 sano.',
        'Waa inaad bixisaa macluumaad sax ah oo rasmi ah.',
        'Waa in aadan sameyn wax badan oo accounts ah (multiple accounts).',
        'Waa inaad raacdaa dhammaan sharciyada dalkaaga iyo kuwa caalamiga ah.',
      ],
    },
    buyerRights: {
      id: 'buyer-rights', title: '3. Xuquuqda Buyer',
      items: [
        'Inuu helo delivery sax ah oo la mid ah waxa lagu ballan qaaday gigga.',
        'Inuu codsado revision haddii shaqadu aysan buuxin shuruudaha.',
        'Inuu furo dispute haddii uu freelancer-ku fashilmo.',
        'Inuu helo refund marka xaalada la ansixiyo.',
        'Inuu galo chat ammaan ah oo la fiirsan karo.',
      ],
    },
    freelancerRights: {
      id: 'freelancer-rights', title: '4. Xuquuqda Freelancer',
      items: [
        'Inuu helo lacagtiisa marka delivery-ga la ansixiyo (Available Balance).',
        'Inuu difaaco shaqadiisa marka dispute la furo.',
        'Inuu diido shaqooyin ka baxsan xirfadiisa.',
        'Inuu helo review sax ah oo cadaalad ah.',
        'Inuu codsado Verified ama VIP status.',
      ],
    },
    buyerDuties: {
      id: 'buyer-duties', title: '5. Waajibaadka Buyer',
      items: [
        'Bixinta lacagta ka hor inta aan shaqada la bilaabin.',
        'Bixinta requirements cad oo dhamaystiran.',
        'Ka jawaabista fariimaha freelancer-ka waqti macquul ah.',
        'Ansixinta delivery-ga marka ay buuxsanto shuruudaha.',
        'Ka fogaanshaha cabashooyin been abuur ah.',
      ],
    },
    freelancerDuties: {
      id: 'freelancer-duties', title: '6. Waajibaadka Freelancer',
      items: [
        'Gudbinta shaqo tayo leh oo waafaqsan gigga.',
        'Ixtiraamka waqtiga (deadline) la ballan qaaday.',
        'Isticmaalka luuqad xushmad leh.',
        'Yeynan gudbin shaqo la xaday ama copyright leh.',
        'Sameynta communication professional ah.',
      ],
    },
    payments: {
      id: 'payments', title: '7. Xeerarka Payments',
      body: 'Dhammaan payments waxay maraan escrow system. Lacagta buyer-ka ayaa la qabtaa ilaa uu freelancer-ku dhamaystiro shaqada oo buyer-ku ansixiyo. Fivesom waxay qaadataa boqolley yar (service fee) oo intiisa kale la siiyo freelancer-ka Available Balance-kiisa. Withdraw kaliya wuxuu ka shaqeeyaa Available Balance oo aan ahayn Total Earned.',
    },
    refunds: {
      id: 'refunds', title: '8. Refund Policy',
      items: [
        'Refund waxaa la bixiyaa haddii freelancer-ku uusan gudbin shaqada.',
        'Refund waxaa la bixiyaa haddii shaqadu si weyn uga duwan tahay tii la ballan qaaday.',
        'Refund lama bixiyo marka buyer-ku beddelo fikirkiisa kadib delivery.',
        'Dhammaan refund waxaa go\'aamiya admin dispute team.',
      ],
    },
    orders: {
      id: 'orders', title: '9. Order Rules',
      body: 'Order kasta wuxuu maraa: Requirements → In Progress → Delivered → Accepted/Revision/Disputed. Order lama cancel karo kadib marka freelancer-ku bilaabo shaqada iyada oo aan la marin dispute.',
    },
    delivery: {
      id: 'delivery', title: '10. Delivery Rules',
      body: 'Freelancer-ku waa inuu gudbiyaa delivery kaas oo ay ku jiraan files-ka, sharraxaad, iyo wax kasta oo lagu heshiiyay. Delivery waxaa la ansixiyaa 3 maalmood gudahood haddii uusan buyer-ku dhaqaajin, waxayna otomaatig u tagtaa Available Balance-ka freelancer-ka.',
    },
    reviews: {
      id: 'reviews', title: '11. Review Policy',
      body: 'Reviews waa inay noqdaan run iyo cadaalad ah. Fake reviews, reviews la iibsaday, ama reviews aan xiriir la lahayn shaqada waa mamnuuc waana la tirtirayaa.',
    },
    disputes: {
      id: 'disputes', title: '12. Dispute Resolution',
      body: 'Marka labada dhinac isku khilaafaan, admin team-ka ayaa dhexdhexaadin doona iyada oo la tixgelinayo chat history, delivery files, iyo requirements-ka asalka ah. Go\'aanka admin-ka waa final.',
    },
    suspension: {
      id: 'suspension', title: '13. Account Suspension',
      body: 'Account-ka waa la xayiri karaa muddo gaaban haddii user-ku jebiyo xeerar. Muddadu waxay noqon kartaa 24 saac ilaa 30 maalmood iyadoo la tixgelinayo darnaanta xaalada.',
    },
    termination: {
      id: 'termination', title: '14. Account Termination',
      body: 'Fivesom waxay xaq u leedahay inay xirto account kasta oo jebiya xeerarka si joogto ah, gaar ahaan kuwa ku lug leh khiyaano, khiyaamada, ama waxyaabaha mamnuuca ah.',
    },
    copyright: {
      id: 'copyright', title: '15. Copyright Policy',
      body: 'Ma oggola in la iibiyo ama la gudbiyo shaqo copyright leh oo aan qofka lahayn. DMCA takedown requests waa la fulinayaa 48 saac gudahood.',
    },
    ip: {
      id: 'ip', title: '16. Intellectual Property',
      body: 'Shaqada la gudbiyo waxaa iska leh buyer-ka marka payment la dhameystiro, ilaa haddii uu freelancer-ku si cad ugu qoro heshiis kale.',
    },
    prohibited: {
      title: '17. Waxyaabaha Mamnuuca ah',
      intro: 'Fivesom si adag u mamnuucday dhammaan waxyaabahan hoos ku qoran. Ku lug lahaanshaha wuxuu keeni doonaa xayiraad joogto ah:',
      items: PROHIBITED_KEYS,
    },
    community: {
      id: 'community', title: '18. Community Guidelines',
      body: 'Isticmaal luuqad xushmad leh. Ixtiraam dhammaan users-ka iyadoon loo eegin diinta, qowmiyada, jinsiga, ama luuqada. Chat-ka wuxuu leeyahay automatic moderation oo lagu ogaanayo waxyaabaha xun.',
    },
    fraud: {
      id: 'fraud', title: '19. Fraud Prevention',
      body: 'Wax kasta oo khiyaamo ah — fake orders, chargeback abuse, payment fraud, ama phishing — waxay keenaysaa xayiraad joogto ah iyo, marka loo baahdo, gudbinta hay\'adaha sharciga.',
    },
    spam: {
      id: 'spam', title: '20. Spam Policy',
      body: 'Diridda fariimaha soo noqnoqda, bulk messages, ama xiriirinta buyers dibedda Fivesom si looga fogaado fees-ka waa mamnuuc.',
    },
    fake: {
      id: 'fake', title: '21. Fake Accounts & Multiple Accounts',
      body: 'Qof waliba wuxuu leeyahay hal account keliya. Fake accounts, impersonation, ama sameynta accounts badan si loogu daboolo xayiraad waa mamnuuc.',
    },
    verification: {
      id: 'verification', title: '22. Identity Verification',
      body: 'Fivesom waxay codsan kartaa aqoonsi (ID) si loo xaqiijiyo aqoonsiga. Xogta aqoonsigu waa la ilaaliyaa iyadoo la adeegsanayo encryption, kuma qeyb galno cid saddexaad.',
    },
    vip: {
      id: 'vip', title: '23. VIP Membership Terms',
      body: 'VIP membership waa lacag-bixin bille ah oo bixisa waxyaabo dheeraad ah sida priority support, badges, iyo visibility sare. Lama refund gareeyo lacagta VIP marka bishu bilaabanto.',
    },
    verified: {
      id: 'verified', title: '24. Verified Seller (Blue Tick) Terms',
      body: 'Blue Tick waxaa la siiyaa freelancers-ka la xaqiijiyay aqoonsigooda, tayada shaqadooda iyo taariikhda cadaalada leh. Waa la qaadi karaa haddii xeerar la jebiyo.',
    },
    affiliate: {
      id: 'affiliate', title: '25. Affiliate & Advertising Rules',
      body: 'Xayaysiiska hore ee gigyada waa in ay run tahay lamana isticmaali karo sawirro been abuur ah ama ballan qaadyo aan la fulin karin.',
    },
    security: {
      id: 'security', title: '26. Security Policy',
      body: 'Passwords-ka waa la hash-gareeyay. Chats-ka waxaa lagu ilaaliyaa RLS security. Ha la wadaagin cid password-kaaga.',
    },
    abuse: {
      id: 'abuse', title: '27. Abuse Reporting',
      body: 'Isticmaal Report button-ka si aad noogu soo sheegto content xun, users-ka jebiya xeerar, ama khiyaano. Warbixinnada waxaa la eegayaa 24 saac gudahood.',
    },
    changes: {
      id: 'changes', title: '28. Changes to Terms',
      body: 'Fivesom waxay xaq u leedahay inay wax ka beddesho xeerarkan waqti kasta. Isbeddellada waaweyn waxaa lagu wargeliyaa users-ka email ama in-app notification.',
    },
    contact: {
      title: '29. Contact Information',
      body: 'Wixii su\'aalo ah ee ku saabsan xeerarkan, fadlan nala soo xiriir iyada oo loo marayo',
      supportLink: 'Contact Support',
      privacyLink: 'Privacy Policy',
    },
    consequencesTitle: 'Waxa Dhaca Marka Xeerar La Jebiyo',
    consequences: [
      { label: 'Warning', desc: 'Digniin rasmi ah oo lagu wargeliyo user-ka.' },
      { label: 'Content Removal', desc: 'Content-ka jebiya xeerarka waa la tirtiraa.' },
      { label: 'Temporary Suspension', desc: 'Account-ka waxaa lagu xayiraa muddo gaaban.' },
      { label: 'Permanent Ban', desc: 'Isticmaale wali laga saarayo Fivesom si joogto ah.' },
      { label: 'Account Closure', desc: 'Xisaabta si buuxda ayaa loo xirayaa, lacagihii hadhayna waa la sii deynayaa haddii ay xalaal yihiin.' },
    ],
  },
  fr: {
    badge: 'DOCUMENT LÉGAL',
    title: 'Conditions d\'utilisation',
    subtitle: 'Les règles officielles régissant l\'utilisation de la plateforme Fivesom. Veuillez les lire attentivement avant d\'utiliser notre service.',
    updatedLabel: 'Dernière mise à jour',
    toc: 'Table des matières',
    tocItems: [
      { id: 'purpose', label: '1. Objectif de Fivesom' },
      { id: 'eligibility', label: '2. Éligibilité' },
      { id: 'buyer-rights', label: '3. Droits de l\'acheteur' },
      { id: 'freelancer-rights', label: '4. Droits du freelance' },
      { id: 'buyer-duties', label: '5. Devoirs de l\'acheteur' },
      { id: 'freelancer-duties', label: '6. Devoirs du freelance' },
      { id: 'payments', label: '7. Règles de paiement' },
      { id: 'refunds', label: '8. Politique de remboursement' },
      { id: 'orders', label: '9. Règles de commande' },
      { id: 'delivery', label: '10. Règles de livraison' },
      { id: 'reviews', label: '11. Politique d\'avis' },
      { id: 'disputes', label: '12. Résolution des litiges' },
      { id: 'suspension', label: '13. Suspension de compte' },
      { id: 'termination', label: '14. Résiliation de compte' },
      { id: 'copyright', label: '15. Droits d\'auteur' },
      { id: 'ip', label: '16. Propriété intellectuelle' },
      { id: 'prohibited', label: '17. Activités interdites' },
      { id: 'community', label: '18. Règles de la communauté' },
      { id: 'fraud', label: '19. Prévention de la fraude' },
      { id: 'spam', label: '20. Politique anti-spam' },
      { id: 'fake', label: '21. Faux comptes' },
      { id: 'verification', label: '22. Vérification d\'identité' },
      { id: 'vip', label: '23. Conditions VIP' },
      { id: 'verified', label: '24. Vendeur vérifié' },
      { id: 'affiliate', label: '25. Affiliation & Publicité' },
      { id: 'security', label: '26. Politique de sécurité' },
      { id: 'abuse', label: '27. Signalement d\'abus' },
      { id: 'changes', label: '28. Modifications' },
      { id: 'contact', label: '29. Contact' },
    ],
    purpose: {
      id: 'purpose', title: '1. Objectif de Fivesom',
      body: 'Fivesom est une place de marché freelance somalienne qui met en relation acheteurs et freelances pour acheter et vendre des services numériques : design, développement, montage vidéo, rédaction, etc. Notre mission est d\'offrir aux professionnels somaliens une plateforme officielle où ils gagnent leurs revenus en toute sécurité grâce à un système de paiement en séquestre.',
    },
    eligibility: {
      id: 'eligibility', title: '2. Conditions d\'utilisation du site',
      items: [
        'Vous devez avoir au moins 18 ans.',
        'Vous devez fournir des informations exactes et légitimes.',
        'Vous ne devez pas créer plusieurs comptes.',
        'Vous devez respecter les lois de votre pays et le droit international.',
      ],
    },
    buyerRights: {
      id: 'buyer-rights', title: '3. Droits de l\'acheteur',
      items: [
        'Recevoir une livraison conforme à ce qui a été promis dans le gig.',
        'Demander une révision si le travail ne correspond pas aux exigences.',
        'Ouvrir un litige si le freelance ne livre pas.',
        'Recevoir un remboursement lorsque le cas est approuvé.',
        'Utiliser un chat sûr et supervisé.',
      ],
    },
    freelancerRights: {
      id: 'freelancer-rights', title: '4. Droits du freelance',
      items: [
        'Recevoir le paiement une fois la livraison acceptée (Solde disponible).',
        'Défendre son travail lorsqu\'un litige est ouvert.',
        'Refuser un travail hors de son domaine.',
        'Recevoir des avis équitables et exacts.',
        'Postuler au statut Vérifié ou VIP.',
      ],
    },
    buyerDuties: {
      id: 'buyer-duties', title: '5. Devoirs de l\'acheteur',
      items: [
        'Payer la commande avant le début du travail.',
        'Fournir des exigences claires et complètes.',
        'Répondre au freelance dans un délai raisonnable.',
        'Accepter la livraison lorsqu\'elle correspond aux exigences.',
        'Éviter les fausses plaintes.',
      ],
    },
    freelancerDuties: {
      id: 'freelancer-duties', title: '6. Devoirs du freelance',
      items: [
        'Livrer un travail de qualité conforme au gig.',
        'Respecter le délai convenu.',
        'Utiliser un langage respectueux.',
        'Ne pas livrer de travail volé ou protégé par le droit d\'auteur.',
        'Maintenir une communication professionnelle.',
      ],
    },
    payments: {
      id: 'payments', title: '7. Règles de paiement',
      body: 'Tous les paiements passent par un système de séquestre. Les fonds de l\'acheteur sont retenus jusqu\'à ce que le freelance termine le travail et que l\'acheteur l\'accepte. Fivesom prélève une petite commission ; le reste est crédité sur le Solde disponible du freelance. Les retraits ne sont possibles que depuis le Solde disponible, pas depuis le Total gagné.',
    },
    refunds: {
      id: 'refunds', title: '8. Politique de remboursement',
      items: [
        'Un remboursement est émis si le freelance ne livre pas.',
        'Un remboursement est émis si la livraison diffère significativement de ce qui a été promis.',
        'Aucun remboursement n\'est émis si l\'acheteur change simplement d\'avis après la livraison.',
        'Tous les remboursements sont décidés par l\'équipe des litiges.',
      ],
    },
    orders: {
      id: 'orders', title: '9. Règles de commande',
      body: 'Chaque commande suit : Exigences → En cours → Livrée → Acceptée/Révision/Litige. Les commandes ne peuvent pas être annulées après le début du travail, sauf via le processus de litige.',
    },
    delivery: {
      id: 'delivery', title: '10. Règles de livraison',
      body: 'Le freelance doit soumettre une livraison contenant tous les fichiers convenus, une description et les éléments requis. Les livraisons sont automatiquement acceptées après 3 jours si l\'acheteur ne fait rien, et les fonds passent sur le Solde disponible.',
    },
    reviews: {
      id: 'reviews', title: '11. Politique d\'avis',
      body: 'Les avis doivent être honnêtes et équitables. Les faux avis, avis payés ou sans rapport avec le travail sont interdits et supprimés.',
    },
    disputes: {
      id: 'disputes', title: '12. Résolution des litiges',
      body: 'En cas de désaccord, l\'équipe admin arbitre en examinant l\'historique du chat, les fichiers de livraison et les exigences initiales. La décision de l\'admin est finale.',
    },
    suspension: {
      id: 'suspension', title: '13. Suspension de compte',
      body: 'Les comptes peuvent être temporairement suspendus pour infraction. La durée va de 24 heures à 30 jours selon la gravité.',
    },
    termination: {
      id: 'termination', title: '14. Résiliation de compte',
      body: 'Fivesom se réserve le droit de fermer définitivement tout compte qui enfreint les règles, notamment en cas de fraude ou d\'activité interdite.',
    },
    copyright: {
      id: 'copyright', title: '15. Politique de droits d\'auteur',
      body: 'Vendre ou livrer un travail protégé que vous ne possédez pas est interdit. Les demandes DMCA sont traitées sous 48 heures.',
    },
    ip: {
      id: 'ip', title: '16. Propriété intellectuelle',
      body: 'Le travail livré appartient à l\'acheteur une fois le paiement finalisé, sauf accord contraire explicite du freelance.',
    },
    prohibited: {
      title: '17. Activités interdites',
      intro: 'Fivesom interdit strictement tout ce qui suit. Toute implication entraîne un bannissement permanent :',
      items: PROHIBITED_KEYS,
    },
    community: {
      id: 'community', title: '18. Règles de la communauté',
      body: 'Utilisez un langage respectueux. Respectez tous les utilisateurs quelle que soit leur religion, ethnie, genre ou langue. Le chat dispose d\'une modération automatique.',
    },
    fraud: {
      id: 'fraud', title: '19. Prévention de la fraude',
      body: 'Toute fraude — fausses commandes, abus de rétrofacturation, fraude au paiement, phishing — entraîne un bannissement permanent et, si nécessaire, une saisine des autorités.',
    },
    spam: {
      id: 'spam', title: '20. Politique anti-spam',
      body: 'L\'envoi de messages répétés, de messages en masse ou le contact avec des acheteurs hors Fivesom pour éviter les frais est interdit.',
    },
    fake: {
      id: 'fake', title: '21. Faux comptes et comptes multiples',
      body: 'Chaque personne ne peut avoir qu\'un seul compte. Les faux comptes, l\'usurpation d\'identité ou la création de comptes multiples pour contourner un bannissement sont interdits.',
    },
    verification: {
      id: 'verification', title: '22. Vérification d\'identité',
      body: 'Fivesom peut demander une pièce d\'identité pour vérifier votre identité. Les données sont stockées chiffrées et jamais partagées avec des tiers.',
    },
    vip: {
      id: 'vip', title: '23. Conditions du membre VIP',
      body: 'Le VIP est un abonnement mensuel offrant des fonctionnalités supplémentaires : support prioritaire, badges, visibilité accrue. Les paiements VIP ne sont pas remboursés une fois le mois commencé.',
    },
    verified: {
      id: 'verified', title: '24. Conditions du vendeur vérifié (Blue Tick)',
      body: 'Le Blue Tick est accordé aux freelances ayant vérifié leur identité, avec un travail de qualité et un historique positif. Il peut être révoqué en cas d\'infraction.',
    },
    affiliate: {
      id: 'affiliate', title: '25. Règles d\'affiliation et de publicité',
      body: 'Les promotions de gigs doivent être véridiques et ne peuvent pas utiliser de fausses images ou de promesses irréalisables.',
    },
    security: {
      id: 'security', title: '26. Politique de sécurité',
      body: 'Les mots de passe sont hachés. Les chats sont protégés par RLS. Ne partagez jamais votre mot de passe.',
    },
    abuse: {
      id: 'abuse', title: '27. Signalement d\'abus',
      body: 'Utilisez le bouton Signaler pour rapporter tout contenu nuisible, utilisateurs enfreignant les règles ou fraude. Les rapports sont examinés sous 24 heures.',
    },
    changes: {
      id: 'changes', title: '28. Modifications des conditions',
      body: 'Fivesom se réserve le droit de modifier ces conditions à tout moment. Les modifications majeures sont communiquées par e-mail ou notification dans l\'app.',
    },
    contact: {
      title: '29. Coordonnées',
      body: 'Pour toute question sur ces conditions, veuillez nous contacter via',
      supportLink: 'Contacter le support',
      privacyLink: 'Politique de confidentialité',
    },
    consequencesTitle: 'Que se passe-t-il en cas d\'infraction',
    consequences: [
      { label: 'Avertissement', desc: 'Un avertissement formel est émis à l\'utilisateur.' },
      { label: 'Suppression de contenu', desc: 'Le contenu enfreignant les règles est supprimé.' },
      { label: 'Suspension temporaire', desc: 'Le compte est suspendu pour une durée limitée.' },
      { label: 'Bannissement permanent', desc: 'L\'utilisateur est définitivement retiré de Fivesom.' },
      { label: 'Clôture de compte', desc: 'Le compte est entièrement fermé ; les fonds légitimes restants sont restitués.' },
    ],
  },
  ar: {
    badge: 'وثيقة قانونية',
    title: 'شروط الخدمة',
    subtitle: 'القواعد الرسمية التي تحكم استخدام منصة Fivesom. يُرجى القراءة بعناية قبل استخدام الخدمة.',
    updatedLabel: 'آخر تحديث',
    toc: 'جدول المحتويات',
    tocItems: [
      { id: 'purpose', label: '1. الغرض من Fivesom' },
      { id: 'eligibility', label: '2. الأهلية' },
      { id: 'buyer-rights', label: '3. حقوق المشتري' },
      { id: 'freelancer-rights', label: '4. حقوق المستقل' },
      { id: 'buyer-duties', label: '5. واجبات المشتري' },
      { id: 'freelancer-duties', label: '6. واجبات المستقل' },
      { id: 'payments', label: '7. قواعد الدفع' },
      { id: 'refunds', label: '8. سياسة الاسترداد' },
      { id: 'orders', label: '9. قواعد الطلبات' },
      { id: 'delivery', label: '10. قواعد التسليم' },
      { id: 'reviews', label: '11. سياسة التقييمات' },
      { id: 'disputes', label: '12. حل النزاعات' },
      { id: 'suspension', label: '13. تعليق الحساب' },
      { id: 'termination', label: '14. إنهاء الحساب' },
      { id: 'copyright', label: '15. حقوق النشر' },
      { id: 'ip', label: '16. الملكية الفكرية' },
      { id: 'prohibited', label: '17. الأنشطة المحظورة' },
      { id: 'community', label: '18. إرشادات المجتمع' },
      { id: 'fraud', label: '19. منع الاحتيال' },
      { id: 'spam', label: '20. سياسة السبام' },
      { id: 'fake', label: '21. الحسابات المزيفة' },
      { id: 'verification', label: '22. التحقق من الهوية' },
      { id: 'vip', label: '23. شروط عضوية VIP' },
      { id: 'verified', label: '24. البائع الموثق' },
      { id: 'affiliate', label: '25. الإعلان والتسويق' },
      { id: 'security', label: '26. سياسة الأمان' },
      { id: 'abuse', label: '27. الإبلاغ عن الإساءة' },
      { id: 'changes', label: '28. التغييرات على الشروط' },
      { id: 'contact', label: '29. معلومات التواصل' },
    ],
    purpose: {
      id: 'purpose', title: '1. الغرض من Fivesom',
      body: 'Fivesom هي سوق صومالية للعمل الحر تربط المشترين بالمستقلين لبيع وشراء الخدمات الرقمية مثل التصميم والبرمجة وتحرير الفيديو وكتابة المحتوى وغيرها. مهمتنا هي منح المهنيين الصوماليين منصة رسمية يكسبون فيها دخلهم بأمان عبر نظام دفع ضامن.',
    },
    eligibility: {
      id: 'eligibility', title: '2. شروط استخدام الموقع',
      items: [
        'يجب أن تكون قد بلغت 18 عامًا على الأقل.',
        'يجب تقديم معلومات دقيقة ومشروعة.',
        'لا يجوز إنشاء حسابات متعددة.',
        'يجب الالتزام بقوانين بلدك والقانون الدولي.',
      ],
    },
    buyerRights: {
      id: 'buyer-rights', title: '3. حقوق المشتري',
      items: [
        'استلام تسليم مطابق لما وُعد به في الخدمة.',
        'طلب مراجعة إذا لم يستوفِ العمل المتطلبات.',
        'فتح نزاع إذا فشل المستقل في التسليم.',
        'استلام استرداد عند الموافقة على الحالة.',
        'استخدام محادثة آمنة ومراقبة.',
      ],
    },
    freelancerRights: {
      id: 'freelancer-rights', title: '4. حقوق المستقل',
      items: [
        'استلام الدفعة بعد قبول التسليم (الرصيد المتاح).',
        'الدفاع عن عمله عند فتح نزاع.',
        'رفض العمل خارج نطاق تخصصه.',
        'استلام تقييمات عادلة ودقيقة.',
        'التقدم لحالة موثق أو VIP.',
      ],
    },
    buyerDuties: {
      id: 'buyer-duties', title: '5. واجبات المشتري',
      items: [
        'دفع الطلب قبل بدء العمل.',
        'تقديم متطلبات واضحة وكاملة.',
        'الرد على المستقل خلال وقت معقول.',
        'قبول التسليم عند استيفائه للمتطلبات.',
        'تجنب الشكاوى الكاذبة.',
      ],
    },
    freelancerDuties: {
      id: 'freelancer-duties', title: '6. واجبات المستقل',
      items: [
        'تسليم عمل عالي الجودة يطابق الخدمة.',
        'احترام الموعد النهائي المتفق عليه.',
        'استخدام لغة محترمة.',
        'عدم تسليم عمل مسروق أو محمي بحقوق النشر.',
        'الحفاظ على تواصل احترافي.',
      ],
    },
    payments: {
      id: 'payments', title: '7. قواعد الدفع',
      body: 'تمر جميع المدفوعات عبر نظام ضامن. تُحتجز أموال المشتري حتى يُنجز المستقل العمل ويقبله المشتري. تأخذ Fivesom عمولة خدمة صغيرة ويُودع الباقي في الرصيد المتاح للمستقل. السحوبات ممكنة فقط من الرصيد المتاح، وليس من إجمالي الأرباح.',
    },
    refunds: {
      id: 'refunds', title: '8. سياسة الاسترداد',
      items: [
        'يُصدر الاسترداد إذا فشل المستقل في التسليم.',
        'يُصدر الاسترداد إذا اختلف التسليم بشكل كبير عمّا وُعد به.',
        'لا يُصدر استرداد إذا غيّر المشتري رأيه فقط بعد التسليم.',
        'يقرر فريق النزاعات جميع عمليات الاسترداد.',
      ],
    },
    orders: {
      id: 'orders', title: '9. قواعد الطلبات',
      body: 'يمر كل طلب بـ: المتطلبات → قيد التنفيذ → مُسلّم → مقبول/مراجعة/نزاع. لا يمكن إلغاء الطلبات بعد أن يبدأ المستقل العمل، إلا عبر عملية النزاع.',
    },
    delivery: {
      id: 'delivery', title: '10. قواعد التسليم',
      body: 'يجب على المستقل تقديم تسليم يحتوي على جميع الملفات المتفق عليها والوصف والمواد. تُقبل التسليمات تلقائيًا بعد 3 أيام إذا لم يتصرف المشتري، وتنتقل الأموال إلى الرصيد المتاح للمستقل.',
    },
    reviews: {
      id: 'reviews', title: '11. سياسة التقييمات',
      body: 'يجب أن تكون التقييمات صادقة وعادلة. التقييمات المزيفة أو المدفوعة أو غير المتعلقة بالعمل ممنوعة وستُحذف.',
    },
    disputes: {
      id: 'disputes', title: '12. حل النزاعات',
      body: 'عند اختلاف الطرفين، يتدخل فريق الإدارة عبر مراجعة سجل المحادثات وملفات التسليم والمتطلبات الأصلية. قرار الإدارة نهائي.',
    },
    suspension: {
      id: 'suspension', title: '13. تعليق الحساب',
      body: 'قد تُعلّق الحسابات مؤقتًا بسبب المخالفات. تتراوح المدة من 24 ساعة إلى 30 يومًا حسب الخطورة.',
    },
    termination: {
      id: 'termination', title: '14. إنهاء الحساب',
      body: 'تحتفظ Fivesom بالحق في إغلاق أي حساب ينتهك القواعد بشكل دائم، خاصة في حالات الاحتيال أو النشاط المحظور.',
    },
    copyright: {
      id: 'copyright', title: '15. سياسة حقوق النشر',
      body: 'لا يُسمح ببيع أو تسليم عمل محمي بحقوق النشر لا تملكه. تُنفّذ طلبات DMCA خلال 48 ساعة.',
    },
    ip: {
      id: 'ip', title: '16. الملكية الفكرية',
      body: 'يصبح العمل المُسلَّم ملكًا للمشتري بمجرد اكتمال الدفع، ما لم يُصرّح المستقل باتفاقية أخرى.',
    },
    prohibited: {
      title: '17. الأنشطة المحظورة',
      intro: 'تحظر Fivesom كل ما يلي بشكل صارم. يؤدي التورط إلى الحظر الدائم:',
      items: PROHIBITED_KEYS,
    },
    community: {
      id: 'community', title: '18. إرشادات المجتمع',
      body: 'استخدم لغة محترمة. احترم جميع المستخدمين بغض النظر عن الدين أو العرق أو الجنس أو اللغة. تحتوي المحادثة على إشراف تلقائي.',
    },
    fraud: {
      id: 'fraud', title: '19. منع الاحتيال',
      body: 'أي احتيال — طلبات مزيفة، إساءة استرداد الأموال، احتيال الدفع، التصيد — يؤدي إلى حظر دائم وإحالة للسلطات عند الضرورة.',
    },
    spam: {
      id: 'spam', title: '20. سياسة السبام',
      body: 'إرسال رسائل متكررة أو رسائل جماعية أو التواصل مع المشترين خارج Fivesom لتجنب الرسوم محظور.',
    },
    fake: {
      id: 'fake', title: '21. الحسابات المزيفة والمتعددة',
      body: 'لكل شخص حساب واحد فقط. الحسابات المزيفة أو انتحال الهوية أو إنشاء حسابات متعددة لتجاوز الحظر ممنوعة.',
    },
    verification: {
      id: 'verification', title: '22. التحقق من الهوية',
      body: 'قد تطلب Fivesom بطاقة هوية للتحقق. تُخزن بيانات الهوية مشفرة ولا تُشارك مع أطراف ثالثة.',
    },
    vip: {
      id: 'vip', title: '23. شروط عضوية VIP',
      body: 'VIP اشتراك شهري يوفر ميزات إضافية مثل الدعم ذي الأولوية والشارات والظهور الأعلى. لا تُسترد مدفوعات VIP بعد بدء الشهر.',
    },
    verified: {
      id: 'verified', title: '24. شروط البائع الموثق (Blue Tick)',
      body: 'تُمنح العلامة الزرقاء للمستقلين الذين تم التحقق من هويتهم وجودة عملهم وسجلهم الإيجابي. يمكن سحبها في حالة المخالفة.',
    },
    affiliate: {
      id: 'affiliate', title: '25. قواعد التسويق والإعلان',
      body: 'يجب أن تكون الترويجات صادقة ولا يجوز استخدام صور مزيفة أو وعود لا يمكن تحقيقها.',
    },
    security: {
      id: 'security', title: '26. سياسة الأمان',
      body: 'كلمات المرور مشفرة (Hashed). المحادثات محمية بأمان RLS. لا تشارك كلمة المرور مع أحد أبدًا.',
    },
    abuse: {
      id: 'abuse', title: '27. الإبلاغ عن الإساءة',
      body: 'استخدم زر الإبلاغ للإبلاغ عن المحتوى الضار أو المستخدمين المخالفين أو الاحتيال. تُراجَع البلاغات خلال 24 ساعة.',
    },
    changes: {
      id: 'changes', title: '28. التغييرات على الشروط',
      body: 'تحتفظ Fivesom بالحق في تغيير هذه الشروط في أي وقت. تُبلغ التغييرات الرئيسية عبر البريد الإلكتروني أو الإشعار داخل التطبيق.',
    },
    contact: {
      title: '29. معلومات التواصل',
      body: 'لأي أسئلة حول هذه الشروط، يُرجى التواصل معنا عبر',
      supportLink: 'اتصل بالدعم',
      privacyLink: 'سياسة الخصوصية',
    },
    consequencesTitle: 'ماذا يحدث عند انتهاك القواعد',
    consequences: [
      { label: 'تحذير', desc: 'يُصدر تحذير رسمي للمستخدم.' },
      { label: 'إزالة المحتوى', desc: 'يُحذف المحتوى المخالف للقواعد.' },
      { label: 'تعليق مؤقت', desc: 'يُعلّق الحساب لفترة محدودة.' },
      { label: 'حظر دائم', desc: 'يُزال المستخدم نهائيًا من Fivesom.' },
      { label: 'إغلاق الحساب', desc: 'يُغلق الحساب بالكامل، وتُفرج عن الأموال المشروعة المتبقية.' },
    ],
  },
};
