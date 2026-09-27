var CACHE = "ayu-v1";
var SHELL = ["/ayumusic.html", "/library.html", "/liked.html", "/genres.html", "/insights.html", "/downloads.html", "/ayu-offline.js", "/favicon.ico"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.indexOf("/_next/static/") === 0) {
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (r) { var c = r.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); return r; });
    }));
    return;
  }
  // Pages: network first, fall back to cache when offline
  e.respondWith(fetch(req).then(function (r) {
    if (r.ok) { var c = r.clone(); caches.open(CACHE).then(function (k) { k.put(req, c); }); }
    return r;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || (req.mode === "navigate" ? caches.match("/downloads.html") : Response.error());
    });
  }));
});
