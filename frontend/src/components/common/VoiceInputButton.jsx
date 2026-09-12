import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const SPEECH_LOCALES = {
  en: { code: 'en-IN', label: 'English (IN)', name: 'English' },
  hi: { code: 'hi-IN', label: 'हिंदी (Hindi)', name: 'हिंदी' },
  ta: { code: 'ta-IN', label: 'தமிழ் (Tamil)', name: 'தமிழ்' },
  te: { code: 'te-IN', label: 'తెలుగు (Telugu)', name: 'తెలుగు' },
  kn: { code: 'kn-IN', label: 'ಕನ್ನಡ (Kannada)', name: 'ಕನ್ನಡ' }
};

/**
 * Removes accidental consecutive duplicated words emitted by ASR engines
 */
const cleanAdjacentDuplicates = (text) => {
  if (!text) return '';
  const words = text.split(/\s+/);
  const cleaned = [];
  for (let i = 0; i < words.length; i++) {
    if (i === 0 || words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      cleaned.push(words[i]);
    }
  }
  return cleaned.join(' ');
};

export const VoiceInputButton = ({
  currentText = '',
  onTranscript,
  className = "",
  compact = false,
}) => {
  const { lang, voiceLang, setVoiceLang, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const selectedLang = voiceLang || lang || 'en';
  const instanceId = useId();
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const shouldListenRef = useRef(false);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsListening(false);
  }, []);

  // Stop listening if another voice button starts
  useEffect(() => {
    const handleStopOther = (e) => {
      if (e.detail?.id !== instanceId) {
        stopListening();
      }
    };
    window.addEventListener('sif-stop-voice', handleStopOther);
    return () => window.removeEventListener('sif-stop-voice', handleStopOther);
  }, [instanceId, stopListening]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(t('voice_input_unsupported', 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.'));
      return;
    }

    // Stop any other active voice buttons
    window.dispatchEvent(new CustomEvent('sif-stop-voice', { detail: { id: instanceId.current } }));

    // Capture initial base text before starting voice input
    baseTextRef.current = currentText ? currentText.trim() : '';
    shouldListenRef.current = true;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = SPEECH_LOCALES[selectedLang]?.code || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalSegment = '';
        let interimSegment = '';

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';

          if (result.isFinal) {
            finalSegment += text + ' ';
          } else {
            interimSegment += text + ' ';
          }
        }

        const base = baseTextRef.current;
        const finalClean = cleanAdjacentDuplicates(finalSegment.trim());
        const interimClean = cleanAdjacentDuplicates(interimSegment.trim());

        const parts = [base, finalClean, interimClean].filter(Boolean);
        const fullTranscript = parts.join(' ');

        if (onTranscript) {
          onTranscript(fullTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error event:", event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(t('voice_input_denied', 'Microphone access denied. Please grant microphone permissions.'));
          shouldListenRef.current = false;
          setIsListening(false);
        } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setErrorMessage(`Voice error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (shouldListenRef.current) {
          // Restart recognition automatically if continuous session is active
          try {
            recognition.start();
          } catch (err) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition initialization error:", err);
      setErrorMessage("Failed to start voice input.");
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const currentLangLabel = SPEECH_LOCALES[selectedLang]?.name || 'English';

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* Voice Toggle Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`${
          compact ? 'px-2.5 py-1 rounded-lg text-[11px]' : 'px-3.5 py-2 rounded-xl text-xs'
        } font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
          isListening
            ? 'bg-red-500 border-red-400 text-white animate-pulse ring-4 ring-red-500/20'
            : 'bg-white/90 border-slate-200 text-slate-700 hover:text-[#FF5E3A] hover:border-[#FF5E3A]/40 hover:bg-orange-50/50'
        }`}
        title={isListening ? t('voice_input_stop', 'Stop listening') : t('voice_input_start', 'Click to speak')}
      >
        <span className={`material-symbols-outlined ${compact ? 'text-sm' : 'text-base'} ${isListening ? 'animate-bounce' : ''}`}>
          {isListening ? 'graphic_eq' : 'mic'}
        </span>
        <span>
          {isListening
            ? t('voice_input_listening', 'Listening...')
            : t('voice_input_start', 'Click to speak')}
        </span>
      </button>

      {/* Language Selector Pill for Voice Recognition */}
      <div className="relative inline-flex items-center">
        <select
          value={selectedLang}
          onChange={(e) => {
            if (setVoiceLang) {
              setVoiceLang(e.target.value);
            }
          }}
          disabled={isListening}
          className={`appearance-none bg-white/80 border border-slate-200/80 font-bold text-slate-700 hover:border-slate-300 focus:outline-none cursor-pointer shadow-sm disabled:opacity-50 ${
            compact
              ? 'rounded-lg px-2 py-1 text-[10px] pr-5'
              : 'rounded-xl px-2.5 py-1.5 text-[11px] pr-6'
          }`}
          title={t('voice_lang_select', 'Voice Recognition Language')}
        >
          {Object.entries(SPEECH_LOCALES).map(([key, loc]) => (
            <option key={key} value={key}>
              🎙️ {compact ? loc.name : loc.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined text-xs text-slate-400 absolute right-1 pointer-events-none">
          expand_more
        </span>
      </div>

      {/* Active Listening Indicator Banner */}
      {isListening && (
        <span className="text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
          Speaking in {currentLangLabel}...
        </span>
      )}

      {/* Error Message Toast / Tooltip */}
      {errorMessage && (
        <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-amber-600">info</span>
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-amber-500 hover:text-amber-800 font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceInputButton;
