import fr from './fr.json';
import en from './en.json';
import es from './es.json';

// On utilise le type de fr.json comme référence
type TranslationKeys = keyof typeof fr;
export type Language = 'fr' | 'en' | 'es';

const translations: Record<Language, Record<TranslationKeys, string>> = {
  fr,
  en,
  es,
};

// Fonction pour récupérer la traduction d'une clé dans la langue donnée
export function t(lang: Language, key: TranslationKeys): string {
  return translations[lang][key];
}
