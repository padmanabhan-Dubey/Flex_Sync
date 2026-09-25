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
  MoreVertical,
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

  const getAppStyle = (app: string) => {
    const lower = app.toLowerCase();
    if (lower.includes('whatsapp')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        badge: 'bg-emerald-500 text-white',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      };
    }
    if (lower.includes('slack')) {
      return {
        bg: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400',
        badge: 'bg-fuchsia-600 text-white',
        icon: <MessageSquare className="w-3.5 h-3.5" />,
      };
    }
    if (lower.includes('gmail') || lower.includes('mail') || lower.includes('email')) {
      return {
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        badge: 'bg-rose-500 text-white',
        icon: <Mail className="w-3.5 h-3.5" />,
      };
    }
    if (lower.includes('telegram')) {
      return {
        bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
        badge: 'bg-sky-500 text-white',
        icon: <Send className="w-3.5 h-3.5" />,
      };
    }
    if (lower.includes('calendar')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        badge: 'bg-amber-500 text-slate-950',
        icon: <Calendar className="w-3.5 h-3.5" />,
      };
    }
    if (lower.includes('call') || lower.includes('phone')) {
      return {
        bg: 'bg-green-500/10 border-green-500/20 text-green-400',
        badge: 'bg-green-500 text-white',
        icon: <Phone className="w-3.5 h-3.5" />,
      };
    }
    if (lower.includes('bank') || lower.includes('alert') || lower.includes('security')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        badge: 'bg-amber-500 text-black',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
      };
    }
    return {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      badge: 'bg-indigo-600 text-white',
      icon: <Share2 className="w-3.5 h-3.5" />,
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
    return new Date(ts).toLocaleDateString();
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
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isDismissed
          ? 'border-slate-800/60 bg-slate-900/30 opacity-60 hover:opacity-100'
          : !notification.isRead
          ? 'border-slate-700/80 bg-slate-900/90 shadow-lg shadow-black/20 ring-1 ring-indigo-500/20'
          : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700/80'
      }`}
    >
      {/* Unread dot */}
      {!notification.isRead && !isDismissed && (
        <span className="absolute -left-1 top-6 h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
      )}

      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${appStyle.badge}`}>
              {appStyle.icon}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-slate-200">
                  {notification.appName}
                </span>

                {notification.priority === 'high' && (
                  <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                    High Priority
                  </span>
                )}

                {isSnoozed && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                    <Clock className="w-3 h-3" />
                    Snoozed
                  </span>
                )}

                {deviceLabel && (
                  <span className="text-[10px] text-slate-500">
                    via {deviceLabel}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-400">
                {formatTime(notification.timestamp)}
              </span>
            </div>
          </div>

          {/* Quick icon actions */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              title="Copy notification text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onAction(notification.id, 'star')}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${
                notification.isStarred ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={notification.isStarred ? 'Unstar' : 'Star notification'}
            >
              <Star className={`w-4 h-4 ${notification.isStarred ? 'fill-amber-400' : ''}`} />
            </button>

            {!isDismissed ? (
              <button
                onClick={() => onDismiss(notification.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
                title="Dismiss (Sync to Android)"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              onRestore && (
                <button
                  onClick={() => onRestore(notification.id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition"
                  title="Restore notification"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* Content body */}
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-white tracking-tight">
            {notification.title}
          </h4>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {notification.body}
          </p>
        </div>

        {/* Reply history if any */}
        {notification.replyHistory && notification.replyHistory.length > 0 && (
          <div className="mt-3 rounded-xl bg-slate-950/60 border border-slate-800/80 p-2.5 space-y-1.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Reply Thread (Synced)
            </span>
            {notification.replyHistory.map((rep, idx) => (
              <div key={idx} className="flex items-start justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <CornerDownLeft className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-400 font-medium text-[11px]">{rep.sender}:</span>
                  <span>{rep.text}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                  {formatTime(rep.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Quick Replies chips & Actions bar */}
        {!isDismissed && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
            {/* Left: Quick Reply action trigger or quick chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {!isReplying && (
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium transition"
                >
                  <CornerDownLeft className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}

              {/* Quick suggestion chips */}
              {!isReplying &&
                notification.quickReplies?.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReply(chip)}
                    className="rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 px-2.5 py-1 text-xs transition"
                  >
                    {chip}
                  </button>
                ))}
            </div>

            {/* Right: Read status & Snooze options */}
            <div className="flex items-center gap-1.5 relative">
              {!notification.isRead && (
                <button
                  onClick={() => onAction(notification.id, 'read')}
                  className="flex items-center gap-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2 py-1 text-xs transition"
                  title="Mark as Read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark Read</span>
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                  className="flex items-center gap-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-2 py-1 text-xs transition"
                  title="Snooze notification"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Snooze</span>
                </button>

                {showSnoozeMenu && (
                  <div className="absolute right-0 bottom-full mb-1 w-36 rounded-xl bg-slate-900 border border-slate-800 p-1 shadow-xl z-20 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        onAction(notification.id, 'snooze', { durationMinutes: 15 });
                        setShowSnoozeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg"
                    >
                      15 minutes
                    </button>
                    <button
                      onClick={() => {
                        onAction(notification.id, 'snooze', { durationMinutes: 60 });
                        setShowSnoozeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg"
                    >
                      1 hour
                    </button>
                    <button
                      onClick={() => {
                        onAction(notification.id, 'snooze', { durationMinutes: 240 });
                        setShowSnoozeMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg"
                    >
                      4 hours
                    </button>
                    {isSnoozed && (
                      <button
                        onClick={() => {
                          onAction(notification.id, 'unsnooze');
                          setShowSnoozeMenu(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10 rounded-lg border-t border-slate-800 mt-1 pt-1"
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

        {/* Inline reply textarea when expanded */}
        {isReplying && !isDismissed && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendReply();
                }}
                placeholder={`Reply to ${notification.title}...`}
                className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={() => handleSendReply()}
                className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white transition active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
              <button
                onClick={() => setIsReplying(false)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs text-slate-400 hover:text-white"
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
