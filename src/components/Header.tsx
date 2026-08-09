import React from "react";
import { DeviceInfo } from "../types";

interface HeaderProps {
  title: string;
  roomCode: string;
  activeDevices: DeviceInfo[];
  isOnline: boolean;
  onOpenRoomModal: () => void;
  onBack?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  roomCode,
  activeDevices,
  isOnline,
  onOpenRoomModal,
  onBack,
  isDarkMode = false,
  onToggleDarkMode,
  searchQuery = "",
  setSearchQuery,
}) => {
  const onlineCount = activeDevices.filter((d) => d.isOnline).length || 1;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-200 shadow-md">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Page Title */}
        <div className="flex items-center gap-3 shrink-0">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-800 transition-colors text-white"
              aria-label="Back"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-blue-500/20">
                ⚡
              </div>
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-base sm:text-lg text-white font-bold leading-tight tracking-tight">
                {title}
              </h1>
              <span className="bg-blue-950/80 text-blue-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-800/50 hidden sm:inline-flex items-center gap-1">
                <span>✨</span> Smart Vision
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isOnline ? "bg-emerald-400" : "bg-amber-400"
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isOnline ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              Cloud Sync Active
            </span>
          </div>
        </div>

        {/* Center Search Input (Desktop) */}
        {setSearchQuery && (
          <div className="hidden md:flex flex-1 max-w-md items-center relative">
            <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions, orders, events, locations..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs outline-none focus:border-blue-500 text-white placeholder-slate-400 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Right Tools & Sync Pill */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-amber-400 hover:bg-slate-800 transition-all text-xs flex items-center justify-center shadow-xs"
              title="Toggle Dark / Light Theme"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDarkMode ? "light_mode" : "dark_mode"}
              </span>
            </button>
          )}

          {/* Room Sync Selector Button */}
          <button
            onClick={onOpenRoomModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-label-sm text-[12px] font-medium transition-all shadow-xs active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-400">sync</span>
            <span className="text-slate-400 hidden sm:inline">Sync Room:</span>
            <span className="font-bold text-blue-400 font-mono">
              {roomCode}
            </span>
            <span className="ml-1 bg-blue-950 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-semibold">
              {onlineCount} {onlineCount === 1 ? "device" : "devices"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

