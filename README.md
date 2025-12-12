# Life Butler PWA 🐧

AI 알프레도가 일상을 관리해드려요!

## 🚀 Vercel 배포 방법

### 1. GitHub 저장소에 업로드
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/life-butler-pwa.git
git push -u origin main
```

### 2. Vercel 연결
1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. "Add New Project" → 저장소 선택
3. **Framework Preset: Vite** 자동 감지됨
4. "Deploy" 클릭
5. 완료! 🎉

---

## 📁 프로젝트 구조

```
life-butler-vite/
├── public/
│   ├── icons/           # PWA 아이콘
│   └── favicon.ico
├── src/
│   ├── App.jsx          # 메인 앱 (12,400+ 줄)
│   ├── main.jsx         # 엔트리 포인트
│   └── index.css        # Tailwind CSS
├── index.html           # HTML 템플릿
├── vite.config.js       # Vite + PWA 설정
├── tailwind.config.js   # Tailwind 설정
├── postcss.config.js    # PostCSS 설정
├── package.json
└── vercel.json          # Vercel 배포 설정
```

---

## ⚙️ 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

---

## 🛠 기술 스택

- **Vite** - 빌드 도구
- **React 18**
- **Tailwind CSS**
- **Lucide Icons**
- **Vite PWA Plugin** - PWA 지원

---

Made with 💜 by Life Butler Team 🐧
