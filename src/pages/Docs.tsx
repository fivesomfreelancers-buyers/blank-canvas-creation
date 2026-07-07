import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Info, Workflow, UserPlus, IdCard, ShieldCheck, Briefcase, ShoppingCart,
  MessageSquare, Wallet, ListChecks, Star, Lock, Users, Scale, Trophy,
  BadgeCheck, LifeBuoy, HelpCircle, Globe, ArrowRight, Menu, X, CheckCircle2,
  Lightbulb
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Section illustrations — externally hosted (provided by product team)
const imgIntro = 'https://i.postimg.cc/Vknzq7BP/5f01f0f6-0e76-4d74-9fd2-ac233c98db20.png';
const imgHow = 'https://i.postimg.cc/Gt61YY4M/204834bf-2944-40fe-b91f-afe90d96dbe7.png';
const imgAccount = 'https://i.postimg.cc/Vknzq7BP/5f01f0f6-0e76-4d74-9fd2-ac233c98db20.png';
const imgProfile = 'https://i.postimg.cc/Hncqpx6y/ed0c0e61-3d22-4378-b0e8-3414ae132229.png';
const imgEscrow = 'https://i.postimg.cc/9QhQn5fG/b15e8b8e-153d-4e73-9600-e6e64441f789.png';
const imgGig = 'https://i.postimg.cc/RhtvgXxz/7af94512-11d8-4983-81d6-98062b182e0c.png';
const imgOrdering = 'https://i.postimg.cc/7Z9wt5dy/af9f3307-a7b0-42e6-b0ba-bedcdecc41a0.png';
const imgMessaging = 'https://i.postimg.cc/76FkJ0Gs/d52ffc3a-86a0-490d-8630-70c6abbfb022.png';
const imgPayment = 'https://i.postimg.cc/rwf2CvRT/da785612-fdaf-48dc-965e-f65d99595f0b.png';
const imgOrders = 'https://i.postimg.cc/sxYtB8Cq/0b6f1e23-26be-490c-ac27-969dd2df278e.png';
const imgReviews = 'https://i.postimg.cc/vZHpB3qJ/27117911-cd37-458a-9e64-8c23984f6ffe.png';
const imgSecurity = 'https://i.postimg.cc/cCSzNmtj/73d8a821-438d-418e-b917-80d527cc23db.png';
const imgCommunity = 'https://i.postimg.cc/gJ9SvDsc/7670fe7c-0f93-4bfa-84b3-9bb46b490cb8.png';
const imgDispute = 'https://i.postimg.cc/qvSjTL9X/8a66f60f-8be8-4e85-a7b8-893826311b55.png';
const imgLevels = 'https://i.postimg.cc/BZpp6srD/45985dc0-518d-4116-97f8-d43617873de8.png';
const imgTick = 'https://i.postimg.cc/BZpp6srD/45985dc0-518d-4116-97f8-d43617873de8.png';
const imgSupport = 'https://i.postimg.cc/C5xjDB31/815b9ecb-15c1-4440-adec-e473f3335032.png';
const imgFaq = 'https://i.postimg.cc/C5xjDB31/815b9ecb-15c1-4440-adec-e473f3335032.png';

type Lang = 'en' | 'so' | 'ar' | 'fr';

interface SectionContent {
  title: string;
  subtitle: string;
  description: string[]; // paragraphs
  steps: { title: string; body: string }[];
  bullets: string[];
  tip?: string;
  faqs?: { q: string; a: string }[];
}

interface Section {
  id: string;
  icon: React.ElementType;
  image: string;
  cta?: { label: Record<Lang, string>; to: string };
  t: Record<Lang, SectionContent>;
}

const SECTIONS: Section[] = [
  {
    id: 'intro', icon: Info, image: imgIntro, cta: { label: { en: 'Explore Services', so: 'Eeg Adeegyada', ar: 'تصفح الخدمات', fr: 'Explorer les services' }, to: '/explore' },
    t: {
      en: {
        title: '1. Introduction / About FIVESOM',
        subtitle: 'A trusted Somali freelance marketplace built for the modern digital economy.',
        description: [
          'FIVESOM is the first professional freelance marketplace built specifically for the Somali market. It connects skilled freelancers — designers, video editors, web developers, writers and more — with clients and businesses who need quality work delivered online, safely and on time.',
          'We built FIVESOM because young Somalis have world-class skills but lacked a local platform that understood their language, their payment methods, and the trust signals that matter in this market. International platforms often block Somali users, hold payouts, or charge unaffordable fees. FIVESOM removes those barriers.',
          'For freelancers, FIVESOM is a way to turn skills into real income — paid in trusted local methods, with a public profile that builds reputation order after order. For clients and businesses, it is a fast, affordable way to hire vetted talent without leaving the country.',
        ],
        steps: [
          { title: 'For freelancers', body: 'Create a profile, list your services as gigs, and start earning from real clients.' },
          { title: 'For buyers', body: 'Search any service, message the freelancer, and pay safely through our escrow system.' },
          { title: 'For businesses', body: 'Hire designers, video editors, developers and writers on demand — without long-term contracts.' },
        ],
        bullets: [
          'Built for the Somali market — local language, local payments, local support.',
          'Lower fees than international platforms.',
          'Escrow protects every order from start to finish.',
          'Verified freelancers with real portfolios and reviews.',
        ],
        tip: 'New here? Start by exploring services to see what freelancers can do for you.',
      },
      so: {
        title: '1. Hordhac / Ku saabsan FIVESOM',
        subtitle: 'Madasha ugu horeysa ee freelancing ah oo loogu talagalay suuqa Soomaalida.',
        description: [
          'FIVESOM waa madasha ugu horeysa ee xirfadeed ee freelance marketplace ah oo si gaar ah loogu sameeyay suuqa Soomaalida. Waxay isku xirtaa freelancers xirfad leh — designers, video editors, web developers, qoraayaal iyo kuwo kale — iyo macaamiisha iyo shirkadaha u baahan shaqo tayo leh oo si ammaan ah online ah loo geeyo.',
          'Waxaan u dhisnay FIVESOM sababtoo ah dhalinyarada Soomaaliyeed waxay leeyihiin xirfado heer caalami ah laakiin ma haynin madal maxalli ah oo fahanta luqaddooda, hababka lacag-bixinta, iyo calaamadaha kalsoonida ee suuqan muhiimka ah. Madalaha caalamiga ah ayaa inta badan xira isticmaaleyaasha Soomaalida ah, ama hayaa lacagaha, ama qaata fees aan la awoodi karin. FIVESOM wuxuu ka saaraa caqabadahaas.',
          'Freelancer-rada, FIVESOM waa hab xirfado loogu beddelo dakhli dhab ah — la siiyo hababka maxaliga ah ee la aamini karo, oo leh profile bulshada u furan oo dhisaya sumcad order kasta kadib. Macaamiisha iyo shirkadaha, waa hab dhakhso ah oo jaban oo lagu shaqaaleysiiyo karti la xaqiijiyay iyada oo aan dalka laga bixin.',
        ],
        steps: [
          { title: 'Freelancer-rada', body: 'Samee profile, soo bandhig adeegyadaada gigs ahaan, oo ka bilow inaad lacag ka kasbato macaamiil dhab ah.' },
          { title: 'Macaamiisha', body: 'Raadi adeeg kasta, la hadal freelancer-ka, oo si ammaan ah u bixi nidaamka escrow.' },
          { title: 'Shirkadaha', body: 'Shaqaaleysii designers, video editors, developers iyo writers marka loo baahdo — bilaa heshiis dheer.' },
        ],
        bullets: [
          'Loogu talagalay suuqa Soomaalida — luuqad maxalli, lacag maxalli, taageero maxalli.',
          'Fees ka hooseeya madalaha caalamiga.',
          'Escrow wuxuu ilaaliyaa order kasta bilowga ilaa dhammaadka.',
          'Freelancers la xaqiijiyay oo leh portfolio iyo reviews dhab ah.',
        ],
        tip: 'Cusub halkan? Bilow inaad raadiso adeegyada si aad u aragto waxa freelancers kuu samayn karaan.',
      },
      ar: {
        title: '1. مقدمة / حول FIVESOM',
        subtitle: 'منصة عمل حر صومالية موثوقة لاقتصاد رقمي حديث.',
        description: [
          'FIVESOM هي أول منصة عمل حر احترافية مبنية خصيصًا للسوق الصومالي. تربط المستقلين الموهوبين — مصممين ومحرري فيديو ومطوري ويب وكتّاب — بالعملاء والشركات الذين يحتاجون عملاً عالي الجودة عبر الإنترنت بأمان وفي الوقت المحدد.',
          'بنينا FIVESOM لأن الشباب الصومالي لديهم مهارات عالمية لكن افتقروا إلى منصة محلية تفهم لغتهم ووسائل دفعهم وعوامل الثقة المهمة في هذا السوق. المنصات الدولية غالبًا تحظر المستخدمين الصوماليين أو تحجز المدفوعات أو تفرض رسومًا باهظة. FIVESOM يزيل تلك الحواجز.',
        ],
        steps: [
          { title: 'للمستقلين', body: 'أنشئ ملفًا، أدرج خدماتك، وابدأ كسب دخل حقيقي.' },
          { title: 'للمشترين', body: 'ابحث عن أي خدمة، تحدث مع المستقل، وادفع بأمان عبر الضمان.' },
          { title: 'للشركات', body: 'وظّف مصممين ومحررين ومطوّرين وكتّابًا حسب الطلب.' },
        ],
        bullets: ['مبنية للسوق الصومالي.', 'رسوم أقل من المنصات الدولية.', 'الضمان يحمي كل طلب.', 'مستقلون موثّقون بأعمال وتقييمات.'],
        tip: 'جديد هنا؟ ابدأ بتصفح الخدمات.',
      },
      fr: {
        title: '1. Introduction / À propos de FIVESOM',
        subtitle: 'Une marketplace freelance somalienne de confiance pour l\'économie numérique moderne.',
        description: [
          'FIVESOM est la première marketplace freelance professionnelle conçue spécifiquement pour le marché somalien. Elle connecte des freelances qualifiés — designers, monteurs vidéo, développeurs web, rédacteurs — avec des clients et entreprises qui ont besoin de travail de qualité livré en ligne, en toute sécurité.',
          'Nous avons créé FIVESOM parce que les jeunes Somaliens ont des compétences de classe mondiale mais manquaient d\'une plateforme locale qui comprenne leur langue, leurs moyens de paiement et les signaux de confiance qui comptent. Les plateformes internationales bloquent souvent les utilisateurs somaliens ou retiennent les paiements. FIVESOM élimine ces obstacles.',
        ],
        steps: [
          { title: 'Pour les freelances', body: 'Créez un profil, publiez vos services et commencez à gagner.' },
          { title: 'Pour les acheteurs', body: 'Cherchez un service, discutez et payez en toute sécurité.' },
          { title: 'Pour les entreprises', body: 'Engagez des talents à la demande sans contrats longs.' },
        ],
        bullets: ['Conçue pour le marché somalien.', 'Frais réduits.', 'Séquestre sur chaque commande.', 'Freelances vérifiés.'],
        tip: 'Nouveau ? Commencez par explorer les services.',
      },
    },
  },
  {
    id: 'how-works', icon: Workflow, image: imgHow, cta: { label: { en: 'See How It Works', so: 'Arag Sida Uu U Shaqeeyo', ar: 'انظر كيف يعمل', fr: 'Voir comment ça marche' }, to: '/how-it-works' },
    t: {
      en: {
        title: '2. How FIVESOM Works',
        subtitle: 'A simple, safe flow from signup to completed order.',
        description: [
          'FIVESOM is built around a single goal: make it easy for buyers to hire and freelancers to get paid, with full protection at every step. Our system handles the messy parts — escrow, communication, delivery tracking, refunds — so you can focus on the work.',
          'The full lifecycle takes you from signing up, through finding or creating a service, ordering or accepting work, communicating securely, delivering files, getting paid, and finally leaving a review that builds long-term reputation.',
        ],
        steps: [
          { title: 'Sign up & choose role', body: 'Create your account in seconds with Google and pick Buyer or Freelancer.' },
          { title: 'Discover or list services', body: 'Buyers search the marketplace; freelancers create gigs with packages and pricing.' },
          { title: 'Order & pay into escrow', body: 'Buyers place orders, and funds are held safely in FIVESOM\'s escrow wallet.' },
          { title: 'Communicate & deliver', body: 'Both sides chat in real time and exchange files until the work is completed.' },
          { title: 'Approve & release payment', body: 'Once the buyer accepts the delivery, the funds are released to the freelancer\'s wallet.' },
          { title: 'Review & grow', body: 'Buyers leave a public rating that helps freelancers level up and earn more.' },
        ],
        bullets: [
          'Every order is protected by escrow.',
          'Real-time chat keeps both sides aligned.',
          'Disputes can be opened at any stage if something goes wrong.',
          'All activity is tracked in your dashboard.',
        ],
        tip: 'You can switch between Buyer and Freelancer modes from your account settings.',
      },
      so: {
        title: '2. Sida FIVESOM U Shaqeeyo',
        subtitle: 'Hannaan fudud oo ammaan ah laga bilaabo signup ilaa order la dhammaystiro.',
        description: [
          'FIVESOM waxaa lagu dhisay yool kaliya: ka dhig fudud macaamiisha inay shaqaaleeyaan iyo freelancers inay lacag helaan, oo leh ilaalin buuxda talaabo kasta. Nidaamkayaga ayaa qabta qaybaha adag — escrow, isgaarsiin, raadraaca delivery-ga, refunds — si aad ugu fiirsato shaqada.',
          'Wareegga oo dhan wuxuu kaa kaxaynayaa diiwaangelinta, ilaa raadinta ama abuurista adeeg, dalbashada ama aqbalida shaqada, isgaarsiinta ammaan ah, geynta files-ka, helitaanka lacagta, iyo ugu dambeyntii reefaying-ga sumcad la dhiso.',
        ],
        steps: [
          { title: 'Diiwaangeli & dooro doorka', body: 'Samee akoon ilbiriqsiyo Google oo dooro Macmiil ama Freelancer.' },
          { title: 'Hel ama soo bandhig adeegyo', body: 'Macaamiisha raadiyaan suuqa; freelancers samayn gigs leh packages iyo qiimo.' },
          { title: 'Dalbo & bixi escrow', body: 'Macaamiil dalbada, oo lacagta si ammaan ah loo hayaa wallet-ka FIVESOM.' },
          { title: 'Isgaarsii & geyn', body: 'Labadaba waxay sheekeeyaan real-time oo wadaagaan files ilaa shaqada la dhammaystiro.' },
          { title: 'Oggolow & sii daa lacagta', body: 'Marka macmiilku aqbalo delivery-ga, lacagta waxaa loo siinayaa wallet-ka freelancer-ka.' },
          { title: 'Reefaay & koror', body: 'Macaamiisha waxay ka tagaan qiimayn dadweyne oo caawiya freelancers inay heerar koraan.' },
        ],
        bullets: [
          'Order kasta waxaa ilaaliya escrow.',
          'Sheekada real-time waxay isku xirtaa labadaba.',
          'Khilaaf waa la furi karaa marka wax khaldamaan.',
          'Dhammaan dhaqdhaqaaqa waxaa lagu raadrayn karaa dashboard-kaaga.',
        ],
        tip: 'Waad isku bedeli kartaa Buyer iyo Freelancer mode dejinta akoonka.',
      },
      ar: {
        title: '2. كيف يعمل FIVESOM',
        subtitle: 'تدفق بسيط وآمن من التسجيل إلى إتمام الطلب.',
        description: ['FIVESOM مصمم لجعل التوظيف والدفع سهلًا وآمنًا في كل خطوة.', 'تأخذك دورة الحياة الكاملة من التسجيل إلى المراجعة النهائية.'],
        steps: [
          { title: 'التسجيل', body: 'أنشئ حسابك واختر دورك.' },
          { title: 'البحث أو النشر', body: 'ابحث عن خدمة أو أنشئ خدمتك.' },
          { title: 'الدفع في الضمان', body: 'يتم حفظ الأموال بأمان.' },
          { title: 'التواصل والتسليم', body: 'دردشة مباشرة وتبادل الملفات.' },
          { title: 'الموافقة والإفراج', body: 'تحويل الأموال بعد القبول.' },
          { title: 'التقييم', body: 'تقييم يبني السمعة.' },
        ],
        bullets: ['كل طلب محمي بالضمان.', 'دردشة فورية.', 'يمكن فتح نزاع في أي وقت.', 'كل النشاط في لوحتك.'],
      },
      fr: {
        title: '2. Comment FIVESOM Fonctionne',
        subtitle: 'Un flux simple et sûr de l\'inscription à la commande terminée.',
        description: ['FIVESOM facilite l\'embauche et le paiement avec protection complète à chaque étape.', 'Le cycle complet va de l\'inscription jusqu\'à l\'avis final.'],
        steps: [
          { title: 'Inscription', body: 'Créez votre compte et choisissez votre rôle.' },
          { title: 'Découvrir ou publier', body: 'Cherchez ou créez un service.' },
          { title: 'Paiement en séquestre', body: 'Fonds sécurisés.' },
          { title: 'Communication et livraison', body: 'Chat et échange de fichiers.' },
          { title: 'Approbation', body: 'Libération des fonds après acceptation.' },
          { title: 'Avis', body: 'L\'avis construit la réputation.' },
        ],
        bullets: ['Chaque commande protégée.', 'Chat temps réel.', 'Litige possible à tout moment.', 'Tout suivi dans votre tableau.'],
      },
    },
  },
  {
    id: 'account', icon: UserPlus, image: imgAccount, cta: { label: { en: 'Create Account', so: 'Sameey Akoon', ar: 'إنشاء حساب', fr: 'Créer un compte' }, to: '/register' },
    t: {
      en: {
        title: '3. Account Creation Guide',
        subtitle: 'Set up a secure FIVESOM account in under one minute.',
        description: [
          'Creating an account on FIVESOM is fast, free, and secure. We use Google authentication so you don\'t have to remember another password — your account is protected by Google\'s industry-leading security.',
          'Once you sign up, you choose a role: Buyer if you want to hire freelancers, or Freelancer if you want to offer services. You can complete additional profile details (photo, location, languages) later from your dashboard.',
        ],
        steps: [
          { title: 'Click "Sign up"', body: 'On the homepage, click Sign Up at the top right.' },
          { title: 'Continue with Google', body: 'Choose your Google account — no separate password needed.' },
          { title: 'Choose your role', body: 'Select Buyer or Freelancer. You can add the other role later.' },
          { title: 'Complete your profile', body: 'Add a photo, location, and short bio so others recognize you.' },
        ],
        bullets: [
          'No email/password to remember — just Google sign-in.',
          'Choose Buyer or Freelancer (or both later).',
          'Verified email is automatic.',
          'You can edit your profile any time.',
        ],
        tip: 'A clear profile photo and a real name dramatically increase trust and order rate.',
      },
      so: {
        title: '3. Hagaha Abuurista Akoonka',
        subtitle: 'U dejinta akoon FIVESOM ammaan ah daqiiqad gudaheed.',
        description: [
          'Abuurista akoon FIVESOM waa dhakhso, bilaash, ammaanna. Waxaan isticmaaleyaa Google authentication si aadan u xasuusan password kale — akoonkaaga waxaa ilaaliya ammaanka Google.',
          'Markaad signup-tid, waxaad doorataa door: Macmiil haddii aad rabto inaad shaqaaleyso freelancers, ama Freelancer haddii aad rabto inaad bixiso adeegyo. Faahfaahin profile dheeraad ah waad ku dari kartaa dashboard-ka.',
        ],
        steps: [
          { title: 'Riix "Sign up"', body: 'Bogga hore, riix Sign Up koonaha sare ee bidix.' },
          { title: 'Ku sii wad Google', body: 'Dooro akoonkaaga Google — password gaar ah looma baahna.' },
          { title: 'Dooro doorkaaga', body: 'Dooro Macmiil ama Freelancer. Doorka kale waad ku dari kartaa hadhow.' },
          { title: 'Dhamaystir profile', body: 'Ku dar sawir, goobta, iyo bio gaaban.' },
        ],
        bullets: [
          'Email/password lama xasuusto — kaliya Google.',
          'Dooro Macmiil ama Freelancer.',
          'Email-ka si toos ah ayaa loo xaqiijiyay.',
          'Waad wax ka beddeli kartaa profile-ka mar walba.',
        ],
        tip: 'Sawir profile cad iyo magac dhab ah waxay si weyn u kor u qaadayaan kalsoonida.',
      },
      ar: {
        title: '3. دليل إنشاء الحساب',
        subtitle: 'أنشئ حسابك في أقل من دقيقة.',
        description: ['نستخدم تسجيل الدخول عبر Google لأمان أعلى.', 'بعد التسجيل اختر دورك: مشتري أو مستقل.'],
        steps: [
          { title: 'اضغط "تسجيل"', body: 'في الصفحة الرئيسية.' },
          { title: 'متابعة عبر Google', body: 'بدون كلمة مرور.' },
          { title: 'اختر الدور', body: 'مشتري أو مستقل.' },
          { title: 'أكمل الملف', body: 'صورة وموقع ونبذة.' },
        ],
        bullets: ['تسجيل عبر Google.', 'مشتري أو مستقل.', 'تحقق تلقائي.', 'تعديل الملف في أي وقت.'],
        tip: 'صورة واضحة واسم حقيقي يزيدان الثقة.',
      },
      fr: {
        title: '3. Création de compte',
        subtitle: 'Créez votre compte FIVESOM en moins d\'une minute.',
        description: ['Inscription via Google pour plus de sécurité.', 'Choisissez Acheteur ou Freelance après inscription.'],
        steps: [
          { title: 'Cliquez "S\'inscrire"', body: 'Sur la page d\'accueil.' },
          { title: 'Continuer avec Google', body: 'Pas de mot de passe.' },
          { title: 'Choisissez le rôle', body: 'Acheteur ou Freelance.' },
          { title: 'Complétez le profil', body: 'Photo, lieu, bio.' },
        ],
        bullets: ['Connexion Google.', 'Acheteur ou Freelance.', 'Email vérifié.', 'Modifiable à tout moment.'],
        tip: 'Une photo claire augmente la confiance.',
      },
    },
  },
  {
    id: 'profile', icon: IdCard, image: imgProfile, cta: { label: { en: 'Edit Profile', so: 'Wax ka Beddel Profile', ar: 'تعديل الملف', fr: 'Modifier le profil' }, to: '/freelancer/profile' },
    t: {
      en: {
        title: '4. Freelancer Profile Setup',
        subtitle: 'Your profile is your shopfront. Make it impossible to ignore.',
        description: [
          'Buyers decide whether to message you in seconds. A complete, professional profile dramatically increases your order rate, your prices, and your overall reputation on FIVESOM.',
          'A great profile includes a sharp profile photo, a clear professional title, a confident bio, the right skills and languages, real portfolio samples, and an honest list of the software and tools you use. Verification adds a blue tick that signals serious professionalism.',
        ],
        steps: [
          { title: 'Profile photo', body: 'Use a clean, well-lit photo of your face. Avoid logos and stock images.' },
          { title: 'Professional title', body: 'Be specific: "Brand Logo Designer" beats "Designer".' },
          { title: 'Bio', body: 'Write 3–5 sentences explaining what you do, who you help, and why clients choose you.' },
          { title: 'Skills & languages', body: 'Pick the skills clients actually search for. Add every language you can work in.' },
          { title: 'Portfolio', body: 'Upload at least 4–6 high-quality samples that prove your skills.' },
          { title: 'Software tools', body: 'List the real tools you use (Photoshop, Figma, Premiere, etc.).' },
        ],
        bullets: [
          'Real photo + real name = higher trust.',
          'Specific titles convert better than generic ones.',
          'Portfolio samples must be your own work.',
          'Verified accounts get featured more often.',
        ],
        tip: 'Get verified as soon as possible — verified freelancers earn significantly more orders.',
      },
      so: {
        title: '4. Diyaarinta Profile-ka Freelancer',
        subtitle: 'Profile-kaagu waa shop-front-kaaga. Ka dhig mid aan la iska indho-tiri karin.',
        description: [
          'Macaamiisha waxay ku go\'aansadaan inay ku la xiriiraan ilbiriqsiyo gudaha. Profile dhamaystiran oo xirfad leh ayaa si weyn u kor u qaadaya order rate, qiimaha, iyo sumcaddaada FIVESOM.',
          'Profile fiican wuxuu leeyahay sawir profile cad, title xirfadeed, bio kalsooni leh, xirfadaha iyo luqadaha saxda ah, tusaalooyin portfolio dhab ah, iyo liis daacad ah oo software-yada aad isticmaasho. Xaqiijinta waxay ku dartaa tick buluug ah oo muujinaya xirfad.',
        ],
        steps: [
          { title: 'Sawir profile', body: 'Isticmaal sawir cad oo wajigaaga muujinaya. Ka fogow logos iyo sawiro stock.' },
          { title: 'Title xirfadeed', body: 'Noqo gaar: "Brand Logo Designer" wuu ka fiican yahay "Designer".' },
          { title: 'Bio', body: 'Qor 3–5 sentences sharaxaya waxaad samayso, cidda aad caawiso, iyo sababta loo doorto.' },
          { title: 'Xirfado & luqado', body: 'Dooro xirfadaha macaamiisha raadiyaan. Ku dar luqad kasta.' },
          { title: 'Portfolio', body: 'Soo gudbi ugu yaraan 4–6 tusaale tayo sare leh.' },
          { title: 'Software-yada', body: 'Liiska tools-ka aad isticmaasho (Photoshop, Figma, Premiere, iwm).' },
        ],
        bullets: [
          'Sawir dhab + magac dhab = kalsooni sare.',
          'Titles gaar ah way ka fiican yihiin generic.',
          'Portfolio waa inuu shaqadaada noqdaa.',
          'Akoonnada la xaqiijiyay waxaa lagu xushaa Featured marar badan.',
        ],
        tip: 'Hel xaqiijinta sida ugu dhakhsaha — freelancers la xaqiijiyay waxay helaan order badan.',
      },
      ar: {
        title: '4. إعداد ملف المستقل',
        subtitle: 'ملفك واجهتك. اجعله لا يُنسى.',
        description: ['المشتري يقرر في ثوانٍ. ملف احترافي يضاعف طلباتك.', 'يشمل: صورة، عنوان، نبذة، مهارات، أعمال، أدوات.'],
        steps: [
          { title: 'الصورة', body: 'صورة واضحة لوجهك.' },
          { title: 'العنوان المهني', body: 'كن محددًا.' },
          { title: 'النبذة', body: '3-5 جمل واضحة.' },
          { title: 'المهارات واللغات', body: 'اختر بعناية.' },
          { title: 'الأعمال', body: '4-6 نماذج على الأقل.' },
          { title: 'الأدوات', body: 'اذكر برامجك.' },
        ],
        bullets: ['صورة حقيقية تبني الثقة.', 'عنوان محدد يحوّل أفضل.', 'أعمالك يجب أن تكون لك.', 'الموثّقون يحصلون على ترشيح أكثر.'],
        tip: 'اطلب التوثيق مبكرًا.',
      },
      fr: {
        title: '4. Configurer votre profil',
        subtitle: 'Votre profil est votre vitrine.',
        description: ['Les acheteurs décident en quelques secondes.', 'Photo, titre, bio, compétences, portfolio, outils — tout compte.'],
        steps: [
          { title: 'Photo', body: 'Photo claire de votre visage.' },
          { title: 'Titre pro', body: 'Soyez précis.' },
          { title: 'Bio', body: '3-5 phrases.' },
          { title: 'Compétences', body: 'Choisissez avec soin.' },
          { title: 'Portfolio', body: 'Au moins 4-6 exemples.' },
          { title: 'Outils', body: 'Listez vos logiciels.' },
        ],
        bullets: ['Vraie photo = confiance.', 'Titre spécifique = meilleur taux.', 'Vos propres travaux uniquement.', 'Comptes vérifiés mis en avant.'],
        tip: 'Demandez la vérification rapidement.',
      },
    },
  },
  {
    id: 'escrow', icon: ShieldCheck, image: imgEscrow,
    t: {
      en: {
        title: '5. Secure Escrow',
        subtitle: 'Your money is protected from the moment you order until the moment you accept.',
        description: [
          'Escrow is the heart of FIVESOM\'s trust system. When a buyer pays for an order, the funds are not sent directly to the freelancer. Instead, FIVESOM holds them in a secure escrow wallet. The freelancer can see that the money is locked in and ready, but cannot withdraw it until the buyer accepts the delivery.',
          'This protects everyone. Buyers know that their money is safe until they actually receive what they paid for. Freelancers know that the buyer cannot disappear after the work is delivered. If anything goes wrong, the FIVESOM dispute team reviews evidence from both sides and decides fairly.',
        ],
        steps: [
          { title: 'Buyer pays', body: 'Funds move from the buyer\'s payment method into FIVESOM escrow.' },
          { title: 'Freelancer is notified', body: 'The order becomes active and the freelancer can start working.' },
          { title: 'Work is delivered', body: 'Freelancer uploads files and marks the order as delivered.' },
          { title: 'Buyer reviews', body: 'Buyer accepts, requests revisions, or opens a dispute.' },
          { title: 'Funds released', body: 'On acceptance, funds move from escrow to the freelancer\'s wallet.' },
        ],
        bullets: [
          'Funds locked in escrow until delivery is accepted.',
          'Refunds possible if work is not delivered.',
          'Disputes mediated by FIVESOM admins.',
          'No direct money transfers between users — everything goes through escrow.',
        ],
        tip: 'Never accept off-platform payments. Escrow only protects orders made through FIVESOM.',
      },
      so: {
        title: '5. Adeegga Escrow (Sugnaanta Lacagta)',
        subtitle: 'Lacagtaadu way ammaan tahay laga bilaabo dalbashada ilaa aad aqbasho.',
        description: [
          'Escrow waa wadnaha nidaamka kalsoonida FIVESOM. Marka macmiilku bixiyo order, lacagta toos looma diro freelancer-ka. Halkii, FIVESOM wuxuu ku hayaa wallet escrow ammaan ah. Freelancer-ka wuxuu arki karaa in lacagta xidhantahay diyaarna tahay, laakiin ma soo saari karo ilaa macmiilku aqbalo delivery-ga.',
          'Tani waxay ilaalisaa qof walba. Macaamiil waxay ogyihiin in lacagtoodu ay ammaan tahay. Freelancers waxay ogyihiin in macmiilku ku libaaxi karin shaqada kadib.',
        ],
        steps: [
          { title: 'Macmiilku bixiyaa', body: 'Lacagta waxay ka guurtaa hab lacag bixineed ee macmiilka una guurtaa escrow.' },
          { title: 'Freelancer waa la wargeliyaa', body: 'Order-ku wuxuu noqdaa active oo freelancer-ku wuxuu bilaabaa shaqada.' },
          { title: 'Shaqada waa la geeyaa', body: 'Freelancer wuxuu soo gudbiyaa files-ka oo calaamadeeyaa delivered.' },
          { title: 'Macmiilku eegaa', body: 'Macmiilku aqbali, codsi revision, ama furi khilaaf.' },
          { title: 'Lacagta la sii daayo', body: 'Marka la aqbalo, lacagta waxay u guurtaa wallet-ka freelancer-ka.' },
        ],
        bullets: [
          'Lacagta escrow waxaa lagu xidhaa ilaa la aqbalo.',
          'Refund waa suurtagal haddii shaqada aan la geyn.',
          'Khilaaf waxaa khasab ah admin-ka FIVESOM.',
          'Lacag toos ah lama wareejiyo — kaliya escrow.',
        ],
        tip: 'Weligaa ha aqbalin lacag bixin platform-ka ka baxsan.',
      },
      ar: {
        title: '5. الضمان الآمن',
        subtitle: 'أموالك محمية من الطلب حتى القبول.',
        description: ['الضمان هو قلب نظام الثقة في FIVESOM.', 'يحمي الطرفين بشكل عادل.'],
        steps: [
          { title: 'الدفع', body: 'تنتقل الأموال إلى الضمان.' },
          { title: 'إشعار المستقل', body: 'يبدأ العمل.' },
          { title: 'التسليم', body: 'رفع الملفات.' },
          { title: 'المراجعة', body: 'قبول أو نزاع.' },
          { title: 'الإفراج', body: 'تحويل للمحفظة.' },
        ],
        bullets: ['أموال مغلقة حتى القبول.', 'استرداد ممكن.', 'نزاعات بإشراف الإدارة.', 'لا تحويلات مباشرة.'],
        tip: 'لا تقبل دفعًا خارج المنصة.',
      },
      fr: {
        title: '5. Séquestre sécurisé',
        subtitle: 'Votre argent est protégé jusqu\'à acceptation.',
        description: ['Le séquestre est le cœur du système de confiance.', 'Il protège équitablement les deux parties.'],
        steps: [
          { title: 'Paiement', body: 'Fonds en séquestre.' },
          { title: 'Notification', body: 'Début du travail.' },
          { title: 'Livraison', body: 'Téléversement des fichiers.' },
          { title: 'Examen', body: 'Acceptation ou litige.' },
          { title: 'Libération', body: 'Transfert au portefeuille.' },
        ],
        bullets: ['Fonds verrouillés.', 'Remboursement possible.', 'Litiges arbitrés.', 'Aucun transfert direct.'],
        tip: 'N\'acceptez jamais de paiement hors plateforme.',
      },
    },
  },
  {
    id: 'gig', icon: Briefcase, image: imgGig, cta: { label: { en: 'Create a Gig', so: 'Samee Gig', ar: 'إنشاء خدمة', fr: 'Créer un gig' }, to: '/create-gig' },
    t: {
      en: {
        title: '6. Creating a Service (Gig)',
        subtitle: 'A great gig is the difference between zero orders and a full pipeline.',
        description: [
          'A gig is a packaged service you offer on FIVESOM. It tells buyers exactly what you do, what they get, how much it costs, and how long it takes. The clearer your gig, the more orders you get.',
          'FIVESOM uses a six-step gig wizard so you can build a professional gig step by step: overview, pricing, description, requirements, gallery, and publish. You can edit any part of your gig at any time.',
        ],
        steps: [
          { title: 'Overview', body: 'Pick your category and write a short, specific gig title.' },
          { title: 'Pricing', body: 'Set Basic, Standard, and Premium packages with clear deliverables.' },
          { title: 'Description', body: 'Explain what you do and what makes your service worth choosing.' },
          { title: 'Requirements', body: 'List exactly what you need from buyers to start the work.' },
          { title: 'Gallery', body: 'Upload images and videos showing your best work. The first image is the thumbnail.' },
          { title: 'Publish', body: 'Review everything, add tags, and publish. Your gig is live instantly.' },
        ],
        bullets: [
          'Three pricing tiers (Basic / Standard / Premium) increase average order value.',
          'Buyer requirements collected up front prevent revisions.',
          'High-quality thumbnails increase clicks dramatically.',
          'Tags help buyers find you in search.',
        ],
        tip: 'Look at top-ranked gigs in your category and study what makes them stand out.',
      },
      so: {
        title: '6. Abuurista Adeeg (Gig)',
        subtitle: 'Gig fiican waa kala duwanaanta order-yaal jirin iyo pipeline buuxa.',
        description: [
          'Gig waa adeeg packaged ah oo aad FIVESOM ku bixiso. Wuxuu macaamiisha u sheegayaa waxa aad samayso, waxa ay helayaan, qiimaha, iyo waqtiga.',
          'FIVESOM wuxuu isticmaalaa lix-tallaabo gig wizard si aad u dhisto gig xirfadeed: overview, qiime, sharaxaad, shuruudo, gallery, iyo publish.',
        ],
        steps: [
          { title: 'Overview', body: 'Dooro qaybta oo qor gig title gaaban gaarna.' },
          { title: 'Qiimaha', body: 'Dej Basic, Standard, Premium packages.' },
          { title: 'Sharaxaad', body: 'Sharax waxa aad samayso.' },
          { title: 'Shuruudo', body: 'Liiska waxa aad uga baahan tahay macaamiisha.' },
          { title: 'Gallery', body: 'Soo gudbi sawiro iyo videos. Sawirka kowaad waa thumbnail.' },
          { title: 'Publish', body: 'Eeg dhammaan oo daabac.' },
        ],
        bullets: [
          'Saddex heer qiime waxay kor u qaadaan qiimaha order-ka.',
          'Shuruudaha hore loo qabto waxay yareeyaan revisions.',
          'Thumbnail tayo sare leh waxay kordhinayaan clicks.',
          'Tags waxay caawiyaan macaamiisha inay ku helaan search.',
        ],
        tip: 'Eeg gigs-ka heerka sare ee qaybtaada oo baro waxa ka dhiga gaar.',
      },
      ar: {
        title: '6. إنشاء خدمة',
        subtitle: 'خدمة رائعة = طلبات أكثر.',
        description: ['الخدمة باقة محددة من العمل.', 'ست خطوات لإنشاء خدمة احترافية.'],
        steps: [
          { title: 'نظرة عامة', body: 'اختر الفئة والعنوان.' },
          { title: 'التسعير', body: 'ثلاث باقات.' },
          { title: 'الوصف', body: 'اشرح خدمتك.' },
          { title: 'المتطلبات', body: 'ما تحتاجه من المشتري.' },
          { title: 'المعرض', body: 'صور وفيديوهات.' },
          { title: 'النشر', body: 'مراجعة ونشر.' },
        ],
        bullets: ['ثلاث باقات.', 'متطلبات مسبقة.', 'صور جودة عالية.', 'وسوم للبحث.'],
        tip: 'ادرس الخدمات الناجحة.',
      },
      fr: {
        title: '6. Créer un service',
        subtitle: 'Un bon gig fait la différence.',
        description: ['Un gig est un service packagé.', 'Six étapes pour un gig pro.'],
        steps: [
          { title: 'Aperçu', body: 'Catégorie et titre.' },
          { title: 'Prix', body: 'Trois forfaits.' },
          { title: 'Description', body: 'Expliquez votre service.' },
          { title: 'Exigences', body: 'Ce dont vous avez besoin.' },
          { title: 'Galerie', body: 'Images et vidéos.' },
          { title: 'Publication', body: 'Vérification et publication.' },
        ],
        bullets: ['Trois forfaits.', 'Exigences claires.', 'Visuels de qualité.', 'Tags pour la recherche.'],
        tip: 'Étudiez les gigs populaires.',
      },
    },
  },
  {
    id: 'ordering', icon: ShoppingCart, image: imgOrdering, cta: { label: { en: 'Browse Services', so: 'Eeg Adeegyada', ar: 'تصفح', fr: 'Parcourir' }, to: '/explore' },
    t: {
      en: {
        title: '7. Ordering Services',
        subtitle: 'Hire any freelancer in three simple steps — fully protected.',
        description: [
          'Ordering on FIVESOM is designed to be as simple as buying anything else online, with the added safety of escrow. You browse, you message, you order, you receive — and only when you are happy is the freelancer paid.',
          'Before placing an order it is always smart to message the freelancer first. A two-minute conversation about your goals usually leads to a much better delivery.',
        ],
        steps: [
          { title: 'Find a freelancer', body: 'Use the Explore page to filter by category, price, and rating.' },
          { title: 'Message first (optional)', body: 'Discuss your project and confirm scope before paying.' },
          { title: 'Pick a package', body: 'Choose Basic, Standard, or Premium based on what you need.' },
          { title: 'Submit requirements', body: 'Answer the freelancer\'s questions so they can start immediately.' },
          { title: 'Pay securely', body: 'Funds go into escrow — protected until you accept.' },
          { title: 'Track in dashboard', body: 'Follow your order status, chat, and revisions in one place.' },
        ],
        bullets: [
          'Always message before ordering for complex work.',
          'Pay only through FIVESOM — never directly.',
          'Use the requirements form to avoid back-and-forth.',
          'Keep all communication on platform.',
        ],
        tip: 'If a freelancer asks you to pay outside FIVESOM, report them immediately.',
      },
      so: {
        title: '7. Dalbashada Adeegyada',
        subtitle: 'Shaqaalee freelancer kasta saddex tallaabo — si buuxda u ilaalin.',
        description: [
          'Dalbashada FIVESOM waxay u dhisantahay inay u fudud tahay sida iibsiga online — laakiin leh ammaanka escrow.',
          'Hortii order-ka, mar walba waa caqli ah inaad la hadasho freelancer-ka.',
        ],
        steps: [
          { title: 'Hel freelancer', body: 'Adeegso Explore page si aad u shaandhayso.' },
          { title: 'La hadal hortii', body: 'Ka hadal mashruuca.' },
          { title: 'Dooro package', body: 'Basic, Standard, ama Premium.' },
          { title: 'Soo gudbi shuruudaha', body: 'Jawaab su\'aalaha freelancer-ka.' },
          { title: 'Si ammaan u bixi', body: 'Lacagta wuxuu galaa escrow.' },
          { title: 'La soco', body: 'Ka raac order, chat, iyo revisions.' },
        ],
        bullets: [
          'La hadal hortii shaqo adag.',
          'Bixi kaliya FIVESOM.',
          'Adeegso requirements form.',
          'Sii hay isgaarsiinta platform-ka.',
        ],
        tip: 'Haddii freelancer ku weydiisto bixin platform ka baxsan, soo sheeg.',
      },
      ar: {
        title: '7. طلب الخدمات',
        subtitle: 'وظّف أي مستقل في ثلاث خطوات.',
        description: ['الطلب بسيط وآمن.', 'تواصل قبل الطلب دائمًا.'],
        steps: [
          { title: 'ابحث', body: 'استخدم صفحة الاستكشاف.' },
          { title: 'تواصل', body: 'ناقش المشروع.' },
          { title: 'اختر باقة', body: 'حسب احتياجك.' },
          { title: 'المتطلبات', body: 'أجب الأسئلة.' },
          { title: 'ادفع', body: 'إلى الضمان.' },
          { title: 'تابع', body: 'في لوحتك.' },
        ],
        bullets: ['تواصل قبل الطلب.', 'ادفع عبر FIVESOM فقط.', 'استخدم نموذج المتطلبات.', 'تواصل داخل المنصة.'],
        tip: 'أبلغ عن أي طلب دفع خارجي.',
      },
      fr: {
        title: '7. Commander un service',
        subtitle: 'Engagez un freelance en trois étapes.',
        description: ['Commander est simple et sécurisé.', 'Discutez avant de commander.'],
        steps: [
          { title: 'Cherchez', body: 'Page Explorer.' },
          { title: 'Discutez', body: 'Cadrez le projet.' },
          { title: 'Forfait', body: 'Selon le besoin.' },
          { title: 'Exigences', body: 'Répondez aux questions.' },
          { title: 'Payez', body: 'Vers le séquestre.' },
          { title: 'Suivez', body: 'Dans votre tableau.' },
        ],
        bullets: ['Discutez avant.', 'Payez via FIVESOM uniquement.', 'Utilisez le formulaire.', 'Restez sur la plateforme.'],
        tip: 'Signalez toute demande de paiement externe.',
      },
    },
  },
  {
    id: 'messaging', icon: MessageSquare, image: imgMessaging, cta: { label: { en: 'Open Messages', so: 'Fur Fariimaha', ar: 'الرسائل', fr: 'Messages' }, to: '/buyer/messages' },
    t: {
      en: {
        title: '8. Messaging & Communication',
        subtitle: 'Real-time chat that keeps every order on track.',
        description: [
          'Clear communication is the single biggest predictor of a successful order. FIVESOM\'s built-in messaging gives you everything you need: real-time chat, image sharing, file attachments, emojis, typing indicators, online status, and read receipts.',
          'All conversations are kept inside the platform so support can step in instantly if there is ever a dispute. There is no need to swap phone numbers, switch to WhatsApp, or use external email — and doing so actually weakens your protection.',
        ],
        steps: [
          { title: 'Open a conversation', body: 'Click "Contact" on any gig or profile to start a chat.' },
          { title: 'Send messages & files', body: 'Share text, images, and supported file types directly.' },
          { title: 'See live indicators', body: 'Typing dots, online status, and read receipts.' },
          { title: 'Stay notified', body: 'Get instant notifications when replies arrive.' },
        ],
        bullets: [
          'Real-time messaging with attachments.',
          'Online and typing indicators built in.',
          'Read receipts on every message.',
          'All messages stored and reviewable by admins on dispute.',
        ],
        tip: 'Always discuss scope and timeline in writing before starting an order.',
      },
      so: {
        title: '8. Fariimaha & Wada Xiriirka',
        subtitle: 'Sheeko real-time ah oo order kasta xajisa.',
        description: [
          'Isgaarsiin cad waa saadaalinta ugu weyn ee order guul leh. Messaging-ka FIVESOM wuxuu siiyaa wax kasta oo aad u baahan tahay: chat real-time, sawiro, files, emojis, typing indicators, online status, iyo read receipts.',
          'Dhammaan sheekooyinka waxay ku jiraan platform-ka si support-ku u soo dhex galo haddii ay khilaaf dhacdo.',
        ],
        steps: [
          { title: 'Fur sheeko', body: 'Riix "Contact" gig kasta ama profile.' },
          { title: 'Dir fariimaha & files', body: 'Wadaag qoraal, sawiro, iyo files.' },
          { title: 'Arag indicators', body: 'Typing, online status, read receipts.' },
          { title: 'La soco notifications', body: 'Hel ogeysiisyo isla markaaba.' },
        ],
        bullets: [
          'Real-time messaging oo leh attachments.',
          'Online iyo typing indicators.',
          'Read receipts.',
          'Dhammaan messages waa la kaydiyaa.',
        ],
        tip: 'Mar walba ka hadal scope iyo waqtiga qoraal hortii order.',
      },
      ar: {
        title: '8. المراسلة والتواصل',
        subtitle: 'دردشة مباشرة لإبقاء الطلب على المسار.',
        description: ['التواصل الواضح أهم عامل للنجاح.', 'كل شيء داخل المنصة لحمايتك.'],
        steps: [
          { title: 'افتح محادثة', body: 'اضغط "تواصل".' },
          { title: 'الرسائل والملفات', body: 'نص وصور وملفات.' },
          { title: 'المؤشرات', body: 'كتابة وقراءة.' },
          { title: 'إشعارات', body: 'فورية.' },
        ],
        bullets: ['دردشة مباشرة.', 'مؤشرات حية.', 'إيصالات قراءة.', 'سجل محفوظ.'],
        tip: 'ناقش النطاق كتابيًا.',
      },
      fr: {
        title: '8. Messagerie',
        subtitle: 'Chat temps réel pour garder la commande sur les rails.',
        description: ['La communication claire est clé.', 'Tout reste sur la plateforme pour vous protéger.'],
        steps: [
          { title: 'Ouvrir un chat', body: 'Cliquez "Contact".' },
          { title: 'Messages et fichiers', body: 'Texte, images, fichiers.' },
          { title: 'Indicateurs', body: 'Saisie, lecture, en ligne.' },
          { title: 'Notifications', body: 'Instantanées.' },
        ],
        bullets: ['Chat temps réel.', 'Indicateurs en direct.', 'Accusés de lecture.', 'Historique conservé.'],
        tip: 'Discutez du périmètre par écrit.',
      },
    },
  },
  {
    id: 'payment', icon: Wallet, image: imgPayment, cta: { label: { en: 'Open Wallet', so: 'Fur Wallet-ka', ar: 'المحفظة', fr: 'Portefeuille' }, to: '/freelancer/wallet' },
    t: {
      en: {
        title: '9. Payment System',
        subtitle: 'Local-first payments built for the Somali market.',
        description: [
          'FIVESOM supports the payment methods that Somalis actually use: mobile money (EVC Plus, ZAAD, Sahal, eDahab), local bank transfers, and cards where available. Buyers pay in the method that works for them; freelancers withdraw in the method that works for them.',
          'All payments flow through your in-app wallet. Earnings land in your wallet automatically when an order is accepted. From the wallet, you can request a withdrawal to your preferred local method.',
        ],
        steps: [
          { title: 'Buyer pays', body: 'Choose mobile money, card, or another supported method.' },
          { title: 'Funds enter escrow', body: 'Held safely until the order is accepted.' },
          { title: 'Earnings land in wallet', body: 'On acceptance, money moves to the freelancer\'s wallet.' },
          { title: 'Withdraw', body: 'Request a payout to your preferred local method.' },
        ],
        bullets: [
          'Local mobile money (EVC, ZAAD, Sahal, eDahab) supported.',
          'In-app wallet for every freelancer.',
          'Transparent platform fee shown before checkout.',
          'Withdrawal processing typically completes within 24 hours.',
        ],
        tip: 'Add a verified payout method early so you can withdraw the moment your first order completes.',
      },
      so: {
        title: '9. Nidaamka Lacag-bixinta',
        subtitle: 'Lacag-bixin maxalli ah oo loogu talagalay suuqa Soomaalida.',
        description: [
          'FIVESOM wuxuu taageeraa habab lacag bixin oo Soomaalida dhab ahaan u isticmaalaan: mobile money (EVC Plus, ZAAD, Sahal, eDahab), wareejinno bangiyo maxalli, iyo cards meelaha la heli karo.',
          'Dhammaan lacagaha waxay maraan in-app wallet. Lacagta waxay si toos ah u galaysaa wallet-kaaga marka order la aqbalo. Markaas waxaad codsan kartaa withdrawal hab aad doonto.',
        ],
        steps: [
          { title: 'Macmiilku bixiyaa', body: 'Mobile money, card, ama hab kale.' },
          { title: 'Lacagta escrow', body: 'Si ammaan ah loo hayaa.' },
          { title: 'Lacagta wallet', body: 'Marka la aqbalo.' },
          { title: 'Withdrawal', body: 'Codso payout.' },
        ],
        bullets: [
          'Mobile money maxalli (EVC, ZAAD, Sahal, eDahab).',
          'In-app wallet freelancer kasta.',
          'Platform fee oo cad.',
          'Withdrawal 24 saac gudaheed.',
        ],
        tip: 'Ku dar payout method oo la xaqiijiyay si aad u soo saari karto isla markaaba.',
      },
      ar: {
        title: '9. نظام الدفع',
        subtitle: 'مدفوعات محلية للسوق الصومالي.',
        description: ['ندعم EVC وZAAD وSahal وeDahab.', 'كل المدفوعات عبر محفظتك.'],
        steps: [
          { title: 'الدفع', body: 'وسائل متعددة.' },
          { title: 'الضمان', body: 'حفظ آمن.' },
          { title: 'المحفظة', body: 'بعد القبول.' },
          { title: 'السحب', body: 'إلى وسيلتك.' },
        ],
        bullets: ['دعم محلي.', 'محفظة لكل مستقل.', 'رسوم واضحة.', 'سحب خلال 24 ساعة.'],
        tip: 'أضف وسيلة سحب مبكرًا.',
      },
      fr: {
        title: '9. Paiements',
        subtitle: 'Paiements locaux pour le marché somalien.',
        description: ['EVC, ZAAD, Sahal, eDahab supportés.', 'Tout passe par votre portefeuille.'],
        steps: [
          { title: 'Paiement', body: 'Méthodes multiples.' },
          { title: 'Séquestre', body: 'Conservation sécurisée.' },
          { title: 'Portefeuille', body: 'Après acceptation.' },
          { title: 'Retrait', body: 'Vers votre méthode.' },
        ],
        bullets: ['Support local.', 'Portefeuille par freelance.', 'Frais clairs.', 'Retrait sous 24h.'],
        tip: 'Ajoutez votre méthode de retrait tôt.',
      },
    },
  },
  {
    id: 'orders', icon: ListChecks, image: imgOrders, cta: { label: { en: 'My Orders', so: 'Orders-keyga', ar: 'طلباتي', fr: 'Mes commandes' }, to: '/buyer/orders' },
    t: {
      en: {
        title: '10. Order Management',
        subtitle: 'Track every order through its full lifecycle.',
        description: [
          'Both buyers and freelancers get a dedicated Orders dashboard that shows every stage of every order. You always know exactly where things stand — pending requirements, in progress, delivered, in revision, completed, or cancelled.',
          'Order pages bring all the context together: chat, files, requirements, deadlines, packages, and the action buttons relevant to your role and the current status.',
        ],
        steps: [
          { title: 'Pending', body: 'Buyer is being asked for requirements.' },
          { title: 'Active', body: 'Freelancer is working on the delivery.' },
          { title: 'Delivered', body: 'Files are uploaded and waiting on buyer review.' },
          { title: 'Revision', body: 'Buyer requested changes; freelancer responds.' },
          { title: 'Completed', body: 'Buyer accepted; payment released to freelancer.' },
          { title: 'Cancelled / Disputed', body: 'Order cancelled or admin mediation requested.' },
        ],
        bullets: [
          'Filter orders by status with one click.',
          'Deadline countdown on every active order.',
          'All files and chat tied to the order.',
          'Revision history kept for transparency.',
        ],
        tip: 'Set realistic delivery times — late deliveries hurt your ranking faster than anything else.',
      },
      so: {
        title: '10. Maaraynta Orders',
        subtitle: 'La soco order kasta inta uu socdo.',
        description: [
          'Macaamiisha iyo freelancers labadaba waxay helaan dashboard Orders gaar ah oo muujinaya tallaabo kasta.',
          'Boggagga order waxay isu keenaan dhammaan: chat, files, shuruudaha, deadlines, packages, iyo button-yada.',
        ],
        steps: [
          { title: 'Pending', body: 'Macmiilka shuruud la weydiiyay.' },
          { title: 'Active', body: 'Freelancer wuu ka shaqaynayaa.' },
          { title: 'Delivered', body: 'Files la geeyay, sugaya macmiilka.' },
          { title: 'Revision', body: 'Macmiil codsaday isbeddel.' },
          { title: 'Completed', body: 'Macmiil aqbalay; lacag la siiyay.' },
          { title: 'Cancelled / Disputed', body: 'La cancel garay ama khilaaf.' },
        ],
        bullets: [
          'Shaandhee orders riix keliya.',
          'Deadline countdown order kasta.',
          'Files iyo chat order.',
          'Revision history hayey.',
        ],
        tip: 'Dej waqtiyo delivery oo la rumaysan karo.',
      },
      ar: {
        title: '10. إدارة الطلبات',
        subtitle: 'تتبّع كل طلب طوال دورته.',
        description: ['لوحة طلبات مخصصة.', 'كل السياق في صفحة الطلب.'],
        steps: [
          { title: 'معلق', body: 'بانتظار المتطلبات.' },
          { title: 'نشط', body: 'العمل جارٍ.' },
          { title: 'مُسلَّم', body: 'بانتظار المراجعة.' },
          { title: 'مراجعة', body: 'تعديلات مطلوبة.' },
          { title: 'مكتمل', body: 'تم القبول.' },
          { title: 'ملغي / نزاع', body: 'إلغاء أو نزاع.' },
        ],
        bullets: ['تصفية بنقرة.', 'عداد للموعد.', 'كل شيء مع الطلب.', 'سجل المراجعات.'],
        tip: 'حدد مواعيد واقعية.',
      },
      fr: {
        title: '10. Gestion des commandes',
        subtitle: 'Suivez chaque commande.',
        description: ['Tableau de commandes dédié.', 'Tout le contexte sur la page de la commande.'],
        steps: [
          { title: 'En attente', body: 'Exigences attendues.' },
          { title: 'Active', body: 'Travail en cours.' },
          { title: 'Livrée', body: 'En attente d\'examen.' },
          { title: 'Révision', body: 'Modifications demandées.' },
          { title: 'Terminée', body: 'Acceptée.' },
          { title: 'Annulée / Litige', body: 'Annulation ou litige.' },
        ],
        bullets: ['Filtre rapide.', 'Compte à rebours.', 'Tout sur la commande.', 'Historique conservé.'],
        tip: 'Fixez des délais réalistes.',
      },
    },
  },
  {
    id: 'reviews', icon: Star, image: imgReviews,
    t: {
      en: {
        title: '11. Ratings & Reviews',
        subtitle: 'Your reputation is built one honest review at a time.',
        description: [
          'After every completed order, the buyer can leave a 1–5 star rating and a written review. This rating is permanently tied to your gig and your profile, and it is one of the most important factors buyers look at before hiring.',
          'FIVESOM actively removes fake or manipulated reviews. Trying to buy reviews, swap reviews with friends, or pressure buyers will result in penalties up to and including account suspension.',
        ],
        steps: [
          { title: 'Order completes', body: 'Buyer accepts the delivery.' },
          { title: 'Buyer rates', body: '1–5 stars plus a written review.' },
          { title: 'Review goes public', body: 'Visible on your gig and profile.' },
          { title: 'Reputation grows', body: 'Higher ratings unlock seller levels and visibility.' },
        ],
        bullets: [
          'Honest 1–5 star ratings only.',
          'Fake reviews are removed automatically and manually.',
          'Reviews count toward your seller level.',
          'You cannot delete a real review — only respond to it.',
        ],
        tip: 'Always over-deliver on the first order with a new client. The first review sets the tone for all the next ones.',
      },
      so: {
        title: '11. Qiimaynta & Reviews',
        subtitle: 'Sumcaddaadu waxaa lagu dhisaa hal review oo daacad ah marka.',
        description: [
          'Order kasta kadib, macmiilku wuxuu ka tagi karaa qiimayn 1–5 xiddig ah iyo review. Tani waxay weligeed ku xidhan tahay gig-aaga.',
          'FIVESOM wuxuu ka saaraa reviews been ah. Inaad iibsato reviews ama saaxiibo ku weydiiso waxay keentaa ciqaab ilaa hakinta akoonka.',
        ],
        steps: [
          { title: 'Order dhammaystiran', body: 'Macmiil aqbalay delivery.' },
          { title: 'Macmiilku qiimeeyo', body: '1–5 xiddig iyo qoraal.' },
          { title: 'Review dadweyne', body: 'Wuu muuqdaa profile-ka.' },
          { title: 'Sumcad koreey', body: 'Furi heerar.' },
        ],
        bullets: [
          'Qiimeyn daacad ah 1–5.',
          'Reviews been ah waa la saaraa.',
          'Reviews waxay tirsanaaan seller level.',
          'Ma tirtiri kartid review dhab ah.',
        ],
        tip: 'Mar walba ka geyso wax ka badan order-ka kowaad.',
      },
      ar: {
        title: '11. التقييمات',
        subtitle: 'سمعتك تُبنى تقييمًا تلو الآخر.',
        description: ['تقييم 1-5 نجوم بعد كل طلب.', 'إزالة التقييمات المزيفة.'],
        steps: [
          { title: 'اكتمال الطلب', body: 'بعد القبول.' },
          { title: 'التقييم', body: 'نجوم وتعليق.' },
          { title: 'النشر', body: 'يظهر على ملفك.' },
          { title: 'النمو', body: 'مستويات أعلى.' },
        ],
        bullets: ['تقييمات صادقة.', 'إزالة المزيفة.', 'تحدد مستواك.', 'لا يمكن حذف الحقيقي.'],
        tip: 'تفوّق في الطلب الأول.',
      },
      fr: {
        title: '11. Avis et notes',
        subtitle: 'Votre réputation se construit un avis à la fois.',
        description: ['Note 1-5 étoiles après chaque commande.', 'Faux avis supprimés.'],
        steps: [
          { title: 'Commande terminée', body: 'Après acceptation.' },
          { title: 'Évaluation', body: 'Étoiles et commentaire.' },
          { title: 'Publication', body: 'Sur votre profil.' },
          { title: 'Croissance', body: 'Niveaux débloqués.' },
        ],
        bullets: ['Avis honnêtes.', 'Faux supprimés.', 'Affecte le niveau.', 'Avis réels indélébiles.'],
        tip: 'Excellez sur la première commande.',
      },
    },
  },
  {
    id: 'security', icon: Lock, image: imgSecurity,
    t: {
      en: {
        title: '12. Security & Trust',
        subtitle: 'Multiple layers of protection on every account, payment, and message.',
        description: [
          'Security is not an add-on at FIVESOM — it is built into every part of the product. Accounts are protected by Google authentication. Payments are protected by escrow. Messages are stored on the platform and reviewable by support. Suspicious activity is monitored automatically and accounts that break the rules are removed quickly.',
          'You can also help keep the platform safe. If you ever see a scam, fake portfolio, or abusive user, use the Report button. Every report is reviewed by the admin team.',
        ],
        steps: [
          { title: 'Account protection', body: 'Google login + verified email by default.' },
          { title: 'Identity verification', body: 'Optional verified blue tick after admin review.' },
          { title: 'Anti-fraud monitoring', body: 'Suspicious behavior flagged automatically.' },
          { title: 'Reporting tools', body: 'Report button on profiles, gigs, chats, and orders.' },
          { title: 'Privacy', body: 'We never share your private data with third parties.' },
        ],
        bullets: [
          'Secure Google authentication.',
          'Verified profiles get a blue tick.',
          'Suspicious activity detection.',
          'In-app reporting on every page.',
        ],
        tip: 'If something feels wrong, it usually is. Trust your instinct and report it.',
      },
      so: {
        title: '12. Ammaanka & Kalsoonida',
        subtitle: 'Lakabyo ilaalin oo akoonka, lacagta, iyo fariimaha.',
        description: [
          'Ammaanku ma aha add-on FIVESOM — waxaa lagu dhisay qayb kasta. Akoonnada waxaa ilaaliya Google. Lacagta waxaa ilaaliya escrow. Fariimaha waxaa lagu kaydiyaa platform-ka.',
          'Adigana waad caawin kartaa. Haddii aad aragto khiyaamo ama portfolio been ah, isticmaal Report.',
        ],
        steps: [
          { title: 'Ilaalinta akoonka', body: 'Google login.' },
          { title: 'Xaqiijinta', body: 'Tick buluug ah.' },
          { title: 'Anti-fraud', body: 'Si toos ah loo eego.' },
          { title: 'Soo sheegista', body: 'Button Report.' },
          { title: 'Asturnaanta', body: 'Xogtaada lama wadaago.' },
        ],
        bullets: [
          'Google authentication.',
          'Tick buluug ah.',
          'Eegista khiyaamo.',
          'Reporting bog kasta.',
        ],
        tip: 'Haddii aad dareemayso wax khaldan, soo sheeg.',
      },
      ar: {
        title: '12. الأمان والثقة',
        subtitle: 'طبقات حماية متعددة.',
        description: ['الأمان مدمج في كل شيء.', 'ساعدنا بالإبلاغ عن المخالفات.'],
        steps: [
          { title: 'حماية الحساب', body: 'تسجيل Google.' },
          { title: 'التوثيق', body: 'علامة زرقاء.' },
          { title: 'مكافحة الاحتيال', body: 'مراقبة تلقائية.' },
          { title: 'الإبلاغ', body: 'زر Report.' },
          { title: 'الخصوصية', body: 'لا مشاركة.' },
        ],
        bullets: ['Google.', 'علامة زرقاء.', 'كشف احتيال.', 'إبلاغ في كل مكان.'],
        tip: 'أبلغ عن أي شك.',
      },
      fr: {
        title: '12. Sécurité et confiance',
        subtitle: 'Plusieurs couches de protection.',
        description: ['Sécurité intégrée partout.', 'Aidez-nous en signalant.'],
        steps: [
          { title: 'Protection du compte', body: 'Connexion Google.' },
          { title: 'Vérification', body: 'Badge bleu.' },
          { title: 'Anti-fraude', body: 'Surveillance automatique.' },
          { title: 'Signalement', body: 'Bouton Report.' },
          { title: 'Confidentialité', body: 'Pas de partage.' },
        ],
        bullets: ['Google.', 'Badge bleu.', 'Détection fraude.', 'Signalement partout.'],
        tip: 'Signalez tout doute.',
      },
    },
  },
  {
    id: 'community', icon: Users, image: imgCommunity,
    t: {
      en: {
        title: '13. Community Guidelines',
        subtitle: 'Simple rules that keep FIVESOM clean, safe, and respectful.',
        description: [
          'FIVESOM is a community of professionals. Whether you are a freelancer, a buyer, or a business, the same simple rules apply: be honest, be respectful, and do real work.',
          'Breaking the guidelines can result in warnings, gig removal, account suspension, or permanent ban depending on severity.',
        ],
        steps: [
          { title: 'Be honest', body: 'No fake portfolios, fake reviews, or fake identities.' },
          { title: 'Respect everyone', body: 'No harassment, hate speech, or abusive language.' },
          { title: 'Protect IP', body: 'Do not steal or copy work that is not yours.' },
          { title: 'No spam', body: 'Do not flood chats, gigs, or comments.' },
          { title: 'Stay on platform', body: 'Do not push contact off FIVESOM.' },
        ],
        bullets: [
          'No fake accounts or fake portfolios.',
          'No abuse, harassment, or hate speech.',
          'No copyright violations.',
          'No off-platform payments.',
        ],
        tip: 'When in doubt, ask support before doing it.',
      },
      so: {
        title: '13. Xeerarka Bulshada',
        subtitle: 'Xeerar fudud oo nadiifiya FIVESOM.',
        description: [
          'FIVESOM waa bulsho xirfadlayaal ah. Xeerar isku mid ah ayaa khuseeya: noqo daacad, ixtiraam, oo qabo shaqo dhab ah.',
          'Jebinta xeerarka waxay keeni kartaa digniin, hakad, ama mamnuucid joogto ah.',
        ],
        steps: [
          { title: 'Daacadnimo', body: 'Bilaa portfolio been ah ama reviews been ah.' },
          { title: 'Ixtiraam', body: 'Bilaa cay ama hadal xun.' },
          { title: 'Ilaali IP', body: 'Ha xadin shaqo aan kaa ahayn.' },
          { title: 'Bilaa spam', body: 'Ha buux-buuxin chats.' },
          { title: 'Ku sii jir platform', body: 'Ha qaadin ka baxsan.' },
        ],
        bullets: [
          'Bilaa akoonno been ah.',
          'Bilaa cay.',
          'Bilaa copyright.',
          'Bilaa lacag platform-ka ka baxsan.',
        ],
        tip: 'Markaad shakidid, weydii support.',
      },
      ar: {
        title: '13. إرشادات المجتمع',
        subtitle: 'قواعد بسيطة لمجتمع نظيف.',
        description: ['مجتمع محترفين.', 'مخالفة القواعد تؤدي لعقوبات.'],
        steps: [
          { title: 'الصدق', body: 'لا للأعمال المزيفة.' },
          { title: 'الاحترام', body: 'لا للإساءة.' },
          { title: 'الملكية', body: 'لا للسرقة.' },
          { title: 'لا سبام', body: 'لا للفيضانات.' },
          { title: 'ابقَ على المنصة', body: 'لا للتواصل الخارجي.' },
        ],
        bullets: ['لا حسابات مزيفة.', 'لا إساءة.', 'لا انتهاك.', 'لا دفع خارجي.'],
        tip: 'استفسر من الدعم.',
      },
      fr: {
        title: '13. Règles de la communauté',
        subtitle: 'Règles simples pour une communauté propre.',
        description: ['Communauté de professionnels.', 'Les violations entraînent des sanctions.'],
        steps: [
          { title: 'Honnêteté', body: 'Pas de faux travaux.' },
          { title: 'Respect', body: 'Pas d\'abus.' },
          { title: 'Propriété', body: 'Pas de vol.' },
          { title: 'Pas de spam', body: 'Pas d\'inondation.' },
          { title: 'Restez sur la plateforme', body: 'Pas de contact externe.' },
        ],
        bullets: ['Pas de faux comptes.', 'Pas d\'abus.', 'Pas de violation.', 'Pas de paiement externe.'],
        tip: 'Demandez au support en cas de doute.',
      },
    },
  },
  {
    id: 'dispute', icon: Scale, image: imgDispute,
    t: {
      en: {
        title: '14. Dispute Resolution',
        subtitle: 'Fair, fast mediation when something goes wrong.',
        description: [
          'Even with the best intentions, sometimes a buyer and freelancer disagree about a delivery. FIVESOM\'s dispute team exists to handle exactly that. Either side can open a dispute from the order page, and our team will review the messages, files, and original agreement before deciding.',
          'Our goal is always a fair outcome — that may be a full refund, a partial refund, or a full release of payment to the freelancer. Decisions are based on evidence, not opinion.',
        ],
        steps: [
          { title: 'Open a dispute', body: 'From the order page, click Open Dispute and explain.' },
          { title: 'Submit evidence', body: 'Both sides upload files, screenshots, and chat references.' },
          { title: 'Admin review', body: 'A senior admin reviews the case end-to-end.' },
          { title: 'Decision', body: 'Refund, partial refund, or release based on findings.' },
        ],
        bullets: [
          'Both sides have equal voice.',
          'Decisions based on evidence.',
          'Most disputes resolved within 72 hours.',
          'Funds remain in escrow during review.',
        ],
        tip: 'Keep all communication on platform — chat history is your strongest evidence in a dispute.',
      },
      so: {
        title: '14. Xallinta Khilaafaadka',
        subtitle: 'Dhexdhexaad caadil ah oo dhakhso ah.',
        description: [
          'Mararka qaarkood macmiil iyo freelancer wey isku khilaafaan. Kooxda dispute ee FIVESOM ayaa ku jirta. Labadaba waxay furi karaan dispute order-ka.',
          'Yoolkayagu waa natiijo caadil ah — refund buuxa, refund qayb ka mid ah, ama sii daynta lacagta. Go\'aamada waxay ku salaysan yihiin caddayn.',
        ],
        steps: [
          { title: 'Fur dispute', body: 'Order page, riix Open Dispute.' },
          { title: 'Soo gudbi caddayn', body: 'Files, screenshots, chat.' },
          { title: 'Admin eegay', body: 'Admin sare wuu eegayaa.' },
          { title: 'Go\'aan', body: 'Refund ama sii daa.' },
        ],
        bullets: [
          'Labada dhinac cod siman.',
          'Caddayn ku salaysan.',
          'Inta badan 72 saac.',
          'Lacagta escrow waxay ku sii jirtaa.',
        ],
        tip: 'Sii hay isgaarsiinta platform-ka — chat waa caddaynta ugu xoog badan.',
      },
      ar: {
        title: '14. حل النزاعات',
        subtitle: 'وساطة عادلة وسريعة.',
        description: ['فريق متخصص لحل النزاعات.', 'القرار مبني على الأدلة.'],
        steps: [
          { title: 'فتح نزاع', body: 'من صفحة الطلب.' },
          { title: 'الأدلة', body: 'ملفات ولقطات.' },
          { title: 'مراجعة', body: 'إدارة كبار.' },
          { title: 'قرار', body: 'استرداد أو إفراج.' },
        ],
        bullets: ['صوت متساوٍ.', 'أدلة.', '72 ساعة.', 'الأموال في الضمان.'],
        tip: 'ابقَ على المنصة لقوة الأدلة.',
      },
      fr: {
        title: '14. Résolution des litiges',
        subtitle: 'Médiation juste et rapide.',
        description: ['Équipe dédiée aux litiges.', 'Décision basée sur les preuves.'],
        steps: [
          { title: 'Ouvrir un litige', body: 'Depuis la commande.' },
          { title: 'Preuves', body: 'Fichiers et captures.' },
          { title: 'Examen', body: 'Admin senior.' },
          { title: 'Décision', body: 'Remboursement ou libération.' },
        ],
        bullets: ['Voix égale.', 'Preuves.', '72 heures.', 'Fonds en séquestre.'],
        tip: 'Restez sur la plateforme.',
      },
    },
  },
  {
    id: 'levels', icon: Trophy, image: imgLevels,
    t: {
      en: {
        title: '15. Seller Levels System',
        subtitle: 'Climb the ranks. Unlock more orders, higher prices, and platform perks.',
        description: [
          'Every freelancer on FIVESOM moves through a clear progression of seller levels. Levels are calculated automatically based on completed orders, on-time delivery, average rating, and account behavior.',
          'Higher levels unlock real, visible benefits: priority placement in search, larger withdrawal limits, eligibility for Featured Sellers and Weekly Winners, and more trust signals next to your name.',
        ],
        steps: [
          { title: 'New Seller', body: 'Default level when you join. Focus on your first orders.' },
          { title: 'Level 1', body: 'Earned after consistent quality on early orders.' },
          { title: 'Level 2', body: 'Solid record of completed orders and high ratings.' },
          { title: 'Top Rated', body: 'Highest tier — reserved for the most trusted, most active freelancers.' },
        ],
        bullets: [
          'Levels are calculated automatically.',
          'Higher levels appear higher in search.',
          'Featured Sellers and Weekly Winners pulled from Top Rated.',
          'Levels can go down if quality drops.',
        ],
        tip: 'Consistency beats intensity. Five strong months in a row will move you up faster than one giant month.',
      },
      so: {
        title: '15. Nidaamka Heerarka Iibiyaha',
        subtitle: 'Kor u kac. Hel order badan, qiime sare, iyo perks.',
        description: [
          'Freelancer kasta FIVESOM wuxuu mara horumar cad. Heerarka waxaa si toos ah loogu xisaabiyaa orders, on-time delivery, qiimayn, iyo dhaqanka akoonka.',
          'Heerarka sare waxay furaan faa\'iidooyin: mudnaan search, withdrawal limits sare, Featured Sellers, iyo Weekly Winners.',
        ],
        steps: [
          { title: 'New Seller', body: 'Heerka bilowga ah.' },
          { title: 'Level 1', body: 'Tayo joogto ah orders bilow ah.' },
          { title: 'Level 2', body: 'Diiwaan adag.' },
          { title: 'Top Rated', body: 'Heerka ugu sarreeya.' },
        ],
        bullets: [
          'Si toos ah loo xisaabiyo.',
          'Heerka sare = search sare.',
          'Featured Sellers Top Rated.',
          'Heerka waa dhici karaa.',
        ],
        tip: 'Joogtaynta way ka fiican tahay degdeg.',
      },
      ar: {
        title: '15. مستويات البائع',
        subtitle: 'ارتقِ المستويات.',
        description: ['تقدّم تلقائي.', 'مستويات أعلى = مزايا أكثر.'],
        steps: [
          { title: 'بائع جديد', body: 'البداية.' },
          { title: 'مستوى 1', body: 'جودة مستمرة.' },
          { title: 'مستوى 2', body: 'سجل قوي.' },
          { title: 'الأعلى تقييمًا', body: 'القمة.' },
        ],
        bullets: ['تلقائي.', 'بحث أعلى.', 'مميزون.', 'يمكن النزول.'],
        tip: 'الاستمرارية أهم.',
      },
      fr: {
        title: '15. Niveaux vendeur',
        subtitle: 'Grimpez les échelons.',
        description: ['Progression automatique.', 'Niveaux supérieurs = avantages.'],
        steps: [
          { title: 'Nouveau', body: 'Le départ.' },
          { title: 'Niveau 1', body: 'Qualité constante.' },
          { title: 'Niveau 2', body: 'Historique solide.' },
          { title: 'Top Rated', body: 'Le sommet.' },
        ],
        bullets: ['Automatique.', 'Recherche prioritaire.', 'Mis en avant.', 'Peut descendre.'],
        tip: 'La régularité prime.',
      },
    },
  },
  {
    id: 'tick', icon: BadgeCheck, image: imgTick, cta: { label: { en: 'Get Verified', so: 'Hel Tick-ga', ar: 'احصل على التوثيق', fr: 'Vérifiez-vous' }, to: '/freelancer/verify' },
    t: {
      en: {
        title: '16. Verified Tick',
        subtitle: 'A blue tick is the strongest trust signal you can earn.',
        description: [
          'The blue verified tick on a freelancer\'s profile means our admin team has personally reviewed their identity, portfolio, and activity. Verified freelancers consistently earn more orders and command higher prices.',
          'Apply by submitting your government ID and a portfolio that proves your skills. Reviews typically take a few business days. Verification can be removed at any time if a freelancer breaks the rules.',
        ],
        steps: [
          { title: 'Submit your ID', body: 'Government ID uploaded securely (not public).' },
          { title: 'Submit your portfolio', body: 'Real samples of your work.' },
          { title: 'Admin reviews', body: 'Our team verifies identity and skills.' },
          { title: 'Tick appears', body: 'Blue tick shown next to your name across the platform.' },
        ],
        bullets: [
          'Government ID required.',
          'Portfolio must be your own work.',
          'Reviewed by senior admins.',
          'Blue tick visible everywhere your name appears.',
        ],
        tip: 'Verification is the single highest ROI thing a freelancer can do on FIVESOM.',
      },
      so: {
        title: '16. Tick (Calaamadda Xaqiijinta)',
        subtitle: 'Tick buluug ah waa calaamadda kalsoonida ugu xoog badan.',
        description: [
          'Tick buluug ah profile freelancer waxay ka dhigan tahay in admin si gaar ah u eegay aqoonsiga, portfolio, iyo dhaqanka.',
          'Codso adoo soo gudbinaya ID dawladeed iyo portfolio. Eegista waxay qaadataa maalmo shaqo.',
        ],
        steps: [
          { title: 'Soo gudbi ID', body: 'ID dawladeed si ammaan ah.' },
          { title: 'Soo gudbi portfolio', body: 'Tusaalooyin dhab ah.' },
          { title: 'Admin eegay', body: 'Kooxda waxay xaqiijinaysaa.' },
          { title: 'Tick muuqdaa', body: 'Buluug ag magacaaga.' },
        ],
        bullets: [
          'ID dawladeed.',
          'Portfolio shaqadaada.',
          'Admin sare.',
          'Buluug muuqdaa meel kasta.',
        ],
        tip: 'Xaqiijinta waa ROI ugu sareeya freelancer.',
      },
      ar: {
        title: '16. علامة التوثيق',
        subtitle: 'العلامة الزرقاء أقوى إشارة ثقة.',
        description: ['تم التحقق منها يدويًا.', 'مراجعة خلال أيام عمل.'],
        steps: [
          { title: 'الهوية', body: 'هوية رسمية.' },
          { title: 'الأعمال', body: 'نماذج حقيقية.' },
          { title: 'المراجعة', body: 'إدارة كبار.' },
          { title: 'العلامة', body: 'تظهر بجانب اسمك.' },
        ],
        bullets: ['هوية رسمية.', 'أعمالك.', 'إدارة كبار.', 'مرئية في كل مكان.'],
        tip: 'أعلى عائد للمستقل.',
      },
      fr: {
        title: '16. Badge vérifié',
        subtitle: 'Le badge bleu est le plus fort signal de confiance.',
        description: ['Vérification manuelle par l\'admin.', 'Examen sous quelques jours.'],
        steps: [
          { title: 'Pièce d\'identité', body: 'ID officiel.' },
          { title: 'Portfolio', body: 'Vos vrais travaux.' },
          { title: 'Examen', body: 'Admin senior.' },
          { title: 'Badge', body: 'À côté de votre nom.' },
        ],
        bullets: ['ID officiel.', 'Vos travaux.', 'Admin senior.', 'Visible partout.'],
        tip: 'Plus haut ROI pour un freelance.',
      },
    },
  },
  {
    id: 'support', icon: LifeBuoy, image: imgSupport, cta: { label: { en: 'Help Center', so: 'Xarunta Caawimaada', ar: 'مركز المساعدة', fr: 'Centre d\'aide' }, to: '/buyer/help' },
    t: {
      en: {
        title: '17. Contact & Support',
        subtitle: 'Real humans, fast answers, in your language.',
        description: [
          'FIVESOM support is available to every user. You can browse the Help Center for answers to common questions, open a support ticket from your dashboard, or reach out by email. Our team replies in English and Somali.',
          'For account safety issues, payment problems, or disputes, support takes priority and usually responds within hours.',
        ],
        steps: [
          { title: 'Browse Help Center', body: 'Most common questions are answered there.' },
          { title: 'Open a ticket', body: 'From your dashboard, send a detailed ticket.' },
          { title: 'Wait for reply', body: 'Most tickets answered within 24 hours.' },
          { title: 'Follow up', body: 'Reply on the ticket to keep context.' },
        ],
        bullets: [
          'Help Center available 24/7.',
          'Tickets answered by humans.',
          'English and Somali support.',
          'Priority for account safety and disputes.',
        ],
        tip: 'Always include the order ID or gig link when contacting support — it speeds up your reply.',
      },
      so: {
        title: '17. Xiriir & Taageero',
        subtitle: 'Dadka dhabta ah, jawaabo dhakhso, luqaddaada.',
        description: [
          'Taageerada FIVESOM waxaa heli kara user kasta. Waxaad eegi kartaa Help Center, furi karaa ticket dashboard-ka, ama nala soo xidhiidh email.',
          'Arrimaha ammaanka iyo lacagta, taageerada way mudnaan ka tahay oo inta badan ka jawaabaan saacado gudahood.',
        ],
        steps: [
          { title: 'Eeg Help Center', body: 'Su\'aalaha caadiga ah halkaas.' },
          { title: 'Fur ticket', body: 'Dashboard-ka.' },
          { title: 'Sug jawaab', body: 'Inta badan 24 saac gudahood.' },
          { title: 'La soco', body: 'Ka jawaab ticket-ka.' },
        ],
        bullets: [
          'Help Center 24/7.',
          'Tickets dad dhab ah.',
          'English & Somali.',
          'Mudnaan ammaan & dispute.',
        ],
        tip: 'Mar walba ku dar order ID — wuu dhakhsiyaa.',
      },
      ar: {
        title: '17. الدعم',
        subtitle: 'بشر حقيقيون وردود سريعة.',
        description: ['دعم متاح للجميع.', 'أولوية للأمان والمدفوعات.'],
        steps: [
          { title: 'مركز المساعدة', body: 'الأسئلة الشائعة.' },
          { title: 'تذكرة', body: 'من اللوحة.' },
          { title: 'انتظار', body: '24 ساعة.' },
          { title: 'متابعة', body: 'رد على التذكرة.' },
        ],
        bullets: ['24/7.', 'بشر.', 'إنجليزي وصومالي.', 'أولوية للأمان.'],
        tip: 'أرفق رقم الطلب.',
      },
      fr: {
        title: '17. Support',
        subtitle: 'Vrais humains, réponses rapides.',
        description: ['Support pour tous.', 'Priorité sécurité et paiements.'],
        steps: [
          { title: 'Centre d\'aide', body: 'FAQ.' },
          { title: 'Ticket', body: 'Depuis le tableau.' },
          { title: 'Attente', body: '24 heures.' },
          { title: 'Suivi', body: 'Répondre au ticket.' },
        ],
        bullets: ['24/7.', 'Humains.', 'Anglais et somali.', 'Priorité sécurité.'],
        tip: 'Joignez l\'ID de commande.',
      },
    },
  },
  {
    id: 'faq', icon: HelpCircle, image: imgFaq,
    t: {
      en: {
        title: '18. FAQ',
        subtitle: 'Quick answers to the most common questions.',
        description: ['These are the questions we hear most often. If your question is not here, the Help Center has many more — or contact support.'],
        steps: [],
        bullets: [],
        faqs: [
          { q: 'How do I get paid as a freelancer?', a: 'After the buyer accepts your delivery, funds are released from escrow to your FIVESOM wallet. From there you can withdraw via supported local payment methods (mobile money, etc.).' },
          { q: 'How do I cancel an order?', a: 'Open the order, click Cancel and choose a reason. Refund handling depends on the order status — pending orders are refunded automatically, active orders may go through dispute review.' },
          { q: 'How do I upgrade my profile?', a: 'Visit your profile dashboard and click Edit Profile. Add more skills, languages, portfolio samples, and apply for verification to unlock the blue tick.' },
          { q: 'How much does FIVESOM charge?', a: 'Fivesom charges freelancers a 15% commission on withdrawals. When a freelancer withdraws their earnings, 15% is deducted as the Fivesom fee and they receive the remaining 85%. Buyers are not charged an extra platform fee.' },
          { q: 'What happens if a freelancer disappears?', a: 'Open a dispute from the order page. Funds remain in escrow and can be fully refunded after admin review.' },
          { q: 'Can I work as both buyer and freelancer?', a: 'Yes. You can switch between Buyer and Freelancer modes from your account settings.' },
        ],
      },
      so: {
        title: '18. Su\'aalaha Caadiga ah',
        subtitle: 'Jawaabo dhakhso ah ee su\'aalaha ugu badan.',
        description: ['Kuwani waa su\'aalaha ugu badan ee la na waydiiyo. Help Center waxaa ku jira kuwo badan.'],
        steps: [],
        bullets: [],
        faqs: [
          { q: 'Sidee lacag u helaa freelancer ahaan?', a: 'Marka macmiilku oggolaado delivery-gaaga, lacagta waxay ka soo guurtaa escrow una guurtaa wallet-kaaga FIVESOM. Markaas waad ka saari kartaa hababka maxalliga ah.' },
          { q: 'Sidee order u cancel gareeyaa?', a: 'Fur order-ka, riix Cancel oo dooro sabab. Refund-ka wuxuu ku xidhan yahay xaaladda order-ka.' },
          { q: 'Sidee profile-ka u upgrade gareeyaa?', a: 'Tag profile dashboard-ka, riix Edit Profile. Ku dar xirfado, luqado, portfolio, oo codso xaqiijin.' },
          { q: 'Immisa fee ayuu FIVESOM qaadaa?', a: 'Platform fee yar oo cad ayaa la muujiyaa hortii checkout. Fee waa ka hooseeyaa platforms caalami.' },
          { q: 'Maxaa dhacaya haddii freelancer-ku libaaxo?', a: 'Fur dispute. Lacagta escrow ayaa ku sii jirta oo refund la heli karo.' },
          { q: 'Ma u shaqayn karaa labadaba buyer iyo freelancer?', a: 'Haa. Waad isku bedeli kartaa dejinta akoonka.' },
        ],
      },
      ar: {
        title: '18. الأسئلة الشائعة',
        subtitle: 'إجابات سريعة لأكثر الأسئلة شيوعًا.',
        description: ['أكثر الأسئلة شيوعًا.'],
        steps: [],
        bullets: [],
        faqs: [
          { q: 'كيف أتقاضى؟', a: 'بعد قبول التسليم، تحوّل الأموال من الضمان إلى محفظتك ثم يمكنك السحب.' },
          { q: 'كيف ألغي طلبًا؟', a: 'افتح الطلب واضغط إلغاء.' },
          { q: 'كيف أحدث ملفي؟', a: 'لوحة الملف، Edit Profile.' },
          { q: 'ما الرسوم؟', a: 'رسوم بسيطة واضحة.' },
          { q: 'إذا اختفى المستقل؟', a: 'افتح نزاعًا.' },
          { q: 'مشتري ومستقل معًا؟', a: 'نعم.' },
        ],
      },
      fr: {
        title: '18. FAQ',
        subtitle: 'Réponses rapides aux questions fréquentes.',
        description: ['Les questions les plus fréquentes.'],
        steps: [],
        bullets: [],
        faqs: [
          { q: 'Comment être payé ?', a: 'Après acceptation, fonds dans votre portefeuille puis retrait.' },
          { q: 'Comment annuler ?', a: 'Ouvrez la commande, cliquez Annuler.' },
          { q: 'Comment améliorer mon profil ?', a: 'Tableau de profil, Edit Profile.' },
          { q: 'Quels frais ?', a: 'Frais clairs avant paiement.' },
          { q: 'Si le freelance disparaît ?', a: 'Ouvrez un litige.' },
          { q: 'Acheteur et freelance ?', a: 'Oui.' },
        ],
      },
    },
  },
];

const UI_LABELS: Record<Lang, { onPage: string; tableOfContents: string; faqHeading: string; backToTop: string; steps: string; highlights: string; tip: string; faqInside: string }> = {
  en: { onPage: 'On this page', tableOfContents: 'Documentation', faqHeading: 'Common Questions', backToTop: 'Back to top', steps: 'Steps', highlights: 'Highlights', tip: 'Pro tip', faqInside: 'FAQ' },
  so: { onPage: 'Bogga kan', tableOfContents: 'Dukumentiyada', faqHeading: 'Su\'aalaha Caadiga ah', backToTop: 'Ku noqo dusha', steps: 'Tallaabooyinka', highlights: 'Muhiim', tip: 'Talo Pro', faqInside: 'FAQ' },
  ar: { onPage: 'في هذه الصفحة', tableOfContents: 'التوثيق', faqHeading: 'أسئلة شائعة', backToTop: 'إلى الأعلى', steps: 'الخطوات', highlights: 'أبرز النقاط', tip: 'نصيحة', faqInside: 'الأسئلة' },
  fr: { onPage: 'Sur cette page', tableOfContents: 'Documentation', faqHeading: 'Questions fréquentes', backToTop: 'Retour en haut', steps: 'Étapes', highlights: 'Points clés', tip: 'Astuce', faqInside: 'FAQ' },
};

const LANG_OPTIONS: { code: Lang; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'so', flag: '🇸🇴', label: 'Soomaali' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
];

const Docs: React.FC = () => {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('docs-lang') as Lang) || 'en');
  const [activeId, setActiveId] = useState<string>('intro');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const ui = UI_LABELS[lang];
  const isRtl = lang === 'ar';

  useEffect(() => { localStorage.setItem('docs-lang', lang); }, [lang]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.history.replaceState(null, '', `#${id}`);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentLangOpt = useMemo(() => LANG_OPTIONS.find(l => l.code === lang)!, [lang]);

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <SEO
        title="FIVESOM Documentation — Full A-Z Guide for Buyers & Freelancers"
        description="Complete FIVESOM documentation in English, Somali, Arabic and French. Accounts, gigs, escrow, payments, security, disputes, VIP and more."
        canonical="/docs"
      />
      <Navbar />

      {/* Top docs bar with language switcher */}
      <div className="border-b border-border bg-muted/30 sticky top-16 z-30 backdrop-blur supports-[backdrop-filter]:bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 rounded-md hover:bg-muted text-foreground"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open docs menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">FIVESOM {ui.tableOfContents}</h1>
          </div>
          <div className="flex items-center gap-1 bg-background border border-border rounded-full p-1">
            {LANG_OPTIONS.map(opt => (
              <button
                key={opt.code}
                onClick={() => setLang(opt.code)}
                className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded-full transition-colors ${
                  lang === opt.code ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={opt.label}
              >
                <span className="mr-1">{opt.flag}</span>
                <span className="hidden sm:inline">{opt.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-0 flex-1">
        <div className="flex gap-8">
          {/* Sidebar - desktop, pinned to the left edge of the screen */}
          <aside className={`hidden lg:block w-72 shrink-0 py-8 ${isRtl ? 'order-2' : ''}`}>
            <div className={`sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto py-2 ${isRtl ? 'pr-6 pl-4 border-l' : 'pl-6 pr-4 border-r'} border-border`}>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-3 tracking-wider">{ui.onPage}</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => {
                  const Icon = s.icon;
                  const active = activeId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleNavClick(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        active
                          ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{s.t[lang].title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile sidebar drawer */}
          {mobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileNavOpen(false)} />
              <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} bottom-0 w-72 bg-card border-${isRtl ? 'l' : 'r'} border-border p-4 overflow-y-auto`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-foreground">{ui.tableOfContents}</p>
                  <button onClick={() => setMobileNavOpen(false)} aria-label="Close"><X className="h-5 w-5 text-foreground" /></button>
                </div>
                <nav className="space-y-1">
                  {SECTIONS.map(s => {
                    const Icon = s.icon;
                    const active = activeId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleNavClick(s.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left ${active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{s.t[lang].title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0 py-8 max-w-4xl pr-4 sm:pr-6 lg:pr-8">
            <header className="mb-12">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                FIVESOM Docs
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
                {lang === 'so' ? 'Hagaha Buuxa ee FIVESOM' :
                 lang === 'ar' ? 'الدليل الكامل لـ FIVESOM' :
                 lang === 'fr' ? 'Guide complet FIVESOM' :
                 'The Complete FIVESOM Guide'}
              </h1>
              <p className="text-muted-foreground text-base sm:text-xl leading-relaxed">
                {lang === 'so' ? 'Wax kasta oo aad u baahan tahay si aad u isticmaasho FIVESOM A illaa Z — bog kasta oo si qoto dheer loo sharaxay.' :
                 lang === 'ar' ? 'كل ما تحتاج معرفته من الألف إلى الياء — كل قسم بشرح متعمق.' :
                 lang === 'fr' ? 'Tout ce qu\'il faut savoir, de A à Z — chaque section expliquée en profondeur.' :
                 'Everything you need to use FIVESOM from A to Z — every section explained in depth.'}
              </p>
            </header>

            <div className="space-y-20">
              {SECTIONS.map((s) => {
                const t = s.t[lang];
                const Icon = s.icon;
                return (
                  <section key={s.id} id={s.id} className="scroll-mt-32">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t.title}</h2>
                        <p className="text-muted-foreground text-base sm:text-lg mt-1">{t.subtitle}</p>
                      </div>
                    </div>

                    {/* Long description paragraphs */}
                    <div className="space-y-4 mb-6 mt-6">
                      {t.description.map((para, i) => (
                        <p key={i} className="text-foreground/90 text-base leading-relaxed">{para}</p>
                      ))}
                    </div>

                    {/* Section image — appears as user scrolls into the section */}
                    <figure className="rounded-2xl overflow-hidden border border-border mb-8 bg-muted shadow-sm">
                      <img
                        src={s.image}
                        alt={t.title}
                        loading="lazy"
                        width={1280}
                        height={720}
                        className="w-full h-auto object-cover"
                      />
                    </figure>

                    {/* Steps cards grid */}
                    {t.steps.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{ui.steps}</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {t.steps.map((step, i) => (
                            <Card key={i} className="border-border bg-card">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <span className="shrink-0 h-7 w-7 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                                    {i + 1}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-foreground text-sm">{step.title}</p>
                                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">{step.body}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Highlights bullets */}
                    {t.bullets.length > 0 && (
                      <div className="mb-6 rounded-xl border border-border bg-muted/30 p-5">
                        <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">{ui.highlights}</p>
                        <ul className="space-y-2">
                          {t.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pro tip callout */}
                    {t.tip && (
                      <div className="mb-6 border-l-4 border-primary bg-primary/5 px-4 py-3 rounded-r flex gap-3 items-start">
                        <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{ui.tip}</p>
                          <p className="text-sm text-foreground">{t.tip}</p>
                        </div>
                      </div>
                    )}

                    {/* Inline FAQ accordion (only on FAQ section) */}
                    {t.faqs && t.faqs.length > 0 && (
                      <Accordion type="single" collapsible className="border border-border rounded-xl bg-card mb-6">
                        {t.faqs.map((item, i) => (
                          <AccordionItem key={i} value={`item-${i}`} className="px-4">
                            <AccordionTrigger className="text-left text-foreground">{item.q}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}

                    {s.cta && (
                      <Link to={s.cta.to}>
                        <Button className="gap-2">
                          {s.cta.label[lang]}
                          <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
                        </Button>
                      </Link>
                    )}
                  </section>
                );
              })}

              <div className="text-center pt-6 border-t border-border">
                <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  ↑ {ui.backToTop}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Docs;
