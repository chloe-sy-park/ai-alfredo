/**
 * Home Page - Top 3 Judgment MVP
 *
 * 핵심 기능만 남기기:
 * - 인사 + 간단 브리핑
 * - Top 3 카드 (드래그 정렬 + 판단)
 * - 오늘 일정 (캘린더)
 * - Lift 기록 (컴팩트)
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLiftStore } from '../stores/liftStore';
import { getTodayEvents, isGoogleAuthenticated, CalendarEvent } from '../services/calendar';
import { getTop3 } from '../services/top3';
import { requestTop3Judgment, Top3JudgmentResponse } from '../services/top3Briefing';

// Components
import { PageHeader } from '../components/layout';
import Top3BriefingCard from '../components/top3/Top3BriefingCard';
import LiftRecordTable from '../components/lift/LiftRecordTable';
import { TodayAgenda, DaySchedule } from '../components/home';
import { OfflineIndicator } from '../components/common/SyncResponsibilityBadge';

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore().user;
  const liftStore = useLiftStore();

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [judgment, setJudgment] = useState<Top3JudgmentResponse | null>(null);
  const [isLoadingJudgment, setIsLoadingJudgment] = useState(false);

  // 캘린더 데이터 로드
  useEffect(() => {
    const connected = isGoogleAuthenticated();
    if (connected) {
      getTodayEvents()
        .then(setCalendarEvents)
        .catch((err) => console.error('Calendar error:', err));
    }
  }, []);

  // 브리핑 요청
  const handleRequestBriefing = useCallback(async () => {
    setIsLoadingJudgment(true);
    try {
      const now = new Date();
      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const top3Items = getTop3();

      const result = await requestTop3Judgment({
        calendarEvents,
        top3Items,
        currentTime: now.toISOString(),
        dayOfWeek: days[now.getDay()],
        userName: user?.name,
      });

      setJudgment(result);

      // Lift 기록: 브리핑 요청
      liftStore.addLift({
        type: 'consider',
        category: 'priority',
        previousDecision: 'Top 3 검토',
        newDecision: result.headline,
        reason: '알프레도 판단 요청',
        impact: 'medium',
      });
    } catch (error) {
      console.error('Briefing request failed:', error);
    } finally {
      setIsLoadingJudgment(false);
    }
  }, [calendarEvents, user?.name, liftStore]);

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <OfflineIndicator />
      <PageHeader />

      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-4 space-y-4">
        {/* 인사 */}
        <div className="animate-fade-in">
          <p className="text-sm sm:text-base" style={{ color: 'var(--text-tertiary)' }}>
            {getGreeting()}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {user?.name || 'Boss'}님
          </h1>
        </div>

        {/* 1. Top 3 + 알프레도 판단 */}
        <Top3BriefingCard
          judgment={judgment}
          isLoadingJudgment={isLoadingJudgment}
          onRequestBriefing={handleRequestBriefing}
        />

        {/* 2. 오늘 일정 */}
        <TodayAgenda mode="all" />

        {/* 3. 스케줄 타임라인 */}
        <DaySchedule mode="all" />

        {/* 4. Lift 기록 (컴팩트) */}
        <div
          onClick={() => navigate('/lift')}
          className="cursor-pointer"
        >
          <LiftRecordTable maxRows={3} showFilter={false} compact={true} />
        </div>
      </div>
    </div>
  );
}
