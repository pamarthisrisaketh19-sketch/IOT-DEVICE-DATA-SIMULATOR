
import React, { useState } from 'react';
import { API_BASE } from "./api";
import Sidebar from "./components/Sidebar";
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import SensorSimulatorView from './components/SensorSimulatorView';
import TrainerPanel from './components/TrainerPanel';
import { AlertConfig, GeofenceConfig, DeviceOnboarding } from './components/ConfigForms';
import { SimulatorProvider, useSimulator } from './context/SimulatorContext';
import { Plus, X, Mail, Send, Database, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   DB Status Toast — shows a slide-in notification for MySQL operations
   Reads `dbToast` from SimulatorContext (set by onboardDevice / deleteDevice)
───────────────────────────────────────────────────────────────────────────── */
function DbStatusToast() {
  const { dbToast, dismissDbToast } = useSimulator();

  if (!dbToast?.show) return null;

  const isSuccess = dbToast.type === 'success';
  const isError = dbToast.type === 'error';
  const isInfo = dbToast.type === 'info';

  const bgClass = isError ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50'
    : isSuccess ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50'
      : 'bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800/50';

  const textClass = isError ? 'text-red-800 dark:text-red-300'
    : isSuccess ? 'text-emerald-800 dark:text-emerald-300'
      : 'text-sky-800 dark:text-sky-300';

  const IconCmp = isError ? AlertTriangle : isSuccess ? CheckCircle2 : Info;
  const iconClass = isError ? 'text-red-500' : isSuccess ? 'text-emerald-500' : 'text-sky-500';

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-start gap-3 min-w-[320px] max-w-sm rounded-xl border shadow-xl p-4
                  animate-[slideInRight_0.35s_ease-out] ${bgClass}`}
      style={{ animation: 'slideInRight 0.35s ease-out' }}
    >
      {/* DB icon badge */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <Database className={`h-4 w-4 ${iconClass}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`flex items-center gap-1.5 ${textClass}`}>
          <IconCmp className={`h-3.5 w-3.5 ${iconClass} flex-shrink-0`} />
          <span className="text-xs font-bold">{dbToast.title}</span>
        </div>
        <p className={`mt-0.5 text-[11px] leading-relaxed font-mono break-words ${textClass} opacity-90`}>
          {dbToast.message}
        </p>
        <p className="mt-1.5 text-[10px] font-semibold opacity-50 uppercase tracking-wider">
          MySQL · iot_simulator
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={dismissDbToast}
        className={`flex-shrink-0 rounded p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${textClass}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}


function AppContent() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const { addFeedEvent } = useSimulator();
  const [showContactModal, setShowContactModal] = useState(false);
  const [senderEmail, setSenderEmail] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('Telemetry Anomaly');
  const [messageBody, setMessageBody] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingStep, setSendingStep] = useState(0);

  const handleSendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendingStep(0);

    // Step 0: Connect
    setTimeout(() => {
      setSendingStep(1);
    }, 400);

    // Step 1: Handshake and Send
    setTimeout(() => {
      setSendingStep(2);
      const base =
        window.location.hostname === "localhost"
          ? "http://localhost:5000"
          : "https://iot-device-data-simulator.onrender.com";
      fetch(`${base}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          senderEmail,
          subjectCategory,
          messageBody
        })
      })
        .then(res => {
          if (!res.ok) throw new Error("Server error");
          return res.json();
        })
        .then(() => {
          setIsSending(false);
          setContactSuccess(true);

          addFeedEvent(
            'success',
            `✉️ Email sent successfully to pamarthisrisaketh19@gmail.com`
          );

          setMessageBody('');
        })
        .catch((err) => {
          console.error(err);
          setIsSending(false);
          alert("Email sending failed");
        });
    }, 900);
  };

  // Render the current view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard isDark={isDark} />;
      case 'trainer':
        return <TrainerPanel />;
      case 'simulator':
        return <SensorSimulatorView />;
      case 'alerts':
        return <AlertConfig />;
      case 'geofences':
        return <GeofenceConfig />;
      default:
        return <AdminDashboard isDark={isDark} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 transition-colors duration-200 dark:bg-[#09090b] dark:text-zinc-50 font-sans theme-transition">
      {/* Global DB Status Toast — slides in top-right on any MySQL operation */}
      <DbStatusToast />

      {/* Sidebar Navigation */}
      <Sidebar activeView={activeView} onViewChange={setActiveView} />


      {/* Main Content Area */}
      <div className="pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <Header isDark={isDark} setIsDark={setIsDark} activeView={activeView} />

        {/* View container */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">

          {/* Quick Info bar / Onboarding trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Operations Node Control
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                IoT Device Telemetry
              </h1>
            </div>

            <button
              onClick={() => setShowOnboardModal(true)}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Onboard New Device</span>
            </button>
          </div>

          {/* Active Panel */}
          {renderView()}
        </main>
      </div>

      {/* Onboarding Dialog Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#0c0c0f] max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setShowOnboardModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-250 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <DeviceOnboarding onComplete={() => setShowOnboardModal(false)} />
          </div>
        </div>
      )}
      {/* Floating Action Button for contacting admin */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowContactModal(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-110 active:scale-95 focus:outline-none relative group"
          title="Contact System Administrator"
        >
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20 animate-ping group-hover:hidden"></span>
          <Mail className="h-5.5 w-5.5" />

          {/* Tooltip */}
          <span className="absolute right-14 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-all duration-150 origin-right bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-950 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap shadow-md border border-zinc-800 dark:border-zinc-200">
            Contact Administrator
          </span>
        </button>
      </div>

      {/* Contact Admin Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#0c0c0f] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-950/20 dark:text-blue-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-sans">Contact Administrator</h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Send an operational message to the admin console</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setContactSuccess(false);
                }}
                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-250 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {isSending ? (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center items-center gap-1.5 h-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-bounce"></span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-zinc-855 dark:text-zinc-200">Sending Email</h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono transition-all">
                    {sendingStep === 0 && "Connecting to SMTP mail server..."}
                    {sendingStep === 1 && "Verifying security handshake..."}
                    {sendingStep === 2 && "Transmitting message body..."}
                  </p>
                </div>
              </div>
            ) : contactSuccess ? (
              <div className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-450">
                  <Send className="h-5 w-5 text-emerald-500" />
                </div>
                <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200">Email Dispatched Successfully!</h4>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 max-w-xs mx-auto">
                  Message delivered successfully to your mail.
                </p>
                <button
                  onClick={() => {
                    setShowContactModal(false);
                    setContactSuccess(false);
                  }}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200 px-4 py-2 text-xs font-semibold shadow-sm transition-all"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-550 dark:text-zinc-455">Your Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="operator@telemetryhub.ops"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-550 dark:text-zinc-455">Subject Category</label>
                  <select
                    value={subjectCategory}
                    onChange={(e) => setSubjectCategory(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    <option value="Telemetry Anomaly">⚠️ Telemetry Anomaly Report</option>
                    <option value="Hardware Registry Error">🔌 Hardware Registry Error</option>
                    <option value="Geofence Exclusion Request">🌐 Geofence Exclusion Request</option>
                    <option value="System Troubleshooting">🛠️ System Troubleshooting</option>
                    <option value="Other Operations Inquiry">💬 Other Operations Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-zinc-550 dark:text-zinc-455">Message Body</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Detail the issue, anomalous coordinates, or system inquiry..."
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 resize-none"
                  />
                </div>

                <div className="border-t border-zinc-150 pt-4 mt-2 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs ..."
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SimulatorProvider>
      <AppContent />
    </SimulatorProvider>
  );
}
