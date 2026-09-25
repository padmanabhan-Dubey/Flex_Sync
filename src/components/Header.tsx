import React from 'react';
import { Bell, BellOff, QrCode, BookOpen, Laptop, Smartphone, Volume2, VolumeX, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { requestNotificationPermission } from '../utils/webNotification';

interface HeaderProps {
  currentMode: 'chromeos' | 'android';
  onSwitchMode: (mode: 'chromeos' | 'android') => void;
  isConnected: boolean;
  isReconnecting: boolean;
  dndMode: boolean;
  onToggleDnd: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPairing: () => void;
  onOpenGuide: () => void;
  activeCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSwitchMode,
  isConnected,
  isReconnecting,
  dndMode,
  onToggleDnd,
  soundEnabled,
  onToggleSound,
  onOpenPairing,
  onOpenGuide,
  activeCount,
}) => {
  const [notifPermission, setNotifPermission] = React.useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setNotifPermission(res);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Bell className="h-4 w-4 text-sky-400 animate-pulse" />
              </div>
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
                  {activeCount > 99 ? '99+' : activeCount}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  FlexSync
                  <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
                    Cross-OS
                  </span>
                </h1>
              </div>
              <p className="hidden text-[11px] text-slate-400 sm:block">
                Android ↔ Chrome OS Flex Real-time Bridge
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 ml-3">
            <button
              onClick={() => onSwitchMode('chromeos')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                currentMode === 'chromeos'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Chrome OS Flex Hub
            </button>
            <button
              onClick={() => onSwitchMode('android')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                currentMode === 'android'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android Mobile Node
            </button>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Connection status indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isConnected
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isReconnecting
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
            title={isConnected ? 'Real-time WebSocket connected' : 'Connecting to sync bridge...'}
          >
            {isConnected ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Live Sync</span>
                <Wifi className="w-3 h-3 sm:hidden" />
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">{isReconnecting ? 'Reconnecting...' : 'Offline'}</span>
              </>
            )}
          </div>

          {/* DND Toggle */}
          <button
            onClick={onToggleDnd}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium border transition ${
              dndMode
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
            title={dndMode ? 'Do Not Disturb is Active (Notifications silenced)' : 'Enable Do Not Disturb'}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${dndMode ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="hidden lg:inline">{dndMode ? 'DND Active' : 'DND'}</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={onToggleSound}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={soundEnabled ? 'Chime sound enabled (Click to mute)' : 'Chime sound muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* Web notification permission requester if not granted */}
          {notifPermission !== 'granted' && 'Notification' in window && (
            <button
              onClick={handleRequestPermission}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition"
              title="Enable native desktop notifications for Chrome OS Flex"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span>Allow OS Popups</span>
            </button>
          )}

          {/* Setup Guide */}
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Android Setup & Webhook Guide"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Guide</span>
          </button>

          {/* Pair Device QR Modal */}
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition shadow-sm"
            title="Pair Android with Chrome OS Flex via QR code or Sync code"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pair Device</span>
          </button>

          {/* PWA Install */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
