const CACHE = 'ema-centro-v2';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const req = e.request;
  const esHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (esHTML) {
    e.respondWith(
      fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })
        .catch(() => caches.match(req).then(h => h || caches.match('./index.html')))
    );
  } else {
    e.respondWith(caches.match(req).then(h => h || fetch(req)));
  }
});
