import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isSafetyOfficer, logout } = useAuth();
  const { lang, setLanguage, t, languages } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: t('home', 'Home'), path: '/' },
        { name: t('predict', 'Predict SIF'), path: '/predict' },
      ];
    }

    if (isSafetyOfficer) {
      return [
                { name: t('my_dashboard', 'Executive Dashboard'), path: '/officer-dashboard' },
        { name: t('batch', 'Batch Analysis'), path: '/batch' },
        { name: t('analytics', 'Analytics'), path: '/analytics' },
        { name: t('history', 'Audit Log'), path: '/history' },
      ];
    }

    // Default Employee Links
    return [
      { name: t('home', 'Home'), path: '/' },
      { name: t('my_dashboard', 'My Dashboard'), path: '/employee-dashboard' },
      { name: t('predict', 'Predict & Report'), path: '/predict' },
      { name: t('my_reports', 'My Reports'), path: '/my-reports' },
      { name: t('history', 'My History'), path: '/history' },
    ];
  };

  const navLinks = getNavLinks();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentLangObj = languages.find(l => l.code === lang) || languages[0];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-full border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.03)] z-50 flex justify-between items-center px-6 sm:px-8 py-3 transition-colors duration-200">
      
      {/* Brand Logo */}
      <Link to="/" className="font-extrabold text-2xl tracking-tighter text-[#FF5E3A] flex items-center gap-2">
        <svg className="h-8 w-8 text-black" fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2"></circle>
          <path d="M11 10V22M21 10V22M11 16H21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
        </svg>
        <span className="text-slate-900 font-extrabold font-heading text-xl">
          SIF<span className="text-[#FF5E3A]">.AI</span>
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-5">
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs font-semibold transition-all duration-200 scale-95 active:scale-90 ${
                active
                  ? 'text-[#FF5E3A] font-extrabold'
                  : 'text-slate-600 hover:text-[#FF5E3A]'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language Switcher Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-white transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm text-[#FF5E3A]">language</span>
            <span>{currentLangObj.native}</span>
            <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl border border-white/90 rounded-2xl shadow-xl py-1.5 z-50 text-left font-medium text-xs">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100">
                Select Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors ${
                    lang === l.code ? 'bg-[#FF5E3A]/10 text-[#FF5E3A] font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </span>
                  {lang === l.code && <span className="material-symbols-outlined text-xs text-[#FF5E3A]">check</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 bg-white/80 border border-white/90 px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold text-slate-800 hover:bg-white transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-extrabold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[90px] truncate">{user?.name || 'Profile'}</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {isSafetyOfficer ? t('safety_officer', 'Officer') : t('worker', 'Worker')}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t('logout', 'Logout')}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-xs font-extrabold text-slate-700 hover:text-slate-900 px-3 py-2"
            >
              {t('login', 'Login')}
            </Link>
            <Link
              to="/register"
              className="bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs px-5 py-2 rounded-full shadow-md transition-all"
            >
              {t('register', 'Register')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
