import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Heart } from 'lucide-react';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { getTop3, Top3Item } from '../services/top3';
import { getRelationships, Relationship } from '../services/relationships';

// Home 컴포넌트 재사용 (PRD 구조)
import BriefingCard from '../components/home/BriefingCard';
import PriorityStack from '../components/home/PriorityStack';
import RelationshipReminder from '../components/home/RelationshipReminder';
import LifeFactors from '../components/home/LifeFactors';
import { MoreSheet } from '../components/home';
import { LifeTrends } from '../components/life';

export default function Life() {
  var [condition, setCondition] = useState<ConditionLevel | null>(null);
  var [briefing, setBriefing] = useState({ headline: '', subline: '' });
  var [lifePriorities, setLifePriorities] = useState<Top3Item[]>([]);
  var [relationships, setRelationships] = useState<Relationship[]>([]);
  var [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    // 컨디션 로드
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCondition(todayCondition.level);
    }

    // Life 우선순위 (개인 항목만 필터)
    var allItems = getTop3();
    var lifeItems = allItems.filter(function(item) {
      return item.isPersonal === true;
    });
    setLifePriorities(lifeItems);

    // 관계 데이터 로드
    var relationshipData = getRelationships();
    setRelationships(relationshipData.slice(0, 3)); // Top 3만

    // Life 모드에 맞는 브리핑 메시지
    var now = new Date();
    var hour = now.getHours();
    var lifeHeadline = '';
    var lifeSubline = '';

    if (hour < 12) {
      lifeHeadline = '오늘은 나를 위한 하루예요';
      lifeSubline = '작은 것부터 챙겨볼까요';
    } else if (hour < 18) {
      lifeHeadline = '잠시 멈추고 숨 돌리세요';
      lifeSubline = '일과 삶의 균형이 중요해요';
    } else {
      lifeHeadline = '하루를 마무리하는 시간';
      lifeSubline = '오늘의 나에게 수고했다고 말해주세요';
    }

    // 컨디션에 따른 메시지 조정
    if (condition === 'bad') {
      lifeHeadline = '오늘은 쉬어가도 괜찮아요';
      lifeSubline = '컨디션이 좋지 않을 땐 무리하지 마세요';
    } else if (condition === 'great') {
      lifeHeadline = '좋은 컨디션이네요!';
      lifeSubline = '이 에너지로 의미 있는 하루를 만들어봐요';
    }

    setBriefing({
      headline: lifeHeadline,
      subline: lifeSubline
    });
  }

  // PriorityStack용 데이터 변환
  var priorityItems = lifePriorities.map(function(item) {
    return {
      id: item.id,
      title: item.title,
      sourceTag: 'LIFE' as const,
      meta: item.completed ? '완료' : undefined,
      status: item.completed ? 'done' as const : 'pending' as const
    };
  });

  // RelationshipReminder용 데이터 변환
  var relationshipItems = relationships.map(function(rel) {
    return {
      id: rel.id,
      name: rel.name,
      reason: rel.lastContactDate
        ? '마지막 연락: ' + new Date(rel.lastContactDate).toLocaleDateString('ko-KR')
        : '연락해보세요'
    };
  });

  // LifeFactors 데이터
  var lifeFactorItems = [
    {
      id: 'condition',
      label: '컨디션',
      statusText: condition
        ? { great: '아주 좋음', good: '좋음', normal: '보통', bad: '좋지 않음' }[condition]
        : '미설정',
      signal: condition === 'great' ? 'up' as const
        : condition === 'bad' ? 'down' as const
        : 'steady' as const
    },
    {
      id: 'balance',
      label: '균형',
      statusText: lifePriorities.length > 0 ? '관리 중' : '여유로움',
      signal: 'steady' as const
    },
    {
      id: 'relationships',
      label: '관계',
      statusText: relationships.length + '명 케어',
      signal: relationships.length > 0 ? 'up' as const : 'steady' as const
    },
    {
      id: 'rest',
      label: '휴식',
      statusText: condition === 'bad' ? '필요함' : '적당함',
      signal: condition === 'bad' ? 'down' as const : 'steady' as const
    }
  ];

  // MoreSheet 콘텐츠
  function getMoreContent() {
    return {
      why: '라이프 영역의 균형을 위해 분석했어요.',
      whatChanged: '컨디션과 관계 데이터를 기반으로 판단했어요.',
      tradeOff: '일에 치여 소중한 것들을 놓치지 마세요.'
    };
  }

  var moreContent = getMoreContent();

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-gray-900">
      <PageHeader />

      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-pink-500" />
          <h1 className="text-lg font-bold text-[#1A1A1A] dark:text-white">라이프</h1>
        </div>

        {/* 1. BriefingCard - PRD R1: 브리핑은 항상 있다 */}
        <BriefingCard
          headline={briefing.headline}
          subline={briefing.subline}
          onMore={function() { setIsMoreSheetOpen(true); }}
        />

        {/* 2. PriorityStack - PRD R5: 우선순위는 순서다 */}
        {priorityItems.length > 0 && (
          <PriorityStack
            items={priorityItems}
            count={3}
            onMore={function() { setIsMoreSheetOpen(true); }}
          />
        )}

        {/* 3. RelationshipReminder - PRD 명세 */}
        {relationshipItems.length > 0 && (
          <RelationshipReminder
            items={relationshipItems}
          />
        )}

        {/* 4. LifeFactors - PRD 명세 */}
        <LifeFactors items={lifeFactorItems} />

        {/* 5. Timeline (LifeTrends) - PRD 명세 */}
        <LifeTrends />
      </div>

      {/* 더보기 시트 - PRD R3: 확장은 오직 "더 보기" */}
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
