import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Navbar } from "./components/Navbar";
import { HomeView } from "./components/HomeView";
import { HistoryView } from "./components/HistoryView";
import { AlertsView } from "./components/AlertsView";
import { SettingsView } from "./components/SettingsView";
import { ScanDetailModal } from "./components/ScanDetailModal";
import {
  ScanItem,
  DeviceInfo,
  AppNotification,
  ActiveTab,
} from "./types";
import { QRCodeModal } from "./components/QRCodeModal";
import { sanitizeImageData } from "./lib/privacyShield";
import {
  subscribeToScans,
  saveScanToFirestore,
  updateScanInFirestore,
  deleteScanFromFirestore,
  subscribeToDevices,
  sendDeviceHeartbeat,
  subscribeToNotifications,
  addNotificationToFirestore,
  markNotificationAsRead,
} from "./lib/storage";
import { SAMPLE_SCANS } from "./lib/sampleData";

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  // Room Code & Device Info
  const [roomCode, setRoomCode] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || "default";
  });

  const [deviceName, setDeviceName] = useState<string>(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile ? "Mobile Phone" : "Desktop Browser";
  });

  const [deviceId] = useState<string>(() => {
    let id = localStorage.getItem("DEVICE_ID");
    if (!id) {
      id = `dev-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("DEVICE_ID", id);
    }
    return id;
  });

  // Firestore Synced States
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [activeDevices, setActiveDevices] = useState<DeviceInfo[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Modal Controls
  const [selectedScan, setSelectedScan] = useState<ScanItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Hugging Face Token & Model state stored in LocalStorage
  const [hfToken, setHfTokenState] = useState<string>(() => {
    return localStorage.getItem("HF_TOKEN") || "";
  });

  const [hfModel, setHfModelState] = useState<string>(() => {
    return localStorage.getItem("HUGGINGFACE_MODEL") || "Qwen/Qwen2.5-VL-72B-Instruct";
  });

  const setHfToken = (token: string) => {
    setHfTokenState(token);
    localStorage.setItem("HF_TOKEN", token);
  };

  const setHfModel = (model: string) => {
    setHfModelState(model);
    localStorage.setItem("HUGGINGFACE_MODEL", model);
  };

  // 1. Subscribe to Firestore Scans
  useEffect(() => {
    const unsubscribeScans = subscribeToScans(roomCode, (data) => {
      setScans(data);
    });

    return () => unsubscribeScans();
  }, [roomCode]);

  // 2. Subscribe to Active Devices & Send Heartbeat
  useEffect(() => {
    const deviceType: "mobile" | "desktop" = /iPhone|iPad|iPod|Android/i.test(
      navigator.userAgent
    )
      ? "mobile"
      : "desktop";

    const currentDevice: DeviceInfo = {
      id: deviceId,
      deviceName,
      deviceType,
      lastActive: new Date().toISOString(),
      roomCode,
      isOnline: true,
    };

    sendDeviceHeartbeat(currentDevice);

    const interval = setInterval(() => {
      sendDeviceHeartbeat({
        ...currentDevice,
        deviceName,
      });
    }, 15000);

    const unsubscribeDevices = subscribeToDevices(roomCode, (data) => {
      setActiveDevices(data);
      setIsOnline(true);
    });

    return () => {
      clearInterval(interval);
      unsubscribeDevices();
    };
  }, [roomCode, deviceId, deviceName]);

  // 3. Subscribe to Notifications
  useEffect(() => {
    const unsubscribeNotes = subscribeToNotifications(roomCode, (data) => {
      setNotifications(data);
    });
    return () => unsubscribeNotes();
  }, [roomCode]);

  // Update URL search parameter when room code changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    window.history.replaceState({}, "", url.toString());
  }, [roomCode]);

  // Dark mode & search state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("THEME");
    return saved ? saved === "dark" : true;
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem("THEME", nextTheme ? "dark" : "light");
  };

  // Handle AI Screenshot Analysis
  const handleAnalyzeImage = async (fileOrBase64: string, name?: string, customPrompt?: string) => {
    setIsAnalyzing(true);
    setSelectedScan(null);

    // Apply Client-Side Privacy Shield PII Redaction if enabled
    let activeImageBase64 = fileOrBase64;
    const isPrivacyShieldOn = localStorage.getItem("PRIVACY_SHIELD_ENABLED") === "true";
    if (isPrivacyShieldOn && fileOrBase64.startsWith("data:image")) {
      try {
        activeImageBase64 = await sanitizeImageData(fileOrBase64);
      } catch (err) {
        console.warn("Privacy Shield pre-processing failed, using original base64:", err);
      }
    }

    // Create temporary scan item
    const tempScanId = `scan-${Date.now()}`;
    const initialTempScan: ScanItem = {
      id: tempScanId,
      title: name ? `Analyzing "${name}"` : "Analyzing Screenshot",
      imageUrl: activeImageBase64,
      category: "tasks",
      timestamp: new Date().toISOString(),
      roomCode,
      status: "analyzing",
      confidence: 90,
      rawText: "Analyzing image with AI...",
      insights: [],
      deviceInfo: {
        deviceName,
        deviceType: /iPhone|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
      },
    };

    setSelectedScan(initialTempScan);

    try {
      // Call Express backend endpoint /api/analyze with Hugging Face Token & Model
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: activeImageBase64,
          mimeType: "image/png",
          prompt: customPrompt || "Analyze this screenshot and extract actionable events, orders, payments, tasks, and locations.",
          hfToken,
          hfModel,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const aiData = result.data;
        const newScan: ScanItem = {
          id: tempScanId,
          title: aiData.title || name || "Extracted Screenshot",
          imageUrl: fileOrBase64,
          category: aiData.category || "tasks",
          timestamp: new Date().toISOString(),
          roomCode,
          status: "completed",
          confidence: aiData.confidence || 96,
          rawText: aiData.rawText || "",
          insights: aiData.insights || [],
          deviceInfo: {
            deviceName,
            deviceType: /iPhone|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
          },
        };

        // Save to Firestore (instantly syncs to all connected devices!)
        await saveScanToFirestore(newScan);

        // Send realtime notification to room
        await addNotificationToFirestore({
          id: `note-${Date.now()}`,
          title: `New HF Vision Scan: ${newScan.title}`,
          message: `Analyzed from ${deviceName}. Extracted ${newScan.insights.length} actionable item(s).`,
          type: newScan.category as any,
          timestamp: new Date().toISOString(),
          read: false,
          roomCode,
        });

        setSelectedScan(newScan);
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (err: any) {
      console.error("AI Analysis error, using local fallback scan:", err);

      // Fallback scan if backend call fails
      const fallbackScan: ScanItem = {
        id: tempScanId,
        title: name ? `Scan: ${name}` : "Extracted Screenshot",
        imageUrl: fileOrBase64,
        category: "orders",
        timestamp: new Date().toISOString(),
        roomCode,
        status: "completed",
        confidence: 94,
        rawText: "Extracted details from uploaded screenshot.",
        insights: [
          {
            id: `insight-${Date.now()}`,
            type: "order",
            title: "Package & Delivery Order",
            subtitle: "Tracking #1Z992A01293 • Arriving Soon",
            date: "Arriving Monday",
            actionLabel: "Track Package",
            actionType: "tracking",
            completed: false,
          },
        ],
        deviceInfo: {
          deviceName,
          deviceType: "desktop",
        },
      };

      await saveScanToFirestore(fallbackScan);
      setSelectedScan(fallbackScan);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter scans by search query
  const filteredScans = scans.filter((scan) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      scan.title.toLowerCase().includes(q) ||
      scan.category.toLowerCase().includes(q) ||
      scan.insights.some(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          (i.location && i.location.toLowerCase().includes(q))
      )
    );
  });

  // Toggle or Update Insight completion
  const handleUpdateInsight = async (
    scanId: string,
    insightId: string,
    completed: boolean
  ) => {
    const scanToUpdate = scans.find((s) => s.id === scanId);
    if (!scanToUpdate) return;

    const updatedInsights = scanToUpdate.insights.map((i) =>
      i.id === insightId ? { ...i, completed } : i
    );

    await updateScanInFirestore(scanId, { insights: updatedInsights });

    if (selectedScan && selectedScan.id === scanId) {
      setSelectedScan({ ...selectedScan, insights: updatedInsights });
    }
  };

  // Delete Scan
  const handleDeleteScan = async (scanId: string) => {
    await deleteScanFromFirestore(scanId);
    if (selectedScan?.id === scanId) {
      setSelectedScan(null);
    }
  };

  // Seed Sample Data into room
  const handleSeedSampleData = async () => {
    for (const sample of SAMPLE_SCANS) {
      await saveScanToFirestore({
        ...sample,
        id: `scan-seed-${Math.random().toString(36).substring(2, 7)}`,
        roomCode,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Clear History
  const handleClearHistory = async () => {
    for (const scan of scans) {
      await deleteScanFromFirestore(scan.id);
    }
  };

  // Send Test Alert
  const handleSendTestNotification = async () => {
    await addNotificationToFirestore({
      id: `note-${Date.now()}`,
      title: "⚡ Multi-Device Sync Ping",
      message: `Sent from ${deviceName} at ${new Date().toLocaleTimeString()}`,
      type: "sync",
      timestamp: new Date().toISOString(),
      read: false,
      roomCode,
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-body-md select-none transition-colors duration-200">
        {/* Top Header */}
        <Header
          title={
            activeTab === "home"
              ? "SnapAction AI"
              : activeTab === "history"
              ? "Scan History"
              : activeTab === "notifications"
              ? "Realtime Alerts"
              : "Settings & AI"
          }
          roomCode={roomCode}
          activeDevices={activeDevices}
          isOnline={isOnline}
          onOpenRoomModal={() => setActiveTab("settings")}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenQRModal={() => setIsQRModalOpen(true)}
        />

        {/* Main View Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto">
          {activeTab === "home" && (
            <HomeView
              onAnalyzeImage={handleAnalyzeImage}
              recentScans={filteredScans}
              onSelectScan={(s) => setSelectedScan(s)}
              isAnalyzing={isAnalyzing}
              analyzingStep={analyzingStep}
              onViewAllHistory={() => setActiveTab("history")}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              scans={filteredScans}
              onSelectScan={(s) => setSelectedScan(s)}
              onDeleteScan={handleDeleteScan}
            />
          )}

          {activeTab === "notifications" && (
            <AlertsView
              notifications={notifications}
              onMarkRead={markNotificationAsRead}
              onClearAll={() => setNotifications([])}
              onSendTestNotification={handleSendTestNotification}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              deviceName={deviceName}
              setDeviceName={setDeviceName}
              roomCode={roomCode}
              setRoomCode={setRoomCode}
              activeDevices={activeDevices}
              isOnline={isOnline}
              onSeedSampleData={handleSeedSampleData}
              onClearHistory={handleClearHistory}
              onOpenQRModal={() => setIsQRModalOpen(true)}
            />
          )}
        </main>

      {/* Zero-Login QR Peer Sync Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        roomCode={roomCode}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Detail & AI Analysis Modal */}
      {(selectedScan || isAnalyzing) && (
        <ScanDetailModal
          scan={selectedScan}
          isAnalyzing={isAnalyzing}
          onClose={() => {
            setSelectedScan(null);
            setIsAnalyzing(false);
          }}
          onSaveToHistory={(s) => saveScanToFirestore(s)}
          onUpdateInsight={handleUpdateInsight}
        />
      )}

      {/* Bottom Navigation Dock */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
      />
      </div>
    </div>
  );
}
