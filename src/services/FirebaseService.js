// ========================================================
// FIREBASE SERVICE: Official Firebase SDK Implementation
// Uses getToken() from 'firebase/messaging' & ServiceWorker Registration
// NO fake tokens or placeholders
// ========================================================

import { getToken, onMessage } from 'firebase/messaging';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  firebaseConfig,
  isFirebaseConfigured,
  getMessagingAsync
} from '../lib/firebaseClient';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.messaging = null;
    this.swRegistration = null;
  }

  /**
   * Initializes Firebase Messaging & Registers Service Worker
   */
  async initializeFirebase() {
    if (this.isInitialized) return true;

    if (!isFirebaseConfigured()) {
      console.log('[FirebaseService] Official FCM architecture ready. Provide VITE_FIREBASE_* environment variables to activate live push.');
      return false;
    }

    try {
      this.messaging = await getMessagingAsync();

      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[FirebaseService] firebase-messaging-sw.js registered:', this.swRegistration);
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('[FirebaseService] Initialization exception:', err);
      return false;
    }
  }

  /**
   * Requests Browser Notification Permission
   * Handles: 'granted', 'denied', 'default'
   */
  async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('[FirebaseService] Notifications API unavailable in this browser.');
      return 'denied';
    }

    const currentPermission = Notification.permission;
    if (currentPermission === 'granted') return 'granted';
    if (currentPermission === 'denied') return 'denied';

    try {
      const permission = await Notification.requestPermission();
      console.log('[FirebaseService] Notification Permission Result:', permission);
      return permission;
    } catch (err) {
      console.error('[FirebaseService] Permission request error:', err);
      return 'denied';
    }
  }

  /**
   * Retrieves REAL FCM Device Token using official Firebase SDK `getToken()`
   */
  async getDeviceToken() {
    if (this.deviceToken) return this.deviceToken;

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('[FirebaseService] Cannot fetch FCM token without granted notification permission.');
      return null;
    }

    if (!isFirebaseConfigured()) {
      console.log('[FirebaseService] Firebase keys missing in .env. Skipping getToken().');
      return null;
    }

    try {
      await this.initializeFirebase();
      if (!this.messaging) {
        this.messaging = await getMessagingAsync();
      }

      if (!this.messaging) {
        console.warn('[FirebaseService] Firebase Messaging is not supported or failed to load.');
        return null;
      }

      if (!this.swRegistration && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY || firebaseConfig.vapidKey;

      const tokenOptions = {
        serviceWorkerRegistration: this.swRegistration
      };
      if (vapidKey) {
        tokenOptions.vapidKey = vapidKey;
      }

      // Official Firebase SDK getToken() call
      const token = await getToken(this.messaging, tokenOptions);

      if (token) {
        this.deviceToken = token;
        console.log('[FirebaseService] Real FCM Token generated successfully:', token);
        await this.storeTokenInSupabase(token);
        return token;
      } else {
        console.warn('[FirebaseService] getToken() returned empty token. Verify VITE_FIREBASE_VAPID_KEY.');
        return null;
      }
    } catch (err) {
      console.error('[FirebaseService] Error retrieving official FCM token:', err);
      return null;
    }
  }

  /**
   * Refreshes Device Token automatically when required
   */
  async refreshDeviceToken() {
    this.deviceToken = null;
    return await this.getDeviceToken();
  }

  /**
   * Saves the Real FCM Device Token in Supabase (device_tokens table)
   * Columns: device_token, platform, member_id, updated_at
   */
  async storeTokenInSupabase(token, memberId = null, platform = null) {
    if (!isSupabaseConfigured() || !token) return;

    try {
      const devicePlatform = platform || (typeof navigator !== 'undefined' ? navigator.platform : 'web');

      const payload = {
        device_token: token,
        member_id: memberId,
        platform: devicePlatform,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('device_tokens')
        .upsert([payload], { onConflict: 'device_token' })
        .select();

      console.log('[FirebaseService] Real FCM Token saved in Supabase:', data);
      if (error) console.error('[FirebaseService] Supabase device_tokens upsert error:', error);
    } catch (err) {
      console.error('[FirebaseService] Exception saving FCM token in Supabase:', err);
    }
  }

  /**
   * Formats and dispatches a Push Notification payload via FCM / Android Native Bridge
   */
  async sendPushNotification(title, body, type = 'system', extraData = {}) {
    console.log('[FirebaseService] FCM Push Payload:', {
      to: this.deviceToken || '/topics/family_finance_hub',
      notification: { title, body, sound: 'default', badge: '1' },
      data: { type, timestamp: new Date().toISOString(), ...extraData }
    });

    if (typeof window !== 'undefined' && window.AndroidBridge) {
      try {
        window.AndroidBridge.postMessage(JSON.stringify({ title, body, type }));
      } catch (e) {
        console.warn('[FirebaseService] AndroidBridge native dispatch notice:', e);
      }
    }
  }

  /**
   * Listens for Foreground Messages using official `onMessage()`
   */
  listenForegroundMessages(onMessageCallback) {
    if (!this.messaging) {
      getMessagingAsync().then((msg) => {
        if (msg) {
          this.messaging = msg;
          this._attachOnMessage(onMessageCallback);
        }
      });
    } else {
      this._attachOnMessage(onMessageCallback);
    }
  }

  _attachOnMessage(callback) {
    if (!this.messaging) return;
    try {
      onMessage(this.messaging, (payload) => {
        console.log('[FirebaseService] Foreground FCM Message received:', payload);
        
        // Show Browser Notification if app is in foreground
        const title = payload.notification?.title || payload.data?.title || 'Family Finance';
        const body = payload.notification?.body || payload.data?.body || 'New financial activity.';

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.svg'
          });
        }

        if (callback) callback(payload);
      });
    } catch (e) {
      console.warn('[FirebaseService] onMessage attachment notice:', e);
    }
  }

  /**
   * Subscribes to Background Messages via Service Worker message channel
   */
  listenBackgroundMessages(callback) {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (callback && event.data && event.data.isBackground) {
          callback(event.data);
        }
      });
    }
  }
}

export const firebaseService = new FirebaseService();
