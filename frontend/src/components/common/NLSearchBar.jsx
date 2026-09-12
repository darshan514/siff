import React, { useState } from 'react';
import { parseNaturalLanguageQuery } from '../../utils/hazardAnalyzer';
import { useLanguage } from '../../context/LanguageContext';

export const NLSearchBar = ({ history = [], onFilterChange }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeIntent, setActiveIntent] = useState(null);

  const handleSearch = (q) => {
    setQuery(q);
    const { filtered, intent } = parseNaturalLanguageQuery(q, history);
    setActiveIntent(intent);
    if (onFilterChange) onFilterChange(filtered);
  };

  const sampleQueries = [
    "Show electrical LOTO violations in Duliajan",
    "Show all SIF precursor reports from last 30 days",
    "Confined space entry incidents",
    "Crane lifting and rigging hazards"
  ];

  return (
    <div className="space-y-2.5 w-full text-left">
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5E3A] text-xl">
          travel_explore
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('nl_search_placeholder', 'Ask plain English safety queries (e.g. "Show electrical LOTO violations in Duliajan")')}
          className="w-full pl-12 pr-10 py-3 rounded-2xl text-xs bg-white/90 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 font-medium shadow-sm transition-all"
        />
        {query && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Query Intent Badge */}
      {activeIntent && (activeIntent.risk || activeIntent.department || activeIntent.location) && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Query Intent Parsed:</span>
          {activeIntent.risk && (
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 border border-red-300">
              Risk: {activeIntent.risk}
            </span>
          )}
          {activeIntent.department && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-300">
              Dept: {activeIntent.department}
            </span>
          )}
          {activeIntent.location && (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-300">
              Location: {activeIntent.location}
            </span>
          )}
          <span className="text-slate-400">({activeIntent.count} matching results)</span>
        </div>
      )}

      {/* Preset Example Query Chips */}
      {!query && (
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="text-slate-400 font-semibold">Try asking:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch(sq)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
            >
              "{sq}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NLSearchBar;
