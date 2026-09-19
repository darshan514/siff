import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

/**
 * Execute Multi-Step Autonomous Evidence Investigation across DGMS, OISD, and OIL logs
 */
export const apiRunInvestigation = async (observation, location = 'Oil India Field Facility', department = 'Operations') => {
  try {
    const res = await axios.post(`${API_BASE}/api/agent/investigate`, {
      observation,
      location,
      department
    }, { timeout: 15000 });
    return res.data;
  } catch (err) {
    console.warn('Backend investigation agent API error, falling back to client-side synthesis:', err);
    return null;
  }
};

/**
 * Execute Cyclic LangGraph where Agent Critiques, Refines, and Drafts formal HAZOP Action Plans
 */
export const apiRunLangGraphHazop = async (observation, location = 'Oil India Field Facility', department = 'Operations / Safety', maxIterations = 2) => {
  try {
    const res = await axios.post(`${API_BASE}/api/agent/hazop-graph`, {
      observation,
      location,
      department,
      max_iterations: maxIterations
    }, { timeout: 25000 });
    return res.data;
  } catch (err) {
    console.warn('Backend LangGraph HAZOP API error, using client fallback:', err);
    return null;
  }
};

/**
 * Dispatch test trigger to n8n Webhook / API Webhook integration
 */
export const apiTriggerAgentWebhook = async (observation, location = 'Oil India Field Facility', callbackUrl = '') => {
  try {
    const res = await axios.post(`${API_BASE}/api/agent/webhook`, {
      observation,
      location,
      n8n_callback_url: callbackUrl
    }, { timeout: 15000 });
    return res.data;
  } catch (err) {
    console.warn('Agent webhook API error:', err);
    return null;
  }
};
