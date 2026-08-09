import React, { useState } from "react";
import { ScanItem, CategoryType } from "../types";

interface HistoryViewProps {
  scans: ScanItem[];
  onSelectScan: (scan: ScanItem) => void;
  onDeleteScan: (scanId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [swipedScanId, setSwipedScanId] = useState<string | null>(null);

  const categories: { id: CategoryType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "events", label: "Events" },
    { id: "payments", label: "Payments" },
    { id: "orders", label: "Orders" },
    { id: "locations", label: "Locations" },
    { id: "tasks", label: "Tasks" },
    { id: "flights", label: "Flights" },
  ];

  // Filter Scans
  const filteredScans = scans.filter((scan) => {
    const matchesCategory =
      selectedCategory === "all" || scan.category === selectedCategory;
    const matchesSearch =
      scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.rawText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.insights.some((i) =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  // Group by Today, Yesterday, Earlier
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isYesterday = (dateStr: string) => {
    const d = new Date(dateStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()
    );
  };

  const todayScans = filteredScans.filter((s) => isToday(s.timestamp));
  const yesterdayScans = filteredScans.filter((s) => isYesterday(s.timestamp));
  const earlierScans = filteredScans.filter(
    (s) => !isToday(s.timestamp) && !isYesterday(s.timestamp)
  );

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-28 pt-20 animate-fade-in">
      {/* Search Section */}
      <div className="px-4 pb-3">
        <div className="flex items-center bg-[#FFFFFF] rounded-xl px-4 py-2.5 shadow-2xs focus-within:shadow-xs transition-shadow border border-[#E2E8F0]">
          <span className="material-symbols-outlined text-[#64748B] mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your information..."
            className="flex-1 bg-transparent outline-none font-body-md text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#94A3B8] hover:text-[#0F172A] mr-1"
            >
              ✕
            </button>
          )}
          <span className="material-symbols-outlined text-[#2563EB] bg-[#DBEAFE] rounded-lg p-1.5 cursor-pointer hover:bg-[#BFDBFE] transition-colors text-[18px]">
            mic
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                  : "bg-[#FFFFFF] text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* History List */}
      <div className="flex flex-col gap-5 px-4">
        {filteredScans.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-8 text-center border border-[#E2E8F0] shadow-2xs">
            <span className="material-symbols-outlined text-4xl text-[#94A3B8] mb-2">
              search_off
            </span>
            <p className="font-headline-md text-base text-[#0F172A]">No matching records</p>
            <p className="text-xs text-[#64748B] mt-1">
              Try adjusting your search query or filter category.
            </p>
          </div>
        ) : (
          <>
            {/* Group: Today */}
            {todayScans.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-label-md text-xs font-bold text-[#64748B] uppercase tracking-wider px-1">
                  Today
                </h3>
                {todayScans.map((scan) => renderHistoryItem(scan))}
              </div>
            )}

            {/* Group: Yesterday */}
            {yesterdayScans.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-label-md text-xs font-bold text-[#64748B] uppercase tracking-wider px-1">
                  Yesterday
                </h3>
                {yesterdayScans.map((scan) => renderHistoryItem(scan))}
              </div>
            )}

            {/* Group: Earlier */}
            {earlierScans.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-label-md text-xs font-bold text-[#64748B] uppercase tracking-wider px-1">
                  Earlier
                </h3>
                {earlierScans.map((scan) => renderHistoryItem(scan))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  function renderHistoryItem(scan: ScanItem) {
    const isSwiped = swipedScanId === scan.id;

    return (
      <div key={scan.id} className="relative overflow-hidden rounded-xl">
        {/* Background Delete Action */}
        <div className="absolute inset-0 bg-[#EF4444] rounded-xl flex items-center justify-end pr-6">
          <button
            onClick={() => onDeleteScan(scan.id)}
            className="flex flex-col items-center gap-1 text-white text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">delete</span>
            <span>Delete</span>
          </button>
        </div>

        {/* Foreground Card */}
        <div
          onClick={() => onSelectScan(scan)}
          className={`bg-[#FFFFFF] rounded-xl p-3 flex gap-3 shadow-2xs border border-[#E2E8F0] items-center relative transition-transform duration-300 cursor-pointer hover:shadow-xs ${
            isSwiped ? "-translate-x-20" : "translate-x-0"
          }`}
        >
          <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
            <img
              src={scan.imageUrl}
              alt={scan.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs">
              <div className="bg-[#2563EB] text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                <span className="material-symbols-outlined text-[10px]">
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
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-label-sm text-[10px] font-bold text-[#2563EB] uppercase">
                {scan.category}
              </span>
              <span className="text-[10px] text-[#94A3B8]">
                {new Date(scan.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h4 className="font-body-md text-sm font-semibold text-[#0F172A] truncate">
              {scan.title}
            </h4>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[11px] text-[#64748B] truncate max-w-[180px]">
                {scan.insights[0]?.subtitle || scan.rawText || "Extracted Item"}
              </span>
              <span className="text-[10px] text-[#1E40AF] font-semibold bg-[#DBEAFE] px-1.5 py-0.5 rounded">
                {scan.deviceInfo?.deviceName || "Synced"}
              </span>
            </div>
          </div>

          {/* Swipe toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSwipedScanId(isSwiped ? null : scan.id);
            }}
            className="text-[#94A3B8] hover:text-[#0F172A] p-1"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isSwiped ? "close" : "more_vert"}
            </span>
          </button>
        </div>
      </div>
    );
  }
};
