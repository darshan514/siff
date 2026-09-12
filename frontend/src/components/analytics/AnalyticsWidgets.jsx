import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Activity, 
  FileWarning, 
  Flame
} from 'lucide-react';

export const AnalyticsWidgets = ({ history = [] }) => {
  const total = history.length || 1;

  // Calculate top hazards by category
  const categoryCounts = history.reduce((acc, h) => {
    const cat = h.hazardCategory || 'General Safety';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  const topHazards = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count,
      percent: ((count / total) * 100).toFixed(1) + '%'
    }));

  // Calculate top locations
  const locationCounts = history.reduce((acc, h) => {
    const loc = h.location || 'Unknown Location';
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({
      name,
      count,
      trend: '+0%' // Static for now as we don't have historical periods
    }));

  // Calculate top activities (using department + title)
  const activityCounts = history.reduce((acc, h) => {
    const act = h.department ? `${h.department} Operations` : 'General Operations';
    acc[act] = (acc[act] || 0) + 1;
    return acc;
  }, {});
  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([activity, incidentCount]) => ({
      activity,
      incidentCount
    }));

  const maxActivityCount = topActivities.length > 0 ? topActivities[0].incidentCount : 1;

  // Calculate violated rules / recommendations
  const actionCounts = history.reduce((acc, h) => {
    if (h.recommendedActions && Array.isArray(h.recommendedActions)) {
      h.recommendedActions.forEach(action => {
        acc[action] = (acc[action] || 0) + 1;
      });
    }
    return acc;
  }, {});
  const violatedRules = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([rule, count]) => ({
      rule,
      count
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      
      {/* Widget 1: Most Common SIF Hazards */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center space-x-2 border-b pb-3 border-slate-200/60">
          <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">Most Common SIF Hazards</h4>
            <p className="text-[11px] text-slate-500 font-medium">Highest priority risk precursors logged</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {topHazards.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-xs font-medium">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-red-500/10 text-red-600 font-mono font-bold flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-slate-800">{item.name}</span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-slate-500">{item.count}</span>
                <span className="px-2 py-0.5 rounded font-bold bg-red-500/10 text-red-800 text-[10px]">
                  {item.percent}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 2: Top Locations */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center space-x-2 border-b pb-3 border-slate-200/60">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">Top Incident Locations</h4>
            <p className="text-[11px] text-slate-500 font-medium">Facilities requiring safety audit focus</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {topLocations.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-xs font-medium">
              <span className="text-slate-800">{item.name}</span>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-slate-900 font-bold">{item.count}</span>
                <span className="text-[10px] font-bold text-emerald-600">
                  {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 3: Top Activities */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center space-x-2 border-b pb-3 border-slate-200/60">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">High-Risk Work Activities</h4>
            <p className="text-[11px] text-slate-500 font-medium">Tasks associated with SIF potential</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {topActivities.map((item, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium text-slate-700">
                <span>{item.activity}</span>
                <span className="font-mono font-bold text-[#FF5E3A]">{item.incidentCount}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#FF5E3A] rounded-full"
                  style={{ width: `${(item.incidentCount / maxActivityCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 4: Most Violated Rules */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center space-x-2 border-b pb-3 border-slate-200/60">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
            <FileWarning className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider font-mono">Most Violated Life-Saving Rules</h4>
            <p className="text-[11px] text-slate-500 font-medium">Critical non-compliance trends</p>
          </div>
        </div>

        <div className="space-y-2">
          {violatedRules.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/80 border border-slate-200/60 text-xs flex items-start justify-between gap-3">
              <span className="text-slate-700 font-medium leading-tight">
                {item.rule}
              </span>
              <span className="font-mono text-purple-600 font-bold shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsWidgets;
