import React, { useState, useMemo } from 'react';
import { useSyncSocket } from './hooks/useSyncSocket';
import { NotificationFilter } from './types';
import { Header } from './components/Header';
import { DeviceRosterBar } from './components/DeviceRosterBar';
import { NotificationCard } from './components/NotificationCard';
import { AndroidSimulatorDrawer } from './components/AndroidSimulatorDrawer';
import { PairingModal } from './components/PairingModal';
import { AndroidSetupGuideModal } from './components/AndroidSetupGuideModal';
import { ClipboardSyncPanel } from './components/ClipboardSyncPanel';
import { AppFilterManager } from './components/AppFilterManager';
import { RingingAlertModal } from './components/RingingAlertModal';
import {
  Bell,
  Search,
  CheckCheck,
  Trash2,
  Smartphone,
  Laptop,
  Plus,
  Filter,
  Sparkles,
  WifiOff,
  Battery,
  BatteryCharging,
  BellRing,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  const {
    roomCode,
    changeRoomCode,
    deviceInfo,
    updateDeviceProfile,
    devices,
    notifications,
    clipboard,
    dndMode,
    mutedApps,
    ringingDeviceId,
    isConnected,
    isReconnecting,
    soundEnabled,
    setSoundEnabled,
    pushNotification,
    dismissNotification,
    restoreNotification,
    dismissAll,
    markAllAsRead,
    sendNotificationAction,
    sendClipboard,
    triggerRing,
    stopRing,
    toggleDND,
    toggleAppMute,
  } = useSyncSocket('FLEX-101');

  // UI State
  const [currentMode, setCurrentMode] = useState<'chromeos' | 'android'>(() => {
    return deviceInfo.type === 'android' ? 'android' : 'chromeos';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Online status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update device mode
  const handleSwitchMode = (mode: 'chromeos' | 'android') => {
    setCurrentMode(mode);
    updateDeviceProfile({
      type: mode,
      name: mode === 'android' ? 'Android Phone' : 'Chrome OS Flex Hub',
      os: mode === 'android' ? 'Android 14' : 'Chrome OS Flex',
    });
  };

  // Extract list of all unique apps from notifications
  const detectedApps = useMemo(() => {
    const apps = new Set<string>();
    notifications.forEach((n) => {
      if (n.appName) apps.add(n.appName);
    });
    return Array.from(apps);
  }, [notifications]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. App filter
      if (selectedApp !== 'all' && notif.appName !== selectedApp) {
        return false;
      }

      // 2. Status filter
      if (activeFilter === 'all') {
        if (notif.isDismissed) return false;
      } else if (activeFilter === 'unread') {
        if (notif.isDismissed || notif.isRead) return false;
      } else if (activeFilter === 'starred') {
        if (notif.isDismissed || !notif.isStarred) return false;
      } else if (activeFilter === 'snoozed') {
        if (notif.isDismissed || !notif.isSnoozed) return false;
      } else if (activeFilter === 'dismissed') {
        if (!notif.isDismissed) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = notif.title.toLowerCase().includes(q);
        const inBody = notif.body.toLowerCase().includes(q);
        const inApp = notif.appName.toLowerCase().includes(q);
        if (!inTitle && !inBody && !inApp) return false;
      }

      return true;
    });
  }, [notifications, activeFilter, selectedApp, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    const active = notifications.filter((n) => !n.isDismissed);
    return {
      all: active.length,
      unread: active.filter((n) => !n.isRead).length,
      starred: active.filter((n) => n.isStarred).length,
      snoozed: active.filter((n) => n.isSnoozed).length,
      dismissed: notifications.filter((n) => n.isDismissed).length,
    };
  }, [notifications]);

  // Find paired phone for health card if on Chrome OS Flex
  const pairedAndroidDevice = useMemo(() => {
    return Object.values(devices).find((d) => d.type === 'android' && d.id !== deviceInfo.id) ||
      Object.values(devices).find((d) => d.type === 'android');
  }, [devices, deviceInfo.id]);

  const isCurrentDeviceRinging = ringingDeviceId === deviceInfo.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Offline Toast */}
      {!isOnline && (
        <div className="bg-amber-600 px-4 py-1.5 text-center text-xs font-semibold text-white flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — Live sync will resume automatically once connected.</span>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        currentMode={currentMode}
        onSwitchMode={handleSwitchMode}
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        dndMode={dndMode}
        onToggleDnd={() => toggleDND(!dndMode)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenPairing={() => setIsPairingOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        activeCount={counts.unread}
      />

      {/* Paired Device Status Bar */}
      <DeviceRosterBar
        currentDeviceId={deviceInfo.id}
        devices={devices}
        roomCode={roomCode}
        onOpenPairing={() => setIsPairingOpen(true)}
        onTriggerRing={triggerRing}
        ringingDeviceId={ringingDeviceId}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-5 sm:px-6">
        {/* Device View Banner */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-slate-900/60 border border-slate-800/80 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              {currentMode === 'chromeos' ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {currentMode === 'chromeos' ? 'Chrome OS Flex Centralized Dashboard' : 'Android Mobile Sync Hub'}
                </h2>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Bi-Directional
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentMode === 'chromeos'
                  ? 'All notifications from paired Android devices stream here in real-time. Dismissals and replies sync back.'
                  : 'Receive notifications, sync clipboard, and test broadcasting to your Chrome OS Flex screen.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Broadcast Notification</span>
            </button>

            <button
              onClick={() => setIsPairingOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 px-3 py-2 text-xs font-medium text-slate-200 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Device</span>
            </button>
          </div>
        </div>

        {/* Layout Grid: Left (Notifications & Filters) + Right (Companion Widgets) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-Column: Notifications Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter & Search Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 space-y-3">
              {/* Search + Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notifications by title, body, or app..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    disabled={counts.unread === 0}
                    className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 transition"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark Read</span>
                  </button>

                  <button
                    onClick={dismissAll}
                    disabled={counts.all === 0}
                    className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50 transition"
                    title="Dismiss all active notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Dismiss All</span>
                  </button>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                    activeFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>Active</span>
                  <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] opacity-80">
                    {counts.all}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('unread')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                    activeFilter === 'unread'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>Unread</span>
                  {counts.unread > 0 && (
                    <span className="rounded-full bg-indigo-400 text-slate-950 font-bold px-1.5 py-0.2 text-[10px]">
                      {counts.unread}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveFilter('starred')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                    activeFilter === 'starred'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>Starred</span>
                  <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] opacity-80">
                    {counts.starred}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('snoozed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                    activeFilter === 'snoozed'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>Snoozed</span>
                  <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] opacity-80">
                    {counts.snoozed}
                  </span>
                </button>

                <button
                  onClick={() => setActiveFilter('dismissed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition shrink-0 ${
                    activeFilter === 'dismissed'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>History / Dismissed</span>
                  <span className="rounded-full bg-slate-900/60 px-1.5 py-0.2 text-[10px] opacity-80">
                    {counts.dismissed}
                  </span>
                </button>
              </div>

              {/* App Category filter chips */}
              {detectedApps.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">App:</span>
                  <button
                    onClick={() => setSelectedApp('all')}
                    className={`px-2 py-0.5 rounded-lg transition shrink-0 ${
                      selectedApp === 'all'
                        ? 'bg-slate-200 text-slate-950 font-semibold'
                        : 'bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    All Apps
                  </button>
                  {detectedApps.map((app) => (
                    <button
                      key={app}
                      onClick={() => setSelectedApp(app)}
                      className={`px-2 py-0.5 rounded-lg transition shrink-0 ${
                        selectedApp === app
                          ? 'bg-indigo-500 text-white font-semibold'
                          : 'bg-slate-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification List Feed */}
            {filteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-10 text-center flex flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">No notifications here</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {searchQuery
                    ? `No notifications matching "${searchQuery}". Try a different keyword.`
                    : activeFilter === 'dismissed'
                    ? 'No dismissed notifications history yet.'
                    : 'Your notification inbox is clean! Receive a notification from Android or broadcast a test.'}
                </p>
                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() => setIsSimulatorOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Broadcast Test Alert</span>
                  </button>
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 transition"
                  >
                    Setup Android Webhook
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notif) => {
                  const sourceDev = devices[notif.sourceDeviceId];
                  return (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      onDismiss={dismissNotification}
                      onRestore={restoreNotification}
                      onAction={sendNotificationAction}
                      deviceLabel={sourceDev ? sourceDev.name : undefined}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Companion Utilities (Phone Health, Clipboard, App Filters) */}
          <div className="space-y-5">
            {/* Paired Android Device Card */}
            {pairedAndroidDevice ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white">{pairedAndroidDevice.name}</h3>
                      <p className="text-[10px] text-slate-400">{pairedAndroidDevice.os}</p>
                    </div>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      pairedAndroidDevice.isOnline
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        pairedAndroidDevice.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span>{pairedAndroidDevice.isOnline ? 'Synced' : 'Last seen recently'}</span>
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Battery</span>
                    <div className="flex items-center gap-1.5 mt-1 font-bold text-white">
                      {pairedAndroidDevice.isCharging ? (
                        <BatteryCharging className="w-4 h-4 text-amber-400 animate-pulse" />
                      ) : (
                        <Battery className="w-4 h-4 text-emerald-400" />
                      )}
                      <span>{pairedAndroidDevice.batteryLevel ?? 85}%</span>
                      {pairedAndroidDevice.isCharging && (
                        <span className="text-[10px] text-amber-400 font-normal">Fast Charging</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-2.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Focus State</span>
                    <div className="flex items-center gap-1 mt-1 font-bold text-white">
                      <span className={`h-2 w-2 rounded-full ${dndMode ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                      <span>{dndMode ? 'DND On' : 'Standard'}</span>
                    </div>
                  </div>
                </div>

                {/* Ring Phone button */}
                <button
                  onClick={() => triggerRing(pairedAndroidDevice.id)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 py-2 text-xs font-semibold transition"
                >
                  <BellRing className="w-3.5 h-3.5 text-rose-400" />
                  <span>Ring My Phone (Find My Device)</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-white">Pair Your Android Phone</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connect your phone via QR code to sync notifications, battery level, and clipboard!
                </p>
                <button
                  onClick={() => setIsPairingOpen(true)}
                  className="mt-3 w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2 text-xs font-semibold text-white transition shadow-sm"
                >
                  Show Pairing QR
                </button>
              </div>
            )}

            {/* Cross-OS Clipboard Bridge */}
            <ClipboardSyncPanel
              clipboard={clipboard}
              onSendClipboard={sendClipboard}
            />

            {/* App Sync Filters (Mute spam apps) */}
            <AppFilterManager
              detectedApps={detectedApps}
              mutedApps={mutedApps}
              onToggleMute={toggleAppMute}
            />
          </div>
        </div>
      </main>

      {/* Modals & Dialogs */}
      <AndroidSimulatorDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSendNotification={pushNotification}
      />

      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        roomCode={roomCode}
        onChangeRoomCode={changeRoomCode}
      />

      <AndroidSetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        roomCode={roomCode}
      />

      {/* Ringing Siren Modal if this device is requested to ring */}
      <RingingAlertModal
        isRinging={isCurrentDeviceRinging}
        onStopRing={stopRing}
      />
    </div>
  );
}
