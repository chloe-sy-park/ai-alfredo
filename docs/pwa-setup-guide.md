# PWA 설정 가이드

## 🚧 현재 상태
PWA 기능은 빌드 에러 해결을 위해 일시적으로 비활성화되었습니다.

## 📦 필요한 패키지
```bash
npm install -D vite-plugin-pwa
npm install workbox-precaching workbox-routing workbox-strategies workbox-expiration
```

## 🔧 활성화 방법

1. 패키지 설치
2. `vite.config.js.backup` → `vite.config.js`로 복원
3. `src/sw.js.backup` → `src/sw.js`로 복원
4. 필요한 아이콘 파일 추가:
   - `/public/icons/icon-192x192.png`
   - `/public/icons/icon-512x512.png`
   - `/public/alfredo-badge.svg`

## 📱 PWA 기능

### 1. 오프라인 지원
- Workbox를 통한 캐싱 전략
- API 응답 캐싱
- 정적 자원 캐싱

### 2. 푸시 알림
- 아침/저녁 브리핑
- 태스크 리마인더
- 일정 알림
- 휴식 제안

### 3. 홈 화면 설치
- 네이티브 앱처럼 설치 가능
- 전체 화면 모드 지원
- 커스텀 스플래시 화면

## 🎯 구현 시기
3주 개발 계획 Week 3에 구현 예정