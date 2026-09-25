import React, { useState } from 'react';
import { SyncNotification } from '../types';
import { Smartphone, Sparkles, MessageCircle, PhoneCall, Calendar, Mail, AlertTriangle, X, ArrowUp } from 'lucide-react';

interface AndroidSimulatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSendNotification: (notif: Omit<SyncNotification, 'id' | 'roomCode' | 'timestamp' | 'isRead' | 'isDismissed' | 'isStarred' | 'isSnoozed'>) => void;
}

const PRESETS = [
  {
    name: 'WhatsApp Message',
    iconBg: 'bg-[#25D366]',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
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
    iconBg: 'bg-[#ff9f0a]',
    icon: <AlertTriangle className="w-3.5 h-3.5 text-white" />,
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
    iconBg: 'bg-[#4A154B]',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
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
    iconBg: 'bg-[#30d158]',
    icon: <PhoneCall className="w-3.5 h-3.5 text-white" />,
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
    iconBg: 'bg-[#ff3b30]',
    icon: <Calendar className="w-3.5 h-3.5 text-white" />,
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
    iconBg: 'bg-[#EA4335]',
    icon: <Mail className="w-3.5 h-3.5 text-white" />,
    appName: 'Gmail',
    packageName: 'com.google.android.gm',
    title: 'GitHub: New issue assigned',
    body: '[repo/flexsync] Issue #42: Add support for Android notification channel filtering',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#181a24]/95 border border-white/[0.12] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-white">
        {/* Apple Sheet Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#30d158]/15 border border-[#30d158]/25 text-[#30d158]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">
                Broadcast Notification
              </h3>
              <p className="text-xs text-white/50">
                Trigger or simulate Android notifications across paired devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Quick Action Presets (Apple Action Menu Style) */}
          <div>
            <label className="text-[11px] font-medium text-white/50 block mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0a84ff]" />
              Tap to broadcast sample notification:
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
                  className="flex flex-col items-start gap-1 p-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.12] transition text-left group active:scale-95"
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`h-5 w-5 rounded-[5px] flex items-center justify-center shadow-xs ${preset.iconBg}`}>
                      {preset.icon}
                    </div>
                    <span className="text-xs font-semibold text-white/90 group-hover:text-white">
                      {preset.appName}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                    {preset.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-4">
            <h4 className="text-xs font-semibold text-white/80 mb-3 tracking-tight">
              Or Compose Custom Notification:
            </h4>

            <form onSubmit={handleCustomSend} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">
                    App Name
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. WhatsApp, Slack, Gmail"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/50 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0071e3]"
                  >
                    <option value="high" className="bg-[#181a24]">Urgent / High</option>
                    <option value="normal" className="bg-[#181a24]">Normal</option>
                    <option value="low" className="bg-[#181a24]">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1">
                  Sender or Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elena Vance, Team Sync"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1">
                  Message Content
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Notification body text..."
                  rows={2}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/50 mb-1">
                  Quick Reply Suggestions (comma separated)
                </label>
                <input
                  type="text"
                  value={quickChips}
                  onChange={(e) => setQuickChips(e.target.value)}
                  placeholder="Reply 1, Reply 2, Reply 3"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-xs font-medium text-white/80 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-xs font-semibold text-white shadow-sm transition active:scale-95"
                >
                  <span>Broadcast</span>
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
