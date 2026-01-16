import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAlfredoStore } from '../stores/alfredoStore';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Top3Item, getTop3 } from '../services/top3';
import { getTasks, Task } from '../services/tasks';
import { FocusItem, setFocusFromTop3, getCurrentFocus } from '../services/focusNow';
import { getWeather, WeatherData } from '../services/weather';
import { hasSeenEntryToday, markEntryAsSeen, updateVisit } from '../services/visit';
import { generateBriefing, WeatherData as BriefingWeatherData } from '../services/briefing';
import { usePostAction } from '../stores/postActionStore';
import { useLiftStore } from '../stores/liftStore';
import { useHomeModeStore } from '../stores/homeModeStore';

// Components
import { PageHeader } from '../components/layout';
import { ModeCards, MoreSheet, ModeSwitch, BalanceHint } from '../components/home';
import BriefingCard from '../components/home/BriefingCard';
import TodayTimeline from '../components/home/TodayTimeline';
import ConditionQuick from '../components/home/ConditionQuick';
import TodayTop3 from '../components/home/TodayTop3';
import FocusNow from '../components/home/FocusNow';
import WeatherCard from '../components/home/WeatherCard';
import QuickMemoCard from '../components/home/QuickMemoCard';
import DailyEntry from '../components/home/DailyEntry';
import { calculateIntensity } from '../components/common/IntensityBadge';
import { SkeletonCard, SkeletonBriefing } from '../components/common/Skeleton';
import { MiniUnderstandingWidget } from '../components/alfredo';

type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';
type HomeMode = 'all' | 'work' | 'life';

export default function Home() {
  const location = useLocation();
  const user = useAuthStore().user;
  const { initialize: initAlfredo, understanding } = useAlfredoStore();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentCondition, setCurrentCondition] = useState<ConditionLevel | null>(null);
  const [currentFocus, setCurrentFocus] = useState<FocusItem | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [intensity, setIntensity] = useState<IntensityLevel>('normal');
  const [top3Items, setTop3Items] = useState<Top3Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDailyEntry, setShowDailyEntry] = useState(false);
  const [briefing, setBriefing] = useState({ headline: '', subline: '' });
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
          // 강도 계산
          var calculatedIntensity = calculateIntensity(events.length, currentCondition || undefined);
          setIntensity(calculatedIntensity);
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
        subline: briefingData.subline
      });
    } else if (homeMode === 'life') {
      setBriefing({
        headline: '오늘은 나를 위한 시간이에요',
        subline: '일과 삶의 균형을 맞춰봐요'
      });
    } else {
      setBriefing({
        headline: briefingData.headline,
        subline: briefingData.subline
      });
    }
    
    // 로딩 완료
    setTimeout(function() { setIsLoading(false); }, 500);
  }, [homeMode]);

  // 컨디션 변경 시 강도 재계산
  useEffect(function() {
    var calculatedIntensity = calculateIntensity(calendarEvents.length, currentCondition || undefined);
    setIntensity(calculatedIntensity);
  }, [currentCondition, calendarEvents.length]);

  // 컨디션 변경 핸들러
  function handleConditionChange(level: ConditionLevel) {
    setCurrentCondition(level);
    postAction.onConditionUpdated(level);
  }

  // Top3에서 집중 선택
  function handleFocusSelect(item: Top3Item) {
    var previousFocus = currentFocus;
    var focusItem = setFocusFromTop3(item.id, item.title);
    setCurrentFocus(focusItem);
    postAction.onFocusSet(item.title);

    // Lift 기록: 우선순위 집중 변경
    liftStore.addLift({
      type: 'apply',
      category: 'priority',
      previousDecision: previousFocus ? previousFocus.title : '집중 없음',
      newDecision: item.title + '에 집중',
      reason: 'Top3에서 집중 항목 선택',
      impact: 'high'
    });
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

  // MoreSheet 콘텐츠
  function getMoreContent() {
    if (currentCondition === 'bad') {
      return {
        why: '컨디션이 좋지 않을 때 무리하면 오히려 역효과예요.',
        whatChanged: '컨디션이 "힘듬"으로 설정되었어요.',
        tradeOff: '급하지 않은 건 내일로. 건강이 먼저예요.'
      };
    }
    if (intensity === 'overloaded' || intensity === 'heavy') {
      return {
        why: '오늘 일정이 ' + calendarEvents.length + '개나 있어요.',
        whatChanged: '강도가 "' + intensity.toUpperCase() + '"로 판단되었어요.',
        tradeOff: 'Top 3에 집중하고 나머지는 과감히 미루세요.'
      };
    }
    return {
      why: '오늘 하루를 효율적으로 보내기 위한 알프레도의 분석이에요.',
      whatChanged: '캘린더와 컨디션을 종합해서 판단했어요.',
      tradeOff: '모든 걸 다 할 필요 없어요. 중요한 것에 집중하세요.'
    };
  }

  var moreContent = getMoreContent();

  // Mode Cards 데이터 계산
  var workCount = top3Items.filter(function(item) { 
    return !item.completed && !item.isPersonal;
  }).length;
  
  var lifeCount = top3Items.filter(function(item) { 
    return !item.completed && item.isPersonal;
  }).length;
  
  var conditionStatus = currentCondition ? {
    'great': '아주 좋음',
    'good': '좋음',
    'normal': '보통',
    'bad': '좋지 않음'
  }[currentCondition] : '미설정';

  // 모드 표시를 위한 배지
  const ModeBadge = () => {
    if (homeMode === 'all') return null;
    
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 rounded-full mb-2">
        <span className="text-xs font-medium text-primary-main uppercase">
          {homeMode} MODE
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Daily Entry */}
      {showDailyEntry && (
        <DailyEntry 
          onComplete={handleDailyEntryComplete}
          userName={user?.name || 'Boss'}
          briefing={briefing}
          isFirstVisitToday={!hasSeenEntryToday()}
        />
      )}
      
      {/* 헤더 */}
      <PageHeader />

      {/* 메인 컨텐츠 */}
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        
        {/* PRD: ModeSwitch - ALL/WORK/LIFE 탭 전환 */}
        <ModeSwitch
          activeMode={homeMode}
          onChange={function(mode) {
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
        />

        {/* 인사 */}
        <div className="animate-fade-in">
          <ModeBadge />
          <p className="text-sm sm:text-base text-[#999999]">{getGreeting()}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-white">
            {user?.name || 'Boss'}님
          </h1>
        </div>

        {/* 모드 카드 - Work/Life 가로 2개 (ALL 모드에서만) */}
        {homeMode === 'all' && (
          <ModeCards
            workCount={workCount}
            lifeCount={lifeCount}
            workStatus={calendarEvents.length + '개 일정'}
            lifeStatus={'컨디션 ' + conditionStatus}
          />
        )}

        {/* 알프레도 이해도 위젯 */}
        {understanding && <MiniUnderstandingWidget />}

        {/* 날씨 카드 */}
        {isLoading ? <SkeletonCard /> : <WeatherCard />}

        {/* 컨디션 퀵변경 */}
        <ConditionQuick onConditionChange={handleConditionChange} />

        {/* 알프레도 브리핑 */}
        {isLoading ? (
          <SkeletonBriefing />
        ) : (
          <BriefingCard
            headline={briefing.headline}
            subline={briefing.subline}
            intensity={intensity}
            onMore={function() { setIsMoreSheetOpen(true); }}
          />
        )}

        {/* PRD: BalanceHint (mini) - ALL 모드에서 균형 표시 */}
        {homeMode === 'all' && (
          <BalanceHint
            workPercent={workCount > 0 || lifeCount > 0
              ? Math.round((workCount / (workCount + lifeCount)) * 100)
              : 50}
            lifePercent={workCount > 0 || lifeCount > 0
              ? Math.round((lifeCount / (workCount + lifeCount)) * 100)
              : 50}
          />
        )}

        {/* 지금 집중할거 - 가장 강조 */}
        <FocusNow 
          externalFocus={currentFocus} 
          onFocusChange={handleFocusChange} 
        />

        {/* 오늘의 Top 3 */}
        <TodayTop3 onFocusSelect={handleFocusSelect} />

        {/* 기억해야할거 */}
        <QuickMemoCard />

        {/* 오늘 타임라인 */}
        <TodayTimeline />
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
