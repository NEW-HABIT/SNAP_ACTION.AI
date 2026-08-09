import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { ScanItem, DeviceInfo, AppNotification } from "../types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom database ID from config
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || "(default)"
);

// Collections
const SCANS_COLLECTION = "scans";
const DEVICES_COLLECTION = "devices";
const NOTIFICATIONS_COLLECTION = "notifications";

/**
 * Realtime listener for Scans by Room Code
 */
export function subscribeToScans(
  roomCode: string,
  callback: (scans: ScanItem[]) => void
) {
  const scansRef = collection(db, SCANS_COLLECTION);
  const q = query(
    scansRef,
    where("roomCode", "==", roomCode || "default")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const scans: ScanItem[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "Untitled Scan",
          imageUrl: data.imageUrl || "",
          category: data.category || "tasks",
          timestamp: data.timestamp || new Date().toISOString(),
          roomCode: data.roomCode || "default",
          status: data.status || "completed",
          confidence: data.confidence || 90,
          rawText: data.rawText || "",
          insights: data.insights || [],
          deviceInfo: data.deviceInfo || { deviceName: "Unknown", deviceType: "desktop" },
          userId: data.userId || "anonymous",
          createdAt: data.createdAt || Date.now(),
        } as ScanItem;
      });

      // Sort in memory by timestamp descending
      scans.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(scans);
    },
    (error) => {
      console.error("Firestore scans listener error:", error);
    }
  );
}

/**
 * Save new scan or overwrite existing
 */
export async function saveScanToFirestore(scan: ScanItem): Promise<void> {
  const scanDocRef = doc(db, SCANS_COLLECTION, scan.id);
  await setDoc(scanDocRef, {
    ...scan,
    createdAt: Date.now(),
  });
}

/**
 * Update scan fields in Firestore
 */
export async function updateScanInFirestore(
  scanId: string,
  updates: Partial<ScanItem>
): Promise<void> {
  const scanDocRef = doc(db, SCANS_COLLECTION, scanId);
  await updateDoc(scanDocRef, updates);
}

/**
 * Delete a scan from Firestore
 */
export async function deleteScanFromFirestore(scanId: string): Promise<void> {
  const scanDocRef = doc(db, SCANS_COLLECTION, scanId);
  await deleteDoc(scanDocRef);
}

/**
 * Realtime listener for Active Devices in room
 */
export function subscribeToDevices(
  roomCode: string,
  callback: (devices: DeviceInfo[]) => void
) {
  const devicesRef = collection(db, DEVICES_COLLECTION);
  const q = query(
    devicesRef,
    where("roomCode", "==", roomCode || "default")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const devices: DeviceInfo[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          deviceName: data.deviceName || "Device",
          deviceType: data.deviceType || "desktop",
          lastActive: data.lastActive || new Date().toISOString(),
          roomCode: data.roomCode || "default",
          isOnline: data.isOnline ?? true,
        };
      });
      callback(devices);
    },
    (error) => {
      console.error("Firestore devices listener error:", error);
    }
  );
}

/**
 * Update device heartbeat
 */
export async function sendDeviceHeartbeat(device: DeviceInfo): Promise<void> {
  const deviceDocRef = doc(db, DEVICES_COLLECTION, device.id);
  await setDoc(
    deviceDocRef,
    {
      ...device,
      lastActive: new Date().toISOString(),
      isOnline: true,
    },
    { merge: true }
  );
}

/**
 * Realtime listener for Notifications
 */
export function subscribeToNotifications(
  roomCode: string,
  callback: (notifications: AppNotification[]) => void
) {
  const notesRef = collection(db, NOTIFICATIONS_COLLECTION);
  const q = query(
    notesRef,
    where("roomCode", "==", roomCode || "default")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: AppNotification[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "Notification",
          message: data.message || "",
          type: data.type || "sync",
          timestamp: data.timestamp || new Date().toISOString(),
          read: data.read ?? false,
          roomCode: data.roomCode || "default",
        };
      });
      notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(notes);
    },
    (error) => {
      console.error("Firestore notifications listener error:", error);
    }
  );
}

/**
 * Add Notification
 */
export async function addNotificationToFirestore(
  notification: AppNotification
): Promise<void> {
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
  await setDoc(docRef, notification);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const docRef = doc(db, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(docRef, { read: true });
}
