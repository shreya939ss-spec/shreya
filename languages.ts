export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'or' | 'pa' | 'as';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Assamese' },
];
