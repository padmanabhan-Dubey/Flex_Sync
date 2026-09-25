import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, X, Smartphone, Laptop, ExternalLink, ArrowRight } from 'lucide-react';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  onChangeRoomCode: (code: string) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  onChangeRoomCode,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const currentPairingUrl = `${window.location.origin}/?room=${encodeURIComponent(roomCode)}&device=android`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(currentPairingUrl, {
        margin: 2,
        width: 240,
        color: {
          dark: '#020617',
          light: '#f8fafc',
        },
      })
        .then((url) => setQrUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, currentPairingUrl, roomCode]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentPairingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSwitchRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onChangeRoomCode(inputCode.trim());
      setInputCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pair Android with Chrome OS Flex</h3>
              <p className="text-xs text-slate-400">Instant real-time bidirectional sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Section */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-white p-3 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/20">
            {qrUrl ? (
              <img src={qrUrl} alt="Pairing QR Code" className="h-44 w-44 rounded-xl" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center text-slate-600">
                Generating QR...
              </div>
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-300">
              Scan this QR code with your Android camera or Chrome browser
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              It will instantly open and link your Android phone to this workspace session.
            </p>
          </div>
        </div>

        {/* 6-Digit Code Box */}
        <div className="mt-5 rounded-2xl bg-slate-950/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Sync Workspace Code
              </span>
              <div className="font-mono text-xl font-extrabold tracking-wider text-indigo-400 mt-0.5">
                {roomCode}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Share Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Switch Workspace Room */}
        <form onSubmit={handleSwitchRoom} className="mt-4 flex gap-2">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="Join existing sync code..."
            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition"
          >
            <span>Switch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-800/80 hover:bg-slate-800 py-2.5 text-xs font-medium text-slate-300 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
