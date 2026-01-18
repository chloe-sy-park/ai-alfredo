import { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout';
import { Heart, Plus } from 'lucide-react';
import { ConditionLevel, getTodayCondition } from '../services/condition';
import { getTop3, Top3Item } from '../services/top3';
import { getRelationships, Relationship } from '../services/relationships';

// Life OS 관리용 컴포넌트
import RelationshipReminder from '../components/home/RelationshipReminder';
import LifeFactors from '../components/home/LifeFactors';
import { LifeTrends } from '../components/life';
import Card from '../components/common/Card';

export default function Life() {
  const [condition, setCondition] = useState<ConditionLevel | null>(null);
  const [lifePriorities, setLifePriorities] = useState<Top3Item[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 컨디션 로드
    const todayCondition = getTodayCondition();
    if (todayCondition) {
      setCondition(todayCondition.level);
    }

    // Life 우선순위 (개인 항목만 필터)
    const allItems = getTop3();
    const lifeItems = allItems.filter((item) => item.isPersonal === true);
    setLifePriorities(lifeItems);

    // 관계 데이터 로드
    const relationshipData = getRelationships();
    setRelationships(relationshipData);
  };

  // RelationshipReminder용 데이터 변환
  const relationshipItems = relationships.map((rel) => ({
    id: rel.id,
    name: rel.name,
    reason: rel.lastContactDate
      ? '마지막 연락: ' + new Date(rel.lastContactDate).toLocaleDateString('ko-KR')
      : '연락해보세요'
  }));

  // LifeFactors 데이터
  const lifeFactorItems = [
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

  return (
    <div className="min-h-screen typo-os-life" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <PageHeader />

      <div className="max-w-[640px] mx-auto px-4 py-4 space-y-4">
        {/* 페이지 타이틀 */}
        <div className="flex items-center gap-2" role="heading" aria-level={1}>
          <Heart size={20} style={{ color: 'var(--os-life)' }} aria-hidden="true" />
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Life OS</h1>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            backgroundColor: 'var(--os-life)',
            color: 'white',
            opacity: 0.8
          }}>
            관리
          </span>
        </div>

        {/* 1. LifeFactors - 요인별 현황 */}
        <LifeFactors items={lifeFactorItems} />

        {/* 2. RelationshipReminder - 관계 관리 */}
        {relationshipItems.length > 0 ? (
          <RelationshipReminder items={relationshipItems} />
        ) : (
          <Card>
            <div className="text-center py-6">
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              >
                <Plus size={20} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                소중한 사람을 등록해보세요
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                알프레도가 연락 타이밍을 알려드려요
              </p>
            </div>
          </Card>
        )}

        {/* 3. LifeTrends - 트렌드 분석 */}
        <LifeTrends />
      </div>
    </div>
  );
}
