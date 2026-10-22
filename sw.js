const VERSION = 'bt-cac9065c9e';
// The data files are in the install list too: on the first visit the page fetches them before
// this worker is in control, so without this the app would not work offline until a second visit.
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'tape-5m-1.json', 'tape-5m-2.json', 'tape-1m-1.json', 'tape-1m-2.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const put = (req, res) => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/\/tape-[15]m-\d+\.json$/.test(url.pathname) || url.host.endsWith('gstatic.com') || url.host === 'fonts.googleapis.com') {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => put(req, res))));
  } else if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => put(req, res)).catch(() => caches.match(req).then(hit => hit || caches.match('index.html'))));
  }
});
