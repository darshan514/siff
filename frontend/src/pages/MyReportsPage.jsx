import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../context/PredictionContext';
import { generateIncidentReportPDF } from '../utils/pdfGenerator';
import { formatDate } from '../utils/formatters';
import { detectIOGPRule } from '../utils/hazardAnalyzer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

export const MyReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { history, isLoadingReports } = usePredictions();
  const { t } = useLanguage();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Filter reports according to selected status tab and department filter
  const myReports = useMemo(() => {
    return history.filter(item => {
      const matchesStatus = statusFilter === 'ALL' || item.reviewStatus === statusFilter;
      const matchesDept = departmentFilter === 'ALL' || (item.department || 'Operations') === departmentFilter;
      return matchesStatus && matchesDept;
    });
  }, [history, statusFilter, departmentFilter]);

  const getStatusBadge = (status) => {
    if (status === 'Rejected — Off-Topic' || status === 'Rejected' || status === 'Filtered Out') {
      return 'bg-amber-500/10 text-amber-800 border-amber-300';
    }
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-800 border-blue-300';
      case 'Under Review':
        return 'bg-purple-500/10 text-purple-800 border-purple-300';
      case 'Action In Progress':
        return 'bg-purple-500/10 text-purple-800 border-purple-300';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-24 max-w-6xl mx-auto px-6 text-left"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[#FF5E3A] text-sm">assignment</span>
            <span className="font-body-md text-xs font-semibold text-slate-800">
              {t('oil_india_hq', 'Oil India Limited — Incident Ledger')}
            </span>
          </div>

          <h1 className="font-display-xl text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {t('my_reports_title', 'My Incident Reports')}
          </h1>

          <p className="text-base text-slate-600 max-w-xl">
            {t('my_reports_subtitle', 'Track real-time review status, IOGP Life-Saving Rules, safety recommendations, and download official PDF reports.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/predict')}
          className="px-6 py-3.5 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add_alert</span>
          <span>{t('file_new_report_btn', 'Submit New Incident')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 bg-white/60 p-2 rounded-2xl border border-white/80 backdrop-blur-xl shadow-sm text-xs font-extrabold">
          <span className="text-slate-500 px-3 uppercase tracking-wider text-[10px]">{t('filter_status', 'Filter Status:')}</span>
          
          {[
            { id: 'ALL', label: `${t('filter_all', 'All Reports')} (${history.length})` },
            { id: 'Submitted', label: t('status_submitted', 'Submitted') },
            { id: 'Under Review', label: t('status_under_review', 'Under Review') },
            { id: 'Action In Progress', label: t('status_action_in_progress', 'Action In Progress') },
            { id: 'Resolved', label: t('status_resolved', 'Resolved') },
            { id: 'Rejected — Off-Topic', label: t('status_rejected', 'Rejected') }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-4 py-2 rounded-xl transition-all ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Department Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white/60 p-2 rounded-2xl border border-white/80 backdrop-blur-xl shadow-sm text-xs font-extrabold">
          <span className="text-slate-500 px-3 uppercase tracking-wider text-[10px]">{t('filter_department', 'Filter Department:')}</span>
          {[
            { id: 'ALL', label: t('dept_all', 'ALL') },
            { id: 'Electrical', label: t('dept_electrical', 'Electrical') },
            { id: 'Fire & Gas', label: t('dept_fire_gas', 'Fire & Gas') },
            { id: 'Mechanical & Lifting', label: t('dept_mechanical', 'Mechanical & Lifting') },
            { id: 'Civil & Height', label: t('dept_civil', 'Civil & Height') },
            { id: 'HSE / Safety', label: t('dept_hse', 'HSE / Safety') },
            { id: 'Operations', label: t('dept_operations', 'Operations') }
          ].map((dept) => (
            <button
              key={dept.id}
              onClick={() => setDepartmentFilter(dept.id)}
              className={`px-3.5 py-1.5 rounded-xl transition-all ${
                departmentFilter === dept.id
                  ? 'bg-[#FF5E3A] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoadingReports ? (
        <div className="p-12 text-center bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80">
          <LoadingSpinner label={t('analyzing', 'Fetching Live Reports from Database...')} />
        </div>
      ) : (
        /* Incident Reports Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myReports.length > 0 ? (
            myReports.map((item) => {
              const isSIF = item.prediction === 'SIF';
              const isUnrelated = item.prediction === 'Unrelated Input' || item.prediction === 'Unrelated';
              const iogp = detectIOGPRule(item.report);

              return (
                <div
                  key={item.id}
                  className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 space-y-4 hover:shadow-md transition-all text-left flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3 border-b border-slate-200/60 pb-3">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-slate-400">{item.id}</span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{item.title || t('form_narrative_label', 'Safety Observation')}</h3>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(item.reviewStatus || 'Submitted')}`}>
                        {item.reviewStatus || t('status_submitted', 'Submitted')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                      <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                      <span>{item.location || 'Plant Unit'}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                        {item.department || 'Operations'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{formatDate(item.timestamp)}</span>
                    </div>

                    <p className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/60 text-xs text-slate-800 leading-relaxed font-medium line-clamp-3">
                      "{item.report}"
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[10px] font-extrabold text-[#FF5E3A] bg-[#FF5E3A]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">{iogp.icon}</span>
                        <span>{iogp.name}</span>
                      </span>

                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                        isUnrelated
                          ? 'bg-amber-500/10 text-amber-800 border-amber-300'
                          : isSIF
                          ? 'bg-red-500/10 text-red-800 border-red-300'
                          : 'bg-emerald-500/10 text-emerald-800 border-emerald-300'
                      }`}>
                        {isUnrelated
                          ? t('unrelated_input', 'Unrelated Query')
                          : isSIF
                          ? `${t('high_risk', 'SIF Risk')} (${item.confidence?.toFixed(1)}%)`
                          : `${t('low_risk', 'Low Risk')} (${item.confidence?.toFixed(1)}%)`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedIncident(item)}
                      className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 shadow-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>{t('view_details', 'View Details')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => generateIncidentReportPDF(item.report, item)}
                      className="px-4 py-2 rounded-full text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm text-[#FF5E3A]">picture_as_pdf</span>
                      <span>{t('download_pdf', 'Download PDF')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 p-12 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-slate-400">assignment_late</span>
              <p className="font-bold text-base text-slate-800">{t('no_reports_found', 'No incident reports found matching filter.')}</p>
              <Link to="/predict" className="inline-block px-6 py-2.5 rounded-full bg-[#FF5E3A] text-white font-extrabold text-xs shadow-md">
                {t('file_new_report_btn', 'Submit New Incident')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-8 border border-white space-y-5 relative shadow-2xl text-left">
            <button
              onClick={() => setSelectedIncident(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-slate-400">{selectedIncident.id}</span>
              <h3 className="font-extrabold text-xl text-slate-900">{selectedIncident.title || t('form_narrative_label', 'Safety Observation')}</h3>
              <p className="text-xs text-slate-500 font-medium">{selectedIncident.location} • {formatDate(selectedIncident.timestamp)}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(selectedIncident.reviewStatus || 'Submitted')}`}>
                {t('th_review_status', 'Status')}: {selectedIncident.reviewStatus || 'Submitted'}
              </span>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                selectedIncident.prediction === 'SIF' ? 'bg-red-500/10 text-red-800 border-red-300' : 'bg-emerald-500/10 text-emerald-800 border-emerald-300'
              }`}>
                {selectedIncident.prediction === 'SIF' ? t('high_risk', 'SIF High Risk') : t('low_risk', 'Low Risk')} ({selectedIncident.confidence?.toFixed(1)}%)
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">{t('th_narrative_detail', 'Narrative Detail')}</span>
              <p className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 leading-relaxed font-medium">
                "{selectedIncident.report}"
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => generateIncidentReportPDF(selectedIncident.report, selectedIncident)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base text-[#FF5E3A]">picture_as_pdf</span>
                <span>{t('download_pdf', 'Download PDF')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};

export default MyReportsPage;
