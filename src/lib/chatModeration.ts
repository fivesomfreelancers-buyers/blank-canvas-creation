// Fivesom Chat Moderation
// Goal: block ONLY real abuse (profanity, hate speech, threats, explicit sexual
// content) while letting every normal Somali / English / Arabic / French
// conversation through.
//
// Design rules:
// - Whole-word matching only (plus known suffixes). No substring matching, so
//   "class" never trips "ass" and "this hit" never trips "shit".
// - Leet-speak normalization happens *inside* a token, never across tokens, so
//   spaces are preserved and words are not glued together.
// - Multi-word insults are matched as explicit phrases.
// - Ambiguous everyday words (was, sug, kac, gus, sex, damn, hoe, escort…) are
//   NOT banned on their own; only unambiguous abusive forms are listed.

export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: 'nsfw' | 'profanity'; message: string };

const PROFANITY_MESSAGE =
  'Your message contains language that is not allowed on Fivesom. Please edit your message and try again.';
const NSFW_MESSAGE =
  'This content violates Fivesom Community Guidelines. Nude or sexually explicit content is not allowed.';

// ---------- Normalization (per token) ----------
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '!': 'i', '|': 'i',
  '3': 'e', '4': 'a', '@': 'a',
  '5': 's', '$': 's', '7': 't',
  '8': 'b', '9': 'g', '+': 't',
};

/** Normalize a single word: lowercase, leet -> letters, drop separators, collapse repeats. */
function normalizeToken(token: string): string {
  let out = '';
  for (const ch of token.toLowerCase()) out += LEET_MAP[ch] ?? ch;
  out = out.replace(/[^a-z\u0600-\u06ff]/g, '');
  // sharrrmuto -> sharrmuto -> handled below by repeat collapse
  out = out.replace(/(.)\1{2,}/g, '$1$1');
  return out;
}

/** Split text into normalized tokens, keeping word boundaries intact. */
function tokenize(text: string): string[] {
  return text
    .split(/[^\p{L}\p{N}@!|$+*]+/u)
    .map(normalizeToken)
    .filter(Boolean);
}

// Suffixes that can be attached to a banned root without changing its meaning.
const SUFFIXES = [
  '', 's', 'es', 'ing', 'ed', 'er', 'ers', 'y', 'ies',
  // Somali determiners / vocatives
  'ka', 'ga', 'ta', 'da', 'aha', 'aa', 'ayaa', 'yahay', 'yahow', 'yaha',
  'kaaga', 'kaada', 'kiisa', 'keeda', 'keena', 'kooda', 'deeda', 'daada',
  'nimo', 'yo', 'yin', 'yinka', 'ooyin', 'ooyinka',
];

// ---------- Banned roots (whole word or root+suffix) ----------
// English: unambiguous profanity, slurs and explicit sexual terms only.
const ENGLISH_BAD_ROOTS = [
  'fuck', 'fucker', 'motherfucker', 'fuk', 'fck',
  'shit', 'bullshit', 'bitch', 'asshole', 'arsehole', 'dickhead',
  'cock', 'cocksucker', 'pussy', 'cunt', 'twat', 'wanker',
  'whore', 'slut', 'hooker',
  'nigger', 'nigga', 'faggot', 'faggy', 'retard',
  'bastard', 'stfu',
];

const ENGLISH_NSFW_ROOTS = [
  'porn', 'porno', 'pornography', 'pornhub', 'xxx',
  'nude', 'nudity', 'sexting', 'sexchat', 'cybersex',
  'blowjob', 'handjob', 'rimjob', 'creampie',
  'orgasm', 'masturbate', 'masturbation', 'horny', 'boner',
  'onlyfans', 'camgirl', 'camsex',
  'rape', 'rapist', 'molest', 'molester', 'pedophile', 'paedophile', 'pedo',
];

// Somali: only clearly abusive / sexual words. Everyday words such as
// "was(ay)" alone, "sug", "kac", "gus", "qashin", "buuq", "godob", "gaal"
// are intentionally excluded because they appear in normal conversation.
const SOMALI_BAD_ROOTS = [
  'hooyada', 'hoyada', 'hooyadaa', 'hoyadaa', 'hooyadeen',
  'waasay', 'wasay', 'waastay', 'kuwaso', 'kuwas', 'iswaas', 'iskuwaas', 'lawaasay',
  'siil', 'siilka', 'siilo', 'kintir',
  'guuska', 'guuskaaga', 'gusaaga',
  'dhilo', 'dhillo', 'dhiloyahay',
  'sharmuto', 'sharmuuto', 'sharmuutada',
  'garac', 'naayaa', 'naaya', 'nayaa',
  'doqon', 'nacas', 'dameer', 'bahal', 'xayawaan', 'orgi',
  'futada', 'futo', 'kacsan', 'kacsi',
  'nijaas', 'khaniis', 'khanis',
  'shaydaan', 'foolxun', 'qashinyahay', 'waalan',
];

// Arabic: matched on raw text (word-ish boundaries, Arabic has no leet issues).
const ARABIC_BAD = [
  'كسمك', 'كسختك', 'كسامك',
  'شرموطة', 'شرموط', 'قحبة', 'قحبه',
  'عرص', 'عرصات',
  'منيك', 'منيوك', 'منياك',
  'طيزك', 'نياك',
  'كلبة', 'يا كلب',
];

// French: unambiguous insults only.
const FRENCH_BAD_ROOTS = [
  'putain', 'pute', 'salope', 'connard', 'connasse', 'enculer', 'encule',
  'enfoire', 'batard', 'nique', 'niquer', 'merde',
];

// Multi-word phrases (matched against the normalized token stream).
const BAD_PHRASES: Array<{ words: string[]; nsfw?: boolean }> = [
  { words: ['aabo', 'waas'] },
  { words: ['qaba', 'siil'] },
  { words: ['ey', 'yahay'] },
  { words: ['islaan', 'xun'] },
  { words: ['kill', 'you'] },
  { words: ['i', 'will', 'kill', 'you'] },
  { words: ['send', 'nudes'], nsfw: true },
  { words: ['naked', 'photo'], nsfw: true },
  { words: ['naked', 'pic'], nsfw: true },
  { words: ['naked', 'picture'], nsfw: true },
  { words: ['sexual', 'favor'], nsfw: true },
  { words: ['sexual', 'favour'], nsfw: true },
];

function buildRootSet(roots: string[]): Set<string> {
  const set = new Set<string>();
  for (const root of roots) {
    const n = normalizeToken(root);
    if (n.length >= 3) set.add(n);
  }
  return set;
}

const PROFANITY_ROOTS = buildRootSet([
  ...ENGLISH_BAD_ROOTS,
  ...SOMALI_BAD_ROOTS,
  ...FRENCH_BAD_ROOTS,
]);
const NSFW_ROOTS = buildRootSet(ENGLISH_NSFW_ROOTS);

/** True when a token is the root itself or root + an allowed suffix. */
function matchesRoot(token: string, roots: Set<string>): boolean {
  if (roots.has(token)) return true;
  for (const suffix of SUFFIXES) {
    if (!suffix) continue;
    if (token.length <= suffix.length) continue;
    if (!token.endsWith(suffix)) continue;
    const stem = token.slice(0, token.length - suffix.length);
    if (stem.length >= 4 && roots.has(stem)) return true;
  }
  return false;
}

function hasPhrase(tokens: string[]): { hit: boolean; nsfw: boolean } {
  for (const phrase of BAD_PHRASES) {
    const words = phrase.words.map(normalizeToken);
    for (let i = 0; i + words.length <= tokens.length; i++) {
      if (words.every((w, j) => tokens[i + j] === w)) {
        return { hit: true, nsfw: !!phrase.nsfw };
      }
    }
  }
  return { hit: false, nsfw: false };
}

// ---------- Text check ----------
export function moderateText(text: string): ModerationResult {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return { allowed: true };

  // Arabic: substring check but bounded by non-Arabic characters.
  for (const w of ARABIC_BAD) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    const re = new RegExp(`(^|[^\\u0600-\\u06ff])${escaped}([^\\u0600-\\u06ff]|$)`, 'u');
    if (re.test(trimmed)) {
      return { allowed: false, reason: 'profanity', message: PROFANITY_MESSAGE };
    }
  }

  const tokens = tokenize(trimmed);

  for (const token of tokens) {
    if (matchesRoot(token, NSFW_ROOTS)) {
      return { allowed: false, reason: 'nsfw', message: NSFW_MESSAGE };
    }
  }
  for (const token of tokens) {
    if (matchesRoot(token, PROFANITY_ROOTS)) {
      return { allowed: false, reason: 'profanity', message: PROFANITY_MESSAGE };
    }
  }

  const phrase = hasPhrase(tokens);
  if (phrase.hit) {
    return phrase.nsfw
      ? { allowed: false, reason: 'nsfw', message: NSFW_MESSAGE }
      : { allowed: false, reason: 'profanity', message: PROFANITY_MESSAGE };
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
  const nameCheck = moderateText(file.name.replace(/[._-]+/g, ' '));
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

    if (porn > 0.7 || hentai > 0.7 || sexy > 0.85) {
      return { allowed: false, reason: 'nsfw', message: NSFW_MESSAGE };
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
