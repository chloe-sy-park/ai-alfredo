/**
 * PenguinPersonalitySliders.tsx
 * PRD 펭귄 육성 시스템 - 4축 슬라이더 컴포넌트
 *
 * 말투: 🌸 다정하게 ↔ 🔥 직설적으로
 * 알림빈도: 🤫 필요할 때만 ↔ 💬 자주자주
 * 데이터깊이: 😌 핵심만 ↔ 🔬 다 보여줘
 * 동기부여방식: 🌊 느긋하게 ↔ 🏆 도전적으로
 */

import { useState, useEffect } from 'react';
import { useUserPreferencesStore, PenguinPersonality } from '../../stores/userPreferencesStore';

interface SliderConfig {
  key: keyof PenguinPersonality;
  label: string;
  leftEmoji: string;
  leftLabel: string;
  rightEmoji: string;
  rightLabel: string;
  description: (value: number) => string;
}

const sliderConfigs: SliderConfig[] = [
  {
    key: 'toneStyle',
    label: '말투',
    leftEmoji: '🌸',
    leftLabel: '다정하게',
    rightEmoji: '🔥',
    rightLabel: '직설적으로',
    description: (value: number) => {
      if (value <= 25) return '따뜻하고 부드러운 표현으로 이야기해요';
      if (value <= 50) return '친절하면서도 명확하게 전달해요';
      if (value <= 75) return '핵심을 정확하게 짚어줘요';
      return '솔직하고 직접적으로 말해요';
    }
  },
  {
    key: 'notificationFrequency',
    label: '알림빈도',
    leftEmoji: '🤫',
    leftLabel: '필요할 때만',
    rightEmoji: '💬',
    rightLabel: '자주자주',
    description: (value: number) => {
      if (value <= 25) return '정말 중요한 것만 알려드려요';
      if (value <= 50) return '적당한 간격으로 체크인해요';
      if (value <= 75) return '주요 순간마다 챙겨드려요';
      return '자주 연락하며 함께해요';
    }
  },
  {
    key: 'dataDepth',
    label: '데이터깊이',
    leftEmoji: '😌',
    leftLabel: '핵심만',
    rightEmoji: '🔬',
    rightLabel: '다 보여줘',
    description: (value: number) => {
      if (value <= 25) return '꼭 필요한 핵심 정보만 보여요';
      if (value <= 50) return '중요한 인사이트를 간결하게 정리해요';
      if (value <= 75) return '상세한 분석과 트렌드를 함께 보여요';
      return '모든 데이터와 세부 통계를 제공해요';
    }
  },
  {
    key: 'motivationStyle',
    label: '동기부여 방식',
    leftEmoji: '🌊',
    leftLabel: '느긋하게',
    rightEmoji: '🏆',
    rightLabel: '도전적으로',
    description: (value: number) => {
      if (value <= 25) return '여유롭게 페이스 조절을 도와요';
      if (value <= 50) return '균형잡힌 목표 설정을 권해요';
      if (value <= 75) return '성장을 위한 도전을 격려해요';
      return '높은 목표를 향해 푸시해요';
    }
  }
];

interface PersonalitySliderProps {
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
}

function PersonalitySlider({ config, value, onChange }: PersonalitySliderProps) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{config.label}</span>
        <span className="text-xs text-[#A996FF] font-medium">{value}%</span>
      </div>

      {/* 슬라이더 */}
      <div className="relative mb-2">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #A996FF 0%, #A996FF ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`
          }}
        />
      </div>

      {/* 라벨 */}
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <span>{config.leftEmoji}</span>
          <span>{config.leftLabel}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>{config.rightLabel}</span>
          <span>{config.rightEmoji}</span>
        </span>
      </div>

      {/* 설명 */}
      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
        {config.description(value)}
      </p>
    </div>
  );
}

export default function PenguinPersonalitySliders() {
  const { penguinPersonality, updatePenguinPersonality } = useUserPreferencesStore();
  const [localValues, setLocalValues] = useState<PenguinPersonality>(penguinPersonality);
  const [hasChanges, setHasChanges] = useState(false);

  // 스토어 값이 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setLocalValues(penguinPersonality);
  }, [penguinPersonality]);

  // 변경사항 추적
  useEffect(() => {
    const changed = Object.keys(localValues).some(
      (key) => localValues[key as keyof PenguinPersonality] !== penguinPersonality[key as keyof PenguinPersonality]
    );
    setHasChanges(changed);
  }, [localValues, penguinPersonality]);

  const handleSliderChange = (key: keyof PenguinPersonality, value: number) => {
    setLocalValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updatePenguinPersonality(localValues);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultValues: PenguinPersonality = {
      toneStyle: 30,
      notificationFrequency: 50,
      dataDepth: 30,
      motivationStyle: 50
    };
    setLocalValues(defaultValues);
  };

  // 전체 성격 요약
  const getPersonalitySummary = () => {
    const { toneStyle, notificationFrequency, dataDepth, motivationStyle } = localValues;

    const traits: string[] = [];

    if (toneStyle <= 40) traits.push('다정한');
    else if (toneStyle >= 60) traits.push('직설적인');

    if (notificationFrequency <= 40) traits.push('조용한');
    else if (notificationFrequency >= 60) traits.push('적극적인');

    if (dataDepth <= 40) traits.push('간결한');
    else if (dataDepth >= 60) traits.push('분석적인');

    if (motivationStyle <= 40) traits.push('여유로운');
    else if (motivationStyle >= 60) traits.push('도전적인');

    if (traits.length === 0) {
      return '균형잡힌 알프레도';
    }

    return traits.join(', ') + ' 알프레도';
  };

  return (
    <div className="space-y-4">
      {/* 펭귄 프리뷰 */}
      <div className="bg-gradient-to-br from-[#A996FF]/10 to-[#A996FF]/5 rounded-xl p-4 text-center">
        <div className="text-4xl mb-2">🐧</div>
        <p className="text-sm font-medium text-gray-900">{getPersonalitySummary()}</p>
        <p className="text-xs text-gray-500 mt-1">슬라이더를 조절해서 알프레도의 성격을 설정하세요</p>
      </div>

      {/* 슬라이더들 */}
      <div className="bg-white rounded-xl p-4">
        {sliderConfigs.map((config) => (
          <PersonalitySlider
            key={config.key}
            config={config}
            value={localValues[config.key]}
            onChange={(value) => handleSliderChange(config.key, value)}
          />
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 py-2.5 px-4 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          기본값으로
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors ${
            hasChanges
              ? 'bg-[#A996FF] text-white hover:bg-[#9080E6]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {hasChanges ? '저장하기' : '변경사항 없음'}
        </button>
      </div>

      {/* 슬라이더 스타일 */}
      <style>
        {`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #A996FF;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(169, 150, 255, 0.4);
          }

          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #A996FF;
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(169, 150, 255, 0.4);
          }
        `}
      </style>
    </div>
  );
}
