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
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-28 pt-20 animate-fade-in px-4">
      {/* Search Section */}
      <div className="pb-3">
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl px-4 py-2.5 shadow-2xs focus-within:shadow-xs transition-shadow border border-slate-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your history, orders, events..."
            className="flex-1 bg-transparent outline-none font-body-md text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white mr-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg font-label-md text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* History List */}
      <div className="flex flex-col gap-5">
        {filteredScans.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
              search_off
            </span>
            <p className="font-headline-md text-base text-slate-900 dark:text-white font-bold">No matching records</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Try adjusting your search query or filter category.
            </p>
          </div>
        ) : (
          <>
            {/* Group: Today */}
            {todayScans.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-label-md text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                  Today
                </h3>
                {todayScans.map((scan) => renderHistoryItem(scan))}
              </div>
            )}

            {/* Group: Yesterday */}
            {yesterdayScans.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-label-md text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                  Yesterday
                </h3>
                {yesterdayScans.map((scan) => renderHistoryItem(scan))}
              </div>
            )}

            {/* Group: Earlier */}
            {earlierScans.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-label-md text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
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
        <div className="absolute inset-0 bg-rose-600 rounded-xl flex items-center justify-end pr-6">
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
          className={`bg-white dark:bg-slate-900 rounded-xl p-3 flex gap-3 shadow-2xs border border-slate-200 dark:border-slate-800 items-center relative transition-transform duration-300 cursor-pointer hover:shadow-xs ${
            isSwiped ? "-translate-x-20" : "translate-x-0"
          }`}
        >
          <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img
              src={scan.imageUrl}
              alt={scan.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-xs">
              <div className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
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
              <span className="font-label-sm text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                {scan.category}
              </span>
              <span className="text-[10px] text-slate-400">
                {new Date(scan.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <h4 className="font-body-md text-sm font-semibold text-slate-900 dark:text-white truncate">
              {scan.title}
            </h4>
            <div className="flex items-center justify-between mt-0.5 gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {scan.insights[0]?.subtitle || scan.rawText || "Extracted Item"}
              </span>
              <span className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
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
