import { useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Heart } from 'lucide-react';
import { useLifeStore } from '../stores/lifeStore';

// Home 컴포넌트 재사용 (PRD 구조)
import BriefingCard from '../components/home/BriefingCard';
import PriorityStack from '../components/home/PriorityStack';
import RelationshipReminder from '../components/home/RelationshipReminder';
import LifeFactors from '../components/home/LifeFactors';
import { MoreSheet } from '../components/home';
import { LifeTrends } from '../components/life';

export default function Life() {
  // Zustand Store 사용
  const {
    briefing,
    isMoreSheetOpen,
    isLoading,
    loadData,
    openMoreSheet,
    closeMoreSheet,
    getPriorityItems,
    getRelationshipItems,
    getLifeFactors,
    getMoreContent,
  } = useLifeStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const priorityItems = getPriorityItems();
  const relationshipItems = getRelationshipItems();
  const lifeFactorItems = getLifeFactors();
  const moreContent = getMoreContent();

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-text-muted dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <PageHeader />

      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2" role="heading" aria-level={1}>
          <Heart size={20} className="text-life-text" aria-hidden="true" />
          <h1 className="text-lg font-bold text-text-primary dark:text-white">라이프</h1>
        </div>

        {/* 1. BriefingCard - PRD R1: 브리핑은 항상 있다 */}
        <BriefingCard
          headline={briefing.headline}
          subline={briefing.subline}
          onMore={openMoreSheet}
        />

        {/* 2. PriorityStack - PRD R5: 우선순위는 순서다 */}
        {priorityItems.length > 0 && (
          <PriorityStack
            items={priorityItems}
            count={3}
            onMore={openMoreSheet}
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
        onClose={closeMoreSheet}
        title="알프레도의 판단 근거"
        why={moreContent.why}
        whatChanged={moreContent.whatChanged}
        tradeOff={moreContent.tradeOff}
      />
    </div>
  );
}
