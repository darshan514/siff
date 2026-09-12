/**
 * Automatic Multi-Language Translator Utility
 * Detects Indian languages (Tamil, Hindi, Telugu, Kannada) and automatically
 * translates input narrative to clear English before passing to AI SIF models.
 */

const INDIC_SCRIPT_REGEX = /[\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF]/;

/**
 * Check if string contains Indic / non-English script
 */
export const isNonEnglishText = (text) => {
  if (!text || typeof text !== 'string') return false;
  return INDIC_SCRIPT_REGEX.test(text);
};

/**
 * Translates input text into English if non-English
 * @param {string} text 
 * @returns {Promise<string>} English translated string
 */
export const translateToEnglish = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim()) return '';
  const trimmed = text.trim();

  // If text is already in English, return as-is
  if (!isNonEnglishText(trimmed)) {
    return trimmed;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translated = data[0].map((item) => item[0]).join('');
        if (translated && translated.trim()) {
          console.log(`[Auto-Translate] "${trimmed}" -> "${translated.trim()}"`);
          return translated.trim();
        }
      }
    }
  } catch (err) {
    console.warn("[Auto-Translate] Translation API network error, using domain fallback:", err);
  }

  // Domain Dictionary Fallback for Safety Keywords
  let fallback = trimmed;
  
  // Tamil mappings
  fallback = fallback
    .replace(/மின்சார/g, "electrical ")
    .replace(/பேனலில்/g, "panel ")
    .replace(/பராமரிப்பு/g, "maintenance ")
    .replace(/உயரம்/g, "height ")
    .replace(/கசிவு/g, "leakage ")
    .replace(/வாயு/g, "gas ")
    .replace(/தீ/g, "fire ")
    .replace(/கட்டமைப்பு/g, "scaffold ")
    .replace(/அபாயம்/g, "hazard ");

  // Hindi mappings
  fallback = fallback
    .replace(/इलेक्ट्रिकल/g, "electrical ")
    .replace(/पैनल/g, "panel ")
    .replace(/रखरखाव/g, "maintenance ")
    .replace(/ऊंचाई/g, "height ")
    .replace(/रिसाव/g, "leakage ")
    .replace(/गैस/g, "gas ")
    .replace(/आग/g, "fire ")
    .replace(/खतरा/g, "hazard ");

  // Telugu mappings
  fallback = fallback
    .replace(/ఎలక్ట్రికల్/g, "electrical ")
    .replace(/ప్యానెల్/g, "panel ")
    .replace(/నిర్వహణ/g, "maintenance ")
    .replace(/ఎత్తు/g, "height ")
    .replace(/లీకేజ్/g, "leakage ");

  // Kannada mappings
  fallback = fallback
    .replace(/ವಿದ್ಯುತ್/g, "electrical ")
    .replace(/ಪ್ಯಾನಲ್/g, "panel ")
    .replace(/ನಿರ್ವಹಣೆ/g, "maintenance ")
    .replace(/ಎತ್ತರ/g, "height ")
    .replace(/ಸೋರಿಕೆ/g, "leakage ");

  return fallback;
};

export default translateToEnglish;
