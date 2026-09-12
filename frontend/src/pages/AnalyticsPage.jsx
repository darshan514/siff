import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionContext';
import { computeAnalyticsMetrics } from '../utils/hazardAnalyzer';
import RiskDistributionChart from '../components/analytics/RiskDistributionChart';
import IncidentTrendChart from '../components/analytics/IncidentTrendChart';
import HazardCategoryChart from '../components/analytics/HazardCategoryChart';
import AnalyticsWidgets from '../components/analytics/AnalyticsWidgets';
import RiskHeatMap from '../components/analytics/RiskHeatMap';
import RecurringPatternDetector from '../components/analytics/RecurringPatternDetector';
import AIExecutiveSummary from '../components/analytics/AIExecutiveSummary';
import StatCard from '../components/common/StatCard';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AnalyticsPage = () => {
  const { history } = usePredictions();
  const { t } = useLanguage();
  const [selectedDepts, setSelectedDepts] = useState(['ALL']);
  const [selectedRisk, setSelectedRisk] = useState('ALL');

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchDept = selectedDepts.includes('ALL') || selectedDepts.includes(h.department || 'Operations');
      const matchRisk = selectedRisk === 'ALL' || h.prediction === selectedRisk;
      return matchDept && matchRisk;
    });
  }, [history, selectedDepts, selectedRisk]);

  const metrics = computeAnalyticsMetrics(filteredHistory);

  const highRiskRate =
    metrics.total > 0
      ? ((metrics.sifCount / metrics.total) * 100).toFixed(1)
      : '0.0';

  const riskIndex = metrics.riskIndex;

  const toggleDept = (dept) => {
    if (dept === 'ALL') {
      setSelectedDepts(['ALL']);
      return;
    }
    let newDepts = selectedDepts.filter(d => d !== 'ALL');
    if (newDepts.includes(dept)) {
      newDepts = newDepts.filter(d => d !== dept);
      if (newDepts.length === 0) newDepts = ['ALL'];
    } else {
      newDepts.push(dept);
    }
    setSelectedDepts(newDepts);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-24 max-w-6xl mx-auto px-6 text-left"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-1.5 shadow-sm">
          <span className="material-symbols-outlined text-[#FF5E3A] text-sm">
            monitoring
          </span>
          <span className="font-body-md text-xs font-semibold text-slate-800">
            {t('oil_india_hq', 'Oil India Limited — Safety Operations')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display-xl text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {t('analytics', 'Executive Safety Analytics & Risk Trends')}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mt-1">
              {t('analytics_subtitle', 'Aggregated safety observations, IOGP SIF precursor metrics, and operational risk heat maps for Oil India Limited.')}
            </p>
          </div>

          {/* Shift Operational SIF Risk Index Card */}
          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm space-y-1 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {t('shift_risk_index', 'Shift Operational Risk Index')}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-[#FF5E3A] font-mono">{riskIndex.score}/100</span>
              <span className="text-[11px] font-bold text-slate-700 max-w-[140px] leading-tight">
                {riskIndex.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Faceted Interactive Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 p-3 rounded-2xl border border-white/80 backdrop-blur-xl shadow-sm text-xs font-extrabold">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 px-2 uppercase tracking-wider text-[10px]">{t('filter_department_label', 'Filter Department:')}</span>
          {['ALL', 'Electrical', 'Fire & Gas', 'Mechanical & Lifting', 'Civil & Height', 'HSE / Safety', 'Operations'].map((dept) => (
            <button
              key={dept}
              onClick={() => toggleDept(dept)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedDepts.includes(dept)
                  ? 'bg-[#FF5E3A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 px-2 uppercase tracking-wider text-[10px]">{t('filter_risk_label', 'Risk:')}</span>
          <button
            onClick={() => setSelectedRisk('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${selectedRisk === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-white'}`}
          >
            {t('all_risk_label', 'All Risk')}
          </button>
          <button
            onClick={() => setSelectedRisk('SIF')}
            className={`px-3 py-1.5 rounded-xl transition-all ${selectedRisk === 'SIF' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-white'}`}
          >
            {t('sif_precursors_filter', 'SIF Precursors')}
          </button>
          <button
            onClick={() => setSelectedRisk('Non-SIF')}
            className={`px-3 py-1.5 rounded-xl transition-all ${selectedRisk === 'Non-SIF' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-white'}`}
          >
            {t('non_sif_filter', 'Non-SIF')}
          </button>
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('total_reports', 'Total Observations')}
          value={metrics.total}
          subtitle={t('stat_processed_nlp', 'Processed through DistilBERT NLP')}
          color="blue"
        />

        <StatCard
          title={t('sif_precursors', 'High Risk SIF Precursors')}
          value={metrics.sifCount}
          subtitle={`${highRiskRate}${t('stat_precursor_ratio', '% Precursor Ratio')}`}
          color="red"
        />

        <StatCard
          title={t('low_risk_count', 'Low Risk Observations')}
          value={metrics.nonSifCount}
          subtitle={t('stat_routine_log', 'Routine Safety Log')}
          color="green"
        />

        <StatCard
          title={t('avg_confidence', 'Avg AI Confidence')}
          value={metrics.avgConfidence}
          subtitle={t('stat_model_precision', 'DistilBERT Model Precision')}
          color="teal"
          suffix="%"
        />
      </div>

      {/* Plant & Sector Risk Heat Map Component */}
      <RiskHeatMap history={filteredHistory} />

      {/* Recurring Safety Pattern & Barrier Failure Detector Component */}
      <RecurringPatternDetector history={filteredHistory} />

      {/* AI Executive Safety Briefing Component */}
      <AIExecutiveSummary history={filteredHistory} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskDistributionChart
          sifCount={metrics.sifCount}
          nonSifCount={metrics.nonSifCount}
        />

        <IncidentTrendChart history={filteredHistory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HazardCategoryChart data={metrics.categoryData} />

        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-sm space-y-4 text-left">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200">
              <span className="material-symbols-outlined text-base">equalizer</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Operational Telemetry Summary
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live system monitoring for Oil India Limited installations
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Active Oil India Field Sites:</span>
              <span className="font-extrabold text-slate-900">Duliajan, Digboi, Moran, Jorhat, Rig #7</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">IOGP Life-Saving Rules Coverage:</span>
              <span className="font-extrabold text-emerald-600">100% Active (9/9 Rules)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-semibold">Explainable AI (XAI) Status:</span>
              <span className="font-extrabold text-blue-600 font-mono">DistilBERT Token Highlighter Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Risk Intelligence Breakdown */}
      <div className="space-y-4 pt-4">
        <h2 className="font-display-xl text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF5E3A]">
            warning
          </span>
          <span>Operational Risk Intelligence Breakdown</span>
        </h2>

        <AnalyticsWidgets history={filteredHistory} />
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;