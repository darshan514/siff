import React, { useState } from 'react';
import { generateExecutiveSummary } from '../../utils/hazardAnalyzer';
import { useLanguage } from '../../context/LanguageContext';

export const AIExecutiveSummary = ({ history = [] }) => {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('daily');
  const [copied, setCopied] = useState(false);

  const summary = generateExecutiveSummary(history, period);

  const handleCopy = () => {
    const text = `[Oil India Limited ${summary.period}]\nDate: ${summary.timestamp}\nTotal Observations: ${summary.totalObservations}\nSIF Precursors: ${summary.sifPrecursorCount} (${summary.sifRatio})\nTop Hazard Cluster: ${summary.topRiskCluster}\n\nExecutive Risk Alerts:\n${summary.executiveAlerts.map(a => '• ' + a).join('\n')}\n\nManagement Action Plan:\n${summary.recommendedActionPlan.map(a => '✓ ' + a).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6 text-left relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5E3A]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5E3A]/20 text-[#FF5E3A] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">workspace_premium</span>
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white">
              {t('exec_summary_title', 'AI Executive Safety Briefing')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {summary.period} — {summary.timestamp}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-xl flex items-center text-xs font-bold">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${period === 'daily' ? 'bg-[#FF5E3A] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t('daily_briefing', 'Daily Briefing')}
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${period === 'weekly' ? 'bg-[#FF5E3A] text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t('weekly_briefing', 'Weekly Briefing')}
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
            <span>{copied ? t('copied', 'Copied!') : t('copy_summary', 'Copy Summary')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-sans">{t('total_reports', 'Total Reports')}</span>
          <p className="text-2xl font-black text-white">{summary.totalObservations}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-sans">{t('sif_precursors', 'SIF Precursors')}</span>
          <p className="text-2xl font-black text-red-400">{summary.sifPrecursorCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-sans">{t('precursor_ratio', 'Precursor Ratio')}</span>
          <p className="text-2xl font-black text-[#FF5E3A]">{summary.sifRatio}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 font-sans">{t('department', 'Primary Threat Zone')}</span>
          <p className="text-xs font-extrabold text-white truncate font-sans">{summary.topRiskCluster}</p>
        </div>
      </div>

      {/* Key Executive Alerts */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-red-400 text-base">emergency</span>
          <span>{t('exec_summary_title', 'Executive Risk Alerts')}</span>
        </h4>
        <ul className="space-y-2 text-xs font-medium text-slate-200">
          {summary.executiveAlerts.map((alert, idx) => (
            <li key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-400 text-sm mt-0.5 shrink-0">warning</span>
              <span>{alert}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Management Action Plan */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-base">task_alt</span>
          <span>{t('smart_recommendations_title', 'Strategic Management Action Plan')}</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {summary.recommendedActionPlan.map((action, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs font-semibold space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">{t('wf_step_1_title', `Priority #${idx + 1}`)}</span>
              <p>{action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIExecutiveSummary;
