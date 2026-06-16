/**
 * pwa.js
 * ──────────────────────────────────────────────────────────────────────
 * Drop this file into your React project at:  src/pwa.js
 *
 * Then call  registerPWA()  from  src/index.jsx  after rendering.
 *
 * Handles:
 *  - Service Worker registration
 *  - IndexedDB request queue (for offline POST requests)
 *  - Online/offline event handling
 *  - Sync queue replay when connection returns
 */

// ─────────────────────────────────────────────
//  IndexedDB wrapper for offline request queue
// ─────────────────────────────────────────────
const DB_NAME    = "gis-offline-db";
const DB_VERSION = 1;
const STORE_NAME = "request-queue";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

async function enqueueRequest(requestData) {
  const db   = await openDB();
  const tx   = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.add(requestData);
  return new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror    = rej;
  });
}

async function getAllQueued() {
  const db    = await openDB();
  const tx    = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((res, rej) => {
    const req  = store.getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

async function clearQueue() {
  const db    = await openDB();
  const tx    = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).clear();
}

// ─────────────────────────────────────────────
//  Replay queued requests when back online
// ─────────────────────────────────────────────
async function replayQueuedRequests() {
  const queue = await getAllQueued();
  if (queue.length === 0) return;

  console.log(`[PWA] Replaying ${queue.length} queued request(s)...`);
  let allSuccess = true;

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method:  item.method,
        headers: item.headers,
        body:    item.body,
      });
      if (!response.ok) {
        allSuccess = false;
        console.warn(`[PWA] Queued request failed: ${item.url} → ${response.status}`);
      } else {
        console.log(`[PWA] Replayed: ${item.url}`);
      }
    } catch (err) {
      allSuccess = false;
      console.warn("[PWA] Replay error:", err);
    }
  }

  if (allSuccess) {
    await clearQueue();
    console.log("[PWA] Queue cleared ✓");
  }
}

// ─────────────────────────────────────────────
//  Service Worker registration
// ─────────────────────────────────────────────
export function registerPWA() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[PWA] Service workers not supported.");
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        { scope: "/" }
      );
      console.log("[PWA] Service Worker registered:", registration.scope);

      // Listen for messages from the SW
      navigator.serviceWorker.addEventListener("message", async (event) => {
        const { type, payload } = event.data || {};

        if (type === "QUEUE_REQUEST") {
          // SW asked us to store a failed request
          await enqueueRequest(payload);
          console.log("[PWA] Request queued for sync:", payload.url);

          // Register a background sync if supported
          if ("SyncManager" in window) {
            await registration.sync.register("gis-sync-queue");
          }
        }

        if (type === "FLUSH_QUEUE") {
          // SW triggered a sync — replay now
          await replayQueuedRequests();
        }
      });

      // Detect SW updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New version available — optionally notify user
            console.log("[PWA] New version available. Refresh to update.");
            window.dispatchEvent(new CustomEvent("pwa-update-available"));
          }
        });
      });
    } catch (err) {
      console.error("[PWA] Service Worker registration failed:", err);
    }
  });

  // ── Online / Offline events ──────────────────
  window.addEventListener("online", async () => {
    console.log("[PWA] Back online — replaying queue...");
    window.dispatchEvent(new CustomEvent("app-online"));
    await replayQueuedRequests();
  });

  window.addEventListener("offline", () => {
    console.log("[PWA] Gone offline.");
    window.dispatchEvent(new CustomEvent("app-offline"));
  });
}

// ─────────────────────────────────────────────
//  React hook — use in any component
// ─────────────────────────────────────────────
/**
 * Usage:
 *   import { useOnlineStatus } from './pwa';
 *   const isOnline = useOnlineStatus();
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online",  on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return isOnline;
}

// Import React lazily so this file can be used without React too
let React;
try { React = require("react"); } catch (_) {}
