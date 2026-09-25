import { useEffect, useRef, useState, useCallback } from 'react';
import { SyncDevice, SyncNotification, ClipboardItem, SyncRoomState } from '../types';
import { playNotificationSound, startRingingAlert, stopRingingAlert } from '../utils/audio';
import { showSystemNotification } from '../utils/webNotification';

function detectDevice(): { id: string; name: string; type: SyncDevice['type']; os: string } {
  let id = localStorage.getItem('flexsync_device_id');
  if (!id) {
    id = `dev-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('flexsync_device_id', id);
  }

  const ua = navigator.userAgent;
  let type: SyncDevice['type'] = 'desktop';
  let os = 'Unknown OS';
  let defaultName = 'Dashboard';

  if (/cros/i.test(ua)) {
    type = 'chromeos';
    os = 'Chrome OS Flex';
    defaultName = 'Chrome OS Flex Hub';
  } else if (/android/i.test(ua)) {
    type = 'android';
    os = 'Android Mobile';
    defaultName = 'Android Phone';
  } else if (/ipad|tablet/i.test(ua)) {
    type = 'tablet';
    os = 'Tablet';
    defaultName = 'Tablet Client';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
    defaultName = 'Mac Desktop';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
    defaultName = 'Windows PC';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
    defaultName = 'Linux Workstation';
  }

  const savedName = localStorage.getItem('flexsync_device_name');
  const savedType = localStorage.getItem('flexsync_device_type') as SyncDevice['type'];

  return {
    id,
    name: savedName || defaultName,
    type: savedType || type,
    os,
  };
}

export function useSyncSocket(initialRoomCode: string) {
  const [roomCode, setRoomCode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('room') || urlParams.get('pair');
    return (fromUrl || initialRoomCode || localStorage.getItem('flexsync_room_code') || 'FLEX-101').toUpperCase().trim();
  });

  const [deviceInfo, setDeviceInfo] = useState<SyncDevice>(() => {
    const det = detectDevice();
    const urlParams = new URLSearchParams(window.location.search);
    const forceType = urlParams.get('device') as SyncDevice['type'];
    return {
      id: det.id,
      name: forceType === 'android' ? 'Android Phone' : forceType === 'chromeos' ? 'Chrome OS Flex' : det.name,
      type: forceType || det.type,
      os: forceType === 'android' ? 'Android 14' : forceType === 'chromeos' ? 'Chrome OS Flex' : det.os,
      batteryLevel: 88,
      isCharging: false,
      isDND: false,
      isOnline: true,
      lastSeen: Date.now(),
    };
  });

  const [devices, setDevices] = useState<Record<string, SyncDevice>>({});
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([]);
  const [dndMode, setDndMode] = useState<boolean>(false);
  const [mutedApps, setMutedApps] = useState<string[]>([]);
  const [ringingDeviceId, setRingingDeviceId] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isComponentMounted = useRef(true);

  // Monitor Battery API if supported on device
  useEffect(() => {
    let batteryInstance: any = null;
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        const updateBattery = () => {
          const level = Math.round(battery.level * 100);
          const charging = battery.charging;
          setDeviceInfo((prev) => {
            const next = { ...prev, batteryLevel: level, isCharging: charging };
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'UPDATE_DEVICE',
                  payload: { batteryLevel: level, isCharging: charging },
                })
              );
            }
            return next;
          });
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
      }).catch(() => {});
    }
    return () => {
      if (batteryInstance) {
        // cleanup listeners
      }
    };
  }, []);

  // Save room code to localStorage and URL
  useEffect(() => {
    localStorage.setItem('flexsync_room_code', roomCode);
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomCode);
    window.history.replaceState({}, '', url.toString());
  }, [roomCode]);

  // Connect WebSocket
  const connect = useCallback(() => {
    if (!isComponentMounted.current) return;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    setIsReconnecting(true);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isComponentMounted.current) return;
      setIsConnected(true);
      setIsReconnecting(false);

      // Join room with current device profile
      ws.send(
        JSON.stringify({
          type: 'JOIN_ROOM',
          payload: {
            roomCode,
            device: deviceInfo,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;

        switch (type) {
          case 'ROOM_STATE': {
            const room: SyncRoomState = payload.room;
            setDevices(room.devices || {});
            setNotifications(room.notifications || []);
            setClipboard(room.clipboard || []);
            setDndMode(room.dndMode || false);
            setMutedApps(room.mutedApps || []);
            setRingingDeviceId(room.ringingDeviceId || null);
            break;
          }

          case 'DEVICE_JOINED':
          case 'DEVICE_UPDATED': {
            const dev: SyncDevice = payload.device;
            setDevices((prev) => ({
              ...prev,
              [dev.id]: dev,
            }));
            break;
          }

          case 'DEVICE_LEFT': {
            const { deviceId, lastSeen } = payload;
            setDevices((prev) => {
              if (!prev[deviceId]) return prev;
              return {
                ...prev,
                [deviceId]: {
                  ...prev[deviceId],
                  isOnline: false,
                  lastSeen,
                },
              };
            });
            break;
          }

          case 'NOTIFICATION_ADDED': {
            const notif: SyncNotification = payload.notification;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === notif.id)) return prev;
              return [notif, ...prev];
            });

            // If notification arrived from a remote device, play chime & show OS banner
            if (notif.sourceDeviceId !== deviceInfo.id) {
              if (soundEnabled && !dndMode) {
                playNotificationSound();
              }
              showSystemNotification(`[${notif.appName}] ${notif.title}`, {
                body: notif.body,
                tag: notif.id,
              });
            }
            break;
          }

          case 'NOTIFICATION_DISMISSED': {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.notificationId ? { ...n, isDismissed: true } : n))
            );
            break;
          }

          case 'ALL_NOTIFICATIONS_DISMISSED': {
            setNotifications((prev) => prev.map((n) => ({ ...n, isDismissed: true })));
            break;
          }

          case 'ALL_NOTIFICATIONS_READ': {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            break;
          }

          case 'NOTIFICATION_UPDATED': {
            const updated: SyncNotification = payload.notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updated.id ? updated : n))
            );
            break;
          }

          case 'NOTIFICATION_RESTORED': {
            const restored: SyncNotification = payload.notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === restored.id ? restored : n))
            );
            break;
          }

          case 'CLIPBOARD_UPDATED': {
            setClipboard(payload.clipboard || []);
            break;
          }

          case 'RING_TRIGGERED': {
            setRingingDeviceId(payload.targetDeviceId);
            if (payload.targetDeviceId === deviceInfo.id) {
              startRingingAlert();
            }
            break;
          }

          case 'RING_STOPPED': {
            setRingingDeviceId(null);
            stopRingingAlert();
            break;
          }

          case 'DND_UPDATED': {
            setDndMode(payload.dndMode);
            break;
          }

          case 'APP_FILTERS_UPDATED': {
            setMutedApps(payload.mutedApps || []);
            break;
          }
        }
      } catch (err) {
        console.error('Failed to parse WS incoming message:', err);
      }
    };

    ws.onclose = () => {
      if (!isComponentMounted.current) return;
      setIsConnected(false);
      setIsReconnecting(true);
      // Auto reconnect
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = (err) => {
      console.warn('WebSocket connection error:', err);
      ws.close();
    };
  }, [roomCode, deviceInfo, soundEnabled, dndMode]);

  useEffect(() => {
    isComponentMounted.current = true;
    connect();

    return () => {
      isComponentMounted.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
      stopRingingAlert();
    };
  }, [connect]);

  // Actions
  const sendWs = (type: string, payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  };

  const changeRoomCode = (newCode: string) => {
    const formatted = newCode.toUpperCase().trim();
    if (formatted && formatted !== roomCode) {
      setRoomCode(formatted);
    }
  };

  const updateDeviceProfile = (updates: Partial<SyncDevice>) => {
    const updated = { ...deviceInfo, ...updates };
    setDeviceInfo(updated);
    if (updates.name) localStorage.setItem('flexsync_device_name', updates.name);
    if (updates.type) localStorage.setItem('flexsync_device_type', updates.type);
    sendWs('UPDATE_DEVICE', updates);
  };

  const pushNotification = (notif: Omit<SyncNotification, 'id' | 'roomCode' | 'timestamp' | 'isRead' | 'isDismissed' | 'isStarred' | 'isSnoozed'>) => {
    const newNotif: SyncNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomCode,
      sourceDeviceId: deviceInfo.id,
      timestamp: Date.now(),
      isRead: false,
      isDismissed: false,
      isStarred: false,
      isSnoozed: false,
      replyHistory: [],
    };

    // Optimistic local update
    setNotifications((prev) => [newNotif, ...prev]);
    sendWs('NEW_NOTIFICATION', newNotif);
  };

  const dismissNotification = (id: string) => {
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDismissed: true } : n))
    );
    sendWs('DISMISS_NOTIFICATION', { notificationId: id });
  };

  const restoreNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDismissed: false } : n))
    );
    sendWs('RESTORE_NOTIFICATION', { notificationId: id });
  };

  const dismissAll = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isDismissed: true })));
    sendWs('DISMISS_ALL', {});
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    sendWs('MARK_ALL_READ', {});
  };

  const sendNotificationAction = (notificationId: string, action: 'reply' | 'star' | 'snooze' | 'unsnooze' | 'read', payload?: any) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id !== notificationId) return n;
        if (action === 'reply' && payload?.replyText) {
          const replies = n.replyHistory ? [...n.replyHistory] : [];
          replies.push({
            sender: deviceInfo.name,
            text: payload.replyText,
            timestamp: Date.now(),
          });
          return { ...n, isRead: true, replyHistory: replies };
        }
        if (action === 'star') return { ...n, isStarred: !n.isStarred };
        if (action === 'snooze') {
          return {
            ...n,
            isSnoozed: true,
            snoozeUntil: Date.now() + (payload?.durationMinutes || 30) * 60 * 1000,
          };
        }
        if (action === 'unsnooze') {
          return { ...n, isSnoozed: false, snoozeUntil: undefined };
        }
        if (action === 'read') return { ...n, isRead: true };
        return n;
      })
    );

    sendWs('NOTIFICATION_ACTION', {
      notificationId,
      action,
      senderName: deviceInfo.name,
      ...payload,
    });
  };

  const sendClipboard = (text: string) => {
    if (!text.trim()) return;
    const entry: ClipboardItem = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      sourceDevice: deviceInfo.name,
      timestamp: Date.now(),
    };
    setClipboard((prev) => [entry, ...prev]);
    sendWs('SYNC_CLIPBOARD', { text, sourceDevice: deviceInfo.name });
  };

  const triggerRing = (targetDeviceId: string) => {
    sendWs('TRIGGER_RING', { targetDeviceId });
  };

  const stopRing = () => {
    stopRingingAlert();
    sendWs('STOP_RING', {});
  };

  const toggleDND = (enabled: boolean) => {
    setDndMode(enabled);
    sendWs('TOGGLE_DND', { enabled });
  };

  const toggleAppMute = (appName: string) => {
    const isMuted = mutedApps.includes(appName);
    const updated = isMuted ? mutedApps.filter((a) => a !== appName) : [...mutedApps, appName];
    setMutedApps(updated);
    sendWs('UPDATE_APP_FILTER', { appName, muted: !isMuted });
  };

  return {
    roomCode,
    changeRoomCode,
    deviceInfo,
    updateDeviceProfile,
    devices,
    notifications,
    clipboard,
    dndMode,
    mutedApps,
    ringingDeviceId,
    isConnected,
    isReconnecting,
    soundEnabled,
    setSoundEnabled,
    // Actions
    pushNotification,
    dismissNotification,
    restoreNotification,
    dismissAll,
    markAllAsRead,
    sendNotificationAction,
    sendClipboard,
    triggerRing,
    stopRing,
    toggleDND,
    toggleAppMute,
  };
}
