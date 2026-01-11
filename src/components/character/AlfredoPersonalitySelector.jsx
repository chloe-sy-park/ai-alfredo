import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { usePersonalityStore, PERSONALITY_CONFIGS } from '../../stores/personalityStore';

/**
 * 🎭 Personality Selector - CARROT 스타일
 * 알프레도 성격 선택: 따뜻한 집사 / 직설 코치 / 장난꾸러기
 */

const AlfredoPersonalitySelector = ({ onSelect }) => {
  const { currentMode, setPersonalityMode } = usePersonalityStore();
  const personalities = Object.values(PERSONALITY_CONFIGS);

  const handleSelect = (mode) => {
    setPersonalityMode(mode);
    onSelect?.(mode);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-800">알프레도 성격</h3>
      </div>

      {personalities.map((p) => (
        <button
          key={p.mode}
          onClick={() => handleSelect(p.mode)}
          className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
            currentMode === p.mode
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
          }`}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{p.emoji}</span>
            <span className="font-semibold text-gray-800">{p.name}</span>
            {currentMode === p.mode && (
              <Check className="w-5 h-5 text-purple-500 ml-auto" />
            )}
          </div>

          {/* 설명 */}
          <p className="text-sm text-gray-500 mb-3">{p.description}</p>

          {/* 샘플 문구 */}
          <div className="flex flex-wrap gap-1">
            {p.samplePhrases.slice(0, 2).map((phrase, i) => (
              <span 
                key={i} 
                className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
              >
                "{phrase.length > 25 ? phrase.slice(0, 25) + '...' : phrase}"
              </span>
            ))}
          </div>

          {/* 특성 태그 */}
          <div className="flex gap-2 mt-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              p.traits.encouragement === 'gentle' ? 'bg-pink-100 text-pink-600' :
              p.traits.encouragement === 'moderate' ? 'bg-blue-100 text-blue-600' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {p.traits.encouragement === 'gentle' ? '부드러움' :
               p.traits.encouragement === 'moderate' ? '균형잡힘' : '에너지넘침'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              p.traits.honesty === 'soft' ? 'bg-purple-100 text-purple-600' :
              p.traits.honesty === 'balanced' ? 'bg-green-100 text-green-600' :
              'bg-orange-100 text-orange-600'
            }`}>
              {p.traits.honesty === 'soft' ? '수용적' :
               p.traits.honesty === 'balanced' ? '소신함' : '직설함'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              p.traits.humor === 'minimal' ? 'bg-gray-100 text-gray-600' :
              p.traits.humor === 'moderate' ? 'bg-cyan-100 text-cyan-600' :
              'bg-rose-100 text-rose-600'
            }`}>
              {p.traits.humor === 'minimal' ? '진지함' :
               p.traits.humor === 'moderate' ? '위트있음' : '장난스러움'}
            </span>
          </div>
        </button>
      ))}

      <p className="text-xs text-center text-gray-400 mt-4">
        언제든 설정에서 바꿀 수 있어요
      </p>
    </div>
  );
};

export default AlfredoPersonalitySelector;
