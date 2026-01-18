import { useEffect, useState, CSSProperties } from 'react';
import {
  Sun, Cloud, CloudRain, CloudSnow, Wind,
  Briefcase, Heart, Wallet, Layout,
  ChevronDown, ChevronUp, Lightbulb, Thermometer,
  LucideIcon
} from 'lucide-react';
import { getWeather, WeatherData } from '../../services/weather';
import { getTodayCondition, ConditionLevel } from '../../services/condition';
import { generateBriefing, BriefingContext } from '../../services/briefing';
import { getTodayEvents, CalendarEvent } from '../../services/calendar';
import { getTasks, Task } from '../../services/tasks';
import { useLifeOSStore } from '../../stores/lifeOSStore';
import SleepEstimateCard from '../life/SleepEstimateCard';
import SleepCorrectionSheet from '../life/SleepCorrectionSheet';

export type BriefingMode = 'all' | 'work' | 'life' | 'finance';

interface BriefingHeroProps {
  mode?: BriefingMode;
  onMore?: () => void;
}

// 모드별 설정 (디자인 토큰 기반)
const modeConfig: Record<BriefingMode, {
  gradient: string;
  icon: LucideIcon;
  title: string;
  emoji: string;
  accentColor: string;
  accentStyle: CSSProperties;
}> = {
  all: {
    gradient: 'from-[rgba(201,162,94,0.08)] via-[rgba(201,162,94,0.04)] to-[rgba(201,162,94,0.08)]',
    icon: Layout,
    title: '오늘의 브리핑',
    emoji: '🎩',
    accentColor: 'text-os-work',
    accentStyle: { color: 'var(--accent-primary)' }
  },
  work: {
    gradient: 'from-[rgba(74,92,115,0.08)] via-[rgba(74,92,115,0.04)] to-[rgba(74,92,115,0.08)]',
    icon: Briefcase,
    title: '업무 브리핑',
    emoji: '💼',
    accentColor: 'text-os-work',
    accentStyle: { color: 'var(--os-work)' }
  },
  life: {
    gradient: 'from-[rgba(126,155,138,0.08)] via-[rgba(126,155,138,0.04)] to-[rgba(126,155,138,0.08)]',
    icon: Heart,
    title: '웰빙 브리핑',
    emoji: '🌿',
    accentColor: 'text-os-life',
    accentStyle: { color: 'var(--os-life)' }
  },
  finance: {
    gradient: 'from-[rgba(140,122,94,0.08)] via-[rgba(140,122,94,0.04)] to-[rgba(140,122,94,0.08)]',
    icon: Wallet,
    title: '재정 브리핑',
    emoji: '💰',
    accentColor: 'text-os-finance',
    accentStyle: { color: 'var(--os-finance)' }
  }
};

// 날씨 아이콘 매핑
function getWeatherIcon(condition: string, size: number = 18) {
  const iconClass = "text-gray-600";
  if (condition.includes('snow') || condition.includes('눈')) {
    return <CloudSnow size={size} className="text-blue-400" />;
  }
  if (condition.includes('rain') || condition.includes('비')) {
    return <CloudRain size={size} className="text-blue-500" />;
  }
  if (condition.includes('cloud') || condition.includes('구름')) {
    return <Cloud size={size} className={iconClass} />;
  }
  if (condition.includes('wind') || condition.includes('바람')) {
    return <Wind size={size} className={iconClass} />;
  }
  return <Sun size={size} className="text-yellow-500" />;
}

// 날씨 기반 팁 생성
function getWeatherTip(weather: WeatherData | null): string | null {
  if (!weather) return null;

  const temp = weather.temp;
  const condition = weather.condition.toLowerCase();

  if (temp <= 0) {
    return '영하로 추워요. 따뜻하게 입고 나가세요 🧥';
  }
  if (temp <= 5) {
    return '쌀쌀해요. 외투 챙기세요 🧣';
  }
  if (condition.includes('rain') || condition.includes('비')) {
    return '비가 와요. 우산 잊지 마세요 ☔';
  }
  if (condition.includes('snow') || condition.includes('눈')) {
    return '눈이 와요. 미끄럼 조심하세요 ❄️';
  }
  if (temp >= 30) {
    return '무더워요. 수분 섭취 잊지 마세요 💧';
  }

  return null;
}

export default function BriefingHero({
  mode = 'all',
  onMore
}: BriefingHeroProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [condition, setCondition] = useState<ConditionLevel | null>(null);
  const [briefing, setBriefing] = useState({ headline: '', subline: '' });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);
  const [showSleepCorrection, setShowSleepCorrection] = useState(false);

  // Life OS Sleep 데이터
  const sleepWindow = useLifeOSStore((state) => state.sleepWindow);
  const sleepLoading = useLifeOSStore((state) => state.sleepLoading);
  const fetchSleepWindow = useLifeOSStore((state) => state.fetchSleepWindow);
  const correctSleep = useLifeOSStore((state) => state.correctSleep);

  // 오늘 날짜 (로컬)
  const today = new Date().toISOString().split('T')[0];

  // Sleep 카드 표시 조건: all 또는 life 모드이고, 아침 시간 (6시~12시)
  const currentHour = new Date().getHours();
  const showSleepCard = (mode === 'all' || mode === 'life') && currentHour >= 6 && currentHour < 12;

  const config = modeConfig[mode];
  const weatherTip = getWeatherTip(weather);

  useEffect(() => {
    loadData();
  }, [mode]);

  // Sleep 데이터 로드 (아침 시간대에만)
  useEffect(() => {
    if (showSleepCard) {
      fetchSleepWindow(today);
    }
  }, [showSleepCard, today, fetchSleepWindow]);

  // Sleep 확인/정정 핸들러
  const handleConfirmSleep = () => {
    // 사용자가 "맞아요"를 눌렀을 때 - 추가 액션 없음 (이미 저장됨)
    console.log('[BriefingHero] Sleep confirmed for', today);
  };

  const handleRequestSleepCorrection = () => {
    // 중복 열림 방지
    if (showSleepCorrection) return;
    setShowSleepCorrection(true);
  };

  const handleSleepCorrectionClose = () => {
    setShowSleepCorrection(false);
  };

  // 로컬 스토리지에서 접힘 상태 복원
  useEffect(() => {
    const savedState = localStorage.getItem('briefing_expanded');
    if (savedState !== null) {
      setIsExpanded(savedState === 'true');
    }
  }, []);

  // 접힘 상태 저장
  const toggleExpanded = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('briefing_expanded', String(newState));
  };

  async function loadData() {
    setIsLoading(true);

    // 날씨 로드
    try {
      const weatherData = await getWeather();
      setWeather(weatherData);
    } catch {
      // 날씨 로드 실패 무시
    }

    // 컨디션 로드
    const todayCondition = getTodayCondition();
    if (todayCondition) {
      setCondition(todayCondition.level);
    }

    // 캘린더 이벤트
    try {
      const calendarEvents = await getTodayEvents();
      setEvents(calendarEvents);
    } catch {
      // 캘린더 로드 실패 무시
    }

    // 브리핑 생성
    const now = new Date();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const allTasks = getTasks();
    const incompleteTasks = allTasks.filter((t: Task) => t.status !== 'done');

    const briefingContext: BriefingContext = {
      currentTime: now,
      dayOfWeek: days[now.getDay()],
      weather: weather ? {
        temp: weather.temp,
        condition: weather.condition,
        description: weather.description,
        icon: weather.icon
      } : undefined,
      todayCalendar: events,
      incompleteTasks,
      condition: todayCondition?.level
    };

    const generatedBriefing = generateBriefing(briefingContext);

    // 모드별 브리핑 메시지 조정
    if (mode === 'work') {
      const hour = now.getHours();
      let workHeadline = '';
      if (hour < 12) {
        workHeadline = '생산적인 아침을 만들어봐요';
      } else if (hour < 18) {
        workHeadline = '집중력이 높은 시간이에요';
      } else {
        workHeadline = '업무 마무리 시간이에요';
      }
      setBriefing({
        headline: workHeadline,
        subline: events.length > 0
          ? `오늘 ${events.length}개의 일정이 있어요`
          : '오늘 예정된 일정이 없어요'
      });
    } else if (mode === 'life') {
      const hour = now.getHours();
      let lifeHeadline = '';
      if (hour < 12) {
        lifeHeadline = '오늘은 나를 위한 하루예요';
      } else if (hour < 18) {
        lifeHeadline = '잠시 멈추고 숨 돌리세요';
      } else {
        lifeHeadline = '편안한 저녁 시간이에요';
      }

      // 컨디션에 따른 메시지 조정
      if (condition === 'bad') {
        lifeHeadline = '오늘은 쉬어가도 괜찮아요';
      } else if (condition === 'great') {
        lifeHeadline = '좋은 에너지가 느껴져요!';
      }

      setBriefing({
        headline: lifeHeadline,
        subline: '일과 삶의 균형을 맞춰봐요'
      });
    } else if (mode === 'finance') {
      setBriefing({
        headline: '재정 현황을 확인해봐요',
        subline: '지출을 기록하고 목표를 관리하세요'
      });
    } else {
      setBriefing({
        headline: generatedBriefing.headline,
        subline: generatedBriefing.subline
      });
    }

    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r ${config.gradient} rounded-2xl p-5 animate-pulse`}>
        <div className="h-6 bg-white/50 rounded w-3/4 mb-3" />
        <div className="h-4 bg-white/50 rounded w-1/2" />
      </div>
    );
  }

  return (
    <>
    <div
      className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} rounded-2xl shadow-sm transition-all duration-300`}
      role="region"
      aria-label={config.title}
    >
      {/* 배경 장식 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/20 rounded-full blur-xl" />

      <div className="relative z-10 p-4">
        {/* 헤더 (항상 표시) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <span className="text-sm font-medium" style={config.accentStyle}>
              {config.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 날씨 아이콘 (클릭 시 상세보기) */}
            {weather && (
              <button
                onClick={() => setShowWeatherDetail(!showWeatherDetail)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/60 hover:bg-white/80 rounded-full text-sm transition-colors"
                aria-label="날씨 상세보기"
              >
                {getWeatherIcon(weather.condition, 16)}
                <span className="font-medium text-gray-700">{weather.temp}°</span>
              </button>
            )}

            {/* 컨디션 아이콘 */}
            {condition && (mode === 'all' || mode === 'life') && (
              <button
                className="p-1.5 bg-white/60 hover:bg-white/80 rounded-full transition-colors"
                aria-label="컨디션"
              >
                <Thermometer size={16} className={config.accentColor} />
              </button>
            )}

            {/* 토글 버튼 - 명확한 버튼 스타일 */}
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/70 hover:bg-white/90 rounded-full transition-all shadow-sm border border-white/50 active:scale-95"
              aria-label={isExpanded ? '브리핑 접기' : '브리핑 펼치기'}
              aria-expanded={isExpanded}
            >
              <span className="text-xs font-medium text-gray-600">
                {isExpanded ? '접기' : '펼치기'}
              </span>
              {isExpanded
                ? <ChevronUp size={14} className="text-gray-600" />
                : <ChevronDown size={14} className="text-gray-600" />
              }
            </button>
          </div>
        </div>

        {/* 날씨 상세 팝업 */}
        {showWeatherDetail && weather && (
          <div className="mt-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-white/50 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.condition, 32)}
                <div>
                  <div className="text-2xl font-bold text-gray-900">{weather.temp}°C</div>
                  <div className="text-xs text-gray-500">체감 {weather.feelsLike || weather.temp}°</div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>{weather.description}</div>
                {weather.high && weather.low && (
                  <div className="text-xs text-gray-400">
                    최고 {weather.high}° / 최저 {weather.low}°
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 확장 콘텐츠 */}
        {isExpanded && (
          <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
            {/* Sleep 추정 카드 (아침 시간대에만) */}
            {showSleepCard && (
              <div className="mb-3">
                <SleepEstimateCard
                  date={today}
                  sleepWindow={sleepWindow}
                  isLoading={sleepLoading}
                  onConfirmAccurate={handleConfirmSleep}
                  onRequestCorrection={handleRequestSleepCorrection}
                  mode="compact"
                />
              </div>
            )}

            {/* 메인 메시지 */}
            <h2 className="text-lg font-bold mb-1 leading-tight" style={{ color: 'var(--text-primary)' }}>
              {briefing.headline}
            </h2>
            {briefing.subline && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {briefing.subline}
              </p>
            )}

            {/* 날씨 팁 (기억해야 할 것) */}
            {weatherTip && (
              <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50/80 rounded-xl border border-amber-100">
                <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{weatherTip}</p>
              </div>
            )}

            {/* 더보기 버튼 */}
            {onMore && (
              <button
                onClick={onMore}
                className="mt-3 text-xs hover:underline flex items-center gap-1 transition-colors"
                style={config.accentStyle}
              >
                자세히 보기 →
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Sleep 정정 바텀시트 (포탈로 렌더링되므로 위치는 중요하지 않음) */}
    <SleepCorrectionSheet
      open={showSleepCorrection}
      date={today}
      initialBedtimeTs={sleepWindow?.bedtimeTs}
      initialWaketimeTs={sleepWindow?.waketimeTs}
      onClose={handleSleepCorrectionClose}
      onSubmit={async (data) => {
        await correctSleep(data);
        handleSleepCorrectionClose();
      }}
    />
  </>
  );
}
