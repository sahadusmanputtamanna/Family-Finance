// ========================================================
// FAMILY FINANCE - PRODUCTION-READY PWA SERVICE WORKER
// Supports Offline Caching, Background Sync, Web Push & Auto Update
// ========================================================

const CACHE_NAME = 'family-finance-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-72x72.svg',
  '/icons/icon-96x96.svg',
  '/icons/icon-128x128.svg',
  '/icons/icon-144x144.svg',
  '/icons/icon-152x152.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-384x384.svg',
  '/icons/icon-512x512.svg'
];

// Install Event - Pre-cache App Shell & Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching App Shell & Assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleanup Old Caches & Claim Clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate for Static Assets, Network-First for APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // DO NOT CACHE SUPABASE API RESPONSES PERMANENTLY
  if (url.origin.includes('supabase.co') || event.request.method !== 'GET') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Stale-While-Revalidate Strategy for HTML, CSS, JS, Images, Icons & App Shell
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log('[ServiceWorker] Network fetch failed, serving offline cache:', err);
        return cachedResponse || caches.match('/index.html');
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Message Event - Skip Waiting for Auto-Update Trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push Event - Background Notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'Family Finance Alert',
    body: 'New financial activity recorded.',
    url: '/'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message || 'Activity updated.',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-192x192.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Family Finance', options)
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

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
