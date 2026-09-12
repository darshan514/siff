import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const SmartRecommendationsCard = ({ insights }) => {
  const { t } = useLanguage();

  if (!insights || !insights.categorizedRecommendations) return null;

  const { immediate, inspection, training, permit } = insights.categorizedRecommendations;

  const categories = [
    { title: t('rec_immediate', 'Immediate Containment Actions'), icon: 'bolt', items: immediate, color: 'border-red-200 bg-red-500/10 text-red-950', badge: t('badge_critical', 'Critical') },
    { title: t('rec_inspection', 'Preventative Engineering Inspections'), icon: 'build', items: inspection, color: 'border-blue-200 bg-blue-500/10 text-blue-950', badge: t('badge_inspection', 'Inspection') },
    { title: t('rec_training', 'Mandatory Training & Refreshers'), icon: 'school', items: training, color: 'border-amber-200 bg-amber-500/10 text-amber-950', badge: t('badge_training', 'Training') },
    { title: t('rec_permit', 'Special Permit & Safety Controls'), icon: 'verified', items: permit, color: 'border-emerald-200 bg-emerald-500/10 text-emerald-950', badge: t('badge_permit', 'Permit') },
  ];

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#FF5E3A]/10 text-[#FF5E3A] flex items-center justify-center">
          <span className="material-symbols-outlined text-lg">tips_and_updates</span>
        </div>
        <div>
          <h4 className="font-extrabold text-base text-slate-900">
            {t('smart_recommendations_title', 'AI Safeguards & Recommended Solutions')}
          </h4>
          <p className="text-xs text-slate-500 font-medium">
            {t('smart_recommendations_subtitle', 'Proactive decision-support recommendations tailored for safety officers & field crews')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${cat.color} backdrop-blur-md shadow-sm space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">{cat.icon}</span>
                <h5 className="font-extrabold text-xs">{cat.title}</h5>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
                {cat.badge}
              </span>
            </div>

            <ul className="space-y-1.5 text-xs font-semibold">
              {cat.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#FF5E3A] font-bold text-xs mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartRecommendationsCard;
