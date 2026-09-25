import React from 'react';
import { Moon, Volume2, VolumeX, Bell, Laptop, Smartphone } from 'lucide-react';
import { requestNotificationPermission } from '../../utils/webNotification';

interface ControlCenterWidgetProps {
  dndMode: boolean;
  onToggleDnd: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currentMode: 'chromeos' | 'android';
  onSwitchMode: (mode: 'chromeos' | 'android') => void;
}

export const ControlCenterWidget: React.FC<ControlCenterWidgetProps> = ({
  dndMode,
  onToggleDnd,
  soundEnabled,
  onToggleSound,
  currentMode,
  onSwitchMode,
}) => {
  const [notifPermission, setNotifPermission] = React.useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'denied';
  });

  const handleToggleBanners = async () => {
    if (notifPermission !== 'granted') {
      const res = await requestNotificationPermission();
      setNotifPermission(res);
    }
  };

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4.5 shadow-lg flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#af52de]/15 border border-[#af52de]/25 text-[#af52de]">
            <Moon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/95 tracking-tight">Control Center</h3>
            <p className="text-[10px] text-white/40">Quick toggles & focus preferences</p>
          </div>
        </div>
      </div>

      {/* 4 Apple Control Center Style Square Tiles */}
      <div className="grid grid-cols-2 gap-2.5 my-3.5">
        {/* Tile 1: Focus / DND */}
        <button
          onClick={onToggleDnd}
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left active:scale-[0.97] ${
            dndMode
              ? 'bg-[#af52de]/20 border-[#af52de]/40 text-white shadow-[0_0_15px_rgba(175,82,222,0.2)]'
              : 'bg-black/25 hover:bg-white/[0.06] border-white/[0.05] text-white/80'
          }`}
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              dndMode ? 'bg-[#af52de] text-white' : 'bg-white/[0.08] text-white/60'
            }`}
          >
            <Moon className={`w-4 h-4 ${dndMode ? 'fill-white' : ''}`} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold block leading-tight">Focus</span>
            <span className="text-[10px] text-white/45 block mt-0.5">
              {dndMode ? 'On' : 'Off'}
            </span>
          </div>
        </button>

        {/* Tile 2: Chime Sound */}
        <button
          onClick={onToggleSound}
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left active:scale-[0.97] ${
            soundEnabled
              ? 'bg-[#0a84ff]/20 border-[#0a84ff]/40 text-white shadow-[0_0_15px_rgba(10,132,255,0.2)]'
              : 'bg-black/25 hover:bg-white/[0.06] border-white/[0.05] text-white/80'
          }`}
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              soundEnabled ? 'bg-[#0071e3] text-white' : 'bg-white/[0.08] text-white/40'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold block leading-tight">Chimes</span>
            <span className="text-[10px] text-white/45 block mt-0.5">
              {soundEnabled ? 'Marimba' : 'Muted'}
            </span>
          </div>
        </button>

        {/* Tile 3: Desktop Banners */}
        <button
          onClick={handleToggleBanners}
          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left active:scale-[0.97] ${
            notifPermission === 'granted'
              ? 'bg-[#30d158]/20 border-[#30d158]/40 text-white shadow-[0_0_15px_rgba(48,209,88,0.2)]'
              : 'bg-black/25 hover:bg-white/[0.06] border-white/[0.05] text-white/80'
          }`}
        >
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              notifPermission === 'granted' ? 'bg-[#30d158] text-black' : 'bg-white/[0.08] text-white/40'
            }`}
          >
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold block leading-tight">OS Banners</span>
            <span className="text-[10px] text-white/45 block mt-0.5">
              {notifPermission === 'granted' ? 'Enabled' : 'Allow Popups'}
            </span>
          </div>
        </button>

        {/* Tile 4: Mode Switcher */}
        <button
          onClick={() => onSwitchMode(currentMode === 'chromeos' ? 'android' : 'chromeos')}
          className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.05] bg-black/25 hover:bg-white/[0.06] text-left transition-all active:scale-[0.97]"
        >
          <div className="h-8 w-8 rounded-full bg-white/[0.08] text-white/80 flex items-center justify-center shrink-0">
            {currentMode === 'chromeos' ? <Laptop className="w-4 h-4 text-[#0a84ff]" /> : <Smartphone className="w-4 h-4 text-[#30d158]" />}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white/90 block leading-tight">Node Mode</span>
            <span className="text-[10px] text-white/45 block mt-0.5 truncate">
              {currentMode === 'chromeos' ? 'Chrome OS' : 'Android'}
            </span>
          </div>
        </button>
      </div>

      <div className="text-[10px] text-white/35 text-center">
        Settings sync instantly across all connected devices in room
      </div>
    </div>
  );
};
