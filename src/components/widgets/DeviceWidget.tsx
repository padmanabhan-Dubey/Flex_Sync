import React, { useState } from 'react';
import { SyncDevice } from '../../types';
import { Smartphone, Laptop, Tablet, Monitor, BatteryCharging, Battery, Volume2, Copy, Check, QrCode } from 'lucide-react';

interface DeviceWidgetProps {
  device?: SyncDevice;
  currentDeviceId: string;
  roomCode: string;
  onOpenPairing: () => void;
  onTriggerRing: (deviceId: string) => void;
  ringingDeviceId: string | null;
}

export const DeviceWidget: React.FC<DeviceWidgetProps> = ({
  device,
  currentDeviceId,
  roomCode,
  onOpenPairing,
  onTriggerRing,
  ringingDeviceId,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRinging = device ? ringingDeviceId === device.id : false;
  const isOnline = device?.isOnline ?? true;
  const batteryLevel = device?.batteryLevel ?? 88;
  const isCharging = device?.isCharging ?? false;

  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4.5 shadow-lg flex flex-col justify-between relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#30d158]/15 border border-[#30d158]/25 text-[#30d158]">
            {device?.type === 'chromeos' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-white/95 tracking-tight">
              {device ? device.name : 'Paired Android Phone'}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-white/40">
              <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-[#30d158]' : 'bg-white/30'}`} />
              <span>{isOnline ? 'Active Sync' : 'Offline'}</span>
              <span aria-hidden="true">·</span>
              <span>{device?.os || 'Android 14'}</span>
            </div>
          </div>
        </div>

        {/* Sync Room Pill */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-2.5 py-1 rounded-full text-[11px] text-white/80 transition"
          title="Click to copy room code"
        >
          <span className="font-mono text-[#0a84ff] font-semibold">{roomCode}</span>
          {copied ? <Check className="w-3 h-3 text-[#30d158]" /> : <Copy className="w-3 h-3 text-white/40" />}
        </button>
      </div>

      {/* Middle: Battery & Status Gauges */}
      <div className="my-3.5 grid grid-cols-2 gap-2.5">
        {/* Battery Tile */}
        <div className="rounded-2xl bg-black/25 border border-white/[0.05] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white/40">
            <span className="text-[10px] uppercase font-semibold tracking-wider">Battery</span>
            {isCharging ? (
              <BatteryCharging className="w-4 h-4 text-[#30d158] animate-pulse" />
            ) : (
              <Battery className="w-4 h-4 text-[#30d158]" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
              {batteryLevel}%
            </span>
            {isCharging && (
              <span className="text-[10px] text-[#30d158] font-medium">Charging</span>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                batteryLevel > 20 ? 'bg-[#30d158]' : 'bg-[#ff453a]'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, batteryLevel))}%` }}
            />
          </div>
        </div>

        {/* Pairing / Quick QR Tile */}
        <button
          onClick={onOpenPairing}
          className="rounded-2xl bg-black/25 hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.1] p-3 flex flex-col justify-between text-left transition group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between text-white/40 group-hover:text-white/60">
            <span className="text-[10px] uppercase font-semibold tracking-wider">QR Code</span>
            <QrCode className="w-4 h-4 text-[#0a84ff]" />
          </div>
          <div className="mt-1">
            <span className="text-xs font-semibold text-white/90 block">Pair New Device</span>
            <span className="text-[10px] text-white/40 mt-0.5 block">Scan camera QR</span>
          </div>
          <span className="text-[10px] text-[#0a84ff] font-medium mt-1">Open QR Sheet &rarr;</span>
        </button>
      </div>

      {/* Bottom Action: Find My Phone (Play Sound) */}
      <div className="pt-1">
        {device && device.type === 'android' && device.id !== currentDeviceId ? (
          <button
            onClick={() => onTriggerRing(device.id)}
            className={`w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-semibold transition active:scale-95 shadow-sm ${
              isRinging
                ? 'bg-[#ff453a] text-white animate-pulse shadow-[0_0_15px_rgba(255,69,58,0.5)]'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border border-white/[0.1]'
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${isRinging ? 'text-white' : 'text-[#0a84ff]'}`} />
            <span>{isRinging ? 'Playing Siren on Phone...' : 'Play Sound (Find My Phone)'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenPairing}
            className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-2 text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Connect Android Phone</span>
          </button>
        )}
      </div>
    </div>
  );
};
