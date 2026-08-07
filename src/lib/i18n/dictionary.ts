import { LangCode } from './LanguageContext';

// Site-wide phrase dictionary. Keys are the exact English strings rendered in the UI.
// Any phrase not listed here stays in English.
type Entry = Partial<Record<Exclude<LangCode, 'en'>, string>>;

export const PHRASES: Record<string, Entry> = {
  // ---------- Navigation ----------
  'Home': { so: 'Bogga Hore', fr: 'Accueil', am: 'መነሻ', ar: 'الرئيسية' },
  'Explore': { so: 'Sahamin', fr: 'Explorer', am: 'ያስሱ', ar: 'استكشف' },
  'How It Works': { so: 'Sida Loo Shaqeeyo', fr: 'Comment ça marche', am: 'እንዴት ይሠራል', ar: 'كيف يعمل' },
  'Sign In': { so: 'Gal', fr: 'Se connecter', am: 'ግባ', ar: 'تسجيل الدخول' },
  'Sign Up': { so: 'Isdiiwaangeli', fr: "S'inscrire", am: 'ይመዝገቡ', ar: 'إنشاء حساب' },
  'Join': { so: 'Ku Biir', fr: 'Rejoindre', am: 'ይቀላቀሉ', ar: 'انضم' },
  'Logout': { so: 'Ka Bax', fr: 'Déconnexion', am: 'ውጣ', ar: 'تسجيل الخروج' },
  'Log Out': { so: 'Ka Bax', fr: 'Déconnexion', am: 'ውጣ', ar: 'تسجيل الخروج' },
  'Dashboard': { so: 'Dashboard-ka', fr: 'Tableau de bord', am: 'ዳሽቦርድ', ar: 'لوحة التحكم' },
  'My Profile': { so: 'Profile-kayga', fr: 'Mon profil', am: 'መገለጫዬ', ar: 'ملفي الشخصي' },
  'Profile': { so: 'Profile', fr: 'Profil', am: 'መገለጫ', ar: 'الملف الشخصي' },
  'Settings': { so: 'Habaynta', fr: 'Paramètres', am: 'ቅንብሮች', ar: 'الإعدادات' },
  'Messages': { so: 'Fariimaha', fr: 'Messages', am: 'መልዕክቶች', ar: 'الرسائل' },
  'Toggle Theme': { so: 'Beddel Muuqaalka', fr: 'Changer le thème', am: 'ገጽታ ቀይር', ar: 'تغيير المظهر' },
  'Admin': { so: 'Maamule', fr: 'Admin', am: 'አስተዳዳሪ', ar: 'المشرف' },
  'Admin Panel': { so: 'Bogga Maamulka', fr: 'Panneau admin', am: 'የአስተዳዳሪ ፓነል', ar: 'لوحة المشرف' },
  'Explore Services': { so: 'Sahami Adeegyada', fr: 'Explorer les services', am: ' አገልግሎቶችን ያስሱ', ar: 'استكشف الخدمات' },
  'Become a Buyer': { so: 'Noqo Iibsade', fr: 'Devenir acheteur', am: 'ገዢ ይሁኑ', ar: 'كن مشتريًا' },
  'Become a Freelancer': { so: 'Noqo Freelancer', fr: 'Devenir freelance', am: 'ፍሪላንሰር ይሁኑ', ar: 'كن مستقلاً' },
  'Member': { so: 'Xubin', fr: 'Membre', am: 'አባል', ar: 'عضو' },
  'Language': { so: 'Luqad', fr: 'Langue', am: 'ቋንቋ', ar: 'اللغة' },

  // ---------- Home / marketing ----------
  'Get Started': { so: 'Bilow', fr: 'Commencer', am: 'ይጀምሩ', ar: 'ابدأ الآن' },
  'Learn More': { so: 'Wax Badan Ogow', fr: 'En savoir plus', am: 'ተጨማሪ ይወቁ', ar: 'اعرف المزيد' },
  'Browse Services': { so: 'Fiiri Adeegyada', fr: 'Parcourir les services', am: ' አገልግሎቶችን ይመልከቱ', ar: 'تصفح الخدمات' },
  'Featured Categories': { so: 'Qaybaha Muhiimka ah', fr: 'Catégories en vedette', am: 'ተመራጭ ምድቦች', ar: 'الفئات المميزة' },
  'Popular Services': { so: 'Adeegyada Caanka ah', fr: 'Services populaires', am: 'ታዋቂ አገልግሎቶች', ar: 'الخدمات الشائعة' },
  'Top Freelancers': { so: 'Freelancers-ka Ugu Fiican', fr: 'Meilleurs freelances', am: 'ከፍተኛ ፍሪላንሰሮች', ar: 'أفضل المستقلين' },
  'Weekly Winners': { so: 'Guulaystayaasha Toddobaadka', fr: 'Gagnants de la semaine', am: 'የሳምንቱ አሸናፊዎች', ar: 'فائزو الأسبوع' },
  'Featured Sellers': { so: 'Iibiyeyaasha Muhiimka ah', fr: 'Vendeurs en vedette', am: 'ተመራጭ ሻጮች', ar: 'البائعون المميزون' },
  'Verified Seller': { so: 'Iibiye Xaqiijisan', fr: 'Vendeur vérifié', am: 'የተረጋገጠ ሻጭ', ar: 'بائع موثّق' },
  'Coming Soon': { so: 'Dhawaan', fr: 'Bientôt disponible', am: 'በቅርቡ', ar: 'قريبًا' },
  'VIP Membership': { so: 'Xubinnimada VIP', fr: 'Adhésion VIP', am: 'የVIP አባልነት', ar: 'عضوية VIP' },
  'Search': { so: 'Raadi', fr: 'Rechercher', am: 'ፍለጋ', ar: 'بحث' },
  'Search services...': { so: 'Raadi adeegyada...', fr: 'Rechercher des services...', am: 'አገልግሎቶችን ፈልግ...', ar: 'ابحث عن خدمات...' },
  'All Categories': { so: 'Dhammaan Qaybaha', fr: 'Toutes les catégories', am: 'ሁሉም ምድቦች', ar: 'كل الفئات' },
  'Categories': { so: 'Qaybaha', fr: 'Catégories', am: 'ምድቦች', ar: 'الفئات' },

  // ---------- Common actions ----------
  'Save': { so: 'Kaydi', fr: 'Enregistrer', am: 'አስቀምጥ', ar: 'حفظ' },
  'Save Changes': { so: 'Kaydi Isbeddellada', fr: 'Enregistrer les modifications', am: 'ለውጦችን አስቀምጥ', ar: 'حفظ التغييرات' },
  'Cancel': { so: 'Jooji', fr: 'Annuler', am: 'ሰርዝ', ar: 'إلغاء' },
  'Delete': { so: 'Tirtir', fr: 'Supprimer', am: 'ሰርዝ', ar: 'حذف' },
  'Edit': { so: 'Wax ka beddel', fr: 'Modifier', am: 'አስተካክል', ar: 'تعديل' },
  'Update': { so: 'Cusbooneysii', fr: 'Mettre à jour', am: 'አዘምን', ar: 'تحديث' },
  'Submit': { so: 'Gudbi', fr: 'Envoyer', am: 'አስገባ', ar: 'إرسال' },
  'Send': { so: 'Dir', fr: 'Envoyer', am: 'ላክ', ar: 'إرسال' },
  'Send Message': { so: 'Dir Fariin', fr: 'Envoyer un message', am: 'መልዕክት ላክ', ar: 'إرسال رسالة' },
  'Continue': { so: 'Sii wad', fr: 'Continuer', am: 'ቀጥል', ar: 'متابعة' },
  'Back': { so: 'Dib u noqo', fr: 'Retour', am: 'ተመለስ', ar: 'رجوع' },
  'Next': { so: 'Xiga', fr: 'Suivant', am: 'ቀጣይ', ar: 'التالي' },
  'Previous': { so: 'Hore', fr: 'Précédent', am: 'ቀዳሚ', ar: 'السابق' },
  'Close': { so: 'Xir', fr: 'Fermer', am: 'ዝጋ', ar: 'إغلاق' },
  'Upload': { so: 'Soo Geli', fr: 'Téléverser', am: 'ጫን', ar: 'تحميل' },
  'Download': { so: 'Soo Dejiso', fr: 'Télécharger', am: 'አውርድ', ar: 'تنزيل' },
  'Loading...': { so: 'Waa la soo dejinayaa...', fr: 'Chargement...', am: 'በመጫን ላይ...', ar: 'جارٍ التحميل...' },
  'Saving...': { so: 'Waa la kaydinayaa...', fr: 'Enregistrement...', am: 'በማስቀመጥ ላይ...', ar: 'جارٍ الحفظ...' },
  'View Details': { so: 'Arag Faahfaahinta', fr: 'Voir les détails', am: 'ዝርዝሮችን ይመልከቱ', ar: 'عرض التفاصيل' },
  'View All': { so: 'Arag Dhammaan', fr: 'Voir tout', am: 'ሁሉንም ይመልከቱ', ar: 'عرض الكل' },
  'Confirm': { so: 'Xaqiiji', fr: 'Confirmer', am: 'አረጋግጥ', ar: 'تأكيد' },
  'Apply': { so: 'Codso', fr: 'Appliquer', am: 'ተግብር', ar: 'تطبيق' },

  // ---------- Auth ----------
  'Email': { so: 'Email', fr: 'E-mail', am: 'ኢሜይል', ar: 'البريد الإلكتروني' },
  'Email Address': { so: 'Cinwaanka Email-ka', fr: 'Adresse e-mail', am: 'የኢሜይል አድራሻ', ar: 'عنوان البريد الإلكتروني' },
  'Password': { so: 'Furaha Sirta', fr: 'Mot de passe', am: 'የይለፍ ቃል', ar: 'كلمة المرور' },
  'New Password': { so: 'Furaha Cusub', fr: 'Nouveau mot de passe', am: 'አዲስ የይለፍ ቃል', ar: 'كلمة مرور جديدة' },
  'Confirm New Password': { so: 'Xaqiiji Furaha Cusub', fr: 'Confirmer le nouveau mot de passe', am: 'አዲሱን የይለፍ ቃል አረጋግጥ', ar: 'تأكيد كلمة المرور الجديدة' },
  'Forgot Password?': { so: 'Furaha ma illowday?', fr: 'Mot de passe oublié ?', am: 'የይለፍ ቃል ረሱ?', ar: 'نسيت كلمة المرور؟' },
  'Update Password': { so: 'Cusbooneysii Furaha', fr: 'Mettre à jour le mot de passe', am: 'የይለፍ ቃል አዘምን', ar: 'تحديث كلمة المرور' },
  'Continue with Google': { so: 'Ku sii wad Google', fr: 'Continuer avec Google', am: 'በGoogle ይቀጥሉ', ar: 'المتابعة باستخدام Google' },
  'Full Name': { so: 'Magaca oo Buuxa', fr: 'Nom complet', am: 'ሙሉ ስም', ar: 'الاسم الكامل' },
  'Username': { so: 'Magaca Isticmaalaha', fr: "Nom d'utilisateur", am: 'የተጠቃሚ ስም', ar: 'اسم المستخدم' },
  'Location': { so: 'Goobta', fr: 'Localisation', am: 'አድራሻ', ar: 'الموقع' },
  'Bio': { so: 'Bio', fr: 'Bio', am: 'መግለጫ', ar: 'نبذة' },

  // ---------- Orders / gigs ----------
  'My Orders': { so: 'Dalabkayga', fr: 'Mes commandes', am: 'ትዕዛዞቼ', ar: 'طلباتي' },
  'Orders': { so: 'Dalabyada', fr: 'Commandes', am: 'ትዕዛዞች', ar: 'الطلبات' },
  'My Gigs': { so: 'Gigs-kayga', fr: 'Mes services', am: 'የእኔ ስራዎች', ar: 'خدماتي' },
  'Gigs': { so: 'Gigs', fr: 'Services', am: 'ስራዎች', ar: 'الخدمات' },
  'Create Gig': { so: 'Samee Gig', fr: 'Créer un service', am: 'ስራ ፍጠር', ar: 'إنشاء خدمة' },
  'Order Now': { so: 'Dalbo Hadda', fr: 'Commander', am: 'አሁን ይዘዙ', ar: 'اطلب الآن' },
  'Continue to Payment': { so: 'U sii gudub Lacag-bixinta', fr: 'Passer au paiement', am: 'ወደ ክፍያ ይቀጥሉ', ar: 'المتابعة إلى الدفع' },
  'Payment': { so: 'Lacag-bixin', fr: 'Paiement', am: 'ክፍያ', ar: 'الدفع' },
  'Pending': { so: 'Sugaya', fr: 'En attente', am: 'በመጠባበቅ', ar: 'قيد الانتظار' },
  'In Progress': { so: 'Socda', fr: 'En cours', am: 'በሂደት ላይ', ar: 'قيد التنفيذ' },
  'Delivered': { so: 'La gaarsiiyay', fr: 'Livré', am: 'ተላልፏል', ar: 'تم التسليم' },
  'Completed': { so: 'La dhammeeyay', fr: 'Terminé', am: 'ተጠናቋል', ar: 'مكتمل' },
  'Cancelled': { so: 'La joojiyay', fr: 'Annulé', am: 'ተሰርዟል', ar: 'ملغى' },
  'Active': { so: 'Firfircoon', fr: 'Actif', am: 'ገቢር', ar: 'نشط' },
  'Deliver Work': { so: 'Gudbi Shaqada', fr: 'Livrer le travail', am: 'ስራ አስረክብ', ar: 'تسليم العمل' },
  'Delivery': { so: 'Gaarsiin', fr: 'Livraison', am: 'አቅርቦት', ar: 'التسليم' },
  'Reviews': { so: 'Faallooyinka', fr: 'Avis', am: 'ግምገማዎች', ar: 'التقييمات' },
  'Leave a Review': { so: 'Ka Tag Faallo', fr: 'Laisser un avis', am: 'ግምገማ ይተዉ', ar: 'اترك تقييمًا' },
  'Wallet': { so: 'Wallet-ka', fr: 'Portefeuille', am: 'ቦርሳ', ar: 'المحفظة' },
  'Available Balance': { so: 'Haraaga La Heli Karo', fr: 'Solde disponible', am: 'ያለ ቀሪ ሂሳብ', ar: 'الرصيد المتاح' },
  'Withdraw': { so: 'La Bixi', fr: 'Retirer', am: 'ያውጡ', ar: 'سحب' },
  'Earnings': { so: 'Dakhliga', fr: 'Revenus', am: 'ገቢ', ar: 'الأرباح' },
  'Total Earnings': { so: 'Wadarta Dakhliga', fr: 'Revenus totaux', am: 'ጠቅላላ ገቢ', ar: 'إجمالي الأرباح' },

  // ---------- Support ----------
  'Help Center': { so: 'Xarunta Caawimaada', fr: "Centre d'aide", am: 'የእገዛ ማዕከል', ar: 'مركز المساعدة' },
  'Contact Support': { so: 'La Xiriir Taageerada', fr: 'Contacter le support', am: 'ድጋፍን ያግኙ', ar: 'اتصل بالدعم' },
  'Support': { so: 'Taageero', fr: 'Support', am: 'ድጋፍ', ar: 'الدعم' },
  'Subject': { so: 'Mawduuca', fr: 'Objet', am: 'ጉዳይ', ar: 'الموضوع' },
  'Message': { so: 'Fariinta', fr: 'Message', am: 'መልዕክት', ar: 'الرسالة' },
  'News': { so: 'Wararka', fr: 'Actualités', am: 'ዜና', ar: 'الأخبار' },
  'Terms of Service': { so: 'Shuruudaha Adeegga', fr: "Conditions d'utilisation", am: 'የአገልግሎት ውሎች', ar: 'شروط الخدمة' },
  'Privacy Policy': { so: 'Siyaasadda Asturnaanta', fr: 'Politique de confidentialité', am: 'የግላዊነት መመሪያ', ar: 'سياسة الخصوصية' },
  'About': { so: 'Ku Saabsan', fr: 'À propos', am: 'ስለ እኛ', ar: 'حول' },
  'Contact': { so: 'Xiriir', fr: 'Contact', am: 'አግኙን', ar: 'اتصل بنا' },
  'Blog': { so: 'Blog', fr: 'Blog', am: 'ብሎግ', ar: 'المدونة' },
  'FAQ': { so: 'Su\'aalaha Badanaa La Weydiiyo', fr: 'FAQ', am: 'ተደጋጋሚ ጥያቄዎች', ar: 'الأسئلة الشائعة' },
  'Notifications': { so: 'Ogeysiisyada', fr: 'Notifications', am: 'ማሳወቂያዎች', ar: 'الإشعارات' },
  'Security': { so: 'Amniga', fr: 'Sécurité', am: 'ደህንነት', ar: 'الأمان' },
  'Billing': { so: 'Biilasha', fr: 'Facturation', am: 'ክፍያ', ar: 'الفواتير' },
  'Verify Your Account': { so: 'Xaqiiji Akoonkaaga', fr: 'Vérifiez votre compte', am: 'መለያዎን ያረጋግጡ', ar: 'وثّق حسابك' },
  'Verification': { so: 'Xaqiijin', fr: 'Vérification', am: 'ማረጋገጫ', ar: 'التحقق' },
};

export function translatePhrase(text: string, lang: LangCode): string | null {
  if (lang === 'en') return null;
  const raw = text.trim();
  if (!raw) return null;
  const entry = PHRASES[raw];
  const value = entry?.[lang as Exclude<LangCode, 'en'>];
  return value ?? null;
}
