import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import Toast from '../components/common/Toast';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser, isSafetyOfficer, logout, registerFaceImage } = useAuth();
  const { history } = usePredictions();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const myHistory = isSafetyOfficer ? history : history;
  const totalReports = myHistory.length;
  const sifCount = myHistory.filter(h => h.prediction === 'SIF').length;

  const handleSave = (e) => {
    e.preventDefault();
    setUser({ ...user, name, department, phone });
    setIsEditing(false);
  };

    return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-24 max-w-4xl mx-auto px-6 text-left space-y-8"
    >
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display-xl text-2xl sm:text-3xl font-extrabold text-slate-900">
                {user?.name || 'User Profile'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                isSafetyOfficer
                  ? 'bg-[#FF5E3A]/10 text-[#FF5E3A] border-[#FF5E3A]/30'
                  : 'bg-blue-500/10 text-blue-800 border-blue-300'
              }`}>
                {isSafetyOfficer ? '🛡 Safety Officer' : '👷 Employee'}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {user?.email} • Joined SIF AI Enterprise Platform
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="px-5 py-2.5 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>{t('logout', 'Logout')}</span>
        </button>
      </div>

      {/* User Information Card */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF5E3A]">badge</span>
            <span>{t('profile', 'User Profile')}</span>
          </h3>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm"
          >
            {isEditing ? t('close', 'Cancel Edit') : t('profile', 'Edit Profile')}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs font-medium">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">{t('full_name_label', 'Full Name')}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">{t('department_label', 'Department')}</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#FF5E3A] text-white font-extrabold text-xs shadow-md"
            >
              Save Profile Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{t('role_label', 'Identity Role')}</span>
              <p className="font-extrabold text-sm text-slate-900">{isSafetyOfficer ? t('safety_officer', 'Safety Officer') : t('worker', 'Field Observer')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {isSafetyOfficer ? t('officer_id', 'Safety Officer ID') : t('employee_id', 'Employee ID')}
              </span>
              <p className="font-mono font-extrabold text-sm text-slate-900">
                {isSafetyOfficer ? (user?.officerId || 'SO-108') : (user?.employeeId || 'EMP-9042')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{t('department', 'Department')}</span>
              <p className="font-extrabold text-sm text-slate-900">{user?.department || 'Industrial Safety Ops'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                {isSafetyOfficer ? 'Designation Title' : 'Company'}
              </span>
              <p className="font-extrabold text-sm text-slate-900">
                {isSafetyOfficer ? (user?.designation || 'Chief Safety Inspector') : (user?.company || 'OIL / ONGC')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Phone Number</span>
              <p className="font-extrabold text-sm text-slate-900">{user?.phone || '+91 98765 43210'}</p>
            </div>

            {isSafetyOfficer && (
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 space-y-2">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{t('biometrics', 'Biometrics')}</span>
                <p className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <span className={`material-symbols-outlined text-base ${user?.isFaceRegistered ? 'text-green-500' : 'text-slate-400'}`}>
                    {user?.isFaceRegistered ? 'check_circle' : 'cancel'}
                  </span>
                  {user?.isFaceRegistered ? 'Face Registered' : 'Not Registered'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsEnrolling(true)}
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                >
                  {user?.isFaceRegistered ? 'Re-scan Face' : 'Enroll Face'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEnrolling && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setIsEnrolling(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <FaceCapture onCapture={handleEnrollment} isLogin={false} />
          </div>
        </div>
      )}

      {/* Activity Statistics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('my_reports', 'Activity Summary')}</span>
          <p className="text-2xl font-extrabold text-slate-900">{totalReports} {t('total_reports', 'Reports Logged')}</p>
          <p className="text-xs text-slate-600 font-medium">{t('submitted_all_shifts', 'Submitted across all shifts')}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('sif_precursors', 'SIF Risk Findings')}</span>
          <p className="text-2xl font-extrabold text-red-600">{sifCount} {t('sif_precursors', 'High Risk Logs')}</p>
          <p className="text-xs text-slate-600 font-medium">{t('precursor_ratio', 'Critical hazard precursor observations identified')}</p>
        </div>
      </div>
    {toastMsg && <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg(null)} />}
    </motion.div>
  );
};

export default ProfilePage;
