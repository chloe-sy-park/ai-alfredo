// Life Butler Service Worker - 푸시 알림 & 캐싱
// 이 파일은 VitePWA의 injectManifest 모드에서 사용됩니다

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Workbox 프리캐싱 (빌드 시 자동 주입)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ===== 캐싱 전략 =====

// JS/CSS - 네트워크 우선
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new NetworkFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60, // 24시간
      }),
    ],
  })
);

// 이미지 - 캐시 우선
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
      }),
    ],
  })
);

// API 요청 - Stale While Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5분
      }),
    ],
  })
);

// ===== 푸시 알림 =====

// 푸시 메시지 수신
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: '🐧 알프레도',
    body: '새로운 알림이 있어요!',
    icon: '/icons/icon-192x192.png',
    badge: '/alfredo-badge.svg',
    tag: 'alfredo-push',
    requireInteraction: false,
    actions: []
  };
  
  // 푸시 데이터 파싱
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  // 알림 유형별 처리
  if (data.type === 'task') {
    data.title = '✅ ' + (data.taskTitle || '태스크 알림');
    data.actions = [
      { action: 'complete', title: '완료' },
      { action: 'snooze', title: '10분 후' }
    ];
  } else if (data.type === 'event') {
    data.title = '📅 ' + (data.eventTitle || '일정 알림');
    data.actions = [
      { action: 'view', title: '보기' },
      { action: 'dismiss', title: '닫기' }
    ];
  } else if (data.type === 'break') {
    data.title = '🐧 알프레도가 말해요';
    data.body = '잠깐 스트레칭 어때요?';
    data.requireInteraction = true;
    data.actions = [
      { action: 'break', title: '휴식하기' },
      { action: 'skip', title: '조금 더' }
    ];
  } else if (data.type === 'morning') {
    data.title = '☀️ 좋은 아침이에요, Boss!';
    data.requireInteraction = true;
    data.actions = [
      { action: 'briefing', title: '브리핑 보기' }
    ];
  } else if (data.type === 'evening') {
    data.title = '🌙 하루 마무리 시간이에요';
    data.actions = [
      { action: 'review', title: '리뷰하기' }
    ];
  }
  
  const showNotification = self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    actions: data.actions,
    data: data, // 클릭 시 사용할 데이터 저장
    vibrate: [200, 100, 200]
  });
  
  event.waitUntil(showNotification);
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;
  
  notification.close();
  
  // 액션별 처리
  let urlToOpen = '/';
  
  if (action === 'complete' && data.taskId) {
    // 태스크 완료 처리 (앱에서 처리)
    urlToOpen = '/?action=completeTask&id=' + data.taskId;
  } else if (action === 'snooze' && data.taskId) {
    // 스누즈 처리
    urlToOpen = '/?action=snoozeTask&id=' + data.taskId;
  } else if (action === 'view' && data.eventId) {
    urlToOpen = '/?view=calendar&event=' + data.eventId;
  } else if (action === 'briefing') {
    urlToOpen = '/?view=chat&briefing=morning';
  } else if (action === 'review') {
    urlToOpen = '/?view=chat&briefing=evening';
  } else if (action === 'break') {
    urlToOpen = '/?action=startBreak';
  } else if (data.type === 'task') {
    urlToOpen = '/?view=work';
  } else if (data.type === 'event') {
    urlToOpen = '/?view=calendar';
  }
  
  // 앱 열기 또는 포커스
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clientList) {
          if ('focus' in client) {
            return client.focus().then(() => {
              client.navigate(urlToOpen);
            });
          }
        }
        // 없으면 새 창 열기
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// 알림 닫힘 처리
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ===== 서비스 워커 생명주기 =====

// 설치
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// 활성화
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// 메시지 수신 (앱에서 SW로)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // 스케줄된 알림 처리
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, notification } = event.data;
    setTimeout(() => {
      self.registration.showNotification(notification.title, notification);
    }, delay);
  }
});
