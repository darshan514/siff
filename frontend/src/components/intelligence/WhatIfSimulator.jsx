import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Sliders, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';
import { simulateWhatIfScenario } from '../../utils/decisionIntelligence';

export const WhatIfSimulator = ({ initialRiskScore = 78, prediction = 'SIF' }) => {
  const { t } = useLanguage();
  
  // Simulation Controls State
  const [extraWorkers, setExtraWorkers] = useState(0);
  const [delayDays, setDelayDays] = useState(0);
  const [incidentSpikePercent, setIncidentSpikePercent] = useState(0);
  const [backlogReductionPercent, setBacklogReductionPercent] = useState(0);
  const [emergencyShutdown, setEmergencyShutdown] = useState(false);
  const [implementRecs, setImplementRecs] = useState(false);

  // Compute live simulated scenario
  const simulation = simulateWhatIfScenario(initialRiskScore, prediction, {
    extraWorkers,
    delayDays,
    incidentSpikePercent,
    backlogReductionPercent,
    emergencyShutdown,
    implementRecs
  });

  const handleApplyPreset = (presetKey) => {
    // Reset first
    setExtraWorkers(0);
    setDelayDays(0);
    setIncidentSpikePercent(0);
    setBacklogReductionPercent(0);
    setEmergencyShutdown(false);
    setImplementRecs(false);

    switch (presetKey) {
      case 'EXTRA_WORKERS':
        setExtraWorkers(2);
        break;
      case 'DELAY_MAINTENANCE':
        setDelayDays(7);
        break;
      case 'INCIDENT_SPIKE':
        setIncidentSpikePercent(20);
        break;
      case 'REDUCE_BACKLOG':
        setBacklogReductionPercent(50);
        break;
      case 'EMERGENCY_SHUTDOWN':
        setEmergencyShutdown(true);
        break;
      case 'IMPLEMENT_ACTIONS':
        setImplementRecs(true);
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    setExtraWorkers(0);
    setDelayDays(0);
    setIncidentSpikePercent(0);
    setBacklogReductionPercent(0);
    setEmergencyShutdown(false);
    setImplementRecs(false);
  };

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('what_if_title', 'Interactive What-If Decision Simulation Playground')}
              </h3>
              <span className="text-[10px] font-extrabold bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Simulation Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Simulate operational adjustments, resource allocations, or maintenance delays to project risk delta.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
        >
          Reset Simulation
        </button>
      </div>

      {/* Preset Scenario Quick Buttons */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
          Oil India Operational Scenario Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('EXTRA_WORKERS')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              extraWorkers === 2
                ? 'bg-[#FF5E3A] text-white border-[#FF5E3A] shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:border-[#FF5E3A]/40'
            }`}
          >
            👷 +2 Maintenance Workers
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('DELAY_MAINTENANCE')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              delayDays === 7
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:border-amber-400'
            }`}
          >
            ⏱️ Delay Maintenance by 7 Days
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('INCIDENT_SPIKE')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              incidentSpikePercent === 20
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:border-red-400'
            }`}
          >
            📈 +20% Incident Frequency Spike
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('REDUCE_BACKLOG')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              backlogReductionPercent === 50
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:border-emerald-400'
            }`}
          >
            📋 Clear 50% Maintenance Backlog
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('EMERGENCY_SHUTDOWN')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              emergencyShutdown
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-400'
            }`}
          >
            🛑 Temporary Asset Shutdown
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('IMPLEMENT_ACTIONS')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              implementRecs
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white/80 border-slate-200 text-slate-700 hover:border-indigo-400'
            }`}
          >
            ✅ Implement Corrective Actions
          </button>
        </div>
      </div>

      {/* Interactive Sliders & Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-white/80 border border-slate-200/80">
        
        {/* Slider 1: Additional Maintenance Workers */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-700">Assign Additional Maintenance Crew:</span>
            <span className="font-mono font-extrabold text-[#FF5E3A]">+{extraWorkers} Workers</span>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="1"
            value={extraWorkers}
            onChange={(e) => setExtraWorkers(Number(e.target.value))}
            className="w-full accent-[#FF5E3A] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>+3</span>
            <span>+6 Workers</span>
          </div>
        </div>

        {/* Slider 2: Preventive Maintenance Delay */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-700">Preventive Maintenance Delay (Days):</span>
            <span className="font-mono font-extrabold text-amber-600">+{delayDays} Days Delay</span>
          </div>
          <input
            type="range"
            min="0"
            max="21"
            step="1"
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>On Schedule (0d)</span>
            <span>+7d</span>
            <span>+21 Days</span>
          </div>
        </div>

        {/* Slider 3: Incident Frequency Shift */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-700">Incident Rate Acceleration (%):</span>
            <span className="font-mono font-extrabold text-red-600">+{incidentSpikePercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="5"
            value={incidentSpikePercent}
            onChange={(e) => setIncidentSpikePercent(Number(e.target.value))}
            className="w-full accent-red-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Baseline (0%)</span>
            <span>+30%</span>
            <span>+60% Spike</span>
          </div>
        </div>

        {/* Slider 4: Backlog Reduction */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-700">Maintenance Backlog Cleared (%):</span>
            <span className="font-mono font-extrabold text-emerald-600">-{backlogReductionPercent}% Backlog</span>
          </div>
          <input
            type="range"
            min="0"
            max="80"
            step="10"
            value={backlogReductionPercent}
            onChange={(e) => setBacklogReductionPercent(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0%</span>
            <span>40%</span>
            <span>80% Cleared</span>
          </div>
        </div>
      </div>

      {/* Simulation Results Comparison Panel */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#FF5E3A]" />
            What-If Scenario Simulation Output
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
            Simulation Delta (Statistical Model)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
          {/* Baseline Score */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Risk Score</span>
            <span className="text-2xl font-black font-mono text-slate-200 mt-1 block">
              {simulation.baselineScore}/100
            </span>
          </div>

          {/* Simulated Score with Arrow */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Simulated Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black font-mono ${
                simulation.simulatedScore < simulation.baselineScore ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {simulation.simulatedScore}/100
              </span>
              <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                simulation.scoreDiff < 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {simulation.scoreDiff > 0 ? `+${simulation.scoreDiff}` : simulation.scoreDiff} pts
              </span>
            </div>
          </div>

          {/* Simulated Level */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Simulated Risk Level</span>
            <span className={`text-lg font-extrabold mt-1 block ${
              simulation.simulatedLevel === 'Critical' ? 'text-red-400' :
              simulation.simulatedLevel === 'High' ? 'text-orange-400' :
              simulation.simulatedLevel === 'Medium' ? 'text-amber-300' : 'text-emerald-400'
            }`}>
              {simulation.simulatedLevel}
            </span>
          </div>

          {/* Operational Savings */}
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Avoided Downtime</span>
            <span className="text-lg font-extrabold text-cyan-300 mt-1 block font-mono">
              ~{simulation.simulatedDowntimeAvoidedHours} hrs
            </span>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 text-xs text-slate-300 font-medium leading-relaxed">
          {simulation.summary}
        </div>
      </div>

    </div>
  );
};

export default WhatIfSimulator;
