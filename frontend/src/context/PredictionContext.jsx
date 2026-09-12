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

export const PredictionProvider = ({ children }) => {
  const { user, isSafetyOfficer } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Load live reports from Database whenever user or role changes
  const refreshReports = useCallback(async (silent = false) => {
    if (!user) {
      setHistory([]);
      return;
    }
    if (!silent) setIsLoadingReports(true);
    try {
      const records = await apiFetchReports(user.id, isSafetyOfficer);
      setHistory(records || []);
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

  // Add new prediction report & persist to Database
  const addPrediction = async (newPred) => {
    const reportText = newPred.report || newPred.narrative || '';
    const insights = analyzeHazardInsights(reportText, newPred.prediction);

    const aiData = {
      prediction: newPred.prediction,
      confidence: newPred.confidence,
      hazardCategory: newPred.hazardCategory || insights.primaryCategory || 'General Safety',
      recommendedActions: newPred.recommendedActions || insights.recommendedActions || [],
      executionTimeMs: newPred.executionTimeMs || 135,
    };

    if (!user) {
      // Guest mode - save to local session history only
      const mockRecord = formatReportRecord({ 
        report: newPred.report || newPred.narrative,
        prediction: newPred.prediction,
        confidence: newPred.confidence,
        hazardCategory: aiData.hazardCategory,
        recommendedActions: aiData.recommendedActions,
        executionTimeMs: aiData.executionTimeMs,
      });
      setHistory(prev => [mockRecord, ...prev]);
      return mockRecord;
    }

    try {
      const savedRecord = await apiSaveReportWithAI(newPred, aiData, user);
      setHistory(prev => [savedRecord, ...prev]);
      return savedRecord;
    } catch (err) {
      console.warn("Failed to save report to backend, saving locally for this session.", err);
      const mockRecord = formatReportRecord({ 
        report: newPred.report || newPred.narrative,
        prediction: newPred.prediction,
        confidence: newPred.confidence,
        hazardCategory: aiData.hazardCategory,
        recommendedActions: aiData.recommendedActions,
        executionTimeMs: aiData.executionTimeMs,
      });
      setHistory(prev => [mockRecord, ...prev]);
      return mockRecord;
    }
  };

  // Update report status in Database
  const updateReportStatus = async (id, newStatus) => {
    setHistory(prev =>
      prev.map(item => (item.id === id ? { ...item, reviewStatus: newStatus } : item))
    );
    await apiUpdateReportStatus(id, newStatus);
  };

  // Delete prediction report from Database
  const deletePrediction = async (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    await apiDeleteReport(id);
  };

  // Clear history
  const clearHistory = async () => {
    history.forEach(item => {
      apiDeleteReport(item.id);
    });
    setHistory([]);
  };

  // Compute live dashboard metrics from database records
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
