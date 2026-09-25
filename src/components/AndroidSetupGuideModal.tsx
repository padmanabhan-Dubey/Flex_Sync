import React, { useState } from 'react';
import { BookOpen, X, Copy, Check, Terminal, Zap, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cross-OS Notification Setup Guide</h3>
              <p className="text-xs text-slate-400">Pairing Chrome OS Flex with your Android phone</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 mt-4">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'pwa'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Method 1: Direct PWA Web Node (Quickest)</span>
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
              activeTab === 'webhook'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Method 2: MacroDroid / Tasker Webhook (Full OS Sync)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto p-2 py-4 space-y-4 text-xs leading-relaxed text-slate-300">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Open on Android Phone & Chrome OS Flex</h4>
                    <p className="text-slate-400 mt-0.5">
                      Open this URL in Google Chrome on both your Android phone and your Chrome OS Flex device. Both devices join the same sync code (<code className="text-indigo-300 font-mono">{roomCode}</code>).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Install as Progressive Web App (PWA)</h4>
                    <p className="text-slate-400 mt-0.5">
                      On Chrome OS Flex, click the <strong className="text-slate-200">Install App</strong> icon in the address bar or header to run FlexSync in its own dedicated desktop window with standalone notifications!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Grant Web Notification & Audio Permissions</h4>
                    <p className="text-slate-400 mt-0.5">
                      Click <strong className="text-slate-200">Allow OS Popups</strong> in the top header. When Chrome OS Flex receives any notification from your Android phone, it pops up a system toast banner even if you are in another app!
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-start gap-2.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Try testing with the built-in <strong>Android Broadcaster</strong> button to simulate incoming WhatsApp, Slack, Missed Calls, and bank alerts with full bi-directional replies!
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-300">
                To automatically forward <strong>ALL real native Android system notifications</strong> (WhatsApp, SMS, Telegram, Phone calls, Gmail) to Chrome OS Flex in real-time, you can use the free Android app <strong className="text-white">MacroDroid</strong> or <strong className="text-white">Tasker</strong>.
              </p>

              {/* Webhook URL copy */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                  Your Webhook Endpoint:
                </label>
                <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-2.5">
                  <code className="text-[11px] text-emerald-400 font-mono flex-1 truncate">
                    {webhookEndpoint}
                  </code>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] transition"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* MacroDroid steps */}
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 space-y-2.5">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Quick MacroDroid 2-Minute Setup:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px]">
                  <li>Install <strong>MacroDroid</strong> from Google Play Store (free).</li>
                  <li>Create a new Macro:
                    <ul className="list-disc list-inside ml-4 mt-1 text-slate-300 space-y-1">
                      <li><strong>Trigger</strong>: Notification &gt; Notification Received (select all apps or WhatsApp/Slack/Messages).</li>
                      <li><strong>Action</strong>: Web Interactions &gt; HTTP Request.</li>
                      <li><strong>Method</strong>: POST to the URL above.</li>
                      <li><strong>Body Content (JSON)</strong>:
                        <code className="block bg-slate-900 border border-slate-800 p-2 rounded mt-1 text-emerald-300 font-mono text-[10px]">
                          {`{"app": "[notification_app_name]", "title": "[notification_title]", "text": "[notification_text]", "priority": "high"}`}
                        </code>
                      </li>
                    </ul>
                  </li>
                  <li>Save and turn on Macro! Every Android notification will now stream straight to your Chrome OS Flex screen in real-time.</li>
                </ol>
              </div>

              {/* cURL Test */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    Test via Terminal / cURL:
                  </span>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {sampleCurl}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
