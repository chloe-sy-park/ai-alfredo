import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useHomeModeStore } from '../stores/homeModeStore';

// Components
import { PageHeader } from '../components/layout';
import { MoreSheet, OSProgressBar, DecisionMatrix, TodayAgenda, AlfredoInsights, DaySchedule } from '../components/home';
import FocusNow from '../components/home/FocusNow';
import DailyEntry from '../components/home/DailyEntry';
import { BriefingHero } from '../components/briefing';

type HomeMode = 'all' | 'work' | 'life' | 'finance';

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore().user;
  const { initialize: initAlfredo, understanding } = useAlfredoStore();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
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
  const [homeMode, setHomeMode] = useState<HomeMode>('all');
  const postAction = usePostAction();
  const liftStore = useLiftStore();
  const { setMode: setGlobalMode } = useHomeModeStore();

  // URL 쿼리 파라미터에서 mode 확인
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    if (mode === 'work' || mode === 'life') {
      setHomeMode(mode);
      setGlobalMode(mode); // 전역 스토어 동기화
    }
  }, [location, setGlobalMode]);

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

    // Top3 아이템 (모드에 따라 필터링 가능)
    var items = getTop3();
    if (homeMode === 'work') {
      // Work 모드일 때는 업무 관련 항목만 표시
      items = items.filter(item => !item.isPersonal);
    } else if (homeMode === 'life') {
      // Life 모드일 때는 개인 항목만 표시
      items = items.filter(item => item.isPersonal);
    }
    setTop3Items(items);
    
    // 브리핑 생성 (모드에 따라 다른 메시지)
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
    
    // 모드에 따라 브리핑 메시지 조정
    if (homeMode === 'work') {
      setBriefing({
        headline: '업무에 집중하는 하루를 만들어볼까요',
        subline: briefingData.subline,
        emailSummary: briefingData.emailSummary,
        hasImportantEmail: briefingData.hasImportantEmail
      });
    } else if (homeMode === 'life') {
      setBriefing({
        headline: '오늘은 나를 위한 시간이에요',
        subline: '일과 삶의 균형을 맞춰봐요',
        emailSummary: briefingData.emailSummary,
        hasImportantEmail: briefingData.hasImportantEmail
      });
    } else {
      setBriefing({
        headline: briefingData.headline,
        subline: briefingData.subline,
        emailSummary: briefingData.emailSummary,
        hasImportantEmail: briefingData.hasImportantEmail
      });
    }
  }, [homeMode]);

  // 컨디션 변경 핸들러
  function handleConditionChange(level: ConditionLevel) {
    setCurrentCondition(level);
    postAction.onConditionUpdated(level);
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
    if (homeMode === 'work') {
      if (hours < 12) return '생산적인 아침이에요';
      if (hours < 18) return '집중력이 높은 시간이에요';
      return '마무리 시간이에요';
    } else if (homeMode === 'life') {
      if (hours < 12) return '여유로운 아침이에요';
      if (hours < 18) return '충전하는 시간이에요';
      return '편안한 저녁이에요';
    }
    
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

  // 모드별 배경색 클래스
  const getModeBackgroundClass = () => {
    switch (homeMode) {
      case 'work':
        return 'bg-work-bg/30';
      case 'life':
        return 'bg-life-bg/30';
      default:
        return 'bg-background';
    }
  };

  // 모드 표시를 위한 배지 (색상 강화)
  const ModeBadge = () => {
    if (homeMode === 'all' || homeMode === 'finance') return null;

    const badgeStyles: Record<'work' | 'life', string> = {
      work: 'bg-work-bg text-work-text border border-work-border',
      life: 'bg-life-bg text-life-text border border-life-border',
    };

    return (
      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full mb-2 ${badgeStyles[homeMode]}`}>
        <span className="text-xs font-semibold uppercase">
          {homeMode} MODE
        </span>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getModeBackgroundClass()}`}>
      {/* Daily Entry */}
      {showDailyEntry && (
        <DailyEntry 
          onComplete={handleDailyEntryComplete}
          userName={user?.name || 'Boss'}
          briefing={briefing}
          isFirstVisitToday={!hasSeenEntryToday()}
        />
      )}
      
      {/* 헤더 - 모드 스위치 & 컨디션 통합 */}
      <PageHeader
        showModeSwitch={true}
        activeMode={homeMode}
        onModeChange={function(mode) {
          // Finance 모드 선택 시 Finance 페이지로 이동
          if (mode === 'finance') {
            navigate('/finance');
            return;
          }

          var previousMode = homeMode;
          setHomeMode(mode);
          setGlobalMode(mode); // 전역 스토어 동기화
          postAction.onModeChanged(mode);

          // Lift 기록: 모드 변경
          if (previousMode !== mode && previousMode !== 'all' && mode !== 'all') {
            liftStore.addLift({
              type: 'apply',
              category: 'worklife',
              previousDecision: previousMode === 'work' ? 'Work 모드' : 'Life 모드',
              newDecision: mode === 'work' ? 'Work 모드로 전환' : 'Life 모드로 전환',
              reason: '사용자가 직접 모드를 전환함',
              impact: 'medium'
            });
          }
        }}
        showCondition={true}
        onConditionChange={handleConditionChange}
      />

      {/* 메인 컨텐츠 */}
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* 인사 */}
        <div className="animate-fade-in">
          <ModeBadge />
          <p className="text-sm sm:text-base text-[#999999]">{getGreeting()}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-white">
            {user?.name || 'Boss'}님
          </h1>
        </div>

        {/* === WORK 모드: 업무 중심 위젯 순서 === */}
        {homeMode === 'work' && (
          <>
            {/* 1. Hero 브리핑 (최상단) */}
            <BriefingHero mode="work" onMore={function() { setIsMoreSheetOpen(true); }} />

            {/* 2. AI 의사결정 매트릭스 */}
            <DecisionMatrix condition={currentCondition} />

            {/* 3. Today's Work Agenda (Work Agenda만 확대 표시) */}
            <TodayAgenda mode="work" />

            {/* 4. Work Schedule 타임라인 (업무 관련만 필터링) */}
            <DaySchedule mode="work" />

            {/* 5. 지금 집중할거 */}
            <FocusNow
              externalFocus={currentFocus}
              onFocusChange={handleFocusChange}
            />

            {/* 6. Work/Life 진행률 바 */}
            <OSProgressBar
              workPercent={workCount}
              lifePercent={lifeCount}
              workCount={workCount}
              lifeCount={lifeCount}
            />

            {/* 7. 알프레도 인사이트 (최하단) */}
            <AlfredoInsights />
          </>
        )}

        {/* === LIFE 모드: 개인 중심 위젯 순서 === */}
        {homeMode === 'life' && (
          <>
            {/* 1. Hero 브리핑 (최상단) */}
            <BriefingHero mode="life" onMore={function() { setIsMoreSheetOpen(true); }} />

            {/* 2. AI 의사결정 매트릭스 */}
            <DecisionMatrix condition={currentCondition} />

            {/* 3. Today's Life Agenda (Life Agenda만 확대 표시) */}
            <TodayAgenda mode="life" />

            {/* 4. Life Schedule 타임라인 (생활 관련만 필터링) */}
            <DaySchedule mode="life" />

            {/* 5. Work/Life 진행률 바 */}
            <OSProgressBar
              workPercent={workCount}
              lifePercent={lifeCount}
              workCount={workCount}
              lifeCount={lifeCount}
            />

            {/* 6. 알프레도 인사이트 (최하단) */}
            <AlfredoInsights />
          </>
        )}

        {/* === ALL 모드: 전체 위젯 표시 === */}
        {homeMode === 'all' && (
          <>
            {/* 1. Hero 브리핑 (최상단) */}
            <BriefingHero mode="all" onMore={function() { setIsMoreSheetOpen(true); }} />

            {/* 2. AI 의사결정 매트릭스 */}
            <DecisionMatrix condition={currentCondition} />

            {/* 3. Today's Agenda (Work/Life/추천 3개, 토글 시 Top3 Task 표시) */}
            <TodayAgenda mode="all" />

            {/* 4. Schedule 타임라인 (Task + Event 통합) */}
            <DaySchedule mode="all" />

            {/* 5. Work/Life 진행률 바 */}
            <OSProgressBar
              workPercent={workCount}
              lifePercent={lifeCount}
              workCount={workCount}
              lifeCount={lifeCount}
            />

            {/* 6. 알프레도 인사이트 (최하단) */}
            <AlfredoInsights />
          </>
        )}
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

      {/* 채팅은 App.tsx의 FloatingBar에서 제공 (중복 제거) */}
    </div>
  );
}
