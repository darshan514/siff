import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GitFork, AlertCircle, CheckCircle, Info, ChevronRight } from 'lucide-react';

export const RootCauseAnalysisCard = ({ rootCauses = [] }) => {
  const { t } = useLanguage();
  if (!rootCauses || rootCauses.length === 0) return null;

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6 text-left">
      
      {/* Header with Mandatory Disclaimer Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('root_cause_title', 'Possible Root Causes & Failure Patterns')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Correlation analysis mapping incident precursors, maintenance records, and asset histories.
            </p>
          </div>
        </div>

        {/* Regulatory Mandatory Disclaimer Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300/80 text-[10px] font-extrabold text-amber-900 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
          <span>AI-Generated Hypothesis (Not Confirmed Fact)</span>
        </div>
      </div>

      {/* Root Causes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rootCauses.map((rc, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-3.5 hover:border-amber-300/80 transition-colors"
          >
            {/* Cause Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  {rc.category}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {rc.title}
                </h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-black text-slate-800">{rc.confidence}%</span>
                <span className="text-[9px] text-slate-400 block font-bold">Relevance</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {rc.description}
            </p>

            {/* Supporting Evidence List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Supporting Telemetry & Evidence:
              </span>
              <ul className="space-y-1">
                {rc.evidence?.map((ev, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-700 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Root causes are calculated using historical incident clustering, equipment downtime records, and text similarity.</span>
        </div>
      </div>
    </div>
  );
};

export default RootCauseAnalysisCard;
