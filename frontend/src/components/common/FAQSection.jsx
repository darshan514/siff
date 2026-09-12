import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const FAQSection = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: t('faq_q1', 'What is SIF AI and how does it predict industrial risks?'),
      a: t('faq_a1', 'SIF AI is an enterprise safety intelligence system utilizing a fine-tuned DistilBERT Natural Language Processing (NLP) model to classify workplace incident observations into Serious Injury & Fatality (SIF) precursors vs routine Non-SIF observations.')
    },
    {
      q: t('faq_q2', 'What is a SIF Precursor?'),
      a: t('faq_a2', 'A SIF precursor is a high-hazard situation where minor changes in operational conditions could result in a fatality or life-altering injury (e.g. unanchored scaffold work at height, flammable gas leakage, unisolated electrical lines).')
    },
    {
      q: t('faq_q3', 'How fast is the FastAPI + DistilBERT inference engine?'),
      a: t('faq_a3', 'The FastAPI backend processes input sequence narratives (max_length=128) using PyTorch tensor computations with an average latency of ~135ms.')
    },
    {
      q: t('faq_q4', 'Can I export prediction history logs for safety audits?'),
      a: t('faq_a4', 'Yes, the Audit History page allows filtering by risk level, searching by keyword, sorting by confidence score, and exporting full CSV ledgers.')
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-12 bg-transparent text-left">
      <div className="max-w-[1515px] mx-auto flex flex-col lg:flex-row gap-16">
        <div className="lg:w-1/3">
          <h2 className="font-display-xl text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-slate-900 sticky top-32 capitalize font-extrabold">
            {t('faq_title', 'Frequently asked questions')}
          </h2>
        </div>

        <div className="lg:w-2/3 flex flex-col">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="border-b border-slate-300/60 py-6 group cursor-pointer"
              >
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-bold text-lg sm:text-xl text-slate-900 group-hover:text-[#FF5E3A] transition-colors">
                    {faq.q}
                  </h3>
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-[#FF5E3A] transition-colors">
                    {isOpen ? 'remove' : 'add'}
                  </span>
                </div>

                {isOpen && (
                  <p className="mt-4 text-slate-600 text-base leading-relaxed font-medium">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
