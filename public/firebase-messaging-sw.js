// ========================================================
// FIREBASE MESSAGING SERVICE WORKER (public/firebase-messaging-sw.js)
// Handles background messaging for PWA and Android devices using PNG icons
// ========================================================

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker if credentials exist
try {
  firebase.initializeApp({
    apiKey: "AIzaSyBjZG0yhSgxn7fWnCRZiPijhv5RxS-jq4E",
    authDomain: "family-finance-47e73.firebaseapp.com",
    projectId: "family-finance-47e73",
    storageBucket: "family-finance-47e73.firebasestorage.app",
    messagingSenderId: "1065933082269",
    appId: "1:1065933082269:web:4f8f07f7cfb165bd494e74"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Family Finance';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'New financial activity.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: payload.data?.url || '/'
      }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log('[firebase-messaging-sw.js] Background messaging ready for production keys.');
}

// Tap Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
