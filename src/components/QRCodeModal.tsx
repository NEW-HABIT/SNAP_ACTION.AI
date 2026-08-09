import React, { useState } from "react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  roomCode,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const roomUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate lightweight SVG QR matrix representation
  const qrGoogleChartUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(roomUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50 text-xs font-semibold">
            <span>📱</span> Zero-Login Phone Sync
          </div>
          <h3 className="text-lg font-bold text-white">Scan to Connect Phone</h3>
          <p className="text-xs text-slate-400">
            Scan this QR code with your mobile camera to instantly upload screenshots to room{" "}
            <span className="font-bold text-blue-400 font-mono">{roomCode}</span>
          </p>
        </div>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl inline-block shadow-inner border-4 border-slate-800">
          <img
            src={qrGoogleChartUrl}
            alt={`QR Code for Room ${roomCode}`}
            className="w-48 h-48 object-contain rounded-lg"
          />
        </div>

        {/* Action Link & Copy */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={roomUrl}
              className="flex-1 bg-transparent text-[11px] font-mono text-slate-400 outline-none truncate px-1"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shrink-0 active:scale-95 transition-all"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
