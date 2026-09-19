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
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Built-in comprehensive Knowledge Base for SIF.AI & Oil India Limited Operations
const KNOWLEDGE_BASE = [
  {
    triggers: ['how to use', 'get started', 'guide', 'tutorial', 'overview', 'features', 'what can you do', 'help'],
    response: `Welcome to **SIF.AI — Early Warning & Decision Intelligence System** for Oil India Limited! 🛢️

Here is how you can use this platform:
1. **Predict SIF Precursors** (\`/predict\`): Enter field incident narratives or upload audio recordings to classify SIF risk via DistilBERT NLP with Explainable AI (XAI) and 7/14/30-day forecast.
2. **Bulk Batch Analysis** (\`/batch\`): Ingest multi-source files (CSV, Excel maintenance logs, email memos, audio) to score hundreds of records at once.
3. **Audit Log & Ledger** (\`/history\`): View the immutable observation log, filter by risk or department, update review status, and export official CSV / PDF ledgers.
4. **Analytics Telemetry** (\`/analytics\`): Monitor the Shift Operational Risk Index, heat maps, barrier failure patterns, and 11 Oil India risk categories.
5. **Executive Command Hub** (\`/officer-dashboard\`): For Safety Officers to triage live early-warning alerts, simulate What-If interventions, and track corrective action registers.

Click any quick button below to jump directly to that feature!`,
    suggestions: ['How do I predict SIF risk?', 'How to upload CSV or Excel?', 'Where is the Audit Log?', 'How to run What-If Simulation?'],
    links: [
      { label: 'Go to Predict SIF', path: '/predict' },
      { label: 'Open Audit Log', path: '/history' },
      { label: 'View Command Hub', path: '/officer-dashboard' }
    ]
  },
  {
    triggers: ['predict', 'single observation', 'narrative', 'confidence', 'score', 'xai', 'why detected', 'root cause'],
    response: `### How to Predict SIF Precursor Risk 🔍
1. Navigate to **[Predict SIF Risk](/predict)**.
2. Enter an observation narrative describing the incident (e.g. *"Worker working on scaffold without harness near wellhead"*).
3. *(Optional)* Click **Upload Audio Recording** to transcribe a field voice memo via speech-to-text.
4. Click **Predict SIF Precursor Risk**.
5. The DistilBERT NLP engine will evaluate the narrative in under 150ms and provide:
   - **Risk Classification**: SIF (Precursor) or Non-SIF (Routine).
   - **Confidence Score**: Calibrated probability percentage.
   - **Why Detected (XAI)**: Plain-language factor breakdown and keyword contribution.
   - **Evidence-Based Root Causes**: Hypotheses based on Oil India HAZOP/maintenance patterns.
   - **7/14/30-Day Predictive Forecast**: Escalation probabilities and downtime risk.
6. **Automatic Sync**: The report is saved and instantly synced to the **Audit Log**, **Executive Dashboard**, and **Analytics**!`,
    suggestions: ['Where is the Audit Log?', 'How does XAI work?', 'What is a SIF precursor?'],
    links: [{ label: 'Try Predict Page', path: '/predict' }]
  },
  {
    triggers: ['audit', 'history', 'not updated', 'update', 'where saved', 'ledger', 'records', 'export pdf', 'export csv'],
    response: `### Audit Log & Observation Registry 📋
All observations analyzed in **Predict** or **Batch Analysis** are automatically synced to the **Audit Log**:
- **Location**: Click **[Audit Log](/history)** in the top navigation bar.
- **Search & Filter**: Search by keyword, asset, location, or filter by SIF / Non-SIF risk, department, or date range.
- **Exporting Ledgers**:
  - Click **Export CSV** to download a spreadsheet matching company reporting formats.
  - Click **Export PDF** to generate an official branded audit report.
- **Status Workflow**: Safety Officers can transition records from *Submitted* ➔ *Under Review* ➔ *Action In Progress* ➔ *Resolved*.
- **Executive Registry**: On the **[Command Hub](/officer-dashboard)**, check the *Master Observation Registry* tab at the bottom!`,
    suggestions: ['How to export Excel or PDF?', 'How do I log in as Safety Officer?', 'What is an early warning alert?'],
    links: [{ label: 'Open Audit Log Now', path: '/history' }]
  },
  {
    triggers: ['batch', 'csv', 'excel', 'bulk', 'multi-source', 'upload', 'xlsx', 'memo'],
    response: `### Bulk Batch Ingestion Engine 📊
To process multiple observation records at once:
1. Navigate to **[Batch Analysis](/batch)**.
2. Choose one of the instant multi-source presets:
   - **📄 Sample CSV**: 6 industrial incident narratives.
   - **📊 Excel Maintenance Log**: Pre-structured equipment observations.
   - **✉️ Incident Email Memo**: Formal incident narrative text.
   - **🎙️ Audio Memo**: Transcribe voice recordings.
3. Or drag-and-drop your own **.csv**, **.xlsx**, **.xls**, or **.txt** file directly into the dropzone.
4. Click **Process Batch Analysis**.
5. The high-throughput NLP engine tokenizes each row line-by-line.
6. Once complete, all rows are added to the table, and you can export the results as CSV or PDF!`,
    suggestions: ['How to export batch results?', 'How to predict a single report?', 'Where do batch items go?'],
    links: [{ label: 'Go to Batch Analysis', path: '/batch' }]
  },
  {
    triggers: ['what if', 'simulation', 'simulator', 'scenario', 'manpower', 'delay', 'decision'],
    response: `### Interactive What-If Decision Simulation Lab 🎛️
The What-If Simulator lets operations leaders model the impact of operational changes on risk before taking action:
- **Location**: Navigate to **[Command Hub](/officer-dashboard)** and select the **What-If Simulation** tab.
- **Interactive Controls**:
  - *Maintenance Personnel Slider*: Model adding +2 to +6 technicians.
  - *Maintenance Schedule Delays*: Simulate postponing interventions by 7 to 21 days.
  - *Incident Frequency Spikes*: Stress-test system against a 20% to 60% surge in precursor reports.
  - *Backlog Clearance*: Model clearing 40% to 80% of maintenance backlog.
  - *Emergency Temporary Shutdown*: Simulate total risk reduction from halting an asset.
- **Real-Time Projection**: Instantly outputs the new Composite Risk Score, avoided downtime hours, and estimated incident reductions.`,
    suggestions: ['How do I access Officer Dashboard?', 'What is the Risk Index?', 'What are early warning alerts?'],
    links: [{ label: 'Open What-If Simulator', path: '/officer-dashboard' }]
  },
  {
    triggers: ['alert', 'early warning', 'warning', 'clustering', 'loto', 'h2s', 'gas leak'],
    response: `### Early-Warning Alerts Engine ⚠️
The Early-Warning Engine scans incoming observations for dangerous trends:
- **Pattern Detection**: Identifies repeated asset failures (e.g. Pump P-102), hazardous energy/LOTO bypass clusters, and flammable gas leaks.
- **Workflow State**:
  - \`New\` ➔ \`Acknowledged\` ➔ \`Investigating\` ➔ \`Resolved\` ➔ \`Dismissed\`.
- **Location**: Head to **[Command Hub](/officer-dashboard)** and click the **Early-Warning Alerts** tab.
- Each alert displays detected severity, asset tag, and immediate tactical containment actions.`,
    suggestions: ['Where is Command Hub?', 'How does Action Tracking work?', 'How to log in as Officer?'],
    links: [{ label: 'View Early-Warning Alerts', path: '/officer-dashboard' }]
  },
  {
    triggers: ['login', 'sign in', 'account', 'password', 'credentials', 'demo', 'officer', 'worker'],
    response: `### Login & Demo Access 🔐
You can log in or explore the platform using 1-Click Demo accounts:
1. Go to the **[Sign In Page](/login)**.
2. Click either quick button under **⚡ Quick Demo Sign-In**:
   - **🛡️ Officer Demo**: Logs in as Safety Officer (*darshann@gmail.com* / *123456*) to unlock the Executive Command Hub, What-If Simulator, and Action Board.
   - **👷 Worker Demo**: Logs in as Field Observer (*kamalesh@gmail.com* / *123456*) for field observation submission.
3. You can also register a new account on the **[Register Page](/register)**.`,
    suggestions: ['Sign In Now', 'How to use Audit Log?', 'Predict an observation'],
    links: [{ label: 'Go to Sign In', path: '/login' }, { label: 'Register Account', path: '/register' }]
  },
  {
    triggers: ['sif', 'what is sif', 'precursor', 'non-sif', 'definition', 'meaning'],
    response: `### SIF (Serious Injury and Fatality) Concepts 💡
- **SIF Precursor**: A high-risk situation or near-miss where high energy was present and a life-saving barrier was missing or failed. Even if nobody got hurt, the potential for a fatality was real.
  - *Examples*: Working without fall protection, entering confined tank without SCBA, working on live 415V switchgear without LOTO, crane load swinging over workers.
- **Non-SIF (Routine)**: Low-energy or minor hazards without catastrophic escalation potential (e.g. minor housekeeping water spill, PPE replenishment).
- **SIF.AI's DistilBERT Model**: Trained specifically on energy-based hazard taxonomy (IOGP Life-Saving Rules) to differentiate true SIF precursors from routine safety records.`,
    suggestions: ['How to predict SIF risk?', 'What are the 9 IOGP rules?', 'Show 11 Risk Categories']
  },
  {
    triggers: ['iogp', 'life saving', 'rules', 'regulations', 'dgms', 'oisd', 'hazop', 'qra'],
    response: `### Oil & Gas Safety Standards (IOGP & Oil India) 🛡️
SIF.AI complies with international and statutory guidelines:
- **IOGP 9 Life-Saving Rules**:
  1. *Bypassing Safety Controls* (Interlocks / alarms)
  2. *Confined Space* (Gas testing & permits)
  3. *Driving Safety* (Speed & seatbelts)
  4. *Energy Isolation (LOTO)* (Zero-energy state)
  5. *Hot Work* (Fire watch & gas sniffing)
  6. *Line of Fire* (Dropped objects & high-pressure discharge)
  7. *Safe Mechanical Lifting* (Rigging & crane sweep area)
  8. *Work Authorization / PTW* (Permit-to-work issuance)
  9. *Working at Height* (100% tie-off harness & toe boards)
- **Statutory Frameworks**: Aligned with DGMS (Directorate General of Mines Safety), OISD (Oil Industry Safety Directorate), HAZOP, and QRA methodologies.`,
    suggestions: ['Predict an observation', 'View 11 Risk Categories', 'Open Audit Log']
  },
  {
    triggers: ['n8n', 'webhook', 'automation', 'workflow', 'api', 'admin'],
    response: `### n8n Automation & Webhook Integration ⚡
You can connect SIF.AI directly to your **n8n workflows** for automated incident notifications, Slack alerts, or database synchronization!
- Click the **⚙️ Settings** icon in this chat header to configure your custom **n8n Webhook URL**.
- When configured, queries and alert dispatches can automatically trigger your n8n workflow triggers.
- In n8n, you can accept the payload via a \`Webhook\` node, process it with an \`AI Agent\` or \`OpenAI / Ollama\` node, and return automated responses or dispatch Telegram/Slack/Email notifications!`,
    suggestions: ['Configure n8n Webhook', 'How to use SIF.AI?', 'Where is the Audit Log?']
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
      text: `Hello! I am **SIF AI Assistant** for Oil India Limited. 🛢️\n\nI can help you navigate the system, predict SIF risks, understand Explainable AI, upload batch records, check the Audit Log, and run What-If simulations.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How do I predict SIF risk?',
        'How to upload batch CSV/Excel?',
        'Where is the Audit Log?',
        'Quick Demo Sign-In'
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
        return '💡 Tip: Enter an observation narrative or upload a voice memo to evaluate SIF precursor risk.';
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

    // If n8n Webhook URL is configured, try sending to n8n first
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

    // Smart Local Knowledge Base Response Engine
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let bestMatch = null;
      let maxScore = 0;

      for (const item of KNOWLEDGE_BASE) {
        let score = 0;
        for (const trigger of item.triggers) {
          if (lower.includes(trigger)) {
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
        replyText = `I understand you are asking about **"${textToSend}"**.\n\nHere are some helpful starting points:\n- To test risk scoring on an observation, go to **[Predict SIF Risk](/predict)**.\n- To analyze spreadsheets or CSVs in bulk, visit **[Batch Analysis](/batch)**.\n- To review logged incident records, visit the **[Audit Log](/history)**.\n- To test decision simulation scenarios, visit the **[Command Hub](/officer-dashboard)**.\n\nYou can also click any of the suggested topics below:`;
        suggestions = [
          'How do I predict SIF risk?',
          'How to upload batch CSV/Excel?',
          'Where is the Audit Log?',
          'What is a SIF precursor?'
        ];
        links = [
          { label: 'Go to Predict', path: '/predict' },
          { label: 'Open Audit Log', path: '/history' }
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
    }, 450);
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    localStorage.setItem('sif_n8n_webhook_url', n8nWebhookUrl.trim());
    setWebhookSavedNotice(true);
    setTimeout(() => setWebhookSavedNotice(false), 2500);
    setShowSettings(false);
  };

  const renderFormattedText = (text) => {
    // Basic Markdown Parser for bold, links, bullet points, headers
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
                className="text-[#FF5E3A] font-bold underline hover:text-[#ff4820] inline-flex items-center gap-0.5"
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
            <span className="text-[10px] text-slate-400 font-medium">Ask anything & guide</span>
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
            className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden text-left"
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
                        suggestions: ['How to predict SIF risk?', 'Where is the Audit Log?', 'What is a SIF precursor?']
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
                    className={`p-3.5 rounded-2xl max-w-[88%] shadow-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-tr-xs'
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
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#FF5E3A] hover:text-white text-slate-800 font-bold text-[10px] transition-all flex items-center gap-1 shadow-xs"
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
                          className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 hover:text-[#FF5E3A] transition-all shadow-xs"
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
                onClick={() => handleSend('How do I predict SIF risk?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors"
              >
                Predict Guide
              </button>
              <button
                type="button"
                onClick={() => handleSend('How to upload batch CSV or Excel?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors"
              >
                Batch CSV/Excel
              </button>
              <button
                type="button"
                onClick={() => handleSend('Where is the Audit Log?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors"
              >
                Audit Log
              </button>
              <button
                type="button"
                onClick={() => handleSend('How to run What-If Simulation?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors"
              >
                What-If Lab
              </button>
              <button
                type="button"
                onClick={() => handleSend('How do I log in as Safety Officer?')}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-[#FF5E3A] hover:text-[#FF5E3A] shrink-0 transition-colors"
              >
                Officer Demo
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
