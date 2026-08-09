import React, { useState, useRef } from "react";
import { ScanItem } from "../types";
import { SAMPLE_SCANS } from "../lib/sampleData";

interface LandingPageProps {
  onAnalyzeImage: (fileOrBase64: string, name?: string, customPrompt?: string) => void;
  recentScans: ScanItem[];
  onSelectScan: (scan: ScanItem) => void;
  isAnalyzing: boolean;
  onViewAllHistory: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onAnalyzeImage,
  recentScans,
  onSelectScan,
  isAnalyzing,
  onViewAllHistory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteUrlModalOpen, setPasteUrlModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onAnalyzeImage(reader.result, file.name, customPrompt);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onAnalyzeImage(reader.result, file.name, customPrompt);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasteUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrlInput.trim()) {
      onAnalyzeImage(imageUrlInput.trim(), "Pasted Image URL", customPrompt);
      setPasteUrlModalOpen(false);
      setImageUrlInput("");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 space-y-12 animate-fade-in">
      {/* SaaS Hero Section */}
      <section className="relative pt-6 pb-4 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Pulsing Hugging Face Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-800/60 text-[#D97706] dark:text-amber-300 text-xs font-bold shadow-xs mb-6 animate-pulse">
          <span className="text-sm">🤗</span>
          <span>Powered by Hugging Face Vision AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
        </div>

        {/* Hero Title */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.15] mb-4">
          Turn Every Screenshot into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#2563EB] via-[#3B82F6] to-[#60A5FA] bg-clip-text text-transparent">
            Instant Autonomous Action.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-body-lg text-base sm:text-lg text-[#64748B] dark:text-slate-300 max-w-2xl leading-relaxed mb-8">
          Upload any screenshot — order confirmations, event invitations, receipts, or maps.
          SnapAction AI extracts calendar `.ics` events, tracking numbers, and location maps instantly.
        </p>

        {/* Quick Custom Prompt Query Bar */}
        <div className="w-full max-w-xl mb-6 bg-white dark:bg-slate-800/90 rounded-2xl p-2 border border-[#E2E8F0] dark:border-slate-700 shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#2563EB] pl-2 text-[20px]">
            auto_awesome
          </span>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Optional custom instruction e.g. 'Extract total amount only'..."
            className="flex-1 bg-transparent text-xs sm:text-sm outline-none text-[#0F172A] dark:text-white placeholder-[#94A3B8]"
          />
          {customPrompt && (
            <button
              onClick={() => setCustomPrompt("")}
              className="text-xs text-[#94A3B8] pr-2 hover:text-[#0F172A]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Upload Dropzone Container */}
        <div className="w-full max-w-2xl">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center w-full h-[240px] sm:h-[260px] bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm cursor-pointer overflow-hidden transition-all duration-200 border-2 border-dashed ${
              dragOver
                ? "border-[#2563EB] bg-[#EFF6FF] dark:bg-slate-800 scale-[1.01]"
                : "border-[#E2E8F0] dark:border-slate-700 hover:border-[#2563EB] hover:bg-[#F8FAFC] dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex flex-col items-center justify-center z-10 space-y-3 text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DBEAFE] dark:bg-blue-950 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-3xl">
                  add_photo_alternate
                </span>
              </div>
              <div>
                <p className="font-headline-md text-lg font-bold text-[#0F172A] dark:text-white mb-1">
                  Upload Screenshot to Analyze
                </p>
                <p className="font-body-sm text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
                  Drag and drop image here or tap to choose file
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </label>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold h-12 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-[20px]">upload</span>
              Choose File from Device
            </button>
            <button
              onClick={() => setPasteUrlModalOpen(true)}
              className="flex-1 bg-white dark:bg-slate-800 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 border border-[#E2E8F0] dark:border-slate-700 text-[#1E293B] dark:text-white font-semibold h-12 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-2xs"
            >
              <span className="material-symbols-outlined text-[20px] text-[#2563EB]">link</span>
              Paste Direct Image URL
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] dark:bg-blue-950 text-[#2563EB] flex items-center justify-center text-xl font-bold">
            🤗
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
            Hugging Face Vision AI
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
            Multi-modal vision analysis parses images using Qwen & Llama 3.2 vision models with precision.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#D1FAE5] dark:bg-emerald-950 text-[#059669] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">calendar_month</span>
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
            Instant `.ICS` & Google Calendar
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
            Extracted event invitations convert directly into downloadable `.ics` calendar files & Google Calendar links.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] dark:bg-rose-950 text-[#DC2626] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">local_shipping</span>
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
            Package Tracking & Maps
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
            Extract tracking numbers for UPS, FedEx, Amazon & open locations instantly in Google Maps.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] dark:bg-indigo-950 text-[#4F46E5] flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">sync</span>
          </div>
          <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
            Realtime Multi-Device Sync
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
            Snapshots and extracted insights sync live across your phone, tablet, and desktop browser.
          </p>
        </div>
      </section>

      {/* Sample Screenshots Shelf */}
      <section className="bg-white dark:bg-slate-800/90 rounded-2xl p-6 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-[#0F172A] dark:text-white flex items-center gap-2">
              <span>⚡</span> Try Sample Screenshots
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Tap any sample image below to see Hugging Face Vision AI extraction in action
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_SCANS.slice(0, 3).map((sample) => (
            <button
              key={sample.id}
              onClick={() => onAnalyzeImage(sample.imageUrl, sample.title, customPrompt)}
              className="group relative flex flex-col bg-[#F8FAFC] dark:bg-slate-800/90 rounded-xl p-3 border border-[#E2E8F0] dark:border-slate-700 hover:border-[#2563EB] hover:shadow-md transition-all text-left overflow-hidden active:scale-95"
            >
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 mb-2 relative">
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white bg-black/70 px-2 py-0.5 rounded-md font-mono font-medium">
                    {sample.category}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0F172A] dark:text-white line-clamp-1">
                {sample.title}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-slate-400 line-clamp-1 mt-0.5">
                {sample.insights[0]?.subtitle || sample.summary}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Realtime Recent Scans Activity Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-[#0F172A] dark:text-white">
              Recent Synced Activity
            </h2>
            <span className="bg-[#DBEAFE] dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <button
            onClick={onViewAllHistory}
            className="text-[#2563EB] text-xs font-semibold flex items-center gap-1 hover:underline"
          >
            View all history <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentScans.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              <span className="material-symbols-outlined text-4xl text-[#94A3B8] mb-2">
                history
              </span>
              <p className="text-sm font-semibold text-[#0F172A] dark:text-white">No scans yet</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Upload a screenshot or pick a sample above to get started.
              </p>
            </div>
          ) : (
            recentScans.slice(0, 6).map((scan) => (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-2xs border border-[#E2E8F0] dark:border-slate-700 flex items-center gap-3 relative overflow-hidden group hover:border-[#2563EB] hover:shadow-xs transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700 relative border border-[#E2E8F0] dark:border-slate-700">
                  <img
                    src={scan.imageUrl}
                    alt={scan.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                    {scan.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px] text-[#2563EB]">
                      {scan.category === "events"
                        ? "event"
                        : scan.category === "orders"
                        ? "local_shipping"
                        : scan.category === "payments"
                        ? "payments"
                        : scan.category === "locations"
                        ? "location_on"
                        : "check_circle"}
                    </span>
                    <span className="truncate">
                      {scan.insights.length > 0
                        ? scan.insights[0].subtitle || scan.insights[0].title
                        : scan.category}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-[10px] text-[#94A3B8]">
                    {new Date(scan.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1E40AF] dark:text-blue-300 bg-[#DBEAFE] dark:bg-blue-950 px-1.5 py-0.5 rounded mt-1">
                    {scan.confidence}% AI
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Paste URL Modal */}
      {pasteUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E2E8F0] dark:border-slate-700 animate-scale-up">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">
              Paste Image URL
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-4">
              Enter a direct image link to perform Hugging Face Vision AI extraction.
            </p>
            <form onSubmit={handlePasteUrlSubmit} className="space-y-4">
              <input
                type="url"
                required
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/screenshot.jpg"
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-slate-700 border border-[#E2E8F0] dark:border-slate-600 rounded-xl text-sm outline-none focus:border-[#2563EB] text-[#0F172A] dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasteUrlModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]"
                >
                  Analyze Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
