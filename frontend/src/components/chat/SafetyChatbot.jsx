import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  ExternalLink,
  Settings,
  ChevronDown,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Patterns that indicate an off-topic / irrelevant query
const EXPLICIT_IRRELEVANT_PATTERNS = [
  // Sports & Games
  'cricket', 'ipl', 'football', 'soccer', 'tennis', 'badminton', 'basketball', 'olympics', 'world cup',
  'fifa', 'match score', 'who won the match', 'runs scored', 'wicket', 'virat', 'dhoni', 'rohit', 'messi', 'ronaldo',
  // Entertainment & Media
  'movie', 'cinema', 'actor', 'actress', 'film', 'song', 'sing a song', 'dance', 'lyrics', 'singer',
  'bollywood', 'hollywood', 'netflix', 'celebrity', 'hero', 'heroine',
  // Cooking & Food
  'recipe', 'cook', 'cooking', 'pasta', 'pizza', 'dinner', 'lunch', 'breakfast', 'cake', 'bake',
  'baking', 'burger', 'dish', 'kitchen', 'restaurant', 'coffee', 'tea recipe', 'noodles', 'snack',
  // Jokes, Riddles & Humor
  'joke', 'funny', 'tell me a joke', 'make me laugh', 'riddle', 'poem', 'poetry', 'story',
  'fairy tale', 'fiction', 'comedy',
  // Weather & General Trivia
  'weather', 'temperature in', 'rain today', 'tomorrow weather', 'climate in', 'horoscope', 'astrology', 'zodiac',
  'capital of', 'president of', 'prime minister of', 'who is the president', 'who is the pm',
  'population of', 'how many people live in',
  // Academics & Homework
  'homework', 'math problem', 'solve 2+', 'calculate 2', 'algebra', 'chemistry homework',
  'write an essay', 'assignment',
  // Gaming
  'video game', 'minecraft', 'roblox', 'gta', 'pubg', 'free fire', 'fortnite', 'play game', 'play a game',
  // Personal & Dating
  'girlfriend', 'boyfriend', 'dating', 'love life', 'are you married', 'marry me', 'crush',
  // Unrelated Finance
  'bitcoin', 'cryptocurrency', 'crypto', 'dogecoin', 'shares of tesla', 'stock price of'
];

// Explicit Safety or Domain words that override false off-topic flags
const CORE_SAFETY_OR_DOMAIN_WORDS = [
  'sif', 'oil india', 'precursor', 'non-sif', 'iogp', 'dgms', 'oisd', 'hazop', 'qra', 'jsa',
  'loto', 'ptw', 'permit to work', 'permit', 'duliajan', 'digboi', 'moran', 'jorhat', 'rig',
  'wellhead', 'manifold', 'pipeline', 'drilling', 'plant', 'substation', 'switchgear', 'scaffold',
  'harness', 'fall from height', 'crane', 'rigging', 'h2s', 'gas leak', 'vapor', 'fire', 'explosion',
  'confined space', 'toxic', 'chemical spill', 'ppe', 'hot work', 'near miss', 'hazard', 'distilbert',
  'shift risk', 'what-if', 'what if', 'command hub', 'audit log', 'observation'
];

// Explicit queries on how to use the website or interface
const WEBSITE_USAGE_PHRASES = [
  'how to use', 'how do i use', 'how can i use', 'how do you use', 'how to navigate',
  'how does this work', 'how does it work', 'how do i get started', 'get started', 'getting started',
  'website guide', 'guide me', 'tutorial', 'walkthrough', 'tour', 'explain website', 'what does this website do',
  'what can i do here', 'what is this website', 'features of this website', 'show me around',
  'how to predict', 'how to submit', 'how to upload', 'how to download', 'how to export',
  'where is', 'where do i find', 'how to filter', 'how to search', 'how to change status',
  'how to log in', 'how to login', 'how to sign in', 'how to register', 'how to switch language',
  'how to record', 'how to simulate', 'how to track', 'how does the website work', 'explain how to use',
  'teach me how to use', 'help with the website', 'help me use the website', 'how do i use this'
];

// Keywords that indicate the question is relevant to SIF.AI, the website, or industrial safety
const RELEVANT_TOPIC_KEYWORDS = [
  // Website Pages & Core Features
  'predict', 'prediction', 'batch', 'csv', 'excel', 'xlsx', 'xls', 'audit', 'history', 'ledger',
  'analytics', 'dashboard', 'officer', 'worker', 'employee', 'login', 'sign in', 'logout', 'register',
  'account', 'password', 'forgot password', 'profile', 'my reports', 'command hub', 'export', 'download',
  'pdf', 'table', 'filter', 'sort', 'search', 'language', 'hindi', 'tamil', 'telugu', 'kannada',
  'status', 'review', 'resolve', 'clear', 'delete', 'website', 'web site', 'page', 'screen', 'button',
  'navbar', 'menu', 'sidebar', 'ui', 'card', 'slider', 'tab', 'modal', 'guide', 'tutorial', 'demo',
  'audio', 'voice', 'microphone', 'transcribe', 'speech to text', 'sound', 'recording',
  'n8n', 'webhook', 'api', 'tech stack', 'model', 'distilbert', 'pytorch', 'fastapi', 'architecture',
  'what if', 'simulation', 'simulator', 'alert', 'early warning', 'clustering', 'xai', 'explainable',
  'why detected', 'root cause', 'forecast', 'composite score', 'risk score', 'risk index', 'shift risk',
  'action tracking', 'action register', 'mitigation', 'role view', 'perspective', 'quick demo',
  'report', 'reports', 'incident', 'incidents', 'hazard', 'hazards', 'observation', 'observations',
  'narrative', 'confidence', 'precision',

  // Oil India Limited & Industrial Safety Domain
  'oil india', 'oil', 'ongc', 'dgms', 'oisd', 'hazop', 'qra', 'jsa', 'iogp', 'life saving',
  'sif', 'precursor', 'non-sif', 'duliajan', 'digboi', 'moran', 'jorhat', 'assam', 'rig', 'wellhead',
  'manifold', 'pipeline', 'drilling', 'plant', 'substation', 'switchgear', 'loto', 'lockout',
  'tagout', 'scaffold', 'scaffolding', 'harness', 'fall', 'height', 'elevation', 'crane',
  'rigging', 'lifting', 'gas', 'h2s', 'leak', 'vapor', 'fire', 'explosion', 'confined space',
  'tank', 'vessel', 'toxic', 'chemical', 'spill', 'ppe', 'goggles', 'helmet', 'boots',
  'hot work', 'ptw', 'permit', 'permit to work', 'barrier', 'incident', 'hazard', 'near miss',
  'injury', 'fatality', 'safety', 'near-miss', 'risk', 'environmental', 'compliance', 'workforce',
  'vendor', 'maintenance', 'equipment failure', 'operational risk'
];

// Greetings & Closures
const CONVERSATIONAL_KEYWORDS = [
  'hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening',
  'greetings', 'thank', 'thanks', 'thank you', 'bye', 'goodbye', 'who are you',
  'what are you', 'what is your name', 'hey there', 'namaste', 'vanakkam', 'namaskara'
];

export const isQueryRelevant = (query) => {
  if (!query || typeof query !== 'string') return false;
  const lower = query.toLowerCase().trim();
  if (lower.length < 2) return false;

  // 1. Check if the query matches explicit off-topic patterns
  const hasOffTopic = EXPLICIT_IRRELEVANT_PATTERNS.some(pat => lower.includes(pat));
  const hasDomainOverride = CORE_SAFETY_OR_DOMAIN_WORDS.some(w => lower.includes(w));
  if (hasOffTopic && !hasDomainOverride) {
    return false; // Definitely irrelevant!
  }

  // 2. Check conversational greetings & closings
  for (const word of CONVERSATIONAL_KEYWORDS) {
    if (lower.includes(word)) return true;
  }

  // 3. Check explicit questions on how to use the website
  for (const phrase of WEBSITE_USAGE_PHRASES) {
    if (lower.includes(phrase)) return true;
  }

  // 4. Check domain and website keywords
  for (const kw of RELEVANT_TOPIC_KEYWORDS) {
    if (lower.includes(kw)) return true;
  }

  return false;
};

// Comprehensive Knowledge Base for All Website Features & Safety Domain
const KNOWLEDGE_BASE = [
  {
    category: 'GREETING',
    triggers: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'who are you', 'what are you'],
    response: `Hello! 👋 I am the **SIF.AI Safety & Website Assistant** for **Oil India Limited**.

I can answer any question about **how to use this website**, explore our **AI risk forecasting**, guide you through **bulk batch analysis**, show you how to **export audit reports**, or explain **industrial safety standards**.

How can I assist you right now?`,
    suggestions: [
      'How do I use this website?',
      'How to predict SIF risk?',
      'How to upload batch CSV/Excel?',
      'Where is the Audit Log?'
    ]
  },
  {
    category: 'WEBSITE_OVERVIEW',
    triggers: [
      'how to use this website', 'how do i use this website', 'how do i use the website',
      'how to use the website', 'how does this website work', 'how does the website work',
      'how do i use this', 'how to use this', 'use the website', 'website guide',
      'how to use', 'get started', 'guide', 'tutorial', 'overview', 'features',
      'what can you do', 'what does this website do', 'how does it work', 'how it works', 'explain website', 'tour', 'walkthrough'
    ],
    response: `### 🧭 Comprehensive Website Guide — SIF.AI

Welcome to the **Oil India Limited AI-Powered Early Warning and Decision Intelligence System**. Here is how to navigate and use every part of the website:

1. **[Predict SIF Risk](/predict)**:
   - Type an observation narrative or click **Upload Audio Recording** for speech-to-text.
   - Click **Predict SIF Precursor Risk** to run DistilBERT NLP.
   - Review the **Confidence Score**, **Why Was This Detected (XAI)** breakdown, **Evidence-Based Root Causes**, and **7/14/30-Day Forecast**.
   - *Every prediction is instantly saved to the Audit Log!*

2. **[Batch Analysis](/batch)**:
   - Drag-and-drop CSV or Excel (\`.xlsx\`, \`.xls\`) spreadsheets.
   - Or click presets: *Sample CSV*, *Excel Maintenance Log*, *Incident Email*, or *Audio Memo*.
   - Click **Process Batch Analysis** to evaluate rows line-by-line.
   - Download reports via **Export CSV** or **Export PDF**.

3. **[Audit Log & Ledgers](/history)**:
   - Search by asset, location, or narrative keyword.
   - Filter by SIF / Non-SIF risk, department, or date range.
   - Transition review statuses: *Submitted* ➔ *Under Review* ➔ *Action In Progress* ➔ *Resolved*.
   - Export official branded compliance PDFs and CSV spreadsheets.

4. **[Analytics Dashboard](/analytics)**:
   - Track the live **Shift Operational Risk Index** (0–100 scale).
   - View **11 Enterprise Risk Categories**, sector risk heat maps, and barrier failure alerts.

5. **[Executive Command Hub](/officer-dashboard)**:
   - For safety officers: triage **Early-Warning Alerts**, test scenarios in the **What-If Simulation Lab**, and delegate tasks in the **Action Tracking Register**.

6. **[1-Click Demo Login](/login)**:
   - Click *⚡ Officer Demo* or *👷 Worker Demo* on the login page for instant access.`,
    suggestions: [
      'How do I predict SIF risk?',
      'How to upload batch CSV/Excel?',
      'Where is the Audit Log?',
      'How to run What-If Simulation?'
    ],
    links: [
      { label: 'Try Predict Page', path: '/predict' },
      { label: 'Open Batch Analysis', path: '/batch' },
      { label: 'View Audit Log', path: '/history' },
      { label: 'Open Command Hub', path: '/officer-dashboard' }
    ]
  },
  {
    category: 'PREDICT_PAGE',
    triggers: ['predict', 'single observation', 'narrative', 'confidence', 'score', 'xai', 'why detected', 'root cause', 'how to predict', 'input report'],
    response: `### 🔍 How to Predict SIF Risk on an Observation

Follow these simple steps:
1. Navigate to **[Predict SIF Precursor Risk](/predict)**.
2. In the **Observation Narrative** box, describe what happened or what hazard was spotted.
   - *Example*: *"Worker noticed heavy hydrocarbon gas vapor leak (42% LEL) near furnace burner #3 without alarm activation."*
3. *(Optional)* Add a Title and Facility Location (e.g. *"Duliajan Gas Processing Unit 3"*).
4. Click **Predict SIF Precursor Risk**.
5. Within 150ms, the DistilBERT AI model provides:
   - **Risk Tag**: SIF (Precursor) or Non-SIF (Routine).
   - **Confidence Metric**: Exact calibrated probability percentage.
   - **Why Detected (XAI)**: Numerical points added/subtracted based on hazard severity and active controls.
   - **Evidence Root Causes**: Preliminary hypotheses correlated against historical maintenance logs.
   - **7/14/30-Day Forecast**: Escalation probability, recurrence risk, and downtime exposure.
6. **Automatic Sync**: The observation is immediately saved to the **Audit Log**, **Executive Dashboard**, and **Analytics**!`,
    suggestions: ['How to upload audio recording?', 'Where is the Audit Log?', 'What is a SIF precursor?'],
    links: [{ label: 'Go to Predict Page', path: '/predict' }]
  },
  {
    category: 'AUDIO_UPLOAD',
    triggers: ['audio', 'voice', 'microphone', 'speech to text', 'transcribe', 'recording', 'sound', 'voice memo'],
    response: `### 🎙️ How to Use Audio Voice Memos & Speech-to-Text

You can submit voice observations directly from field sites:
1. Go to **[Predict SIF](/predict)** or **[Batch Analysis](/batch)**.
2. Click the **Upload Audio Recording** button.
3. Select an audio file from your device (\`.mp3\`, \`.wav\`, \`.m4a\`, \`.webm\`, \`.ogg\`).
4. The system transcribes the speech into text and extracts operational signals (urgency level, asset tags, detected location).
5. Review the transcript in the review box, make any manual edits if needed, and click **Apply Transcript to Report**.
6. Click **Predict** to classify the transcribed safety observation!`,
    suggestions: ['How do I predict SIF risk?', 'How to upload batch CSV/Excel?', 'Where is the Audit Log?'],
    links: [{ label: 'Try Audio Upload on Predict', path: '/predict' }]
  },
  {
    category: 'BATCH_PAGE',
    triggers: ['batch', 'csv', 'excel', 'bulk', 'multi-source', 'upload', 'xlsx', 'xls', 'spreadsheet', 'how to upload csv', 'how to upload excel', 'file formats'],
    response: `### 📊 How to Upload & Analyze Batch CSV / Excel Spreadsheets

1. Navigate to **[Bulk CSV / Excel Batch Analysis](/batch)**.
2. **File Ingestion Methods**:
   - **Drag & Drop**: Drop your \`.csv\`, \`.xlsx\`, \`.xls\`, or \`.txt\` file into the dashed box.
   - **Sample Buttons**: Click **📄 Sample CSV**, **📊 Excel Maintenance Log**, or **✉️ Incident Email Memo** for instant testing.
3. The parser automatically extracts narratives from columns like \`report\`, \`narrative\`, \`description\`, or \`observation\`.
4. Click **Process Batch Analysis**.
5. The model processes each row with progress indicators.
6. Once complete:
   - Filter results by sector (*Civil, Electrical, Fire, Mechanical, Height*).
   - Sort by SIF risk or date.
   - Click **Export CSV** or **Export PDF** to download the audited batch results!
7. *All batch observations are automatically added to the Master Audit Ledger!*`,
    suggestions: ['How to export batch results?', 'Where is the Audit Log?', 'How to predict a single report?'],
    links: [{ label: 'Open Batch Analysis', path: '/batch' }]
  },
  {
    category: 'AUDIT_PAGE',
    triggers: ['audit', 'history', 'ledger', 'records', 'where saved', 'not updated', 'update', 'how to check audit', 'audit log'],
    response: `### 📋 How to Use the Audit Log & Compliance Ledger

The Audit Log maintains a complete, searchable record of all safety observations:
1. Navigate to **[Audit & Compliance Log](/history)** in the top navigation bar.
2. **Search**: Type in the search box to find items by narrative text, report ID, location, or reporter name.
3. **Filter**:
   - **Risk Filter**: Toggle between *All*, *SIF Risk*, or *Non-SIF*.
   - **Review Status**: Filter by *All Statuses*, *Submitted*, *Under Review*, *Action In Progress*, or *Resolved*.
   - **Department Filter**: Click *Electrical, Fire & Gas, Mechanical & Lifting, Civil & Height, HSE / Safety*, etc.
   - **Date Range**: Select *From* and *To* dates.
4. **Status Workflow**: Safety Officers can change any record's status dropdown directly.
5. **Inspect Details**: Click the 👁️ eye icon on any row to open the full Explainable AI (XAI) modal with IOGP Life-Saving Rules token highlights!
6. **Export**: Click **Export CSV** or **Export PDF** to download compliance ledgers.`,
    suggestions: ['How to export PDF and CSV?', 'How do I log in as Safety Officer?', 'What is an early warning alert?'],
    links: [{ label: 'Open Audit Log', path: '/history' }]
  },
  {
    category: 'EXPORT_REPORTS',
    triggers: ['export', 'download', 'pdf', 'excel', 'export csv', 'export pdf', 'print report', 'download report'],
    response: `### 📥 How to Export PDF & Excel / CSV Reports

You can export compliance reports from multiple pages:
1. **Audit Log (\`/history\`)**:
   - Click **Export CSV** for an Excel-compatible spreadsheet of all filtered observations.
   - Click **Export PDF** for an official branded Oil India audit ledger document with IOGP rule breakdowns.
2. **Batch Analysis (\`/batch\`)**:
   - After processing a batch, click **Export CSV** or **Export PDF** in the results header.
3. **Safety Officer Dashboard (\`/officer-dashboard\`)**:
   - Click **Export PDF** or **Export Excel** in the top action buttons to download executive summary ledgers.
4. **Single Prediction (\`/predict\`)**:
   - Click **Copy JSON** or **Copy Summary** to clipboard to paste into incident management systems.`,
    suggestions: ['Open Audit Log', 'How to run Batch Analysis?', 'View Command Hub'],
    links: [{ label: 'Go to Audit Log to Export', path: '/history' }]
  },
  {
    category: 'WHAT_IF',
    triggers: ['what if', 'simulation', 'simulator', 'scenario', 'manpower', 'delay', 'decision intelligence', 'how to run simulation'],
    response: `### 🎛️ How to Use the What-If Decision Simulation Lab

The What-If Simulator allows operations and safety managers to model changes before executing them:
1. Navigate to **[Command Hub](/officer-dashboard)**.
2. Click the **What-If Simulation** tab.
3. **Adjust Interactive Sliders**:
   - **Maintenance Personnel**: Model adding +2 to +6 workers (reduces maintenance fatigue).
   - **Maintenance Schedule Delay**: Simulate postponing turnaround by 7 to 21 days (increases risk).
   - **Precursor Frequency Spike**: Stress-test against a +20% to +60% surge in field hazard reports.
   - **Clear Backlog**: Model clearing 40% to 80% of open work orders.
4. **Quick Presets**: Click preset scenario buttons like *Emergency Maintenance Delay* or *Add Maintenance Technicians*.
5. **Analyze Projected Output**:
   - Live **Projected Composite Risk Score**.
   - **Avoided Incidents Estimate** and **Avoided Downtime Hours** calculated in real time.`,
    suggestions: ['Where is Command Hub?', 'What are early warning alerts?', 'How to log in as Officer?'],
    links: [{ label: 'Open What-If Simulator', path: '/officer-dashboard' }]
  },
  {
    category: 'ALERTS',
    triggers: ['alert', 'early warning', 'warning', 'clustering', 'repeat failure', 'how to triage alerts'],
    response: `### ⚠️ How Early-Warning Alerts Work

The Early-Warning Engine detects dangerous precursors before catastrophic failures occur:
1. Navigate to **[Command Hub](/officer-dashboard)** and select the **Early-Warning Alerts** tab.
2. **Types of Alerts Detected**:
   - *Repeat Equipment Failure*: Recurring faults on critical assets (e.g. Pump P-102, Manifold V-4).
   - *Precursor Clustering*: High frequency of SIF precursor reports within a 7-day window.
   - *Hazardous Energy (LOTO) Bypass*: Unisolated electrical switchgear or valve tampering.
   - *Atmospheric Gas Release*: Flammable vapor or H2S leaks exceeding lower explosive limits (LEL).
3. **Actionable Workflow**:
   - Click **Acknowledge** to take ownership.
   - Click **Investigate** to dispatch field supervisors.
   - Click **Resolve** once physical containment is verified.`,
    suggestions: ['Where is Command Hub?', 'How does Action Tracking work?', 'How to run What-If?'],
    links: [{ label: 'View Early-Warning Alerts', path: '/officer-dashboard' }]
  },
  {
    category: 'ACTION_TRACKING',
    triggers: ['action', 'action tracking', 'mitigation', 'corrective action', 'assignee', 'remedy', 'tasks'],
    response: `### ✅ How to Use the Action Tracking Register

1. Go to **[Command Hub](/officer-dashboard)** and select the **Action Tracking** tab.
2. View active corrective and preventive actions (CAPA) tailored to Oil India facilities.
3. Each item shows:
   - **Assigned Officer / Engineer** (e.g. Mechanical In-charge, Electrical Supervisor).
   - **Target Completion Date**.
   - **Priority Level** (Critical, High, Medium).
   - **Estimated Risk Score Reduction** upon successful completion.
4. Update action statuses from *Pending* ➔ *In Progress* ➔ *Completed*.`,
    suggestions: ['View Command Hub', 'What are early warning alerts?', 'Where is Audit Log?'],
    links: [{ label: 'Open Action Tracking', path: '/officer-dashboard' }]
  },
  {
    category: 'ANALYTICS_PAGE',
    triggers: ['analytics', 'shift risk index', 'risk index', 'heat map', 'charts', 'trends', 'metrics', '11 categories'],
    response: `### 📈 How to Read the Analytics Dashboard

1. Navigate to **[Analytics Dashboard](/analytics)**.
2. **Shift Operational Risk Index**: Top card showing aggregated risk out of 100 (*Nominal, Guarded, Elevated, High, Critical*).
3. **Filter Bar**: Filter charts by department (*Electrical, Fire & Gas, Civil & Height, HSE, Operations*) and risk level.
4. **Key Visualizations**:
   - **SIF Precursor Ratio**: Distribution of high-risk vs routine observations.
   - **Incident Trend Chart**: Observation volumes over time.
   - **Plant & Sector Risk Heat Map**: Identifies which units require immediate inspection.
   - **Enterprise Early-Warning & Risk Horizon**: Breakdown across 11 Oil India enterprise risk categories.`,
    suggestions: ['Open Analytics Page', 'What are the 11 risk categories?', 'How to export reports?'],
    links: [{ label: 'Go to Analytics', path: '/analytics' }]
  },
  {
    category: 'LOGIN_DEMO',
    triggers: [
      'how do i log in as safety officer', 'how do i log in as worker', 'how to log in',
      'log in', 'login', 'sign in', 'account', 'password', 'credentials', 'demo',
      'officer demo', 'worker demo', 'how to login', 'officer login', 'worker login', 'demo sign-in'
    ],
    response: `### 🔐 1-Click Demo Login & Account Roles

You can sign in instantly without typing passwords:
1. Navigate to the **[Sign In Page](/login)**.
2. Under **⚡ Quick Demo Sign-In (1-Click)**, click either:
   - **🛡️ Officer Demo**: Logs in as Safety Officer (*darshann@gmail.com* / *123456*) to unlock the Executive Command Hub, What-If Simulator, and full Audit review powers.
   - **👷 Worker Demo**: Logs in as Field Observer (*kamalesh@gmail.com* / *123456*) for field observation entry.
3. You can also create a new profile anytime via **[Register](/register)**.`,
    suggestions: ['Go to Sign In', 'Register Account', 'How to use Audit Log?'],
    links: [{ label: 'Open Sign In Page', path: '/login' }, { label: 'Register Account', path: '/register' }]
  },
  {
    category: 'LANGUAGES',
    triggers: ['language', 'hindi', 'tamil', 'telugu', 'kannada', 'translate', 'translation', 'switch language'],
    response: `### 🌐 Multilingual Support (5 Indian Languages)

SIF.AI natively supports:
- **English** 🇬🇧
- **हिन्दी (Hindi)** 🇮🇳
- **தமிழ் (Tamil)** 🇮🇳
- **తెలుగు (Telugu)** 🇮🇳
- **ಕನ್ನಡ (Kannada)** 🇮🇳

**How to switch**:
1. Click the **Language selector** in the top navigation bar (globe icon).
2. Choose your preferred language.
3. All navigation, buttons, forms, tooltips, and explanations will instantly update!
4. *Field workers can also type observation narratives in Hindi, Tamil, Telugu, or Kannada — the AI automatically translates them before scoring!*`,
    suggestions: ['How to predict in Hindi or Tamil?', 'How to use the website?', 'Where is the Audit Log?']
  },
  {
    category: 'TECH_STACK',
    triggers: ['tech stack', 'technology', 'model', 'distilbert', 'fastapi', 'architecture', 'how it works', 'parameters', 'ai model'],
    response: `### ⚙️ System Architecture & Technology Stack

SIF.AI is built on an enterprise industrial architecture:
- **AI / NLP Model**: Fine-tuned **DistilBERT** (66 Million parameters) trained on energy-based hazard taxonomies (IOGP Life-Saving Rules).
- **Inference Runtime**: PyTorch on FastAPI ASGI server providing sub-150ms inference.
- **Backend Services**: FastAPI with SQLite database (\`sif.db\`) and JWT authentication.
- **Frontend**: React 19 + Vite + Tailwind CSS + Framer Motion.
- **Export Engines**: jsPDF for compliance PDFs, SheetJS (\`xlsx\`) for Excel/CSV data ingestion & export.
- **Automation**: Direct integration hook for **n8n workflows**.`,
    suggestions: ['How do I predict SIF risk?', 'Configure n8n Webhook', 'Where is Audit Log?']
  },
  {
    category: 'N8N_INTEGRATION',
    triggers: ['n8n', 'webhook', 'automation', 'workflow', 'api integration', 'admin access'],
    response: `### ⚡ n8n Webhook Automation Integration

You can connect SIF.AI to your **n8n instance** to orchestrate workflows:
1. Click the **⚙️ Settings** icon in the header of this chat window.
2. Paste your **n8n Webhook URL** (e.g. \`https://your-n8n.domain/webhook/sif-assistant\`).
3. Click **Save**.
4. Once configured, questions asked in this chat can optionally route through your n8n AI Agent or workflow!
5. In n8n, use a **Webhook Trigger** ➔ **AI Agent / LLM node** ➔ **Respond to Webhook**, or use it to dispatch instant alerts to Slack, WhatsApp, or Microsoft Teams!`,
    suggestions: ['How to use this website?', 'Where is Audit Log?', 'How to predict SIF risk?']
  },
  {
    category: 'SIF_CONCEPTS',
    triggers: ['sif', 'what is sif', 'precursor', 'non-sif', 'definition', 'meaning', 'difference between sif and non-sif'],
    response: `### 💡 SIF (Serious Injury and Fatality) Concepts

- **SIF Precursor**: A high-risk situation or near-miss where:
  1. High-energy hazard was present (gravity, high voltage, hydrocarbon gas, suspended load).
  2. A life-saving barrier failed or was missing (e.g. unhooked harness, bypassed LOTO, missing gas test).
  3. *Even if nobody was hurt, the potential for a fatality was genuine.*
- **Non-SIF (Routine Hazard)**: Low-energy hazards without catastrophic escalation potential (e.g. small water puddle in admin hallway, safety glasses replacement).
- **DistilBERT NLP Advantage**: Unlike simple keyword counters, DistilBERT evaluates contextual relationships to identify true precursor energy.`,
    suggestions: ['What are the 9 IOGP rules?', 'How to predict SIF risk?', 'What are the 11 risk categories?']
  },
  {
    category: 'IOGP_RULES',
    triggers: ['iogp', 'life saving', 'rules', 'regulations', 'dgms', 'oisd', 'hazop', 'qra'],
    response: `### 🛡️ IOGP 9 Life-Saving Rules & Oil India Compliance

1. **Bypassing Safety Controls**: Never override safety interlocks without written authorization.
2. **Confined Space**: Verify atmosphere testing, isolation, and entry permits before entering tanks.
3. **Driving Safety**: Wear seatbelts, adhere to speed limits, never use phones while driving.
4. **Energy Isolation (LOTO)**: Verify zero-energy state with padlocks and tags before maintenance.
5. **Hot Work**: Control ignition sources and continuously test for flammable gas.
6. **Line of Fire**: Position yourself clear of moving machinery, coiled ropes, and pressurized pipes.
7. **Safe Mechanical Lifting**: Never walk under a suspended load, verify rigging capacity.
8. **Work Authorization (PTW)**: Obtain valid Permit-to-Work before starting non-routine tasks.
9. **Working at Height**: Protect yourself against falls with 100% tie-off harness above 1.8 meters.

*Every observation in SIF.AI is mapped to these 9 rules.*`,
    suggestions: ['Predict an observation', 'What are 11 risk categories?', 'Open Audit Log']
  },
  {
    category: 'RISK_CATEGORIES',
    triggers: ['11 categories', 'enterprise risk', 'categories', 'risk categories', 'hazard category'],
    response: `### 🏢 The 11 Oil India Enterprise Risk Categories

SIF.AI classifies observations into 11 enterprise dimensions:
1. **Operational Risk**: Processing anomalies, wellhead deviations, pressure surges.
2. **Equipment & Maintenance Risk**: Mechanical wear, valve leaks, pump vibration.
3. **Health & Safety Risk**: Working at height, slips, trips, PPE compliance.
4. **Environmental Risk**: Produced water leaks, crude spills, gas flaring.
5. **Production Risk**: Well shutdown, pipeline choking, throughput loss.
6. **Project-Delay Risk**: Rig mobilization hold-ups, delayed turnarounds.
7. **Financial & Commodity-Price Risk**: Material damage, lost production barrels.
8. **Cybersecurity & Technology Risk**: SCADA communication loss, telemetry dropouts.
9. **Regulatory & Compliance Risk**: DGMS, OISD, or MoEF statutory non-compliance.
10. **Workforce & Workload Risk**: Fatigue, shortage of certified rig operators.
11. **Vendor & Supply-Chain Risk**: Faulty replacement spares, delayed contractor PTWs.`,
    suggestions: ['View Analytics Dashboard', 'Predict an observation', 'How does What-If work?'],
    links: [{ label: 'View Analytics Trends', path: '/analytics' }]
  },
  {
    category: 'FILTER_SEARCH',
    triggers: ['filter', 'how to filter', 'search', 'how to search', 'sort', 'department filter', 'date filter', 'find reports', 'filter reports'],
    response: `### 🔍 How to Filter & Search Observations
SIF.AI provides comprehensive filtering tools in the **[Audit Log (/history)](/history)** and **[Analytics (/analytics)](/analytics)**:

1. **Text Search**: Type into the search input to instantly filter observations matching narrative keywords, location (*e.g. Duliajan Rig 7*), equipment name, or reporter name.
2. **Risk Classification Filter**:
   - **All**: Displays all recorded observations.
   - **SIF Precursors**: Isolates high-energy hazards requiring mandatory IOGP barrier verification.
   - **Non-SIF**: Displays routine low-energy safety observations.
3. **Review Status Filter**: Filter records by *All Statuses*, *Submitted*, *Under Review*, *Action In Progress*, or *Resolved*.
4. **Department Filter**: Click department chips to isolate hazards in *Electrical, Fire & Gas, Mechanical & Lifting, Civil & Height, HSE / Safety, Operations*.
5. **Date Range Filter**: Select *From* and *To* dates to audit incidents across a specific shift, week, or turnaround window.`,
    suggestions: ['Where is the Audit Log?', 'How to change status?', 'How to export to PDF?'],
    links: [{ label: 'Open Audit Log & Filters', path: '/history' }]
  },
  {
    category: 'STATUS_WORKFLOW',
    triggers: ['status', 'review status', 'under review', 'action in progress', 'resolved', 'change status', 'how to change status', 'workflow', 'resolve', 'update status'],
    response: `### 🔄 How Observation Review Statuses Work
Every observation follows an audited lifecycle from discovery to closure:

1. **Submitted**: The observation has been logged by a field worker or batch upload and scored by DistilBERT AI.
2. **Under Review**: A Safety Officer is currently investigating the narrative, checking IOGP rule triggers, and planning corrective actions.
3. **Action In Progress**: Field maintenance, scaffolding re-inspection, or gas isolation is actively taking place.
4. **Resolved**: Physical controls have been restored, verified by the Safety Officer, and permanently signed off.

**How to update a status**:
- Navigate to **[Audit Log (/history)](/history)** as a Safety Officer.
- Find the observation row and click the **Status Dropdown**.
- Select the new status — the change is immediately saved to the master audit trail!`,
    suggestions: ['Open Audit Log', 'How do I log in as Officer?', 'What is Action Tracking?'],
    links: [{ label: 'Open Audit Log', path: '/history' }]
  },
  {
    category: 'PROFILE_PAGE',
    triggers: [
      'how do i use the profile page', 'how to use the profile page', 'how to use profile',
      'profile page', 'profile', 'my profile', 'my reports', 'account details', 'badge',
      'user profile', 'employee id', 'view my reports'
    ],
    response: `### 👤 How to Use the Profile Page
1. Click your **User Avatar / Name** in the top navigation bar, or navigate to **[My Profile](/profile)**.
2. **Account Details**: View your official name, employee badge ID, email address, corporate department (*e.g. Electrical Maintenance*), and access role (*Safety Officer* or *Field Observer*).
3. **My Safety Submissions**: Review a personal ledger showing all observations submitted by your account, their DistilBERT risk classification, and their current review progress.`,
    suggestions: ['Open My Profile', 'How do I use this website?', 'Where is the Audit Log?'],
    links: [{ label: 'Go to Profile Page', path: '/profile' }]
  },
  {
    category: 'REGISTER_PAGE',
    triggers: ['register', 'sign up', 'create account', 'new account', 'how to register', 'new user'],
    response: `### 📝 How to Register a New Account
1. Click **Sign In** in the top navigation bar, then click **[Create an Account](/register)**.
2. Fill in:
   - **Full Name** & **Corporate Email Address**
   - **Password** (minimum 6 characters)
   - **Company / Organization** (*Oil India Limited* by default)
   - **Department** (*Civil, Mechanical, Electrical, Fire & Gas, HSE, Drilling*)
   - **Employee ID / Badge Number**
   - **System Role**: Choose **Safety Officer** (executive command access) or **Field Observer** (observation entry).
3. Click **Create Account** — you can immediately sign in with your new credentials!`,
    suggestions: ['Go to Register', 'Sign In Page', 'How to use Demo Login?'],
    links: [{ label: 'Open Register Page', path: '/register' }, { label: 'Go to Sign In', path: '/login' }]
  },
  {
    category: 'CLEAR_RESET',
    triggers: ['reset', 'clear', 'clear filters', 'reset chat', 'reset simulation', 'start over'],
    response: `### 🧹 How to Reset Features on SIF.AI
- **Reset Chat**: Click the 🔄 circular refresh icon in the header of this chat window to reset your conversation history.
- **Clear Audit Log Filters**: In **[Audit Log (/history)](/history)**, click **All** on risk/status filters and clear the search box to view all records.
- **Reset What-If Simulator**: In **[Command Hub (/officer-dashboard)](/officer-dashboard)**, click the **Reset to Baseline** button on the simulator to return all parameters to zero.`,
    suggestions: ['How do I use this website?', 'Where is the Audit Log?', 'How to predict SIF risk?']
  },
  {
    category: 'THANKS_CLOSING',
    triggers: ['thank', 'thanks', 'thank you', 'bye', 'goodbye', 'awesome', 'great job', 'perfect'],
    response: `You are very welcome! 😊

I am always here if you need assistance with predicting safety observations, navigating the platform, or reviewing the Audit Log. Have a safe and productive shift with Oil India Limited! 🛡️`,
    suggestions: ['How do I use this website?', 'How to predict SIF risk?', 'Open Audit Log']
  }
];

export const SafetyChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! I am **SIF AI Assistant** for Oil India Limited. 🛢️\n\nI can answer **any question about how to use this website**, predict SIF risks, upload batch spreadsheets, check the Audit Log, or run What-If simulations.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How do I use this website?',
        'How to predict SIF risk?',
        'How to upload batch CSV/Excel?',
        'Where is the Audit Log?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(() => localStorage.getItem('sif_n8n_webhook_url') || '');
  const [webhookSavedNotice, setWebhookSavedNotice] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Contextual page guidance
  const getContextHelp = () => {
    switch (location.pathname) {
      case '/predict':
        return '💡 Tip: Type an observation narrative or upload a voice memo to evaluate SIF precursor risk.';
      case '/batch':
        return '💡 Tip: Drag-and-drop CSV or Excel maintenance files for high-throughput batch evaluation.';
      case '/history':
        return '💡 Tip: Search and filter the complete audit log, or export official CSV/PDF ledgers.';
      case '/officer-dashboard':
        return '💡 Tip: Monitor Early-Warning Alerts and test operational scenarios in the What-If lab.';
      case '/analytics':
        return '💡 Tip: Review the Shift Risk Index and 11 Oil India enterprise risk category distributions.';
      default:
        return null;
    }
  };

  const handleSend = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!queryText) setInputText('');
    setIsTyping(true);

    // 1. Check if the question is relevant
    const relevant = isQueryRelevant(textToSend);

    // 2. If completely irrelevant / off-topic: Instruct user to ask relevant questions
    if (!relevant) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            isWarning: true,
            text: `⚠️ **Please ask relevant questions.**\n\nI am the **SIF.AI Safety & Website Assistant** for **Oil India Limited**. I am specialized exclusively to answer questions about:\n- **Using this website**: How to predict SIF risks, upload batch CSV/Excel logs, search the Audit Log, export PDF/Excel ledgers, and run What-If simulations.\n- **Industrial Safety & Operations**: SIF vs Non-SIF criteria, IOGP 9 Life-Saving Rules, HAZOP, QRA, and Oil India safety compliance.\n\nPlease ask any question regarding how to use the website or safety operations!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [
              'How do I use this website?',
              'How to predict SIF risk?',
              'How to upload batch CSV/Excel?',
              'Where is the Audit Log?',
              'How to run What-If Simulation?'
            ]
          }
        ]);
      }, 350);
      return;
    }

    // 3. If n8n Webhook URL is configured, try sending to n8n first
    if (n8nWebhookUrl && n8nWebhookUrl.startsWith('http')) {
      try {
        const res = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: textToSend,
            path: location.pathname,
            timestamp: new Date().toISOString(),
          })
        });
        if (res.ok) {
          const data = await res.json();
          const botReply = data.output || data.response || data.text || data.message;
          if (botReply) {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: 'bot',
                text: botReply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isN8n: true
              }
            ]);
            return;
          }
        }
      } catch (err) {
        console.warn('n8n webhook call failed or not responding, using smart fallback knowledge base:', err);
      }
    }

    // 4. Smart Local Knowledge Base Response Engine
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let bestMatch = null;
      let maxScore = 0;

      for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        for (const trigger of item.triggers) {
          if (trigger.length <= 3) {
            const regex = new RegExp(`\\b${trigger}\\b`, 'i');
            if (regex.test(lower)) {
              score += trigger.length * 2;
            }
          } else if (lower.includes(trigger)) {
            score += trigger.length;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestMatch = item;
        }
      }

      let replyText = '';
      let suggestions = [];
      let links = [];

      if (bestMatch && maxScore > 0) {
        replyText = bestMatch.response;
        suggestions = bestMatch.suggestions || [];
        links = bestMatch.links || [];
      } else {
        // Fallback for relevant queries that didn't match a specific category
        replyText = `Here is information to help you with your inquiry regarding **"${textToSend}"**:

- **To Predict Risks**: Navigate to **[Predict SIF Risk](/predict)** to submit workplace incident narratives or voice memos.
- **To Process Files in Bulk**: Head to **[Batch Analysis](/batch)** to ingest CSV or Excel spreadsheets line-by-line.
- **To Access the Audit History**: Visit the **[Audit Log](/history)** to filter records and export CSV or PDF ledgers.
- **To Model Scenarios**: Use the **[What-If Simulation Lab](/officer-dashboard)** on the Executive Command Hub.

Choose any of the quick guides below for step-by-step instructions:`;
        suggestions = [
          'How do I use this website?',
          'How to predict SIF risk?',
          'How to upload batch CSV/Excel?',
          'Where is the Audit Log?'
        ];
        links = [
          { label: 'Go to Predict', path: '/predict' },
          { label: 'Open Audit Log', path: '/history' },
          { label: 'View Command Hub', path: '/officer-dashboard' }
        ];
      }

      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions,
          links
        }
      ]);
    }, 380);
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    localStorage.setItem('sif_n8n_webhook_url', n8nWebhookUrl.trim());
    setWebhookSavedNotice(true);
    setTimeout(() => setWebhookSavedNotice(false), 2500);
    setShowSettings(false);
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;

      // Header 3
      if (content.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-sm text-slate-900 mt-2 mb-1">{content.replace('### ', '')}</h4>;
      }
      // Bullet points
      const isBullet = content.startsWith('- ') || content.startsWith('* ');
      if (isBullet) {
        content = content.substring(2);
      }
      const isNumber = /^\d+\.\s/.test(content);
      if (isNumber) {
        content = content.replace(/^\d+\.\s/, '');
      }

      // Convert **bold** to <strong>
      const parts = content.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={pIdx} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-[#FF5E3A]">{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
          const match = part.match(/\[(.*?)\]\((.*?)\)/);
          if (match) {
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  navigate(match[2]);
                  setIsOpen(false);
                }}
                className="text-[#FF5E3A] font-bold underline hover:text-[#ff4820] inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>{match[1]}</span>
                <ExternalLink className="w-2.5 h-2.5 inline" />
              </button>
            );
          }
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed">
            {renderedParts}
          </li>
        );
      }
      if (isNumber) {
        return (
          <div key={idx} className="ml-2 flex items-start gap-1.5 text-xs text-slate-700 leading-relaxed my-0.5">
            <span className="font-bold text-slate-500">{line.match(/^\d+\./)[0]}</span>
            <span>{renderedParts}</span>
          </div>
        );
      }
      if (!content.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return <p key={idx} className="text-xs text-slate-700 leading-relaxed">{renderedParts}</p>;
    });
  };

  const contextHelp = getContextHelp();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative px-4 py-3.5 rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2.5 border border-white/20 hover:bg-slate-800 transition-all cursor-pointer group"
          title="Open SIF AI Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-[#FF5E3A] flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs">SIF Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Ask how to use & safety</span>
          </div>
          <span className="material-symbols-outlined text-sm text-[#FF5E3A] group-hover:translate-x-0.5 transition-transform">
            chat
          </span>
        </motion.button>
      )}

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[92vw] sm:w-[430px] h-[600px] max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden text-left"
          >
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#FF5E3A] flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">SIF.AI Assistant</h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Oil India Limited Safety Intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-slate-800 text-[#FF5E3A]' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  title="n8n Webhook Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages([
                      {
                        id: `welcome-${Date.now()}`,
                        sender: 'bot',
                        text: `Chat reset. How can I assist you with SIF.AI today?`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        suggestions: ['How do I use this website?', 'How to predict SIF risk?', 'Where is the Audit Log?']
                      }
                    ]);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Clear conversation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* n8n Settings Drawer */}
            {showSettings && (
              <div className="p-4 bg-slate-100 border-b border-slate-200 text-xs space-y-2 shrink-0 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5E3A]" />
                    <span>n8n Webhook Integration</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Connect your custom n8n webhook URL to process questions through an n8n AI agent workflow:
                </p>
                <form onSubmit={handleSaveWebhook} className="flex gap-2">
                  <input
                    type="url"
                    value={n8nWebhookUrl}
                    onChange={(e) => setN8nWebhookUrl(e.target.value)}
                    placeholder="https://your-n8n.instance/webhook/..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#FF5E3A]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 shadow-xs"
                  >
                    Save
                  </button>
                </form>
                {webhookSavedNotice && (
                  <p className="text-[10px] text-emerald-600 font-bold">✓ n8n Webhook URL saved to localStorage!</p>
                )}
              </div>
            )}

            {/* Contextual Alert Banner based on active page */}
            {contextHelp && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/80 text-[11px] text-amber-900 font-semibold flex items-center justify-between shrink-0">
                <span className="truncate">{contextHelp}</span>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-medium">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {m.sender === 'bot' ? (
                      <>
                        <span className="text-[10px] font-extrabold text-[#FF5E3A]">SIF Assistant</span>
                        {m.isN8n && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                            n8n AI
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-500">You</span>
                    )}
                    <span className="text-[9px] text-slate-400 font-mono">{m.timestamp}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[90%] shadow-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : m.isWarning
                        ? 'bg-amber-500/10 border border-amber-300 text-amber-950 rounded-tl-xs'
                        : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {m.sender === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="space-y-1">{renderFormattedText(m.text)}</div>
                    )}

                    {/* Action Links inside response */}
                    {m.links && m.links.length > 0 && (
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {m.links.map((link, lIdx) => (
                          <button
                            key={lIdx}
                            type="button"
                            onClick={() => {
                              navigate(link.path);
                              setIsOpen(false);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FF5E3A] hover:text-white text-slate-800 font-bold text-[10px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>{link.label}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                      {m.suggestions.map((s, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-[#FF5E3A] transition-all shadow-xs cursor-pointer"
                        >
                          💬 {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-1">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E3A] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E3A] animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E3A] animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>SIF Assistant is analyzing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Bar */}
            <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/60 overflow-x-auto flex items-center gap-1.5 shrink-0 text-[10px] font-bold text-slate-600 no-scrollbar">
              <span className="text-slate-400 shrink-0">Quick:</span>
              <button
                type="button"
                onClick={() => handleSend('How do I use this website?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors cursor-pointer"
              >
                Website Guide
              </button>
              <button
                type="button"
                onClick={() => handleSend('How do I predict SIF risk?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors cursor-pointer"
              >
                Predict Guide
              </button>
              <button
                type="button"
                onClick={() => handleSend('How to upload batch CSV or Excel?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors cursor-pointer"
              >
                Batch Upload
              </button>
              <button
                type="button"
                onClick={() => handleSend('Where is the Audit Log?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors cursor-pointer"
              >
                Audit Log
              </button>
              <button
                type="button"
                onClick={() => handleSend('How to run What-If Simulation?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors cursor-pointer"
              >
                What-If Lab
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask how to use the website, SIF features, HAZOP..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5E3A]/40"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 rounded-xl bg-[#FF5E3A] hover:bg-[#ff4820] text-white disabled:opacity-40 transition-colors shadow-sm shrink-0 flex items-center justify-center cursor-pointer"
                title="Send Question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SafetyChatbot;
