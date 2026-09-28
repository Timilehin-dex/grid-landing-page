const CACHE_NAME = "bridge-collective-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./output.css",
    "./script.js",
    "./manifest.json",
    "./assets/fonts/inter/inter-variable.ttf",
    "./assets/images/favicon-32x32.png",
    "./assets/images/icon-menu.svg",
    "./assets/images/icon-close.svg",
    "./assets/images/icon-sparkle.svg",
    "./assets/images/icon-plus.svg",
    "./assets/images/icon-arrow-right.svg",
    "./assets/images/icon-trending-up.svg",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png",
    "./assets/icons/icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// Remove caches from older versions
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Stale-while-revalidate for same-origin GETs: fast + works offline, but updates itself
self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        caches.match(request).then((cached) => {
            const network = fetch(request)
                .then((response) => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached || (request.mode === "navigate" ? caches.match("./index.html") : undefined));
            return cached || network;
        })
    );
});
