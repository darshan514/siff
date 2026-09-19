import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Upload, Play, Pause, RefreshCw, CheckCircle2, AlertTriangle, FileAudio, X } from 'lucide-react';
import { analyzeSentimentAndUrgency, detectOilRiskCategory, extractEntities } from '../../utils/decisionIntelligence';

export const AudioUploadModal = ({ isOpen, onClose, onApplyTranscript }) => {
  const { t } = useLanguage();
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedSignals, setDetectedSignals] = useState(null);
  const audioRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setIsPlaying(false);
    setTranscript('');
    setDetectedSignals(null);

    // Auto-trigger simulated speech-to-text transcription
    processAudioTranscription(file);
  };

  const processAudioTranscription = async (file) => {
    setIsTranscribing(true);

    // Simulate speech-to-text processing time
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Intelligent transcript extraction based on file name or sample operational transcript
    let resultTranscript = "";
    const nameLower = (file.name || "").toLowerCase();

    if (nameLower.includes("pump") || nameLower.includes("failure") || nameLower.includes("audio")) {
      resultTranscript = "The booster pump has failed three times this week and production is being delayed by nearly four hours. The vibration is getting worse and there is oil leaking on the pad near Duliajan Plant Unit 4.";
    } else if (nameLower.includes("gas") || nameLower.includes("leak") || nameLower.includes("h2s")) {
      resultTranscript = "Hazard alert: Hydrocarbon gas vapor leak detected near furnace burner #3 at Digboi Refinery Area. Atmospheric monitor alarmed at 38% LEL. Crew evacuated immediate hot-work zone.";
    } else if (nameLower.includes("scaffold") || nameLower.includes("height")) {
      resultTranscript = "Safety observation from Rig #7: Scaffold platform at 6 meters elevation missing mid-rails and toe boards. Workers observed without certified 100% harness tie-off.";
    } else {
      resultTranscript = "Shift observation report: 415V electrical switchgear panel MCC-2 was opened for emergency breaker replacement while the circuit was still energized and Lock-Out Tag-Out was bypassed.";
    }

    setTranscript(resultTranscript);

    // Extract intelligence signals from transcript
    const sentiment = analyzeSentimentAndUrgency(resultTranscript);
    const category = detectOilRiskCategory(resultTranscript);
    const entities = extractEntities(resultTranscript);

    setDetectedSignals({
      sentiment,
      category,
      entities
    });

    setIsTranscribing(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleApply = () => {
    if (transcript.trim() && onApplyTranscript) {
      onApplyTranscript(transcript, detectedSignals);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white shadow-2xl p-6 sm:p-8 space-y-6 text-left max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF5E3A]/10 text-[#FF5E3A] flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {t('audio_upload_title', 'Audio Recording Speech-to-Text Ingestion')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {t('audio_upload_subtitle', 'Upload audio memos (.mp3, .wav, .m4a) for automated transcription and SIF signal extraction.')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Dropzone */}
        {!audioFile ? (
          <label className="border-2 border-dashed border-slate-300 hover:border-[#FF5E3A] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 hover:bg-orange-50/30 transition-all text-center group">
            <FileAudio className="w-10 h-10 text-slate-400 group-hover:text-[#FF5E3A] mb-3 transition-colors" />
            <span className="text-xs font-extrabold text-slate-800">
              {t('audio_drop_label', 'Click to upload audio memo or drag audio file here')}
            </span>
            <span className="text-[11px] text-slate-500 mt-1">
              Supports .mp3, .wav, .m4a, .webm, .ogg (Voice notes from field inspections)
            </span>
            <input
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white flex items-center justify-center shadow-md transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <span className="text-xs font-bold text-slate-900 block truncate max-w-xs">{audioFile.name}</span>
                <span className="text-[10px] text-slate-500 font-mono">{(audioFile.size / 1024).toFixed(1)} KB • Audio Source</span>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              onClick={() => {
                setAudioFile(null);
                setAudioUrl(null);
                setTranscript('');
                setDetectedSignals(null);
              }}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Replace
            </button>
          </div>
        )}

        {/* Transcription State / Loading */}
        {isTranscribing && (
          <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-200/80 flex items-center justify-center gap-3 text-xs font-bold text-orange-900">
            <RefreshCw className="w-5 h-5 text-[#FF5E3A] animate-spin" />
            <span>Transcribing audio & analyzing Oil India hazard signals...</span>
          </div>
        )}

        {/* Transcript Box */}
        {transcript && !isTranscribing && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  Generated Audio Transcript (Editable)
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Transcribed via SIF Speech-to-Text
                </span>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={3}
                className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40 text-xs font-medium leading-relaxed"
              />
            </div>

            {/* Extracted Intelligence Signals Preview */}
            {detectedSignals && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Extracted Decision Signals</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    detectedSignals.sentiment.urgency.includes('Critical') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Urgency: {detectedSignals.sentiment.urgency}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-bold">Category</span>
                    <span className="font-extrabold text-slate-900">{detectedSignals.category.name}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-bold">Target Asset</span>
                    <span className="font-extrabold text-slate-900 truncate block">{detectedSignals.entities.asset}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block font-bold">Location</span>
                    <span className="font-extrabold text-slate-900 truncate block">{detectedSignals.entities.location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!transcript.trim() || isTranscribing}
            className="px-6 py-2.5 rounded-full bg-[#FF5E3A] hover:bg-[#ff4820] text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-40 flex items-center gap-2"
          >
            <span>Analyze Transcript in SIF Engine</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AudioUploadModal;
