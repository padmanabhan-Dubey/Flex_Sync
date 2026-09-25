import React, { useState } from 'react';
import { SyncDevice } from '../types';
import { Smartphone, Laptop, Tablet, Monitor, BatteryCharging, Battery, Volume2, Copy, Check, QrCode } from 'lucide-react';

interface DeviceRosterBarProps {
  currentDeviceId: string;
  devices: Record<string, SyncDevice>;
  roomCode: string;
  onOpenPairing: () => void;
  onTriggerRing: (deviceId: string) => void;
  ringingDeviceId: string | null;
}

export const DeviceRosterBar: React.FC<DeviceRosterBarProps> = ({
  currentDeviceId,
  devices,
  roomCode,
  onOpenPairing,
  onTriggerRing,
  ringingDeviceId,
}) => {
  const [copied, setCopied] = useState(false);

  const deviceList = Object.values(devices);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDeviceIcon = (type: SyncDevice['type']) => {
    switch (type) {
      case 'android':
        return <Smartphone className="w-4 h-4 text-[#30d158]" />;
      case 'chromeos':
        return <Laptop className="w-4 h-4 text-[#0a84ff]" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-[#bf5af2]" />;
      default:
        return <Monitor className="w-4 h-4 text-white/60" />;
    }
  };

  return (
    <div className="bg-[#12141c]/50 border-b border-white/[0.06] px-4 py-2 text-xs backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Apple Find My style device list */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white/40 font-medium text-[11px] tracking-tight mr-1">
            Devices:
          </span>

          {deviceList.length === 0 ? (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff9f0a] animate-pulse" />
              <span>No other devices connected. Tap "Pair Device" to connect your Android phone.</span>
            </div>
          ) : (
            deviceList.map((device) => {
              const isThisDevice = device.id === currentDeviceId;
              const isRinging = ringingDeviceId === device.id;

              return (
                <div
                  key={device.id}
                  className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 border transition-all ${
                    isThisDevice
                      ? 'bg-white/[0.08] border-white/[0.12] text-white shadow-sm'
                      : device.isOnline
                      ? 'bg-white/[0.04] border-white/[0.07] text-white/90 hover:bg-white/[0.07]'
                      : 'bg-white/[0.02] border-white/[0.04] text-white/40 opacity-70'
                  }`}
                >
                  <div className="relative flex items-center justify-center h-6 w-6 rounded-lg bg-white/[0.08] border border-white/[0.08]">
                    {getDeviceIcon(device.type)}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-[#12141c] ${
                        device.isOnline ? 'bg-[#30d158]' : 'bg-white/30'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-white/90">
                      {device.name}
                      {isThisDevice && <span className="ml-1 text-[10px] text-white/40 font-normal">(This Device)</span>}
                    </span>

                    {/* Apple-style Battery status */}
                    {device.batteryLevel !== undefined && (
                      <span className="flex items-center gap-1 text-[11px] text-white/60 bg-white/[0.06] px-1.5 py-0.5 rounded-md font-mono tabular-nums">
                        {device.isCharging ? (
                          <BatteryCharging className="w-3 h-3 text-[#30d158]" />
                        ) : (
                          <Battery className="w-3 h-3 text-white/50" />
                        )}
                        <span>{device.batteryLevel}%</span>
                      </span>
                    )}

                    {/* Apple Find My "Play Sound" button */}
                    {device.type === 'android' && !isThisDevice && device.isOnline && (
                      <button
                        onClick={() => onTriggerRing(device.id)}
                        className={`flex items-center gap-1 ml-0.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                          isRinging
                            ? 'bg-[#ff453a]/20 border-[#ff453a] text-[#ff6961] animate-pulse'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08] text-white/80'
                        }`}
                        title="Play loud sound on this phone (Find My)"
                      >
                        <Volume2 className="w-3 h-3 text-[#0a84ff]" />
                        <span>{isRinging ? 'Playing Sound...' : 'Play Sound'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Workspace Sync Code */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-xl">
            <span className="text-[11px] text-white/40">Sync Code:</span>
            <code className="font-mono font-semibold text-xs text-[#0a84ff] tracking-wider">
              {roomCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="text-white/40 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition"
              title="Copy code"
            >
              {copied ? <Check className="w-3 h-3 text-[#30d158]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <button
            onClick={onOpenPairing}
            className="flex items-center gap-1 bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border border-white/[0.08] px-2.5 py-1 rounded-xl text-xs transition"
          >
            <QrCode className="w-3 h-3 text-[#0a84ff]" />
            <span className="hidden sm:inline">QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
