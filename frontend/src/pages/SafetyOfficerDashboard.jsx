import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionContext';
import HistoryTable from '../components/history/HistoryTable';
import StatCard from '../components/common/StatCard';
import RiskHeatMap from '../components/analytics/RiskHeatMap';
import AIExecutiveSummary from '../components/analytics/AIExecutiveSummary';
import { calculateOilIndiaRiskIndex } from '../utils/hazardAnalyzer';
import { generateBatchReportPDF } from '../utils/pdfGenerator';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export const SafetyOfficerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history, deletePrediction, clearHistory } = usePredictions();
  const { t } = useLanguage();
  const [selectedDepts, setSelectedDepts] = useState(['ALL']);
  const [customFilteredList, setCustomFilteredList] = useState(null);

  // Exclude off-topic / unrelated inputs & apply selected department filter
  const validSafetyReports = useMemo(() => {
    return history.filter(h => {
      const isValid = h.prediction !== 'Unrelated Input' && h.prediction !== 'Unrelated';
      const matchesDept = selectedDepts.includes('ALL') || selectedDepts.some(filterCat => {
        const catLow = filterCat.toLowerCase();
        const deptLow = (h.department || 'operations').toLowerCase();
        const hazLow = (h.hazardCategory || '').toLowerCase();
        const reportLow = (h.report || h.narrative || '').toLowerCase();
        
        if (catLow === 'fire & gas') return hazLow.includes('fire') || hazLow.includes('gas') || reportLow.includes('fire') || reportLow.includes('gas') || deptLow.includes('fire') || deptLow.includes('gas');
        if (catLow === 'mechanical & lifting') return hazLow.includes('mechanic') || hazLow.includes('lift') || reportLow.includes('mechanic') || reportLow.includes('lift') || deptLow.includes('mechanic') || deptLow.includes('lift');
        if (catLow === 'civil & height') return hazLow.includes('civil') || hazLow.includes('height') || hazLow.includes('fall') || reportLow.includes('height') || reportLow.includes('fall') || deptLow.includes('civil');
        if (catLow === 'hse / safety') return hazLow.includes('hse') || hazLow.includes('safet') || deptLow.includes('hse') || deptLow.includes('safet');
        
        return deptLow.includes(catLow) || hazLow.includes(catLow) || reportLow.includes(catLow);
      });
      return isValid && matchesDept;
    });
  }, [history, selectedDepts]);

  const displayList = customFilteredList || validSafetyReports;

  const sifReports = validSafetyReports.filter(h => h.prediction === 'SIF');
  const routineReports = validSafetyReports.filter(h => h.prediction !== 'SIF');

  const totalPlantReports = validSafetyReports.length;
  const sifRate = totalPlantReports > 0
    ? ((sifReports.length / totalPlantReports) * 100).toFixed(1)
    : '0.0';

  const riskIndex = calculateOilIndiaRiskIndex(validSafetyReports);

  const handleExportPDF = () => {
    generateBatchReportPDF(validSafetyReports);
  };

  const toggleDept = (deptId) => {
    if (deptId === 'ALL') {
      setSelectedDepts(['ALL']);
    } else {
      let newDepts = selectedDepts.filter(d => d !== 'ALL');
      if (newDepts.includes(deptId)) {
        newDepts = newDepts.filter(d => d !== deptId);
        if (newDepts.length === 0) newDepts = ['ALL'];
      } else {
        newDepts.push(deptId);
      }
      setSelectedDepts(newDepts);
    }
    setCustomFilteredList(null);
  };

  const DEPARTMENTS = [
    { id: 'ALL', label: t('dept_all', 'All Departments') },
    { id: 'Electrical', label: t('dept_electrical', 'Electrical') },
    { id: 'Fire & Gas', label: t('dept_fire_gas', 'Fire & Gas') },
    { id: 'Mechanical & Lifting', label: t('dept_mechanical', 'Mechanical & Lifting') },
    { id: 'Civil & Height', label: t('dept_civil', 'Civil & Height') },
    { id: 'HSE / Safety', label: t('dept_hse', 'HSE / Safety') },
    { id: 'Operations', label: t('dept_operations', 'Operations') }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-24 max-w-6xl mx-auto px-6 text-left"
    >
      {/* Executive Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white rounded-full px-4 py-1.5 text-xs font-extrabold">
            <span className="material-symbols-outlined text-sm text-[#FF5E3A]">shield_person</span>
            <span>{t('officer_hub', 'Chief Safety Officer Command Hub — Oil India Limited')}</span>
          </div>

          <h1 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('exec_overview', 'Executive Safety Overview')}
          </h1>

          <p className="text-sm text-slate-600 font-medium max-w-2xl">
            {t('logged_as', 'Logged as:')} <span className="font-bold text-slate-900">{user?.name || 'Safety Officer'}</span> | {t('officer_id', 'Officer ID:')} <span className="font-mono font-bold text-slate-900">{user?.officerId || user?.employeeId || 'SO-101'}</span> | {t('biometrics', 'Biometrics:')} <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-800 font-bold text-xs border border-emerald-300">{user?.face_registered ? t('verified', 'Verified') : 'Not Enrolled'}</span>
          </p>
        </div>

        {/* Operational Shift Risk Index Widget */}
        <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm space-y-1 shrink-0">
          <span className="text-[10px] font-extrabold uppercase text-slate-400">{t('shift_risk_score', 'Shift Risk Score')}</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-[#FF5E3A] font-mono">{riskIndex?.score ?? 0}/100</span>
            <span className="text-[10px] font-bold text-slate-700 max-w-[120px] leading-tight">{riskIndex?.status || t('low_operational_risk', 'Low Operational Risk Factor')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-[#FF5E3A]">monitoring</span>
            <span>{t('analytics', 'Analytics')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/batch')}
            className="px-4 py-2.5 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>{t('batch', 'Batch Analysis')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-full bg-white border border-slate-300 text-slate-900 hover:bg-slate-50 font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>{t('export_pdf', 'Export Report')}</span>
          </button>
        </div>
      </div>


      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={t('total_reports', 'Total Safety Observations')}
          value={totalPlantReports}
          subtitle={t('submitted_all_shifts', 'Submitted across all shifts')}
          color="blue"
        />

        <StatCard
          title={t('sif_precursors', 'Critical SIF Precursors')}
          value={sifReports.length}
          subtitle={`${sifRate}% ${t('precursor_ratio', 'Precursor Ratio')}`}
          color="red"
        />

        <StatCard
          title={t('low_risk_count', 'Low Risk Observations')}
          value={routineReports.length}
          subtitle={t('routine_safety_items', 'Routine Safety Items')}
          color="green"
        />

        <StatCard
          title={t('distilbert_accuracy', 'DistilBERT Model Accuracy')}
          value="98.4%"
          subtitle={t('nlp_classification_model', 'NLP Classification Model')}
          color="teal"
        />
      </div>

      {/* AI Executive Safety Briefing */}
      <AIExecutiveSummary history={validSafetyReports} />

      {/* Plant & Sector Precursor Heat Map */}
      <RiskHeatMap history={validSafetyReports} />

      {/* Department Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-white/60 p-2.5 rounded-2xl border border-white/80 backdrop-blur-xl shadow-sm text-xs font-extrabold">
        <span className="text-slate-500 px-3 uppercase tracking-wider text-[10px]">{t('filter_department', 'Filter Department:')}</span>
        {DEPARTMENTS.map((dept) => (
          <button
            key={dept.id}
            onClick={() => toggleDept(dept.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              selectedDepts.includes(dept.id) && !customFilteredList
                ? 'bg-[#FF5E3A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Master Audit Log Table */}
      <div className="space-y-4 pt-4">
        <h2 className="font-display-xl text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#FF5E3A]">fact_check</span>
          <span>{t('master_observation_registry', 'Master Observation Registry & Review Queue')}</span>
        </h2>

        <HistoryTable
          history={displayList}
          onDelete={deletePrediction}
          onClearAll={clearHistory}
        />
      </div>
    </motion.div>
  );
};

export default SafetyOfficerDashboard;
