// مكتبة الروان — يجعل الواجهة تفتح حتى مع ضعف الإنترنت. الطلبات نفسها تحتاج اتصالاً دائماً.
const CACHE = 'rawan-v24';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.json', 'icon2-192.png', 'icon2-512.png', 'splash.jpg', 'apple-touch-icon2.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || /staff-|panel\.|captain|orders|hesab/.test(u.pathname)) return; // الخادم والخطوط تمر مباشرة
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});

// إشعارات الروان: تصل من Firebase كبيانات، ونعرضها نحن بشعار المكتبة.
self.addEventListener('push', e => {
  let j = {}; try { j = e.data ? e.data.json() : {}; } catch (x) { j = { data: { body: e.data ? e.data.text() : '' } }; }
  const d = j.data || j, n = j.notification || {};
  const title = d.title || n.title || 'مكتبة الروان', body = d.body || n.body || '';
  e.waitUntil(self.registration.showNotification(title, { body, icon: 'icon2-192.png', badge: 'icon2-192.png', dir: 'rtl', lang: 'ar', tag: 'rawan-' + Date.now(), data: { url: d.url || './index.html' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './index.html', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.startsWith(self.registration.scope) && 'focus' in w) return w.focus();
    return clients.openWindow(url);
  }));
});
