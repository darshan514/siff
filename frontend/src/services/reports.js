import { apiClient } from './api';
import { detectDepartment, generateReportTitle } from '../utils/hazardAnalyzer';

/**
 * FastAPI Reports & AI Analysis Service
 * Manages incident reports and AI prediction insights using FastAPI endpoints.
 */

export const formatReportRecord = (reportData) => {
  const pred = reportData.prediction || reportData.sif_prediction || 'SIF';
  const isUnrelated = pred === 'Unrelated Input' || pred === 'Unrelated';
  const narrative = reportData.narrative || reportData.report || '';
  
  const category = isUnrelated ? 'Non-Safety / Off-Topic' : (reportData.hazardCategory || reportData.hazard_category || 'General Safety');
  const detectedDept = isUnrelated ? 'General' : detectDepartment(narrative, category);
  const dept = reportData.department && reportData.department !== 'Operations' ? reportData.department : detectedDept;
  
  const formattedTitle = isUnrelated
    ? 'Off-Topic Non-Safety Query'
    : (reportData.title && reportData.title !== 'Industrial Safety Observation' && reportData.title !== 'Safety Observation Incident'
        ? reportData.title
        : generateReportTitle(narrative));

  return {
    id: reportData.id || `rep-${Math.random().toString(36).substring(2, 9)}`,
    userId: reportData.userId || reportData.user_id,
    title: formattedTitle,
    report: narrative,
    location: reportData.location || 'Plant Unit',
    reporterName: reportData.reporterName || reportData.reporter_name || 'Safety Observer',
    reporterId: reportData.reporterId || reportData.employee_id || 'EMP-1001',
    department: dept,
    company: reportData.company || 'SIF Enterprise',
    prediction: pred,
    confidence: isUnrelated ? 0.0 : Number(reportData.confidence || 90.0),
    hazardCategory: category,
    recommendedActions: isUnrelated ? ['Submit a valid safety report narrative'] : (reportData.recommendedActions || reportData.recommended_actions || []),
    executionTimeMs: Number(reportData.executionTimeMs || reportData.execution_time_ms || 135),
    timestamp: reportData.timestamp || reportData.created_at || new Date().toISOString(),
    status: isUnrelated ? 'Unrelated' : pred === 'SIF' ? 'High Risk' : 'Low Risk',
    reviewStatus: isUnrelated ? 'Rejected — Off-Topic' : (reportData.reviewStatus || reportData.status || 'Submitted'),
    evidence: reportData.evidence || reportData.evidence_url || null,
  };
};

export const apiSaveReportWithAI = async (reportData, aiData, currentUser) => {
  const userId = currentUser?.id || null;
  const isUnrelated = aiData.prediction === 'Unrelated Input' || aiData.prediction === 'Unrelated';
  const narrative = reportData.narrative || reportData.report || '';
  const category = isUnrelated ? 'Non-Safety / Off-Topic' : (aiData.hazardCategory || 'Operational Safety');
  const detectedDept = isUnrelated ? 'General' : detectDepartment(narrative, category);
  const dept = currentUser?.department || (reportData.department && reportData.department !== 'Operations' ? reportData.department : detectedDept);

  const formattedTitle = isUnrelated
    ? 'Off-Topic Non-Safety Query'
    : (reportData.title && reportData.title !== 'Industrial Safety Observation' && reportData.title !== 'Safety Observation Incident'
        ? reportData.title
        : generateReportTitle(narrative));

  const payload = {
    user_id: userId,
    reporter_name: currentUser?.name || reportData.reporterName || 'Safety Observer',
    employee_id: currentUser?.employeeId || currentUser?.officerId || reportData.reporterId || 'EMP-1001',
    department: dept,
    company: currentUser?.company || reportData.company || 'SIF Enterprise',
    title: formattedTitle,
    incident_date: reportData.incidentDate || new Date().toISOString(),
    location: reportData.location || 'Distillation Unit 4',
    narrative: narrative,
    evidence_url: reportData.evidence || null,
    status: isUnrelated ? 'Rejected — Off-Topic' : (reportData.reviewStatus || 'Submitted'),
    
    // AI data included in payload for backend handling
    prediction: aiData.prediction || 'SIF',
    confidence: isUnrelated ? 0.0 : Number(aiData.confidence || 90.0),
    hazard_category: category,
    recommended_actions: aiData.recommendedActions || [],
    execution_time_ms: Number(aiData.executionTimeMs || 135),
  };

  try {
    const response = await apiClient.post('/api/reports', payload);
    return formatReportRecord(response.data || payload);
  } catch (err) {
    console.error('Error saving report to Database:', err);
    // For demo purposes if backend isn't there, we could mock return, but we'll throw as requested
    throw new Error(err.response?.data?.message || err.message || 'Report save failed.');
  }
};

export const apiFetchReports = async (userId, isSafetyOfficer = false) => {
  try {
    const params = {};
    if (!isSafetyOfficer && userId) {
      params.user_id = userId;
    }
    
    const response = await apiClient.get('/api/reports', { params });
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.map(r => formatReportRecord(r));
    }
  } catch (err) {
    console.error('Unable to query database reports:', err);
    // Return empty array instead of failing completely if backend is missing for now
    return [];
  }
  return [];
};

export const apiUpdateReportStatus = async (reportId, newStatus) => {
  try {
    const response = await apiClient.patch(`/api/reports/${reportId}/status`, { status: newStatus });
    return response.data;
  } catch (err) {
    console.error('Error updating report status:', err);
    throw new Error(err.response?.data?.message || err.message || 'Update status failed.');
  }
};

export const apiDeleteReport = async (reportId) => {
  try {
    await apiClient.delete(`/api/reports/${reportId}`);
  } catch (err) {
    console.error('Error deleting report:', err);
    throw new Error(err.response?.data?.message || err.message || 'Failed to delete report.');
  }
};
