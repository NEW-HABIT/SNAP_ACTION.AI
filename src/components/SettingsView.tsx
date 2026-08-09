import React, { useState } from "react";
import { DeviceInfo } from "../types";

interface SettingsViewProps {
  deviceName: string;
  setDeviceName: (name: string) => void;
  roomCode: string;
  setRoomCode: (code: string) => void;
  activeDevices: DeviceInfo[];
  isOnline: boolean;
  onSeedSampleData: () => void;
  onClearHistory: () => void;
  onOpenQRModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  deviceName,
  setDeviceName,
  roomCode,
  setRoomCode,
  activeDevices,
  isOnline,
  onSeedSampleData,
  onClearHistory,
  onOpenQRModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState(roomCode);
  const [webhookInput, setWebhookInput] = useState<string>(
    () => localStorage.getItem("WEBHOOK_URL") || ""
  );
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState<boolean>(
    () => localStorage.getItem("PRIVACY_SHIELD_ENABLED") === "true"
  );
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyRoomCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomInput.trim()) {
      setRoomCode(newRoomInput.trim().toLowerCase());
    }
  };

  const generateRandomRoom = () => {
    const code = "room-" + Math.floor(1000 + Math.random() * 9000);
    setNewRoomInput(code);
    setRoomCode(code);
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("WEBHOOK_URL", webhookInput.trim());
    setTestWebhookStatus("Saved Webhook URL!");
    setTimeout(() => setTestWebhookStatus(null), 2500);
  };

  const handleTogglePrivacyShield = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPrivacyShieldEnabled(enabled);
    localStorage.setItem("PRIVACY_SHIELD_ENABLED", enabled ? "true" : "false");
  };

  const handleTestWebhook = async () => {
    if (!webhookInput.trim()) {
      setTestWebhookStatus("⚠️ Please enter a Webhook URL first!");
      return;
    }
    setTestWebhookStatus("Testing Webhook dispatch...");
    try {
      const res = await fetch("/api/dispatch-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: webhookInput.trim(),
          payload: {
            event: "test_ping",
            timestamp: new Date().toISOString(),
            message: "Test webhook dispatch from Screenshot to Action!",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestWebhookStatus("✓ Webhook connection successful!");
      } else {
        setTestWebhookStatus(`❌ Webhook error: ${data.error || "Failed"}`);
      }
    } catch (err: any) {
      setTestWebhookStatus(`❌ Network error: ${err.message || "Failed"}`);
    }
    setTimeout(() => setTestWebhookStatus(null), 4000);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-28 pt-24 px-4 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">
          Settings & Sync
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage sync room, privacy shield, webhooks, and connected devices
        </p>
      </div>

      {/* Smart AI Engine Status Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 text-blue-400 flex items-center justify-center text-xl font-bold">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                AI Vision Assistant
              </h3>
              <p className="text-xs text-slate-400">
                Ready to analyze your screenshots
              </p>
            </div>
          </div>
          <span className="bg-emerald-950 text-emerald-300 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase border border-emerald-800/50 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Assistant Status</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              ✓ Ready for Analysis
            </span>
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Analysis Mode</span>
            <span className="font-semibold text-blue-400">
              High Accuracy Mode
            </span>
          </div>
        </div>
      </div>

      {/* 🛡️ Smart Privacy Shield (PII Redaction) */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/50 text-indigo-400 flex items-center justify-center text-lg font-bold">
              🛡️
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Smart Privacy Shield
              </h3>
              <p className="text-xs text-slate-400">
                Client-side PII redaction before uploading images to AI
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={privacyShieldEnabled}
              onChange={handleTogglePrivacyShield}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed pt-1">
          When enabled, credit card numbers, SSNs, and sensitive card fields are automatically blurred/obscured locally on canvas before sending base64 to AI.
        </p>
      </div>

      {/* 🚀 Direct API & Webhook Dispatcher Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-400 text-[18px]">webhook</span>
            <span>Direct API & Webhook Dispatcher</span>
          </h3>
          <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded-full font-semibold border border-indigo-800/50">
            Zapier / Notion / Make
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Configure a custom Webhook URL to dispatch extracted JSON entity payloads directly to Notion, Zapier, Airtable, or custom endpoints.
        </p>

        <form onSubmit={handleSaveWebhook} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={webhookInput}
              onChange={(e) => setWebhookInput(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="flex-1 px-3.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs outline-none focus:border-indigo-500 text-white placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-md shrink-0"
            >
              Save URL
            </button>
            <button
              type="button"
              onClick={handleTestWebhook}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl active:scale-95 transition-all shrink-0"
            >
              🧪 Test
            </button>
          </div>
          {testWebhookStatus && (
            <p className="text-xs font-semibold text-indigo-400 animate-fade-in">
              {testWebhookStatus}
            </p>
          )}
        </form>
      </div>

      {/* Cloud Sync Status Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">cloud_done</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Cloud Sync Status</h3>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected & Synchronized
            </span>
          </div>
        </div>
        <span className="bg-blue-950 text-blue-300 text-[10px] font-semibold px-3 py-1 rounded-full uppercase border border-blue-800/50">
          Live
        </span>
      </div>

      {/* Room Sync & Multi-Device Pairing */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-[18px]">sync_alt</span>
            <span>Sync Room Code</span>
          </h3>
          <span className="text-xs text-blue-400 font-bold font-mono bg-blue-950 px-3 py-1 rounded-full border border-blue-800/50">
            {roomCode}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Devices using the same Sync Room Code will instantly receive real-time uploads, actions, and updates.
        </p>

        <form onSubmit={handleApplyRoomCode} className="flex gap-2">
          <input
            type="text"
            value={newRoomInput}
            onChange={(e) => setNewRoomInput(e.target.value)}
            placeholder="Enter room code (e.g. office-123)"
            className="flex-1 px-3.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs font-mono outline-none focus:border-blue-500 text-white placeholder-slate-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all shadow-md"
          >
            Join Room
          </button>
          <button
            type="button"
            onClick={generateRandomRoom}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl active:scale-95 transition-all"
            title="Generate Random Room Code"
          >
            🎲 New
          </button>
        </form>

        {/* Share Sync Link & QR Code */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Share Sync Link with another device:
            </span>
            <button
              onClick={onOpenQRModal}
              className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>📱 Show QR Code</span>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-[11px] text-slate-400 outline-none truncate pl-1 font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shrink-0"
            >
              {copied ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>

      {/* Device Name Settings */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">devices</span>
          <span>Device Profile</span>
        </h3>
        <div>
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">Device Name</label>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs font-medium outline-none focus:border-blue-500 text-white"
          />
        </div>

        {/* Active Connected Devices List */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-300 block mb-2.5">
            Active Connected Devices ({activeDevices.length}):
          </span>
          <div className="space-y-2">
            {activeDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl text-xs border border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">
                    {device.deviceType === "mobile"
                      ? "smartphone"
                      : device.deviceType === "tablet"
                      ? "tablet"
                      : "desktop_windows"}
                  </span>
                  <span className="font-semibold text-white">
                    {device.deviceName}
                  </span>
                  {device.id === deviceName && (
                    <span className="text-[10px] text-blue-300 bg-blue-950 px-2 py-0.5 rounded-full font-semibold border border-blue-800/50">
                      This Device
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/50">
                  Online
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Database Operations */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/80 shadow-lg space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-blue-400 text-[18px]">folder_delete</span>
          <span>Storage & Reset</span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClearHistory}
            className="w-full px-4 py-2.5 bg-rose-950/80 text-rose-300 hover:bg-rose-900/80 text-xs font-semibold rounded-xl transition-all border border-rose-800/50 shadow-xs flex items-center justify-center gap-2"
          >
            🗑️ Clear History & Saved Data
          </button>
        </div>
      </div>
    </div>
  );
};



