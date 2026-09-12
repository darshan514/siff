import React, { useState } from 'react';
import { explainableHighlighter } from '../../utils/hazardAnalyzer';
import { useLanguage } from '../../context/LanguageContext';

export const XAINarrativeHighlighter = ({ narrative, prediction }) => {
  const { t, lang } = useLanguage();
  const [activeTooltip, setActiveTooltip] = useState(null);

  if (!narrative) return null;

  const highlightedTokens = explainableHighlighter(narrative, prediction, lang);
  const isSIF = prediction === 'SIF';

  return (
    <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white shadow-lg text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF5E3A] text-lg">psychology</span>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
            {t('xai_explanation_title', 'Explainable AI (XAI) Risk Factors')}
          </h4>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="text-slate-400">{t('sif_precursors', 'SIF Precursor')}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-slate-400">{t('xai_risk_trigger', 'Hazard Indicator')}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-slate-400">{t('rec_permit', 'Control / PPE')}</span>
          </span>
        </div>
      </div>

      <div className="text-xs leading-relaxed font-mono relative py-2">
        {highlightedTokens.map((item) => {
          let styleClass = 'text-slate-300';
          if (item.type === 'critical') {
            styleClass = 'bg-red-500/25 text-red-300 border-b-2 border-red-500 font-bold px-1 rounded cursor-help';
          } else if (item.type === 'hazard') {
            styleClass = 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400 font-semibold px-1 rounded cursor-help';
          } else if (item.type === 'control') {
            styleClass = 'bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400 font-semibold px-1 rounded cursor-help';
          }

          return (
            <span
              key={item.id}
              className={`inline-block mr-1.5 mb-1 relative transition-colors ${styleClass}`}
              onMouseEnter={() => setActiveTooltip(item.id)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {item.word}

              {activeTooltip === item.id && item.type !== 'normal' && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-xl bg-slate-900 border border-slate-700 text-[10px] text-white font-sans font-medium shadow-2xl z-30 pointer-events-none">
                  <span className="font-extrabold block text-[#FF5E3A] mb-0.5 uppercase tracking-wider text-[9px]">
                    {t('xai_risk_trigger', 'AI Risk Trigger')}
                  </span>
                  {item.reason}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 font-medium italic border-t border-slate-800/80 pt-2">
        {t('xai_hover_hint', '* Hover over highlighted terms to view DistilBERT feature contribution reasons.')}
      </p>
    </div>
  );
};

export default XAINarrativeHighlighter;
