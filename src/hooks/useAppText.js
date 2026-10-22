import { useTranslation } from 'react-i18next';
import { DICTIONARY } from '../i18n/urduDictionary';

export const useAppText = () => {
  const { i18n } = useTranslation();
  const isUrdu = (i18n.language || 'en').startsWith('ur');

  // Translation function: if Urdu is active and phrase exists in dictionary, return Urdu; else English
  const tText = (englishPhrase) => {
    if (!isUrdu) return englishPhrase;
    return DICTIONARY[englishPhrase] || englishPhrase;
  };

  return { tText, isUrdu, lang: i18n.language };
};