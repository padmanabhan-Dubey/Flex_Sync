import React, { useState } from 'react';
import { SyncDevice } from '../types';
import { Smartphone, Laptop, Tablet, Monitor, BatteryCharging, Battery, BellRing, Copy, Check, QrCode } from 'lucide-react';

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
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'chromeos':
        return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'tablet':
        return <Tablet className="w-4 h-4 text-indigo-400" />;
      default:
        return <Monitor className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Device List */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium text-[11px] uppercase tracking-wider mr-1">
            Paired Devices:
          </span>

          {deviceList.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span>No other devices connected yet. Pair your Android phone or Chrome OS Flex!</span>
            </div>
          ) : (
            deviceList.map((device) => {
              const isThisDevice = device.id === currentDeviceId;
              const isRinging = ringingDeviceId === device.id;

              return (
                <div
                  key={device.id}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 border transition ${
                    isThisDevice
                      ? 'bg-slate-800/80 border-slate-700/80 text-white'
                      : device.isOnline
                      ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="relative">
                    {getDeviceIcon(device.type)}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-1 ring-slate-900 ${
                        device.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-xs">
                      {device.name}
                      {isThisDevice && <span className="ml-1 text-[10px] text-indigo-400 font-normal">(This Device)</span>}
                    </span>

                    {/* Battery indicator */}
                    {device.batteryLevel !== undefined && (
                      <span className="flex items-center gap-0.5 text-[11px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {device.isCharging ? (
                          <BatteryCharging className="w-3 h-3 text-amber-400 animate-pulse" />
                        ) : (
                          <Battery className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{device.batteryLevel}%</span>
                      </span>
                    )}

                    {/* Find My Phone button for Android devices from Chrome OS Flex */}
                    {device.type === 'android' && !isThisDevice && device.isOnline && (
                      <button
                        onClick={() => onTriggerRing(device.id)}
                        className={`flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition ${
                          isRinging
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                            : 'bg-slate-850 hover:bg-slate-750 border-slate-700 text-slate-300'
                        }`}
                        title="Ring this phone (plays loud siren)"
                      >
                        <BellRing className="w-3 h-3 text-rose-400" />
                        <span>{isRinging ? 'Ringing...' : 'Ring Phone'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Sync Room Code */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-850 border border-slate-750 px-2 py-1 rounded-lg">
            <span className="text-[11px] text-slate-400">Sync Room:</span>
            <code className="font-mono font-bold text-xs text-indigo-300 tracking-wide">
              {roomCode}
            </code>
            <button
              onClick={handleCopyCode}
              className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-700 transition"
              title="Copy room code"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <button
            onClick={onOpenPairing}
            className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded-lg text-xs transition"
          >
            <QrCode className="w-3 h-3" />
            <span className="hidden sm:inline">Pairing QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
