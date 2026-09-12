import React, { useState } from 'react';
import SimilarIncidentFinder from './SimilarIncidentFinder';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

export const PredictionResult = ({ result, reportText, onCopySuccess }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const isSIF = result.prediction === 'SIF';
  const isInvalid = result.prediction === 'Unrelated Input';
  const confidence = result.confidence || 0;
  const executionTime = result.executionTimeMs || 135;

  const handleCopy = () => {
    const textToCopy = `[SIF AI Analysis]\nPrediction: ${result.prediction}\nConfidence: ${confidence.toFixed(2)}%\nRisk Status: ${isSIF ? t('high_risk', 'High Risk') : (isInvalid ? t('invalid_obs_title', 'Invalid Input') : t('low_risk', 'Low Risk'))}\nExecution Time: ${executionTime}ms\nNarrative: "${reportText}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    if (onCopySuccess) onCopySuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  if (isInvalid) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 border backdrop-blur-xl shadow-lg relative overflow-hidden bg-slate-100 border-slate-300 text-center space-y-4"
      >
        <span className="material-symbols-outlined text-4xl text-slate-400">info</span>
        <h3 className="text-lg font-extrabold text-slate-800">{t('invalid_obs_title', 'Invalid Input')}</h3>
        <p className="text-sm font-medium text-slate-600 max-w-md mx-auto">{t('invalid_obs_desc', 'This is not a valid safety observation. Please provide a valid safety-related query or observation.')}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-8 border backdrop-blur-xl shadow-lg relative overflow-hidden space-y-6 ${
          isSIF
            ? 'bg-gradient-to-br from-red-500/15 via-white/80 to-red-500/10 border-red-300'
            : 'bg-gradient-to-br from-emerald-500/15 via-white/80 to-emerald-500/10 border-emerald-300'
        }`}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${isSIF ? 'bg-[#FF5E3A]' : 'bg-emerald-600'}`}>
              <span className="material-symbols-outlined text-3xl">
                {isSIF ? 'warning' : 'shield'}
              </span>
            </div>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isSIF ? 'bg-red-500/20 text-red-800' : 'bg-emerald-500/20 text-emerald-800'
              }`}>
                {isSIF ? t('sif_potential', 'SIF — High Risk Precursor') : t('non_sif', 'Non-SIF — Low Risk')}
              </span>
              <p className="text-xs text-slate-500 mt-1">{t('latency', 'Latency')}: {executionTime}ms</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="bg-white/80 border border-white/90 px-5 py-2 rounded-full text-xs font-bold text-slate-800 hover:bg-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
            <span>{copied ? t('copied', 'Copied!') : t('copy', 'Copy Result')}</span>
          </button>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Progress Display */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/70 rounded-2xl border border-white/90 text-center shadow-sm">
            <div className="text-4xl font-extrabold font-display-xl tracking-tight text-slate-900">
              {confidence.toFixed(1)}%
            </div>
            <span className="font-label-caps text-label-caps uppercase text-slate-500 mt-1">{t('confidence_score', 'Confidence Score')}</span>
            <div className="w-full h-3 rounded-full bg-slate-200 mt-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${isSIF ? 'bg-[#FF5E3A]' : 'bg-emerald-500'}`}
              />
            </div>
          </div>

          {/* Directives */}
          <div className="md:col-span-2 space-y-4">
            <div className={`p-4 rounded-2xl border ${isSIF ? 'bg-red-500/10 border-red-300' : 'bg-emerald-500/10 border-emerald-300'}`}>
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">{isSIF ? 'error' : 'task_alt'}</span>
                <span>{isSIF ? t('immediate_actions_title', 'Immediate Action Directives') : t('routine_monitoring_title', 'Routine Monitoring Protocol')}</span>
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                {isSIF
                  ? t('sif_action_summary', 'High SIF precursor risk identified. Immediate supervisor review and stop-work evaluation recommended.')
                  : t('non_sif_action_summary', 'Routine safety observation logged with low probability of severe injury.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isSIF ? (
                <>
                  <div className="p-3 rounded-xl bg-white/80 border border-red-200/80 flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-red-600">supervisor_account</span>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{t('supervisor_review', 'Supervisor Review')}</span>
                      <p className="text-[11px] text-slate-500">{t('immediate_review_req', 'Immediate Review Required')}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-red-200/80 flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-red-600">block</span>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{t('stop_work_eval', 'Stop Work Evaluation')}</span>
                      <p className="text-[11px] text-slate-500">{t('verify_barrier_integrity', 'Verify Barrier Integrity')}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-white/80 border border-emerald-200/80 flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-emerald-600">fact_check</span>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{t('routine_logging', 'Routine Logging')}</span>
                      <p className="text-[11px] text-slate-500">{t('standard_safety_reg', 'Standard Safety Registry')}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 border border-emerald-200/80 flex items-center gap-3 shadow-sm">
                    <span className="material-symbols-outlined text-emerald-600">thumb_up</span>
                    <div>
                      <span className="font-bold text-xs text-slate-900">{t('low_hazard_barrier', 'Low Hazard Barrier')}</span>
                      <p className="text-[11px] text-slate-500">{t('normal_operations', 'Normal Operations')}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similar Incident Finder */}
      <SimilarIncidentFinder reportText={reportText} />
    </div>
  );
};

export default PredictionResult;
