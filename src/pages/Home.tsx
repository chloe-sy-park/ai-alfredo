import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { Top3Item } from '../services/top3';
import { FocusItem, setFocusFromTop3, getCurrentFocus } from '../services/focusNow';
import { getWeather, WeatherData, getWeatherBriefing } from '../services/weather';

// Components
import { ModeSwitch, ChatLauncher, MoreSheet } from '../components/home';
import TodayTimeline from '../components/home/TodayTimeline';
import ConditionQuick from '../components/home/ConditionQuick';
import TodayTop3 from '../components/home/TodayTop3';
import FocusNow from '../components/home/FocusNow';
import WeatherCard from '../components/home/WeatherCard';
import QuickMemoCard from '../components/home/QuickMemoCard';

type Mode = 'all' | 'work' | 'life';

export default function Home() {
  var user = useAuthStore().user;
  var [mode, setMode] = useState<Mode>('all');
  var [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  var [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  var [isGoogleConnected, setIsGoogleConnected] = useState(false);
  var [currentCondition, setCurrentCondition] = useState<ConditionLevel | null>(null);
  var [currentFocus, setCurrentFocus] = useState<FocusItem | null>(null);
  var [weather, setWeather] = useState<WeatherData | null>(null);

  // 데이터 로드
  useEffect(function() {
    // Google 캘린더
    var connected = isGoogleAuthenticated();
    setIsGoogleConnected(connected);
    
    if (connected) {
      getTodayEvents()
        .then(function(events) { setCalendarEvents(events); })
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
  }, []);

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

  // 알프레도 브리핑 생성
  function getBriefing(): { headline: string; subline: string } {
    // 컨디션 우선
    if (currentCondition === 'tired') {
      return {
        headline: '오늘은 무리하지 않는 게 가장 생산적인 선택이에요',
        subline: '꼭 필요한 것만 하고 푹 쉬세요 🌙'
      };
    }
    
    // 날씨 기반
    if (weather && (weather.condition === 'rainy' || weather.condition === 'snowy')) {
      return {
        headline: weather.icon + ' 오늘은 ' + weather.description,
        subline: '우산 챙기세요! 실내 작업에 집중하기 좋은 날이에요'
      };
    }
    
    // 시간대 기반
    if (hours < 10) {
      var eventCount = calendarEvents.length;
      return {
        headline: '오늘 일정 ' + eventCount + '개, 에너지 있을 때 중요한 것부터!',
        subline: '오전에 집중하면 오후가 편해져요 ☀️'
      };
    }
    
    if (hours < 14) {
      return {
        headline: '지금 가장 중요한 것 하나에 집중하세요',
        subline: '한 번에 하나씩, ADHD 친화적으로 🎯'
      };
    }
    
    if (hours < 18) {
      return {
        headline: '오후 슬럼프를 이겨내세요!',
        subline: '잠깐 쉬거나 간단한 일부터 시작해보세요 ☕'
      };
    }
    
    if (currentCondition === 'great') {
      return {
        headline: '컨디션이 좋네요! 💪',
        subline: '내일을 위해 정리하고 일찍 쉬세요'
      };
    }
    
    return {
      headline: (user?.name || 'Boss') + '님, 오늘 하루 수고했어요',
      subline: '이제 푹 쉬세요. 내일도 함께할게요 ✨'
    };
  }

  var briefing = getBriefing();

  // MoreSheet 콘텐츠
  function getMoreContent() {
    if (currentCondition === 'tired') {
      return {
        why: '컨디션이 좋지 않을 때 무리하면 오히려 역효과예요.',
        whatChanged: '컨디션이 "힘듦"으로 설정되었어요.',
        tradeOff: '급하지 않은 건 내일로. 건강이 먼저예요.'
      };
    }
    return {
      why: '오늘 하루를 효율적으로 보내기 위한 알프레도의 분석이에요.',
      whatChanged: '캘린더와 컨디션을 종합해서 판단했어요.',
      tradeOff: '모든 걸 다 할 필요 없어요. 중요한 것에 집중하세요.'
    };
  }

  var moreContent = getMoreContent();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.name || 'Boss'}님
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isGoogleConnected && (
              <span className="text-xs text-green-500">● 캘린더 연동</span>
            )}
            <span className="text-3xl">🐧</span>
          </div>
        </div>

        {/* 모드 스위치 */}
        <ModeSwitch activeMode={mode} onChange={setMode} />

        {/* 날씨 카드 */}
        <WeatherCard />

        {/* 컨디션 퀵변경 */}
        <ConditionQuick onConditionChange={handleConditionChange} />

        {/* 알프레도 브리핑 */}
        <div className="bg-gradient-to-r from-lavender-100 to-purple-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xl">🐧</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800">{briefing.headline}</h2>
              <p className="text-sm text-gray-600 mt-1">{briefing.subline}</p>
            </div>
            <button
              onClick={function() { setIsMoreSheetOpen(true); }}
              className="text-xs text-lavender-600 hover:text-lavender-700"
            >
              더보기
            </button>
          </div>
        </div>

        {/* 지금 집중할거 */}
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

      {/* 채팅 런처 */}
      <ChatLauncher variant="floating" />

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
