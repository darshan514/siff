import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-transparent w-full py-8 text-slate-600 font-body-md text-sm relative z-20">
      <div className="max-w-[1515px] mx-auto px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-slate-200/60 pt-8">
        
        {/* Brand Logo */}
        <Link to="/" className="font-display-xl text-xl text-slate-900 flex items-center gap-2">
          <svg className="h-6 w-6 text-[#FF5E3A]" fill="none" height="24" viewBox="0 0 32 32" width="24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2"></circle>
            <path d="M11 10V22M21 10V22M11 16H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
          </svg>
          <span className="font-extrabold text-slate-900">SIF<span className="text-[#FF5E3A]">.AI</span></span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
          <Link className="hover:text-[#FF5E3A] transition-colors" to="/">{t('home', 'Home')}</Link>
          <Link className="hover:text-[#FF5E3A] transition-colors" to="/predict">{t('predict', 'Predict SIF')}</Link>
          <Link className="hover:text-[#FF5E3A] transition-colors" to="/analytics">{t('analytics', 'Analytics')}</Link>
          <Link className="hover:text-[#FF5E3A] transition-colors" to="/history">{t('history', 'Audit History')}</Link>
        </div>

        {/* Copyright */}
        <div className="text-slate-500 text-xs font-medium">
          © 2026 SIF AI Platform. {t('oil_india_hq', 'Oil India Limited — Safety Operations')}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
