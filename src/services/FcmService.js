// ========================================================
// FCM SERVICE: Firebase Cloud Messaging & Android APK Bridge Service
// Supports Foreground, Background, Vibration, Sound & Badging
// ========================================================

class FcmService {
  constructor() {
    this.fcmToken = null;
  }

  // Set FCM token obtained from Android native wrapper / Capacitor / Cordova
  setFcmToken(token) {
    this.fcmToken = token;
    console.log('[FcmService] FCM Token registered:', token);
  }

  // Format FCM JSON push payload for native Android broadcast
  formatFcmPayload(title, body, type = 'system', extraData = {}) {
    return {
      to: this.fcmToken || '/topics/family_finance_hub',
      notification: {
        title: title,
        body: body,
        sound: 'default',
        badge: '1',
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      data: {
        type: type,
        timestamp: new Date().toISOString(),
        vibrate: 'true',
        sound: 'true',
        ...extraData
      },
      priority: 'high'
    };
  }

  // Simulate Android Native Bridge Dispatch for APK preview mode
  dispatchAndroidNativeAlert(title, body, type = 'system') {
    if (typeof window !== 'undefined' && window.AndroidBridge) {
      try {
        window.AndroidBridge.postMessage(JSON.stringify({
          title,
          body,
          type,
          sound: true,
          vibrate: true
        }));
      } catch (e) {
        console.warn('[FcmService] Native Android bridge notice:', e);
      }
    } else {
      console.log('[FcmService] Native FCM Payload Ready:', this.formatFcmPayload(title, body, type));
    }
  }
}

export const fcmService = new FcmService();
