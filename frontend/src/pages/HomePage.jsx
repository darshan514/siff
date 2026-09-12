import React from 'react';
import { Link } from 'react-router-dom';

import QuickPredictWidget from '../components/common/QuickPredictWidget';
import FAQSection from '../components/common/FAQSection';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const HomePage = () => {
  const { t } = useLanguage();
  const { isAuthenticated, isSafetyOfficer } = useAuth();
  return (
    <div className="w-full">
      
      {/* Section 1: Hero Section */}
      <section className="relative pt-48 pb-24 px-6 sm:px-12 min-h-[90vh] flex flex-col items-center justify-center text-center overflow-hidden cursor-reactive-container">
        <div className="absolute inset-0 hero-dynamic-gradient cursor-reactive -z-10" />

        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-4 py-2 mb-8 shadow-sm">
          <span className="bg-[#d6ed7a] text-[#5a6c00] font-label-caps text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
            NEW
          </span>
          <span className="font-body-md text-sm text-slate-800">
            AI Safety Intelligence Platform
          </span>
        </div>

        <h1 className="font-display-xl text-[54px] sm:text-[64px] leading-[1.1] tracking-tighter text-slate-900 max-w-4xl mb-6 font-extrabold">
          Build with SIF AI
        </h1>

        <p className="font-body-lg text-lg sm:text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed">
          SIF AI lets you analyze safety observation narratives in seconds. An airy, minimalist workspace designed for seamless AI risk integration.
        </p>

      </section>

      {/* Section 2: Short Workflow Pipeline */}
      <section className="py-16 px-6 sm:px-12 bg-white/40 border-y border-white/60 text-left">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF5E3A] font-mono">
              Platform Workflow
            </span>
            <h2 className="font-display-xl text-3xl font-extrabold text-slate-900">
              End-to-End Safety Intelligence Process
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
              <span className="material-symbols-outlined text-[#FF5E3A]">description</span>
              <p className="font-extrabold text-xs text-slate-900">1. Input Report</p>
              <p className="text-[10px] text-slate-500">Observation Narrative</p>
            </div>

            <div className="text-slate-400 font-bold text-lg hidden sm:flex items-center justify-center">↓</div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
              <span className="material-symbols-outlined text-purple-600">memory</span>
              <p className="font-extrabold text-xs text-slate-900">2. AI Analysis</p>
              <p className="text-[10px] text-slate-500">DistilBERT Tokenizer</p>
            </div>

            <div className="text-slate-400 font-bold text-lg hidden sm:flex items-center justify-center">↓</div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
              <span className="material-symbols-outlined text-amber-600">warning</span>
              <p className="font-extrabold text-xs text-slate-900">3. Risk Classification</p>
              <p className="text-[10px] text-slate-500">SIF Precursor Score</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pt-2 max-w-3xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm space-y-1">
              <span className="material-symbols-outlined text-emerald-600">health_and_safety</span>
              <p className="font-extrabold text-xs text-slate-900">4. Safety Recommendations</p>
              <p className="text-[10px] text-slate-500">PPE & Actions Checklist</p>
            </div>

            <div className="text-slate-400 font-bold text-lg hidden sm:flex items-center justify-center">↓</div>

            <div className="p-4 rounded-2xl bg-[#FF5E3A]/10 border border-[#FF5E3A]/30 shadow-sm space-y-1">
              <span className="material-symbols-outlined text-[#FF5E3A]">picture_as_pdf</span>
              <p className="font-extrabold text-xs text-slate-900">5. Report Generation</p>
              <p className="text-[10px] text-slate-500">Downloadable PDF</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Feature Cards */}
      <section className="py-20 px-6 sm:px-12 relative text-left">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Core Capabilities
            </span>
            <h2 className="font-display-xl text-3xl font-extrabold text-slate-900">
              Enterprise Feature Matrix
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5E3A]/10 text-[#FF5E3A] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">AI Risk Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Instant sequence classification identifying SIF precursors from observation text.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Real-time Prediction</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Asynchronous FastAPI backend returning confidence scores in under 150ms.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">history</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">History Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Complete searchable ledger of historical observations with risk filters.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">monitoring</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Analytics Dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Executive telemetry visualising risk distribution, trends, and common hazards.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">picture_as_pdf</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">PDF Reports</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                One-click enterprise PDF incident report generation formatted for safety compliance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/60 border border-white/80 backdrop-blur-xl shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Batch CSV Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Upload CSV files to analyze hundreds of safety incidents line-by-line automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Model Information & System Capabilities */}
      <section className="py-16 px-6 sm:px-12 bg-white/40 border-y border-white/60 text-left">
        <div className="max-w-6xl mx-auto space-y-6">
          <h2 className="font-display-xl text-2xl font-extrabold text-slate-900">
            Model Architecture & System Capabilities
          </h2>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#FF5E3A] text-base">memory</span>
              <span>DistilBERT (66M Params)</span>
            </span>

            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-base">dns</span>
              <span>FastAPI ASGI Server</span>
            </span>

            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-base">layers</span>
              <span>PyTorch Deep Learning Engine</span>
            </span>

            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 text-base">code</span>
              <span>Transformer NLP Pipeline</span>
            </span>

            <span className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-base">bolt</span>
              <span>Real-time Sub-150ms Inference</span>
            </span>
          </div>
        </div>
      </section>

      {/* Section 5: CTA Section */}
      <section className="py-20 px-6 sm:px-12 relative flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl space-y-6">
          <h2 className="font-display-xl text-3xl sm:text-4xl font-extrabold text-slate-900">
            Ready to evaluate industrial safety reports?
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Analyze observation narratives with enterprise-grade DistilBERT NLP.
          </p>
          <Link
            to="/predict"
            className="inline-flex items-center gap-2 bg-[#FF5E3A] hover:bg-[#ff4820] text-white font-extrabold text-sm px-8 py-4 rounded-full shadow-lg transition-all"
          >
            <span>Analyze Safety Report</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Section 7: FAQ Accordion */}
      <FAQSection />

      {/* Section 8: Final Dynamic CTA */}
      <section className="py-24 px-6 sm:px-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh] cursor-reactive-container text-center">
        <div className="absolute inset-0 cta-dynamic-gradient cursor-reactive -z-10" />
        
        <h2 className="font-display-xl text-4xl sm:text-6xl leading-tight text-white mb-10 max-w-2xl drop-shadow-sm font-extrabold">
          So, what safety incident are we analyzing today?
        </h2>

        <Link
          to="/predict"
          className="inline-flex items-center gap-3 bg-white/30 backdrop-blur-md border border-white/60 text-white font-body-lg text-lg font-medium px-10 py-5 rounded-full hover:bg-white/40 hover:scale-105 transition-all shadow-sm group relative z-10"
        >
          <span>Get started</span>
          <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-900 text-sm group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </div>
        </Link>
      </section>

    </div>
  );
};

export default HomePage;
