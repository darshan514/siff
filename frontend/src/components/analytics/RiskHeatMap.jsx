import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const RiskHeatMap = ({ history = [] }) => {
  const { t } = useLanguage();
  const [selectedCell, setSelectedCell] = useState(null);

  const locations = [
    { key: "Duliajan Field HQ", label: t('duliajan_hq', 'Duliajan Field HQ') },
    { key: "Digboi Refinery Complex", label: t('digboi_refinery', 'Digboi Refinery Complex') },
    { key: "Moran Oil Field", label: t('moran_oilfield', 'Moran Oil Field') },
    { key: "Jorhat Pipeline Hub", label: t('jorhat_hub', 'Jorhat Pipeline Hub') },
    { key: "Assam Basin Drilling Rig #7", label: t('rig_7', 'Assam Basin Drilling Rig #7') }
  ];

  const departments = [
    { key: "Electrical", label: t('dept_electrical', 'Electrical') },
    { key: "Fire & Gas", label: t('dept_fire_gas', 'Fire & Gas') },
    { key: "Mechanical & Lifting", label: t('dept_mechanical', 'Mechanical & Lifting') },
    { key: "Civil & Height", label: t('dept_civil', 'Civil & Height') },
    { key: "HSE / Safety", label: t('dept_hse', 'HSE / Safety') },
  ];

  // Calculate cell counts from history
  const getCellData = (locKey, deptKey) => {
    const matching = history.filter(item => {
      const matchLoc = (item.location || 'Duliajan Field HQ').toLowerCase().includes(locKey.toLowerCase().split(' ')[0]);
      const matchDept = (item.department || 'Operations') === deptKey;
      return matchLoc && matchDept;
    });

    const sifCount = matching.filter(m => m.prediction === 'SIF').length;
    const total = matching.length;

    let riskLevel = 'green';
    if (sifCount >= 2) riskLevel = 'red';
    else if (sifCount === 1 || total >= 3) riskLevel = 'yellow';

    return { total, sifCount, riskLevel };
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] space-y-5 text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">grid_view</span>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              {t('risk_heatmap_title', 'Plant & Sector Precursor Risk Heat Map')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('risk_heatmap_desc', 'Color-coded SIF precursor density matrix across Oil India Limited operational zones')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-sm"></span>
            <span className="text-slate-600">{t('low_risk', 'Low Risk (Green)')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-400 inline-block shadow-sm"></span>
            <span className="text-slate-600">{t('moderate_risk', 'Moderate (Yellow)')}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-red-500 inline-block shadow-sm"></span>
            <span className="text-slate-600">{t('sif_potential', 'High SIF (Red)')}</span>
          </span>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                {t('th_location', 'Installation / Site')}
              </th>
              {departments.map((dept) => (
                <th key={dept.key} className="p-3 text-xs font-extrabold text-slate-700 max-w-[120px]">
                  {dept.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.key} className="border-t border-slate-200/50">
                <td className="p-3 text-left text-xs font-bold text-slate-900 whitespace-nowrap bg-white/40">
                  {loc.label}
                </td>
                {departments.map((dept) => {
                  const cell = getCellData(loc.key, dept.key);
                  let bgStyle = "bg-emerald-100 text-emerald-900 border-emerald-300";
                  if (cell.riskLevel === 'red') bgStyle = "bg-red-500 text-white font-extrabold shadow-md animate-pulse";
                  else if (cell.riskLevel === 'yellow') bgStyle = "bg-amber-300 text-amber-950 font-bold";

                  return (
                    <td key={dept.key} className="p-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCell({ loc: loc.label, dept: dept.label, ...cell })}
                        className={`w-full py-3 px-2 rounded-2xl border text-xs transition-transform hover:scale-105 ${bgStyle}`}
                      >
                        <span className="block font-black text-sm">{cell.sifCount} SIF</span>
                        <span className="text-[10px] opacity-80 font-medium">({cell.total} total)</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCell && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#FF5E3A]">info</span>
            <span>
              <strong>{selectedCell.loc}</strong> — <strong>{selectedCell.dept} Sector</strong>: Logged {selectedCell.sifCount} SIF precursor reports out of {selectedCell.total} observations.
            </span>
          </div>
          <button
            onClick={() => setSelectedCell(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default RiskHeatMap;
