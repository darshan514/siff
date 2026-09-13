import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import Toast from '../components/common/Toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
      const [pendingPayload, setPendingPayload] = useState(null);
  const { t } = useLanguage();

  const [role, setRole] = useState('worker'); // 'worker' or 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    officerId: '',
    department: 'Industrial Operations',
    company: 'OIL / ONGC Enterprise',
    designation: 'Chief Safety Inspector',
    phone: '',
  });

  const [errorMsg, setErrorMsg] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        employeeId: role === 'worker' ? formData.employeeId : null,
        officerId: role === 'admin' ? formData.officerId : null,
        department: formData.department,
        company: formData.company,
        designation: role === 'admin' ? formData.designation : null,
        phone: formData.phone,
      };

      try {
        const user = await register(payload);
        if (role === 'admin') {
          setRegisteredUser(user);
          setShowFaceEnrollment(true);
        } else {
          navigate('/employee-dashboard');
        }
      } catch (err) {
        setToastMsg(err.message || 'Registration failed.');
        setToastType('error');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register account.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-24 max-w-xl mx-auto px-6 text-left"
    >
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5E3A]/10 text-[#FF5E3A] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-2xl">person_add</span>
          </div>
          <h1 className="font-display-xl text-2xl font-extrabold text-slate-900">
            {t('register_title', 'Create Safety Account')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {t('register_subtitle', 'Register as a Field Observer or Safety Officer.')}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-2xl text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setRole('worker')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'worker' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">engineering</span>
            <span>{t('worker', 'Field Observer')}</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'admin' ? 'bg-[#FF5E3A] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                {t('full_name_label', 'Full Name')}
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vikramaditya Singh"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
              />
            </div>

            {role === 'worker' ? (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {t('employee_id_label', 'Employee ID')}
                </label>
                <input
                  type="text"
                  required
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP-9042"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {t('officer_id', 'Safety Officer ID')}
                </label>
                <input
                  type="text"
                  required
                  name="officerId"
                  value={formData.officerId}
                  onChange={handleChange}
                  placeholder="e.g. SO-108"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                {t('department_label', 'Department')}
              </label>
              <input
                type="text"
                required
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Offshore Drilling Ops"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
              />
            </div>

            {role === 'worker' ? (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {t('company_org_label', 'Company / Organization')}
                </label>
                <input
                  type="text"
                  required
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. OIL / ONGC / BP"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  {t('designation_title_label', 'Designation Title')}
                </label>
                <input
                  type="text"
                  required
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Chief Risk Officer"
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
                />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              {t('email_label', 'Work Email Address')}
            </label>
            <input
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. name@company.com"
              className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                {t('password_label', 'Password')}
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                {t('confirm_password_label', 'Confirm Password')}
              </label>
              <input
                type="password"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? t('analyzing', 'Registering Account...') : t('register', 'Complete Registration')}</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-slate-200/60 text-center text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#FF5E3A] hover:underline">
            {t('login', 'Sign in here')}
          </Link>
        </div>

      </div>

      
    {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}
    </motion.div>
  );
};

export default RegisterPage;
