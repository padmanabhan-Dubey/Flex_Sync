/**
 * Browser Web Notification API helper for Chrome OS Flex & Android browsers
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  return await Notification.requestPermission();
}

export function showSystemNotification(
  title: string,
  options: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
  } = {}
) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/icon.svg',
      badge: '/icon.svg',
      tag: options.tag,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn('System notification error:', err);
    return null;
  }
}
