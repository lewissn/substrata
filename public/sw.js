// Substrata service worker
// Hand-crafted to work with Next.js 16 (Turbopack) without webpack plugins.
//
// Strategy:
//   • Pre-cache: manifest + icons (small, stable)
//   • Runtime:   same-origin JS/CSS → CacheFirst; navigation → NetworkFirst
//   • External:  Mapbox tiles, Wikipedia, OSM, PBDB → NetworkOnly (never cached)
//   • /api/*:    NetworkFirst with fallback to cache

const CACHE = "substrata-v1";

const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-180.png",
];

// Hosts that must never be cached (tile bloat / stale geodata risk)
const NETWORK_ONLY_HOSTS = [
  "mapbox.com",
  "wikipedia.org",
  "nominatim.openstreetmap.org",
  "paleobiodb.org",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  // Do NOT call skipWaiting() here — let SwUpdateToast drive explicit updates
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Message — explicit skip-waiting from SwUpdateToast ───────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // External services → let the browser handle them (NetworkOnly)
  if (NETWORK_ONLY_HOSTS.some((host) => url.hostname.endsWith(host))) return;

  // Same-origin only beyond this point
  if (url.origin !== self.location.origin) return;

  // /api/* → NetworkFirst (fresh data, fall back to cache if offline)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets (/_next/static/) → CacheFirst
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(CACHE).then((c) => c.put(request, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // Navigation / HTML → NetworkFirst (always try for fresh shell)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request) ?? caches.match("/"))
    );
  }
});
