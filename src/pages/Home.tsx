import { useEffect, useCallback, useState } from 'react';
import { Card } from '@/components/common';
import { Calendar, CheckCircle2, Clock, Sparkles, CloudSun, Play, Pause, Brain, RefreshCw } from 'lucide-react';
import { ProactiveNudge, ACTION_TYPES } from '@/components/home/ProactiveNudge';
import { useTaskStore } from '@/stores/taskStore';
import { useFocusStore } from '@/stores/focusStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useDNAStore } from '@/stores/dnaStore';
import { DNAInsightList } from '@/components/home/DNAInsightCard';
import DNAProfileSummary from '@/components/home/DNAProfileSummary';
import { DNAMessageGenerator } from '@/services/dna/messageGenerator';
import { CalendarEvent } from '@/services/dna/types';

export default function Home() {
  // Stores
  const { tasks, isLoading: tasksLoading, fetchTasks, completeTask, getTop3Tasks } = useTaskStore();
  const { activeSession, isPaused, elapsedTime, startSession, pauseSession, resumeSession } = useFocusStore();
  const { energyLevel, setEnergyLevel } = useSettingsStore();
  const { profile, suggestions, isAnalyzing, analyzeCalendar, analysisPhase } = useDNAStore();

  // DNA 기반 브리핑 메시지
  const [briefingMessage, setBriefingMessage] = useState<string>('');

  // 초기 데이터 로드
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 하드코딩된 이벤트 (캘린더 연동 전) - DNA 분석용으로 확장
  const events = [
    { time: '10:00', title: '팀 스탠드업', duration: '30분', type: 'meeting' },
    { time: '11:00', title: '디자인 리뷰', duration: '1시간', type: 'meeting' },
    { time: '14:00', title: '집중 작업 시간', duration: '2시간', type: 'focus' },
    { time: '16:00', title: '1:1 미팅', duration: '30분', type: 'meeting' }
  ];

  // DNA 분석용 캘린더 이벤트 목
  const mockCalendarEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '팀 스탠드업',
      start: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2시간 후
      end: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
      isAllDay: false,
      attendees: 5,
      calendarType: 'work',
      isRecurring: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'confirmed'
    },
    {
      id: '2',
      title: '디자인 리뷰',
      start: new Date(Date.now() + 3 * 60 * 60 * 1000),
      end: new Date(Date.now() + 4 * 60 * 60 * 1000),
      isAllDay: false,
      attendees: 3,
      calendarType: 'work',
      isRecurring: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'confirmed'
    },
    {
      id: '3',
      title: '1:1 미팅',
      start: new Date(Date.now() + 6 * 60 * 60 * 1000),
      end: new Date(Date.now() + 6.5 * 60 * 60 * 1000),
      isAllDay: false,
      attendees: 2,
      calendarType: 'work',
      isRecurring: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: 'confirmed'
    },
    // 지난 주 데이터 (패턴 분석용)
    ...generatePastWeekEvents()
  ];

  // DNA 분석 실행
  const handleAnalyzeCalendar = useCallback(async () => {
    await analyzeCalendar('current-user', mockCalendarEvents);
  }, [analyzeCalendar]);

  // 초기 DNA 분석 (프로필 없을 때)
  useEffect(() => {
    if (!profile && !isAnalyzing) {
      handleAnalyzeCalendar();
    }
  }, [profile, isAnalyzing, handleAnalyzeCalendar]);

  // DNA 기반 브리핑 메시지 생성
  useEffect(() => {
    if (profile) {
      const generator = new DNAMessageGenerator(profile);
      const nextMeeting = events[0] ? { title: events[0].title, time: events[0].time } : undefined;
      const message = generator.generateMorningBriefing(events.length, nextMeeting);
      setBriefingMessage(message);
    } else {
      setBriefingMessage(`오늘 오전에 회의 ${events.filter(e => e.type === 'meeting').length}개가 있어요. ${events[0]?.time} ${events[0]?.title}부터 시작하고, 점심 전엔 여유 시간이 있어요 ☕`);
    }
  }, [profile, events]);

  // Top 3 태스크
  const top3Tasks = getTop3Tasks();
  const completedCount = top3Tasks.filter(t => t.status === 'done').length;

  // 첫 방문 체크
  const isFirstVisitToday = (() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('alfredo_last_visit');
    if (lastVisit !== today) {
      localStorage.setItem('alfredo_last_visit', today);
      return true;
    }
    return false;
  })();

  // ProactiveNudge 컨텍스트
  const nudgeContext = {
    isFirstVisitToday,
    taskCount: tasks.length,
    completedTaskCount: tasks.filter(t => t.status === 'done').length,
    calendarEventsToday: events.length,
    energyLevel,
    streak: 5,
  };

  // Nudge 액션 핸들러
  const handleNudgeAction = useCallback((action: string) => {
    switch(action) {
      case ACTION_TYPES.OPEN_BRIEFING:
        console.log('Opening briefing...');
        break;
      case ACTION_TYPES.OPEN_TASKS:
        document.getElementById('top3-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case ACTION_TYPES.OPEN_CALENDAR:
        document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case ACTION_TYPES.START_FOCUS:
        if (!activeSession) {
          startSession({ mode: 'pomodoro' });
        }
        break;
      case ACTION_TYPES.LOG_CONDITION:
        console.log('Logging condition...');
        break;
      case ACTION_TYPES.SHOW_ACHIEVEMENT:
        console.log('Showing achievement...');
        break;
    }
  }, [activeSession, startSession]);

  // DNA 인사이트 액션 핸들러
  const handleInsightAction = useCallback((action: string) => {
    switch(action) {
      case 'protect_focus_time':
        console.log('Protecting focus time...');
        break;
      case 'find_free_time':
        document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'open_life_tab':
        window.location.href = '/life';
        break;
    }
  }, []);

  // 태스크 완료 핸들러
  const handleTaskComplete = async (taskId: string) => {
    await completeTask(taskId);
  };

  // 포커스 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 남은 시간 계산
  const getRemainingTime = () => {
    if (!activeSession) return '25:00';
    const targetSeconds = activeSession.mode === 'pomodoro' ? 25 * 60 : 
                          activeSession.mode === 'deep_work' ? 50 * 60 : 5 * 60;
    const remaining = Math.max(0, targetSeconds - elapsedTime);
    return formatTime(remaining);
  };

  // isRunning derived from isPaused
  const isRunning = activeSession && !isPaused;

  // DNA 기반 피크 시간 안내
  const getPeakTimeIndicator = () => {
    if (!profile) return null;
    const currentHour = new Date().getHours();
    const isPeakTime = profile.energyPattern.peakHours.includes(currentHour);
    
    if (isPeakTime) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
          <Brain size={12} />
          <span>피크 시간</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fadeIn pb-24">
      {/* 알프레도 브리핑 - DNA 기반 */}
      <Card variant="glass" className="relative overflow-hidden">
        <div className="flex gap-3">
          <div className="text-4xl">🐧</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {getPeakTimeIndicator()}
              {profile && (
                <span className="text-xs text-lavender-500 bg-lavender-50 px-2 py-0.5 rounded-full">
                  DNA 분석 {analysisPhase === 'day1' ? 'Day 1' : analysisPhase === 'week1' ? 'Week 1' : 'Week 2+'}
                </span>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">
              {briefingMessage}
            </p>
            <button className="mt-2 text-sm text-lavender-500 font-medium hover:text-lavender-600">
              더 들어볼래 →
            </button>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">
          🐧
        </div>
      </Card>

      {/* 날씨 + 컨디션 */}
      <div className="flex gap-3">
        <Card className="flex-1 flex items-center gap-3">
          <CloudSun className="text-amber-400" size={28} />
          <div>
            <p className="text-2xl font-semibold">12°</p>
            <p className="text-xs text-gray-500">맑음</p>
          </div>
        </Card>
        <Card 
          className="flex-1 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => {
            const levels: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
            const currentIndex = levels.indexOf(energyLevel);
            setEnergyLevel(levels[(currentIndex + 1) % 3]);
          }}
        >
          <p className="text-xs text-gray-500 mb-1">오늘 컨디션</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {energyLevel === 'high' ? '😊' : energyLevel === 'medium' ? '😐' : '😴'}
            </span>
            <span className="font-medium">
              {energyLevel === 'high' ? '좋음' : energyLevel === 'medium' ? '보통' : '피곤'}
            </span>
          </div>
        </Card>
      </div>

      {/* DNA 인사이트 섹션 */}
      {suggestions.length > 0 && (
        <div className="animate-fadeInUp">
          <DNAInsightList onAction={handleInsightAction} />
        </div>
      )}

      {/* 오늘의 Top 3 */}
      <Card id="top3-section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="text-lavender-400" size={18} />
            오늘의 Top 3
            <span className="text-sm font-normal text-gray-400">
              ({completedCount}/{top3Tasks.length})
            </span>
          </h2>
          <button className="text-sm text-lavender-500">수정</button>
        </div>
        
        {tasksLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : top3Tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>아직 Top 3 태스크가 없어요</p>
            <button className="mt-2 text-lavender-500 text-sm">태스크 추가하기</button>
          </div>
        ) : (
          <div className="space-y-2">
            {top3Tasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  task.status === 'done' ? 'bg-gray-50' : 'bg-lavender-50'
                }`}
              >
                <button 
                  onClick={() => handleTaskComplete(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.status === 'done'
                      ? 'bg-lavender-400 border-lavender-400 text-white'
                      : 'border-lavender-300 hover:border-lavender-400'
                  }`}
                >
                  {task.status === 'done' && <CheckCircle2 size={14} />}
                </button>
                <div className="flex-1">
                  <p className={task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}>
                    {task.title}
                  </p>
                </div>
                {task.estimated_minutes && (
                  <span className="text-xs text-gray-400">~{task.estimated_minutes}분</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 지금 집중할 것 */}
      <Card className="bg-gradient-to-r from-lavender-400 to-lavender-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80 mb-1">지금 집중할 것</p>
            <p className="text-lg font-semibold">
              {activeSession ? '포커스 모드 진행 중' : top3Tasks[0]?.title || '태스크를 선택하세요'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Clock size={14} />
              <span className="text-sm">{getRemainingTime()} 남음</span>
            </div>
          </div>
          <button
            onClick={() => {
              if (!activeSession) {
                startSession({ mode: 'pomodoro' });
              } else if (isRunning) {
                pauseSession();
              } else {
                resumeSession();
              }
            }}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </Card>

      {/* 오늘 타임라인 */}
      <Card id="timeline-section">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="text-lavender-400" size={18} />
            오늘 타임라인
          </h2>
        </div>
        <div className="space-y-3">
          {events.map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-14 text-sm text-gray-500">{event.time}</div>
              <div className={`w-1 h-12 rounded-full ${
                event.type === 'focus' ? 'bg-green-400' : 'bg-lavender-300'
              }`} />
              <div>
                <p className="font-medium text-gray-800">{event.title}</p>
                <p className="text-xs text-gray-400">{event.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* DNA 프로필 요약 */}
      {profile && (
        <div className="animate-fadeInUp">
          <DNAProfileSummary />
        </div>
      )}

      {/* DNA 재분석 버튼 */}
      {profile && (
        <button
          onClick={handleAnalyzeCalendar}
          disabled={isAnalyzing}
          className="w-full py-3 px-4 rounded-xl border border-lavender-200 text-lavender-600 text-sm font-medium hover:bg-lavender-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isAnalyzing ? 'animate-spin' : ''} />
          {isAnalyzing ? 'DNA 분석 중...' : '캘린더 다시 분석하기'}
        </button>
      )}

      {/* 기억해야 할 것 */}
      <Card variant="outlined">
        <h2 className="font-semibold mb-2">📌 기억해야 할 것</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• 오후 3시 약 먹기</li>
          <li>• 토스로 세금계산서 체크</li>
        </ul>
      </Card>

      {/* 선제적 대화 넣지 (플로팅) */}
      <ProactiveNudge
        context={nudgeContext}
        onAction={handleNudgeAction}
        enabled={true}
      />
    </div>
  );
}

// 지난 주 목 데이터 생성 (패턴 분석용)
function generatePastWeekEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const now = new Date();
  
  for (let day = 1; day <= 14; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    
    // 평일만 이벤트 생성
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // 아침 미팅 (9-10시)
      events.push({
        id: `past-${day}-1`,
        title: '팀 스탠드업',
        start: new Date(date.setHours(9, 0, 0, 0)),
        end: new Date(date.setHours(9, 30, 0, 0)),
        isAllDay: false,
        attendees: 5,
        calendarType: 'work',
        isRecurring: true,
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        status: 'confirmed'
      });

      // 화요일엔 미팅 더 많이
      if (dayOfWeek === 2) {
        events.push({
          id: `past-${day}-2`,
          title: '팀 주간 회의',
          start: new Date(date.setHours(14, 0, 0, 0)),
          end: new Date(date.setHours(15, 0, 0, 0)),
          isAllDay: false,
          attendees: 8,
          calendarType: 'work',
          isRecurring: true,
          createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          status: 'confirmed'
        });
      }

      // 목요일에 1:1
      if (dayOfWeek === 4) {
        events.push({
          id: `past-${day}-3`,
          title: '1:1 면담',
          start: new Date(date.setHours(16, 0, 0, 0)),
          end: new Date(date.setHours(16, 30, 0, 0)),
          isAllDay: false,
          attendees: 2,
          calendarType: 'work',
          isRecurring: true,
          createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          status: 'confirmed'
        });
      }

      // 금요일 오후는 여유롭게
      if (dayOfWeek === 5) {
        events.push({
          id: `past-${day}-4`,
          title: '운동',
          start: new Date(date.setHours(18, 0, 0, 0)),
          end: new Date(date.setHours(19, 0, 0, 0)),
          isAllDay: false,
          calendarType: 'personal',
          isRecurring: true,
          createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
          status: 'confirmed'
        });
      }
    }
  }
  
  return events;
}
