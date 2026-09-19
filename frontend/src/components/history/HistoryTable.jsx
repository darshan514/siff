import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  X,
  FileText
} from 'lucide-react';
import RiskBadge from '../common/RiskBadge';
import { formatDate } from '../../utils/formatters';
import { generateBatchReportPDF } from '../../utils/pdfGenerator';
import { usePredictions } from '../../context/PredictionContext';
import { useAuth } from '../../context/AuthContext';
import { detectIOGPRule, explainableHighlighter } from '../../utils/hazardAnalyzer';
import XAINarrativeHighlighter from '../predict/XAINarrativeHighlighter';
import { useLanguage } from '../../context/LanguageContext';
import { motion } from 'framer-motion';

export const HistoryTable = ({ history = [], onDelete, onClearAll }) => {
  const { updateReportStatus } = usePredictions();
  const { isSafetyOfficer } = useAuth();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDepartments, setFilterDepartments] = useState(['ALL']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  const itemsPerPage = 6;

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        const textToSearch = (item.report || item.narrative || '');
        const matchesSearch =
          textToSearch.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.reporterName || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRisk = filterRisk === 'ALL' || item.prediction === filterRisk;
        const itemStatus = item.reviewStatus || 'Submitted';
        const matchesReview = filterStatus === 'ALL' 
            ? true 
            : filterStatus === 'OPEN'
                ? itemStatus !== 'Resolved'
                : itemStatus === filterStatus;
        const matchesDept = filterDepartments.includes('ALL') || filterDepartments.some(filterCat => {
        const catLow = filterCat.toLowerCase();
        const deptLow = (item.department || 'operations').toLowerCase();
        const hazLow = (item.hazardCategory || '').toLowerCase();
        const reportLow = textToSearch.toLowerCase();
        
        if (catLow === 'fire & gas') return hazLow.includes('fire') || hazLow.includes('gas') || reportLow.includes('fire') || reportLow.includes('gas') || deptLow.includes('fire') || deptLow.includes('gas');
        if (catLow === 'mechanical & lifting') return hazLow.includes('mechanic') || hazLow.includes('lift') || reportLow.includes('mechanic') || reportLow.includes('lift') || deptLow.includes('mechanic') || deptLow.includes('lift');
        if (catLow === 'civil & height') return hazLow.includes('civil') || hazLow.includes('height') || hazLow.includes('fall') || reportLow.includes('height') || reportLow.includes('fall') || deptLow.includes('civil');
        if (catLow === 'hse / safety') return hazLow.includes('hse') || hazLow.includes('safet') || deptLow.includes('hse') || deptLow.includes('safet');
        
        return deptLow.includes(catLow) || hazLow.includes(catLow) || reportLow.includes(catLow);
      });
        
        let matchesDate = true;
        if (startDate) {
          matchesDate = matchesDate && new Date(item.timestamp) >= new Date(startDate);
        }
        if (endDate) {
          // Set to end of the day
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && new Date(item.timestamp) <= endDateTime;
        }

        return matchesSearch && matchesRisk && matchesReview && matchesDept && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') return new Date(b.timestamp) - new Date(a.timestamp);
        if (sortBy === 'OLDEST') return new Date(a.timestamp) - new Date(b.timestamp);
        if (sortBy === 'SIF_HIGH_LOW') {
          if (a.prediction === 'SIF' && b.prediction !== 'SIF') return -1;
          if (b.prediction === 'SIF' && a.prediction !== 'SIF') return 1;
          return (b.confidence || 0) - (a.confidence || 0);
        }
        if (sortBy === 'SIF_LOW_HIGH') {
          if (a.prediction !== 'SIF' && b.prediction === 'SIF') return -1;
          if (b.prediction !== 'SIF' && a.prediction === 'SIF') return 1;
          return (a.confidence || 0) - (b.confidence || 0);
        }
        if (sortBy === 'HIGHEST_CONF') return (b.confidence || 0) - (a.confidence || 0);
        if (sortBy === 'LOWEST_CONF') return (a.confidence || 0) - (b.confidence || 0);
        return 0;
      });
  }, [history, searchTerm, filterRisk, filterStatus, filterDepartments, startDate, endDate, sortBy]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const exportCSV = () => {
    if (filteredHistory.length === 0) return;
    // Standard headers with report_text matching BatchPage CSV parser
    const headers = ['report_id', 'title', 'timestamp', 'reporter', 'department', 'location', 'iogp_rule', 'report_text', 'prediction', 'confidence', 'review_status'];
    const rows = filteredHistory.map(item => {
      const iogp = detectIOGPRule(item.report);
      return [
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        item.timestamp,
        `"${(item.reporterName || '').replace(/"/g, '""')}"`,
        `"${(item.department || '').replace(/"/g, '""')}"`,
        `"${(item.location || '').replace(/"/g, '""')}"`,
        `"${(iogp.name || '').replace(/"/g, '""')}"`,
        `"${(item.report || item.narrative || '').replace(/"/g, '""')}"`,
        item.prediction,
        item.confidence,
        item.reviewStatus || 'Submitted'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Oil_India_SIF_Predictions_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    if (filteredHistory.length === 0) return;
    generateBatchReportPDF(filteredHistory);
  };

  const getStatusStyle = (status) => {
    if (status === 'Rejected — Off-Topic' || status === 'Rejected' || status === 'Filtered Out') {
      return 'bg-amber-500/10 text-amber-800 border-amber-300';
    }
    switch (status) {
      case 'Submitted': return 'bg-blue-500/10 text-blue-800 border-blue-300';
      case 'Under Review': return 'bg-purple-500/10 text-purple-800 border-purple-300';
      case 'Action In Progress': return 'bg-purple-500/10 text-purple-800 border-purple-300';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-800 border-emerald-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Controls Bar */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('search_placeholder', 'Search observation narrative, department, location...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 font-medium"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          
          {/* Risk Filter Pills */}
          <div className="flex items-center space-x-1 bg-white/80 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => { setFilterRisk('ALL'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterRisk === 'ALL' ? 'bg-[#FF5E3A] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t('filter_all', 'All')} ({history.length})
            </button>
            <button
              onClick={() => { setFilterRisk('SIF'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterRisk === 'SIF' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t('sif_potential', 'SIF Risk')}
            </button>
            <button
              onClick={() => { setFilterRisk('Non-SIF'); setCurrentPage(1); }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${filterRisk === 'Non-SIF' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {t('non_sif', 'Non-SIF')}
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs bg-white/80 border border-slate-200 text-slate-700 focus:outline-none font-medium"
          >
            <option value="OPEN">{t('status_open', 'Open / Unresolved')}</option>
            <option value="ALL">{t('all_statuses', 'All Statuses')}</option>
            <option value="Submitted">{t('status_submitted', 'Submitted')}</option>
            <option value="Under Review">{t('status_under_review', 'Under Review')}</option>
            <option value="Action In Progress">{t('status_action_in_progress', 'Action In Progress')}</option>
            <option value="Resolved">{t('status_resolved', 'Resolved')}</option>
          </select>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-white/80 p-1.5 rounded-xl border border-slate-200 text-[10px] max-w-full lg:max-w-md">
            {['ALL', 'Electrical', 'Fire & Gas', 'Mechanical & Lifting', 'Civil & Height', 'HSE / Safety', 'Operations'].map((dept) => {
              const isSelected = filterDepartments.includes(dept);
              return (
                <button
                  key={dept}
                  onClick={() => {
                    if (dept === 'ALL') {
                      setFilterDepartments(['ALL']);
                    } else {
                      const newFilters = filterDepartments.includes('ALL') 
                        ? [dept]
                        : isSelected
                          ? filterDepartments.filter(d => d !== dept)
                          : [...filterDepartments, dept];
                      
                      setFilterDepartments(newFilters.length === 0 ? ['ALL'] : newFilters);
                    }
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  {dept === 'ALL' ? t('all_departments', 'All Depts') : dept}
                </button>
              );
            })}
          </div>

          {/* Date Range Filters */}
          <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span className="text-[10px] uppercase font-bold text-slate-400">{t('from_date', 'From:')}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
            />
            <span className="text-[10px] uppercase font-bold text-slate-400 ml-1">{t('to_date', 'To:')}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate(''); setCurrentPage(1); }}
                className="text-slate-400 hover:text-slate-700 font-bold ml-1"
                title="Clear Dates"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/80 border border-slate-200 text-slate-700 focus:outline-none font-medium"
          >
            <option value="NEWEST">{t('sort_newest', 'Newest First')}</option>
            <option value="OLDEST">{t('sort_oldest', 'Oldest First')}</option>
            <option value="SIF_HIGH_LOW">{t('sort_sif_high_low', 'SIF Level (High to Low)')}</option>
            <option value="SIF_LOW_HIGH">{t('sort_sif_low_high', 'SIF Level (Low to High)')}</option>
            <option value="HIGHEST_CONF">{t('sort_highest_conf', 'Highest Confidence')}</option>
            <option value="LOWEST_CONF">{t('sort_lowest_conf', 'Lowest Confidence')}</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF5E3A] hover:bg-[#ff4820] text-white flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('export_csv', 'Export CSV')}</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={exportPDF}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 shadow-sm disabled:opacity-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('export_pdf', 'Export PDF')}</span>
          </button>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/80 text-slate-500 font-mono font-semibold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
              <tr>
                <th className="p-4">{t('th_report_id', 'Report ID')}</th>
                <th className="p-4">{t('th_observation_iogp', 'Observation & IOGP Rule')}</th>
                <th className="p-4">{t('th_ai_sif_tag', 'AI SIF Tag')}</th>
                <th className="p-4 text-right">{t('th_confidence', 'Confidence')}</th>
                <th className="p-4 text-center">{t('th_review_status', 'Review Status')}</th>
                <th className="p-4 text-right">{t('th_actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => {
                  const reportText = item.report || item.narrative || '';
                  const iogp = detectIOGPRule(reportText);
                  return (
                    <tr key={item.id} className="hover:bg-white/80 transition-colors">
                      <td className="p-4 whitespace-nowrap text-slate-900 font-mono font-bold text-[11px]">
                        {item.id}
                        <p className="text-[10px] text-slate-400 font-normal">{formatDate(item.timestamp)}</p>
                      </td>
                      <td className="p-4 max-w-xs sm:max-w-md">
                        <p className="font-bold text-slate-900 line-clamp-1">{item.title || t('form_narrative_label', 'Safety Incident Observation')}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{reportText}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-extrabold text-[#FF5E3A] bg-[#FF5E3A]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">{iogp.icon}</span>
                            <span>{iogp.name}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">{t('by', 'By:')} {item.reporterName || t('worker', 'Field Observer')} ({item.department || 'Operations'})</span>
                        </div>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <RiskBadge riskLevel={item.prediction} size="small" />
                      </td>
                      <td className="p-4 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                        {item.prediction === 'Unrelated Input' || item.prediction === 'Unrelated' ? 'N/A' : `${(item.confidence || 0).toFixed(1)}%`}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {isSafetyOfficer ? (
                          <select
                            value={item.reviewStatus || 'Submitted'}
                            onChange={(e) => updateReportStatus(item.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${getStatusStyle(item.reviewStatus || 'Submitted')}`}
                          >
                            <option value="Submitted">{t('status_submitted', 'Submitted')}</option>
                            <option value="Under Review">{t('status_under_review', 'Under Review')}</option>
                            <option value="Action In Progress">{t('status_action_in_progress', 'Action In Progress')}</option>
                            <option value="Resolved">{t('status_resolved', 'Resolved')}</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusStyle(item.reviewStatus || 'Submitted')}`}>
                            {item.reviewStatus || 'Submitted'}
                          </span>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => setSelectedReport(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF5E3A] hover:bg-white transition-colors"
                          title="View Full Details & XAI"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {t('no_reports_found', 'No prediction history records found matching your filters.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="font-mono">
            {t('showing_x_to_y', 'Showing')} {filteredHistory.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} {t('to', 'to')}{' '}
            {Math.min(currentPage * itemsPerPage, filteredHistory.length)} {t('of', 'of')} {filteredHistory.length}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 font-mono">
              {t('page', 'Page')} {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail View Modal with XAI & IOGP Rule */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-white space-y-5 relative shadow-2xl text-left my-8">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <RiskBadge riskLevel={selectedReport.prediction} size="medium" />
              <span className="text-xs text-slate-500 font-mono">{formatDate(selectedReport.timestamp)}</span>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900">{selectedReport.title}</h3>
              <p className="text-xs text-slate-500">{t('by', 'By:')} {selectedReport.reporterName || 'Observer'} ({selectedReport.department || 'Operations'}) | {t('location', 'Location:')} {selectedReport.location || 'Oil India Plant'}</p>
            </div>

            {/* Explainable AI Narrative Analysis */}
            <XAINarrativeHighlighter narrative={selectedReport.report} prediction={selectedReport.prediction} />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">{t('confidence_score', 'Confidence Score')}</span>
                <p className="text-lg font-black text-slate-900">{selectedReport.confidence.toFixed(1)}%</p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-slate-400 font-bold uppercase text-[10px]">{t('iogp_rule', 'IOGP Life-Saving Rule')}</span>
                <p className="text-xs font-extrabold text-slate-900 truncate mt-1">
                  {detectIOGPRule(selectedReport.report).name}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">{t('th_latency', 'Latency')}</span>
                <p className="text-lg font-black text-slate-900">{selectedReport.executionTimeMs || 135} ms</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-[#FF5E3A] text-white rounded-2xl text-xs font-bold shadow-md hover:bg-[#ff4820] transition-colors"
              >
                {t('close', 'Close View')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HistoryTable;
