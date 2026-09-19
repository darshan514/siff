import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, Clock, AlertOctagon, HelpCircle, BarChart3, AlertTriangle } from 'lucide-react';

export const PredictiveForecastCard = ({ forecast, riskScore }) => {
  const { t } = useLanguage();
  if (!forecast) return null;

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('predictive_forecast_title', 'Predictive Risk Horizon & Escalation Forecast')}
              </h3>
              <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Statistical Horizon
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Predictive models forecasting the probability of escalation into High or Critical stop-work events.
            </p>
          </div>
        </div>

        {/* Estimation Disclaimer */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[10px] font-extrabold text-purple-900 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
          <span>Predictive Estimate (Statistical Projection)</span>
        </div>
      </div>

      {/* Probability Cards (7, 14, 30 Days) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 7-Day Horizon */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">7-Day Horizon</span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Short-Term</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900">{forecast.prob7d}%</span>
            <span className="text-[11px] text-slate-500 font-medium">escalation probability</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${forecast.prob7d > 70 ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${forecast.prob7d}%` }}
            />
          </div>
        </div>

        {/* 14-Day Horizon */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">14-Day Horizon</span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">Medium-Term</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900">{forecast.prob14d}%</span>
            <span className="text-[11px] text-slate-500 font-medium">escalation probability</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${forecast.prob14d > 70 ? 'bg-red-500' : 'bg-indigo-500'}`}
              style={{ width: `${forecast.prob14d}%` }}
            />
          </div>
        </div>

        {/* 30-Day Horizon */}
        <div className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-500 uppercase text-[10px] tracking-wider">30-Day Cumulative</span>
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">Extended Term</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900">{forecast.prob30d}%</span>
            <span className="text-[11px] text-slate-500 font-medium">cumulative risk</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${forecast.prob30d > 70 ? 'bg-red-500' : 'bg-slate-700'}`}
              style={{ width: `${forecast.prob30d}%` }}
            />
          </div>
        </div>
      </div>

      {/* Projected Operational Consequence Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Projected Recurrences (30 Days)
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono mt-1 block">
            {forecast.estimatedIncidents30d}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Predicted Downtime Exposure
          </span>
          <span className="text-base font-extrabold text-amber-900 font-mono mt-1 block">
            {forecast.estimatedDowntimeHours}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Throughput / Production Impact
          </span>
          <span className="text-base font-extrabold text-slate-900 font-mono mt-1 block">
            {forecast.expectedProductionLoss}
          </span>
        </div>
      </div>

      {/* Summary Forecast Text */}
      <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/60 text-xs font-medium text-purple-950 leading-relaxed">
        {forecast.forecastSummary}
      </div>

    </div>
  );
};

export default PredictiveForecastCard;
