// 오프라인 지원: 인터넷이 되면 항상 최신 파일을 받고, 안 되면 저장해 둔 파일로 열어요.
// 그래서 파일을 고쳐 올리면 설치된 앱에도 다음 실행 때 바로 반영돼요.
const CACHE = 'guitar-dogam';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
