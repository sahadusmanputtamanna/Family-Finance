// ========================================================
// PUSH NOTIFICATION SERVICE: PWA Service Worker Abstraction Layer
// Supports Chrome, Edge, Android, Samsung Internet
// ========================================================

class PushNotificationService {
  constructor() {
    this.swRegistration = null;
    this.init();
  }

  async init() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = reg;
        console.log('[PushNotificationService] Service Worker registered:', reg);
      } catch (err) {
        console.warn('[PushNotificationService] SW Registration notice:', err);
      }
    }
  }

  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;

    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch (e) {
      return false;
    }
  }

  async sendLocalPush(title, body, type = 'system', url = '/') {
    const hasPerm = await this.requestPermission();
    if (!hasPerm) return;

    if (this.swRegistration && this.swRegistration.showNotification) {
      try {
        await this.swRegistration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [100, 50, 100],
          data: { url, type },
          tag: 'ffh-push-' + Date.now()
        });
      } catch (e) {
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }
}

export const pushNotificationService = new PushNotificationService();
