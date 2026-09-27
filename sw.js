// 오프라인 지원: 인터넷이 되면 항상 최신 파일을 받고, 안 되면 저장해 둔 파일로 열어요.
// 파일을 고쳐 올리면 설치된 앱에도 다음 실행 때 바로 반영돼요.
// 크게 바꿨는데 예전 화면이 남으면 index.html의 ?v= 숫자와 아래 CACHE 숫자를 하나씩 올려 주세요.
const CACHE = 'music-helper-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
  );
});
