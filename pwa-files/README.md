# Life Butler PWA 설정 가이드 🐧

## 📁 파일 구조

```
life-butler-pwa/
├── index.html          # 메인 HTML (PWA 메타태그 포함)
├── manifest.json       # PWA 매니페스트
├── service-worker.js   # 서비스 워커 (오프라인 지원)
├── offline.html        # 오프라인 페이지
├── app.jsx             # React 앱 (life-butler-rich-briefing.jsx 복사)
└── icons/              # 앱 아이콘 (생성 필요)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png
    └── favicon.ico
```

## 🚀 배포 방법

### 방법 1: Vercel (추천)

1. GitHub에 저장소 생성
2. 파일 업로드
3. [vercel.com](https://vercel.com) 연결
4. 자동 배포!

```bash
# 또는 CLI로
npm i -g vercel
vercel
```

### 방법 2: Netlify

1. [netlify.com](https://netlify.com) 접속
2. 폴더 드래그 앤 드롭
3. 완료!

### 방법 3: GitHub Pages

1. 저장소 Settings → Pages
2. Source: main branch
3. 배포 완료

## 🎨 아이콘 생성

### 자동 생성 (추천)

[RealFaviconGenerator](https://realfavicongenerator.net/) 사용:

1. 512x512 원본 이미지 준비 (투명 배경 PNG)
2. 사이트에서 업로드
3. 설정 조정 후 생성
4. ZIP 다운로드 → icons 폴더에 추가

### 수동 생성

512x512 PNG 원본에서 리사이즈:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

## ⚙️ 설정 커스터마이즈

### manifest.json

```json
{
  "name": "앱 전체 이름",
  "short_name": "홈 화면에 표시될 이름",
  "theme_color": "#A996FF",    // 상태 바 색상
  "background_color": "#F0EBFF" // 스플래시 배경
}
```

### 테마 색상

라벤더 계열 (기본):
- Primary: #A996FF
- Background: #F0EBFF

변경 시 `index.html`의 `<meta name="theme-color">`도 수정

## 📱 설치 테스트

### Chrome (Android/Desktop)
1. 앱 접속
2. 주소창 우측 "설치" 아이콘 클릭
3. 또는 메뉴 → "앱 설치"

### Safari (iOS)
1. 앱 접속
2. 공유 버튼 (📤) 탭
3. "홈 화면에 추가" 선택

### 확인 사항
- [ ] 홈 화면 아이콘 표시
- [ ] 스플래시 스크린 표시
- [ ] 전체 화면 (standalone) 실행
- [ ] 오프라인 시 offline.html 표시

## 🔧 서비스 워커 업데이트

새 버전 배포 시:

1. `service-worker.js`의 `CACHE_NAME` 변경
```javascript
const CACHE_NAME = 'life-butler-v2'; // v1 → v2
```

2. 사용자에게 업데이트 알림 자동 표시

## 🐛 트러블슈팅

### "설치" 버튼이 안 보여요
- HTTPS 필수 (localhost는 예외)
- manifest.json 경로 확인
- Chrome DevTools → Application → Manifest 확인

### 오프라인이 안 돼요
- service-worker.js 등록 확인
- DevTools → Application → Service Workers
- "Update on reload" 체크

### 아이콘이 안 보여요
- icons 폴더 경로 확인
- manifest.json의 icon 경로 확인
- PNG 형식인지 확인

## 📊 PWA 점수 확인

Chrome DevTools → Lighthouse → PWA 카테고리 실행

목표: 100점!

---

질문이나 이슈: [GitHub Issues](https://github.com/your-repo/issues)

Made with 💜 by Life Butler Team 🐧
