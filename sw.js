// مكتبة الروان — يجعل الواجهة تفتح حتى مع ضعف الإنترنت. الطلبات نفسها تحتاج اتصالاً دائماً.
const CACHE = 'rawan-v15';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.json', 'icon2-192.png', 'icon2-512.png', 'splash.jpg', 'apple-touch-icon2.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || /staff-|panel\.|captain|orders/.test(u.pathname)) return; // الخادم والخطوط تمر مباشرة
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
