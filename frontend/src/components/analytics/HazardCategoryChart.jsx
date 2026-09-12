import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';

const DEFAULT_CATEGORY_DATA = [
  { category: 'Work at Height', SIF: 4, NonSIF: 1 },
  { category: 'Gas & Chemical', SIF: 2, NonSIF: 0 },
  { category: 'Electrical / LOTO', SIF: 1, NonSIF: 2 },
  { category: 'Heavy Lifting', SIF: 3, NonSIF: 1 },
  { category: 'Housekeeping', SIF: 0, NonSIF: 5 },
];

export const HazardCategoryChart = ({ data }) => {
  const { t } = useLanguage();
  const chartData = (data && data.length > 0) ? data : DEFAULT_CATEGORY_DATA;

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-slate-900">
              Incidents by Hazard Category
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Distribution of safety events across operational domains
            </p>
          </div>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '0.75rem',
                color: '#0f172a',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="SIF" name="SIF Precursors" fill="#FF5E3A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="NonSIF" name="Routine Observations" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HazardCategoryChart;

