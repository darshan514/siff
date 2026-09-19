import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BellRing, ShieldAlert, CheckCircle2, Clock, AlertTriangle, ChevronRight, Filter, Eye } from 'lucide-react';

export const EarlyWarningAlerts = ({ alerts = [], onStatusChange }) => {
  const { t } = useLanguage();
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [localAlerts, setLocalAlerts] = useState(alerts);

  // Sync if parent updates
  React.useEffect(() => {
    setLocalAlerts(alerts);
  }, [alerts]);

  const handleUpdateStatus = (alertId, newStatus) => {
    const updated = localAlerts.map(a => a.id === alertId ? { ...a, status: newStatus } : a);
    setLocalAlerts(updated);
    if (onStatusChange) {
      onStatusChange(alertId, newStatus);
    }
  };

  const filteredAlerts = localAlerts.filter(a => {
    if (selectedStatusFilter === 'ALL') return true;
    return a.status.toLowerCase() === selectedStatusFilter.toLowerCase();
  });

  const getStatusColor = (st) => {
    switch (st.toLowerCase()) {
      case 'new': return 'bg-red-500 text-white border-red-400';
      case 'acknowledged': return 'bg-amber-500 text-white border-amber-400';
      case 'investigating': return 'bg-blue-600 text-white border-blue-500';
      case 'resolved': return 'bg-emerald-600 text-white border-emerald-500';
      case 'dismissed': return 'bg-slate-500 text-white border-slate-400';
      default: return 'bg-slate-800 text-white border-slate-700';
    }
  };

  const activeAlertsCount = localAlerts.filter(a => a.status !== 'Resolved' && a.status !== 'Dismissed').length;

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center relative">
            <BellRing className="w-5 h-5 animate-wiggle" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                {activeAlertsCount}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('early_warning_title', 'Early Warning Alerts Engine')}
              </h3>
              <span className="text-[10px] font-extrabold bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Active Incident Detection
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Automated precursor spike detection, repeated asset failure signals, and hazard escalation triggers.
            </p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[11px] font-bold">
          {['ALL', 'New', 'Investigating', 'Acknowledged', 'Resolved'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1 rounded-xl transition-all ${
                selectedStatusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-white/40 rounded-2xl border border-slate-200/60 text-slate-500 text-xs font-medium">
            No alerts found for selected filter status ({selectedStatusFilter}).
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-3.5 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    alert.riskLevel === 'Critical' ? 'bg-red-500 animate-ping' :
                    alert.riskLevel === 'High' ? 'bg-orange-500' : 'bg-emerald-500'
                  }`} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {alert.title}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        alert.riskLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                        alert.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {alert.riskLevel} (Score: {alert.riskScore}/100)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Detected: {alert.timeDetected} • Asset: <span className="font-bold text-slate-700">{alert.affectedAsset}</span> • Dept: <span className="font-bold text-slate-700">{alert.affectedDept}</span>
                    </p>
                  </div>
                </div>

                {/* Status Selector Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                  <select
                    value={alert.status}
                    onChange={(e) => handleUpdateStatus(alert.id, e.target.value)}
                    className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl border appearance-none cursor-pointer focus:outline-none shadow-xs ${getStatusColor(alert.status)}`}
                  >
                    <option value="New" className="bg-white text-slate-900">New</option>
                    <option value="Acknowledged" className="bg-white text-slate-900">Acknowledged</option>
                    <option value="Investigating" className="bg-white text-slate-900">Investigating</option>
                    <option value="Resolved" className="bg-white text-slate-900">Resolved</option>
                    <option value="Dismissed" className="bg-white text-slate-900">Dismissed</option>
                  </select>
                </div>
              </div>

              {/* Alert Reason Callout */}
              <p className="text-xs text-slate-600 font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                <span className="font-bold text-slate-800">Trigger Reason: </span>
                {alert.reason}
              </p>

              {/* Recommended Operational Action */}
              <div className="flex items-start gap-2 text-xs font-semibold text-slate-800 bg-orange-50/50 p-3 rounded-xl border border-orange-200/60">
                <span className="material-symbols-outlined text-sm text-[#FF5E3A] mt-0.5 shrink-0">emergency</span>
                <span><strong className="text-[#FF5E3A]">Mandated Action: </strong>{alert.recommendedAction}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default EarlyWarningAlerts;
