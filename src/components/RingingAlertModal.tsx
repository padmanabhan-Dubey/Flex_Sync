import React from 'react';
import { BellRing, Volume2, ShieldAlert } from 'lucide-react';

interface RingingAlertModalProps {
  isRinging: boolean;
  onStopRing: () => void;
}

export const RingingAlertModal: React.FC<RingingAlertModalProps> = ({
  isRinging,
  onStopRing,
}) => {
  if (!isRinging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-rose-500 shadow-2xl p-6 text-center text-slate-100 flex flex-col items-center">
        {/* Pulsing bell animation */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute h-24 w-24 rounded-full bg-rose-500/20 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-600 shadow-xl shadow-rose-600/50">
            <BellRing className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight">
          Find My Phone Triggered!
        </h2>
        <p className="text-xs text-rose-200 mt-1 max-w-xs">
          Your paired Chrome OS Flex workstation requested to locate this device.
        </p>

        <button
          onClick={onStopRing}
          className="mt-6 w-full rounded-2xl bg-rose-600 hover:bg-rose-500 py-3.5 text-sm font-bold text-white shadow-xl shadow-rose-600/30 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Volume2 className="w-4 h-4" />
          <span>I Found My Device (Stop Siren)</span>
        </button>
      </div>
    </div>
  );
};
