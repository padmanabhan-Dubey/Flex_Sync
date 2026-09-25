import React, { useState } from 'react';
import { SyncNotification } from '../types';
import { Send, Smartphone, Sparkles, MessageCircle, AlertCircle, PhoneCall, Calendar, Mail, ShieldAlert, X } from 'lucide-react';

interface AndroidSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendNotification: (notif: Omit<SyncNotification, 'id' | 'roomCode' | 'timestamp' | 'isRead' | 'isDismissed' | 'isStarred' | 'isSnoozed'>) => void;
}

const PRESETS = [
  {
    name: 'WhatsApp Message',
    icon: <MessageCircle className="w-4 h-4 text-emerald-400" />,
    appName: 'WhatsApp',
    packageName: 'com.whatsapp',
    title: 'Sarah Jenkins',
    body: 'Can you send the project presentation deck? Meeting with client in 10 mins!',
    priority: 'high' as const,
    category: 'message' as const,
    quickReplies: ['Sending right now!', 'Give me 2 minutes', 'Uploaded to Drive'],
  },
  {
    name: 'Bank Security Alert',
    icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
    appName: 'Chase Mobile',
    packageName: 'com.chase.sig.android',
    title: 'Security Alert: Debit Card Transaction',
    body: 'A charge of $84.20 was authorized at COFFEE_ROASTER_SF. Reply YES if recognized.',
    priority: 'high' as const,
    category: 'alert' as const,
    quickReplies: ['YES', 'NO - Lock Card'],
  },
  {
    name: 'Slack Mention',
    icon: <MessageCircle className="w-4 h-4 text-fuchsia-400" />,
    appName: 'Slack',
    packageName: 'com.slack',
    title: '#engineering-general',
    body: 'Alex Chen: @you Can you review PR #412 for the Chrome OS Flex sync bridge?',
    priority: 'normal' as const,
    category: 'message' as const,
    quickReplies: ['Reviewing now', 'Will look after lunch', 'Approved!'],
  },
  {
    name: 'Missed Call',
    icon: <PhoneCall className="w-4 h-4 text-rose-400" />,
    appName: 'Phone',
    packageName: 'com.google.android.dialer',
    title: 'Missed Call: David Ross',
    body: 'Mobile (2 attempts) • No voicemail left',
    priority: 'high' as const,
    category: 'call' as const,
    quickReplies: ['Call Back', 'Send Message: In a meeting'],
  },
  {
    name: 'Google Calendar',
    icon: <Calendar className="w-4 h-4 text-amber-400" />,
    appName: 'Google Calendar',
    packageName: 'com.google.android.calendar',
    title: 'Sprint Planning & Backlog Grooming',
    body: '10:00 AM – 11:00 AM • Meet link: https://meet.google.com/xyz-abc',
    priority: 'normal' as const,
    category: 'calendar' as const,
    quickReplies: ['Join Video Call', 'Running 5m late'],
  },
  {
    name: 'Gmail Notification',
    icon: <Mail className="w-4 h-4 text-rose-400" />,
    appName: 'Gmail',
    packageName: 'com.google.android.gm',
    title: 'GitHub: New issue assigned',
    body: '[repo/flexsync] Issue #42: Add support for Android 15 notification channel filtering',
    priority: 'low' as const,
    category: 'email' as const,
    quickReplies: ['Open in Chrome', 'Mark as Read'],
  },
];

export const AndroidSimulatorDrawer: React.FC<AndroidSimulatorDrawerProps> = ({
  isOpen,
  onClose,
  onSendNotification,
}) => {
  const [appName, setAppName] = useState('WhatsApp');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<SyncNotification['priority']>('normal');
  const [category, setCategory] = useState<SyncNotification['category']>('message');
  const [quickChips, setQuickChips] = useState('Yes, on it!, Sounds good, Will call later');

  if (!isOpen) return null;

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setAppName(preset.appName);
    setTitle(preset.title);
    setBody(preset.body);
    setPriority(preset.priority);
    setCategory(preset.category);
    setQuickChips(preset.quickReplies.join(', '));
  };

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim()) return;

    onSendNotification({
      appName: appName.trim() || 'Android App',
      title: title.trim() || 'Notification',
      body: body.trim(),
      priority,
      category,
      sourceDeviceId: 'android-node',
      quickReplies: quickChips
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });

    setTitle('');
    setBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Android Notification Broadcaster
              </h3>
              <p className="text-[11px] text-slate-400">
                Simulate or test incoming Android notifications in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick 1-Click Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              1-Click Realistic Android Presets:
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleApplyPreset(preset);
                    onSendNotification({
                      appName: preset.appName,
                      packageName: preset.packageName,
                      title: preset.title,
                      body: preset.body,
                      priority: preset.priority,
                      category: preset.category,
                      sourceDeviceId: 'android-node',
                      quickReplies: preset.quickReplies,
                    });
                    onClose();
                  }}
                  className="flex flex-col items-start gap-1 p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/80 hover:border-slate-700 transition text-left group"
                >
                  <div className="flex items-center gap-1.5">
                    {preset.icon}
                    <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                      {preset.appName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h4 className="text-xs font-semibold text-slate-300 mb-3">
              Or Broadcast Custom Android Notification:
            </h4>

            <form onSubmit={handleCustomSend} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. WhatsApp, Slack, Gmail"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Sender / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elena Vance, #general, Bank Alert"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Message / Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="The content of the notification..."
                  rows={3}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Quick Reply Chips (comma separated)
                </label>
                <input
                  type="text"
                  value={quickChips}
                  onChange={(e) => setQuickChips(e.target.value)}
                  placeholder="Reply 1, Reply 2, Reply 3"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-medium text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Hub</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
