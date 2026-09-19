import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  apiFetchReports,
  apiSaveReportWithAI,
  apiUpdateReportStatus,
  apiDeleteReport,
  formatReportRecord,
} from '../services/reports';

import { analyzeHazardInsights } from '../utils/hazardAnalyzer';

const PredictionContext = createContext();
const STORAGE_KEY = 'sif_prediction_history';

const DEFAULT_SEED_REPORTS = [
  {
    id: 'OIL-PRED-101',
    title: 'Hydrogen Sulfide Gas Vapor Leak near Burner',
    report: 'Hydrocarbon gas vapor leak (42% LEL) detected near furnace burner #3 during shift change.',
    narrative: 'Hydrocarbon gas vapor leak (42% LEL) detected near furnace burner #3 during shift change.',
    location: 'Duliajan Gas Processing Unit 3',
    reporterName: 'Pranab Bora',
    reporterId: 'EMP-2041',
    department: 'Fire & Gas',
    company: 'Oil India Limited',
    prediction: 'SIF',
    confidence: 94.8,
    hazardCategory: 'Fire & Gas',
    recommendedActions: ['Isolate fuel gas supply valve', 'Don breathing apparatus (SCBA)', 'Evacuate burner perimeter'],
    executionTimeMs: 128,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'High Risk',
    reviewStatus: 'Submitted',
  },
  {
    id: 'OIL-PRED-102',
    title: '415V Switchgear MCC-2 LOTO Bypass during Cable Pulling',
    report: '415V electrical panel maintenance started without applying Lock-Out Tag-Out padlock.',
    narrative: '415V electrical panel maintenance started without applying Lock-Out Tag-Out padlock.',
    location: 'Digboi Refinery Substation 2',
    reporterName: 'Anil Baruah',
    reporterId: 'EMP-3108',
    department: 'Electrical',
    company: 'Oil India Limited',
    prediction: 'SIF',
    confidence: 96.2,
    hazardCategory: 'Electrical',
    recommendedActions: ['Immediate power isolation', 'Attach red safety padlock and lockbox tag', 'Re-brief IOGP Rule #4'],
    executionTimeMs: 142,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'High Risk',
    reviewStatus: 'Under Review',
  },
  {
    id: 'OIL-PRED-103',
    title: 'Unanchored Lanyard during Rig Derrick Scaffold Inspection',
    report: 'Worker fell 6 meters from scaffold due to unanchored lanyard tie-off point on drilling rig.',
    narrative: 'Worker fell 6 meters from scaffold due to unanchored lanyard tie-off point on drilling rig.',
    location: 'Moran Drilling Rig #7',
    reporterName: 'Deepak Saikia',
    reporterId: 'EMP-1980',
    department: 'Civil & Height',
    company: 'Oil India Limited',
    prediction: 'SIF',
    confidence: 97.5,
    hazardCategory: 'Civil & Height',
    recommendedActions: ['Install overhead static life line', '100% tie-off dual lanyards mandatory', 'Inspect scaffold green tag'],
    executionTimeMs: 110,
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'High Risk',
    reviewStatus: 'Action In Progress',
  },
  {
    id: 'OIL-PRED-104',
    title: 'Routine Shift Housekeeping Walkaround Corridor Floor',
    report: 'Minor water puddle noticed on corridor floor during shift walkaround. Warning cone placed.',
    narrative: 'Minor water puddle noticed on corridor floor during shift walkaround. Warning cone placed.',
    location: 'Duliajan Admin Complex',
    reporterName: 'Ramesh Gogoi',
    reporterId: 'EMP-4012',
    department: 'HSE / Safety',
    company: 'Oil India Limited',
    prediction: 'Non-SIF',
    confidence: 91.3,
    hazardCategory: 'General Safety',
    recommendedActions: ['Dry floor using mop', 'Clear drainage line'],
    executionTimeMs: 95,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'Low Risk',
    reviewStatus: 'Resolved',
  },
  {
    id: 'OIL-PRED-105',
    title: 'Toolbox Storage Room PPE Inventory Replenishment',
    report: 'Safety goggles and hearing ear defenders replaced in toolbox room before routine maintenance inspection.',
    narrative: 'Safety goggles and hearing ear defenders replaced in toolbox room before routine maintenance inspection.',
    location: 'Jorhat Central Workshop',
    reporterName: 'Bipul Das',
    reporterId: 'EMP-2450',
    department: 'Mechanical & Lifting',
    company: 'Oil India Limited',
    prediction: 'Non-SIF',
    confidence: 89.6,
    hazardCategory: 'General Safety',
    recommendedActions: ['Log replaced PPE in inventory ledger'],
    executionTimeMs: 88,
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'Low Risk',
    reviewStatus: 'Resolved',
  }
];

export const PredictionProvider = ({ children }) => {
  const { user, isSafetyOfficer } = useAuth();
  
  const [history, setHistory] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached history:', e);
    }
    return DEFAULT_SEED_REPORTS;
  });

  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const saveToStorage = (updatedHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Failed to cache history in localStorage:', e);
    }
  };

  // Load live reports from Database whenever user or role changes
  const refreshReports = useCallback(async (silent = false) => {
    if (!user) {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed);
            return;
          }
        }
      } catch (e) {}
      setHistory(prev => (prev && prev.length > 0 ? prev : DEFAULT_SEED_REPORTS));
      return;
    }

    if (!silent) setIsLoadingReports(true);
    try {
      const dbRecords = await apiFetchReports(user.id, isSafetyOfficer);
      if (Array.isArray(dbRecords) && dbRecords.length > 0) {
        setHistory(prev => {
          const dbIds = new Set(dbRecords.map(r => r.id));
          const localOnly = prev.filter(p => !dbIds.has(p.id) && !p.id.startsWith('OIL-PRED-'));
          const merged = [...localOnly, ...dbRecords];
          saveToStorage(merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn('Error loading reports from database:', err);
    } finally {
      if (!silent) setIsLoadingReports(false);
    }
  }, [user, isSafetyOfficer]);

  useEffect(() => {
    refreshReports(false);

    if (!user) return;

    // Live sync polling every 4 seconds to sync status changes and new reports seamlessly
    const interval = setInterval(() => {
      refreshReports(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [refreshReports, user]);

  // Add new prediction report & persist to State, LocalStorage, and Database
  const addPrediction = async (newPred) => {
    const reportText = newPred.report || newPred.narrative || '';
    const insights = analyzeHazardInsights(reportText, newPred.prediction);

    const formatted = formatReportRecord({
      id: newPred.id || `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newPred.title || 'Industrial Safety Observation',
      report: reportText,
      narrative: reportText,
      location: newPred.location || 'Oil India Field Site',
      reporterName: newPred.reporterName || user?.name || 'Field Observer',
      reporterId: newPred.reporterId || user?.employeeId || user?.officerId || 'EMP-1001',
      department: newPred.department || insights.primaryCategory || 'Operations',
      company: newPred.company || user?.company || 'Oil India Limited',
      prediction: newPred.prediction,
      confidence: newPred.confidence,
      hazardCategory: newPred.hazardCategory || insights.primaryCategory || 'General Safety',
      recommendedActions: newPred.recommendedActions || insights.recommendedPPE || [],
      executionTimeMs: newPred.executionTimeMs || 135,
      timestamp: newPred.timestamp || new Date().toISOString(),
      reviewStatus: newPred.reviewStatus || 'Submitted',
    });

    // Update local state and localStorage immediately
    setHistory(prev => {
      const filtered = prev.filter(item => item.id !== formatted.id);
      const updated = [formatted, ...filtered];
      saveToStorage(updated);
      return updated;
    });

    // If user is authenticated, also save to FastAPI database
    if (user) {
      const aiData = {
        prediction: formatted.prediction,
        confidence: formatted.confidence,
        hazardCategory: formatted.hazardCategory,
        recommendedActions: formatted.recommendedActions,
        executionTimeMs: formatted.executionTimeMs,
      };
      try {
        const savedBackend = await apiSaveReportWithAI(formatted, aiData, user);
        if (savedBackend && savedBackend.id) {
          setHistory(prev => {
            const updated = prev.map(item => item.id === formatted.id ? savedBackend : item);
            saveToStorage(updated);
            return updated;
          });
          return savedBackend;
        }
      } catch (err) {
        console.warn('Backend save deferred/failed, retained locally in localStorage:', err);
      }
    }

    return formatted;
  };

  // Update report status in State, LocalStorage, and Database
  const updateReportStatus = async (id, newStatus) => {
    setHistory(prev => {
      const updated = prev.map(item => (item.id === id ? { ...item, reviewStatus: newStatus } : item));
      saveToStorage(updated);
      return updated;
    });
    if (user && isSafetyOfficer) {
      try {
        await apiUpdateReportStatus(id, newStatus);
      } catch (err) {
        console.warn('Status update API call failed:', err);
      }
    }
  };

  // Delete prediction report from State, LocalStorage, and Database
  const deletePrediction = async (id) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
    if (user) {
      try {
        await apiDeleteReport(id);
      } catch (err) {
        console.warn('Delete API call failed:', err);
      }
    }
  };

  // Clear history
  const clearHistory = async () => {
    if (user) {
      history.forEach(item => {
        if (!item.id.startsWith('rep-') && !item.id.startsWith('batch-') && !item.id.startsWith('OIL-PRED-')) {
          apiDeleteReport(item.id).catch(() => {});
        }
      });
    }
    setHistory([]);
    saveToStorage([]);
  };

  // Compute live dashboard metrics from database and local records
  const totalPredictions = history.length;
  const highRiskCount = history.filter(h => h.prediction === 'SIF').length;
  const lowRiskCount = history.filter(h => h.prediction === 'Non-SIF').length;
  const avgConfidence = totalPredictions > 0
    ? (history.reduce((acc, curr) => acc + (Number(curr.confidence) || 0), 0) / totalPredictions).toFixed(2)
    : 0;

  const stats = {
    reportsAnalyzed: totalPredictions,
    highRiskReports: highRiskCount,
    lowRiskReports: lowRiskCount,
    averageConfidence: avgConfidence,
    totalPredictions: totalPredictions,
  };

  return (
    <PredictionContext.Provider value={{
      history,
      isLoadingReports,
      refreshReports,
      addPrediction,
      updateReportStatus,
      deletePrediction,
      clearHistory,
      stats,
    }}>
      {children}
    </PredictionContext.Provider>
  );
};

export const usePredictions = () => useContext(PredictionContext);
export default PredictionContext;
