// Life Butler Service Worker v1.0.0
const CACHE_NAME = 'life-butler-v1';
const OFFLINE_URL = '/offline.html';

// 캐시할 리소스 목록
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 설치 이벤트
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] 설치 중...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] 정적 리소스 캐싱');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[ServiceWorker] 설치 완료!');
        return self.skipWaiting();
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] 활성화 중...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[ServiceWorker] 오래된 캐시 삭제:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] 활성화 완료!');
        return self.clients.claim();
      })
  );
});

// Fetch 이벤트 (네트워크 요청 가로채기)
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시하지 않음
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('anthropic.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 캐시에 있으면 캐시에서 반환
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // 없으면 네트워크 요청
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답인지 확인
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 응답 복제 (캐시용 + 반환용)
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // 오프라인이고 HTML 요청이면 오프라인 페이지 반환
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// 푸시 알림 이벤트
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] 푸시 알림 수신');
  
  let data = { title: 'Life Butler', body: '알프레도가 알림을 보냈어요!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'open', title: '열기' },
      { action: 'close', title: '닫기' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] 알림 클릭');
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 백그라운드 동기화 이벤트
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] 백그라운드 동기화:', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

// 태스크 동기화 함수 (placeholder)
async function syncTasks() {
  console.log('[ServiceWorker] 태스크 동기화 시작...');
  // 실제 구현 시 여기서 서버와 동기화
  return Promise.resolve();
}

console.log('[ServiceWorker] 로드됨');
