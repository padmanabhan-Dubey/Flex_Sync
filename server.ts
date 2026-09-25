import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DeviceInfo {
  id: string;
  name: string;
  type: 'android' | 'chromeos' | 'desktop' | 'tablet';
  os: string;
  batteryLevel?: number;
  isCharging?: boolean;
  isDND?: boolean;
  isOnline: boolean;
  lastSeen: number;
}

interface NotificationItem {
  id: string;
  roomCode: string;
  sourceDeviceId: string;
  appName: string;
  packageName?: string;
  title: string;
  body: string;
  timestamp: number;
  category: 'message' | 'email' | 'call' | 'alert' | 'social' | 'calendar' | 'system';
  priority: 'high' | 'normal' | 'low';
  iconUrl?: string;
  avatarUrl?: string;
  isRead: boolean;
  isDismissed: boolean;
  isStarred: boolean;
  isSnoozed: boolean;
  snoozeUntil?: number;
  quickReplies?: string[];
  replyHistory?: { sender: string; text: string; timestamp: number }[];
}

interface ClipboardEntry {
  id: string;
  text: string;
  sourceDevice: string;
  timestamp: number;
}

interface RoomState {
  roomCode: string;
  createdAt: number;
  devices: Record<string, DeviceInfo>;
  notifications: NotificationItem[];
  clipboard: ClipboardEntry[];
  dndMode: boolean;
  mutedApps: string[];
  ringingDeviceId: string | null;
}

// In-memory room store
const rooms = new Map<string, RoomState>();

// Track connected client metadata
interface ClientSession {
  ws: WebSocket;
  roomCode?: string;
  deviceId?: string;
  isAlive: boolean;
}

const clientSessions = new Map<WebSocket, ClientSession>();

function getOrCreateRoom(roomCode: string): RoomState {
  const code = roomCode.toUpperCase().trim();
  let room = rooms.get(code);
  if (!room) {
    room = {
      roomCode: code,
      createdAt: Date.now(),
      devices: {},
      notifications: [
        {
          id: `notif-${Date.now()}-1`,
          roomCode: code,
          sourceDeviceId: 'android-default',
          appName: 'WhatsApp',
          packageName: 'com.whatsapp',
          title: 'Elena Vance',
          body: 'Shared 3 photos from the weekend trip! Are you free for dinner tonight?',
          timestamp: Date.now() - 1000 * 60 * 4,
          category: 'message',
          priority: 'high',
          isRead: false,
          isDismissed: false,
          isStarred: false,
          isSnoozed: false,
          quickReplies: ['Yes, let’s do it!', 'Call you in 5 mins', 'Can’t tonight, busy!'],
          replyHistory: [],
        },
        {
          id: `notif-${Date.now()}-2`,
          roomCode: code,
          sourceDeviceId: 'android-default',
          appName: 'Slack',
          packageName: 'com.slack',
          title: '#product-engineering',
          body: 'Marcus: Release v2.4 build pipeline passed on ChromeOS Flex! Waiting for QA verification.',
          timestamp: Date.now() - 1000 * 60 * 18,
          category: 'message',
          priority: 'normal',
          isRead: false,
          isDismissed: false,
          isStarred: true,
          isSnoozed: false,
          quickReplies: ['On it! Checking now', 'Great job team 🎉'],
          replyHistory: [],
        },
        {
          id: `notif-${Date.now()}-3`,
          roomCode: code,
          sourceDeviceId: 'android-default',
          appName: 'Gmail',
          packageName: 'com.google.android.gm',
          title: 'Google Cloud Platform',
          body: 'Billing alert: Weekly budget forecast is within normal range ($14.20 / $50.00).',
          timestamp: Date.now() - 1000 * 60 * 55,
          category: 'email',
          priority: 'low',
          isRead: true,
          isDismissed: false,
          isStarred: false,
          isSnoozed: false,
          replyHistory: [],
        },
        {
          id: `notif-${Date.now()}-4`,
          roomCode: code,
          sourceDeviceId: 'android-default',
          appName: 'Google Calendar',
          packageName: 'com.google.android.calendar',
          title: 'Team Sync & Demo',
          body: 'Starting in 15 minutes • Room A / Google Meet',
          timestamp: Date.now() - 1000 * 60 * 8,
          category: 'calendar',
          priority: 'high',
          isRead: false,
          isDismissed: false,
          isStarred: false,
          isSnoozed: false,
          quickReplies: ['Join Meet', 'Running 5 min late'],
          replyHistory: [],
        }
      ],
      clipboard: [
        {
          id: `clip-${Date.now()}-1`,
          text: 'https://ais-dev-k2boz3hk6mw4t6uz5bpcmd-659425768114.asia-southeast1.run.app',
          sourceDevice: 'Android Phone',
          timestamp: Date.now() - 1000 * 60 * 25,
        }
      ],
      dndMode: false,
      mutedApps: [],
      ringingDeviceId: null,
    };
    rooms.set(code, room);
  }
  return room;
}

function broadcastToRoom(roomCode: string, message: any, excludeWs?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const [ws, session] of clientSessions.entries()) {
    if (session.roomCode === roomCode && ws.readyState === WebSocket.OPEN && ws !== excludeWs) {
      try {
        ws.send(payload);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  app.use(express.json());

  // WebSocket Connection Management
  wss.on('connection', (ws: WebSocket) => {
    const session: ClientSession = {
      ws,
      isAlive: true,
    };
    clientSessions.set(ws, session);

    ws.on('pong', () => {
      session.isAlive = true;
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const { type, payload } = msg;

        switch (type) {
          case 'JOIN_ROOM': {
            const { roomCode, device } = payload;
            const code = roomCode.toUpperCase().trim();
            session.roomCode = code;
            session.deviceId = device.id;

            const room = getOrCreateRoom(code);
            room.devices[device.id] = {
              ...device,
              isOnline: true,
              lastSeen: Date.now(),
            };

            // Send initial room state to joining client
            ws.send(
              JSON.stringify({
                type: 'ROOM_STATE',
                payload: {
                  room,
                  yourDeviceId: device.id,
                },
              })
            );

            // Broadcast device joined to other peers
            broadcastToRoom(
              code,
              {
                type: 'DEVICE_JOINED',
                payload: {
                  device: room.devices[device.id],
                },
              },
              ws
            );
            break;
          }

          case 'UPDATE_DEVICE': {
            if (!session.roomCode || !session.deviceId) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            if (room.devices[session.deviceId]) {
              room.devices[session.deviceId] = {
                ...room.devices[session.deviceId],
                ...payload,
                lastSeen: Date.now(),
              };
              broadcastToRoom(session.roomCode, {
                type: 'DEVICE_UPDATED',
                payload: { device: room.devices[session.deviceId] },
              });
            }
            break;
          }

          case 'NEW_NOTIFICATION': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;

            // Check if app is muted
            if (room.mutedApps.includes(payload.appName)) {
              return;
            }

            const newNotif: NotificationItem = {
              ...payload,
              id: payload.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              roomCode: session.roomCode,
              timestamp: payload.timestamp || Date.now(),
              isRead: false,
              isDismissed: false,
              isStarred: false,
              isSnoozed: false,
              replyHistory: payload.replyHistory || [],
            };

            // Guard duplicates
            const exists = room.notifications.find((n) => n.id === newNotif.id);
            if (!exists) {
              room.notifications.unshift(newNotif);
              // Limit history size to 300
              if (room.notifications.length > 300) {
                room.notifications.pop();
              }
              broadcastToRoom(session.roomCode, {
                type: 'NOTIFICATION_ADDED',
                payload: { notification: newNotif },
              });
            }
            break;
          }

          case 'DISMISS_NOTIFICATION': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            const notif = room.notifications.find((n) => n.id === payload.notificationId);
            if (notif) {
              notif.isDismissed = true;
              broadcastToRoom(session.roomCode, {
                type: 'NOTIFICATION_DISMISSED',
                payload: { notificationId: payload.notificationId },
              });
            }
            break;
          }

          case 'DISMISS_ALL': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            room.notifications.forEach((n) => {
              n.isDismissed = true;
            });
            broadcastToRoom(session.roomCode, {
              type: 'ALL_NOTIFICATIONS_DISMISSED',
              payload: {},
            });
            break;
          }

          case 'MARK_ALL_READ': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            room.notifications.forEach((n) => {
              n.isRead = true;
            });
            broadcastToRoom(session.roomCode, {
              type: 'ALL_NOTIFICATIONS_READ',
              payload: {},
            });
            break;
          }

          case 'NOTIFICATION_ACTION': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            const notif = room.notifications.find((n) => n.id === payload.notificationId);
            if (notif) {
              if (payload.action === 'reply' && payload.replyText) {
                if (!notif.replyHistory) notif.replyHistory = [];
                notif.replyHistory.push({
                  sender: payload.senderName || 'Chrome OS Flex',
                  text: payload.replyText,
                  timestamp: Date.now(),
                });
                notif.isRead = true;
              } else if (payload.action === 'star') {
                notif.isStarred = !notif.isStarred;
              } else if (payload.action === 'snooze') {
                notif.isSnoozed = true;
                notif.snoozeUntil = Date.now() + (payload.durationMinutes || 30) * 60 * 1000;
              } else if (payload.action === 'unsnooze') {
                notif.isSnoozed = false;
                notif.snoozeUntil = undefined;
              } else if (payload.action === 'read') {
                notif.isRead = true;
              }

              broadcastToRoom(session.roomCode, {
                type: 'NOTIFICATION_UPDATED',
                payload: { notification: notif, action: payload.action },
              });
            }
            break;
          }

          case 'RESTORE_NOTIFICATION': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            const notif = room.notifications.find((n) => n.id === payload.notificationId);
            if (notif) {
              notif.isDismissed = false;
              broadcastToRoom(session.roomCode, {
                type: 'NOTIFICATION_RESTORED',
                payload: { notification: notif },
              });
            }
            break;
          }

          case 'SYNC_CLIPBOARD': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            const entry: ClipboardEntry = {
              id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              text: payload.text,
              sourceDevice: payload.sourceDevice || 'Unknown Device',
              timestamp: Date.now(),
            };
            room.clipboard.unshift(entry);
            if (room.clipboard.length > 50) room.clipboard.pop();
            broadcastToRoom(session.roomCode, {
              type: 'CLIPBOARD_UPDATED',
              payload: { entry, clipboard: room.clipboard },
            });
            break;
          }

          case 'TRIGGER_RING': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            room.ringingDeviceId = payload.targetDeviceId;
            broadcastToRoom(session.roomCode, {
              type: 'RING_TRIGGERED',
              payload: { targetDeviceId: payload.targetDeviceId },
            });
            break;
          }

          case 'STOP_RING': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            room.ringingDeviceId = null;
            broadcastToRoom(session.roomCode, {
              type: 'RING_STOPPED',
              payload: {},
            });
            break;
          }

          case 'TOGGLE_DND': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            room.dndMode = !!payload.enabled;
            broadcastToRoom(session.roomCode, {
              type: 'DND_UPDATED',
              payload: { dndMode: room.dndMode },
            });
            break;
          }

          case 'UPDATE_APP_FILTER': {
            if (!session.roomCode) return;
            const room = rooms.get(session.roomCode);
            if (!room) return;
            const { appName, muted } = payload;
            if (muted && !room.mutedApps.includes(appName)) {
              room.mutedApps.push(appName);
            } else if (!muted) {
              room.mutedApps = room.mutedApps.filter((a) => a !== appName);
            }
            broadcastToRoom(session.roomCode, {
              type: 'APP_FILTERS_UPDATED',
              payload: { mutedApps: room.mutedApps },
            });
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WS message:', err);
      }
    });

    ws.on('close', () => {
      if (session.roomCode && session.deviceId) {
        const room = rooms.get(session.roomCode);
        if (room && room.devices[session.deviceId]) {
          room.devices[session.deviceId].isOnline = false;
          room.devices[session.deviceId].lastSeen = Date.now();
          broadcastToRoom(session.roomCode, {
            type: 'DEVICE_LEFT',
            payload: { deviceId: session.deviceId, lastSeen: Date.now() },
          });
        }
      }
      clientSessions.delete(ws);
    });
  });

  // Keep-alive ping interval
  const pingInterval = setInterval(() => {
    for (const [ws, session] of clientSessions.entries()) {
      if (!session.isAlive) {
        ws.terminate();
        clientSessions.delete(ws);
        continue;
      }
      session.isAlive = false;
      ws.ping();
    }
  }, 25000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  // --- REST Endpoints ---
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      activeRooms: rooms.size,
      connectedClients: clientSessions.size,
      timestamp: Date.now(),
    });
  });

  app.get('/api/room/:code', (req, res) => {
    const code = req.params.code.toUpperCase().trim();
    const room = getOrCreateRoom(code);
    res.json(room);
  });

  // External Webhook endpoint: Android users can trigger this via Tasker, MacroDroid, Termux or custom scripts
  app.post('/api/sync/webhook', (req, res) => {
    const token = (req.query.token as string || req.headers['x-sync-token'] as string || req.body.roomCode || 'DEFAULT').toUpperCase().trim();
    const { app: appName, title, text, body, priority, category, packageName, actions } = req.body;

    if (!appName && !title && !text && !body) {
      return res.status(400).json({ error: 'Notification payload must include app, title, or body.' });
    }

    const room = getOrCreateRoom(token);

    if (room.mutedApps.includes(appName)) {
      return res.json({ status: 'ignored', reason: 'App is muted in sync settings' });
    }

    const newNotif: NotificationItem = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roomCode: token,
      sourceDeviceId: req.body.deviceId || 'android-webhook',
      appName: appName || 'Android Notification',
      packageName: packageName || 'android.system',
      title: title || 'New Notification',
      body: text || body || '',
      timestamp: Date.now(),
      category: category || 'message',
      priority: priority || 'normal',
      isRead: false,
      isDismissed: false,
      isStarred: false,
      isSnoozed: false,
      quickReplies: actions || ['Reply', 'Acknowledge'],
      replyHistory: [],
    };

    room.notifications.unshift(newNotif);
    if (room.notifications.length > 300) room.notifications.pop();

    broadcastToRoom(token, {
      type: 'NOTIFICATION_ADDED',
      payload: { notification: newNotif },
    });

    res.json({ success: true, notificationId: newNotif.id, roomCode: token });
  });

  // Send clipboard via REST
  app.post('/api/sync/clipboard', (req, res) => {
    const { roomCode, text, sourceDevice } = req.body;
    if (!roomCode || !text) {
      return res.status(400).json({ error: 'roomCode and text are required' });
    }
    const code = roomCode.toUpperCase().trim();
    const room = getOrCreateRoom(code);
    const entry: ClipboardEntry = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text,
      sourceDevice: sourceDevice || 'Android Phone',
      timestamp: Date.now(),
    };
    room.clipboard.unshift(entry);
    if (room.clipboard.length > 50) room.clipboard.pop();

    broadcastToRoom(code, {
      type: 'CLIPBOARD_UPDATED',
      payload: { entry, clipboard: room.clipboard },
    });

    res.json({ success: true, entry });
  });

  // Serve Frontend
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`FlexSync Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FlexSync server:', err);
  process.exit(1);
});
