import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, X, ExternalLink, ArrowRight } from 'lucide-react';

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
          dark: '#0a0b10',
          light: '#ffffff',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#181a24]/95 border border-white/[0.12] shadow-2xl p-6 text-white">
        {/* Apple Sheet Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#0a84ff]/15 border border-[#0a84ff]/25 text-[#0a84ff]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Pair Device</h3>
              <p className="text-xs text-white/50">Real-time sync between Android & Chrome OS Flex</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-full flex items-center justify-center text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code */}
        <div className="mt-5 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-white p-3 shadow-xl ring-4 ring-white/[0.06]">
            {qrUrl ? (
              <img src={qrUrl} alt="Pairing QR Code" className="h-44 w-44 rounded-xl" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center text-neutral-400">
                Generating QR...
              </div>
            )}
          </div>

          <p className="mt-3.5 text-xs text-white/70 max-w-xs leading-relaxed">
            Scan with your Android camera or Chrome browser to instantly pair notifications.
          </p>
        </div>

        {/* Sync Code Box */}
        <div className="mt-5 rounded-2xl bg-black/30 border border-white/[0.08] p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-white/40 tracking-wider">
                Sync Code
              </span>
              <div className="font-mono text-xl font-bold tracking-wider text-[#0a84ff] mt-0.5">
                {roomCode}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.08] hover:bg-white/[0.14] px-3 py-1.5 text-xs font-medium text-white transition active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#30d158]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] px-3.5 py-1.5 text-xs font-medium text-white transition active:scale-95 shadow-sm"
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
            placeholder="Enter another sync code..."
            className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs font-mono text-white placeholder:text-white/40 focus:outline-none focus:border-[#0071e3]"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] px-3 py-2 text-xs font-medium text-white transition"
          >
            <span>Join</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            onClick={onClose}
            className="w-full rounded-full bg-white/[0.08] hover:bg-white/[0.14] py-2.5 text-xs font-medium text-white/80 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
