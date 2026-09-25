import React, { useState } from 'react';
import { SyncNotification } from '../types';
import {
  MessageSquare,
  Mail,
  Phone,
  AlertTriangle,
  Calendar,
  Share2,
  Trash2,
  CornerDownLeft,
  Star,
  Clock,
  CheckCheck,
  RotateCcw,
  Copy,
  Check,
  Send,
  ArrowUp,
  X,
} from 'lucide-react';

interface NotificationCardProps {
  notification: SyncNotification;
  onDismiss: (id: string) => void;
  onRestore?: (id: string) => void;
  onAction: (id: string, action: 'reply' | 'star' | 'snooze' | 'unsnooze' | 'read', payload?: any) => void;
  deviceLabel?: string;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onDismiss,
  onRestore,
  onAction,
  deviceLabel,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // App squircle colors inspired by iOS icons
  const getAppStyle = (app: string) => {
    const lower = app.toLowerCase();
    if (lower.includes('whatsapp')) {
      return {
        bg: 'bg-[#25D366]',
        icon: <MessageSquare className="w-4 h-4 text-white" />,
      };
    }
    if (lower.includes('slack')) {
      return {
        bg: 'bg-[#4A154B]',
        icon: <MessageSquare className="w-4 h-4 text-white" />,
      };
    }
    if (lower.includes('gmail') || lower.includes('mail') || lower.includes('email')) {
      return {
        bg: 'bg-[#EA4335]',
        icon: <Mail className="w-4 h-4 text-white" />,
      };
    }
    if (lower.includes('telegram')) {
      return {
        bg: 'bg-[#229ED9]',
        icon: <Send className="w-4 h-4 text-white" />,
      };
    }
    if (lower.includes('calendar')) {
      return {
        bg: 'bg-[#ff3b30]',
        icon: <Calendar className="w-4 h-4 text-white" />,
      };
    }
    if (lower.includes('call') || lower.includes('phone')) {
      return {
        bg: 'bg-[#30d158]',
        icon: <Phone className="w-4 h-4 text-white" />,
      };
    }
    if (lower.includes('bank') || lower.includes('chase') || lower.includes('alert')) {
      return {
        bg: 'bg-[#ff9f0a]',
        icon: <AlertTriangle className="w-4 h-4 text-white" />,
      };
    }
    return {
      bg: 'bg-[#0071e3]',
      icon: <Share2 className="w-4 h-4 text-white" />,
    };
  };

  const appStyle = getAppStyle(notification.appName);

  const formatTime = (ts: number) => {
    const diff = Math.max(0, Date.now() - ts);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleSendReply = (textToSend?: string) => {
    const text = (textToSend || replyText).trim();
    if (!text) return;
    onAction(notification.id, 'reply', { replyText: text });
    setReplyText('');
    setIsReplying(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${notification.title}\n${notification.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDismissed = notification.isDismissed;
  const isSnoozed = notification.isSnoozed && (!notification.snoozeUntil || notification.snoozeUntil > Date.now());

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        isDismissed
          ? 'border-white/[0.04] bg-[#14161f]/40 opacity-60 hover:opacity-100'
          : !notification.isRead
          ? 'border-white/[0.12] bg-[#1a1c27]/90 shadow-[0_8px_30px_rgb(0,0,0,0.3)] ring-1 ring-[#0a84ff]/25'
          : 'border-white/[0.07] bg-[#161822]/75 hover:bg-[#191b26]/90 hover:border-white/[0.12] shadow-md'
      }`}
    >
      {/* Unread indicator dot (Apple Mail / Notification style) */}
      {!notification.isRead && !isDismissed && (
        <span className="absolute left-2.5 top-5 h-2 w-2 rounded-full bg-[#0a84ff] shadow-[0_0_8px_#0a84ff]" />
      )}

      <div className="p-4 sm:p-4.5 pl-6 sm:pl-7">
        {/* Apple Notification Banner Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* App Icon (Apple Squircle) */}
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] shadow-sm ${appStyle.bg}`}
            >
              {appStyle.icon}
            </div>

            {/* App title + clean unboxed metadata (zero-pill standard) */}
            <div className="flex items-center gap-1.5 text-xs text-white/50 truncate">
              <span className="font-semibold text-white/95 text-[13px] tracking-tight">
                {notification.appName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-normal text-[11px] text-white/45">
                {formatTime(notification.timestamp)}
              </span>
              {deviceLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[11px] text-white/40 truncate">
                    {deviceLabel}
                  </span>
                </>
              )}
              {notification.priority === 'high' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#ff453a] font-medium text-[11px]">
                    Urgent
                  </span>
                </>
              )}
              {isSnoozed && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#ff9f0a] font-medium text-[11px] flex items-center gap-0.5">
                    <Clock className="w-3 h-3 inline" /> Snoozed
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Icon Group (Apple Circle Hover Buttons) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={handleCopy}
              className="h-7 w-7 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onAction(notification.id, 'star')}
              className={`h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors ${
                notification.isStarred ? 'text-[#ff9f0a]' : 'text-white/50 hover:text-white'
              }`}
              title={notification.isStarred ? 'Unstar' : 'Star notification'}
            >
              <Star className={`w-3.5 h-3.5 ${notification.isStarred ? 'fill-[#ff9f0a]' : ''}`} />
            </button>

            {!isDismissed ? (
              <button
                onClick={() => onDismiss(notification.id)}
                className="h-7 w-7 flex items-center justify-center text-white/50 hover:text-[#ff453a] rounded-full hover:bg-[#ff453a]/15 transition-colors"
                title="Dismiss (Syncs to Android)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              onRestore && (
                <button
                  onClick={() => onRestore(notification.id)}
                  className="h-7 w-7 flex items-center justify-center text-white/50 hover:text-[#0a84ff] rounded-full hover:bg-[#0a84ff]/15 transition-colors"
                  title="Restore notification"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-2.5">
          <h4 className="text-[13.5px] font-semibold text-white/95 tracking-tight leading-snug">
            {notification.title}
          </h4>
          <p className="mt-1 text-[13px] text-white/70 leading-relaxed font-normal whitespace-pre-wrap">
            {notification.body}
          </p>
        </div>

        {/* Synced Reply Thread (Apple iMessage style bubbles) */}
        {notification.replyHistory && notification.replyHistory.length > 0 && (
          <div className="mt-3.5 rounded-2xl bg-black/30 border border-white/[0.06] p-3 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
              Reply Thread (Synced)
            </span>
            {notification.replyHistory.map((rep, idx) => (
              <div key={idx} className="flex flex-col items-end">
                <div className="rounded-2xl rounded-br-sm bg-[#0071e3] text-white px-3.5 py-1.5 text-xs shadow-sm max-w-sm">
                  {rep.text}
                </div>
                <span className="text-[10px] text-white/40 mt-0.5 tabular-nums">
                  {rep.sender} · {formatTime(rep.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls & Quick Replies */}
        {!isDismissed && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
            {/* Left: Reply triggers / suggestion pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {!isReplying && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex items-center gap-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border border-white/[0.08] px-3 py-1 text-xs font-medium transition active:scale-95"
                >
                  <CornerDownLeft className="w-3 h-3 text-[#0a84ff]" />
                  <span>Reply</span>
                </button>
              )}

              {/* Quick suggestion pills */}
              {!isReplying &&
                notification.quickReplies?.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReply(chip)}
                    className="rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/75 hover:text-white border border-white/[0.06] px-3 py-1 text-xs transition active:scale-95"
                  >
                    {chip}
                  </button>
                ))}
            </div>

            {/* Right: Mark Read & Snooze Options */}
            <div className="flex items-center gap-1 relative">
              {!notification.isRead && (
                <button
                  onClick={() => onAction(notification.id, 'read')}
                  className="flex items-center gap-1 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] px-2.5 py-1 text-xs transition"
                  title="Mark as Read"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-[#30d158]" />
                  <span>Mark Read</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                  className="flex items-center gap-1 rounded-full text-white/60 hover:text-white hover:bg-white/[0.08] px-2.5 py-1 text-xs transition"
                  title="Snooze"
                >
                  <Clock className="w-3.5 h-3.5 text-white/50" />
                  <span>Snooze</span>
                </button>

                {showSnoozeMenu && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-40 rounded-2xl bg-[#1c1e29]/95 backdrop-blur-2xl border border-white/[0.12] p-1 shadow-2xl z-20 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        onAction(notification.id, 'snooze', { durationMinutes: 15 });
                        setShowSnoozeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 rounded-xl transition"
                    >
                      15 minutes
                    </button>
                    <button
                      onClick={() => {
                        onAction(notification.id, 'snooze', { durationMinutes: 60 });
                        setShowSnoozeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 rounded-xl transition"
                    >
                      1 hour
                    </button>
                    <button
                      onClick={() => {
                        onAction(notification.id, 'snooze', { durationMinutes: 240 });
                        setShowSnoozeMenu(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-white/90 hover:bg-white/10 rounded-xl transition"
                    >
                      4 hours
                    </button>
                    {isSnoozed && (
                      <button
                        onClick={() => {
                          onAction(notification.id, 'unsnooze');
                          setShowSnoozeMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#ff453a] hover:bg-[#ff453a]/15 rounded-xl border-t border-white/[0.08] mt-1 pt-1.5 transition"
                      >
                        Cancel Snooze
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Apple iMessage Style Inline Reply Drawer */}
        {isReplying && !isDismissed && (
          <div className="mt-3 pt-3 border-t border-white/[0.06] animate-in fade-in">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendReply();
                  }}
                  placeholder={`Reply to ${notification.title}...`}
                  className="w-full rounded-full bg-white/[0.06] border border-white/[0.12] pl-4 pr-10 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
                  autoFocus
                />
                <button
                  onClick={() => handleSendReply()}
                  disabled={!replyText.trim()}
                  className="absolute right-1.5 top-1 h-6 w-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-30 disabled:hover:bg-[#0071e3] text-white flex items-center justify-center transition active:scale-95"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <button
                onClick={() => setIsReplying(false)}
                className="rounded-full bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 text-xs text-white/60 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
