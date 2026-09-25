import React from 'react';
import { Filter, VolumeX, Volume2, Check } from 'lucide-react';

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
  // Combine detected apps with common apps
  const allApps = Array.from(new Set([...COMMON_APPS, ...detectedApps]));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">App Sync Filters</h3>
            <p className="text-[10px] text-slate-400">Control which Android apps sync to Chrome OS</p>
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {allApps.map((app) => {
          const isMuted = mutedApps.includes(app);
          return (
            <div
              key={app}
              className="flex items-center justify-between rounded-xl bg-slate-950/40 border border-slate-800/80 px-2.5 py-1.5 text-xs hover:border-slate-700 transition"
            >
              <span className={`font-medium ${isMuted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                {app}
              </span>

              <button
                onClick={() => onToggleMute(app)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border transition ${
                  isMuted
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3 h-3" />
                    <span>Muted</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3" />
                    <span>Syncing</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
