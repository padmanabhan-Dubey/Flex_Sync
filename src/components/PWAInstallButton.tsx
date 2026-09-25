import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Chrome OS Flex flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] px-3.5 py-1 text-xs font-medium text-white shadow-sm transition active:scale-95 ${className}`}
        title="Install FlexSync App"
      >
        <Download className="w-3.5 h-3.5 text-[#0a84ff]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.08] hover:bg-white/[0.14] px-3 py-1 text-xs font-medium text-white/90 transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#0a84ff]" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-[#1c1d24]/95 border border-white/[0.12] p-6 shadow-2xl text-white">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[15px] font-semibold text-white">Add to Home Screen</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-white/70 leading-relaxed space-y-2 mb-4">
                1. Tap the <strong className="text-[#0a84ff]">Share</strong> icon at the bottom of Safari.<br />
                2. Select <strong className="text-white">Add to Home Screen</strong>.<br />
                3. Open FlexSync from your Home Screen.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-full bg-white/[0.1] hover:bg-white/[0.16] py-2.5 text-xs font-medium text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
