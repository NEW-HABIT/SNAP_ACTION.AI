import { ScanItem, DeviceInfo, AppNotification } from "../types";

const SCANS_KEY = "screenshot_to_action_scans";
const DEVICES_KEY = "screenshot_to_action_devices";
const NOTIFS_KEY = "screenshot_to_action_notifications";

// Create a BroadcastChannel for instant cross-tab sync
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("app_sync_channel") : null;

type Listener<T> = (data: T[]) => void;
const scanListeners: Set<{ roomCode: string; callback: Listener<ScanItem> }> = new Set();
const deviceListeners: Set<{ roomCode: string; callback: Listener<DeviceInfo> }> = new Set();
const notifListeners: Set<{ roomCode: string; callback: Listener<AppNotification> }> = new Set();

function getStored<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStored<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    if (channel) {
      channel.postMessage({ type: key });
    }
  } catch (e) {
    console.error("Storage save error", e);
  }
}

function notifyScans() {
  const allScans = getStored<ScanItem>(SCANS_KEY);
  scanListeners.forEach(({ roomCode, callback }) => {
    const roomScans = allScans.filter((s) => s.roomCode === roomCode || !s.roomCode || roomCode === "default");
    roomScans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(roomScans);
  });
}

function notifyDevices() {
  const allDevices = getStored<DeviceInfo>(DEVICES_KEY);
  const now = Date.now();
  // Filter out inactive devices older than 25 seconds
  const activeOnly = allDevices.filter(
    (d) => d.lastActive && now - new Date(d.lastActive).getTime() < 25000
  );
  if (activeOnly.length !== allDevices.length) {
    setStored(DEVICES_KEY, activeOnly);
  }
  deviceListeners.forEach(({ roomCode, callback }) => {
    const roomDevices = activeOnly.filter(
      (d) => d.roomCode === roomCode || !d.roomCode || roomCode === "default"
    );
    callback(roomDevices);
  });
}

function notifyNotifications() {
  const allNotifs = getStored<AppNotification>(NOTIFS_KEY);
  notifListeners.forEach(({ roomCode, callback }) => {
    const roomNotifs = allNotifs.filter((n) => n.roomCode === roomCode || !n.roomCode || roomCode === "default");
    roomNotifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(roomNotifs);
  });
}

// Background sync with Vercel API endpoint for cross-device room sync
let syncInterval: any = null;

function startServerSync(roomCode: string) {
  if (syncInterval) clearInterval(syncInterval);

  const fetchRemoteSync = async () => {
    try {
      const res = await fetch(`/api/room/sync?roomCode=${encodeURIComponent(roomCode || "default")}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        // Merge remote scans
        if (Array.isArray(data.scans) && data.scans.length > 0) {
          const localScans = getStored<ScanItem>(SCANS_KEY);
          const scanMap = new Map<string, ScanItem>();
          localScans.forEach((s) => scanMap.set(s.id, s));
          data.scans.forEach((s: ScanItem) => scanMap.set(s.id, s));
          setStored(SCANS_KEY, Array.from(scanMap.values()));
          notifyScans();
        }

        // Merge remote devices
        if (Array.isArray(data.devices)) {
          setStored(DEVICES_KEY, data.devices);
          notifyDevices();
        }

        // Merge remote notifications
        if (Array.isArray(data.notifications)) {
          setStored(NOTIFS_KEY, data.notifications);
          notifyNotifications();
        }
      }
    } catch {
      // Ignore network errors when offline
    }
  };

  fetchRemoteSync();
  syncInterval = setInterval(fetchRemoteSync, 4000);
}

if (channel) {
  channel.onmessage = () => {
    notifyScans();
    notifyDevices();
    notifyNotifications();
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", () => {
    notifyScans();
    notifyDevices();
    notifyNotifications();
  });
}

export function subscribeToScans(
  roomCode: string,
  callback: (scans: ScanItem[]) => void
) {
  const entry = { roomCode: roomCode || "default", callback };
  scanListeners.add(entry);
  notifyScans();
  startServerSync(roomCode);
  return () => {
    scanListeners.delete(entry);
  };
}

export async function saveScanToFirestore(scan: ScanItem): Promise<void> {
  const scans = getStored<ScanItem>(SCANS_KEY);
  const idx = scans.findIndex((s) => s.id === scan.id);
  const updated = { ...scan, createdAt: scan.createdAt || Date.now() };
  if (idx >= 0) {
    scans[idx] = updated;
  } else {
    scans.unshift(updated);
  }
  setStored(SCANS_KEY, scans);
  notifyScans();

  // Async push to backend server for cross-device sync
  fetch("/api/room/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode: scan.roomCode || "default", scan: updated }),
  }).catch(() => {});
}

export async function updateScanInFirestore(
  scanId: string,
  updates: Partial<ScanItem>
): Promise<void> {
  const scans = getStored<ScanItem>(SCANS_KEY);
  const idx = scans.findIndex((s) => s.id === scanId);
  if (idx >= 0) {
    const updated = { ...scans[idx], ...updates };
    scans[idx] = updated;
    setStored(SCANS_KEY, scans);
    notifyScans();

    fetch("/api/room/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode: updated.roomCode || "default", scan: updated }),
    }).catch(() => {});
  }
}

export async function deleteScanFromFirestore(scanId: string): Promise<void> {
  const scans = getStored<ScanItem>(SCANS_KEY);
  const target = scans.find((s) => s.id === scanId);
  const filtered = scans.filter((s) => s.id !== scanId);
  setStored(SCANS_KEY, filtered);
  notifyScans();

  fetch("/api/room/delete-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode: target?.roomCode || "default", scanId }),
  }).catch(() => {});
}

export function subscribeToDevices(
  roomCode: string,
  callback: (devices: DeviceInfo[]) => void
) {
  const entry = { roomCode: roomCode || "default", callback };
  deviceListeners.add(entry);
  notifyDevices();
  return () => {
    deviceListeners.delete(entry);
  };
}

export async function sendDeviceHeartbeat(device: DeviceInfo): Promise<void> {
  const devices = getStored<DeviceInfo>(DEVICES_KEY);
  const now = Date.now();
  // Filter out stale device heartbeats older than 25 seconds
  const activeDevices = devices.filter(
    (d) => d.id === device.id || (d.lastActive && now - new Date(d.lastActive).getTime() < 25000)
  );
  const idx = activeDevices.findIndex((d) => d.id === device.id);
  const updated = { ...device, lastActive: new Date().toISOString(), isOnline: true };
  if (idx >= 0) {
    activeDevices[idx] = updated;
  } else {
    activeDevices.push(updated);
  }
  setStored(DEVICES_KEY, activeDevices);
  notifyDevices();

  fetch("/api/room/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode: device.roomCode || "default", device: updated }),
  }).catch(() => {});
}

export function subscribeToNotifications(
  roomCode: string,
  callback: (notifications: AppNotification[]) => void
) {
  const entry = { roomCode: roomCode || "default", callback };
  notifListeners.add(entry);
  notifyNotifications();
  return () => {
    notifListeners.delete(entry);
  };
}

export async function addNotificationToFirestore(
  notification: AppNotification
): Promise<void> {
  const notifs = getStored<AppNotification>(NOTIFS_KEY);
  const idx = notifs.findIndex((n) => n.id === notification.id);
  if (idx >= 0) {
    notifs[idx] = notification;
  } else {
    notifs.unshift(notification);
  }
  setStored(NOTIFS_KEY, notifs);
  notifyNotifications();

  fetch("/api/room/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode: notification.roomCode || "default", notification }),
  }).catch(() => {});
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const notifs = getStored<AppNotification>(NOTIFS_KEY);
  const idx = notifs.findIndex((n) => n.id === id);
  if (idx >= 0) {
    notifs[idx].read = true;
    setStored(NOTIFS_KEY, notifs);
    notifyNotifications();

    fetch("/api/room/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomCode: notifs[idx].roomCode || "default", action: "read", notificationId: id }),
    }).catch(() => {});
  }
}
