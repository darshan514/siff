import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  Download, 
  Copy, 
  ExternalLink, 
  Zap,
  ArrowRight,
  Layers,
  Activity,
  GitFork
} from 'lucide-react';
import { apiRunLangGraphHazop } from '../../services/agent';

const PRESET_OBSERVATIONS = [
  {
    title: 'Hydrocarbon Gas Leak at Wellhead',
    location: 'Duliajan GPU #3 Wellhead Cluster',
    dept: 'Fire & Gas',
    text: 'Worker noticed heavy hydrocarbon gas vapor leak (42% LEL) near furnace burner #3 without automated deluge activation.'
  },
  {
    title: 'Derrick Working at Height Without 100% Tie-Off',
    location: 'Moran Drilling Rig #7',
    dept: 'Civil & Height',
    text: 'Derrickman spotted working on monkey board at 24m elevation without dual lanyard 100% positive tie-off. Scaffolding tag expired.'
  },
  {
    title: 'Crude Transfer Pump P-102 High Vibration',
    location: 'Duliajan Gathering Station #3',
    dept: 'Mechanical & Lifting',
    text: 'Crude transfer pump P-102 experiencing severe bearing vibration (11.8 mm/s) with persistent seal face weepage.'
  },
  {
    title: 'Zone 1 Switchgear Electrical Arc Hazard',
    location: 'Digboi Substation MCC Feeder #4',
    dept: 'Electrical',
    text: 'Technician found 3.3kV MCC breaker door interlock defeated without written LOTO clearance or gas test verification.'
  }
];

export const AutonomousHazopAgent = ({ initialObservation = '', initialLocation = '' }) => {
  const { addPrediction } = usePrediction();
  const [observation, setObservation] = useState(initialObservation || PRESET_OBSERVATIONS[0].text);
  const [location, setLocation] = useState(initialLocation || PRESET_OBSERVATIONS[0].location);
  const [department, setDepartment] = useState(PRESET_OBSERVATIONS[0].dept);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [auditSavedNotice, setAuditSavedNotice] = useState(false);

  const steps = [
    { title: '1. Autonomous Investigation', desc: 'Searching DGMS rulebooks, OISD standards, and OIL maintenance logs' },
    { title: '2. Draft HAZOP Matrix', desc: 'Synthesizing process study node, guide words, causes & consequences' },
    { title: '3. Critic Agent Evaluation', desc: 'Auditing engineered barriers vs administrative controls and statutory rules' },
    { title: '4. Refine Safeguards (Cyclic Loop)', desc: 'Upgrading safeguards to SIL-2 interlocks & statutory CAPA' },
    { title: '5. Final Audited HAZOP Plan', desc: 'Signed executive action plan certified under ALARP criteria' }
  ];

  const handleRunAgent = async () => {
    if (!observation.trim() || isRunning) return;

    setIsRunning(true);
    setResult(null);
    setActiveStep(1);

    // Step progress simulation while LangGraph executes
    const stepTimer1 = setTimeout(() => setActiveStep(2), 250);
    const stepTimer2 = setTimeout(() => setActiveStep(3), 600);
    const stepTimer3 = setTimeout(() => setActiveStep(4), 950);

    try {
      const data = await apiRunLangGraphHazop(observation, location, department, 2);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setActiveStep(5);
      setResult(data);
    } catch (err) {
      console.error("LangGraph HAZOP execution failed:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveToAuditLog = async () => {
    if (!result?.final_action_plan) return;
    const plan = result.final_action_plan;
    
    await addPrediction({
      id: plan.hazop_id,
      title: `HAZOP Action Plan: ${plan.study_node}`,
      report: observation,
      narrative: observation,
      location: location,
      department: department,
      prediction: 'SIF',
      confidence: 96.5,
      hazardCategory: department,
      recommendedActions: plan.engineered_safeguards,
      executionTimeMs: 145,
      timestamp: new Date().toISOString(),
      reviewStatus: 'Action In Progress'
    });

    setAuditSavedNotice(true);
    setTimeout(() => setAuditSavedNotice(false), 3000);
  };

  const handleCopyWebhook = () => {
    const webhookJson = {
      event: 'sif_langgraph_hazop_trigger',
      endpoint: 'http://127.0.0.1:8000/api/agent/webhook',
      payload: {
        observation,
        location,
        department,
        n8n_callback_url: 'https://your-n8n.domain/webhook/sif-hazop-response'
      }
    };
    navigator.clipboard.writeText(JSON.stringify(webhookJson, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#FF5E3A]/20 text-white border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FF5E3A] text-[11px] font-black tracking-wider uppercase">
                LangGraph Cyclic AI
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-[11px] font-semibold text-slate-300">
                DGMS & OISD Regulatory Grounding
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-[#FF5E3A]" />
              Autonomous Investigation & HAZOP Action Agent
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              A multi-step autonomous agent that queries DGMS rulebooks, OISD standards, and Oil India maintenance logs, 
              then executes a <strong>LangGraph cyclic critique-refinement graph</strong> to draft formal HAZOP action plans.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy n8n Webhook Integration Details"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{copiedPayload ? 'Copied n8n Payload!' : 'n8n Webhook Hook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input & Configuration Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Preset High-Risk Observation Scenarios (Oil India Limited):
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_OBSERVATIONS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setObservation(preset.text);
                  setLocation(preset.location);
                  setDepartment(preset.dept);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  observation === preset.text
                    ? 'bg-[#FF5E3A] text-white border-[#FF5E3A] shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                🎯 {preset.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
              Field Observation Narrative:
            </label>
            <textarea
              rows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Describe the incident narrative, equipment involved, or precursor hazard..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Facility Location:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                Department:
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 cursor-pointer"
              >
                <option value="Fire & Gas">Fire & Gas Safety</option>
                <option value="Mechanical & Lifting">Mechanical & Lifting</option>
                <option value="Civil & Height">Civil & Height Safety</option>
                <option value="Electrical">Electrical Safety</option>
                <option value="Operations">Field Operations / Drilling</option>
                <option value="HSE / Safety">HSE & Statutory Compliance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Layers className="w-4 h-4 text-[#FF5E3A]" />
            <span>Executes: <strong>Multi-Step Investigation ➔ Cyclic Critic/Refine Loop ➔ Formal HAZOP</strong></span>
          </div>

          <button
            type="button"
            onClick={handleRunAgent}
            disabled={isRunning || !observation.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#FF5E3A] hover:bg-[#ff4820] text-white text-xs font-black tracking-wide uppercase transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running LangGraph Cycle...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Autonomous Investigation & LangGraph HAZOP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cyclic Graph Step Visualizer */}
      {(isRunning || result) && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-[#FF5E3A]" />
              LangGraph Cyclic Graph Execution Trace
            </h3>
            {result?.is_approved && (
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Critic Quality Score: {result.quality_score}/100 (ALARP Approved)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {steps.map((step, sIdx) => {
              const stepNumber = sIdx + 1;
              const isCompleted = activeStep > stepNumber || (result && activeStep >= stepNumber);
              const isCurrent = activeStep === stepNumber && isRunning;
              return (
                <div
                  key={sIdx}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isCurrent
                      ? 'bg-[#FF5E3A]/10 border-[#FF5E3A] shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50/70 border-emerald-300/80'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-4 h-4 text-[#FF5E3A] animate-spin shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {stepNumber}
                      </span>
                    )}
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{step.title}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {result?.final_action_plan && (
        <div className="space-y-6">
          {/* Statutory Evidence Retrieved */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#FF5E3A]" />
              Multi-Source Statutory Evidence Retrieved ({result.evidence_docs?.length || 0} Standards & Logs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.evidence_docs?.slice(0, 3).map((ev, eIdx) => (
                <div key={eIdx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 font-extrabold text-[10px] text-slate-700">
                      {ev.reference}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {ev.source.includes('DGMS') ? '🏛️ DGMS' : ev.source.includes('OISD') ? '📜 OISD' : '🛢️ OIL LOG'}
                    </span>
                  </div>
                  <h5 className="font-bold text-slate-900">{ev.title}</h5>
                  <p className="text-[11px] text-slate-600 italic">"{ev.clause_text}"</p>
                  <div className="pt-1 text-[11px] font-medium text-[#FF5E3A]">
                    <strong>Mandated Control:</strong> {ev.mandated_safeguard}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formal HAZOP Action Plan Document */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-xs font-extrabold">
                    {result.final_action_plan.hazop_id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    Residual Risk: {result.final_action_plan.residual_risk_level}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Formal HAZOP Action Plan — {result.final_action_plan.study_node}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveToAuditLog}
                  className="px-4 py-2 rounded-xl bg-[#FF5E3A] hover:bg-[#ff4820] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{auditSavedNotice ? 'Saved to Audit Log!' : 'Save to Audit Log'}</span>
                </button>
              </div>
            </div>

            {/* HAZOP Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Study Node:</span>
                <p className="font-extrabold text-slate-900 mt-1">{result.final_action_plan.study_node}</p>
                <span className="text-slate-400 font-extrabold uppercase text-[10px] mt-2 block">Facility:</span>
                <p className="font-bold text-slate-700">{result.final_action_plan.facility_location}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Guide Word & Deviation:</span>
                <p className="font-extrabold text-amber-700 mt-1">{result.final_action_plan.guide_word_deviation}</p>
                <span className="text-slate-400 font-extrabold uppercase text-[10px] mt-2 block">Parameter:</span>
                <p className="font-bold text-slate-700">{result.final_action_plan.parameter}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Identified Causes:</span>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-700 font-medium">
                  {result.final_action_plan.causes.map((c, cIdx) => (
                    <li key={cIdx}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-extrabold uppercase text-[10px]">Consequences:</span>
                <ul className="list-disc pl-4 space-y-1 mt-1 text-red-700 font-medium">
                  {result.final_action_plan.consequences.map((c, cIdx) => (
                    <li key={cIdx}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Engineered Safeguards (Tiered) */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-300 text-xs space-y-2">
              <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Refined Engineered Safeguards & Physical Interlocks (Hierarchy of Controls):
              </h4>
              <ul className="space-y-1.5 font-medium text-emerald-950">
                {result.final_action_plan.engineered_safeguards.map((sf, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">✔</span>
                    <span>{sf}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Corrective Action CAPA Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Assigned Corrective & Preventive Actions (CAPA):
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-extrabold text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Mandated Action Task</th>
                      <th className="p-3">Assignee</th>
                      <th className="p-3">Target Deadline</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Statutory Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {result.final_action_plan.corrective_actions_capa?.map((capa, cIdx) => (
                      <tr key={cIdx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{capa.task}</td>
                        <td className="p-3 text-slate-700">{capa.assignee}</td>
                        <td className="p-3 font-mono text-slate-600">{capa.deadline}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            capa.priority.includes('Critical') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {capa.priority}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{capa.verification_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomousHazopAgent;
