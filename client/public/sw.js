// Minimal app-shell service worker. Only registered in production builds (see
// client/src/main.tsx) -- dev always talks straight to the Vite server.
//
// Strategy:
//  - navigations (typed URL, refresh, PWA launch): network-first, falling back to the
//    cached shell when offline, so the app still opens without a connection.
//  - hashed build assets (/assets/...): cache-first -- the filename changes on every
//    build, so a cached copy is never stale.
//  - everything else same-origin: network-first with a cache fallback.
//
// Bump CACHE_NAME when this strategy changes; old caches are dropped on activate.
const CACHE_NAME = "prompt-folio-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(new URL("./", self.registration.scope)))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
    ])
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(new URL("./", self.registration.scope), clone));
          return response;
        })
        .catch(() => caches.match(new URL("./", self.registration.scope)))
    );
    return;
  }

  if (new URL(request.url).pathname.includes("/assets/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
