/**
 * service-worker.js
 * ──────────────────────────────────────────────────────────────────────
 * Offline-first PWA for Hospital GIS
 *
 * Strategies used:
 *   ┌──────────────────────────┬──────────────────────────────────────┐
 *   │ Resource type            │ Strategy                             │
 *   ├──────────────────────────┼──────────────────────────────────────┤
 *   │ Map tiles (OSM)          │ Cache-first (tiles rarely change)    │
 *   │ Hospital list API        │ Network-first (fresh data preferred) │
 *   │ App shell (HTML/JS/CSS)  │ Cache-first after first install      │
 *   │ User queries / routes    │ Network-first, queue offline         │
 *   └──────────────────────────┴──────────────────────────────────────┘
 *
 * Place this file at: /public/service-worker.js
 * Register it from: /src/index.jsx (see pwa-register.js)
 */

const APP_CACHE    = "gis-app-v1";
const TILE_CACHE   = "gis-tiles-v1";
const DATA_CACHE   = "gis-data-v1";
const SYNC_TAG     = "gis-sync-queue";

// Files to pre-cache on install (your app shell)
const APP_SHELL = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// ─────────────────────────────────────────────
//  INSTALL — pre-cache app shell
// ─────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      console.log("[SW] Pre-caching app shell");
      return cache.addAll(APP_SHELL);
    })
  );
  // Take control immediately without waiting for old SW to die
  self.skipWaiting();
});

// ─────────────────────────────────────────────
//  ACTIVATE — clean old caches
// ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  const currentCaches = [APP_CACHE, TILE_CACHE, DATA_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    )
  );
  // Claim all open tabs/pages immediately
  event.waitUntil(self.clients.claim());
});

// ─────────────────────────────────────────────
//  FETCH — route requests to correct strategy
// ─────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Map tiles — openstreetmap or tile server
  if (
    url.hostname.includes("tile.openstreetmap.org") ||
    url.hostname.includes("tiles.")
  ) {
    event.respondWith(cacheThenNetwork(request, TILE_CACHE));
    return;
  }

  // 2. Hospital / clinic API data — network-first
  if (
    url.pathname.startsWith("/api/hospitals") ||
    url.pathname.startsWith("/api/clinics") ||
    url.pathname.startsWith("/api/pharmacies") ||
    url.pathname.startsWith("/api/routes")
  ) {
    event.respondWith(networkFirstWithCache(request, DATA_CACHE));
    return;
  }

  // 3. POST requests while offline — queue for sync
  if (request.method === "POST" && !navigator.onLine) {
    event.respondWith(queueRequest(request));
    return;
  }

  // 4. App shell — cache-first
  if (
    url.origin === self.location.origin &&
    (request.destination === "document" ||
     request.destination === "script"  ||
     request.destination === "style"   ||
     request.destination === "image")
  ) {
    event.respondWith(cacheFirstWithNetwork(request, APP_CACHE));
    return;
  }

  // 5. Everything else — just fetch
  event.respondWith(fetch(request).catch(() => offlineFallback(request)));
});

// ─────────────────────────────────────────────
//  Strategy helpers
// ─────────────────────────────────────────────

/**
 * Cache-first: serve from cache, update cache in background.
 * Perfect for map tiles.
 */
async function cacheThenNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Refresh in background (stale-while-revalidate)
    fetch(request).then((res) => {
      if (res && res.status === 200) {
        cache.put(request, res.clone());
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response(JSON.stringify({ error: "Tile unavailable offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Network-first: try network, fall back to cache.
 * Perfect for hospital/API data.
 */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request.clone());
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      // Add header so frontend knows this is stale data
      const staleHeaders = new Headers(cached.headers);
      staleHeaders.set("X-GIS-Offline", "true");
      return new Response(cached.body, {
        status: cached.status,
        headers: staleHeaders,
      });
    }
    return offlineFallback(request);
  }
}

/**
 * Cache-first with network update.
 * For app shell files.
 */
async function cacheFirstWithNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // For navigation requests, serve offline page
    if (request.destination === "document") {
      return cache.match("/offline.html");
    }
    return offlineFallback(request);
  }
}

/**
 * Queue a failed POST for background sync.
 */
async function queueRequest(request) {
  const body    = await request.text();
  const queued  = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    timestamp: Date.now(),
  };

  // Store in IndexedDB via postMessage to client
  const clients = await self.clients.matchAll();
  clients.forEach((client) =>
    client.postMessage({ type: "QUEUE_REQUEST", payload: queued })
  );

  return new Response(
    JSON.stringify({ queued: true, message: "Will sync when online" }),
    { status: 202, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Generic offline fallback.
 */
function offlineFallback(request) {
  if (request.destination === "document") {
    return caches.match("/offline.html");
  }
  return new Response(
    JSON.stringify({ offline: true, error: "You are currently offline" }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

// ─────────────────────────────────────────────
//  BACKGROUND SYNC — retry queued requests
// ─────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    console.log("[SW] Background sync triggered — replaying queued requests");
    event.waitUntil(replayQueue());
  }
});

async function replayQueue() {
  // Ask the client to flush its IndexedDB queue
  const clients = await self.clients.matchAll();
  clients.forEach((client) =>
    client.postMessage({ type: "FLUSH_QUEUE" })
  );
}

// ─────────────────────────────────────────────
//  PUSH NOTIFICATIONS (for emergency alerts)
// ─────────────────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title   = data.title   || "GIS Health Alert";
  const options = {
    body:    data.body    || "There is an emergency in your area.",
    icon:    "/icons/icon-192.png",
    badge:   "/icons/badge-72.png",
    tag:     data.tag     || "gis-alert",
    vibrate: [200, 100, 200],
    data:    { url: data.url || "/" },
    actions: [
      { action: "view",    title: "View on Map" },
      { action: "dismiss", title: "Dismiss"     },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "view") {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});

console.log("[SW] Service worker loaded ✓");
