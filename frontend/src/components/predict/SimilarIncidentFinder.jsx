import React from 'react';
import { findSimilarIncidents } from '../../utils/hazardAnalyzer';
import { usePredictions } from '../../context/PredictionContext';
import { useLanguage } from '../../context/LanguageContext';

export const SimilarIncidentFinder = ({ reportText }) => {
  const { history } = usePredictions();
  const { t, lang } = useLanguage();

  if (!reportText) return null;

  const matches = findSimilarIncidents(reportText, history, 3, lang);

  if (!matches.length) {
    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/90 p-6 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">travel_explore</span>
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                {t('similar_incidents_title', 'Similar Historical Incident Matcher')}
              </h4>
            </div>
          </div>
        </div>
        <div className="text-center p-6 text-slate-500 font-medium text-sm">
          {t('no_matching_incidents', 'No matching historical incidents found in records.')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/90 p-6 shadow-sm space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">travel_explore</span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              {t('similar_incidents_title', 'Similar Historical Incident Matcher')}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              {t('similar_incidents_title', 'Past observations with matching hazard profile & outcomes')}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
          {t('nlp_classification_model', 'Vector Similarity Search')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {matches.map((item) => {
          const isSIF = item.prediction === 'SIF';
          return (
            <div key={item.id} className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 font-mono">#{item.id}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {item.similarityScore}% {t('match_pct', 'Match')}
                  </span>
                </div>

                <p className="text-xs font-extrabold text-slate-900 line-clamp-1">{item.title}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2 italic font-serif">"{item.report}"</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-[10px]">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-500">{t('historical_outcome', 'Historical Outcome:')}</span>
                  <span className={`font-bold ${isSIF ? 'text-red-600' : 'text-slate-700'}`}>
                    {item.historicalOutcome}
                  </span>
                </div>
                <p className="text-slate-500 font-medium line-clamp-2">
                  <strong className="text-slate-700">{t('lesson_learned', 'Lesson Learned:')}</strong> {item.lessonsLearned}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarIncidentFinder;
