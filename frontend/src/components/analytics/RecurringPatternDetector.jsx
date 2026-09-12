import React from 'react';
import { detectRecurringPatterns } from '../../utils/hazardAnalyzer';
import { useLanguage } from '../../context/LanguageContext';

export const RecurringPatternDetector = ({ history = [] }) => {
  const { t } = useLanguage();
  const patterns = detectRecurringPatterns(history);

  if (!patterns.length) return null;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">repeat</span>
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-900">
              {t('recurring_patterns_title', 'Recurring Precursor & Barrier Deficiencies')}
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Systemic safety patterns auto-detected across repeated high-risk reports
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
          Pattern Classifier Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">
                {item.dept} Sector @ {item.location}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 border border-red-300">
                {item.trendSeverity}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span>SIF Precursors Logged: <strong className="text-red-600">{item.sifCount}</strong></span>
              <span>Total Reports: <strong className="text-slate-900">{item.total}</strong></span>
            </div>

            <p className="text-xs text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <strong className="text-[#FF5E3A]">Action Item:</strong> {item.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecurringPatternDetector;
