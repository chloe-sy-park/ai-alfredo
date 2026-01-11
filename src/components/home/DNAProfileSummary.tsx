import { useDNAStore } from '@/stores/dnaStore';
import { Sun, Moon, Zap, Users, User, Heart, Brain, Calendar } from 'lucide-react';

/**
 * DNA 프로필 요약 카드
 * 사용자가 알프레도가 배운 것을 한눈에 볼 수 있음
 */
export default function DNAProfileSummary() {
  const { profile, analysisPhase } = useDNAStore();

  if (!profile) {
    return (
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-gray-400 text-sm text-center">
          캘린더를 연동하면 당신을 더 잘 이해할 수 있어요!
        </p>
      </div>
    );
  }

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 분석 단계에 따라 표시 항목 다르게
  const getInsightItems = () => {
    const items = [];

    // Day 1: 기본 정보
    items.push({
      icon: profile.chronotype.type === 'morning' ? <Sun size={16} /> : <Moon size={16} />,
      label: '타입',
      value: profile.chronotype.type === 'morning' ? '아침형' : 
             profile.chronotype.type === 'evening' ? '저녁형' : '중간형',
      confidence: profile.chronotype.confidence
    });

    items.push({
      icon: <Calendar size={16} />,
      label: '바쁜 날',
      value: `${dayNames[profile.weekdayPatterns.busiestDay]}요일`,
      confidence: profile.weekdayPatterns.confidence
    });

    // Week 1+: 업무 스타일
    if (analysisPhase !== 'day1') {
      items.push({
        icon: profile.workStyle.type === 'collaborative' ? <Users size={16} /> : <User size={16} />,
        label: '스타일',
        value: profile.workStyle.type === 'collaborative' ? '협업형' : 
               profile.workStyle.type === 'independent' ? '독립형' : '균형',
        confidence: profile.workStyle.confidence
      });
    }

    // Week 2+: 에너지 패턴
    if (analysisPhase === 'week2') {
      const peakHoursText = profile.energyPattern.peakHours.slice(0, 2).map(h => `${h}시`).join(', ');
      items.push({
        icon: <Zap size={16} />,
        label: '피크 시간',
        value: peakHoursText,
        confidence: profile.energyPattern.confidence
      });

      items.push({
        icon: <Heart size={16} />,
        label: '워라밸',
        value: profile.workLifeBalance.status === 'good' ? '좋음' : 
               profile.workLifeBalance.status === 'moderate' ? '보통' : '주의',
        confidence: profile.workLifeBalance.confidence
      });

      if (profile.focusTime.bestSlots.length > 0) {
        const bestSlot = profile.focusTime.bestSlots[0];
        items.push({
          icon: <Brain size={16} />,
          label: '집중 시간',
          value: `${dayNames[bestSlot.dayOfWeek]} ${bestSlot.startHour}-${bestSlot.endHour}시`,
          confidence: profile.focusTime.confidence
        });
      }
    }

    return items;
  };

  const items = getInsightItems();
  const confidenceStars = (level: number) => '⭐'.repeat(level);

  return (
    <div className="p-4 rounded-xl bg-lavender-50 border border-lavender-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-lavender-700">🧬 알프레도가 배운 것</h3>
        <span className="text-xs text-lavender-500">
          {profile.analyzedEventsCount}개 일정 분석
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="text-lavender-500">{item.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-sm font-medium text-gray-800">
                {item.value}
                <span className="ml-1 text-xs opacity-50">
                  {confidenceStars(item.confidence)}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 교정 안내 */}
      <div className="mt-3 pt-3 border-t border-lavender-200">
        <p className="text-xs text-lavender-600 text-center">
          틀리면 알려주세요! 학습할게요 😊
        </p>
      </div>
    </div>
  );
}
