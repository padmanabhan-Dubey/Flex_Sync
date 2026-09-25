import React, { useState } from 'react';
import { BookOpen, X, Copy, Check, Terminal, Zap, Smartphone, CheckCircle2 } from 'lucide-react';

interface AndroidSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const AndroidSetupGuideModal: React.FC<AndroidSetupGuideModalProps> = ({
  isOpen,
  onClose,
  roomCode,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'webhook'>('pwa');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const webhookEndpoint = `${window.location.origin}/api/sync/webhook?token=${encodeURIComponent(roomCode)}`;

  const sampleCurl = `curl -X POST "${webhookEndpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "app": "WhatsApp",
    "title": "Alex Vance",
    "text": "Hey! Meeting at 3pm?",
    "priority": "high",
    "actions": ["Reply", "Mark as read"]
  }'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookEndpoint);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#181a24]/95 border border-white/[0.12] shadow-2xl p-6 text-white max-h-[90vh] flex flex-col">
        {/* Apple Sheet Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Notification Setup</h3>
              <p className="text-xs text-white/50">Pair Chrome OS Flex with Android in real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Picker (Apple Style) */}
        <div className="flex bg-white/[0.06] border border-white/[0.08] rounded-xl p-1 mt-4">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'pwa'
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Direct PWA Node</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'webhook'
                ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Full Android Webhook (MacroDroid / Tasker)</span>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-1 py-4 space-y-4 text-xs leading-relaxed text-white/75">
          {activeTab === 'pwa' ? (
            <div className="space-y-3.5">
              <div className="rounded-2xl bg-black/25 border border-white/[0.06] p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a84ff]/20 text-[#0a84ff] font-semibold text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-white/95">Open on Android & Chrome OS Flex</h4>
                    <p className="text-white/60 mt-0.5">
                      Open this URL on both devices with the same sync room code (<code className="text-[#0a84ff] font-mono font-medium">{roomCode}</code>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a84ff]/20 text-[#0a84ff] font-semibold text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-white/95">Install as App (PWA)</h4>
                    <p className="text-white/60 mt-0.5">
                      Tap <strong className="text-white">Install App</strong> in the top header or browser address bar to launch FlexSync in standalone desktop or mobile window mode.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a84ff]/20 text-[#0a84ff] font-semibold text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-white/95">Allow System Banners & Audio</h4>
                    <p className="text-white/60 mt-0.5">
                      Click <strong className="text-white">Allow Banners</strong> in the navigation bar to enable desktop notifications and marimba audio chimes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#30d158]/10 border border-[#30d158]/20 p-3.5 flex items-start gap-2.5 text-[#30d158]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-white/80">
                  <strong className="text-[#30d158]">Testing:</strong> Use the <strong>Broadcast Notification</strong> button to test instant bi-directional replies, snooze, and dismissals across both screens.
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white/80">
                To stream <strong>all native Android notifications</strong> (WhatsApp, SMS, Slack, banking, missed calls) to Chrome OS Flex automatically, use the free Android app <strong className="text-white">MacroDroid</strong> or <strong className="text-white">Tasker</strong>.
              </p>

              {/* Webhook endpoint */}
              <div>
                <label className="text-[11px] font-semibold text-white/40 block mb-1 uppercase tracking-wider">
                  Webhook Endpoint:
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-black/30 border border-white/[0.08] p-2.5">
                  <code className="text-[11px] text-[#30d158] font-mono flex-1 truncate">
                    {webhookEndpoint}
                  </code>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 bg-white/[0.08] hover:bg-white/[0.14] text-white px-2.5 py-1 rounded-lg text-[11px] transition"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-[#30d158]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* MacroDroid steps */}
              <div className="rounded-2xl bg-black/25 border border-white/[0.06] p-4 space-y-2">
                <h4 className="font-semibold text-white/95 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#30d158]" />
                  MacroDroid Setup (2 mins):
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-white/70 text-[11.5px]">
                  <li>Install <strong>MacroDroid</strong> from Google Play Store.</li>
                  <li>Add Macro:
                    <ul className="list-disc list-inside ml-4 mt-1 text-white/80 space-y-1">
                      <li><strong>Trigger</strong>: Notification &gt; Notification Received.</li>
                      <li><strong>Action</strong>: Web Interactions &gt; HTTP Request (Method: POST).</li>
                      <li><strong>URL</strong>: Paste the Webhook URL above.</li>
                      <li><strong>Body Content (JSON)</strong>:
                        <code className="block bg-black/40 border border-white/[0.08] p-2 rounded-xl mt-1 text-[#30d158] font-mono text-[10px]">
                          {`{"app": "[notification_app_name]", "title": "[notification_title]", "text": "[notification_text]", "priority": "high"}`}
                        </code>
                      </li>
                    </ul>
                  </li>
                  <li>Enable the macro. All Android notifications will immediately appear on your Chrome OS Flex screen.</li>
                </ol>
              </div>

              {/* cURL test */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white/40 flex items-center gap-1.5 uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5" />
                    Test via cURL:
                  </span>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 text-[11px] text-[#0a84ff] hover:text-[#0071e3]"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-[#30d158]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="rounded-xl bg-black/40 border border-white/[0.08] p-3 text-[10.5px] font-mono text-white/80 overflow-x-auto leading-relaxed">
                  {sampleCurl}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-white/[0.08] hover:bg-white/[0.14] px-5 py-2 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
