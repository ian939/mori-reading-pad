const CACHE = "mori-book-forest-v5";
const ROOT = self.location.pathname.replace(/sw\.js$/, "");
const SHELL = [
  ROOT,
  `${ROOT}manifest.webmanifest`,
  `${ROOT}assets/mori-mascot.png`,
  `${ROOT}assets/money-cover-v2.png`,
  `${ROOT}assets/origin-cover-v2.png`,
  `${ROOT}assets/money-situation-v1.png`,
  `${ROOT}assets/origin-situation-v1.png`,
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached || caches.match(ROOT)),
      ),
  );
});
