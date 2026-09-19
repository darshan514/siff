import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HelpCircle, CheckCircle2, TrendingUp, ShieldAlert, Cpu } from 'lucide-react';

export const WhyDetectedCard = ({ xaiData, riskScore, prediction }) => {
  const { t } = useLanguage();
  if (!xaiData) return null;

  const isSIF = prediction === 'SIF';

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('why_detected_title', 'Why Was This Detected? — Explainable AI')}
              </h3>
              <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                XAI Attribution
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Transparent plain-language decomposition of factors, numerical weights, and regulatory models influencing the score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-sm">
          <Cpu className="w-4 h-4 text-[#FF5E3A]" />
          <span>{xaiData.modelAttribution || "DistilBERT + Oil India QRA"}</span>
        </div>
      </div>

      {/* Plain Language Summary Callout */}
      <div className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${
        isSIF
          ? 'bg-red-500/10 border-red-200 text-red-950'
          : 'bg-emerald-500/10 border-emerald-200 text-emerald-950'
      }`}>
        <p className="font-semibold">{xaiData.summary}</p>
      </div>

      {/* Contributing Factors Breakdown */}
      <div className="space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Key Contributing Signals & Evidence
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {xaiData.bulletPoints?.map((point, idx) => {
            const isIncrease = point.includes('(+') || point.includes('classified as SIF');
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs flex items-start gap-3 text-xs"
              >
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isIncrease ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
                <span className="text-slate-700 font-medium leading-snug">{point}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factor Breakdown Badges */}
      {xaiData.scoreFactors && xaiData.scoreFactors.length > 0 && (
        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Score Breakdown:
          </span>
          {xaiData.scoreFactors.map((f, i) => (
            <span
              key={i}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                f.value > 0
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <span>{f.name}</span>
              <span className="font-mono">{f.value > 0 ? `+${f.value}` : f.value} pts</span>
            </span>
          ))}
        </div>
      )}

    </div>
  );
};

export default WhyDetectedCard;
