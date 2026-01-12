/**
 * 알프레도 서비스 워커
 * PWA 푸시 알림 및 오프라인 지원
 */

const CACHE_NAME = 'alfredo-v1';
const OFFLINE_URL = '/offline.html';

// 캐시할 정적 파일들
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/alfredo-icon.svg',
  '/manifest.json'
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 푸시 알림 수신
self.addEventListener('push', (event) => {
  let data = {
    title: '🐧 알프레도',
    body: '알림이 도착했어요!',
    icon: '/alfredo-icon.svg',
    badge: '/alfredo-badge.svg',
    tag: 'alfredo-notification',
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/alfredo-icon.svg',
    badge: data.badge || '/alfredo-badge.svg',
    tag: data.tag || 'alfredo-notification',
    data: data.data || {},
    vibrate: [100, 50, 100],
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  // 알림 타입에 따른 URL 결정
  switch (data.type) {
    case 'morning_briefing':
      url = '/?briefing=morning';
      break;
    case 'meeting_reminder':
      url = '/work';
      break;
    case 'task_reminder':
      url = '/work';
      break;
    case 'break_reminder':
      url = '/?action=break';
      break;
    case 'evening_wrap':
      url = '/?briefing=evening';
      break;
    case 'body_doubling':
      url = '/?action=focus';
      break;
    default:
      url = '/';
  }

  // 액션 버튼 클릭 처리
  if (event.action) {
    switch (event.action) {
      case 'start_focus':
        url = '/?action=focus';
        break;
      case 'snooze':
        // 5분 후 다시 알림 (클라이언트에서 처리)
        url = '/?action=snooze&minutes=5';
        break;
      case 'dismiss':
        return;
      case 'view':
        // 기본 URL 사용
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', data: data });
          return client.focus();
        }
      }
      // 없으면 새 창 열기
      return clients.openWindow(url);
    })
  );
});

// 알림 닫기 처리
self.addEventListener('notificationclose', (event) => {
  // 분석용 이벤트 전송 가능
  console.log('Notification closed:', event.notification.tag);
});

// 메시지 수신 (클라이언트 → 서비스 워커)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, notification } = event.data;
    
    setTimeout(() => {
      self.registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/alfredo-icon.svg',
        badge: '/alfredo-badge.svg',
        tag: notification.tag || 'alfredo-scheduled',
        data: notification.data || {},
        vibrate: [100, 50, 100]
      });
    }, delay);
  }
});

// 네트워크 요청 처리 (오프라인 지원)
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시하지 않음
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // 오프라인이고 HTML 요청인 경우
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
