import React from 'react';
import {
  Bell,
  BellOff,
  QrCode,
  BookOpen,
  Laptop,
  Smartphone,
  Volume2,
  VolumeX,
  Moon,
  Wifi,
  WifiOff,
} from 'lucide-react';
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
  onOpenApkModal: () => void;
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
  onOpenApkModal,
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
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0c0d12]/80 backdrop-blur-2xl px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Apple-Style Brand & Mode Segmented Control */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            {/* App Icon (Apple squircle with blue gradient & glow) */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-b from-[#0a84ff] to-[#0066cc] shadow-[0_2px_8px_rgba(10,132,255,0.35)] ring-1 ring-white/20">
              <Bell className="h-4 w-4 text-white" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[10px] font-semibold text-white shadow-sm ring-2 ring-[#0c0d12]">
                  {activeCount > 99 ? '99+' : activeCount}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold tracking-tight text-white/95">
                  FlexSync
                </span>
                <span className="text-[11px] font-medium text-white/40 hidden sm:inline">
                  Bridge
                </span>
              </div>
            </div>
          </div>

          {/* Segmented Device Selector (Apple macOS / iOS style) */}
          <div className="hidden md:flex items-center bg-white/[0.06] border border-white/[0.08] rounded-xl p-0.5 shadow-inner">
            <button
              onClick={() => onSwitchMode('chromeos')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[9px] text-xs font-medium transition-all ${
                currentMode === 'chromeos'
                  ? 'bg-white/15 text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] ring-1 ring-white/10'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/[0.04]'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Chrome OS Flex Hub</span>
            </button>
            <button
              onClick={() => onSwitchMode('android')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[9px] text-xs font-medium transition-all ${
                currentMode === 'android'
                  ? 'bg-[#30d158]/20 text-[#30d158] shadow-[0_1px_3px_rgba(0,0,0,0.3)] ring-1 ring-[#30d158]/30 font-semibold'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/[0.04]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Node</span>
            </button>
          </div>
        </div>

        {/* Right: Apple Control Center items & Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Connection Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isConnected
                ? 'bg-[#30d158]/10 border-[#30d158]/25 text-[#30d158]'
                : isReconnecting
                ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/25 text-[#ff9f0a]'
                : 'bg-[#ff453a]/10 border-[#ff453a]/25 text-[#ff453a]'
            }`}
            title={isConnected ? 'Sync bridge live (WebSocket connected)' : 'Reconnecting...'}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected
                  ? 'bg-[#30d158] shadow-[0_0_6px_#30d158]'
                  : isReconnecting
                  ? 'bg-[#ff9f0a] animate-pulse'
                  : 'bg-[#ff453a]'
              }`}
            />
            <span className="hidden sm:inline tracking-tight">
              {isConnected ? 'Synced' : isReconnecting ? 'Connecting' : 'Offline'}
            </span>
            <Wifi className="w-3 h-3 sm:hidden" />
          </div>

          {/* Apple Focus / Do Not Disturb Toggle */}
          <button
            onClick={onToggleDnd}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all ${
              dndMode
                ? 'bg-[#af52de]/20 border-[#af52de]/40 text-[#d184fc] shadow-[0_0_12px_rgba(175,82,222,0.25)]'
                : 'bg-white/[0.06] border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1]'
            }`}
            title={dndMode ? 'Focus / Do Not Disturb Active' : 'Turn on Focus Mode'}
          >
            <Moon className={`w-3.5 h-3.5 ${dndMode ? 'fill-[#af52de] text-[#af52de]' : 'text-white/60'}`} />
            <span className="hidden lg:inline">{dndMode ? 'Focus On' : 'Focus'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="flex items-center justify-center h-7 w-7 rounded-full border border-white/[0.08] bg-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.12] transition-colors"
            title={soundEnabled ? 'Chime sound on' : 'Chime muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-white/90" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-white/40" />
            )}
          </button>

          {/* Allow Popups Prompt if not granted */}
          {notifPermission !== 'granted' && 'Notification' in window && (
            <button
              onClick={handleRequestPermission}
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#ff9f0a]/30 bg-[#ff9f0a]/15 px-3 py-1 text-xs font-medium text-[#ffd60a] hover:bg-[#ff9f0a]/25 transition"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span>Allow Banners</span>
            </button>
          )}

          {/* Setup Guide Button */}
          <button
            onClick={onOpenGuide}
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80 hover:text-white hover:bg-white/[0.12] transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-white/50" />
            <span>Guide</span>
          </button>

          {/* APK & PWA Package Center Button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1.5 rounded-full border border-[#30d158]/30 bg-[#30d158]/15 px-3 py-1 text-xs font-medium text-[#30d158] hover:bg-[#30d158]/25 transition active:scale-95"
            title="Download Android APK & Install PWA"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">APK & PWA</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Pair Device (Apple Blue Primary Button) */}
          <button
            onClick={onOpenPairing}
            className="flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-3.5 py-1 text-xs font-medium shadow-[0_1px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_2px_8px_rgba(0,113,227,0.4)] transition active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pair Device</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
