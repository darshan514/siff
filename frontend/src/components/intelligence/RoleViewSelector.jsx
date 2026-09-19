import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Briefcase, Settings, ShieldCheck, Wrench, FileCheck, Layers } from 'lucide-react';

export const ROLE_PERSPECTIVES = [
  { id: 'MANAGEMENT', label: 'Management View', icon: Briefcase, desc: 'Overall plant risk summary, executive alerts, and SIF precursor ratio.' },
  { id: 'OPERATIONS', label: 'Operations View', icon: Settings, desc: 'Throughput delays, production downtime, and wellsite workover risks.' },
  { id: 'SAFETY', label: 'Safety (HSE) View', icon: ShieldCheck, desc: 'SIF precursors, IOGP Life-Saving Rules compliance, and hazardous acts.' },
  { id: 'MAINTENANCE', label: 'Maintenance View', icon: Wrench, desc: 'Recurring equipment failures, mechanical integrity, and overdue PM backlog.' },
  { id: 'COMPLIANCE', label: 'Compliance View', icon: FileCheck, desc: 'Environmental releases, DGMS/OISD statutory regulations, and permit audits.' },
  { id: 'RISK_TEAM', label: 'Risk Team View', icon: Layers, desc: 'Enterprise risk register, HAZOP/QRA causes, and What-If decision simulation.' },
];

export const RoleViewSelector = ({ activeRole = 'MANAGEMENT', onRoleChange }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 p-3 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 px-2 shrink-0">
        <span className="material-symbols-outlined text-[#FF5E3A] text-lg">supervised_user_circle</span>
        <span className="uppercase tracking-wider text-[10px] text-slate-400">Enterprise Role View:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
        {ROLE_PERSPECTIVES.map(role => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onRoleChange && onRoleChange(role.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/60'
              }`}
              title={role.desc}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF5E3A]' : 'text-slate-400'}`} />
              <span>{role.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleViewSelector;
