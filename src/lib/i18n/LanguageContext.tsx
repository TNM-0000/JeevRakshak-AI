'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage } from '@/types/database';
import { translations, Translations } from './translations';
import { dataService } from '@/lib/supabase/dataService';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('jeevrakshak_lang') as AppLanguage;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        setLanguageState(saved);
        dataService.setAppLanguage(saved);
      } else {
        dataService.setAppLanguage('en');
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('jeevrakshak_lang', lang);
    } catch {
      // ignore
    }
    dataService.setAppLanguage(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
