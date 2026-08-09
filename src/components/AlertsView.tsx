import React from "react";
import { AppNotification } from "../types";

interface AlertsViewProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onSendTestNotification: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  notifications,
  onMarkRead,
  onClearAll,
  onSendTestNotification,
}) => {
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto pb-28 pt-20 px-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-headline-md text-xl font-bold text-[#0F172A]">
            Alerts & Notifications
          </h2>
          <p className="text-xs text-[#64748B]">
            Real-time multi-device sync alerts
          </p>
        </div>
        <button
          onClick={onSendTestNotification}
          className="bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#BFDBFE] text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 border border-[#BFDBFE]"
        >
          + Send Sync Alert
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-[#E2E8F0] shadow-2xs">
          <span className="material-symbols-outlined text-4xl text-[#94A3B8] mb-2">
            notifications_off
          </span>
          <p className="font-semibold text-sm text-[#0F172A]">No notifications yet</p>
          <p className="text-xs text-[#64748B] mt-1">
            When actions or deliveries update on any synced device, you will see alerts here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 text-xs text-[#64748B]">
            <span>{unread.length} unread alerts</span>
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[#2563EB] hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {notifications.map((note) => (
            <div
              key={note.id}
              onClick={() => onMarkRead(note.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                note.read
                  ? "bg-white border-[#E2E8F0] opacity-80"
                  : "bg-[#F8FAFC] border-[#2563EB]/40 shadow-2xs"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs ${
                  note.type === "event"
                    ? "bg-[#8B5CF6]"
                    : note.type === "order"
                    ? "bg-[#2563EB]"
                    : note.type === "payment"
                    ? "bg-[#EF4444]"
                    : "bg-[#0284C7]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {note.type === "event"
                    ? "event"
                    : note.type === "order"
                    ? "local_shipping"
                    : note.type === "payment"
                    ? "payments"
                    : "sync"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-semibold text-sm text-[#0F172A] truncate">
                    {note.title}
                  </h4>
                  <span className="text-[10px] text-[#94A3B8] shrink-0 ml-2">
                    {new Date(note.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {note.message}
                </p>
              </div>

              {!note.read && (
                <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
