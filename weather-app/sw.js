const CACHE_NAME = 'weather-app-v1.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DATA_CACHE = `${CACHE_NAME}-data`;

const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/config.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

const API_CACHE_TIME = 5 * 60 * 1000; // 5分
const WEATHER_API_PATTERN = /api\.openweathermap\.org/;

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[ServiceWorker] Pre-caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch((error) => {
                console.error('[ServiceWorker] Pre-caching failed:', error);
            })
    );
    
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') {
        return;
    }

    if (WEATHER_API_PATTERN.test(url.hostname)) {
        event.respondWith(handleAPIRequest(request));
    } else {
        event.respondWith(handleStaticRequest(request));
    }
});

async function handleStaticRequest(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[ServiceWorker] Static request failed:', error);
        
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('/index.html');
        }
        
        return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

async function handleAPIRequest(request) {
    try {
        const cache = await caches.open(DATA_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            const cachedDate = new Date(cachedResponse.headers.get('sw-cache-timestamp'));
            const now = new Date();
            
            if (now.getTime() - cachedDate.getTime() < API_CACHE_TIME) {
                console.log('[ServiceWorker] Serving API data from cache');
                return cachedResponse;
            }
        }

        console.log('[ServiceWorker] Fetching fresh API data');
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            const headers = new Headers(responseClone.headers);
            headers.set('sw-cache-timestamp', new Date().toISOString());
            
            const modifiedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers
            });
            
            cache.put(request, modifiedResponse);
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[ServiceWorker] API request failed:', error);
        
        const cache = await caches.open(DATA_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('[ServiceWorker] Serving stale API data from cache');
            const staleResponse = cachedResponse.clone();
            const headers = new Headers(staleResponse.headers);
            headers.set('sw-stale', 'true');
            
            return new Response(staleResponse.body, {
                status: staleResponse.status,
                statusText: staleResponse.statusText,
                headers: headers
            });
        }
        
        return new Response(JSON.stringify({
            error: 'Network unavailable',
            message: 'インターネット接続を確認してください'
        }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearCache().then(() => {
            event.ports[0].postMessage({
                success: true
            });
        }).catch((error) => {
            event.ports[0].postMessage({
                success: false,
                error: error.message
            });
        });
    }
});

async function clearCache() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('[ServiceWorker] Background sync triggered');
        event.waitUntil(performBackgroundSync());
    }
});

async function performBackgroundSync() {
    try {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                message: 'Background sync completed'
            });
        });
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed:', error);
    }
}

self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');
    
    const options = {
        body: event.data ? event.data.text() : '新しい天気情報があります',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '確認する',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: '/icons/icon-96x96.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Weather App', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        event.notification.close();
    } else {
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
        );
    }
});

self.addEventListener('notificationclose', (event) => {
    console.log('[ServiceWorker] Notification closed');
});

self.addEventListener('periodicbackgroundsync', (event) => {
    if (event.tag === 'weather-update') {
        event.waitUntil(updateWeatherData());
    }
});

async function updateWeatherData() {
    try {
        const clients = await self.clients.matchAll();
        if (clients.length === 0) {
            return;
        }

        clients.forEach(client => {
            client.postMessage({
                type: 'PERIODIC_UPDATE',
                message: 'Updating weather data in background'
            });
        });
        
    } catch (error) {
        console.error('[ServiceWorker] Periodic background sync failed:', error);
    }
}

console.log('[ServiceWorker] Service Worker loaded');