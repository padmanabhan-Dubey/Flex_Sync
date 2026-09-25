import React, { useState, useMemo } from 'react';
import { useSyncSocket } from './hooks/useSyncSocket';
import { NotificationFilter } from './types';
import { Header } from './components/Header';
import { NotificationStreamWidget } from './components/widgets/NotificationStreamWidget';
import { DeviceWidget } from './components/widgets/DeviceWidget';
import { MediaControllerWidget } from './components/widgets/MediaControllerWidget';
import { ControlCenterWidget } from './components/widgets/ControlCenterWidget';
import { QuickBroadcasterWidget } from './components/widgets/QuickBroadcasterWidget';
import { ClipboardSyncPanel } from './components/ClipboardSyncPanel';
import { AppFilterManager } from './components/AppFilterManager';
import { AndroidSimulatorDrawer } from './components/AndroidSimulatorDrawer';
import { PairingModal } from './components/PairingModal';
import { AndroidSetupGuideModal } from './components/AndroidSetupGuideModal';
import { RingingAlertModal } from './components/RingingAlertModal';
import { WifiOff } from 'lucide-react';

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
    mediaState,
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
    controlMedia,
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
      Object.values(devices).find((d) => d.type === 'android') ||
      devices[deviceInfo.id];
  }, [devices, deviceInfo.id]);

  // Device label mapping
  const deviceLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.values(devices).forEach((d) => {
      map[d.id] = d.name;
    });
    return map;
  }, [devices]);

  const isCurrentDeviceRinging = ringingDeviceId === deviceInfo.id;

  return (
    <div className="min-h-screen bg-[#0a0b10] text-[#f5f5f7] flex flex-col font-sans selection:bg-[#0071e3]/30 selection:text-white relative overflow-x-hidden">
      {/* Subtle ambient lighting for Apple glass depth */}
      <div className="pointer-events-none fixed -top-40 left-1/4 h-96 w-96 rounded-full bg-[#0a84ff]/8 blur-3xl" />
      <div className="pointer-events-none fixed top-1/2 -right-40 h-96 w-96 rounded-full bg-[#af52de]/6 blur-3xl" />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="bg-[#ff9f0a] px-4 py-1.5 text-center text-xs font-semibold text-black flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline — Reconnecting when internet connection is restored.</span>
        </div>
      )}

      {/* Apple Navigation Header */}
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

      {/* Apple Widget Bento Grid */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Main Large Widget: Notification Stream Panel (Spans 2 columns) */}
          <div className="lg:col-span-2">
            <NotificationStreamWidget
              notifications={filteredNotifications}
              counts={counts}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedApp={selectedApp}
              onSelectApp={setSelectedApp}
              detectedApps={detectedApps}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onDismiss={dismissNotification}
              onRestore={restoreNotification}
              onAction={sendNotificationAction}
              onMarkAllRead={markAllAsRead}
              onDismissAll={dismissAll}
              onOpenBroadcaster={() => setIsSimulatorOpen(true)}
              deviceLabelMap={deviceLabelMap}
            />
          </div>

          {/* Right Column: Stacked Apple Interactive Widgets */}
          <div className="space-y-5">
            {/* Widget 1: Device Telemetry & Find My Phone */}
            <DeviceWidget
              device={pairedAndroidDevice}
              currentDeviceId={deviceInfo.id}
              roomCode={roomCode}
              onOpenPairing={() => setIsPairingOpen(true)}
              onTriggerRing={triggerRing}
              ringingDeviceId={ringingDeviceId}
            />

            {/* Widget 2: Remote Media Controller (Now Playing) */}
            <MediaControllerWidget
              mediaState={mediaState}
              onControlMedia={controlMedia}
              sourceDeviceName={pairedAndroidDevice?.name || 'Android Phone'}
            />

            {/* Widget 3: Control Center Quick Toggles */}
            <ControlCenterWidget
              dndMode={dndMode}
              onToggleDnd={() => toggleDND(!dndMode)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              currentMode={currentMode}
              onSwitchMode={handleSwitchMode}
            />

            {/* Widget 3: 1-Tap Notification Broadcaster */}
            <QuickBroadcasterWidget
              onSendNotification={pushNotification}
              onOpenCustomDrawer={() => setIsSimulatorOpen(true)}
            />

            {/* Widget 4: Universal Clipboard Bridge */}
            <ClipboardSyncPanel
              clipboard={clipboard}
              onSendClipboard={sendClipboard}
            />

            {/* Widget 5: App Sync Filters */}
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
