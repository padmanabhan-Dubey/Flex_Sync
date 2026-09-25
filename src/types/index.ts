export type DeviceType = 'android' | 'chromeos' | 'desktop' | 'tablet';

export interface SyncDevice {
  id: string;
  name: string;
  type: DeviceType;
  os: string;
  batteryLevel?: number;
  isCharging?: boolean;
  isDND?: boolean;
  isOnline: boolean;
  lastSeen: number;
}

export type NotificationCategory =
  | 'message'
  | 'email'
  | 'call'
  | 'alert'
  | 'social'
  | 'calendar'
  | 'system';

export type NotificationPriority = 'high' | 'normal' | 'low';

export interface ReplyRecord {
  sender: string;
  text: string;
  timestamp: number;
}

export interface SyncNotification {
  id: string;
  roomCode: string;
  sourceDeviceId: string;
  appName: string;
  packageName?: string;
  title: string;
  body: string;
  timestamp: number;
  category: NotificationCategory;
  priority: NotificationPriority;
  iconUrl?: string;
  avatarUrl?: string;
  isRead: boolean;
  isDismissed: boolean;
  isStarred: boolean;
  isSnoozed: boolean;
  snoozeUntil?: number;
  quickReplies?: string[];
  replyHistory?: ReplyRecord[];
}

export interface ClipboardItem {
  id: string;
  text: string;
  sourceDevice: string;
  timestamp: number;
}

export interface SyncRoomState {
  roomCode: string;
  createdAt: number;
  devices: Record<string, SyncDevice>;
  notifications: SyncNotification[];
  clipboard: ClipboardItem[];
  dndMode: boolean;
  mutedApps: string[];
  ringingDeviceId: string | null;
}

export type NotificationFilter = 'all' | 'unread' | 'starred' | 'snoozed' | 'dismissed';
