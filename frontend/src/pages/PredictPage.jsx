import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionContext';
import { predictSIFRisk, predictDemoFallback } from '../services/api';
import { analyzeHazardInsights } from '../utils/hazardAnalyzer';
import { translateToEnglish } from '../utils/translator';
import PredictionForm from '../components/predict/PredictionForm';
import PredictionResult from '../components/predict/PredictionResult';
import AIInsightsCard from '../components/predict/AIInsightsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Toast from '../components/common/Toast';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import AudioUploadModal from '../components/intelligence/AudioUploadModal';
import WhyDetectedCard from '../components/intelligence/WhyDetectedCard';
import RootCauseAnalysisCard from '../components/intelligence/RootCauseAnalysisCard';
import PredictiveForecastCard from '../components/intelligence/PredictiveForecastCard';
import {
  detectOilRiskCategory,
  computeCompositeRiskScore,
  generateExplainableExplanation,
  analyzeRootCauses,
  generatePredictiveForecast
} from '../utils/decisionIntelligence';
import { Mic, FileAudio } from 'lucide-react';

export const PredictPage = () => {
  const { user, isSafetyOfficer } = useAuth();
  const navigate = useNavigate();
  const { history, addPrediction } = usePredictions();
  const { lang, t } = useLanguage();

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [reportText, setReportText] = useState('');

  // AI & Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [decisionData, setDecisionData] = useState(null);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handlePredict = async (useDemoOverride = false) => {
    if (!reportText.trim()) return;

    setIsLoading(true);
    setErrorInfo(null);

    const minWait = new Promise((resolve) => setTimeout(resolve, 750));

    try {
      // Automatic Translation Layer: Translate non-English input (Tamil/Hindi/Telugu/Kannada) to English for AI Model
      const englishText = await translateToEnglish(reportText);

      let apiResult;
      if (isDemoMode || useDemoOverride) {
        apiResult = predictDemoFallback(englishText);
      } else {
        try {
          apiResult = await predictSIFRisk(englishText);
        } catch (err) {
          console.warn('Backend API connection failed, offering demo mode fallback:', err);
          setErrorInfo({
            message: err.message || 'Unable to connect to AI server.',
            canFallback: true,
          });
          setIsLoading(false);
          return;
        }
      }

      await minWait;

      setResult(apiResult);

      // Compute Comprehensive Oil India Decision Intelligence
      const oilCategory = detectOilRiskCategory(englishText);
      const compositeScore = computeCompositeRiskScore(apiResult.prediction, apiResult.confidence, englishText, history);
      const xaiData = generateExplainableExplanation(englishText, apiResult.prediction, compositeScore, oilCategory, compositeScore.factors);
      const rootCauses = analyzeRootCauses(englishText, apiResult.prediction, oilCategory, history);
      const forecast = generatePredictiveForecast(compositeScore, englishText);

      setDecisionData({
        oilCategory,
        compositeScore,
        xaiData,
        rootCauses,
        forecast
      });

      const hazardInfo = analyzeHazardInsights(englishText, apiResult.prediction, lang);

      // Save Incident Report and AI Analysis to database
      if (user) {
        await addPrediction({
          title: title || 'Industrial Safety Observation',
          location: location || 'Plant Facility Unit',
          report: reportText,
          narrative: reportText,
          reporterName: user?.name || 'Field Representative',
          reporterId: user?.employeeId || user?.officerId || 'EMP-1001',
          department: user?.department || 'Plant Safety Operations',
          company: user?.company || 'SIF Enterprise',
          prediction: apiResult.prediction,
          confidence: apiResult.confidence,
          hazardCategory: hazardInfo?.primaryCategory || oilCategory?.name || 'General Hazard',
          recommendedActions: hazardInfo?.recommendedPPE || [],
          executionTimeMs: apiResult.executionTimeMs || 135,
          timestamp: new Date().toISOString(),
          reviewStatus: 'Submitted',
        });
      }

      setToastMessage({
        text: !user 
          ? t('demo_result_toast', 'Demo result — not saved to database') 
          : `Report saved to Database & classified as ${apiResult.prediction} (${apiResult.confidence.toFixed(1)}%)`,
        type: !user ? 'info' : 'success',
      });
    } catch (err) {
      setErrorInfo({
        message: err.message || 'Failed to complete SIF prediction & report submission.',
        canFallback: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTitle('');
    setLocation('');
    setReportText('');
    setResult(null);
    setDecisionData(null);
    setErrorInfo(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-24 max-w-5xl mx-auto px-6 text-left"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <Toast
          message={toastMessage.text}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {!user && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/80 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-600 text-xl">science</span>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">{t('demo_mode_title', '🧪 Demo Mode — Try it out')}</h4>
            <p className="text-xs text-slate-600 font-medium">{t('demo_mode_desc', 'Results are shown for preview only and will not be saved to the database. Register and login to submit real safety observations.')}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-1.5 shadow-sm">
          <span className="material-symbols-outlined text-[#FF5E3A] text-sm">
            psychology
          </span>
          <span className="font-body-md text-xs font-semibold text-slate-800">
            {t('app_title', 'SIF AI Safety Intelligence')}
          </span>
        </div>

        <h1 className="font-display-xl text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t('predict', 'Predict SIF Precursor Risk')}
        </h1>

        <p className="text-base text-slate-600 max-w-2xl font-medium">
          {t('predict_desc', 'Submit free-text workplace observations, near-miss narratives, or hazard descriptions to receive instant DistilBERT SIF precursor risk classification, Explainable AI (XAI) feature analysis, and IOGP Life-Saving Rules mapping.')}
        </p>
      </div>

      {/* Safety Officer Advisory Notice */}
      {isSafetyOfficer && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-300/80 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">verified_user</span>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">{t('officer_sandbox_title', 'Safety Officer Review & Sandbox Mode')}</h4>
              <p className="text-xs text-slate-600 font-medium">{t('officer_sandbox_desc', 'Field observations are submitted by plant personnel. Use this console for testing AI model classifications, or navigate to the Command Hub to triage live incoming observations.')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/officer-dashboard')}
            className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 transition-all shadow-sm"
          >
            {t('return_to_command_hub', 'Return to Command Hub')}
          </button>
        </div>
      )}

      {/* Multi-Source Quick Action Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 p-3.5 rounded-2xl border border-white/80 backdrop-blur-xl shadow-xs text-xs font-bold text-slate-700">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF5E3A] text-base">hub</span>
          <span>Multi-Source Ingestion Active (Direct Narrative, Microphones, Audio Voice Memos)</span>
        </div>
        <button
          type="button"
          onClick={() => setIsAudioModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-xs flex items-center gap-1.5 transition-all hover:border-[#FF5E3A]/40 shrink-0"
        >
          <FileAudio className="w-4 h-4 text-[#FF5E3A]" />
          <span>Upload Audio Recording (Speech-to-Text)</span>
        </button>
      </div>

      {/* Main Form Component */}
      <PredictionForm
        title={title}
        setTitle={setTitle}
        location={location}
        setLocation={setLocation}
        reportText={reportText}
        setReportText={setReportText}
        onPredict={() => handlePredict(false)}
        isLoading={isLoading}
        onClear={handleClear}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="p-12 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-md text-center">
          <LoadingSpinner label={t('analyzing', 'Tokenizing narrative & scoring SIF risk via DistilBERT NLP...')} />
        </div>
      )}

      {/* Error / Offline Fallback Banner */}
      {errorInfo && !isLoading && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-300 text-amber-950 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">{t('api_connection_alert', 'API Connection Alert')}</h3>
              <p className="text-xs text-slate-600 font-medium">{errorInfo.message}</p>
            </div>
          </div>
          {errorInfo.canFallback && (
            <button
              onClick={() => handlePredict(true)}
              className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-colors"
            >
              {t('run_offline_demo', 'Run Instant Offline AI Demo Model')}
            </button>
          )}
        </div>
      )}

      {/* Prediction Output & Results */}
      {result && !isLoading && (
        <div className="space-y-8">
          <PredictionResult
            result={result}
            reportText={reportText}
            onCopySuccess={() =>
              setToastMessage({ text: t('copied_to_clipboard', 'Prediction result copied to clipboard!'), type: 'info' })
            }
          />

          <AIInsightsCard
            result={result}
            reportText={reportText}
            onReset={handleClear}
          />

          {decisionData && (
            <>
              {/* Explainable AI: Why Was This Detected? */}
              <WhyDetectedCard
                xaiData={decisionData.xaiData}
                riskScore={decisionData.compositeScore}
                prediction={result.prediction}
              />

              {/* Evidence-Based Root Cause Hypotheses */}
              <RootCauseAnalysisCard
                rootCauses={decisionData.rootCauses}
              />

              {/* Predictive Horizon Forecast */}
              <PredictiveForecastCard
                forecast={decisionData.forecast}
                riskScore={decisionData.compositeScore}
              />
            </>
          )}
        </div>
      )}

      {/* Audio Upload Speech-to-Text Modal */}
      <AudioUploadModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onApplyTranscript={(trans, signals) => {
          setReportText(trans);
          if (signals?.entities?.asset && !title) {
            setTitle(`Observation on ${signals.entities.asset}`);
          }
          if (signals?.entities?.location && !location) {
            setLocation(signals.entities.location);
          }
        }}
      />
    </motion.div>
  );
};

export default PredictPage;
