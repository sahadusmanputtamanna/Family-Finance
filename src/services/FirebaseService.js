// ================================================================
// FIREBASE SERVICE
// FCM Token registration, foreground message handling, badge sync
// Registers firebase-messaging-sw.js for background/terminated delivery
// ================================================================

import { getToken, onMessage } from 'firebase/messaging';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { firebaseConfig, isFirebaseConfigured, getMessagingAsync } from '../lib/firebaseClient';
import { pushNotificationService } from './PushNotificationService';

const ICON_URL  = '/icons/icon-192x192.png';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

class FirebaseService {
  constructor() {
    this.isInitialized     = false;
    this.deviceToken       = null;
    this.messaging         = null;
    this.fcmSwRegistration = null;          // firebase-messaging-sw.js registration
    this._unsubscribeOnMessage = null;
  }

  // ----------------------------------------------------------------
  // Initialize Firebase Messaging
  // Registers firebase-messaging-sw.js (separate from main sw.js)
  // ----------------------------------------------------------------
  async initializeFirebase() {
    if (this.isInitialized) return true;
    if (!isFirebaseConfigured()) return false;

    try {
      this.messaging = await getMessagingAsync();

      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        // Register the FCM-specific service worker with its own scope
        // This is separate from /sw.js (which handles caching & vanilla push)
        this.fcmSwRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );
        console.log('[FirebaseService] firebase-messaging-sw.js registered');
      }

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('[FirebaseService] Init error:', err);
      return false;
    }
  }

  // ----------------------------------------------------------------
  // Request OS permission (POST_NOTIFICATIONS on Android 13+)
  // ----------------------------------------------------------------
  async requestNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied')  return 'denied';
    try {
      const perm = await Notification.requestPermission();
      console.log('[FirebaseService] Permission result:', perm);
      return perm;
    } catch (err) {
      console.error('[FirebaseService] Permission error:', err);
      return 'denied';
    }
  }

  // ----------------------------------------------------------------
  // Get real FCM token and persist it to Supabase
  // ----------------------------------------------------------------
  async getDeviceToken() {
    if (this.deviceToken) return this.deviceToken;

    const perm = await this.requestNotificationPermission();
    if (perm !== 'granted') {
      console.warn('[FirebaseService] Push permission not granted – token skipped.');
      return null;
    }
    if (!isFirebaseConfigured()) return null;

    try {
      await this.initializeFirebase();
      if (!this.messaging) this.messaging = await getMessagingAsync();
      if (!this.messaging) return null;

      // Ensure FCM SW is registered before calling getToken
      if (!this.fcmSwRegistration && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        this.fcmSwRegistration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js',
          { scope: '/' }
        );
      }

      const token = await getToken(this.messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: this.fcmSwRegistration
      });

      if (token) {
        this.deviceToken = token;
        console.log('[FirebaseService] FCM token acquired successfully');
        await this.storeTokenInSupabase(token);
        return token;
      }

      console.warn('[FirebaseService] getToken() returned empty. Check VAPID key & FCM Web Push certificate in Firebase Console → Project Settings → Cloud Messaging.');
      return null;
    } catch (err) {
      console.error('[FirebaseService] getToken error:', err);
      return null;
    }
  }

  /** Force-refresh the FCM token (call when token is revoked/expired) */
  async refreshDeviceToken() {
    this.deviceToken = null;
    return this.getDeviceToken();
  }

  // ----------------------------------------------------------------
  // Persist FCM token in Supabase device_tokens table
  // ----------------------------------------------------------------
  async storeTokenInSupabase(token, memberId = null) {
    if (!isSupabaseConfigured() || !token) return;
    try {
      const platform = this._detectPlatform();
      const { error } = await supabase
        .from('device_tokens')
        .upsert(
          [{
            device_token: token,
            member_id:    memberId,
            platform,
            updated_at:   new Date().toISOString()
          }],
          { onConflict: 'device_token' }
        );
      if (error) console.error('[FirebaseService] Supabase upsert error:', error);
      else console.log('[FirebaseService] FCM token saved to Supabase');
    } catch (err) {
      console.error('[FirebaseService] storeTokenInSupabase error:', err);
    }
  }

  _detectPlatform() {
    if (typeof navigator === 'undefined') return 'web';
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android')) return 'android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    return 'web';
  }

  // ----------------------------------------------------------------
  // FOREGROUND FCM MESSAGES (app is open and in foreground)
  // Shows a native status-bar notification via SW showNotification.
  // Using Notification API alone does NOT show in Android status bar.
  // ----------------------------------------------------------------
  listenForegroundMessages(onMessageCallback) {
    if (!isFirebaseConfigured()) return;

    const attach = (msg) => {
      if (this._unsubscribeOnMessage) return;
      this._unsubscribeOnMessage = onMessage(msg, async (payload) => {
        console.log('[FirebaseService] Foreground FCM received:', payload);

        const title = payload.notification?.title || payload.data?.title || 'Family Finance';
        const body  = payload.notification?.body  || payload.data?.body  || 'New financial activity.';
        const url   = payload.data?.url || '/';
        const type  = payload.data?.type || 'system';

        // Use SW showNotification – this IS visible in Android status bar
        await pushNotificationService.sendLocalPush(title, body, type, url);

        if (onMessageCallback) onMessageCallback(payload);
      });
    };

    if (this.messaging) {
      attach(this.messaging);
    } else {
      getMessagingAsync().then((msg) => {
        if (msg) { this.messaging = msg; attach(msg); }
      });
    }
  }

  /** Remove foreground listener */
  stopForegroundMessages() {
    if (this._unsubscribeOnMessage) {
      this._unsubscribeOnMessage();
      this._unsubscribeOnMessage = null;
    }
  }

  // ----------------------------------------------------------------
  // Update Android app badge with unread notification count
  // Uses navigator.setAppBadge (supported in Chrome/Android PWA & TWA)
  // ----------------------------------------------------------------
  async updateBadge(unreadCount) {
    if ('setAppBadge' in navigator) {
      try {
        if (unreadCount > 0) {
          await navigator.setAppBadge(unreadCount);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (e) {
        // Not all platforms support this
      }
    }
  }

  // Compatibility shim – kept for NotificationService import
  async sendPushNotification(title, body, type = 'system') {
    console.log('[FirebaseService] Push delivery handled by firebase-messaging-sw.js via FCM backend.');
  }

  // Background relay (SW → main thread)
  listenBackgroundMessages(callback) {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (callback && event.data?.isBackground) callback(event.data);
    });
  }
}

export const firebaseService = new FirebaseService();
