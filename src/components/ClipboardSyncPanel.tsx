import React, { useState } from 'react';
import { ClipboardItem } from '../types';
import { Clipboard, Send, Copy, Check, Clock, Laptop, Smartphone } from 'lucide-react';

interface ClipboardSyncPanelProps {
  clipboard: ClipboardItem[];
  onSendClipboard: (text: string) => void;
}

export const ClipboardSyncPanel: React.FC<ClipboardSyncPanelProps> = ({
  clipboard,
  onSendClipboard,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendClipboard(inputText.trim());
    setInputText('');
  };

  const handleCopy = (item: ClipboardItem) => {
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (ts: number) => {
    const diff = Math.max(0, Date.now() - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Clipboard className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Cross-OS Clipboard Bridge</h3>
            <p className="text-[10px] text-slate-400">Instantly share links, text & 2FA codes</p>
          </div>
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type text to push to paired device..."
          className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-xl bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition active:scale-95"
        >
          <Send className="w-3 h-3" />
          <span>Sync</span>
        </button>
      </form>

      {/* Synced items list */}
      <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
        {clipboard.length === 0 ? (
          <p className="text-center text-[11px] text-slate-500 py-3">
            Clipboard history is empty. Send your first snippet above!
          </p>
        ) : (
          clipboard.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-slate-950/60 border border-slate-800/80 p-2 text-xs group hover:border-slate-700 transition"
            >
              <div className="min-w-0 flex-1">
                <p className="text-slate-200 font-mono text-[11px] truncate select-all">
                  {item.text}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                  <span>{item.sourceDevice}</span>
                  <span>•</span>
                  <span>{formatTime(item.timestamp)}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition shrink-0"
                title="Copy to clipboard"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
