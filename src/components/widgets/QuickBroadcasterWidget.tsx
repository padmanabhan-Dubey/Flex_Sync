import React from 'react';
import { SyncNotification } from '../../types';
import { Sparkles, MessageCircle, AlertTriangle, PhoneCall, Calendar, Mail, Plus } from 'lucide-react';

interface QuickBroadcasterWidgetProps {
  onSendNotification: (notif: Omit<SyncNotification, 'id' | 'roomCode' | 'timestamp' | 'isRead' | 'isDismissed' | 'isStarred' | 'isSnoozed'>) => void;
  onOpenCustomDrawer: () => void;
}

const PRESET_TILES = [
  {
    name: 'WhatsApp',
    desc: 'Elena: Are you free for dinner?',
    iconBg: 'bg-[#25D366]',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
    appName: 'WhatsApp',
    packageName: 'com.whatsapp',
    title: 'Elena Vance',
    body: 'Shared 3 photos from the weekend trip! Are you free for dinner tonight?',
    priority: 'high' as const,
    category: 'message' as const,
    quickReplies: ['Yes, let’s do it!', 'Call you in 5 mins', 'Can’t tonight'],
  },
  {
    name: 'Slack',
    desc: '#eng: Pipeline passed on Chrome OS',
    iconBg: 'bg-[#4A154B]',
    icon: <MessageCircle className="w-3.5 h-3.5 text-white" />,
    appName: 'Slack',
    packageName: 'com.slack',
    title: '#product-engineering',
    body: 'Marcus: Release v2.4 build pipeline passed on ChromeOS Flex! Ready for QA.',
    priority: 'normal' as const,
    category: 'message' as const,
    quickReplies: ['Reviewing now', 'Great job team 🎉'],
  },
  {
    name: 'Bank Alert',
    desc: 'Debit card authorization: $84.20',
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
    name: 'Missed Call',
    desc: 'David Ross (2 attempts)',
    iconBg: 'bg-[#30d158]',
    icon: <PhoneCall className="w-3.5 h-3.5 text-white" />,
    appName: 'Phone',
    packageName: 'com.google.android.dialer',
    title: 'Missed Call: David Ross',
    body: 'Mobile (2 attempts) • No voicemail left',
    priority: 'high' as const,
    category: 'call' as const,
    quickReplies: ['Call Back', 'In a meeting'],
  },
  {
    name: 'Calendar',
    desc: 'Demo & Team Sync in 15m',
    iconBg: 'bg-[#ff3b30]',
    icon: <Calendar className="w-3.5 h-3.5 text-white" />,
    appName: 'Google Calendar',
    packageName: 'com.google.android.calendar',
    title: 'Team Sync & Demo',
    body: 'Starting in 15 minutes • Room A / Google Meet',
    priority: 'normal' as const,
    category: 'calendar' as const,
    quickReplies: ['Join Video Call', 'Running 5m late'],
  },
  {
    name: 'Gmail',
    desc: 'GitHub: Issue #42 assigned',
    iconBg: 'bg-[#EA4335]',
    icon: <Mail className="w-3.5 h-3.5 text-white" />,
    appName: 'Gmail',
    packageName: 'com.google.android.gm',
    title: 'GitHub: New issue assigned',
    body: '[repo/flexsync] Issue #42: Add support for notification channel filtering',
    priority: 'low' as const,
    category: 'email' as const,
    quickReplies: ['Open in Chrome', 'Mark as Read'],
  },
];

export const QuickBroadcasterWidget: React.FC<QuickBroadcasterWidgetProps> = ({
  onSendNotification,
  onOpenCustomDrawer,
}) => {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4.5 shadow-lg flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#30d158]/15 border border-[#30d158]/25 text-[#30d158]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/95 tracking-tight">Notification Simulator</h3>
            <p className="text-[10px] text-white/40">1-tap realistic test triggers</p>
          </div>
        </div>

        <button
          onClick={onOpenCustomDrawer}
          className="flex items-center gap-1 bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border border-white/[0.08] px-2.5 py-1 rounded-full text-[11px] transition active:scale-95"
          title="Compose custom notification"
        >
          <Plus className="w-3 h-3 text-[#0a84ff]" />
          <span>Custom</span>
        </button>
      </div>

      {/* Grid of 1-Tap App Triggers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-3">
        {PRESET_TILES.map((tile, idx) => (
          <button
            key={idx}
            onClick={() =>
              onSendNotification({
                appName: tile.appName,
                packageName: tile.packageName,
                title: tile.title,
                body: tile.body,
                priority: tile.priority,
                category: tile.category,
                sourceDeviceId: 'android-node',
                quickReplies: tile.quickReplies,
              })
            }
            className="flex items-center gap-2 p-2 rounded-xl bg-black/20 hover:bg-white/[0.07] border border-white/[0.05] hover:border-white/[0.1] text-left transition group active:scale-[0.96]"
            title={`Broadcast ${tile.name} alert`}
          >
            <div className={`h-6 w-6 rounded-[6px] flex items-center justify-center shrink-0 shadow-xs ${tile.iconBg}`}>
              {tile.icon}
            </div>
            <div className="min-w-0">
              <span className="text-[11.5px] font-semibold text-white/90 block leading-tight truncate">
                {tile.name}
              </span>
              <span className="text-[9.5px] text-white/40 block truncate">
                Tap to send
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="text-[10px] text-white/35 text-center">
        Sends instant simulated event through the real-time sync engine
      </div>
    </div>
  );
};
