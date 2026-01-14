import { useState, useEffect } from 'react';
import { ConditionLevel, getTodayCondition } from '../../services/condition';
import { Heart, Sparkles, Cloud, Zap } from 'lucide-react';

interface WellbeingStatusProps {
  condition?: ConditionLevel | null;
}

export default function WellbeingStatus({ condition: propCondition }: WellbeingStatusProps) {
  var [condition, setCondition] = useState<ConditionLevel | null>(propCondition || null);

  useEffect(function() {
    if (!propCondition) {
      var todayCondition = getTodayCondition();
      if (todayCondition) {
        setCondition(todayCondition.level);
      }
    }
  }, [propCondition]);

  // 감정적 톤의 메시지
  function getEmotionalMessage(): { icon: string; message: string; subMessage: string } {
    switch (condition) {
      case 'great':
        return {
          icon: '✨',
          message: '오늘 정말 반짝반짝 빛나고 있어요!',
          subMessage: '이 에너지를 소중히 간직하며 하루를 보내세요'
        };
      case 'good':
        return {
          icon: '🌸',
          message: '평온하고 좋은 하루를 보내고 계시네요',
          subMessage: '작은 행복들을 놓치지 마세요'
        };
      case 'normal':
        return {
          icon: '🌱',
          message: '꾸준히 흘러가는 일상의 소중함',
          subMessage: '오늘도 당신답게, 천천히 나아가요'
        };
      case 'bad':
        return {
          icon: '🌧️',
          message: '힘든 날도 있는 법이에요',
          subMessage: '자신에게 친절하게, 충분한 휴식을 취하세요'
        };
      default:
        return {
          icon: '🐧',
          message: '오늘은 어떤 하루인가요?',
          subMessage: '알프레도가 곁에서 함께할게요'
        };
    }
  }

  var { icon, message, subMessage } = getEmotionalMessage();
  
  function getGradient(): string {
    switch (condition) {
      case 'great': return 'from-yellow-50 to-pink-50';
      case 'good': return 'from-green-50 to-blue-50';
      case 'normal': return 'from-blue-50 to-purple-50';
      case 'bad': return 'from-gray-50 to-blue-50';
      default: return 'from-purple-50 to-pink-50';
    }
  }

  return (
    <div className={`bg-gradient-to-r ${getGradient()} rounded-2xl p-6 relative overflow-hidden`}>
      <div className="absolute top-4 right-4 text-4xl opacity-20">
        {icon}
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={20} className="text-pink-500" />
          <span className="text-sm text-[#666666]">웰빙 상태</span>
        </div>
        
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          {message}
        </h2>
        
        <p className="text-sm text-[#666666]">
          {subMessage}
        </p>
        
        {/* 감정 아이콘들 */}
        <div className="flex gap-3 mt-4">
          <button className="p-2 bg-white/70 rounded-lg hover:bg-white transition-colors">
            <Sparkles size={16} className="text-yellow-500" />
          </button>
          <button className="p-2 bg-white/70 rounded-lg hover:bg-white transition-colors">
            <Zap size={16} className="text-orange-500" />
          </button>
          <button className="p-2 bg-white/70 rounded-lg hover:bg-white transition-colors">
            <Cloud size={16} className="text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
}