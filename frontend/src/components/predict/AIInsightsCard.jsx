import React, { useState } from 'react';
import { analyzeHazardInsights } from '../../utils/hazardAnalyzer';
import { generateIncidentReportPDF } from '../../utils/pdfGenerator';
import XAINarrativeHighlighter from './XAINarrativeHighlighter';
import SmartRecommendationsCard from './SmartRecommendationsCard';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

const PPE_ICONS = {
  'Safety Helmet': 'hardware',
  'Helmet': 'hardware',
  'Full Body Harness': 'shield',
  'Harness': 'shield',
  'Safety Shoes': 'hiking',
  'Double Lanyard': 'link',
  'Gas Detector': 'sensors',
  'Respirator': 'masks',
  'Arc Flash Suit': 'dry_cleaning',
  'Electrical Gloves': 'back_hand',
  'Gloves': 'back_hand',
  'High Visibility Vest': 'vest',
  'Flame Resistant Clothing': 'dry_cleaning'
};

export const AIInsightsCard = ({ result, reportText, onReset }) => {
  const { t, lang } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  if (!result) return null;

  const insights = analyzeHazardInsights(reportText, result.prediction, lang);
  const isSIF = result.prediction === 'SIF';
  const confidence = result.confidence || 0;

  const handleDownloadPDF = () => {
    setPdfGenerating(true);
    setTimeout(() => {
      generateIncidentReportPDF(reportText, result);
      setPdfGenerating(false);
    }, 400);
  };

  const handleCopy = () => {
    const textToCopy = `[SIF AI Incident Assessment]\nPrediction: ${result.prediction}\nConfidence: ${confidence.toFixed(2)}%\nRisk Level: ${insights.riskLevel}\nHazard Category: ${insights.primaryCategory}\nIOGP Life Saving Rule: ${insights.lifeSavingRule}\nAI Explanation: ${insights.explanation}\nKeywords: ${insights.uniqueKeywords.join(', ')}\nRecommended PPE: ${insights.recommendedPPE.join(', ')}\nImmediate Actions: ${insights.recommendedActions.join('; ')}\nNarrative: "${reportText}"`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isUnrelated = result.prediction === 'Unrelated Input' || result.prediction === 'Unrelated';

  if (isUnrelated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white/70 rounded-3xl border border-white/90 shadow-sm p-8 backdrop-blur-xl text-center space-y-4"
      >
        <span className="material-symbols-outlined text-4xl text-slate-400">info</span>
        <h3 className="text-lg font-extrabold text-slate-800">{t('invalid_obs_title', 'Invalid Observation')}</h3>
        <p className="text-sm font-medium text-slate-600 max-w-md mx-auto">{t('invalid_obs_desc', 'This is not a valid safety observation. Please provide a valid safety-related query or observation.')}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white/70 rounded-3xl border border-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-8 backdrop-blur-xl space-y-8 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5E3A]/10 text-[#FF5E3A] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">auto_awesome</span>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {t('xai_explanation_title', 'AI Incident Risk Assessment & Intelligence')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('home_feature_1_title', 'DistilBERT Multi-Factor Precursor Analysis')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${
            isSIF
              ? 'bg-red-500/10 text-red-700 border-red-300'
              : 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
          }`}>
            {isSIF ? t('sif_potential', 'High SIF Risk') : t('non_sif', 'Low SIF Risk')}
          </span>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm text-xs font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">{copied ? 'check' : 'content_copy'}</span>
            <span className="hidden sm:inline">{copied ? t('copied', 'Copied') : t('copy', 'Copy')}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('filter_status', 'Risk Level')}</span>
          <p className={`font-extrabold text-base ${isSIF ? 'text-red-600' : 'text-emerald-600'}`}>
            {insights.riskLevel}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('iogp_rule', 'IOGP Life Saving Rule')}</span>
          <p className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1.5 mt-0.5">
            <span className="material-symbols-outlined text-sm text-[#FF5E3A]">{insights.iogpRule?.icon || 'verified_user'}</span>
            <span>{insights.lifeSavingRule}</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('department', 'Department Domain')}</span>
          <p className="font-extrabold text-base text-slate-900 truncate">
            {insights.primaryCategory}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('confidence_score', 'AI Confidence')}</span>
          <p className="font-extrabold text-base text-slate-900">
            {confidence.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* AI Contextual Explanation */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('xai_explanation_title', 'AI Contextual Assessment')}
        </span>
        <p className="p-5 rounded-2xl bg-slate-900 text-white text-sm leading-relaxed font-medium shadow-md border border-slate-800">
          {insights.explanation}
        </p>
      </div>

      {/* Explainable AI (XAI) Token Highlighter */}
      <XAINarrativeHighlighter narrative={reportText} prediction={result.prediction} />

      {/* Smart Recommendations Card */}
      <SmartRecommendationsCard insights={insights} />

      {/* Required PPE */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {t('wf_step_4_desc', 'Required Personal Protective Equipment (PPE)')}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {insights.recommendedPPE.map((item, idx) => {
            const iconName = PPE_ICONS[item] || 'verified_user';
            return (
              <div key={idx} className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">{iconName}</span>
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {item === 'Safety Helmet' ? t('ppe_safety_helmet', 'Safety Helmet') :
                   item === 'Full Body Harness' ? t('ppe_full_body_harness', 'Full Body Harness') :
                   item === 'Arc Flash Shield' ? t('ppe_arc_flash_shield', 'Arc Flash Shield') :
                   item === 'H2S Gas Detector' ? t('ppe_h2s_detector', 'H2S Gas Detector') :
                   item === 'Safety Shoes' ? t('ppe_safety_shoes', 'Safety Shoes') : item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* PDF Export Button */}
      <div className="pt-4 border-t border-slate-200/60 flex justify-end">
        <button
          onClick={handleDownloadPDF}
          disabled={pdfGenerating}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
          <span>{pdfGenerating ? t('download_pdf', 'Generating PDF...') : t('download_pdf', 'Download Official PDF Report')}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AIInsightsCard;
