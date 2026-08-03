// ========================================================
// PUSH SERVICE: PWA Service Worker & Web Push Notification Manager
// Supports Android, Chrome, Edge, Samsung Internet
// ========================================================

class PushService {
  constructor() {
    this.swRegistration = null;
    this.init();
  }

  async init() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = reg;
        console.log('[PushService] Service Worker registered cleanly:', reg);
      } catch (err) {
        console.warn('[PushService] Service Worker registration failed:', err);
      }
    }
  }

  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[PushService] Notifications API not supported in this browser.');
      return false;
    }

    if (Notification.permission === 'granted') return true;

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async sendLocalPush(title, body, type = 'system', url = '/') {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

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
        console.warn('[PushService] SW Notification fallback to Notification API:', e);
        new Notification(title, { body, icon: '/favicon.ico' });
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  }
}

export const pushService = new PushService();
