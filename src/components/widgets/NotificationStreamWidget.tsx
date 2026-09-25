import React from 'react';
import { SyncNotification, NotificationFilter } from '../../types';
import { NotificationCard } from '../NotificationCard';
import { Bell, Search, CheckCheck, Trash2, Sparkles, X } from 'lucide-react';

interface NotificationStreamWidgetProps {
  notifications: SyncNotification[];
  counts: { all: number; unread: number; starred: number; snoozed: number; dismissed: number };
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  selectedApp: string;
  onSelectApp: (app: string) => void;
  detectedApps: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onDismiss: (id: string) => void;
  onRestore?: (id: string) => void;
  onAction: (id: string, action: 'reply' | 'star' | 'snooze' | 'unsnooze' | 'read', payload?: any) => void;
  onMarkAllRead: () => void;
  onDismissAll: () => void;
  onOpenBroadcaster: () => void;
  deviceLabelMap: Record<string, string>;
}

export const NotificationStreamWidget: React.FC<NotificationStreamWidgetProps> = ({
  notifications,
  counts,
  activeFilter,
  onFilterChange,
  selectedApp,
  onSelectApp,
  detectedApps,
  searchQuery,
  onSearchChange,
  onDismiss,
  onRestore,
  onAction,
  onMarkAllRead,
  onDismissAll,
  onOpenBroadcaster,
  deviceLabelMap,
}) => {
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4.5 sm:p-5 shadow-xl flex flex-col h-full">
      {/* Widget Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-white/95 tracking-tight">
                Notification Stream
              </h2>
              {counts.unread > 0 && (
                <span className="rounded-full bg-[#0a84ff] text-white px-2 py-0.2 text-[10px] font-bold tabular-nums">
                  {counts.unread} new
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/40">Real-time bi-directional notifications</p>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={onMarkAllRead}
            disabled={counts.unread === 0}
            className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/70 hover:text-white disabled:opacity-30 transition active:scale-95"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#30d158]" />
            <span>Mark Read</span>
          </button>

          <button
            onClick={onDismissAll}
            disabled={counts.all === 0}
            className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/70 hover:text-[#ff453a] disabled:opacity-30 transition active:scale-95"
            title="Dismiss all active notifications"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Search & Segmented Status Filter Bar */}
      <div className="pt-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Inset Search Field */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by sender, content, or app..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-8.5 pr-8 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2 text-white/40 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented Status Tabs */}
          <div className="flex items-center gap-1 bg-black/25 border border-white/[0.06] p-1 rounded-xl text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <span>Active</span>
              <span className="ml-1 text-[10px] text-white/40 tabular-nums">({counts.all})</span>
            </button>

            <button
              onClick={() => onFilterChange('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                activeFilter === 'unread'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <span>Unread</span>
              {counts.unread > 0 && (
                <span className="ml-1 text-[10px] text-[#0a84ff] font-bold tabular-nums">({counts.unread})</span>
              )}
            </button>

            <button
              onClick={() => onFilterChange('starred')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                activeFilter === 'starred'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <span>Starred</span>
              <span className="ml-1 text-[10px] text-white/40 tabular-nums">({counts.starred})</span>
            </button>

            <button
              onClick={() => onFilterChange('dismissed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                activeFilter === 'dismissed'
                  ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/10'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <span>History</span>
              <span className="ml-1 text-[10px] text-white/40 tabular-nums">({counts.dismissed})</span>
            </button>
          </div>
        </div>

        {/* App Category Chips (zero-pill style unboxed labels) */}
        {detectedApps.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-white/40 pt-1 pb-0.5">
            <span className="text-[10px] uppercase font-semibold text-white/35 mr-1">App:</span>
            <button
              onClick={() => onSelectApp('all')}
              className={`px-2.5 py-0.5 rounded-full transition-all shrink-0 ${
                selectedApp === 'all'
                  ? 'bg-white text-black font-semibold shadow-xs'
                  : 'bg-white/[0.04] text-white/60 hover:text-white'
              }`}
            >
              All
            </button>
            {detectedApps.map((app) => (
              <button
                key={app}
                onClick={() => onSelectApp(app)}
                className={`px-2.5 py-0.5 rounded-full transition-all shrink-0 ${
                  selectedApp === app
                    ? 'bg-[#0071e3] text-white font-semibold shadow-xs'
                    : 'bg-white/[0.04] text-white/60 hover:text-white'
                }`}
              >
                {app}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications List Feed */}
      <div className="mt-3.5 flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[580px]">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-black/20 p-10 text-center flex flex-col items-center justify-center my-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-white/40 mb-3 border border-white/[0.08]">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white/90">No Notifications</h3>
            <p className="text-xs text-white/45 mt-1 max-w-xs leading-relaxed">
              {searchQuery
                ? `No notifications found matching "${searchQuery}".`
                : activeFilter === 'dismissed'
                ? 'Dismissed notifications history is empty.'
                : 'Your stream is clear. Notifications from your paired Android phone appear here.'}
            </p>
            <button
              onClick={onOpenBroadcaster}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcast Test Alert</span>
            </button>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationCard
              key={notif.id}
              notification={notif}
              onDismiss={onDismiss}
              onRestore={onRestore}
              onAction={onAction}
              deviceLabel={deviceLabelMap[notif.sourceDeviceId]}
            />
          ))
        )}
      </div>
    </div>
  );
};
