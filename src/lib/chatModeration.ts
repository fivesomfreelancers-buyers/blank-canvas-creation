// Fivesom Chat Moderation
// - Somali/English/Arabic profanity filter with leet-speak normalization
// - NSFW keyword filter for text
// - NSFW image classification (nsfwjs, lazy-loaded)
// - Per-user strike tracking via localStorage

export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: 'nsfw' | 'profanity'; message: string };

// ---------- Normalization ----------
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '!': 'i', '|': 'i',
  '3': 'e', '4': 'a', '@': 'a',
  '5': 's', '$': 's', '7': 't',
  '8': 'b', '9': 'g',
  '+': 't', '*': '', '.': '', ',': '',
  '_': '', '-': '', ' ': '',
};

function normalize(text: string): string {
  const lower = text.toLowerCase();
  let out = '';
  for (const ch of lower) out += LEET_MAP[ch] ?? ch;
  // Collapse repeated letters (sharrrmuto -> sharmuto)
  out = out.replace(/(.)\1{2,}/g, '$1$1');
  return out.replace(/[^a-z\u0600-\u06ff]/g, '');
}

// ---------- Word lists ----------
// Somali profanity / sexual / insults (comprehensive)
const SOMALI_BAD: string[] = [
  'hoyada', 'hooyada', 'hoyadaa', 'hooyadaa', 'hoyadeen', 'hooyadeen',
  'aabaha', 'aabahaa', 'aabo waas',
  'was', 'waas', 'waasay', 'waasaa', 'wasay', 'kuwaso', 'kuwas', 'kawas',
  'siil', 'siilka', 'siilkeeda', 'siilkaaga', 'siilo',
  'guus', 'guuska', 'guuskaaga',
  'kintir', 'kintirka',
  'naaso', 'naasaha',
  'sug', 'suga', 'sugaa',
  'dhilo', 'dhillo', 'dhiloyahay', 'dhilooyin', 'dhilooyinka',
  'sharmuto', 'sharmuuto', 'sharmuutada', 'sharmuutooyin',
  'qhaba', 'qaba siil', 'qabsii',
  'garac', 'garaca', 'garacyahay',
  'naayaa', 'naaya', 'nayaa',
  'doqon', 'doqonyahay', 'doqonimo',
  'eey', 'eydii', 'ey yahay',
  'dameer', 'dameeryahay', 'dameeryahow',
  'bahal', 'bahalyahay',
  'gus', 'guska',
  'futo', 'futada', 'futadaada',
  'kac', 'kacsan', 'kacsi',
  'orgi', 'orgiga',
  'nijaas', 'nijaasyahay',
  'xayawaan', 'xayawaanyahay',
  'sakaraat',
  'khaniis', 'khaniisyahay', 'khanis',
  'lawaasay', 'iskuwaas', 'iswaas',
  'jinni',
  'gaal', 'gaalyahay',
  'shaydaan', 'shaydaanyahay',
  'islaan xun', 'ninka xun',
  'qashin', 'qashinyahay',
  'nacas', 'nacasyahay', 'nacasnimo',
  'waalan', 'waalyahay',
  'foolxun',
  'ceebley',
  'buuq',
  'godob',
  'af xumo',
];

// English profanity + sexual
const ENGLISH_BAD: string[] = [
  'fuck', 'fucking', 'fucker', 'motherfucker', 'mf', 'stfu',
  'shit', 'bullshit', 'bitch', 'bitches', 'asshole', 'ass',
  'dick', 'dickhead', 'cock', 'cocksucker', 'pussy', 'cunt',
  'whore', 'slut', 'slag', 'hoe', 'hooker',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded',
  'bastard', 'damn', 'dammit', 'goddamn',
  'porn', 'porno', 'pornography', 'xxx', 'nsfw',
  'nude', 'nudes', 'naked', 'sex', 'sexy', 'sexting',
  'penis', 'vagina', 'boobs', 'tits', 'titties', 'nipple',
  'blowjob', 'handjob', 'anal', 'orgasm', 'cum', 'jizz',
  'masturbate', 'masturbation', 'fetish', 'horny',
  'rape', 'rapist', 'molest', 'pedo', 'pedophile',
  'kill you', 'killyou', 'i will kill', 'iwillkill',
];

// Arabic profanity
const ARABIC_BAD: string[] = [
  'كس', 'كسمك', 'كسختك', 'كسامك',
  'زب', 'زبي', 'زبك',
  'شرموطة', 'شرموط', 'قحبة', 'قحبه',
  'عرص', 'عرصات',
  'خول', 'خولات',
  'منيك', 'منيوك', 'منياك',
  'طيز', 'طيزك',
  'نيك', 'نياك',
  'كافر', 'ملحد',
  'حمار', 'كلب', 'كلبة',
];

const NSFW_KEYWORDS = [
  ...ENGLISH_BAD.filter(w => /porn|nude|naked|sex|xxx|nsfw|penis|vagina|boobs|tits|nipple|blowjob|handjob|anal|orgasm|masturbate|fetish|horny|rape|pedo/.test(w)),
  'onlyfans', 'camgirl', 'escort', 'sexchat',
];

const ALL_BAD_NORMALIZED = new Set(
  [...SOMALI_BAD, ...ENGLISH_BAD].map(w => normalize(w)).filter(Boolean)
);

const ARABIC_BAD_SET = new Set(ARABIC_BAD.map(w => w.trim()));

// ---------- Text check ----------
export function moderateText(text: string): ModerationResult {
  const trimmed = text.trim();
  if (!trimmed) return { allowed: true };

  // Arabic direct substring check (no leet normalization needed)
  for (const w of ARABIC_BAD_SET) {
    if (trimmed.includes(w)) {
      return {
        allowed: false,
        reason: 'profanity',
        message: 'Your message contains language that is not allowed on Fivesom. Please edit your message and try again.',
      };
    }
  }

  const norm = normalize(trimmed);

  // NSFW keywords (stronger message)
  for (const kw of NSFW_KEYWORDS) {
    const n = normalize(kw);
    if (n && norm.includes(n)) {
      return {
        allowed: false,
        reason: 'nsfw',
        message: 'This content violates Fivesom Community Guidelines. Nude or sexually explicit content is not allowed.',
      };
    }
  }

  // Profanity: split into tokens AND substring check
  for (const bad of ALL_BAD_NORMALIZED) {
    if (bad.length < 3) continue;
    if (norm.includes(bad)) {
      return {
        allowed: false,
        reason: 'profanity',
        message: 'Your message contains language that is not allowed on Fivesom. Please edit your message and try again.',
      };
    }
  }

  return { allowed: true };
}

// ---------- Image check (NSFW) ----------
let nsfwModelPromise: Promise<any> | null = null;

async function loadNsfwModel() {
  if (!nsfwModelPromise) {
    nsfwModelPromise = (async () => {
      const [tf, nsfwjs] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('nsfwjs'),
      ]);
      await tf.ready();
      return nsfwjs.load();
    })().catch((e) => {
      nsfwModelPromise = null;
      throw e;
    });
  }
  return nsfwModelPromise;
}

export async function moderateImageFile(file: File): Promise<ModerationResult> {
  // Filename keyword pre-check
  const nameCheck = moderateText(file.name);
  if (!nameCheck.allowed) return nameCheck;

  if (!file.type.startsWith('image/')) return { allowed: true };
  // Skip GIF/SVG (model doesn't handle animated / vector reliably; allow)
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return { allowed: true };

  try {
    const model = await loadNsfwModel();
    const img = await fileToImage(file);
    const predictions: Array<{ className: string; probability: number }> = await model.classify(img);
    URL.revokeObjectURL(img.src);

    const scoreOf = (name: string) =>
      predictions.find(p => p.className === name)?.probability ?? 0;

    const porn = scoreOf('Porn');
    const hentai = scoreOf('Hentai');
    const sexy = scoreOf('Sexy');

    if (porn > 0.5 || hentai > 0.5 || sexy > 0.7) {
      return {
        allowed: false,
        reason: 'nsfw',
        message: 'This content violates Fivesom Community Guidelines. Nude or sexually explicit content is not allowed.',
      };
    }
    return { allowed: true };
  } catch (e) {
    console.warn('NSFW model failed, allowing image:', e);
    return { allowed: true };
  }
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ---------- Strike tracking (client-side, per user) ----------
const STRIKE_KEY = (userId: string) => `fivesom_chat_strikes_${userId}`;

export interface StrikeState {
  count: number;
  blockedUntil?: number; // epoch ms
}

export function getStrikes(userId: string): StrikeState {
  try {
    const raw = localStorage.getItem(STRIKE_KEY(userId));
    if (!raw) return { count: 0 };
    return JSON.parse(raw);
  } catch { return { count: 0 }; }
}

export function recordStrike(userId: string): { count: number; blocked: boolean; warning: string } {
  const s = getStrikes(userId);
  s.count = (s.count || 0) + 1;
  let warning = '';
  let blocked = false;

  if (s.count === 1) {
    warning = '⚠️ Warning: This message violates Fivesom Community Guidelines.';
  } else if (s.count === 2) {
    warning = '⚠️ Serious Warning: Repeated violations may result in your chat access being suspended.';
  } else if (s.count === 3) {
    warning = '🚫 Chat temporarily suspended for 30 minutes due to repeated policy violations.';
    s.blockedUntil = Date.now() + 30 * 60 * 1000;
    blocked = true;
  } else {
    warning = '🚫 Your account has been flagged for admin review due to repeated violations.';
    s.blockedUntil = Date.now() + 60 * 60 * 1000;
    blocked = true;
  }

  try { localStorage.setItem(STRIKE_KEY(userId), JSON.stringify(s)); } catch {}
  return { count: s.count, blocked, warning };
}

export function isChatBlocked(userId: string): { blocked: boolean; minutesLeft: number } {
  const s = getStrikes(userId);
  if (!s.blockedUntil) return { blocked: false, minutesLeft: 0 };
  const diff = s.blockedUntil - Date.now();
  if (diff <= 0) return { blocked: false, minutesLeft: 0 };
  return { blocked: true, minutesLeft: Math.ceil(diff / 60000) };
}
