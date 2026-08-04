// ================================================================
// FIREBASE MESSAGING SERVICE WORKER
// Handles background + terminated FCM push notifications for Android & PWA
// Firebase SDK v10 compat (via CDN importScripts)
// ================================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyBjZG0yhSgxn7fWnCRZiPijhv5RxS-jq4E',
  authDomain:        'family-finance-47e73.firebaseapp.com',
  projectId:         'family-finance-47e73',
  storageBucket:     'family-finance-47e73.firebasestorage.app',
  messagingSenderId: '1065933082269',
  appId:             '1:1065933082269:web:4f8f07f7cfb165bd494e74'
};

// Initialize Firebase App (guard against duplicate init in SW lifecycle)
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_CONFIG);
}

const messaging = firebase.messaging();

// ----------------------------------------------------------------
// BACKGROUND & TERMINATED STATE
// Fires when app is in background (minimised) or fully closed.
// NOTE: Do NOT use `event.waitUntil` here – onBackgroundMessage is a
// callback, not a raw Service Worker event handler. The Firebase SDK
// wraps it in its own event.waitUntil internally.
// ----------------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background FCM received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Family Finance';
  const body  = payload.notification?.body  || payload.data?.body  || 'You have a new update.';
  const url   = payload.data?.url || '/';

  return self.registration.showNotification(title, {
    body,
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag:     'ffh-' + (payload.data?.type || 'system'),
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'open',    title: '📂 Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: { url }
  });
});

// ----------------------------------------------------------------
// NOTIFICATION CLICK HANDLER
// Tapping the Android status bar / lock screen notification
// ----------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});
