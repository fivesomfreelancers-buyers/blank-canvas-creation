import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Info, Workflow, UserPlus, IdCard, ShieldCheck, Briefcase, ShoppingCart,
  MessageSquare, Wallet, ListChecks, Star, Lock, Users, Scale, Trophy,
  BadgeCheck, LifeBuoy, HelpCircle, Globe, ArrowRight, Menu, X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Footer } from '@/components/Footer';
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

interface Section {
  id: string;
  icon: React.ElementType;
  image: string;
  cta?: { label: Record<Lang, string>; to: string };
  t: Record<Lang, {
    title: string;
    intro: string;
    steps: string[];
    note?: string;
  }>;
}

const SECTIONS: Section[] = [
  {
    id: 'intro', icon: Info, image: imgIntro, cta: { label: { en: 'Explore Services', so: 'Eeg Adeegyada', ar: 'تصفح الخدمات', fr: 'Explorer les services' }, to: '/explore' },
    t: {
      en: { title: '1. Introduction / About FIVESOM', intro: 'FIVESOM is a Somali freelance marketplace connecting freelancers and clients to work together online safely and professionally.', steps: ['What FIVESOM is and who it serves', 'How it differs from other platforms', 'Helps freelancers earn and clients hire'] },
      so: { title: '1. Hordhac / Ku saabsan FIVESOM', intro: 'FIVESOM waa madal Somali freelancing ah oo isku xirta freelancers iyo macaamiisha si ay si professional ah online ugu wada shaqeeyaan.', steps: ['Waa maxay FIVESOM iyo cidda loogu talagalay', 'Waxa ka duwan platforms kale', 'Sida uu u caawinayo freelancers iyo clients'] },
      ar: { title: '1. مقدمة / حول FIVESOM', intro: 'FIVESOM هي منصة عمل حر صومالية تربط المستقلين بالعملاء للعمل معًا عبر الإنترنت بأمان واحتراف.', steps: ['ما هو FIVESOM ولمن', 'ما يميزه عن المنصات الأخرى', 'يساعد المستقلين والعملاء'] },
      fr: { title: '1. Introduction / À propos de FIVESOM', intro: 'FIVESOM est une marketplace freelance somalienne qui connecte freelances et clients pour travailler ensemble en ligne en toute sécurité.', steps: ['Ce qu\'est FIVESOM', 'Ce qui le différencie', 'Aide freelances et clients'] },
    }
  },
  {
    id: 'how-works', icon: Workflow, image: imgHow, cta: { label: { en: 'See How It Works', so: 'Arag Sida Uu U Shaqeeyo', ar: 'انظر كيف يعمل', fr: 'Voir comment ça marche' }, to: '/how-it-works' },
    t: {
      en: { title: '2. How FIVESOM Works', intro: 'A simple step-by-step flow for both buyers and freelancers.', steps: ['Client → Search service → Place order → Pay → Receive delivery', 'Freelancer → Create gig → Receive orders → Deliver work → Get paid'] },
      so: { title: '2. Sida FIVESOM U Shaqeeyo', intro: 'Hannaan fudud step-by-step ah oo loogu talagalay macaamiisha iyo freelancers labadaba.', steps: ['Client → Raadi adeeg → Dalbo → Bixi lacag → Hel shaqada', 'Freelancer → Sameey gig → Hel orders → Geyn shaqada → Hel lacagta'] },
      ar: { title: '2. كيف يعمل FIVESOM', intro: 'تدفق بسيط خطوة بخطوة للمشترين والمستقلين.', steps: ['العميل → بحث → طلب → دفع → استلام', 'المستقل → إنشاء خدمة → طلبات → تسليم → دفع'] },
      fr: { title: '2. Comment FIVESOM Fonctionne', intro: 'Un flux simple pas à pas pour les acheteurs et les freelances.', steps: ['Client → Recherche → Commande → Paiement → Livraison', 'Freelance → Créer gig → Commandes → Livraison → Paiement'] },
    }
  },
  {
    id: 'account', icon: UserPlus, image: imgAccount, cta: { label: { en: 'Create Account', so: 'Sameey Akoon', ar: 'إنشاء حساب', fr: 'Créer un compte' }, to: '/register' },
    t: {
      en: { title: '3. Account Creation Guide', intro: 'Sign up with Google in seconds, then choose your role (Buyer or Freelancer).', steps: ['Click Sign Up and continue with Google', 'Choose your role: Buyer or Freelancer', 'Complete your profile to start'] },
      so: { title: '3. Hagaha Abuurista Akoonka', intro: 'Ku diiwaan geli Google ilbiriqsi gudaheed, ka dibna dooro doorkaaga (Macmiil ama Freelancer).', steps: ['Riix Sign Up oo ku sii wad Google', 'Dooro doorkaaga: Macmiil ama Freelancer', 'Dhamaystir profile-kaaga'] },
      ar: { title: '3. دليل إنشاء الحساب', intro: 'سجّل عبر Google خلال ثوانٍ ثم اختر دورك.', steps: ['اضغط تسجيل ومتابعة عبر Google', 'اختر الدور: مشتري أو مستقل', 'أكمل ملفك الشخصي'] },
      fr: { title: '3. Création de compte', intro: 'Inscrivez-vous avec Google en quelques secondes, puis choisissez votre rôle.', steps: ['Cliquez S\'inscrire et continuez avec Google', 'Choisissez Acheteur ou Freelance', 'Complétez votre profil'] },
    }
  },
  {
    id: 'profile', icon: IdCard, image: imgProfile, cta: { label: { en: 'Edit Profile', so: 'Wax ka Beddel Profile', ar: 'تعديل الملف', fr: 'Modifier le profil' }, to: '/freelancer/profile' },
    t: {
      en: { title: '4. Freelancer Profile Setup', intro: 'Build a professional profile to attract more clients.', steps: ['Upload a clear profile photo', 'Add skills, languages and experience', 'Write a short professional bio', 'Upload portfolio samples'] },
      so: { title: '4. Diyaarinta Profile-ka Freelancer', intro: 'Dhis profile professional ah si aad u soo jiidato macaamiisha.', steps: ['Soo gudbi sawir profile cad', 'Ku dar xirfadaha, luqadaha iyo khibrada', 'Qor bio gaaban professional ah', 'Soo gudbi tusaalooyin portfolio'] },
      ar: { title: '4. إعداد ملف المستقل', intro: 'ابنِ ملفًا احترافيًا لجذب المزيد من العملاء.', steps: ['ارفع صورة واضحة', 'أضف المهارات واللغات والخبرة', 'اكتب نبذة مختصرة', 'ارفع نماذج أعمال'] },
      fr: { title: '4. Configurer votre profil', intro: 'Construisez un profil pro pour attirer plus de clients.', steps: ['Téléversez une photo claire', 'Ajoutez compétences, langues et expérience', 'Rédigez une bio courte', 'Ajoutez votre portfolio'] },
    }
  },
  {
    id: 'escrow', icon: ShieldCheck, image: imgEscrow,
    t: {
      en: { title: '5. Secure Escrow', intro: 'The buyer\'s payment is held in FIVESOM\'s escrow wallet and only released once the work is approved.', steps: ['Buyer pays into escrow', 'Funds are held safely', 'Released to freelancer on approval'], note: 'Escrow protects both buyer and freelancer.' },
      so: { title: '5. Adeegga Escrow (Sugnaanta Lacagta)', intro: 'Lacagta macmiilku bixiyo waxay ku xirnaanaysaa nidaamka Escrow ee FIVESOM, mana la siinayo xirfadlaha ilaa shaqada la xaqiijiyo.', steps: ['Macmiilku wuxuu bixiyaa lacagta escrow', 'Lacagta si ammaan ah ayaa loo hayaa', 'Waxaa la siiyaa freelancer-ka marka shaqada la oggolaado'], note: 'Escrow wuxuu ilaaliyaa labada dhinac.' },
      ar: { title: '5. الضمان الآمن', intro: 'تُحفظ مدفوعات المشتري في محفظة الضمان حتى الموافقة على العمل.', steps: ['الدفع إلى الضمان', 'حفظ الأموال بأمان', 'الإفراج عند الموافقة'] },
      fr: { title: '5. Séquestre sécurisé', intro: 'Le paiement est conservé en séquestre jusqu\'à l\'approbation du travail.', steps: ['Paiement en séquestre', 'Fonds sécurisés', 'Libération à l\'approbation'] },
    }
  },
  {
    id: 'gig', icon: Briefcase, image: imgGig, cta: { label: { en: 'Create a Gig', so: 'Samee Gig', ar: 'إنشاء خدمة', fr: 'Créer un gig' }, to: '/create-gig' },
    t: {
      en: { title: '6. Creating a Service (Gig)', intro: 'List your service with clear pricing and delivery details.', steps: ['Title, category and description', 'Three pricing tiers (Basic / Standard / Premium)', 'Delivery time and revisions', 'Upload images, videos and docs'] },
      so: { title: '6. Abuurista Adeeg (Gig)', intro: 'Soo bandhig adeegaaga oo leh qiimo cad iyo waqtiga gaarsiinta.', steps: ['Title, qaybta iyo sharaxaada', 'Saddex heerar qiime (Basic / Standard / Premium)', 'Waqtiga gaarsiinta iyo dib u eegista', 'Soo gudbi sawiro, videos iyo docs'] },
      ar: { title: '6. إنشاء خدمة', intro: 'انشر خدمتك بسعر وتفاصيل واضحة.', steps: ['عنوان وفئة ووصف', 'ثلاث باقات أسعار', 'مدة التسليم والمراجعات', 'صور وفيديوهات ومستندات'] },
      fr: { title: '6. Créer un service (Gig)', intro: 'Publiez votre service avec prix et détails clairs.', steps: ['Titre, catégorie et description', 'Trois niveaux de prix', 'Délai et révisions', 'Images, vidéos et documents'] },
    }
  },
  {
    id: 'ordering', icon: ShoppingCart, image: imgOrdering, cta: { label: { en: 'Browse Services', so: 'Eeg Adeegyada', ar: 'تصفح', fr: 'Parcourir' }, to: '/explore' },
    t: {
      en: { title: '7. Ordering Services', intro: 'Buyers select a package, send requirements and pay securely.', steps: ['Message the freelancer first if needed', 'Pick a package and continue to checkout', 'Pay securely via supported method', 'Track your order from your dashboard'] },
      so: { title: '7. Dalbashada Adeegyada', intro: 'Macmiilku wuxuu doortaa package, soo diraa shuruudo, oo si ammaan ah u bixiyaa.', steps: ['La hadal freelancer-ka marka loo baahdo', 'Dooro package oo ku sii wad checkout', 'Si ammaan ah u bixi lacagta', 'La soco order-kaaga dashboard-ka'] },
      ar: { title: '7. طلب الخدمات', intro: 'يختار المشتري الباقة ويرسل المتطلبات ويدفع بأمان.', steps: ['تواصل مع المستقل', 'اختر الباقة والدفع', 'ادفع بأمان', 'تتبّع طلبك'] },
      fr: { title: '7. Commander un service', intro: 'Choisissez un forfait, envoyez les exigences et payez en sécurité.', steps: ['Discutez avec le freelance', 'Choisissez un forfait', 'Payez en sécurité', 'Suivez votre commande'] },
    }
  },
  {
    id: 'messaging', icon: MessageSquare, image: imgMessaging, cta: { label: { en: 'Open Messages', so: 'Fur Fariimaha', ar: 'الرسائل', fr: 'Messages' }, to: '/buyer/messages' },
    t: {
      en: { title: '8. Messaging & Communication', intro: 'Real-time chat with attachments, emoji and read receipts.', steps: ['Send text, images, emoji and files', 'See typing and online indicators', 'Get notified instantly when replies arrive'] },
      so: { title: '8. Fariimaha & Wada Xiriirka', intro: 'Sheeko real-time ah oo leh attachments, emoji iyo akhriska.', steps: ['U dir qoraal, sawiro, emoji iyo files', 'Arag typing iyo online indicators', 'Hel ogeysiis isla markaaba'] },
      ar: { title: '8. المراسلة والتواصل', intro: 'دردشة مباشرة مع مرفقات ورموز.', steps: ['أرسل نص وصور وملفات', 'مؤشرات الكتابة', 'إشعارات فورية'] },
      fr: { title: '8. Messagerie', intro: 'Chat en temps réel avec pièces jointes et emojis.', steps: ['Envoyer texte, images, fichiers', 'Indicateurs de saisie', 'Notifications instantanées'] },
    }
  },
  {
    id: 'payment', icon: Wallet, image: imgPayment, cta: { label: { en: 'Open Wallet', so: 'Fur Wallet-ka', ar: 'المحفظة', fr: 'Portefeuille' }, to: '/freelancer/wallet' },
    t: {
      en: { title: '9. Payment System', intro: 'Wallet, withdrawals and processing fees explained.', steps: ['Funds land in your wallet after order acceptance', 'Withdraw via supported local payment methods', 'Platform fee is shown before checkout'] },
      so: { title: '9. Nidaamka Lacag-bixinta', intro: 'Wallet, ka saarista lacagta iyo fees-ka oo la sharaxay.', steps: ['Lacagta wuxuu ku soo dhacayaa wallet-ka kadib oggolaanshaha order-ka', 'Ka saar via local payment methods', 'Platform fee waxaa la muujinaa hortii checkout-ka'] },
      ar: { title: '9. نظام الدفع', intro: 'المحفظة والسحوبات والرسوم.', steps: ['تصل الأموال للمحفظة', 'اسحب عبر الطرق المحلية', 'رسوم المنصة واضحة'] },
      fr: { title: '9. Paiements', intro: 'Portefeuille, retraits et frais.', steps: ['Fonds dans votre portefeuille', 'Retrait via méthodes locales', 'Frais affichés avant paiement'] },
    }
  },
  {
    id: 'orders', icon: ListChecks, image: imgOrders, cta: { label: { en: 'My Orders', so: 'Orders-keyga', ar: 'طلباتي', fr: 'Mes commandes' }, to: '/buyer/orders' },
    t: {
      en: { title: '10. Order Management', intro: 'Track every order through its lifecycle.', steps: ['Active, pending, completed and cancelled tabs', 'Revision requests handled inside the order', 'Real-time status updates'] },
      so: { title: '10. Maaraynta Orders', intro: 'La soco order kasta inta uu socdo.', steps: ['Active, pending, completed iyo cancelled', 'Codsiyada dib u eegista oo gudaha order-ka', 'Cusboonaysiinta xaaladda real-time'] },
      ar: { title: '10. إدارة الطلبات', intro: 'تابع كل طلب طوال دورته.', steps: ['نشط، معلق، مكتمل، ملغي', 'طلبات المراجعة', 'تحديثات فورية'] },
      fr: { title: '10. Gestion des commandes', intro: 'Suivez chaque commande.', steps: ['Actif, en attente, terminé, annulé', 'Demandes de révision', 'Mises à jour temps réel'] },
    }
  },
  {
    id: 'reviews', icon: Star, image: imgReviews,
    t: {
      en: { title: '11. Ratings & Reviews', intro: 'Build trust through honest 1–5 star reviews.', steps: ['Buyers rate freelancers after delivery', 'Fake or low-effort reviews are removed', 'Ratings drive your reputation and ranking'] },
      so: { title: '11. Qiimaynta & Reviews', intro: 'Dhis kalsoonida adoo isticmaalaya 1–5 xiddig oo daacad ah.', steps: ['Macaamiisha qiimeeya freelancers kadib delivery-ga', 'Reviews-ka been abuurka ah waa la saaraa', 'Qiimaynta ayaa kor u qaadda sumcadda'] },
      ar: { title: '11. التقييمات', intro: 'ابنِ الثقة بتقييمات صادقة من 1 إلى 5.', steps: ['تقييم بعد التسليم', 'إزالة التقييمات المزيفة', 'التقييم يبني السمعة'] },
      fr: { title: '11. Avis et notes', intro: 'Construisez la confiance avec des avis honnêtes.', steps: ['Notes après livraison', 'Faux avis supprimés', 'La note construit la réputation'] },
    }
  },
  {
    id: 'security', icon: Lock, image: imgSecurity,
    t: {
      en: { title: '12. Security & Trust', intro: 'Account safety, anti-scam protection and identity verification.', steps: ['Two-factor authentication available', 'Fraud detection runs in the background', 'Report users who break the rules'] },
      so: { title: '12. Ammaanka & Kalsoonida', intro: 'Ammaanka akoonka, ka hortagga khiyaamada iyo xaqiijinta aqoonsiga.', steps: ['Two-factor authentication ayaa la heli karaa', 'Ogaanshaha khiyaamada wuu socdaa', 'Soo sheeg users-ka jebiya xeerarka'] },
      ar: { title: '12. الأمان والثقة', intro: 'حماية الحساب والتحقق من الهوية.', steps: ['التحقق بخطوتين', 'كشف الاحتيال', 'الإبلاغ عن المخالفين'] },
      fr: { title: '12. Sécurité et confiance', intro: 'Sécurité de compte et vérification d\'identité.', steps: ['Authentification à deux facteurs', 'Détection de fraude', 'Signaler les abus'] },
    }
  },
  {
    id: 'community', icon: Users, image: imgCommunity,
    t: {
      en: { title: '13. Community Guidelines', intro: 'Rules that keep our community clean and respectful.', steps: ['No spam or fake accounts', 'No abusive behavior', 'Respect every user'] },
      so: { title: '13. Xeerarka Bulshada', intro: 'Xeerar nadiifiya bulshadeena oo ixtiraam jira.', steps: ['Spam iyo akoonno been ah waa mamnuuc', 'Hadalada xun waa mamnuuc', 'Ixtiraam user kasta'] },
      ar: { title: '13. إرشادات المجتمع', intro: 'قواعد للحفاظ على مجتمع نظيف.', steps: ['لا للسبام', 'لا للإساءة', 'احترم الجميع'] },
      fr: { title: '13. Règles de la communauté', intro: 'Règles pour une communauté saine.', steps: ['Pas de spam', 'Pas d\'abus', 'Respect mutuel'] },
    }
  },
  {
    id: 'dispute', icon: Scale, image: imgDispute,
    t: {
      en: { title: '14. Dispute Resolution', intro: 'If buyer and freelancer disagree, the FIVESOM team steps in to mediate based on the original agreement.', steps: ['Open a dispute from the order page', 'Support reviews evidence from both sides', 'Fair refund or release based on findings'] },
      so: { title: '14. Xallinta Khilaafaadka', intro: 'Haddii ay yimaaddo ismaandhaaf, kooxda FiveSom waxay soo dhex galaan iyagoo eegaya heshiiskii hore.', steps: ['Fur khilaaf order-ka gudihiisa', 'Support waxay eegtaa caddaynta labada dhinacba', 'Refund cadaalad ah ama lacag-bixin lagu salaynayo'] },
      ar: { title: '14. حل النزاعات', intro: 'يتدخل فريق FIVESOM للوساطة بناءً على الاتفاق.', steps: ['افتح نزاعًا من الطلب', 'مراجعة الأدلة', 'حل عادل'] },
      fr: { title: '14. Résolution des litiges', intro: 'L\'équipe FIVESOM intervient pour arbitrer.', steps: ['Ouvrir un litige', 'Examen des preuves', 'Résolution équitable'] },
    }
  },
  {
    id: 'levels', icon: Trophy, image: imgLevels,
    t: {
      en: { title: '15. Seller Levels System', intro: 'Earn levels as you deliver great work.', steps: ['New Seller', 'Level 1', 'Level 2', 'Top Rated'] },
      so: { title: '15. Nidaamka Heerarka Iibiyaha', intro: 'Hel heerar marka aad geyso shaqo wanaagsan.', steps: ['New Seller', 'Level 1', 'Level 2', 'Top Rated'] },
      ar: { title: '15. مستويات البائع', intro: 'اكسب مستويات عبر العمل الجيد.', steps: ['بائع جديد', 'مستوى 1', 'مستوى 2', 'الأعلى تقييمًا'] },
      fr: { title: '15. Niveaux vendeur', intro: 'Gagnez des niveaux en livrant.', steps: ['Nouveau', 'Niveau 1', 'Niveau 2', 'Top Rated'] },
    }
  },
  {
    id: 'tick', icon: BadgeCheck, image: imgTick, cta: { label: { en: 'Get Verified', so: 'Hel Tick-ga', ar: 'احصل على التوثيق', fr: 'Vérifiez-vous' }, to: '/freelancer/verify' },
    t: {
      en: { title: '16. Verified Tick', intro: 'A blue verified tick on your profile builds trust with clients.', steps: ['Submit your ID and portfolio for review', 'Admin reviews and approves your account', 'Blue tick appears next to your name'] },
      so: { title: '16. Tick (Calaamadda Xaqiijinta)', intro: 'Tick buluug ah oo profile-kaaga ku yaal wuxuu kor u qaadayaa kalsoonida macaamiisha.', steps: ['Soo gudbi ID-gaaga iyo portfolio si loo eego', 'Admin wuu eegayaa oo oggolaanayaa akoonkaaga', 'Tick buluug ah ayaa magacaaga ag muuqanaya'] },
      ar: { title: '16. علامة التوثيق', intro: 'علامة توثيق زرقاء تبني الثقة.', steps: ['أرسل الهوية والأعمال', 'مراجعة من الإدارة', 'تظهر العلامة الزرقاء'] },
      fr: { title: '16. Badge vérifié', intro: 'Un badge bleu renforce la confiance.', steps: ['Soumettez ID et portfolio', 'Vérification par l\'admin', 'Badge bleu affiché'] },
    }
  },
  {
    id: 'support', icon: LifeBuoy, image: imgSupport, cta: { label: { en: 'Help Center', so: 'Xarunta Caawimaada', ar: 'مركز المساعدة', fr: 'Centre d\'aide' }, to: '/buyer/help' },
    t: {
      en: { title: '17. Contact & Support', intro: 'Reach our team via Help Center, email or live chat.', steps: ['Open a support ticket from your dashboard', 'Browse Help Center articles', 'Get fast replies from our support team'] },
      so: { title: '17. Xiriir & Taageero', intro: 'Nala soo xiriir Help Center, email ama live chat.', steps: ['Fur ticket support dashboard-ka', 'Eeg Help Center articles', 'Hel jawaab degdeg ah kooxda support'] },
      ar: { title: '17. الدعم', intro: 'تواصل معنا عبر مركز المساعدة.', steps: ['افتح تذكرة', 'اقرأ مقالات المساعدة', 'ردود سريعة'] },
      fr: { title: '17. Support', intro: 'Contactez-nous via le centre d\'aide.', steps: ['Ouvrir un ticket', 'Parcourir l\'aide', 'Réponses rapides'] },
    }
  },
  {
    id: 'faq', icon: HelpCircle, image: imgFaq,
    t: {
      en: { title: '18. FAQ', intro: 'Frequently asked questions on FIVESOM.', steps: ['How do I get paid?', 'How do I cancel an order?', 'How do I upgrade my profile?', 'How much does FIVESOM charge?'] },
      so: { title: '18. Su\'aalaha Inta Badan La Iswaydiiyo', intro: 'Su\'aalaha dadka ugu badan waydiiyaan.', steps: ['Sidee lacag u helaa?', 'Sidee order u cancel gareeyaa?', 'Sidee profile-keyga u upgrade gareeyaa?', 'Immisa fee ayuu FIVESOM qaadaa?'] },
      ar: { title: '18. الأسئلة الشائعة', intro: 'أكثر الأسئلة شيوعًا.', steps: ['كيف أتقاضى؟', 'كيف ألغي طلبًا؟', 'كيف أحدّث ملفي؟', 'ما الرسوم؟'] },
      fr: { title: '18. FAQ', intro: 'Questions fréquentes.', steps: ['Comment être payé ?', 'Comment annuler ?', 'Comment améliorer mon profil ?', 'Quels sont les frais ?'] },
    }
  },
];

const FAQ_ITEMS: Record<Lang, { q: string; a: string }[]> = {
  en: [
    { q: 'How do I get paid as a freelancer?', a: 'After the buyer accepts your delivery, funds are released to your FIVESOM wallet. You can then withdraw via supported local methods.' },
    { q: 'How do I cancel an order?', a: 'Open the order, click Cancel and choose a reason. Refund handling depends on the order status.' },
    { q: 'How much does FIVESOM charge?', a: 'A small platform fee is shown clearly before checkout and at withdrawal time.' },
    { q: 'How do I get the blue verified tick?', a: 'Submit your ID and portfolio from the Verify page. Admins review and approve qualified freelancers.' },
  ],
  so: [
    { q: 'Sidee lacag u helaa freelancer ahaan?', a: 'Marka macmiilku oggolaado delivery-gaaga, lacagta waxay galaysaa wallet-ka FIVESOM. Markaas waad ka saari kartaa local methods.' },
    { q: 'Sidee order u cancel gareeyaa?', a: 'Fur order-ka, riix Cancel oo dooro sabab. Refund-ka wuxuu ku xiran yahay xaaladda order-ka.' },
    { q: 'Immisa fee ayuu FIVESOM qaadaa?', a: 'Platform fee yar oo cad ayaa lagu muujiyaa hortii checkout iyo withdrawal.' },
    { q: 'Sidee tick-ga buluug ee xaqiijinta loo helaa?', a: 'Ka soo gudbi ID iyo portfolio bogga Verify. Admin wuu eegaa oo oggolaadaa.' },
  ],
  ar: [
    { q: 'كيف أتقاضى كمستقل؟', a: 'بعد قبول التسليم تُحوَّل الأموال إلى محفظتك ثم يمكنك السحب.' },
    { q: 'كيف ألغي طلبًا؟', a: 'افتح الطلب واضغط إلغاء واختر سببًا.' },
    { q: 'ما رسوم FIVESOM؟', a: 'رسوم منصة بسيطة تظهر بوضوح.' },
    { q: 'كيف أحصل على التوثيق؟', a: 'أرسل هويتك وأعمالك للمراجعة.' },
  ],
  fr: [
    { q: 'Comment être payé ?', a: 'Une fois la livraison acceptée, les fonds vont dans votre portefeuille puis retrait.' },
    { q: 'Comment annuler une commande ?', a: 'Ouvrez la commande, cliquez Annuler.' },
    { q: 'Quels sont les frais ?', a: 'Frais clairs avant paiement.' },
    { q: 'Comment obtenir le badge vérifié ?', a: 'Soumettez ID et portfolio.' },
  ],
};

const UI_LABELS: Record<Lang, { onPage: string; tableOfContents: string; faqHeading: string; learnMore: string; backToTop: string; language: string }> = {
  en: { onPage: 'On this page', tableOfContents: 'Documentation', faqHeading: 'Common Questions', learnMore: 'Learn more', backToTop: 'Back to top', language: 'Language' },
  so: { onPage: 'Bogga kan', tableOfContents: 'Dukumentiyada', faqHeading: 'Su\'aalaha Caadiga ah', learnMore: 'Wax dheeri ah baro', backToTop: 'Ku noqo dusha', language: 'Luuqada' },
  ar: { onPage: 'في هذه الصفحة', tableOfContents: 'التوثيق', faqHeading: 'أسئلة شائعة', learnMore: 'اعرف المزيد', backToTop: 'إلى الأعلى', language: 'اللغة' },
  fr: { onPage: 'Sur cette page', tableOfContents: 'Documentation', faqHeading: 'Questions fréquentes', learnMore: 'En savoir plus', backToTop: 'Retour en haut', language: 'Langue' },
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

  // Smooth scroll on hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [location.hash]);

  // Active section observer
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
      <Navbar />

      {/* Top docs bar with language switcher */}
      <div className="border-b border-border bg-muted/30">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span>{currentLangOpt.flag}</span>
                <span className="hidden sm:inline">{currentLangOpt.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANG_OPTIONS.map(opt => (
                <DropdownMenuItem key={opt.code} onClick={() => setLang(opt.code)}>
                  <span className="mr-2">{opt.flag}</span> {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1">
        <div className="flex gap-8">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-64 shrink-0 py-8">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
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
          <main className="flex-1 min-w-0 py-8 max-w-3xl">
            <header className="mb-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                FIVESOM Docs
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {lang === 'so' ? 'Hagaha Buuxa ee FIVESOM' :
                 lang === 'ar' ? 'الدليل الكامل لـ FIVESOM' :
                 lang === 'fr' ? 'Guide complet FIVESOM' :
                 'The Complete FIVESOM Guide'}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                {lang === 'so' ? 'Wax kasta oo aad u baahan tahay si aad u isticmaasho FIVESOM A illaa Z.' :
                 lang === 'ar' ? 'كل ما تحتاج معرفته من الألف إلى الياء.' :
                 lang === 'fr' ? 'Tout ce qu\'il faut savoir, de A à Z.' :
                 'Everything you need to use FIVESOM from A to Z.'}
              </p>
            </header>

            <div className="space-y-16">
              {SECTIONS.map((s) => {
                const t = s.t[lang];
                const Icon = s.icon;
                return (
                  <section key={s.id} id={s.id} className="scroll-mt-24">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t.title}</h2>
                    </div>
                    <p className="text-muted-foreground text-base mb-5 leading-relaxed">{t.intro}</p>

                    <div className="rounded-xl overflow-hidden border border-border mb-6 bg-muted">
                      <img
                        src={s.image}
                        alt={t.title}
                        loading="lazy"
                        width={1280}
                        height={720}
                        className="w-full h-auto object-cover"
                      />
                    </div>

                    <Card className="border-border bg-card mb-4">
                      <CardContent className="p-5">
                        <p className="text-sm font-semibold text-foreground mb-3">
                          {lang === 'so' ? 'Tallaabooyinka' : lang === 'ar' ? 'الخطوات' : lang === 'fr' ? 'Étapes' : 'Steps'}
                        </p>
                        <ol className="space-y-2">
                          {t.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-sm text-foreground">
                              <span className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">{i + 1}</span>
                              <span className="text-muted-foreground pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>

                    {t.note && (
                      <div className="border-l-4 border-primary bg-primary/5 px-4 py-3 rounded-r mb-4">
                        <p className="text-sm text-foreground">{t.note}</p>
                      </div>
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

              {/* FAQ accordion */}
              <section className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-foreground mb-4">{ui.faqHeading}</h2>
                <Accordion type="single" collapsible className="border border-border rounded-xl bg-card">
                  {FAQ_ITEMS[lang].map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="px-4">
                      <AccordionTrigger className="text-left text-foreground">{item.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              <div className="text-center pt-6">
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
