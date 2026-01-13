import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  ModeSwitch,
  BriefingCard,
  PriorityStack,
  BalanceHint,
  Timeline,
  ChatLauncher,
  MoreSheet,
  ProjectPulse,
  ActionCard,
  LifeFactors,
  RelationshipReminder
} from '../components/home';

type Mode = 'all' | 'work' | 'life';

// Dummy data (replace with API/store later)
const DUMMY_PRIORITIES = [
  { id: '1', title: '프로젝트 리뷰 준비', sourceTag: 'WORK' as const, meta: '오후 2시' },
  { id: '2', title: '엄마 전화', sourceTag: 'LIFE' as const, meta: '오늘 중' },
  { id: '3', title: '이메일 정리', sourceTag: 'WORK' as const },
  { id: '4', title: '운동 30분', sourceTag: 'LIFE' as const },
  { id: '5', title: '독서 시간', sourceTag: 'LIFE' as const }
];

const DUMMY_TIMELINE = [
  { id: '1', timeRange: '10:00', title: '팀 스탠드업', importance: 'mid' as const, sourceTag: 'WORK' as const },
  { id: '2', timeRange: '14:00', title: '프로젝트 리뷰', importance: 'high' as const, sourceTag: 'WORK' as const },
  { id: '3', timeRange: '16:30', title: '1:1 미팅', importance: 'mid' as const, sourceTag: 'WORK' as const },
  { id: '4', timeRange: '18:00', title: '퇴근', importance: 'low' as const, sourceTag: 'LIFE' as const },
  { id: '5', timeRange: '19:30', title: '저녁 약속', importance: 'high' as const, sourceTag: 'LIFE' as const }
];

// WORK mode data
const DUMMY_PROJECTS = [
  { id: '1', name: 'Q1 마케팅 캐페인', signal: 'green' as const },
  { id: '2', name: '신규 기능 개발', signal: 'yellow' as const },
  { id: '3', name: '고객 피드백 분석', signal: 'red' as const }
];

const DUMMY_ACTIONS = [
  {
    id: '1',
    variant: 'email' as const,
    title: '팀장님 피드백 요청',
    summary: '프로젝트 진행 상황에 대한 피드백을 요청하셨어요.',
    meta: 'Action Needed',
    recommendedAction: '오늘 중 답장하면 좋겠어요'
  },
  {
    id: '2',
    variant: 'meeting' as const,
    title: '클라이언트 미팅',
    summary: '내일 10시, 회의실 A',
    recommendedAction: '자료 준비하세요'
  }
];

// LIFE mode data
const DUMMY_LIFE_FACTORS = [
  { id: '1', label: '수면', statusText: '6시간 30분', signal: 'down' as const },
  { id: '2', label: '운동', statusText: '오늘 아직', signal: 'steady' as const },
  { id: '3', label: '감정', statusText: '보통', signal: 'steady' as const },
  { id: '4', label: '에너지', statusText: '높은 편', signal: 'up' as const }
];

const DUMMY_RELATIONSHIPS = [
  { id: '1', name: '김민지', reason: '마지막 연락 3주 전' },
  { id: '2', name: '이준호', reason: '생일 D-5' }
];

export default function Home() {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<Mode>('all');
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const now = new Date();
  const hours = now.getHours();
  
  // Time-based greeting
  const getGreeting = () => {
    if (hours < 12) return '좋은 아침이에요';
    if (hours < 18) return '오후도 힘내요';
    return '오늘 하루 수고했어요';
  };

  // Mode-specific briefing
  const getBriefing = () => {
    if (mode === 'work') {
      return {
        headline: '오늘은 실행보다 결정이 중요한 날이에요',
        subline: '프로젝트 리뷰에 집중하세요'
      };
    }
    if (mode === 'life') {
      return {
        headline: '오늘은 무리하지 않는 게 가장 생산적인 선택이에요',
        subline: '수면이 부족하니 가벼운 활동으로'
      };
    }
    // ALL mode
    if (hours < 12) {
      return {
        headline: '오전에 집중하고, 오후는 미팅에 맡기세요',
        subline: '일정 3개 중 2개가 오후에 몰려있어요'
      };
    }
    if (hours < 18) {
      return {
        headline: '지금 가장 중요한 건 프로젝트 리뷰예요',
        subline: '2시간 후 미팅이 시작돼요'
      };
    }
    return {
      headline: `${user?.name || 'Boss'}, 오늘 하루 수고했어요`,
      subline: '이제 푸 쉬세요. 내일도 함께할게요 ✨'
    };
  };

  const briefing = getBriefing();

  // Filter priorities by mode
  const filteredPriorities = mode === 'all' 
    ? DUMMY_PRIORITIES 
    : DUMMY_PRIORITIES.filter(p => p.sourceTag.toLowerCase() === mode);

  // Work/Life ratio calculation
  const workCount = DUMMY_TIMELINE.filter(t => t.sourceTag === 'WORK').length;
  const lifeCount = DUMMY_TIMELINE.filter(t => t.sourceTag === 'LIFE').length;
  const total = workCount + lifeCount;
  const workPercent = Math.round((workCount / total) * 100);
  const lifePercent = 100 - workPercent;

  // Mode-specific more sheet content
  const getMoreSheetContent = () => {
    if (mode === 'work') {
      return {
        why: '프로젝트 리뷰가 내일 마감이에요. 오늘 준비하면 여유가 생겨요.',
        whatChanged: '클라이언트에서 새로운 요청이 왔어요.',
        tradeOff: '이메일 정리는 내일로 미뤘도 괜찮아요.'
      };
    }
    if (mode === 'life') {
      return {
        why: '수면이 부족해서 에너지 관리가 필요해요.',
        whatChanged: '저녁 약속이 잡혀서 휴식 시간이 줄었어요.',
        tradeOff: '운동은 가벼게 하고 저녁 약속을 즐기세요.'
      };
    }
    return {
      why: '오후 2시 프로젝트 리뷰가 가장 중요한 일정이에요. 준비가 필요하니 오전 시간을 활용하세요.',
      whatChanged: '어제 추가된 저녁 약속 때문에 퇴근 후 시간이 빠듯해요.',
      tradeOff: '이메일 정리는 내일로 미뤘도 괜찮아요. 급한 건 없어 보여요.'
    };
  };

  const moreContent = getMoreSheetContent();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-neutral-500">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-neutral-900">
              {user?.name || 'Boss'}님
            </h1>
          </div>
          <span className="text-3xl">🐧</span>
        </div>

        {/* ModeSwitch */}
        <ModeSwitch activeMode={mode} onChange={setMode} />

        {/* BriefingCard */}
        <BriefingCard
          type="default"
          headline={briefing.headline}
          subline={briefing.subline}
          hasMore={true}
          onMore={() => setIsMoreSheetOpen(true)}
        />

        {/* PriorityStack */}
        <PriorityStack
          count={3}
          items={filteredPriorities}
          onMore={() => console.log('더 보기')}
        />

        {/* Mode-specific components */}
        {mode === 'all' && (
          <BalanceHint workPercent={workPercent} lifePercent={lifePercent} />
        )}

        {mode === 'work' && (
          <>
            <ProjectPulse 
              projects={DUMMY_PROJECTS} 
              onOpen={(id) => console.log('Open project:', id)} 
            />
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-700">
                중요한 액션
              </h3>
              {DUMMY_ACTIONS.map((action) => (
                <ActionCard
                  key={action.id}
                  variant={action.variant}
                  title={action.title}
                  summary={action.summary}
                  meta={action.meta}
                  recommendedAction={action.recommendedAction}
                />
              ))}
            </div>
          </>
        )}

        {mode === 'life' && (
          <>
            <LifeFactors items={DUMMY_LIFE_FACTORS} />
            <RelationshipReminder 
              items={DUMMY_RELATIONSHIPS}
              onOpen={(id) => console.log('Open relationship:', id)}
            />
          </>
        )}

        {/* Timeline */}
        <Timeline mode={mode} items={DUMMY_TIMELINE} />
      </div>

      {/* Floating ChatLauncher */}
      <ChatLauncher variant="floating" />

      {/* MoreSheet */}
      <MoreSheet
        isOpen={isMoreSheetOpen}
        onClose={() => setIsMoreSheetOpen(false)}
        title={mode === 'all' ? '오늘의 판단 근거' : mode === 'work' ? '업무 판단 근거' : '라이프 판단 근거'}
        why={moreContent.why}
        whatChanged={moreContent.whatChanged}
        tradeOff={moreContent.tradeOff}
      />
    </div>
  );
}
