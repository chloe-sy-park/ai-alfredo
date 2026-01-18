import { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, Briefcase, Heart, Wallet, Layout, Sparkles, LucideIcon } from 'lucide-react';
import { getWeather, WeatherData } from '../../services/weather';
import { getTodayCondition, ConditionLevel } from '../../services/condition';
import { generateBriefing, BriefingContext } from '../../services/briefing';
import { getTodayEvents, CalendarEvent } from '../../services/calendar';
import { getTasks, Task } from '../../services/tasks';

export type BriefingMode = 'all' | 'work' | 'life' | 'finance';

interface BriefingHeroProps {
  mode?: BriefingMode;
  compact?: boolean;
  onMore?: () => void;
}

// 모드별 설정
const modeConfig: Record<BriefingMode, {
  gradient: string;
  icon: LucideIcon;
  title: string;
  emoji: string;
  accentColor: string;
}> = {
  all: {
    gradient: 'from-primary/10 via-secondary/5 to-primary/10',
    icon: Layout,
    title: '오늘의 브리핑',
    emoji: '🐧',
    accentColor: 'text-primary'
  },
  work: {
    gradient: 'from-blue-50 via-indigo-50/50 to-blue-50',
    icon: Briefcase,
    title: '업무 브리핑',
    emoji: '💼',
    accentColor: 'text-blue-600'
  },
  life: {
    gradient: 'from-green-50 via-teal-50/50 to-green-50',
    icon: Heart,
    title: '웰빙 브리핑',
    emoji: '🌿',
    accentColor: 'text-green-600'
  },
  finance: {
    gradient: 'from-emerald-50 via-amber-50/30 to-emerald-50',
    icon: Wallet,
    title: '재정 브리핑',
    emoji: '💰',
    accentColor: 'text-emerald-600'
  }
};

// 날씨 아이콘 매핑
function getWeatherIcon(condition: string) {
  if (condition.includes('rain') || condition.includes('비')) {
    return <CloudRain size={18} className="text-blue-500" />;
  }
  if (condition.includes('cloud') || condition.includes('구름')) {
    return <Cloud size={18} className="text-gray-500" />;
  }
  return <Sun size={18} className="text-yellow-500" />;
}

// 컨디션 텍스트
function getConditionText(level: ConditionLevel | null): string {
  if (!level) return '컨디션 미설정';
  const map: Record<ConditionLevel, string> = {
    great: '아주 좋음',
    good: '좋음',
    normal: '보통',
    bad: '좋지 않음'
  };
  return map[level];
}

export default function BriefingHero({
  mode = 'all',
  compact = false,
  onMore
}: BriefingHeroProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [condition, setCondition] = useState<ConditionLevel | null>(null);
  const [briefing, setBriefing] = useState({ headline: '', subline: '' });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const config = modeConfig[mode];
  const IconComponent = config.icon;

  useEffect(() => {
    loadData();
  }, [mode]);

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
    <div
      className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} rounded-2xl ${compact ? 'p-4' : 'p-5'} shadow-sm transition-all duration-300 animate-slide-down`}
      role="region"
      aria-label={config.title}
    >
      {/* 배경 장식 */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/20 rounded-full blur-xl" />

      <div className="relative z-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.emoji}</span>
            <div className="flex items-center gap-1.5">
              <IconComponent size={14} className={config.accentColor} />
              <span className={`text-xs font-medium ${config.accentColor}`}>
                {config.title}
              </span>
            </div>
          </div>

          {/* 날씨 + 컨디션 요약 (ALL/LIFE 모드) */}
          {(mode === 'all' || mode === 'life') && (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              {weather && (
                <div className="flex items-center gap-1">
                  {getWeatherIcon(weather.condition)}
                  <span>{weather.temp}°</span>
                </div>
              )}
              {condition && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full">
                  <Sparkles size={12} className={config.accentColor} />
                  <span>{getConditionText(condition)}</span>
                </div>
              )}
            </div>
          )}

          {/* 일정 수 (WORK 모드) */}
          {mode === 'work' && events.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full text-xs text-gray-600">
              <Briefcase size={12} />
              <span>{events.length}개 일정</span>
            </div>
          )}
        </div>

        {/* 메인 메시지 */}
        <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-1 leading-tight`}>
          {briefing.headline}
        </h2>
        {briefing.subline && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {briefing.subline}
          </p>
        )}

        {/* 더보기 버튼 */}
        {onMore && (
          <button
            onClick={onMore}
            className={`mt-3 text-xs ${config.accentColor} hover:underline flex items-center gap-1 transition-colors`}
          >
            자세히 보기 →
          </button>
        )}
      </div>
    </div>
  );
}
