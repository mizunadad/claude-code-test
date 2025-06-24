// Service Worker for 2048 Game PWA

const CACHE_NAME = 'game2048-v1.0.0';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './css/game.css',
    './css/responsive.css',
    './js/utils.js',
    './js/storage.js',
    './js/game.js',
    './js/ui.js',
    './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(URLS_TO_CACHE);
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
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the fetched resource
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Return offline page or fallback
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Background sync for saving game state
self.addEventListener('sync', (event) => {
    if (event.tag === 'save-game-state') {
        event.waitUntil(
            // Save game state when connection is restored
            saveGameStateToServer()
        );
    }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    const options = {
        body: 'Come back and continue your 2048 game!',
        icon: './icon-192.png',
        badge: './badge-72.png',
        tag: 'game-reminder',
        requireInteraction: false,
        actions: [
            {
                action: 'play',
                title: 'Play Now'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('2048 Game', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'play') {
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Helper function for future server sync
async function saveGameStateToServer() {
    try {
        // This would sync game state to a server in the future
        console.log('Service Worker: Background sync - save game state');
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Failed to sync game state', error);
        throw error;
    }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_UPDATE':
            // Update cache with new resources
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then(cache => cache.addAll(data.urls))
            );
            break;
            
        case 'GET_CACHE_SIZE':
            // Get current cache size
            event.waitUntil(
                getCacheSize().then(size => {
                    event.ports[0].postMessage({ size });
                })
            );
            break;
    }
});

// Get cache size
async function getCacheSize() {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    let totalSize = 0;
    
    for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
        }
    }
    
    return totalSize;
}

console.log('Service Worker: Script loaded');