import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import VoiceInputButton from '../common/VoiceInputButton';

export const PredictionForm = ({
  title,
  setTitle,
  location,
  setLocation,
  reportText,
  setReportText,
  onPredict,
  isLoading,
  onClear,
}) => {
  const { t } = useLanguage();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (reportText.trim() && !isLoading) {
        onPredict();
      }
    }
  };

  return (
    <div className="w-full bg-white/60 rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 mb-8 backdrop-blur-xl space-y-5 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF5E3A]">edit_note</span>
          <span className="font-extrabold text-base text-slate-900">
            {t('form_narrative_label', 'Safety Incident Observation & Risk Prediction')}
          </span>
        </div>
        {(title || location || reportText) && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            <span>{t('form_reset_btn', 'Clear Form')}</span>
          </button>
        )}
      </div>

      {/* Title & Location Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              {t('form_title_label', 'Incident Title / Subject')}
            </label>
            <VoiceInputButton
              currentText={title}
              onTranscript={(fullText) => setTitle(fullText)}
              compact={true}
            />
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            placeholder={t('form_title_placeholder', 'e.g. 415V LOTO Maintenance Failure')}
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 font-medium"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              {t('form_location_label', 'Plant Location / Facility Unit')}
            </label>
            <VoiceInputButton
              currentText={location}
              onTranscript={(fullText) => setLocation(fullText)}
              compact={true}
            />
          </div>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isLoading}
            placeholder={t('form_location_placeholder', 'e.g. Duliajan Gas Plant Unit 4, Digboi Rig #7')}
            className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 font-medium"
          />
        </div>
      </div>

      {/* Observation Narrative */}
      <div className="space-y-1.5 text-xs font-medium">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            {t('form_narrative_label', 'Observation Description Narrative')}
          </label>
          <VoiceInputButton
            currentText={reportText}
            onTranscript={(fullText) => setReportText(fullText)}
            compact={false}
          />
        </div>
        <textarea
          ref={textareaRef}
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={4}
          placeholder={t('form_narrative_placeholder', 'Describe the incident, unsafe act, or near-miss observation in detail...')}
          className="w-full p-4 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 text-sm leading-relaxed"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onPredict}
          disabled={!reportText.trim() || isLoading}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 shrink-0"
        >
          <span className="material-symbols-outlined text-base">
            {isLoading ? 'hourglass_top' : 'auto_awesome'}
          </span>
          <span>{isLoading ? t('analyzing', 'Analyzing Observation...') : t('form_submit_btn', 'Run AI Analysis')}</span>
        </button>
      </div>
    </div>
  );
};

export default PredictionForm;
