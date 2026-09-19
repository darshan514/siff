import React, { useState, useMemo } from 'react';
import { usePredictions } from '../context/PredictionContext';
import { predictSIFRisk, predictDemoFallback } from '../services/api';
import { generateBatchReportPDF } from '../utils/pdfGenerator';
import RiskBadge from '../components/common/RiskBadge';
import { analyzeHazardInsights } from '../utils/hazardAnalyzer';
import { translateToEnglish } from '../utils/translator';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Download, RefreshCw, CheckCircle2, Filter, ArrowUpDown, FileText, Mail, FileAudio } from 'lucide-react';
import { parseMultiSourceFile, SAMPLE_MULTI_SOURCE } from '../utils/multiSourceParser';
import AudioUploadModal from '../components/intelligence/AudioUploadModal';

const SAMPLE_BATCH_REPORTS = [
  'Worker fell 6 meters from scaffold due to unanchored lanyard tie-off point',
  '415V electrical panel maintenance started without applying Lock-Out Tag-Out',
  'Hydrocarbon gas vapor leak (42% LEL) detected near furnace burner #3',
  'Minor water puddle noticed on corridor floor during shift walkaround',
  'Safety goggles replaced in toolbox room before routine inspection',
  'Heavy crane boom swung over unevacuated rigging work zone'
];

export const BatchPage = () => {
  const { addPrediction } = usePredictions();
  const { t, lang } = useLanguage();
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [batchResults, setBatchResults] = useState([]);
  
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);
  
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE'); // NONE, SIF_HIGH_LOW, SIF_LOW_HIGH, DATE_NEW_OLD, DATE_OLD_NEW

  const SECTORS = ['ALL', 'Height', 'Civil', 'Fire', 'Water', 'Electrical', 'Mechanical'];
  
  const displayBatch = useMemo(() => {
    return batchResults.filter(r => {
      if (sectorFilter === 'ALL') return true;
      const lowerCat = r.category.toLowerCase();
      const lowerRep = r.report.toLowerCase();
      const s = sectorFilter.toLowerCase();
      return lowerCat.includes(s) || lowerRep.includes(s);
    }).sort((a,b) => {
       if (sortOrder === 'SIF_HIGH_LOW') {
         if (a.prediction === 'SIF' && b.prediction !== 'SIF') return -1;
         if (b.prediction === 'SIF' && a.prediction !== 'SIF') return 1;
         return b.confidence - a.confidence;
       }
       if (sortOrder === 'SIF_LOW_HIGH') {
         if (a.prediction !== 'SIF' && b.prediction === 'SIF') return -1;
         if (b.prediction !== 'SIF' && a.prediction === 'SIF') return 1;
         return a.confidence - b.confidence;
       }
       if (sortOrder === 'DATE_NEW_OLD') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
       if (sortOrder === 'DATE_OLD_NEW') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
       return 0;
    });
  }, [batchResults, sectorFilter, sortOrder]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsed = await parseMultiSourceFile(file);
      if (parsed.type === 'audio') {
        setIsAudioModalOpen(true);
        return;
      }
      if (parsed.rawText) {
        setRawText(parsed.rawText);
        setUploadFeedback(`Ingested ${parsed.narratives.length} records from ${parsed.fileName} (${parsed.type.toUpperCase()})`);
      }
    } catch (err) {
      console.warn("Multi-source parser error, falling back:", err);
      const reader = new FileReader();
      reader.onload = (evt) => {
        setRawText(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSampleBatch = () => {
    setRawText(SAMPLE_BATCH_REPORTS.join('\n'));
    setUploadFeedback("Loaded 6 Sample Industrial Safety Observations (CSV)");
  };

  const handleLoadExcelSample = () => {
    setRawText(SAMPLE_MULTI_SOURCE.EXCEL_MAINTENANCE.join('\n'));
    setUploadFeedback("Loaded 5 Equipment & Maintenance Records (Excel Format)");
  };

  const handleLoadEmailSample = () => {
    setRawText(SAMPLE_MULTI_SOURCE.INCIDENT_EMAIL.join('\n'));
    setUploadFeedback("Loaded Formal Incident Memo / Email Record");
  };

  const runBatchAnalysis = async () => {
    const reports = rawText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 3);

    if (reports.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: reports.length });
    setBatchResults([]);
    setSectorFilter('ALL');
    setSortOrder('NONE');

    const results = [];

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const englishReport = await translateToEnglish(report);
      let res;
      try {
        res = await predictSIFRisk(englishReport);
      } catch (err) {
        res = predictDemoFallback(englishReport);
      }

      const insights = analyzeHazardInsights(englishReport, res.prediction, lang);
      const fullItem = {
        id: Date.now() + i,
        report,
        prediction: res.prediction,
        confidence: res.confidence,
        executionTimeMs: res.executionTimeMs,
        timestamp: res.timestamp || new Date().toISOString(),
        category: insights.primaryCategory,
        severity: insights.riskLevel,
      };

      results.push(fullItem);
      addPrediction(fullItem);
      setProgress({ current: i + 1, total: reports.length });
      await new Promise((r) => setTimeout(r, 180));
    }

    setBatchResults(results);
    setIsProcessing(false);
  };

  const exportBatchCSV = () => {
    if (displayBatch.length === 0) return;
    const headers = ['Report Narrative', 'Prediction', 'Confidence %', 'Risk Level', 'Hazard Category', 'Latency (ms)'];
    const rows = displayBatch.map((r) => [
      `"${r.report.replace(/"/g, '""')}"`,
      r.prediction,
      r.confidence.toFixed(2),
      r.severity,
      `"${r.category.replace(/"/g, '""')}"`,
      r.executionTimeMs || 135
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Batch_SIF_Analysis_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBatchPDF = () => {
    if (displayBatch.length === 0) return;
    generateBatchReportPDF(displayBatch);
  };

  const sifCount = displayBatch.filter((r) => r.prediction === 'SIF').length;
  const nonSifCount = displayBatch.filter((r) => r.prediction === 'Non-SIF').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 py-24 max-w-6xl mx-auto px-6 text-left"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-1.5 shadow-sm">
          <span className="material-symbols-outlined text-[#FF5E3A] text-sm">upload_file</span>
          <span className="font-body-md text-xs font-semibold text-slate-800">
            {t('oil_india_hq', 'Oil India Limited — High Throughput Engine')}
          </span>
        </div>

        <h1 className="font-display-xl text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          {t('batch_title', 'Bulk CSV Safety Observation Analysis')}
        </h1>

        <p className="text-base text-slate-600 max-w-2xl font-medium">
          {t('batch_subtitle', 'Upload CSV files containing industrial safety observations for high-throughput batch SIF prediction.')}
        </p>
      </div>

      {/* Input / Dropzone Area */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-900">
            <FileSpreadsheet className="w-5 h-5 text-[#FF5E3A]" />
            <span>{t('batch_input_source', 'Multi-Source Data Ingestion Engine')}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSampleBatch}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            >
              📄 Sample CSV
            </button>
            <button
              onClick={handleLoadExcelSample}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs disabled:opacity-50"
            >
              📊 Excel Maintenance Log
            </button>
            <button
              onClick={handleLoadEmailSample}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 border border-blue-300 text-blue-800 hover:bg-blue-100 transition-colors shadow-xs disabled:opacity-50"
            >
              ✉️ Incident Email Memo
            </button>
            <button
              onClick={() => setIsAudioModalOpen(true)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 border border-purple-300 text-purple-800 hover:bg-purple-100 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1"
            >
              <FileAudio className="w-3.5 h-3.5" />
              <span>🎙️ Audio Memo</span>
            </button>
            {rawText && (
              <button
                onClick={() => {
                  setRawText('');
                  setUploadFeedback(null);
                }}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                {t('clear_history', 'Clear')}
              </button>
            )}
          </div>
        </div>

        {uploadFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{uploadFeedback}</span>
          </div>
        )}

        {/* Drag & Drop File Box */}
        <label className="border-2 border-dashed border-slate-300 hover:border-[#FF5E3A] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-white/40 hover:bg-white/70 transition-all text-center group">
          <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#FF5E3A] mb-2 transition-colors" />
          <span className="text-xs font-extrabold text-slate-800">
            {t('batch_dropzone', 'Drag and drop your observation file here, or click to browse')}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1">
            Supports CSV (.csv), Excel (.xlsx, .xls), Plain Text (.txt, .log), Email records (.eml), and Audio recordings (.mp3, .wav, .m4a)
          </span>
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.txt,.json,.eml,.mp3,.wav,.m4a"
            onChange={handleFileUpload}
            disabled={isProcessing}
            className="hidden"
          />
        </label>

        {/* Text Area for Direct Line Editing */}
        <div className="space-y-1">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            {t('form_narrative_label', 'Observation Narratives Line-by-Line')} ({rawText ? rawText.split('\n').filter(r=>r.trim()).length : 0} items)
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isProcessing}
            rows={5}
            placeholder={t('batch_placeholder', 'Paste multiple safety observations here, one per line...')}
            className="w-full p-4 rounded-xl bg-white/80 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 text-xs font-mono leading-relaxed"
          />
        </div>

        {/* Run Batch Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-medium">
            {isProcessing ? `Processing item ${progress.current} of ${progress.total}...` : t('batch_ready', 'Ready for DistilBERT batch execution')}
          </span>

          <button
            onClick={runBatchAnalysis}
            disabled={!rawText.trim() || isProcessing}
            className="px-8 py-3 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? t('analyzing', 'Analyzing Batch...') : t('batch_run_btn', 'Process Batch Analysis')}</span>
          </button>
        </div>
      </div>

      {/* Progress & Results */}
      {batchResults.length > 0 && (
        <div className="space-y-6">
          {/* Summary Stat Pills */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white/60 p-4 rounded-2xl border border-white/80 shadow-sm text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-900">{t('batch_complete', 'Batch Analysis Complete!')}</span>
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-bold">
                {t('total_reports', 'Total')}: {displayBatch.length}
              </span>
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-300 text-red-800 font-bold">
                {t('sif_precursors', 'SIF Precursors')}: {sifCount}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300 text-emerald-800 font-bold">
                {t('low_risk_count', 'Low Risk')}: {nonSifCount}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={exportBatchCSV}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#FF5E3A]" />
                <span>{t('export_csv', 'Export CSV')}</span>
              </button>
              <button
                onClick={exportBatchPDF}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold flex items-center space-x-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#FF5E3A]" />
                <span>{t('export_pdf', 'Export PDF')}</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-white/60 p-3 rounded-2xl border border-white/80 shadow-sm text-xs font-bold">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Sector:</span>
              {SECTORS.map(s => (
                <button
                  key={s}
                  onClick={() => setSectorFilter(s)}
                  className={`px-3 py-1 rounded-full transition-all ${sectorFilter === s ? 'bg-[#FF5E3A] text-white shadow-sm' : 'bg-white/50 text-slate-600 hover:bg-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-slate-300 mx-2"></div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 uppercase tracking-wider text-[10px]">Sort:</span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 outline-none focus:ring-1 focus:ring-[#FF5E3A]"
              >
                <option value="NONE">Original Order</option>
                <option value="SIF_HIGH_LOW">SIF Risk (High-Low)</option>
                <option value="SIF_LOW_HIGH">SIF Risk (Low-High)</option>
                <option value="DATE_NEW_OLD">Date (Newest First)</option>
                <option value="DATE_OLD_NEW">Date (Oldest First)</option>
              </select>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/80 text-slate-500 font-mono font-semibold uppercase tracking-wider border-b border-slate-200/80 text-[11px]">
                  <tr>
                    <th className="p-4">#</th>
                    <th className="p-4">{t('form_narrative_label', 'Observation Narrative')}</th>
                    <th className="p-4">{t('th_ai_sif_tag', 'AI SIF Risk')}</th>
                    <th className="p-4 text-right">{t('th_confidence', 'Confidence')}</th>
                    <th className="p-4">{t('form_department_label', 'Hazard Category')}</th>
                    <th className="p-4 text-right">{t('th_latency', 'Latency')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                  {displayBatch.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-white/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-400 text-[11px]">{idx + 1}</td>
                      <td className="p-4 max-w-md font-semibold text-slate-900 line-clamp-2">"{item.report}"</td>
                      <td className="p-4 whitespace-nowrap">
                        <RiskBadge riskLevel={item.prediction} size="small" />
                      </td>
                      <td className="p-4 whitespace-nowrap text-right font-mono font-bold text-slate-900">
                        {item.confidence.toFixed(1)}%
                      </td>
                      <td className="p-4 whitespace-nowrap text-slate-800 font-bold">{item.category}</td>
                      <td className="p-4 whitespace-nowrap text-right font-mono text-slate-500">{item.executionTimeMs || 135}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {displayBatch.length === 0 && (
                <div className="p-8 text-center text-slate-500 font-semibold text-sm">
                  No observations match the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audio Upload Modal */}
      <AudioUploadModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onApplyTranscript={(transcript) => {
          setRawText(prev => prev ? `${prev}\n${transcript}` : transcript);
          setUploadFeedback("Transcribed audio recording added to batch observation queue.");
        }}
      />
    </motion.div>
  );
};

export default BatchPage;
