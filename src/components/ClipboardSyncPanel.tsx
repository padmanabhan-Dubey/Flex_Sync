import React, { useState } from 'react';
import { ClipboardItem } from '../types';
import { Clipboard, Send, Copy, Check, ArrowRight } from 'lucide-react';

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
    <div className="rounded-2xl border border-white/[0.08] bg-[#161822]/80 backdrop-blur-xl p-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff]">
            <Clipboard className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white/95 tracking-tight">Universal Clipboard</h3>
            <p className="text-[10px] text-white/45">Instantly share links, text & 2FA codes</p>
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
          className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex items-center gap-1 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] disabled:opacity-40 text-white px-3 py-1.5 text-xs font-medium transition active:scale-95 shadow-sm"
        >
          <span>Push</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {/* Synced items list */}
      <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
        {clipboard.length === 0 ? (
          <p className="text-center text-[11px] text-white/40 py-3">
            Clipboard history is empty. Send a snippet above!
          </p>
        ) : (
          clipboard.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-black/20 border border-white/[0.05] p-2.5 text-xs hover:border-white/[0.1] transition group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white/90 font-mono text-[11.5px] truncate select-all">
                  {item.text}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-white/40">
                  <span>{item.sourceDevice}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{formatTime(item.timestamp)}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopy(item)}
                className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-white/80 hover:text-white transition shrink-0"
                title="Copy to clipboard"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3 h-3 text-[#30d158]" />
                    <span className="text-[#30d158]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-white/60" />
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
