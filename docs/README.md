# 📚 AI Alfredo 기술 문서

> Life Butler의 AI 펭귄 버틀러 "알프레도" 프로젝트 기술 문서

## 📊 현재 상태

| 항목 | 상태 |
|------|------|
| W1-W4 로드맵 | ✅ 100% 완료 |
| W7 리디자인 | 🚧 진행 중 (목업 기반) |
| 알프레도 육성 시스템 | 🚧 Phase 1 구현 완료 |
| 프로덕션 URL | https://ai-alfredo.vercel.app |
| GitHub | https://github.com/chloe-sy-park/ai-alfredo |
| 최종 업데이트 | 2025-01-14 |

### 🐧 알프레도 육성 시스템 진행 상황

| Phase | 상태 | 내용 |
|-------|------|------|
| **Phase 1** | ✅ 완료 | 4축 슬라이더 + 배운 것 리스트 + 이해도 게이지 |
| Phase 2 | ⏳ 예정 | 대화로 가르치기 + "기억해둘게요" 시스템 |
| Phase 3 | ⏳ 예정 | 영역별 다른 스타일 + 주간 성장 리포트 |

---

## 📁 문서 목록

### 🎯 핵심 설계
| 번호 | 문서 | 설명 |
|------|------|------|
| 01 | [decisions.md](./01-decisions.md) | 핵심 의사결정 기록 |
| 02 | [prompt-design.md](./02-prompt-design.md) | 프롬프트 설계 |
| 03 | [tone-system.md](./03-tone-system.md) | 알프레도 톤 시스템 |
| 04 | [briefing-algorithm.md](./04-briefing-algorithm.md) | 브리핑 알고리즘 |
| 05 | [priority-logic.md](./05-priority-logic.md) | 우선순위 로직 |

### 🔧 백엔드
| 번호 | 문서 | 설명 |
|------|------|------|
| 06 | [database-schema.md](./06-database-schema.md) | 데이터베이스 스키마 |
| 07 | [notification-system.md](./07-notification-system.md) | 알림 시스템 |
| 08 | [api-architecture.md](./08-api-architecture.md) | API 아키텍처 |
| 09 | [google-integration.md](./09-google-integration.md) | Google 연동 |
| 17 | [api-specification.md](./17-api-specification.md) | API 명세서 |

### 💻 프론트엔드
| 번호 | 문서 | 설명 |
|------|------|------|
| 10 | [client-architecture.md](./10-client-architecture.md) | 클라이언트 아키텍처 |
| 13 | [user-journey-map.md](./13-user-journey-map.md) | 사용자 여정 맵 |
| 14 | [information-architecture.md](./14-information-architecture.md) | 정보 구조 (v1 - 하단 탭) |
| **20** | [**onboarding-ia-design-v2.md**](./20-onboarding-ia-design-v2.md) | **🆕 온보딩 + IA 설계 v2 (목업 기반)** |

### 🐧 AI & 알프레도
| 번호 | 문서 | 설명 |
|------|------|------|
| 15 | [proactive-conversation-system.md](./15-proactive-conversation-system.md) | 선제적 대화 시스템 |
| 16 | [prompt-engineering.md](./16-prompt-engineering.md) | 프롬프트 엔지니어링 |
| **19** | [**alfredo-nurturing-system.md**](./19-alfredo-nurturing-system.md) | **🐧 알프레도 육성 시스템** |

### 📋 관리
| 번호 | 문서 | 설명 |
|------|------|------|
| 11 | [implementation-roadmap.md](./11-implementation-roadmap.md) | 구현 로드맵 |
| 18 | [progress-log.md](./18-progress-log.md) | 개발 진행 로그 |
| 27 | [implementation-roadmap-v2.md](./27-implementation-roadmap-v2.md) | 구현 로드맵 v2 |
| **28** | [**document-vs-implementation.md**](./28-document-vs-implementation.md) | **📊 문서 vs 구현 상태 비교** |

---

## 🗂️ 코드베이스 구조

```
src/
├── components/          # React 컴포넌트 (46개 파일)
│   ├── home/           # 홈 화면
│   ├── work/           # 업무 페이지
│   ├── calendar/       # 캘린더
│   ├── chat/           # 알프레도 채팅
│   ├── alfredo/        # 🆕 알프레도 육성 시스템
│   │   ├── AlfredoStyleSettings.jsx
│   │   ├── AlfredoLearnings.jsx
│   │   ├── AlfredoUnderstanding.jsx
│   │   └── index.js
│   ├── gamification/   # 게이미피케이션
│   ├── settings/       # 설정
│   └── ...
├── stores/             # Zustand 스토어
├── hooks/              # 커스텀 훅
├── data/               # Mock 데이터
└── App.jsx             # 메인 앱
```

---

## 🔗 빠른 링크

- **프로덕션**: https://ai-alfredo.vercel.app
- **GitHub**: https://github.com/chloe-sy-park/ai-alfredo
- **Vercel Dashboard**: https://vercel.com/chloe-sy-park/ai-alfredo

---

## 📝 문서 작성 가이드

### 새 문서 추가 시
1. `docs/` 폴더에 `XX-문서명.md` 형식으로 생성
2. 이 README에 목록 추가
3. 관련 문서 링크 연결

### 커밋 컨벤션
```
📝 docs: 문서 추가/수정
✨ feat: 새 기능
🐛 fix: 버그 수정
💄 style: UI/스타일
♻️ refactor: 리팩토링
🐧 alfredo: 알프레도 관련
📐 design: 설계/IA 관련
```

---

*마지막 업데이트: 2025-01-14*
