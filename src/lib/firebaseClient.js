import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || ''
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
};

// Initialize App
let firebaseApp = null;
if (isFirebaseConfigured()) {
  try {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('[firebaseClient] Firebase App initialization notice:', err);
  }
}

export const app = firebaseApp;

// Async Messaging Resolver
let messagingInstance = null;
if (app && typeof window !== 'undefined') {
  try {
    isSupported().then((supported) => {
      if (supported) {
        messagingInstance = getMessaging(app);
      }
    }).catch((e) => {
      console.warn('[firebaseClient] Messaging support check notice:', e);
    });
  } catch (e) {
    console.warn('[firebaseClient] getMessaging notice:', e);
  }
}

export const messaging = messagingInstance;

export const getMessagingAsync = async () => {
  if (!app || typeof window === 'undefined') return null;
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  } catch (e) {
    console.warn('[firebaseClient] Messaging async check notice:', e);
  }
  return null;
};