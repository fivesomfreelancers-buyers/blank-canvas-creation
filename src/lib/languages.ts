export type LanguageOption = {
  name: string;
  flag: string;
};

// Canonical English names for commonly spoken ISO 639 languages. Flags are
// representative regional markers and are presentation-only; the stable name
// is what is persisted in profiles.languages and can later be filtered.
export const WORLD_LANGUAGES: LanguageOption[] = [
  { name: 'Afrikaans', flag: '🇿🇦' }, { name: 'Albanian', flag: '🇦🇱' },
  { name: 'Amharic', flag: '🇪🇹' }, { name: 'Arabic', flag: '🇸🇦' },
  { name: 'Armenian', flag: '🇦🇲' }, { name: 'Azerbaijani', flag: '🇦🇿' },
  { name: 'Basque', flag: '🇪🇸' }, { name: 'Belarusian', flag: '🇧🇾' },
  { name: 'Bengali', flag: '🇧🇩' }, { name: 'Bosnian', flag: '🇧🇦' },
  { name: 'Bulgarian', flag: '🇧🇬' }, { name: 'Burmese', flag: '🇲🇲' },
  { name: 'Catalan', flag: '🇪🇸' }, { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Croatian', flag: '🇭🇷' }, { name: 'Czech', flag: '🇨🇿' },
  { name: 'Danish', flag: '🇩🇰' }, { name: 'Dutch', flag: '🇳🇱' },
  { name: 'English', flag: '🇬🇧' }, { name: 'Estonian', flag: '🇪🇪' },
  { name: 'Filipino', flag: '🇵🇭' }, { name: 'Finnish', flag: '🇫🇮' },
  { name: 'French', flag: '🇫🇷' }, { name: 'Galician', flag: '🇪🇸' },
  { name: 'Georgian', flag: '🇬🇪' }, { name: 'German', flag: '🇩🇪' },
  { name: 'Greek', flag: '🇬🇷' }, { name: 'Gujarati', flag: '🇮🇳' },
  { name: 'Haitian Creole', flag: '🇭🇹' }, { name: 'Hausa', flag: '🇳🇬' },
  { name: 'Hebrew', flag: '🇮🇱' }, { name: 'Hindi', flag: '🇮🇳' },
  { name: 'Hungarian', flag: '🇭🇺' }, { name: 'Icelandic', flag: '🇮🇸' },
  { name: 'Igbo', flag: '🇳🇬' }, { name: 'Indonesian', flag: '🇮🇩' },
  { name: 'Irish', flag: '🇮🇪' }, { name: 'Italian', flag: '🇮🇹' },
  { name: 'Japanese', flag: '🇯🇵' }, { name: 'Javanese', flag: '🇮🇩' },
  { name: 'Kannada', flag: '🇮🇳' }, { name: 'Kazakh', flag: '🇰🇿' },
  { name: 'Khmer', flag: '🇰🇭' }, { name: 'Kinyarwanda', flag: '🇷🇼' },
  { name: 'Korean', flag: '🇰🇷' }, { name: 'Kurdish', flag: '🌍' },
  { name: 'Kyrgyz', flag: '🇰🇬' }, { name: 'Lao', flag: '🇱🇦' },
  { name: 'Latvian', flag: '🇱🇻' }, { name: 'Lithuanian', flag: '🇱🇹' },
  { name: 'Macedonian', flag: '🇲🇰' }, { name: 'Malay', flag: '🇲🇾' },
  { name: 'Malayalam', flag: '🇮🇳' }, { name: 'Maltese', flag: '🇲🇹' },
  { name: 'Marathi', flag: '🇮🇳' }, { name: 'Mongolian', flag: '🇲🇳' },
  { name: 'Nepali', flag: '🇳🇵' }, { name: 'Norwegian', flag: '🇳🇴' },
  { name: 'Oromo', flag: '🇪🇹' }, { name: 'Pashto', flag: '🇦🇫' },
  { name: 'Persian', flag: '🇮🇷' }, { name: 'Polish', flag: '🇵🇱' },
  { name: 'Portuguese', flag: '🇵🇹' }, { name: 'Punjabi', flag: '🇵🇰' },
  { name: 'Romanian', flag: '🇷🇴' }, { name: 'Russian', flag: '🇷🇺' },
  { name: 'Serbian', flag: '🇷🇸' }, { name: 'Shona', flag: '🇿🇼' },
  { name: 'Sinhala', flag: '🇱🇰' }, { name: 'Slovak', flag: '🇸🇰' },
  { name: 'Slovenian', flag: '🇸🇮' }, { name: 'Somali', flag: '🇸🇴' },
  { name: 'Spanish', flag: '🇪🇸' }, { name: 'Swahili', flag: '🇰🇪' },
  { name: 'Swedish', flag: '🇸🇪' }, { name: 'Tamil', flag: '🇮🇳' },
  { name: 'Telugu', flag: '🇮🇳' }, { name: 'Thai', flag: '🇹🇭' },
  { name: 'Tigrinya', flag: '🇪🇷' }, { name: 'Turkish', flag: '🇹🇷' },
  { name: 'Ukrainian', flag: '🇺🇦' }, { name: 'Urdu', flag: '🇵🇰' },
  { name: 'Uzbek', flag: '🇺🇿' }, { name: 'Vietnamese', flag: '🇻🇳' },
  { name: 'Welsh', flag: '🏴' }, { name: 'Xhosa', flag: '🇿🇦' },
  { name: 'Yoruba', flag: '🇳🇬' }, { name: 'Zulu', flag: '🇿🇦' },
];

export const languageFlag = (name: string) =>
  WORLD_LANGUAGES.find((language) => language.name === name)?.flag ?? '🌐';