# 🐧 AlFredo 리디자인 인수인계 문서

> **작성일**: 2025-01-14  
> **작성자**: Claude (with Chloe)  
> **목적**: 목업 기반 전면 리디자인 작업 인수인계

---

## 📋 목차

1. [프로젝트 현황](#프로젝트-현황)
2. [완료된 작업](#완료된-작업)
3. [핵심 설계 결정사항](#핵심-설계-결정사항)
4. [앞으로 해야 할 작업](#앞으로-해야-할-작업)
5. [참고 자료](#참고-자료)

---

## 🎯 프로젝트 현황

### 기본 정보

| 항목 | 내용 |
|------|------|
| **프로덕션 URL** | https://ai-alfredo.vercel.app |
| **GitHub** | https://github.com/chloe-sy-park/ai-alfredo |
| **Branch** | main |
| **W1-W6** | ✅ 완료 (라이트모드, 디자인시스템) |
| **W7** | 🚧 진행 중 (목업 기반 리디자인) |

### 디자인 시스템

| 요소 | 값 |
|------|-----|
| 배경색 | #F5F5F5 (라이트 그레이) |
| Primary | #A996FF (라벤더) |
| CTA 버튼 | 노란색 (#FFD43B) 또는 검정 |
| 폰트 | Apple 스타일 (SF Pro 계열) |

---

## ✅ 완료된 작업

### 1. 목업 분석 (2025-01-14)

#### Google AI Studio 목업
- **URL**: https://ai.studio/apps/drive/1kIhztsgkTw_dqAyf8yhkHVLC8rfPDPJu
- **분석 내용**: 온보딩 4단계, 홈 화면, 캘린더, Work Mode, Life Mode, Report 페이지
- **특징**: 노란 CTA, 원형 진행률, 펭귄 FAB, 바차트 인사이트

#### Figma 목업
- **URL**: https://www.figma.com/make/oqBX18OXWvM4lTS0quYyTp/AlFredo-AI-Mentor-OS
- **분석 내용**: 온보딩 5단계, 홈, Work Mode, Work OS, Life OS, Report Space
- **특징**: 검정 CTA, Focused 뱃지, 타임라인 플레이버튼, Incoming Signals

### 2. 온보딩 플로우 설계

**5단계 구조 확정** (Figma 기반 + Google AI 비주얼 통합):

| 단계 | 이름 | 목적 | 핵심 컨텐츠 |
|------|------|------|------------|
| 1 | 웰컴 | 관계 형성 | "도구가 아니라 관계입니다" |
| 2 | 가치 소개 | 기능 이해 | 우선순위 / 집중 / 패턴 (3카드) |
| 3 | 방향 선택 | 개인화 시작 | 일 중심 / 삶 중심 / 둘 다 / 잘 모르겠어요 |
| 4 | 개입 방식 | 기대치 설정 | 미루기방지 / 번아웃방지 / 경계보호 (3시나리오) |
| 5 | 성장형 | 성장 약속 | "5%에서 시작, 함께 성장" |

**방향 선택 → 초기 설정 영향**:

| 선택 | 홈 기본 모드 | 브리핑 톤 | 우선순위 가중치 |
|------|------------|----------|---------------|
| 일 중심 | Work Mode | 생산성 중심 | 업무 태스크 ↑ |
| 삶 중심 | Life Mode | 웰빙 중심 | 라이프 이벤트 ↑ |
| 둘 다 | Balanced | 균형 잡힌 | 동등 |
| 잘 모르겠어요 | Auto | 적응형 | AI 판단 |

### 3. IA (Information Architecture) 설계

**핵심 변경: 하단 탭 → 드로어 + 플로팅바**

#### 기존 vs 새 설계

| 구분 | 기존 | 새 설계 |
|------|------|--------|
| 메인 네비 | 하단 탭 5개 (항상 노출) | 햄버거 → 오른쪽 드로어 (숨김) |
| 플로팅 | FAB 펭귄 1개 | 채팅 입력 + 퀵액션 (통합 바) |
| 핵심 인터랙션 | 탭 전환 | 채팅 + 퀵액션 |
| 화면 활용 | 하단 60px 점유 | 전체 화면 활용 |

#### 플로팅 바 설계

```
[기본 상태]
┌──────────────────────────────┐ ┌──┐
│  AlFredo에게 물어보세요...    │ │⚡│
└──────────────────────────────┘ └──┘

        ↓ ⚡ 클릭 (300ms 애니메이션)

[퀵액션 확장 상태]
┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
│💬│ │➕│ │😊│ │📝│ │⏱│ │📅│
└──┘ └──┘ └──┘ └──┘ └──┘ └──┘
채팅  태스크 컨디션 메모  타이머 일정
```

**퀵액션 메뉴 항목**:

| 아이콘 | 이름 | 기능 | 동작 |
|--------|------|------|------|
| 💬 | 채팅 | 입력창 복귀 | 기본 상태로 전환 |
| ➕ | 태스크 | 빠른 태스크 추가 | 바텀시트 열림 |
| 😊 | 컨디션 | 현재 상태 변경 | 이모지 선택 팝업 |
| 📝 | 메모 | 빠른 메모 | 바텀시트 열림 |
| ⏱ | 타이머 | 집중 타이머 시작 | 타이머 모달 |
| 📅 | 일정 | 빠른 일정 추가 | 바텀시트 열림 |

#### 드로어 메뉴 설계

```
열기: 햄버거(☰) 클릭 또는 오른쪽 edge 스와이프
닫기: 오버레이 탭 / 메뉴 선택 / 왼쪽 스와이프
```

**메뉴 구성**:

```yaml
Drawer:
  header:
    - penguin_avatar: 🐧
    - app_name: "AlFredo"
    - user_status: "함께한 지 14일째"
    
  main_navigation:
    - 🏠 홈 (badge: null)
    - 📅 캘린더 (badge: 오늘 일정 수)
    - 🏢 워크OS (badge: 진행 중 태스크)
    - ❤️ 라이프OS (badge: null)
    - 📊 리포트 (badge: "NEW")
    
  secondary:
    - ⚙️ 설정
    - 🔗 연동 관리
    - ❓ 도움말
```

#### 네비게이션 레벨 구조

```
Level 0: 앱 진입점
├── 스플래시 (0.5초)
├── 온보딩 (첫 실행, 5단계)
└── 홈 (재방문)

Level 1: 홈 (Central Hub)
├── 라이브 브리핑
├── Right Now (집중 태스크)
├── 모드 카드 (Work/Life)
└── 타임라인

Level 1.5: 오버레이 (모달/바텀시트)
├── 상세 보기 (반 높이): 브리핑, 일정, 태스크
├── 입력 폼 (전체 높이): 태스크/메모/일정 추가
└── 선택 (작은 높이): 컨디션, 타이머

Level 2: OS/섹션 페이지
├── 📅 캘린더 (월/주/일 뷰)
├── 🏢 워크OS (집중태스크, 타임라인, 시그널)
├── ❤️ 라이프OS (웰빙, 넛지, 트렌드)
└── 📊 리포트 (성장지표, 강도, 패턴)

Level 3: 상세 페이지
├── 바텀시트 상세 (태스크/일정 수정)
├── 풀페이지 상세 (리포트 심층분석)
└── 외부 연결 (구글 캘린더, 이메일)
```

### 4. 문서화

**GitHub에 업로드된 문서**:
- `docs/20-onboarding-ia-design-v2.md` - 온보딩 + IA 설계 전체 명세
- `docs/README.md` - 문서 목록 업데이트

---

## 🔑 핵심 설계 결정사항

### 1. 채팅 중심 인터랙션
- 하단 탭 제거 → 플로팅 채팅바가 핵심
- "AlFredo에게 물어보세요"가 항상 하단에 노출
- 퀵액션으로 주요 기능 1-tap 접근

### 2. 드로어 네비게이션
- 화면 활용 극대화 (하단 60px 확보)
- 오른쪽에서 열림 (햄버거 또는 스와이프)
- 뱃지로 상태 표시 (일정 수, 태스크 수, NEW)

### 3. 홈 = 중앙 허브
- 모든 핵심 정보를 홈에서 한눈에
- "지금 뭘 해야 하지?"에 즉시 답변
- 모드 카드로 Work/Life OS 빠른 진입

### 4. 온보딩 = 관계 형성
- "도구가 아니라 관계" 강조
- 개인화 선택으로 초기 설정 자동화
- "5%에서 시작" → 완벽하지 않음 인정

### 5. ADHD 친화적 설계 원칙
- 최소 인지부하: 단순하고 명확한 UI
- 1-tap 접근: 주요 기능 빠르게 도달
- 맥락 우선: 시간/상황에 따른 정보 자동 조정

---

## 📝 앞으로 해야 할 작업

### Phase 1: 컴포넌트 설계 (권장 우선순위)

#### 1-1. 플로팅 바 컴포넌트
```
파일: src/components/common/FloatingBar.jsx

기능:
- 기본 상태: 채팅 입력창 + 퀵액션 버튼
- 확장 상태: 퀵액션 메뉴 (6개 아이콘)
- 타이머 상태: 진행 중인 타이머 표시
- 채팅 상태: 키보드 올라옴 + 전송 버튼

Props:
- isExpanded: boolean
- onToggle: function
- onChatSubmit: function
- activeTimer: object | null
```

#### 1-2. 드로어 컴포넌트
```
파일: src/components/common/Drawer.jsx

기능:
- 오른쪽에서 슬라이드 인 (300ms)
- 오버레이 터치로 닫기
- 메뉴 아이템 선택 → 페이지 전환 + 자동 닫힘
- 뱃지 표시 (숫자 또는 "NEW")

Props:
- isOpen: boolean
- onClose: function
- menuItems: array
- activePage: string
```

#### 1-3. 바텀시트 컴포넌트
```
파일: src/components/common/BottomSheet.jsx

기능:
- 반 높이 / 전체 높이 / 작은 높이 지원
- 드래그로 높이 조절
- 바깥 터치로 닫기
- 스냅 포인트 (25%, 50%, 90%)

Props:
- isOpen: boolean
- height: 'small' | 'half' | 'full'
- onClose: function
- children: ReactNode
```

### Phase 2: 온보딩 구현

#### 2-1. 온보딩 플로우
```
파일 구조:
src/pages/Onboarding/
├── index.jsx (온보딩 컨테이너)
├── Step1Welcome.jsx
├── Step2ValueIntro.jsx
├── Step3DirectionSelect.jsx
├── Step4InterventionStyle.jsx
├── Step5Growth.jsx
└── OnboardingProgress.jsx (진행 표시)

상태 관리:
- currentStep: 1-5
- selectedDirection: 'work' | 'life' | 'both' | 'auto'
- isCompleted: boolean (localStorage 저장)
```

#### 2-2. 온보딩 완료 후 처리
```javascript
// 온보딩 완료 시
const completeOnboarding = (selectedDirection) => {
  localStorage.setItem('onboarding_completed', 'true');
  localStorage.setItem('user_direction', selectedDirection);
  
  // 초기 설정 적용
  switch(selectedDirection) {
    case 'work':
      setDefaultMode('work');
      setBriefingTone('productivity');
      break;
    case 'life':
      setDefaultMode('life');
      setBriefingTone('wellbeing');
      break;
    // ...
  }
  
  navigate('/home');
};
```

### Phase 3: 홈 리디자인

#### 3-1. 새 홈 레이아웃
```
파일: src/pages/Home.jsx (리팩토링)

섹션 순서:
1. 헤더 (AlFredo 로고 + 알림 + 햄버거)
2. 라이브 브리핑 카드
3. Right Now (지금 집중할 것)
4. 모드 카드 (Work/Life) - 가로 2열
5. 타임라인
6. (하단) 플로팅 바

제거:
- 기존 하단 탭 네비게이션
- 기존 FAB 펭귄
```

#### 3-2. 홈 컴포넌트 구조
```
src/components/home/
├── HomeHeader.jsx (로고 + 알림 + 햄버거)
├── LiveBriefing.jsx (기존 유지, 스타일 수정)
├── RightNow.jsx (집중 태스크 카드)
├── ModeCards.jsx (Work/Life 카드 2개)
├── Timeline.jsx (기존 유지, 스타일 수정)
└── index.js
```

### Phase 4: OS 페이지 리디자인

#### 4-1. Work OS
```
섹션:
- 상황 브리핑 (핵심 작업 수 + 데드라인)
- 지금 집중할 것 (태스크 + 시작하기/나중에)
- Work Timeline (시간 + 소요시간 + 플레이버튼)
- Incoming Signals (이메일/메신저 알림)
- 하단 채팅 (작업 맥락)
```

#### 4-2. Life OS
```
섹션:
- 웰빙 상태 메시지 (감정적 톤)
- 상태 카드 (에너지 %, 수면 시간)
- Gentle Nudge (부드러운 제안)
- Life Trends (장기 패턴 차트)
```

#### 4-3. Report Space
```
섹션:
- 성장 지표 (Top X% + 원형 진행률)
- 주간 업무 강도 (바차트, 색상 그라데이션)
- 발견된 패턴 (아이콘 + 인사이트 카드)
```

### Phase 5: 라우팅 및 상태 관리

#### 5-1. 라우팅 구조 변경
```javascript
// App.jsx 라우팅
<Routes>
  {/* 온보딩 */}
  <Route path="/onboarding" element={<Onboarding />} />
  
  {/* 메인 */}
  <Route path="/" element={<Home />} />
  <Route path="/calendar" element={<Calendar />} />
  <Route path="/work" element={<WorkOS />} />
  <Route path="/life" element={<LifeOS />} />
  <Route path="/report" element={<ReportSpace />} />
  
  {/* 설정 */}
  <Route path="/settings" element={<Settings />} />
  <Route path="/integrations" element={<Integrations />} />
</Routes>
```

#### 5-2. 전역 상태 추가
```javascript
// stores/useAppStore.js
{
  // 드로어 상태
  isDrawerOpen: false,
  toggleDrawer: () => {},
  
  // 플로팅 바 상태
  floatingBarMode: 'default', // 'default' | 'expanded' | 'chat' | 'timer'
  setFloatingBarMode: () => {},
  
  // 온보딩 상태
  isOnboardingComplete: false,
  userDirection: null, // 'work' | 'life' | 'both' | 'auto'
  
  // 현재 페이지
  currentPage: 'home',
  setCurrentPage: () => {},
}
```

### Phase 6: 애니메이션 및 폴리싱

#### 6-1. 전환 애니메이션
```
- 드로어 열기/닫기: 300ms ease-out
- 퀵액션 확장: 300ms ease-out
- 페이지 전환: 200ms fade
- 바텀시트: 스프링 애니메이션
```

#### 6-2. 마이크로 인터랙션
```
- 버튼 탭: scale 0.95 → 1.0
- 카드 탭: 그림자 증가
- 스와이프 피드백: 햅틱 (PWA)
```

---

## 📚 참고 자료

### 목업 링크
| 이름 | URL |
|------|-----|
| Google AI Studio | https://ai.studio/apps/drive/1kIhztsgkTw_dqAyf8yhkHVLC8rfPDPJu |
| Figma | https://www.figma.com/make/oqBX18OXWvM4lTS0quYyTp/AlFredo-AI-Mentor-OS |

### GitHub 문서
| 파일 | 설명 |
|------|------|
| `docs/20-onboarding-ia-design-v2.md` | 온보딩 + IA 설계 전체 명세 |
| `docs/14-information-architecture.md` | 기존 IA (v1, 하단 탭 기반) |
| `docs/19-alfredo-nurturing-system.md` | 알프레도 육성 시스템 |

### 프로젝트 파일
| 파일 | 용도 |
|------|------|
| `src/App.jsx` | 메인 앱 + 라우팅 |
| `src/pages/Home.jsx` | 홈 페이지 |
| `src/components/` | 컴포넌트 디렉토리 |
| `src/stores/` | Zustand 스토어 |

### Notion 문서
- **프로젝트 노션**: Page ID `2c8b1c6d40e2819ab8aec73e6e4830d1`

---

## ⚡ 빠른 시작 가이드

### 새 채팅에서 시작할 때

1. **컨텍스트 로드**
```
"AlFredo 리디자인 작업을 이어서 할 거야. 
GitHub docs/21-handover.md 인수인계 문서를 읽고 시작해줘."
```

2. **현재 코드 확인**
```
"GitHub chloe-sy-park/ai-alfredo 레포의 src 구조를 확인해줘."
```

3. **작업 시작**
```
"Phase 1부터 시작하자. 플로팅 바 컴포넌트를 만들어줘."
```

---

## 🎯 우선순위 요약

| 순서 | 작업 | 예상 시간 |
|------|------|----------|
| 1 | 플로팅 바 컴포넌트 | 2-3시간 |
| 2 | 드로어 컴포넌트 | 2시간 |
| 3 | 바텀시트 컴포넌트 | 1-2시간 |
| 4 | 온보딩 5단계 구현 | 3-4시간 |
| 5 | 홈 리디자인 | 2-3시간 |
| 6 | Work OS 리디자인 | 2시간 |
| 7 | Life OS 리디자인 | 2시간 |
| 8 | Report 리디자인 | 2시간 |
| 9 | 라우팅 + 상태 연결 | 1-2시간 |
| 10 | 애니메이션 폴리싱 | 2시간 |

**총 예상**: 20-25시간

---

*마지막 업데이트: 2025-01-14*
