import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import {
  ModeSwitch,
  BriefingCard,
  PriorityStack,
  BalanceHint,
  Timeline,
  ChatLauncher,
  MoreSheet
} from '../components/home';

type Mode = 'all' | 'work' | 'life';

// 더미 데이터 (나중에 API/store로 대체)
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

export default function Home() {
  const { user } = useAuthStore();
  const [mode, setMode] = useState<Mode>('all');
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const now = new Date();
  const hours = now.getHours();
  
  // 시간대별 인사말
  const getGreeting = () => {
    if (hours < 12) return '좋은 아침이에요';
    if (hours < 18) return '오후도 힘내요';
    return '오늘 하루 수고했어요';
  };

  // 브리핑 내용 (시간대/상황별 변경)
  const getBriefing = () => {
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
      subline: '이제 푹 쉬세요. 내일도 함께할게요 ✨'
    };
  };

  const briefing = getBriefing();

  // 모드별 필터링된 우선순위
  const filteredPriorities = mode === 'all' 
    ? DUMMY_PRIORITIES 
    : DUMMY_PRIORITIES.filter(p => p.sourceTag.toLowerCase() === mode);

  // Work/Life 비율 계산
  const workCount = DUMMY_TIMELINE.filter(t => t.sourceTag === 'WORK').length;
  const lifeCount = DUMMY_TIMELINE.filter(t => t.sourceTag === 'LIFE').length;
  const total = workCount + lifeCount;
  const workPercent = Math.round((workCount / total) * 100);
  const lifePercent = 100 - workPercent;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        {/* 헤더 */}
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

        {/* BalanceHint (ALL 모드에서만) */}
        {mode === 'all' && (
          <BalanceHint workPercent={workPercent} lifePercent={lifePercent} />
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
        title="오늘의 판단 근거"
        why="오후 2시 프로젝트 리뷰가 가장 중요한 일정이에요. 준비가 필요하니 오전 시간을 활용하세요."
        whatChanged="어제 추가된 저녁 약속 때문에 퇴근 후 시간이 빠듯해요."
        tradeOff="이메일 정리는 내일로 미뤄도 괜찮아요. 급한 건 없어 보여요."
      />
    </div>
  );
}
