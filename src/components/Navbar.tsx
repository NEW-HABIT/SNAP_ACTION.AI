import React from "react";
import { ActiveTab } from "../types";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: string }[] = [
    { id: "home", label: "Home", icon: "add_a_photo" },
    { id: "history", label: "History", icon: "history" },
    { id: "notifications", label: "Alerts", icon: "notifications" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg transition-colors">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[64px] py-1 transition-all duration-200 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? "font-bold" : ""
                  }`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {tab.icon}
                </span>

                {tab.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white dark:border-slate-900 shadow-2xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-[11px] tracking-tight">
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-1 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
