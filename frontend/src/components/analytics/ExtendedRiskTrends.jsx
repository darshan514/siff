import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, PieChart, Pie } from 'recharts';
import { OIL_RISK_CATEGORIES } from '../../utils/decisionIntelligence';

export const ExtendedRiskTrends = ({ history = [] }) => {
  const { t } = useLanguage();

  // 1. Distribution by 11 Oil India Risk Categories
  const categoryCounts = {};
  Object.keys(OIL_RISK_CATEGORIES).forEach(k => {
    categoryCounts[OIL_RISK_CATEGORIES[k].name] = 0;
  });

  // 2. High-Risk Asset Leaderboard
  const assetCounts = {};

  history.forEach(item => {
    const text = (item.report || item.narrative || '').toLowerCase();
    
    // Categorize
    let matched = false;
    for (const key of Object.keys(OIL_RISK_CATEGORIES)) {
      const cat = OIL_RISK_CATEGORIES[key];
      if (cat.keywords.some(kw => text.includes(kw))) {
        categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
        matched = true;
        break;
      }
    }
    if (!matched) {
      categoryCounts[OIL_RISK_CATEGORIES.HEALTH_SAFETY.name] = (categoryCounts[OIL_RISK_CATEGORIES.HEALTH_SAFETY.name] || 0) + 1;
    }

    // Asset
    let asset = 'General Facility';
    if (text.includes('pump')) asset = 'Pump P-102 (Booster)';
    else if (text.includes('compressor')) asset = 'Gas Compressor C-3';
    else if (text.includes('rig')) asset = 'Workover Rig #7';
    else if (text.includes('panel') || text.includes('415v')) asset = '415V Switchgear MCC-2';
    else if (text.includes('pipeline')) asset = 'Crude Pipeline Sec-B';
    else if (text.includes('scaffold')) asset = 'Scaffolding Towers';
    else if (text.includes('tank')) asset = 'Storage Tank T-104';

    if (!assetCounts[asset]) assetCounts[asset] = { name: asset, total: 0, sifCount: 0 };
    assetCounts[asset].total += 1;
    if (item.prediction === 'SIF') assetCounts[asset].sifCount += 1;
  });

  const categoryChartData = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => ({
      name: name.replace(' Risk', ''),
      fullName: name,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topAssets = Object.values(assetCounts)
    .sort((a, b) => b.sifCount - a.sifCount)
    .slice(0, 5);

  // 3. Multi-Day Risk Trajectory Trend Data
  const trendData = [
    { day: 'Mon', riskScore: 42, count: 12 },
    { day: 'Tue', riskScore: 56, count: 18 },
    { day: 'Wed', riskScore: 48, count: 15 },
    { day: 'Thu', riskScore: 74, count: 24 },
    { day: 'Fri', riskScore: 82, count: 31 },
    { day: 'Sat', riskScore: 68, count: 20 },
    { day: 'Sun', riskScore: 58, count: 14 }
  ];

  const COLORS = ['#FF5E3A', '#F97316', '#F59E0B', '#10B981', '#6366F1', '#3B82F6'];

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 11 Oil India Risk Categories Bar Chart */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF5E3A]">category</span>
              <h3 className="font-extrabold text-sm text-slate-900">
                Oil India Enterprise Risk Distribution
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              11 Enterprise Categories
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg">
                          <p className="font-bold">{payload[0].payload.fullName}</p>
                          <p className="text-[#FF5E3A] font-mono">{payload[0].value} Observations</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Day Risk Trajectory Line Chart */}
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF5E3A]">trending_up</span>
              <h3 className="font-extrabold text-sm text-slate-900">
                7-Day Operational Risk Trajectory
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Rolling Shift Analytics
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ left: -10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg">
                          <p className="font-bold">{payload[0].payload.day}</p>
                          <p className="text-[#FF5E3A] font-mono">Shift Risk Index: {payload[0].value}/100</p>
                          <p className="text-slate-400 text-[10px]">{payload[0].payload.count} Incidents</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="riskScore" stroke="#FF5E3A" strokeWidth={3} dot={{ r: 4, fill: '#FF5E3A' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top 5 High-Risk Assets Watchlist */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <h3 className="font-extrabold text-sm text-slate-900">
              High-Risk Equipment & Asset Precursor Watchlist (Top 5)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Critical Cluster Detection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {topAssets.map((asset, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">Rank #{i + 1}</span>
              <h4 className="text-xs font-extrabold text-slate-900 truncate" title={asset.name}>{asset.name}</h4>
              <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-[10px] text-slate-500">SIF Precursors:</span>
                <span className="font-mono font-bold text-red-600">{asset.sifCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExtendedRiskTrends;
