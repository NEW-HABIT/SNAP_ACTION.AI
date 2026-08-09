export type CategoryType = 'all' | 'events' | 'payments' | 'orders' | 'locations' | 'tasks' | 'flights';

export interface InsightItem {
  id: string;
  type: 'event' | 'payment' | 'order' | 'location' | 'task' | 'flight';
  title: string;
  subtitle: string;
  date?: string;
  time?: string;
  location?: string;
  trackingNumber?: string;
  amount?: string;
  actionLabel: string;
  actionType: 'tracking' | 'calendar' | 'maps' | 'expense' | 'todo';
  completed?: boolean;
}

export interface ScanItem {
  id: string;
  title: string;
  imageUrl: string;
  category: CategoryType;
  timestamp: string;
  roomCode: string;
  status: 'analyzing' | 'completed' | 'failed';
  confidence: number;
  rawText?: string;
  insights: InsightItem[];
  deviceInfo?: {
    deviceName: string;
    deviceType: string;
  };
  userId?: string;
  createdAt?: number;
}

export interface DeviceInfo {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  lastActive: string;
  roomCode: string;
  isOnline: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'payment' | 'order' | 'location' | 'task' | 'flight' | 'sync';
  timestamp: string;
  read: boolean;
  roomCode: string;
}

export type ActiveTab = 'home' | 'history' | 'notifications' | 'settings';
