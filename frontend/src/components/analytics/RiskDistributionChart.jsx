import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

export const RiskDistributionChart = ({ sifCount = 342, nonSifCount = 938 }) => {
  const { t } = useLanguage();
  const data = [
    { name: t('high_risk_sif', 'High Risk (SIF)'), value: sifCount, color: '#FF5E3A' },
    { name: t('low_risk_non_sif', 'Low Risk (Non-SIF)'), value: nonSifCount, color: '#10b981' },
  ];

  const total = sifCount + nonSifCount;
  const sifPercent = ((sifCount / total) * 100).toFixed(1);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-slate-900">
              {t('risk_distribution_ratio', 'Risk Distribution Ratio')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('sif_vs_routine', 'SIF Precursors vs Routine Observations')}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-red-500/10 text-red-800 border border-red-300">
          {sifPercent}% {t('sif_rate', 'SIF Rate')}
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={92}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} reports`, 'Count']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '0.75rem',
                color: '#0f172a',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 text-center text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-red-500/5 border border-red-200">
          <span className="text-slate-500 font-sans text-xs">{t('sif_incidents', 'SIF Incidents')}</span>
          <p className="text-lg font-bold text-red-600">{sifCount.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-200">
          <span className="text-slate-500 font-sans text-xs">{t('non_sif_observations', 'Non-SIF Observations')}</span>
          <p className="text-lg font-bold text-emerald-600">{nonSifCount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default RiskDistributionChart;
