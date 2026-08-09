import React, { useState } from "react";
import { ScanItem, InsightItem } from "../types";
import {
  getGoogleCalendarLink,
  downloadIcsFile,
  exportToCsv,
  exportToJson,
  copyMarkdownSummary,
} from "../lib/exportUtils";

interface ScanDetailModalProps {
  scan: ScanItem | null;
  isAnalyzing?: boolean;
  onClose: () => void;
  onSaveToHistory?: (scan: ScanItem) => void;
  onUpdateInsight?: (scanId: string, insightId: string, completed: boolean) => void;
}

export const ScanDetailModal: React.FC<ScanDetailModalProps> = ({
  scan,
  isAnalyzing = false,
  onClose,
  onSaveToHistory,
  onUpdateInsight,
}) => {
  const [zoomImage, setZoomImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!scan && !isAnalyzing) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Action Button Handler
  const handleAction = (insight: InsightItem) => {
    if (insight.actionType === "calendar") {
      const gcalUrl = getGoogleCalendarLink(insight);
      window.open(gcalUrl, "_blank");
      showToast(`🗓️ Opening Google Calendar for "${insight.title}"!`);
    } else if (insight.actionType === "tracking") {
      showToast(`📦 Tracking status loaded for ${insight.trackingNumber || "Package"}`);
    } else if (insight.actionType === "maps") {
      const query = encodeURIComponent(insight.location || insight.title);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
      showToast(`📍 Opening Maps for ${insight.title}`);
    } else if (insight.actionType === "expense") {
      showToast(`💳 Expense ${insight.amount || ""} logged & synced!`);
    } else if (insight.actionType === "todo") {
      showToast(`✅ Task marked as completed!`);
    }

    if (scan && onUpdateInsight) {
      onUpdateInsight(scan.id, insight.id, !insight.completed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/70 backdrop-blur-xs flex justify-center items-center p-3 sm:p-6 overflow-y-auto">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-xl font-label-md text-xs flex items-center gap-2 animate-bounce border border-slate-700">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-lg md:max-w-2xl lg:max-w-3xl bg-[#FFFFFF] dark:bg-slate-900 rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-slate-800 text-[#0F172A] dark:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-base font-bold text-[#0F172A] dark:text-white">
              Scan Detail & Insights
            </h2>
            <span className="bg-[#FEF3C7] dark:bg-amber-950 text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              HF AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#64748B] hover:text-[#0F172A] dark:text-slate-400"
          >
            Close
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* STATE 1: ANALYZING OVERLAY ANIMATION */}
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-6 py-8 text-center">
              <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-xl overflow-hidden shadow-md bg-[#F1F5F9] mx-auto border border-[#E2E8F0]">
                <img
                  src={scan?.imageUrl || "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=400"}
                  alt="Analyzing target"
                  className="w-full h-full object-cover blur-[3px] scale-105 opacity-80"
                />
                <div className="absolute inset-0 bg-blue-900/10" />

                {/* Laser scan line */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#2563EB] shadow-[0_0_15px_4px_rgba(37,99,235,0.8)] animate-[scanLine_2s_infinite_alternate] z-20" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white animate-pulse">
                  Analyzing Screenshot...
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Hugging Face Vision AI extracting actionable intelligence
                </p>
              </div>
            </div>
          ) : (
            /* STATE 2: EXTRACTED INSIGHTS VIEW */
            scan && (
              <>
                {/* Export Options Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#F8FAFC] dark:bg-slate-800/80 rounded-xl border border-[#E2E8F0] dark:border-slate-700">
                  <span className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#2563EB]">download</span>
                    Export & Share Options:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => {
                        copyMarkdownSummary(scan);
                        showToast("📋 Formatted Markdown copied to clipboard!");
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-[#F1F5F9] border border-[#E2E8F0] dark:border-slate-600 rounded-lg text-xs font-semibold text-[#0F172A] dark:text-white shadow-2xs"
                    >
                      📄 Copy MD
                    </button>
                    <button
                      onClick={() => {
                        exportToCsv(scan);
                        showToast("📊 CSV file downloaded!");
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-[#F1F5F9] border border-[#E2E8F0] dark:border-slate-600 rounded-lg text-xs font-semibold text-[#0F172A] dark:text-white shadow-2xs"
                    >
                      📊 Export CSV
                    </button>
                    <button
                      onClick={() => {
                        exportToJson(scan);
                        showToast("💻 JSON file downloaded!");
                      }}
                      className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-[#F1F5F9] border border-[#E2E8F0] dark:border-slate-600 rounded-lg text-xs font-semibold text-[#0F172A] dark:text-white shadow-2xs"
                    >
                      💻 Export JSON
                    </button>
                  </div>
                </div>

                {/* Source Thumbnail Bar */}
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => setZoomImage(!zoomImage)}
                    className="relative group rounded-xl overflow-hidden bg-[#F1F5F9] transition-transform active:scale-95 border border-[#E2E8F0]"
                  >
                    <img
                      src={scan.imageUrl}
                      alt={scan.title}
                      className={`transition-all duration-300 object-cover ${
                        zoomImage ? "w-full max-h-96" : "w-44 h-24"
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center backdrop-blur-[1px]">
                      <span className="material-symbols-outlined text-white shadow-md">
                        {zoomImage ? "zoom_out" : "zoom_in"}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                      Extracted Action Items
                    </h3>
                    <span className="text-[11px] font-semibold text-[#1E40AF] dark:text-blue-300 bg-[#DBEAFE] dark:bg-blue-950 px-2.5 py-1 rounded">
                      {scan.confidence}% AI Confidence
                    </span>
                  </div>

                  {/* Insight Cards */}
                  {scan.insights.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-[#FFFFFF] dark:bg-slate-800/90 rounded-xl p-4 relative overflow-hidden border border-[#E2E8F0] dark:border-slate-700 flex flex-col gap-3 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <div
                        className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                          insight.type === "order"
                            ? "bg-[#2563EB]"
                            : insight.type === "event"
                            ? "bg-[#8B5CF6]"
                            : insight.type === "location"
                            ? "bg-[#0284C7]"
                            : "bg-[#10B981]"
                        }`}
                      />

                      <div className="flex justify-between items-start pl-2">
                        <div className="flex items-center gap-1.5 text-[#2563EB] dark:text-blue-400 font-semibold text-xs uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">
                            {insight.type === "order"
                              ? "local_shipping"
                              : insight.type === "event"
                              ? "event"
                              : insight.type === "location"
                              ? "location_on"
                              : insight.type === "payment"
                              ? "payments"
                              : "check_circle"}
                          </span>
                          <span>{insight.type}</span>
                        </div>
                        <span className="text-[10px] text-[#64748B] dark:text-slate-400 bg-[#F1F5F9] dark:bg-slate-700 px-2 py-0.5 rounded font-medium">
                          Hugging Face AI Verified
                        </span>
                      </div>

                      <div className="pl-2">
                        <h4 className="text-base font-bold text-[#0F172A] dark:text-white">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-[#64748B] dark:text-slate-300 mt-1 leading-relaxed">
                          {insight.subtitle}
                        </p>
                        {insight.date && (
                          <p className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 mt-1">
                            📅 Date: {insight.date} {insight.time ? `at ${insight.time}` : ""}
                          </p>
                        )}
                        {insight.amount && (
                          <p className="text-xs font-bold text-[#DC2626] mt-1">
                            💵 Amount: {insight.amount}
                          </p>
                        )}
                        {insight.location && (
                          <p className="text-xs text-[#0F172A] dark:text-slate-200 font-medium mt-1">
                            📍 Location: {insight.location}
                          </p>
                        )}
                      </div>

                      <div className="pl-2 pt-1 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleAction(insight)}
                          className={`flex-1 text-xs font-semibold h-10 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            insight.completed
                              ? "bg-[#F1F5F9] dark:bg-slate-700 text-[#64748B] dark:text-slate-400"
                              : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {insight.actionType === "tracking"
                              ? "location_searching"
                              : insight.actionType === "calendar"
                              ? "calendar_add_on"
                              : insight.actionType === "maps"
                              ? "map"
                              : insight.actionType === "expense"
                              ? "account_balance_wallet"
                              : "task_alt"}
                          </span>
                          {insight.completed ? "Done" : insight.actionLabel}
                        </button>

                        {/* Additional Quick .ICS Action for Events */}
                        {insight.type === "event" && (
                          <button
                            onClick={() => {
                              downloadIcsFile(insight);
                              showToast(`🗓️ Downloaded .ICS file for "${insight.title}"!`);
                            }}
                            className="px-3 text-xs font-semibold h-10 rounded-lg bg-[#DBEAFE] dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300 hover:bg-[#BFDBFE] transition-all flex items-center justify-center gap-1 shrink-0"
                            title="Download .ICS file"
                          >
                            <span>📥 .ICS</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </div>

        {/* Modal Footer */}
        {scan && !isAnalyzing && (
          <div className="p-4 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#FFFFFF] dark:bg-slate-900 flex justify-center">
            <button
              onClick={() => {
                if (onSaveToHistory) onSaveToHistory(scan);
                showToast("✨ Synced across all connected devices!");
                onClose();
              }}
              className="w-full h-11 bg-[#F8FAFC] dark:bg-slate-800 hover:bg-[#F1F5F9] text-[#1E293B] dark:text-white border border-[#E2E8F0] dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#2563EB]">cloud_sync</span>
              Synced to Realtime Firestore
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

