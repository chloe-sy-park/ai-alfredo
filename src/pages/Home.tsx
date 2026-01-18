import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAlfredoStore } from '../stores/alfredoStore';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Top3Item, getTop3 } from '../services/top3';
import { getTasks, Task } from '../services/tasks';
import { FocusItem, getCurrentFocus } from '../services/focusNow';
import { getWeather, WeatherData } from '../services/weather';
import { hasSeenEntryToday, markEntryAsSeen, updateVisit } from '../services/visit';
import { generateBriefing, generateJudgmentExplanation, WeatherData as BriefingWeatherData, BriefingContext } from '../services/briefing';
import { usePostAction } from '../stores/postActionStore';
import { useLiftStore } from '../stores/liftStore';
import { useSmartInsightStore, useVisibleInsights } from '../stores/smartInsightStore';
import { useWorkOSStore } from '../stores/workOSStore';

// Components
import { PageHeader } from '../components/layout';
import { MoreSheet, OSProgressBar, DecisionMatrix, TodayAgenda, AlfredoInsights, DaySchedule } from '../components/home';
import FocusNow from '../components/home/FocusNow';
import DailyEntry from '../components/home/DailyEntry';
import { BriefingHero } from '../components/briefing';
import InsightCarousel from '../components/home/InsightCarousel';
import DailyCheckInModal, { CheckInData } from '../components/home/DailyCheckInModal';
import { TodaySection } from '../components/home/TodayFocusCard';
import { EmailSignalSection } from '../components/home/EmailSignalCard';
import { OfflineIndicator } from '../components/common/SyncResponsibilityBadge';
import { useEmailSignalStore } from '../services/email/emailSignalStore';

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore().user;
  const { initialize: initAlfredo, understanding } = useAlfredoStore();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentCondition, setCurrentCondition] = useState<ConditionLevel | null>(null);
  const [currentFocus, setCurrentFocus] = useState<FocusItem | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [top3Items, setTop3Items] = useState<Top3Item[]>([]);
  const [showDailyEntry, setShowDailyEntry] = useState(false);
  const [briefing, setBriefing] = useState<{
    headline: string;
    subline: string;
    emailSummary?: string;
    hasImportantEmail?: boolean;
  }>({ headline: '', subline: '' });
  const postAction = usePostAction();
  const liftStore = useLiftStore();

  // Smart Insight
  const visibleInsights = useVisibleInsights();
  const { generateInsights, handleCTA, dismissInsight } = useSmartInsightStore();

  // Work OS - Today Context
  const {
    todayContext,
    initializeToday,
    selectSuggestion,
    deselectSuggestion,
    confirmSelectedTasks
  } = useWorkOSStore();

  // 알프레도 스토어 초기화
  useEffect(function() {
    if (user?.email && !understanding) {
      initAlfredo(user.email);
    }
  }, [user?.email, understanding, initAlfredo]);

  // 방문 체크 및 Daily Entry 표시
  useEffect(function() {
    updateVisit();

    // Daily Entry를 아직 안 봤으면 표시
    if (!hasSeenEntryToday()) {
      setShowDailyEntry(true);
    }
  }, []);

  // Smart Insight 생성
  useEffect(function() {
    generateInsights();
  }, [generateInsights]);

  // Work OS Today 초기화
  useEffect(function() {
    initializeToday();
  }, [initializeToday]);

  // Email Signal 초기화 (Gmail 연동된 경우만)
  const { fetchEmailSignals } = useEmailSignalStore();
  useEffect(function() {
    if (isGoogleAuthenticated()) {
      fetchEmailSignals();
    }
  }, [fetchEmailSignals]);

  // CTA 핸들러 래핑 (navigate 사용)
  function handleInsightCTA(insight: Parameters<typeof handleCTA>[0]) {
    // 먼저 store의 handleCTA 호출
    handleCTA(insight);

    // CTA action에 따라 직접 네비게이션
    if (insight.cta) {
      switch (insight.cta.action) {
        case 'CONNECT_CALENDAR':
          navigate('/settings/integrations');
          break;
        case 'OPEN_SETTINGS':
          navigate('/settings');
          break;
        case 'OPEN_FOCUS':
          navigate('/work');
          break;
        // OPEN_CAPTURE, DISMISS는 store에서 처리
      }
    }
  }

  // Task 열기 핸들러
  function handleOpenTask(taskId: string) {
    navigate(`/work?task=${taskId}`);
  }

  // WeatherData를 BriefingWeatherData로 변환하는 헬퍼 함수
  function convertWeatherForBriefing(weatherData: WeatherData | null): BriefingWeatherData | undefined {
    if (!weatherData) return undefined;
    return {
      temp: weatherData.temp,
      condition: weatherData.condition,
      description: weatherData.description,
      icon: weatherData.icon
    };
  }

  // 데이터 로드
  useEffect(function() {
    // Google 캘린더
    var connected = isGoogleAuthenticated();

    if (connected) {
      getTodayEvents()
        .then(function(events) {
          setCalendarEvents(events);
        })
        .catch(function(err) { console.error('Calendar error:', err); });
    }

    // 컨디션
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCurrentCondition(todayCondition.level);
    }

    // 집중 항목
    var focus = getCurrentFocus();
    setCurrentFocus(focus);

    // 날씨
    getWeather().then(function(data) {
      setWeather(data);
    });

    // Top3 아이템
    var items = getTop3();
    setTop3Items(items);

    // 브리핑 생성
    var now = new Date();
    var days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

    // 미완료 태스크 가져오기
    var allTasks = getTasks();
    var incompleteTasks = allTasks.filter(function(t: Task) {
      return t.status !== 'done';
    });

    var briefingData = generateBriefing({
      currentTime: now,
      dayOfWeek: days[now.getDay()],
      weather: convertWeatherForBriefing(weather),
      todayCalendar: calendarEvents,
      incompleteTasks: incompleteTasks,
      condition: currentCondition || undefined
    });

    setBriefing({
      headline: briefingData.headline,
      subline: briefingData.subline,
      emailSummary: briefingData.emailSummary,
      hasImportantEmail: briefingData.hasImportantEmail
    });
  }, []);

  // 컨디션 변경 핸들러
  function handleConditionChange(level: ConditionLevel) {
    setCurrentCondition(level);
    postAction.onConditionUpdated(level);
  }

  // 체크인 완료 핸들러
  function handleCheckInComplete(data: CheckInData) {
    handleConditionChange(data.condition);
  }

  // 집중 변경
  function handleFocusChange(focus: FocusItem | null) {
    var previousFocus = currentFocus;
    setCurrentFocus(focus);
    if (focus) {
      postAction.onFocusSet(focus.title);

      // Lift 기록: 새 집중 설정
      if (!previousFocus || previousFocus.id !== focus.id) {
        liftStore.addLift({
          type: 'apply',
          category: 'priority',
          previousDecision: previousFocus ? previousFocus.title : '집중 없음',
          newDecision: focus.title + '에 집중',
          reason: '집중 항목 변경',
          impact: 'high'
        });
      }
    } else {
      postAction.onFocusCleared();

      // Lift 기록: 집중 해제
      if (previousFocus) {
        liftStore.addLift({
          type: 'apply',
          category: 'priority',
          previousDecision: previousFocus.title + '에 집중 중',
          newDecision: '집중 해제',
          reason: '집중 세션 종료',
          impact: 'medium'
        });
      }
    }
  }

  // Daily Entry 완료
  function handleDailyEntryComplete() {
    markEntryAsSeen();
    setShowDailyEntry(false);
  }

  // 시간 기반 인사
  var now = new Date();
  var hours = now.getHours();

  function getGreeting(): string {
    if (hours < 6) return '아직 이른 시간이에요';
    if (hours < 12) return '좋은 아침이에요';
    if (hours < 18) return '오후도 힘내요';
    if (hours < 22) return '저녁 시간이에요';
    return '늦은 밤이에요';
  }

  // MoreSheet 콘텐츠 - PRD Phase 3 판단 설명 (Default: 1줄 + Expand: 상세)
  function getMoreContent() {
    // 브리핑 컨텍스트 생성
    var briefingContext: BriefingContext = {
      currentTime: new Date(),
      dayOfWeek: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][new Date().getDay()],
      weather: weather ? convertWeatherForBriefing(weather) : undefined,
      todayCalendar: calendarEvents,
      incompleteTasks: [],
      condition: currentCondition || undefined
    };

    // 동적 판단 설명 생성
    return generateJudgmentExplanation(briefingContext);
  }

  var moreContent = getMoreContent();

  // Mode Cards 데이터 계산
  var workCount = top3Items.filter(function(item) {
    return !item.completed && !item.isPersonal;
  }).length;

  var lifeCount = top3Items.filter(function(item) {
    return !item.completed && item.isPersonal;
  }).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator (오프라인 상태 표시) */}
      <OfflineIndicator />

      {/* Daily Entry */}
      {showDailyEntry && (
        <DailyEntry
          onComplete={handleDailyEntryComplete}
          userName={user?.name || 'Boss'}
          briefing={briefing}
          isFirstVisitToday={!hasSeenEntryToday()}
        />
      )}

      {/* 헤더 - 컨디션 클릭 시 DailyCheckInModal 열기 */}
      <PageHeader
        showCondition={true}
        onConditionClick={() => setShowCheckInModal(true)}
      />

      {/* 메인 컨텐츠 */}
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* 인사 */}
        <div className="animate-fade-in">
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>{getGreeting()}</p>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {user?.name || 'Boss'}님
          </h1>
        </div>

        {/* === 새로운 레이아웃 === */}

        {/* 1. Today's Agenda (구글 캘린더 기반) */}
        <TodayAgenda mode="all" />

        {/* 2. Schedule 타임라인 (현재 시간 바 포함) */}
        <DaySchedule mode="all" />

        {/* 3. Hero 브리핑 (알프레도 브리핑) */}
        <BriefingHero mode="all" onMore={function() { setIsMoreSheetOpen(true); }} />

        {/* 4. Work/Life 진행률 바 (브리핑 아래로 이동) */}
        <OSProgressBar
          workPercent={workCount}
          lifePercent={lifeCount}
          workCount={workCount}
          lifeCount={lifeCount}
        />

        {/* 5. Smart Insight 캐러셀 (오늘 하루 / 지금 이 순간 - 브리핑 아래로 이동) */}
        {visibleInsights.length > 0 && (
          <InsightCarousel
            insights={visibleInsights}
            onCTA={handleInsightCTA}
            onDismiss={dismissInsight}
          />
        )}

        {/* 6. Today Section (미팅 기반 or 포커스 기반) */}
        <TodaySection
          todayContext={todayContext}
          onSelectSuggestion={selectSuggestion}
          onDeselectSuggestion={deselectSuggestion}
          onConfirmTasks={confirmSelectedTasks}
          onOpenTask={handleOpenTask}
        />

        {/* 7. Email Signal Section */}
        <EmailSignalSection />

        {/* 8. AI 의사결정 매트릭스 */}
        <DecisionMatrix condition={currentCondition} />

        {/* 9. 지금 집중할거 */}
        <FocusNow
          externalFocus={currentFocus}
          onFocusChange={handleFocusChange}
        />

        {/* 10. 알프레도 인사이트 (최하단) */}
        <AlfredoInsights />
      </div>

      {/* 더보기 시트 */}
      <MoreSheet
        isOpen={isMoreSheetOpen}
        onClose={function() { setIsMoreSheetOpen(false); }}
        title="알프레도의 판단 근거"
        why={moreContent.why}
        whatChanged={moreContent.whatChanged}
        tradeOff={moreContent.tradeOff}
      />

      {/* Daily Check-In 모달 */}
      <DailyCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onComplete={handleCheckInComplete}
        initialCondition={currentCondition}
      />
    </div>
  );
}
