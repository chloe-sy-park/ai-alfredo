import { WeatherData } from '../../services/weather';
import { ConditionLevel } from '../../services/condition';

interface QuickStatusProps {
  weather?: WeatherData | null;
  condition?: ConditionLevel | null;
  onConditionClick?: () => void;
}

export default function QuickStatus({ weather, condition, onConditionClick }: QuickStatusProps) {
  // 컨디션 이모지
  function getConditionEmoji(): string {
    switch (condition) {
      case 'great': return '😊';
      case 'good': return '🙂';
      case 'normal': return '😐';
      case 'bad': return '😴';
      default: return '🙂';
    }
  }

  function getConditionLabel(): string {
    switch (condition) {
      case 'great': return '최고';
      case 'good': return '좋음';
      case 'normal': return '보통';
      case 'bad': return '힘듦';
      default: return '체크';
    }
  }

  return (
    <div className="flex gap-2">
      {/* 날씨 */}
      {weather && (
        <div className="flex-1 bg-white rounded-xl px-3 py-2 flex items-center gap-2 border border-[#E5E5E5]">
          <span className="text-lg">{weather.icon}</span>
          <div className="min-w-0">
            <p className="text-xs text-[#999999]">날씨</p>
            <p className="text-sm font-medium text-[#1A1A1A] truncate">
              {weather.temp}° {weather.description}
            </p>
          </div>
        </div>
      )}
      
      {/* 컨디션 */}
      <button
        onClick={onConditionClick}
        className="flex-1 bg-white rounded-xl px-3 py-2 flex items-center gap-2 border border-[#E5E5E5] hover:border-[#A996FF] transition-colors text-left"
      >
        <span className="text-lg">{getConditionEmoji()}</span>
        <div className="min-w-0">
          <p className="text-xs text-[#999999]">컨디션</p>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {getConditionLabel()}
          </p>
        </div>
      </button>
    </div>
  );
}
