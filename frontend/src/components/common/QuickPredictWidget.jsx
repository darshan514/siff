import React, { useState } from 'react';
import { usePredictions } from '../../context/PredictionContext';
import { useAuth } from '../../context/AuthContext';
import { predictSIFRisk, predictDemoFallback } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { translateToEnglish } from '../../utils/translator';
import { motion } from 'framer-motion';
import VoiceInputButton from './VoiceInputButton';

export const QuickPredictWidget = () => {
  const { user } = useAuth();
  const { addPrediction } = usePredictions();
  const { t } = useLanguage();
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const presets = [
    'Scaffold work at 8 meters without safety harness',
    'Hydrocarbon vapor leak detected near furnace',
    'Minor water spillage on corridor walkway',
    '415V electrical panel maintenance without LOTO'
  ];

  const handleVoiceTranscript = (transcript) => {
    setReport((prev) => {
      if (!prev || !prev.trim()) return transcript;
      if (prev.endsWith(transcript) || prev.includes(transcript)) return prev;
      return `${prev} ${transcript}`;
    });
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    if (!report.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    const minWait = new Promise((resolve) => setTimeout(resolve, 650));

    try {
      const englishText = await translateToEnglish(report);
      let apiResult;
      try {
        apiResult = await predictSIFRisk(englishText);
      } catch (err) {
        apiResult = predictDemoFallback(englishText);
      }

      await minWait;

      setResult(apiResult);
      
      if (user) {
        try {
          await addPrediction({
            report,
            prediction: apiResult.prediction,
            confidence: apiResult.confidence,
            executionTimeMs: apiResult.executionTimeMs,
            timestamp: apiResult.timestamp,
            isDemoFallback: apiResult.isDemoFallback,
          });
        } catch (saveErr) {
          console.warn("Warning: Could not save prediction to history.", saveErr);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[870px] bg-white/70 rounded-3xl border border-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 mb-8 backdrop-blur-xl text-left">
      <form onSubmit={handlePredict} className="flex flex-col gap-4">
        <textarea
          value={report}
          onChange={(e) => setReport(e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder={t('form_narrative_placeholder', 'Describe the incident, unsafe act, or near-miss observation in detail...')}
          className="w-full bg-transparent border-none resize-none font-body-lg text-lg text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:outline-none min-h-[80px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/60">
          
          {/* Action pills & Voice Input */}
          <div className="flex flex-wrap items-center gap-3">
            <VoiceInputButton currentText={report} onTranscript={(fullText) => setReport(fullText)} />

            {report && (
              <button
                type="button"
                onClick={() => setReport('')}
                className="p-2 rounded-full hover:bg-white/80 transition-colors text-slate-600"
                title="Clear Text"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>

          {/* Submit Arrow Button */}
          <button
            type="submit"
            disabled={!report.trim() || isLoading}
            className="bg-white/80 border border-white text-[#FF5E3A] rounded-full w-12 h-12 flex items-center justify-center shadow-sm hover:bg-white transition-colors scale-95 active:scale-90 disabled:opacity-40"
          >
            <span className="material-symbols-outlined">
              {isLoading ? 'hourglass_top' : 'arrow_upward'}
            </span>
          </button>
        </div>
      </form>



      {/* Inline Quick Result Box */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-2xl border flex flex-col gap-3 ${
            result.prediction === 'Unrelated Input'
              ? 'bg-amber-500/10 border-amber-300 text-amber-950'
              : result.prediction === 'SIF'
              ? 'bg-red-500/10 border-red-300 text-red-950'
              : 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
          }`}
        >
          {!user && (
            <div className="flex items-center gap-1.5 pb-2 border-b border-black/10">
              <span className="material-symbols-outlined text-[14px]">science</span>
              <span className="text-xs font-bold uppercase tracking-wider">{t('demo_mode', 'Guest Demo Mode (Not Saved)')}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">
              {result.prediction === 'Unrelated Input' ? 'info' : result.prediction === 'SIF' ? 'warning' : 'task_alt'}
            </span>
            <div>
              {result.prediction === 'Unrelated Input' ? (
                <>
                  <p className="font-extrabold text-sm">{t('invalid_obs_title', 'Invalid Observation')}</p>
                  <p className="text-xs font-medium opacity-80">{t('invalid_obs_desc', 'This is not a valid safety observation.')}</p>
                </>
              ) : (
                <>
                  <p className="font-extrabold text-sm">
                    {result.prediction === 'SIF' ? t('sif_potential', 'SIF Precursor (High Risk)') : t('non_sif', 'Non-SIF (Low Risk)')}
                  </p>
                  <p className="text-xs font-medium opacity-80">
                    {t('confidence_score', 'AI Confidence')}: {result.confidence.toFixed(1)}% | {t('latency', 'Latency')}: {result.executionTimeMs || 135}ms
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuickPredictWidget;
