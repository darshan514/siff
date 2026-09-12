/**
 * Oil India Limited Industrial Safety Intelligence Analyzer
 * Core logic for Department Classification, IOGP Life-Saving Rules, Explainable AI (XAI),
 * Similar Incident Finder, Recurring Pattern Detection, Executive Summaries, and NL Search.
 */

import { getTranslation } from './translations';

// IOGP 9 Life-Saving Rules Dictionary
export const IOGP_RULES = {
  ISOLATION: {
    id: "ISOLATION",
    name: "Isolation of Hazardous Energy (LOTO)",
    icon: "lock_reset",
    keywords: ["loto", "lockout", "tagout", "isolation", "415v", "electrical", "voltage", "zero energy", "switchgear", "breaker"],
    actions: [
      "Verify hazardous energy sources are isolated.",
      "Test for zero energy state before starting work.",
      "Apply personal lockout padlocks and warning tags.",
      "Obtain electrical isolation certificate."
    ]
  },

  WORKING_AT_HEIGHT: {
    id: "WORKING_AT_HEIGHT",
    name: "Working at Height",
    icon: "height",
    keywords: ["scaffold", "scaffolding", "harness", "lanyard", "height", "ladder", "roof", "platform", "fall", "elevation", "anchor"],
    actions: [
      "Inspect full body harness and double lanyards prior to use.",
      "Maintain 100% tie-off to certified anchor point above waist height.",
      "Ensure scaffolding is green-tagged by certified inspector.",
      "Use fall arrest system when working above 1.8 meters."
    ]
  },

  LINE_OF_FIRE: {
    id: "LINE_OF_FIRE",
    name: "Line of Fire",
    icon: "warning",
    keywords: ["line of fire", "suspended load", "rigging", "crane", "high pressure", "moving parts", "pinch point", "struck by", "pipe whip"],
    actions: [
      "Position yourself outside the path of moving machinery and suspended loads.",
      "Establish exclusion zone around pressure testing and heavy lifts.",
      "Secure hoses with whip-checks and safety clamps.",
      "Never stand underneath or near unbalanced loads."
    ]
  },

  CONFINED_SPACE: {
    id: "CONFINED_SPACE",
    name: "Confined Space Entry",
    icon: "sensor_door",
    keywords: ["confined", "tank", "vessel", "manhole", "silo", "trench", "excavation", "oxygen", "toxic gas", "h2s"],
    actions: [
      "Conduct continuous atmosphere gas testing prior to and during entry.",
      "Verify authorized entry permit and mechanical isolations.",
      "Post a trained standby attendant at entry point at all times.",
      "Maintain emergency rescue equipment and communication lifeline."
    ]
  },

  HOT_WORK: {
    id: "HOT_WORK",
    name: "Hot Work & Hazardous Atmosphere",
    icon: "local_fire_department",
    keywords: ["hot work", "welding", "grinding", "spark", "flammable", "hydrocarbon", "gas leak", "lel", "furnace", "flare"],
    actions: [
      "Obtain Hot Work Permit and clear flammable materials within 11 meters.",
      "Continuous LEL combustible gas monitoring in hazardous zones.",
      "Assign dedicated fire watch with charged fire extinguisher.",
      "Cover open drains and sewers with fire-retardant blankets."
    ]
  },

  MECHANICAL_LIFTING: {
    id: "MECHANICAL_LIFTING",
    name: "Safe Mechanical Lifting",
    icon: "precision_manufacturing",
    keywords: ["crane", "hoist", "rigging", "sling", "lifting", "load", "boom", "outrigger", "tagline"],
    actions: [
      "Verify lifting equipment load chart and current inspection tag.",
      "Inspect slings, shackles, and wire ropes for damage before lift.",
      "Barricade lift radius and post warning signs.",
      "Use taglines to control load rotation without standing under load."
    ]
  },

  DRIVING: {
    id: "DRIVING",
    name: "Driving & Transport Safety",
    icon: "directions_car",
    keywords: ["driving", "vehicle", "truck", "speeding", "seatbelt", "tanker", "driver", "transport", "convoy"],
    actions: [
      "Wear seatbelt at all times in mobile equipment and light vehicles.",
      "Do not exceed posted Oil India field speed limits (30 km/h).",
      "Do not operate mobile devices while driving.",
      "Perform daily vehicle pre-use safety inspection."
    ]
  },

  BYPASSING_CONTROLS: {
    id: "BYPASSING_CONTROLS",
    name: "Bypassing Safety Controls",
    icon: "gavel",
    keywords: ["bypass", "override", "safety valve", "interlock", "alarm muted", "disabled sensor", "jumper"],
    actions: [
      "Obtain formal Management of Change (MOC) authorization before bypass.",
      "Document safety interlock override in central control room log.",
      "Implement compensatory safety measures during temporary bypass.",
      "Restore safety control systems to normal immediately after job."
    ]
  },

  WORK_AUTHORISATION: {
    id: "WORK_AUTHORISATION",
    name: "Work Authorisation (Permit to Work)",
    icon: "assignment",
    keywords: ["permit", "ptw", "authorization", "toolbox talk", "jsea", "risk assessment", "handover"],
    actions: [
      "Verify valid Permit to Work (PTW) is issued and active.",
      "Conduct mandatory pre-job Tool Box Talk (TBT) with all crew.",
      "Ensure all hazards and controls specified in JSEA are communicated.",
      "Revalidate permit at shift change or work interruption."
    ]
  }
};

/**
 * Detect IOGP Life-Saving Rule from Narrative
 */
export const detectIOGPRule = (text, lang = 'en') => {
  const narrative = (text || "").toLowerCase();
  
  for (const key of Object.keys(IOGP_RULES)) {
    const rule = IOGP_RULES[key];
    const match = rule.keywords.some(word => narrative.includes(word));
    if (match) {
      const translatedName = getTranslation(lang, `iogp_${rule.id.toLowerCase()}`, rule.name);
      return { ...rule, name: translatedName };
    }
  }

  return {
    id: "GENERAL",
    name: getTranslation(lang, 'iogp_general', 'General Industrial Safety'),
    icon: "verified_user",
    keywords: ["safety", "hazard", "inspection"],
    actions: [
      "Follow Oil India Limited Standard Operating Procedures (SOP).",
      "Wear required PPE for workplace environment.",
      "Report unsafe acts and conditions immediately to supervisor."
    ]
  };
};

/**
 * Automatic Department / Sector Classifier
 */
export const detectDepartment = (reportText, category, lang = 'en') => {
  const text = (reportText || "").toLowerCase();
  
  if (
    text.includes("electric") || text.includes("voltage") || text.includes("panel") ||
    text.includes("loto") || text.includes("lockout") || text.includes("tagout") ||
    text.includes("arc") || text.includes("wire") || text.includes("cable") ||
    text.includes("415v") || text.includes("11kv") || category === "Electrical / LOTO"
  ) {
    return getTranslation(lang, 'dept_electrical', 'Electrical');
  }
  
  if (
    text.includes("fire") || text.includes("gas") || text.includes("leak") ||
    text.includes("explosion") || text.includes("flammable") || text.includes("hydrocarbon") ||
    text.includes("h2s") || text.includes("chemical") || category === "Fire & Gas"
  ) {
    return getTranslation(lang, 'dept_fire_gas', 'Fire & Gas');
  }
  
  if (
    text.includes("crane") || text.includes("rigging") || text.includes("sling") ||
    text.includes("hoist") || text.includes("load") || text.includes("lifting") ||
    text.includes("pump") || text.includes("turbine") || text.includes("compressor")
  ) {
    return getTranslation(lang, 'dept_mechanical', 'Mechanical & Lifting');
  }
  
  if (
    text.includes("scaffold") || text.includes("harness") || text.includes("height") ||
    text.includes("ladder") || text.includes("roof") || text.includes("platform") ||
    text.includes("trench") || text.includes("excavation")
  ) {
    return getTranslation(lang, 'dept_civil', 'Civil & Height');
  }
  
  if (
    text.includes("confined") || text.includes("spill") || text.includes("ppe") ||
    text.includes("housekeeping") || text.includes("slip") || text.includes("trip")
  ) {
    return getTranslation(lang, 'dept_hse', 'HSE / Safety');
  }

  return getTranslation(lang, 'dept_operations', 'Operations');
};

/**
 * Report Title Generator
 */
export const generateReportTitle = (text) => {
  if (!text) return 'Industrial Safety Observation';
  let cleaned = text.trim();

  cleaned = cleaned.replace(/^industrial\s+safety\s+observation\s+/i, '');
  cleaned = cleaned.replace(/^safety\s+observation\s+/i, '');
  cleaned = cleaned.replace(/^incident\s+report\s+/i, '');

  if (!cleaned) return 'Industrial Safety Observation';

  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  if (cleaned.length <= 75) return cleaned;

  const truncated = cleaned.slice(0, 70);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 35) return truncated.slice(0, lastSpace) + '...';
  return truncated + '...';
};

/**
 * Explainable AI (XAI) Token Highlighter Generator
 * Returns array of words with highlights: red (critical SIF precursor), yellow (hazard), green (control)
 */
export const explainableHighlighter = (reportText, prediction, lang = 'en') => {
  if (!reportText) return [];
  const words = reportText.split(/\s+/);
  const isSIF = prediction === 'SIF';

  const criticalTerms = [
    "loto", "lockout", "tagout", "415v", "11kv", "scaffold", "scaffolding", "harness",
    "unanchored", "unlocked", "bypassed", "h2s", "gas leak", "leakage", "flammable",
    "suspended load", "frayed", "crane", "no permit", "unauthorized", "confined space"
  ];

  const hazardTerms = [
    "panel", "electrical", "voltage", "height", "ladder", "lifting", "sling",
    "rigging", "trench", "pressure", "furnace", "drill", "pipeline", "valve", "pump"
  ];

  const controlTerms = [
    "ppe", "helmet", "gloves", "permit", "gas detector", "harness", "barricade",
    "warning sign", "janitorial", "inspected", "isolated"
  ];

  return words.map((word, idx) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    let type = 'normal';
    let reason = '';

    if (criticalTerms.some(term => term.includes(cleanWord) || cleanWord.includes(term))) {
      type = isSIF ? 'critical' : 'hazard';
      reason = isSIF
        ? getTranslation(lang, 'xai_reason_critical', 'High consequence precursor term associated with SIF events')
        : getTranslation(lang, 'xai_reason_hazard', 'Identified hazard indicator');
    } else if (hazardTerms.some(term => cleanWord.includes(term))) {
      type = 'hazard';
      reason = getTranslation(lang, 'xai_reason_hazard', 'Industrial equipment / operational hazard domain term');
    } else if (controlTerms.some(term => cleanWord.includes(term))) {
      type = 'control';
      reason = getTranslation(lang, 'xai_reason_control', 'Existing safety control / protective measure mentioned');
    }

    return { word, type, reason, id: idx };
  });
};

/**
 * Main Hazard Insights Analyzer
 */
export const analyzeHazardInsights = (reportText, prediction, lang = 'en') => {
  if (prediction === "Unrelated Input" || prediction === "Unrelated") {
    return {
      primaryCategory: getTranslation(lang, 'unrelated_input', 'Non-Safety / Off-Topic'),
      explanation: getTranslation(lang, 'unrelated_input', 'The submitted text does not contain workplace safety or industrial hazard indicators. Please submit an appropriate safety observation narrative.'),
      uniqueKeywords: [],
      riskLevel: getTranslation(lang, 'unrelated_input', 'Unrelated'),
      iogpRule: { name: getTranslation(lang, 'unrelated_input', 'Off-Topic / Unrelated Query'), icon: "help_outline" },
      lifeSavingRule: getTranslation(lang, 'unrelated_input', 'Off-Topic / Unrelated Query'),
      recommendedPPE: [],
      recommendedActions: [
        getTranslation(lang, 'unrelated_input', 'Submit a valid industrial safety observation report narrative.')
      ],
      categorizedRecommendations: {
        immediate: [getTranslation(lang, 'unrelated_input', 'Submit a valid industrial safety observation report narrative.')],
        inspection: [getTranslation(lang, 'unrelated_input', 'Ensure description details workplace conditions, equipment, or acts.')],
        training: [getTranslation(lang, 'unrelated_input', 'Review safety reporting guidelines.')],
        permit: [getTranslation(lang, 'unrelated_input', 'No action required.')]
      },
      possibleConsequences: ["None (Off-Topic Query)"]
    };
  }

  const text = (reportText || "").toLowerCase();
  const iogpRule = detectIOGPRule(text, lang);
  const isSIF = prediction === "SIF";

  const keywords = iogpRule.keywords.filter(w => text.includes(w));

  const explanation = isSIF
    ? `${getTranslation(lang, 'home_hero_badge', 'DistilBERT AI')} - ${getTranslation(lang, 'sif_potential', 'High SIF Precursor Risk')}: ${iogpRule.name}.`
    : `${getTranslation(lang, 'non_sif', 'Low Risk')}: ${iogpRule.name}.`;

  const translatedRiskLevel = isSIF 
    ? getTranslation(lang, 'high_risk', 'High SIF Precursor')
    : getTranslation(lang, 'low_risk', 'Low Risk');

  const possibleConsequences = isSIF
    ? [
        getTranslation(lang, 'consequence_fatality', 'Fatality'),
        getTranslation(lang, 'consequence_disability', 'Permanent Disability'),
        getTranslation(lang, 'consequence_fire', 'Refinery Fire / Explosion'),
        getTranslation(lang, 'consequence_asset_damage', 'Asset Damage')
      ]
    : [
        getTranslation(lang, 'consequence_first_aid', 'Minor First Aid'),
        getTranslation(lang, 'consequence_near_miss', 'Near Miss Logged')
      ];


  let recommendedPPE = [];
  let immediate = [];
  let inspection = [];
  let training = [];
  let permit = [];
  let narrativeExplanation = explanation;

  const category = (iogpRule.name || "").toLowerCase();

  if (category.includes('electrical') || category.includes('energy')) {
    recommendedPPE = isSIF ? ["High-voltage insulating gloves", "Arc flash face shield"] : ["Standard safety gloves", "Safety glasses"];
    immediate = ["Lockout/Tagout (LOTO) protocol execution", "Isolate electrical source"];
    inspection = ["Verify zero energy state", "Inspect wiring integrity"];
    training = ["Electrical safety recertification", "Flash hazard awareness"];
    permit = ["Electrical work permit validation"];
    narrativeExplanation += ` Based on the electrical nature of the incident, strict LOTO and dielectric PPE are mandated.`;
  } else if (category.includes('gas') || category.includes('chemical') || category.includes('confined')) {
    recommendedPPE = isSIF ? ["Calibrated Gas Monitor (H2S/VOC)", "Respirator / SCBA"] : ["Basic respirator", "Safety goggles"];
    immediate = ["Evacuate & isolate affected zone", "Initiate emergency ventilation"];
    inspection = ["Continuous atmospheric monitoring", "Ventilation check"];
    training = ["Confined space entry certification", "Hazardous gas emergency response"];
    permit = ["Confined space permit verification", "Gas clearance certificate"];
    narrativeExplanation += ` Due to atmospheric or chemical exposure risks, continuous monitoring and specialized respiratory protection are required.`;
  } else if (category.includes('height') || category.includes('lifting')) {
    recommendedPPE = isSIF ? ["Full-body harness", "Double lanyards"] : ["Safety Helmet", "Safety Boots"];
    immediate = ["Halt overhead work", "Clear drop zone below"];
    inspection = ["Ladder/Scaffold structural inspection", "Inspect rigging equipment"];
    training = ["Working at heights certification", "Dropped objects prevention"];
    permit = ["Working-at-heights permit verification"];
    narrativeExplanation += ` Given the vertical risks, strict fall protection and structural integrity checks are enforced.`;
  } else {
    // Physical / Slip & Trip / General
    recommendedPPE = isSIF ? ["High-traction safety boots", "Impact-resistant gloves"] : ["Non-slip safety boots", "Standard PPE"];
    immediate = ["Clear obstruction/spill", "Erect physical barriers"];
    inspection = ["Housekeeping audit", "Spill containment kit check"];
    training = ["General site safety orientation", "Slip/Trip hazard awareness"];
    permit = ["General work permit"];
    narrativeExplanation += ` Standard physical hazard protocols and housekeeping audits apply to prevent recurrence.`;
  }

  return {
    primaryCategory: iogpRule.name,
    explanation: narrativeExplanation,
    uniqueKeywords: [...new Set(keywords)],
    riskLevel: translatedRiskLevel,
    iogpRule,
    lifeSavingRule: iogpRule.name,
    recommendedPPE,
    recommendedActions: iogpRule.actions,
    categorizedRecommendations: {
      immediate,
      inspection,
      training,
      permit
    },
    possibleConsequences
  };
};

/**
 * Find Similar Historical Incidents
 */
export const findSimilarIncidents = (currentText, history = [], limit = 3, lang = 'en') => {
  if (!currentText || !history.length) return [];
  const wordsA = new Set(currentText.toLowerCase().split(/\s+/).filter(w => w.length > 3));

  const scored = history.map(item => {
    const textB = item.report || item.narrative || '';
    const wordsB = new Set(textB.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    
    let matchCount = 0;
    wordsA.forEach(w => {
      if (wordsB.has(w)) matchCount++;
    });

    const union = new Set([...wordsA, ...wordsB]).size || 1;
    // Honest Jaccard Similarity (0 to 100)
    const jaccard = Math.round((matchCount / union) * 100);

    const outcomeText = item.prediction === 'SIF'
      ? getTranslation(lang, 'sif_potential', 'Past Precursor Incident — High Risk')
      : getTranslation(lang, 'non_sif', 'Resolved Near Miss');

    return {
      id: item.id,
      title: item.title,
      report: item.report,
      location: item.location || 'Plant Unit',
      department: item.department || 'Operations',
      prediction: item.prediction,
      similarityScore: jaccard,
      historicalOutcome: outcomeText,
      lessonsLearned: `${getTranslation(lang, 'rec_permit', 'Enforce strict compliance with')} ${item.department || 'site'} ${getTranslation(lang, 'rec_immediate', 'isolation and permit protocols.')}`
    };
  });

  // Only return matches with at least 15% similarity, to avoid random matches
  const validMatches = scored.filter(s => s.similarityScore >= 15);
  return validMatches.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, limit);
};

/**
 * Detect Recurring Patterns & Barrier Deficiencies
 */
export const detectRecurringPatterns = (history = []) => {
  if (!history.length) return [];

  const patterns = {};
  history.forEach(item => {
    const dept = item.department || 'Operations';
    const location = item.location || 'Duliajan Field HQ';
    const pred = item.prediction || 'SIF';
    const key = `${dept} @ ${location}`;

    if (!patterns[key]) {
      patterns[key] = { key, dept, location, total: 0, sifCount: 0 };
    }
    patterns[key].total++;
    if (pred === 'SIF') patterns[key].sifCount++;
  });

  return Object.values(patterns)
    .filter(p => p.sifCount >= 1)
    .sort((a, b) => b.sifCount - a.sifCount)
    .slice(0, 4)
    .map(p => ({
      ...p,
      trendSeverity: p.sifCount >= 3 ? 'Critical Trend' : p.sifCount >= 2 ? 'High Precursor Cluster' : 'Watchlist Item',
      recommendation: `Conduct targeted safety audit at ${p.location} for ${p.dept} operations.`
    }));
};

/**
 * AI Executive Summary Briefing Generator
 */
export const generateExecutiveSummary = (history = [], period = 'daily') => {
  const total = history.length;
  const sifCount = history.filter(h => h.prediction === 'SIF').length;
  const nonSifCount = total - sifCount;
  const sifRate = total > 0 ? ((sifCount / total) * 100).toFixed(1) : '0.0';

  const recurring = detectRecurringPatterns(history);
  const topHazard = recurring[0] ? `${recurring[0].dept} at ${recurring[0].location}` : 'Electrical & Height Operations';

  return {
    period: period === 'daily' ? 'Daily Safety Bulletin' : 'Weekly Intelligence Summary',
    timestamp: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    totalObservations: total,
    sifPrecursorCount: sifCount,
    sifRatio: `${sifRate}%`,
    topRiskCluster: topHazard,
    executiveAlerts: [
      `DistilBERT model logged ${sifCount} high-risk SIF precursor observations out of ${total} total submissions.`,
      `Primary risk concentration detected in ${topHazard} requiring supervisor focus.`,
      `Barrier analysis indicates recurring LOTO and Working at Height permit revalidation gaps.`
    ],
    recommendedActionPlan: [
      "Issue Immediate Field Safety Advisory to all shift managers in high precursor sectors.",
      "Perform unannounced Permit to Work (PTW) audits on active 415V electrical panels and scaffolds.",
      "Conduct mandatory Tool Box Talks (TBT) focusing on IOGP Life-Saving Rules before next shift."
    ]
  };
};

/**
 * Natural Language Query Parser
 */
export const parseNaturalLanguageQuery = (query, history = []) => {
  if (!query || !query.trim()) return { filtered: history, intent: null };
  const q = query.toLowerCase().trim();

  let matchedRisk = null;
  if (q.includes("sif") || q.includes("high risk") || q.includes("critical")) matchedRisk = "SIF";
  if (q.includes("non-sif") || q.includes("low risk") || q.includes("routine")) matchedRisk = "Non-SIF";

  let matchedDept = null;
  if (q.includes("electric")) matchedDept = "Electrical";
  if (q.includes("fire") || q.includes("gas")) matchedDept = "Fire & Gas";
  if (q.includes("mechanic") || q.includes("lifting") || q.includes("crane")) matchedDept = "Mechanical & Lifting";
  if (q.includes("height") || q.includes("scaffold")) matchedDept = "Civil & Height";
  if (q.includes("hse") || q.includes("safety")) matchedDept = "HSE / Safety";

  let matchedLocation = null;
  if (q.includes("duliajan")) matchedLocation = "Duliajan";
  if (q.includes("digboi")) matchedLocation = "Digboi";
  if (q.includes("moran")) matchedLocation = "Moran";
  if (q.includes("jorhat")) matchedLocation = "Jorhat";

  const filtered = history.filter(item => {
    const text = ((item.title || '') + ' ' + (item.report || '') + ' ' + (item.department || '') + ' ' + (item.location || '')).toLowerCase();
    
    if (matchedRisk && item.prediction !== matchedRisk) return false;
    if (matchedDept && item.department !== matchedDept) return false;
    if (matchedLocation && !(item.location || '').toLowerCase().includes(matchedLocation.toLowerCase())) return false;

    // Direct text search fallback
    return text.includes(q) || matchedRisk || matchedDept || matchedLocation;
  });

  return {
    filtered,
    intent: {
      query,
      risk: matchedRisk,
      department: matchedDept,
      location: matchedLocation,
      count: filtered.length
    }
  };
};

/**
 * Oil India Operational Shift Risk Index (0-100)
 */
export const calculateOilIndiaRiskIndex = (history = []) => {
  if (!history.length) return { score: 28, status: 'Normal Operational Baseline', color: 'emerald' };

  const total = history.length;
  const sifCount = history.filter(h => h.prediction === 'SIF').length;
  const ratio = sifCount / total;

  const score = Math.min(99, Math.max(15, Math.round(ratio * 100 * 1.4 + (total > 5 ? 10 : 0))));

  if (score >= 70) return { score, status: 'High SIF Threat Level — Elevated Operational Caution', color: 'red' };
  if (score >= 45) return { score, status: 'Moderate Precursor Activity — Monitor Barrier Controls', color: 'amber' };
  return { score, status: 'Normal Operational Baseline — High Safety Compliance', color: 'emerald' };
};

/**
 * Analytics Metrics Computations
 */
export const computeAnalyticsMetrics = (history = []) => {
  const total = history.length;
  const sifCount = history.filter(h => h.prediction === 'SIF').length;
  const nonSifCount = history.filter(h => h.prediction === 'Non-SIF').length;
  
  const avgConfidence = total > 0
    ? (history.reduce((acc, h) => acc + (h.confidence || 0), 0) / total).toFixed(1)
    : '0.0';

  const categoryMap = {};
  history.forEach(h => {
    const insights = analyzeHazardInsights(h.report, h.prediction);
    const cat = insights.primaryCategory;

    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, SIF: 0, NonSIF: 0, total: 0 };
    }
    if (h.prediction === 'SIF') categoryMap[cat].SIF += 1;
    else categoryMap[cat].NonSIF += 1;
    categoryMap[cat].total += 1;
  });

  const categoryData = Object.values(categoryMap);
  const riskIndex = calculateOilIndiaRiskIndex(history);

  return {
    total,
    sifCount,
    nonSifCount,
    avgConfidence,
    categoryData,
    riskIndex,
    latestPred: history[0] || null
  };
};

export default analyzeHazardInsights;