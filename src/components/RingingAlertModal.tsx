import React from 'react';
import { BellRing, Volume2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#1b1921]/95 border border-[#ff453a]/40 shadow-2xl p-6 text-center text-white flex flex-col items-center">
        {/* Pulsing ring animation (Apple Find My style) */}
        <div className="relative flex items-center justify-center mb-5 mt-2">
          <div className="absolute h-24 w-24 rounded-full bg-[#ff453a]/20 animate-ping" />
          <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-[#ff453a] shadow-[0_0_30px_rgba(255,69,58,0.5)]">
            <BellRing className="w-8 h-8 text-white animate-bounce" />
          </div>
        </div>

        <h2 className="text-lg font-bold text-white tracking-tight">
          Find My Phone
        </h2>
        <p className="text-xs text-white/60 mt-1 max-w-xs leading-relaxed">
          Sound playing from your paired Chrome OS Flex workstation.
        </p>

        <button
          onClick={onStopRing}
          className="mt-6 w-full rounded-full bg-[#ff453a] hover:bg-[#ff3b30] py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Volume2 className="w-4 h-4" />
          <span>Stop Sound</span>
        </button>
      </div>
    </div>
  );
};
