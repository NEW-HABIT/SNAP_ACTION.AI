import React, { useState } from "react";

interface LiveMapTrackingCardProps {
  locationName: string;
  trackingNumber?: string;
  title: string;
}

export const LiveMapTrackingCard: React.FC<LiveMapTrackingCardProps> = ({
  locationName,
  trackingNumber,
  title,
}) => {
  const [copied, setCopied] = useState(false);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  const query = encodeURIComponent(locationName || title);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${query}&t=${mapType === "satellite" ? "k" : ""}&z=14&ie=UTF8&iwloc=&output=embed`;
  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(locationName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg space-y-0 my-3">
      {/* Live Map Header Bar */}
      <div className="px-3 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <span>🗺️</span> Live Map & Location Tracking
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapType(mapType === "roadmap" ? "satellite" : "roadmap")}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors border ${
              mapType === "satellite"
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
            title="Toggle Satellite / Road Map"
          >
            {mapType === "satellite" ? "🛰️ Satellite" : "🗺️ Map"}
          </button>
        </div>
      </div>

      {/* Embedded Google Maps Frame */}
      <div className="relative w-full h-48 bg-slate-950 border-b border-slate-800">
        <iframe
          title={`Map for ${locationName}`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapEmbedUrl}
          className="w-full h-full filter brightness-95 contrast-105"
        />

        {/* Floating Tracking Pin Badge */}
        <div className="absolute top-2 left-2 z-10 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-md text-[11px] text-white flex items-center gap-1.5 max-w-[85%]">
          <span className="text-blue-400">📍</span>
          <span className="font-semibold truncate">{locationName}</span>
        </div>

        {trackingNumber && (
          <div className="absolute bottom-2 left-2 z-10 bg-blue-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-blue-800/80 text-[10px] text-blue-300 font-mono font-bold flex items-center gap-1">
            <span>📦</span> Tracking: {trackingNumber}
          </div>
        )}
      </div>

      {/* Map Action Toolbar */}
      <div className="p-2.5 bg-slate-950/90 flex items-center gap-2">
        <button
          onClick={handleCopyAddress}
          className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>{copied ? "✓ Copied" : "📋 Copy Address"}</span>
        </button>

        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
        >
          <span>🚀 Open in Google Maps</span>
        </a>
      </div>
    </div>
  );
};
