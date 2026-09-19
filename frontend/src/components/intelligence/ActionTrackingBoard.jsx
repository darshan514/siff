import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckSquare, Clock, UserCheck, Calendar, MessageSquare, Plus, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const ActionTrackingBoard = ({ initialActions = [], onActionsUpdate }) => {
  const { t } = useLanguage();
  const [actions, setActions] = useState(() => {
    if (initialActions && initialActions.length > 0) return initialActions;
    return [
      {
        id: "ACT-101",
        action: "Schedule NDT & Mechanical Seal Overhaul on Pump P-102",
        priority: "Critical",
        responsibleTeam: "Mechanical Reliability Crew",
        assignedTo: "Rajesh Bora (Chief Engineer)",
        deadline: "2026-09-22",
        status: "In Progress",
        reason: "Repeated mechanical seal degradation and 4-hour production delay.",
        expectedOutcome: "Eliminates crude spill risk and reduces operational risk score by 24 points.",
        comments: [
          { author: "Safety Officer", text: "Vibration measurements confirmed at 4.2 mm/s. Fast-track parts approval.", date: "Today 09:30" }
        ],
        riskScoreBefore: 88,
        riskScoreAfter: 54
      },
      {
        id: "ACT-102",
        action: "Mandate Physical Lockout / LOTO Audit on 415V Switchgear MCC-2",
        priority: "Critical",
        responsibleTeam: "Electrical Maintenance",
        assignedTo: "Amitav Gogoi (Electrical In-Charge)",
        deadline: "2026-09-20",
        status: "Completed",
        reason: "Breaker maintenance attempted without multi-point padlocking certificate.",
        expectedOutcome: "Zero-energy state certified. High voltage arc-flash risk averted.",
        comments: [
          { author: "Electrical Supv", text: "Padlocks verified and green tags issued across all active feeds.", date: "Yesterday 16:45" }
        ],
        riskScoreBefore: 94,
        riskScoreAfter: 32
      },
      {
        id: "ACT-103",
        action: "Complete Scaffold Retagging & 100% Fall Arrest Inspection at Rig #7",
        priority: "High",
        responsibleTeam: "Civil Safety Crew",
        assignedTo: "Deepak Sharma (Rig HSE Lead)",
        deadline: "2026-09-24",
        status: "Pending",
        reason: "Working at height platform missing toe boards and mid-rails.",
        expectedOutcome: "Complete fall-arrest compliance for 14 workover technicians.",
        comments: [],
        riskScoreBefore: 76,
        riskScoreAfter: 48
      }
    ];
  });

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [newComment, setNewComment] = useState({});

  const handleStatusChange = (id, newStatus) => {
    const updated = actions.map(act => act.id === id ? { ...act, status: newStatus } : act);
    setActions(updated);
    if (onActionsUpdate) onActionsUpdate(updated);
  };

  const handleAddComment = (id) => {
    const text = newComment[id];
    if (!text || !text.trim()) return;

    const updated = actions.map(act => {
      if (act.id === id) {
        return {
          ...act,
          comments: [...act.comments, { author: "Safety Officer", text: text.trim(), date: "Just now" }]
        };
      }
      return act;
    });

    setActions(updated);
    setNewComment({ ...newComment, [id]: "" });
    if (onActionsUpdate) onActionsUpdate(updated);
  };

  const filtered = actions.filter(a => {
    if (filterStatus === 'ALL') return true;
    return a.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="w-full bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.03)] p-6 sm:p-8 space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('action_tracking_title', 'Mitigation & Preventive Action Tracking Board')}
              </h3>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Decision Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Accept, delegate, and monitor safety recommendations to verify post-mitigation risk reduction.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[11px] font-bold">
          {['ALL', 'Pending', 'In Progress', 'Completed'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-xl transition-all ${
                filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filtered.map(act => (
          <div
            key={act.id}
            className="p-5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {act.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    act.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {act.priority} Priority
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {act.action}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {act.reason}
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                <select
                  value={act.status}
                  onChange={(e) => handleStatusChange(act.id, e.target.value)}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none shadow-xs ${
                    act.status === 'Completed' ? 'bg-emerald-600 text-white border-emerald-500' :
                    act.status === 'In Progress' ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <option value="Pending" className="bg-white text-slate-900">Pending</option>
                  <option value="In Progress" className="bg-white text-slate-900">In Progress</option>
                  <option value="Completed" className="bg-white text-slate-900">Completed</option>
                </select>
              </div>
            </div>

            {/* Details Meta Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-slate-400" />
                <span>Assigned: <strong className="text-slate-800">{act.assignedTo}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Deadline: <strong className="text-slate-800 font-mono">{act.deadline}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Risk Delta:</span>
                <span className="font-mono font-bold text-red-600">{act.riskScoreBefore}</span>
                <span className="text-slate-400">➔</span>
                <span className="font-mono font-bold text-emerald-600">{act.riskScoreAfter}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 rounded font-bold">
                  -{act.riskScoreBefore - act.riskScoreAfter} pts
                </span>
              </div>
            </div>

            {/* Expected Result Callout */}
            <div className="text-[11px] text-emerald-800 bg-emerald-50/60 border border-emerald-200/60 px-3 py-2 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span><strong>Target Result: </strong>{act.expectedOutcome}</span>
            </div>

            {/* Comments & Activity Log Accordion */}
            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === act.id ? null : act.id)}
                className="text-xs font-bold text-[#FF5E3A] hover:underline flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Activity & Evidence Notes ({act.comments?.length || 0})</span>
                {expandedId === act.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {expandedId === act.id && (
                <div className="mt-3 space-y-2.5 pl-2 border-l-2 border-[#FF5E3A]/30">
                  {act.comments?.map((c, i) => (
                    <div key={i} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>{c.author}</span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{c.text}</p>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add inspection notes or resolution evidence..."
                      value={newComment[act.id] || ""}
                      onChange={(e) => setNewComment({ ...newComment, [act.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(act.id)}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(act.id)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      Post Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ActionTrackingBoard;
