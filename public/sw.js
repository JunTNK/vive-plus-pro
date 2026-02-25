// Service Worker para Vive Plus Pro - PWA
const CACHE_NAME = 'vive-plus-pro-v1';
const OFFLINE_URL = '/offline.html';

// Archivos a cachear para funcionamiento offline (solo del mismo origen)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.png',
  '/logo.svg',
  '/offline.html'
];

// Esquemas que NO se deben cachear (no soportados por Cache API)
const SKIP_CACHE_SCHEMES = [
  'chrome-extension',
  'moz-extension',
  'safari-extension',
  'data:',
  'blob:',
  'about:',
  'javascript:',
  'file:'
];

// Dominios externos que no debemos cachear
const SKIP_CACHE_DOMAINS = [
  'googleusercontent.com',
  'gstatic.com',
  'google.com',
  'googleapis.com',
  'vercel.app',
  'vercel.com'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error en instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activado');
        return self.clients.claim();
      })
  );
});

// Verificar si la URL se puede cachear
function canCache(url) {
  try {
    const urlObj = new URL(url, self.location.origin);
    
    // Verificar esquemas no soportados
    if (SKIP_CACHE_SCHEMES.some(scheme => urlObj.protocol.startsWith(scheme))) {
      return false;
    }
    
    // Verificar dominios externos
    if (SKIP_CACHE_DOMAINS.some(domain => urlObj.hostname.includes(domain))) {
      return false;
    }
    
    // Solo cachear recursos del mismo origen
    if (urlObj.origin !== self.location.origin) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  const { request } = event;
  const url = new URL(request.url);

  // Verificar si se puede cachear
  if (!canCache(request.url)) {
    return;
  }

  // Estrategia para archivos estáticos: Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia para APIs: Network First con fallback a cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia para páginas: Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// Verificar si es un archivo estático
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Estrategia: Cache First (para archivos estáticos)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear si la respuesta es válida y se puede cachear
    if (networkResponse.ok && canCache(request.url)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en cacheFirst:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Estrategia: Network First (para APIs)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Solo cachear respuestas exitosas
    if (networkResponse.ok && canCache(request.url)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, usando cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'Sin conexión', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estrategia: Stale While Revalidate (para páginas)
async function staleWhileRevalidate(request) {
  // Verificar si se puede cachear
  if (!canCache(request.url)) {
    return fetch(request);
  }

  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok && canCache(request.url)) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Si falla la red y no hay cache, mostrar página offline
      if (!cachedResponse) {
        return caches.match(OFFLINE_URL);
      }
    });

  return cachedResponse || fetchPromise;
}

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Cache limpiado');
    });
  }
});

// Notificaciones push (preparado para futuras implementaciones)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nueva notificación de Vive Plus Pro',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Vive Plus Pro', options)
    );
  }
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('[SW] Service Worker cargado - Vive Plus Pro PWA');
