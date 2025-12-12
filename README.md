# Life Butler PWA 🐧

AI 알프레도가 일상을 관리해드려요!

## 🚀 Vercel 배포 방법 (5분)

### Step 1: GitHub 저장소 생성
1. [GitHub](https://github.com/new) 에서 새 저장소 생성
2. 저장소 이름: `life-butler-pwa` (원하는 이름)
3. Public 또는 Private 선택 후 생성

### Step 2: 파일 업로드
**방법 A: GitHub 웹에서 직접 업로드**
1. 저장소 페이지에서 "Add file" → "Upload files" 클릭
2. 이 폴더의 모든 파일을 드래그 앤 드롭
3. `node_modules` 폴더는 **제외** (이미 .gitignore에 추가됨)
4. "Commit changes" 클릭

**방법 B: Git CLI 사용**
```bash
cd life-butler-pwa
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/life-butler-pwa.git
git push -u origin main
```

### Step 3: Vercel 연결
1. [vercel.com](https://vercel.com) 접속 후 GitHub로 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택 (life-butler-pwa)
4. "Deploy" 클릭
5. 1분 후 배포 완료! 🎉

### Step 4: 커스텀 도메인 (선택)
Vercel 대시보드 → Settings → Domains에서 설정 가능

---

## 📁 프로젝트 구조

```
life-butler-pwa/
├── index.html          # 메인 HTML (PWA 설정 포함)
├── app.jsx             # React 앱 전체 코드 (12,400+ 줄)
├── manifest.json       # PWA 매니페스트
├── service-worker.js   # 오프라인 지원
├── offline.html        # 오프라인 페이지
├── vercel.json         # Vercel 배포 설정
├── package.json        # 프로젝트 정보
├── favicon.ico         # 파비콘
├── icons/              # PWA 아이콘들
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-180x180.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── apple-touch-icon.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   └── icon.svg
└── README.md
```

---

## 📱 PWA 설치 방법

### Chrome (Android/Desktop)
1. 배포된 URL 접속
2. 주소창 우측 "설치" 아이콘 클릭
3. 또는 메뉴(⋮) → "앱 설치"

### Safari (iOS)
1. 배포된 URL 접속
2. 공유 버튼 (📤) 탭
3. "홈 화면에 추가" 선택

---

## ⚙️ 로컬 개발

```bash
# 의존성 설치 (아이콘 생성용, 선택사항)
npm install

# 로컬 서버 실행
npx serve .

# 또는
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 🔄 업데이트 배포

코드 수정 후 GitHub에 push하면 Vercel이 자동으로 재배포합니다.

```bash
git add .
git commit -m "Update: 기능 설명"
git push
```

---

## 🎨 테마 커스터마이즈

### 색상 변경
`app.jsx` 상단의 `COLORS` 객체에서 수정:

```javascript
const COLORS = {
  primary: '#A996FF',      // 메인 라벤더
  primaryDark: '#8B7CF7',  // 진한 라벤더
  // ...
};
```

### PWA 테마 색상
`manifest.json`과 `index.html`의 `theme_color` 동시 수정

---

## 🐛 트러블슈팅

### "설치" 버튼이 안 보여요
- HTTPS 환경인지 확인 (Vercel은 자동 HTTPS)
- Chrome DevTools → Application → Manifest 확인

### 오프라인이 안 돼요
- DevTools → Application → Service Workers 확인
- "Update on reload" 체크 후 새로고침

### 수정사항이 반영 안 돼요
- 서비스 워커 캐시 때문일 수 있음
- `service-worker.js`의 `CACHE_NAME` 버전 올리기:
  ```javascript
  const CACHE_NAME = 'life-butler-v2'; // v1 → v2
  ```

---

## 📊 PWA 점수 확인

Chrome DevTools → Lighthouse → PWA 카테고리 실행
목표: 💯

---

## 🛠 기술 스택

- **React 18** (CDN via unpkg)
- **Tailwind CSS** (CDN)
- **Lucide Icons**
- **Babel** (JSX 변환)
- **PWA** (Service Worker + Manifest)

---

## 📝 라이선스

MIT License

---

Made with 💜 by Life Butler Team 🐧
