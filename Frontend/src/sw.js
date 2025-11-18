// SkillForge Service Worker
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'skillforge-v1';
const DYNAMIC_CACHE_NAME = 'skillforge-dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints that should be cached
const CACHEABLE_API_ENDPOINTS = [
  '/api/courses',
  '/api/user/profile',
  '/api/progress',
  '/api/dashboard/metrics'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-HTTP(S) requests
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (request.url.includes('/api/')) {
    // API requests - use cache-first strategy for specific endpoints
    event.respondWith(handleApiRequest(request));
  } else if (request.destination === 'document') {
    // HTML pages - use cache-first with network fallback
    event.respondWith(handlePageRequest(request));
  } else {
    // Static assets - use cache-first strategy
    event.respondWith(handleAssetRequest(request));
  }
});

// Handle API requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this API endpoint should be cached
  const shouldCache = CACHEABLE_API_ENDPOINTS.some(endpoint => 
    pathname.includes(endpoint));

  if (shouldCache) {
    try {
      // Try network first for API requests
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      // Network failed, try cache
      console.log('Service Worker: Network failed, trying cache for API:', pathname);
      const cachedResponse = await caches.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline API response
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'This data is not available offline',
          cached: false 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // For non-cacheable API requests, just try network
  return fetch(request);
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('Service Worker: Network failed, trying cache for page');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle static asset requests
async function handleAssetRequest(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Asset request failed:', request.url);
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'quiz-submission') {
    event.waitUntil(syncQuizSubmissions());
  }
  
  if (event.tag === 'progress-update') {
    event.waitUntil(syncProgressUpdates());
  }
});

// Sync quiz submissions when back online
async function syncQuizSubmissions() {
  try {
    // Get pending submissions from IndexedDB
    const pendingSubmissions = await getPendingQuizSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/quiz-results/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${submission.token}`
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          // Remove from pending list
          await removePendingQuizSubmission(submission.id);
          console.log('Service Worker: Quiz submission synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync quiz submission', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Sync progress updates when back online
async function syncProgressUpdates() {
  try {
    const pendingUpdates = await getPendingProgressUpdates();
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch('/api/progress/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${update.token}`
          },
          body: JSON.stringify(update.data)
        });
        
        if (response.ok) {
          await removePendingProgressUpdate(update.id);
          console.log('Service Worker: Progress update synced successfully');
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync progress update', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Progress sync failed', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    body: data.body || 'New notification from SkillForge',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/icons/view-24x24.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/dismiss-24x24.png'
      }
    ],
    tag: data.tag || 'skillforge-notification',
    renotify: true,
    requireInteraction: data.priority === 'HIGH' || data.priority === 'URGENT'
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'SkillForge Notification',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Handle notification click
  const urlToOpen = event.notification.data.url || '/dashboard';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Utility functions for IndexedDB operations (simplified)
async function getPendingQuizSubmissions() {
  // In a real implementation, this would use IndexedDB
  return [];
}

async function removePendingQuizSubmission(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing pending quiz submission:', id);
}

async function getPendingProgressUpdates() {
  // In a real implementation, this would use IndexedDB
  return [];
}

async function removePendingProgressUpdate(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing pending progress update:', id);
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CACHE_QUIZ_SUBMISSION') {
    // Store quiz submission for later sync
    storePendingQuizSubmission(event.data.payload);
  }
  
  if (event.data.type === 'CACHE_PROGRESS_UPDATE') {
    // Store progress update for later sync
    storePendingProgressUpdate(event.data.payload);
  }
});

function storePendingQuizSubmission(payload) {
  // In a real implementation, this would store in IndexedDB
  console.log('Storing pending quiz submission for sync');
}

function storePendingProgressUpdate(payload) {
  // In a real implementation, this would store in IndexedDB
  console.log('Storing pending progress update for sync');
}