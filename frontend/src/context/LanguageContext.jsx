import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, getTranslation } from '../utils/translations';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
];

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('oil_india_lang') || 'en';
  });

  const [voiceLang, setVoiceLangState] = useState(() => {
    return localStorage.getItem('sif_voice_lang') || localStorage.getItem('oil_india_lang') || 'en';
  });

  const setLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLangState(newLang);
      localStorage.setItem('oil_india_lang', newLang);
      setVoiceLangState(newLang);
      localStorage.setItem('sif_voice_lang', newLang);
    }
  };

  const setVoiceLang = (newLang) => {
    setVoiceLangState(newLang);
    localStorage.setItem('sif_voice_lang', newLang);
  };

  const t = (key, fallback = '') => getTranslation(lang, key, fallback);

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, voiceLang, setVoiceLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      setLanguage: () => {},
      voiceLang: 'en',
      setVoiceLang: () => {},
      t: (key, fallback = '') => fallback || key,
      languages: LANGUAGES,
    };
  }
  return context;
};

export default LanguageContext;
