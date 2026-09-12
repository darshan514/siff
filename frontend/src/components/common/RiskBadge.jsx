import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

export const RiskBadge = ({ riskLevel = 'SIF', size = 'medium', showIcon = true }) => {
  const { t } = useLanguage();
  const isSIF = riskLevel === 'SIF' || riskLevel === 'High Risk';
  const isUnrelated = riskLevel === 'Unrelated Input' || riskLevel === 'Unrelated';

  const sizeClasses = {
    small: 'px-3 py-1 text-xs font-bold',
    medium: 'px-4 py-1.5 text-xs font-extrabold',
    large: 'px-5 py-2 text-sm font-extrabold',
  };

  if (isUnrelated) {
    return (
      <motion.span
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-sm ${sizeClasses[size]}`}
      >
        {showIcon && <span className="material-symbols-outlined text-base">help_outline</span>}
        <span>{t('unrelated_input', 'Unrelated Query')}</span>
      </motion.span>
    );
  }

  if (isSIF) {
    return (
      <motion.span
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1.5 rounded-full bg-[#ffdad6] text-[#93000a] border border-[#ffb59e] shadow-sm ${sizeClasses[size]}`}
      >
        {showIcon && <span className="material-symbols-outlined text-base">warning</span>}
        <span>{t('sif_potential', 'SIF Precursor (High Risk)')}</span>
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#d6ed7a] text-[#5a6c00] border border-[#bbd062] shadow-sm ${sizeClasses[size]}`}
    >
      {showIcon && <span className="material-symbols-outlined text-base">check_circle</span>}
      <span>{t('non_sif', 'Non-SIF (Low Risk)')}</span>
    </motion.span>
  );
};

export default RiskBadge;
