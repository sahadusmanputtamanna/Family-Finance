// ================================================================
// FAMILY FINANCE PUSH NOTIFICATION SERVICE
// Shows native OS notifications via the Service Worker.
// On Android (Chrome/TWA) this surfaces in the status bar and lock screen.
// Does NOT register any SW – registration is handled exclusively in main.jsx
// ================================================================

const ICON_URL  = '/icons/icon-192x192.png';
const BADGE_URL = '/icons/icon-72x72.png';

class PushNotificationService {
  constructor() {
    this._swReg = null;
  }

  /** Lazily resolve the active sw.js registration */
  async _getSwReg() {
    if (this._swReg) return this._swReg;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
    try {
      // navigator.serviceWorker.ready resolves to the active registration
      this._swReg = await navigator.serviceWorker.ready;
      return this._swReg;
    } catch (e) {
      console.warn('[PushNotificationService] SW ready error:', e);
      return null;
    }
  }

  /** Request OS notification permission (Android 13+ POST_NOTIFICATIONS dialog) */
  async requestPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied')  return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Show a native push notification.
   * Uses SW showNotification → appears in Android status bar even when app is open.
   * Falls back to Notification API for desktop browsers.
   */
  async sendLocalPush(title, body, type = 'system', url = '/') {
    const granted = await this.requestPermission();
    if (!granted) return;

    const options = {
      body,
      icon:    ICON_URL,
      badge:   BADGE_URL,
      vibrate: [200, 100, 200],
      data:    { url, type },
      tag:     `ffh-${type}`,
      renotify: true,
      requireInteraction: false
    };

    try {
      const reg = await this._getSwReg();
      if (reg?.showNotification) {
        await reg.showNotification(title, options);
      } else {
        new Notification(title, { body, icon: ICON_URL });
      }
    } catch (e) {
      try { new Notification(title, { body, icon: ICON_URL }); } catch {}
    }
  }
}

export const pushNotificationService = new PushNotificationService();
