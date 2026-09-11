// RUXS Progressive Web App Service Worker (Edge / Offline Shell)
const CACHE_NAME = "ruxs-app-v1";
const OFFLINE_FALLBACK = "/offline";

const STATIC_PRECACHE = [
  "/",
  OFFLINE_FALLBACK,
  "/manifest.webmanifest",
  "/favicon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NEVER cache dynamic financial or auth API routes
  if (url.pathname.startsWith("/api/")) {
    return; // Pass through to network
  }

  // 2. Navigation requests: Network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_FALLBACK).then((fallback) => {
          return fallback || new Response("Offline — Please check internet connection", {
            headers: { "Content-Type": "text/plain" },
          });
        });
      })
    );
    return;
  }

  // 3. Static assets: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
