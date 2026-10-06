self.VERSION='mada-v1';
self.PREFIX='./';
self.CORE=["./index.html","./whatsapp.svg"];
self.IMGS=["img/corolla-1.jpg","img/corolla-2.jpg","img/corolla-3.jpg","img/corolla-4.jpg","img/corolla-5.jpg","img/corolla-6.jpg","img/yaris-1.jpg","img/yaris-2.jpg","img/yaris-3.jpg","img/yaris-4.jpg","img/yaris-5.jpg","img/yaris-6.jpg","img/prado-1.jpg","img/prado-2.jpg","img/prado-3.jpg","img/prado-4.jpg","img/prado-5.jpg","img/prado-6.jpg","img/camry-1.jpg","img/camry-2.jpg","img/camry-3.jpg","img/camry-4.jpg","img/camry-5.jpg","img/camry-6.jpg","img/mazda3-1.jpg","img/mazda3-2.jpg","img/mazda3-3.jpg","img/mazda3-4.jpg","img/mazda3-5.jpg","img/mazda3-6.jpg","img/cx5-1.jpg","img/cx5-2.jpg","img/cx5-3.jpg","img/cx5-4.jpg","img/cx5-5.jpg","img/cx5-6.jpg","img/accent-1.jpg","img/accent-2.jpg","img/accent-3.jpg","img/accent-4.jpg","img/accent-5.jpg","img/accent-6.jpg","img/tucson-1.jpg","img/tucson-2.jpg","img/tucson-3.jpg","img/tucson-4.jpg","img/tucson-5.jpg","img/tucson-6.jpg","img/byd-1.jpg","img/byd-2.jpg","img/byd-3.jpg","img/byd-4.jpg","img/byd-5.jpg","img/byd-6.jpg","img/geely-1.jpg","img/geely-2.jpg","img/geely-3.jpg","img/geely-4.jpg","img/geely-5.jpg","img/geely-6.jpg","img/mg-1.jpg","img/mg-2.jpg","img/mg-3.jpg","img/mg-4.jpg","img/mg-5.jpg","img/mg-6.jpg","img/woo-1.jpg","img/woo-2.jpg","img/woo-3.jpg","img/woo-4.jpg","img/woo-5.jpg","img/woo-6.jpg"];
self.FONTS=["fonts/cairo-arabic-400.woff2","fonts/cairo-arabic-600.woff2","fonts/cairo-arabic-700.woff2","fonts/cairo-arabic-900.woff2","fonts/cairo-latin-400.woff2","fonts/cairo-latin-600.woff2","fonts/cairo-latin-700.woff2","fonts/cairo-latin-900.woff2"];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(self.VERSION).then(function (c) {
      return Promise.all(
        self.CORE.concat(self.IMGS, self.FONTS).map(function (u) {
          return fetch(u)
            .then(function (r) { if (r && r.ok) return c.put(u, r); return null; })
            .catch(function () { return null; });
        })
      );
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== self.VERSION; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) { updateInBackground(req); return hit; }
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var cp = res.clone();
            caches.open(self.VERSION).then(function (c) { c.put(req, cp); });
          }
          return res;
        }).catch(function () { return caches.match(self.PREFIX + 'index.html'); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && url.pathname.indexOf('sw.js') === -1) {
          var cp = res.clone();
          caches.open(self.VERSION).then(function (c) { c.put(req, cp); });
        }
        return res;
      }).catch(function () { return Response.error(); });
    })
  );
});

function updateInBackground(req) {
  var url = req.url;
  caches.open(self.VERSION).then(function (c) {
    c.match(url).then(function (old) {
      fetch(req).then(function (res) {
        if (res && res.ok)
          res.blob().then(function (b) {
            c.put(url, new Response(b, { headers: { 'Content-Type': res.headers.get('Content-Type') || 'text/html; charset=utf-8' } }));
          });
      }).catch(function () {});
    });
  });
}
