export const LANGUAGE_CODES: Record<string, string> = {
  en: 'English',
  de: 'German',
  ru: 'Russian',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  pl: 'Polish',
  uk: 'Ukrainian',
  be: 'Belarusian',
  cs: 'Czech',
  sk: 'Slovak',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sr: 'Serbian',
  sl: 'Slovenian',
  ro: 'Romanian',
  hu: 'Hungarian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  fi: 'Finnish',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  is: 'Icelandic',
  tr: 'Turkish',
  ar: 'Arabic',
  he: 'Hebrew',
  hy: 'Armenian',
  ka: 'Georgian',
  az: 'Azerbaijani',
  kk: 'Kazakh',
  uz: 'Uzbek',
  tk: 'Turkmen',
  ky: 'Kyrgyz',
  tg: 'Tajik',
  mn: 'Mongolian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  vi: 'Vietnamese',
  th: 'Thai',
  lo: 'Lao',
  km: 'Khmer',
  my: 'Burmese',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Tagalog',
  ne: 'Nepali',
  si: 'Sinhala',
  hi: 'Hindi',
  ur: 'Urdu',
  bn: 'Bengali',
  pa: 'Punjabi',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  mr: 'Marathi',
  gu: 'Gujarati',
  fa: 'Persian',
  ps: 'Pashto',
  sw: 'Swahili',
  am: 'Amharic',
  ha: 'Hausa',
  yo: 'Yoruba',
  zu: 'Zulu',
  af: 'Afrikaans',
};

export function getLanguageName(code: string): string {
  return LANGUAGE_CODES[code.toLowerCase()] || code.toUpperCase();
}

export function isValidLanguageCode(code: string): boolean {
  return code.toLowerCase() in LANGUAGE_CODES;
}

export function normalizeLanguageCode(code: string): string {
  return code.toLowerCase();
}

export function getLanguageDisplayName(
  code: string,
  showCode: boolean = false,
): string {
  const name = getLanguageName(code);
  if (showCode) {
    return `${name} (${code.toUpperCase()})`;
  }
  return name;
}

export const COMMON_LANGUAGE_PAIRS: [string, string][] = [
  ['en', 'de'],
  ['en', 'fr'],
  ['en', 'es'],
  ['en', 'ru'],
  ['en', 'zh'],
  ['de', 'ru'],
  ['de', 'fr'],
  ['fr', 'es'],
];

export function getLanguagePairKey(lang1: string, lang2: string): string {
  return `${normalizeLanguageCode(lang1)}-${normalizeLanguageCode(lang2)}`;
}

export function formatLanguagePair(
  lang1: string,
  lang2: string,
  showNames: boolean = true,
): string {
  if (showNames) {
    return `${getLanguageName(lang1)} → ${getLanguageName(lang2)}`;
  }
  return `${lang1.toUpperCase()} → ${lang2.toUpperCase()}`;
}