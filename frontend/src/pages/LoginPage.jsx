import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import FaceCapture from '../components/auth/FaceCapture';
import Toast from '../components/common/Toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithFaceImage, isLoading } = useAuth();
  const { t } = useLanguage();

  const [activeRole, setActiveRole] = useState('worker'); // 'worker' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [showFaceLogin, setShowFaceLogin] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const handleFaceCapture = async (blob) => {
    setErrorMsg(null);
    try {
      await loginWithFaceImage(blob);
      setToastMsg('Face login successful!');
      setToastType('success');
      setTimeout(() => navigate('/officer-dashboard'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Face login failed. Try email/password.');
      setShowFaceLogin(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMsg(null);
    try {
      const loggedUser = await login(email, password, activeRole);
      if (loggedUser.role === 'safety_officer' || loggedUser.role === 'admin') {
        navigate('/officer-dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check credentials.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-24 max-w-md mx-auto px-6 text-left"
    >
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5E3A]/10 text-[#FF5E3A] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">lock</span>
          </div>
          <h1 className="font-display-xl text-2xl font-extrabold text-slate-900">
            {t('login_title', 'Sign In to SIF.AI')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {t('login_subtitle', 'Enter your credentials to access your safety dashboard.')}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl text-xs font-extrabold">
          <button
            type="button"
            onClick={() => { setActiveRole('worker'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'worker' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">engineering</span>
            <span>{t('worker', 'Field Observer')}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveRole('admin'); setErrorMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'admin' ? 'bg-[#FF5E3A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">shield_person</span>
            <span>{t('safety_officer', 'Safety Officer')}</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {t('email_label', 'Email Address')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. observer@oilindia.in"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 font-medium"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                {t('password_label', 'Password')}
              </label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-[#FF5E3A] hover:underline">
                {t('forgot_password', 'Forgot?')}
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>{isLoading ? t('analyzing', 'Authenticating...') : t('login', 'Sign In')}</span>
          </button>
          
          {activeRole === 'admin' && (
            <button
              type="button"
              onClick={() => setShowFaceLogin(true)}
              className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">face</span>
              <span>Login with Face Recognition</span>
            </button>
          )}
        </form>

        {showFaceLogin && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative">
              <button
                onClick={() => setShowFaceLogin(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <FaceCapture onCapture={handleFaceCapture} isLogin={true} />
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-extrabold text-[#FF5E3A] hover:underline">
            {t('register', 'Register Now')}
          </Link>
        </div>
      </div>
    {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}
    </motion.div>
  );
};

export default LoginPage;
