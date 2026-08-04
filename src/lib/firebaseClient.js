// ================================================================
// FIREBASE CLIENT
// Single Firebase App + Messaging instance for the entire React app
// Handles: init guard, messaging support check, async resolver
// ================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
  vapidKey:          import.meta.env.VITE_FIREBASE_VAPID_KEY          || ''
};

export const isFirebaseConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );

// ----------------------------------------------------------------
// Single Firebase App Instance
// ----------------------------------------------------------------
let _app = null;
if (isFirebaseConfigured()) {
  try {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('[firebaseClient] App init:', err.message);
  }
}
export const app = _app;

// ----------------------------------------------------------------
// Async Messaging Resolver (handles isSupported() check)
// Returns the messaging instance or null if unsupported
// ----------------------------------------------------------------
export const getMessagingAsync = async () => {
  if (!app || typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (supported) return getMessaging(app);
  } catch (e) {
    console.warn('[firebaseClient] getMessagingAsync:', e.message);
  }
  return null;
};