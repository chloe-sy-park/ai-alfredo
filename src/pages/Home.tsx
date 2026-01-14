import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Top3Item, getTop3 } from '../services/top3';
import { FocusItem, setFocusFromTop3, getCurrentFocus } from '../services/focusNow';
import { getWeather, WeatherData } from '../services/weather';
import { hasSeenEntryToday, markEntryAsSeen, updateVisit } from '../services/visit';
import { generateBriefing } from '../services/briefing';

// Components
import { PageHeader } from '../components/layout';
import { ModeCards, MoreSheet } from '../components/home';
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

type IntensityLevel = 'light' | 'normal' | 'heavy' | 'overloaded';

export default function Home() {
  var user = useAuthStore().user;
  var [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  var [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  var [currentCondition, setCurrentCondition] = useState<ConditionLevel | null>(null);
  var [currentFocus, setCurrentFocus] = useState<FocusItem | null>(null);
  var [weather, setWeather] = useState<WeatherData | null>(null);
  var [intensity, setIntensity] = useState<IntensityLevel>('normal');
  var [top3Items, setTop3Items] = useState<Top3Item[]>([]);
  var [isLoading, setIsLoading] = useState(true);
  var [showDailyEntry, setShowDailyEntry] = useState(false);
  var [briefing, setBriefing] = useState({ headline: '', subline: '' });

  // 방문 체크 및 Daily Entry 표시
  useEffect(function() {
    updateVisit();
    
    // Daily Entry를 아직 안 봤으면 표시
    if (!hasSeenEntryToday()) {
      setShowDailyEntry(true);
    }
  }, []);

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

    // Top3 아이템
    var items = getTop3();
    setTop3Items(items);
    
    // 브리핑 생성
    var now = new Date();
    var days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    var briefingData = generateBriefing({
      currentTime: now,
      dayOfWeek: days[now.getDay()],
      weather: weather || undefined,
      todayCalendar: calendarEvents,
      incompleteTasks: [], // TODO: tasks 서비스 연동
      condition: currentCondition || undefined
    });
    
    setBriefing({
      headline: briefingData.headline,
      subline: briefingData.subline
    });
    
    // 로딩 완료
    setTimeout(function() { setIsLoading(false); }, 500);
  }, []);

  // 컨디션 변경 시 강도 재계산
  useEffect(function() {
    var calculatedIntensity = calculateIntensity(calendarEvents.length, currentCondition || undefined);
    setIntensity(calculatedIntensity);
  }, [currentCondition, calendarEvents.length]);

  // 컨디션 변경 핸들러
  function handleConditionChange(level: ConditionLevel) {
    setCurrentCondition(level);
  }

  // Top3에서 집중 선택
  function handleFocusSelect(item: Top3Item) {
    var focusItem = setFocusFromTop3(item.id, item.title);
    setCurrentFocus(focusItem);
  }

  // 집중 변경
  function handleFocusChange(focus: FocusItem | null) {
    setCurrentFocus(focus);
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
    return !item.completed;
  }).length;
  
  var conditionStatus = currentCondition ? {
    'great': '아주 좋음',
    'good': '좋음',
    'normal': '보통',
    'bad': '좋지 않음'
  }[currentCondition] : '미설정';

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
      <div className="max-w-[640px] mx-auto px-6 py-4 space-y-4">
        
        {/* 인사 */}
        <div className="animate-fade-in">
          <p className="text-sm text-[#999999]">{getGreeting()}</p>
          <h1 className="text-xl font-bold text-[#1A1A1A]">
            {user?.name || 'Boss'}님
          </h1>
        </div>

        {/* 모드 카드 - Work/Life 가로 2개 */}
        <ModeCards 
          workCount={workCount}
          lifeCount={0}
          workStatus={calendarEvents.length + '개 일정'}
          lifeStatus={'컨디션 ' + conditionStatus}
        />

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
    </div>
  );
}
