import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useBehaviorStore } from '../../stores/behaviorStore';
import { usePersonalityStore } from '../../stores/personalityStore';

/**
 * 🎯 Two-Tap Mood Logger - Daylio 스타일
 * 5초 안에 기분 기록 (ADHD 친화적)
 * 탭 한 번: 기분, 탭 두 번: 컨텍스트
 */

const MOODS = [
  { id: 'great', emoji: '🤩', label: '최고', color: 'bg-green-400', value: 5 },
  { id: 'good', emoji: '😊', label: '좋음', color: 'bg-emerald-400', value: 4 },
  { id: 'okay', emoji: '😐', label: '보통', color: 'bg-yellow-400', value: 3 },
  { id: 'low', emoji: '😔', label: '저조', color: 'bg-orange-400', value: 2 },
  { id: 'bad', emoji: '😫', label: '힘듦', color: 'bg-red-400', value: 1 },
];

const ENERGY_LEVELS = [
  { id: 'high', emoji: '⚡', label: '에너지 넘침', color: 'bg-yellow-400', value: 5 },
  { id: 'good', emoji: '🔋', label: '충분함', color: 'bg-green-400', value: 4 },
  { id: 'medium', emoji: '🔌', label: '보통', color: 'bg-blue-400', value: 3 },
  { id: 'low', emoji: '🪫', label: '낮음', color: 'bg-orange-400', value: 2 },
  { id: 'empty', emoji: '😴', label: '방전', color: 'bg-gray-400', value: 1 },
];

const CONTEXTS = [
  { id: 'work', emoji: '💼', label: '일' },
  { id: 'exercise', emoji: '🏃', label: '운동' },
  { id: 'social', emoji: '👥', label: '사람들' },
  { id: 'rest', emoji: '🛋️', label: '휴식' },
  { id: 'hobby', emoji: '🎮', label: '취미' },
  { id: 'study', emoji: '📚', label: '공부' },
  { id: 'food', emoji: '🍽️', label: '식사' },
  { id: 'sleep', emoji: '😴', label: '수면' },
];

const TwoTapMood = ({ onComplete, mode = 'mood' }) => {
  const [step, setStep] = useState(1); // 1: mood/energy, 2: context
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  const [selectedContexts, setSelectedContexts] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { getResponse, setEmotion } = usePersonalityStore();
  
  const items = mode === 'energy' ? ENERGY_LEVELS : MOODS;
  const selected = mode === 'energy' ? selectedEnergy : selectedMood;
  const setSelected = mode === 'energy' ? setSelectedEnergy : setSelectedMood;

  const handleItemSelect = (item) => {
    setSelected(item);
    
    // 감정 상태 업데이트
    if (mode === 'mood') {
      const emotionMap = {
        'great': 'excited',
        'good': 'happy',
        'okay': 'neutral',
        'low': 'worried',
        'bad': 'sad',
      };
      setEmotion(emotionMap[item.id] || 'neutral', 'mood-log');
    }
    
    // 자동으로 다음 단계로
    setTimeout(() => setStep(2), 300);
  };

  const toggleContext = (context) => {
    setSelectedContexts(prev =>
      prev.includes(context.id)
        ? prev.filter(c => c !== context.id)
        : [...prev, context.id]
    );
  };

  const handleComplete = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      mood: selectedMood,
      energy: selectedEnergy,
      contexts: selectedContexts,
    };
    
    setShowSuccess(true);
    
    setTimeout(() => {
      onComplete?.(logData);
    }, 1000);
  };

  const handleSkipContext = () => {
    handleComplete();
  };

  // 성공 화면
  if (showSuccess) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="text-5xl mb-3 animate-bounce">✨</div>
        <p className="text-lg font-medium text-gray-800">기록 완료!</p>
        <p className="text-sm text-gray-500 mt-1">
          {getResponse({ situation: 'taskComplete' })}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 진행 표시 */}
      <div className="flex gap-2 mb-4">
        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-gray-200'}`} />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-gray-200'}`} />
      </div>

      {/* Step 1: Mood/Energy 선택 */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-center text-sm font-medium text-gray-600 mb-4">
            {mode === 'energy' ? '지금 에너지는?' : '지금 기분은?'}
          </h3>
          
          <div className="flex justify-center gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemSelect(item)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all transform ${
                  selected?.id === item.id
                    ? `${item.color} scale-110 shadow-lg`
                    : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
                }`}
              >
                <span className="text-3xl mb-1">{item.emoji}</span>
                <span className={`text-xs ${
                  selected?.id === item.id ? 'text-white font-medium' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Context 선택 */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h3 className="text-center text-sm font-medium text-gray-600 mb-2">
            지금 뭐 하고 있어요? (선택)
          </h3>
          <p className="text-center text-xs text-gray-400 mb-4">
            여러 개 선택할 수 있어요
          </p>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {CONTEXTS.map((context) => (
              <button
                key={context.id}
                onClick={() => toggleContext(context)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  selectedContexts.includes(context.id)
                    ? 'bg-purple-100 border-2 border-purple-400'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <span className="text-xl mb-0.5">{context.emoji}</span>
                <span className="text-xs text-gray-600">{context.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSkipContext}
              className="flex-1 py-2.5 text-gray-500 hover:text-gray-700"
            >
              건너뛰기
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 py-2.5 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 flex items-center justify-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              완료
            </button>
          </div>
        </div>
      )}

      {/* 되돌아가기 */}
      {step === 2 && (
        <button
          onClick={() => setStep(1)}
          className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600"
        >
          ← 다시 선택
        </button>
      )}
    </div>
  );
};

export default TwoTapMood;
