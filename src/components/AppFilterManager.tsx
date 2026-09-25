import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface AppFilterManagerProps {
  detectedApps: string[];
  mutedApps: string[];
  onToggleMute: (app: string) => void;
}

const COMMON_APPS = [
  'WhatsApp',
  'Slack',
  'Gmail',
  'Telegram',
  'Google Calendar',
  'Phone',
  'Chase Mobile',
];

export const AppFilterManager: React.FC<AppFilterManagerProps> = ({
  detectedApps,
  mutedApps,
  onToggleMute,
}) => {
  const allApps = Array.from(new Set([...COMMON_APPS, ...detectedApps]));

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#af52de]/15 border border-[#af52de]/25 text-[#af52de]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/95 tracking-tight">App Sync Settings</h3>
            <p className="text-[10px] text-white/45">Toggle which apps forward notifications</p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
        {allApps.map((app) => {
          const isMuted = mutedApps.includes(app);
          const isSyncing = !isMuted;

          return (
            <div
              key={app}
              className="flex items-center justify-between rounded-xl bg-black/20 border border-white/[0.04] px-3 py-2 text-xs hover:border-white/[0.08] transition"
            >
              <span className={`font-medium text-xs ${isSyncing ? 'text-white/90' : 'text-white/40'}`}>
                {app}
              </span>

              {/* Apple-style iOS Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={isSyncing}
                onClick={() => onToggleMute(app)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSyncing ? 'bg-[#30d158]' : 'bg-white/20'
                }`}
                title={isSyncing ? 'Sync active (click to mute)' : 'Muted (click to enable sync)'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isSyncing ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
