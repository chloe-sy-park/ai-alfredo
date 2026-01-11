import React, { useState } from 'react';
import { Wand2, ChevronDown, ChevronUp, Plus, Sparkles, Clock, Zap } from 'lucide-react';
import { usePersonalityStore } from '../../stores/personalityStore';
import { useBehaviorStore } from '../../stores/behaviorStore';

/**
 * 🪄 Magic ToDo - Goblin Tools 스타일
 * 막연한 작업을 작은 단계로 자동 분해
 * "방 청소" → 구체적 단계들로 변환
 */

// AI 작업 분해 로직 (실제로는 Claude API 연동)
const breakdownTask = (taskTitle) => {
  const breakdowns = {
    // 청소 관련
    '방 청소': [
      { title: '바닥에 있는 물건 치우기', minutes: 5 },
      { title: '책상 위 정리하기', minutes: 5 },
      { title: '침대 정리하기', minutes: 3 },
      { title: '청소기 돌리기', minutes: 10 },
      { title: '쓰레기통 비우기', minutes: 2 },
    ],
    '청소': [
      { title: '정리할 공간 선택하기', minutes: 2 },
      { title: '물건 제자리에 두기', minutes: 10 },
      { title: '표면 닦기', minutes: 5 },
      { title: '바닥 청소하기', minutes: 10 },
    ],
    // 업무 관련
    '보고서 작성': [
      { title: '주제와 목적 정리하기', minutes: 5 },
      { title: '필요한 자료 모으기', minutes: 15 },
      { title: '개요 작성하기', minutes: 10 },
      { title: '본문 작성하기', minutes: 30 },
      { title: '검토 및 수정하기', minutes: 10 },
    ],
    '이메일 쓰기': [
      { title: '받는 사람 확인하기', minutes: 1 },
      { title: '핵심 내용 정리하기', minutes: 3 },
      { title: '본문 작성하기', minutes: 5 },
      { title: '맞춤법 확인하기', minutes: 2 },
    ],
    '미팅 준비': [
      { title: '미팅 목적 확인하기', minutes: 2 },
      { title: '필요한 자료 준비하기', minutes: 10 },
      { title: '논의할 포인트 정리하기', minutes: 5 },
      { title: '질문 리스트 만들기', minutes: 5 },
    ],
    // 생활 관련
    '운동하기': [
      { title: '운동복 갈아입기', minutes: 5 },
      { title: '스트레칭하기', minutes: 5 },
      { title: '메인 운동하기', minutes: 20 },
      { title: '쿨다운하기', minutes: 5 },
    ],
    '요리하기': [
      { title: '레시피 확인하기', minutes: 2 },
      { title: '재료 준비하기', minutes: 10 },
      { title: '조리하기', minutes: 20 },
      { title: '플레이팅하기', minutes: 3 },
      { title: '설거지하기', minutes: 10 },
    ],
    '공부하기': [
      { title: '오늘 공부할 범위 정하기', minutes: 3 },
      { title: '필요한 자료 펴놓기', minutes: 2 },
      { title: '25분 집중 공부 (1회차)', minutes: 25 },
      { title: '5분 휴식', minutes: 5 },
      { title: '25분 집중 공부 (2회차)', minutes: 25 },
    ],
  };

  // 정확히 일치하는 것 찾기
  if (breakdowns[taskTitle]) {
    return breakdowns[taskTitle];
  }

  // 포함된 키워드로 찾기
  for (const [key, value] of Object.entries(breakdowns)) {
    if (taskTitle.includes(key) || key.includes(taskTitle)) {
      return value;
    }
  }

  // 기본 분해 (일반적인 작업)
  return [
    { title: `${taskTitle} 시작 준비하기`, minutes: 5 },
    { title: `${taskTitle} 진행하기`, minutes: 20 },
    { title: `${taskTitle} 마무리하기`, minutes: 5 },
  ];
};

const MagicToDo = ({ onAddTasks, onClose }) => {
  const [inputTask, setInputTask] = useState('');
  const [breakdown, setBreakdown] = useState([]);
  const [isBreaking, setIsBreaking] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [showTips, setShowTips] = useState(false);
  
  const { getResponse } = usePersonalityStore();
  const { predictDuration } = useBehaviorStore();

  const handleBreakdown = () => {
    if (!inputTask.trim()) return;
    
    setIsBreaking(true);
    
    // 애니메이션 효과를 위한 딜레이
    setTimeout(() => {
      const steps = breakdownTask(inputTask.trim());
      setBreakdown(steps);
      setSelectedSteps(steps.map((_, i) => i)); // 기본 전체 선택
      setIsBreaking(false);
    }, 800);
  };

  const toggleStep = (index) => {
    setSelectedSteps(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleAddSelected = () => {
    const tasksToAdd = selectedSteps.map(i => ({
      title: breakdown[i].title,
      estimatedMinutes: breakdown[i].minutes,
      parentTask: inputTask,
    }));
    
    onAddTasks?.(tasksToAdd);
    onClose?.();
  };

  const totalMinutes = selectedSteps.reduce((sum, i) => sum + breakdown[i].minutes, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-auto">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 text-white">
        <div className="flex items-center gap-2">
          <Wand2 className="w-6 h-6" />
          <h2 className="text-lg font-bold">Magic ToDo</h2>
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
        <p className="text-sm text-purple-100 mt-1">
          막연한 일을 작은 단계로 나눠드려요 ✨
        </p>
      </div>

      {/* 입력 영역 */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            value={inputTask}
            onChange={(e) => setInputTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBreakdown()}
            placeholder="예: 방 청소, 보고서 작성, 운동하기..."
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-purple-300 focus:outline-none transition-all"
          />
          <button
            onClick={handleBreakdown}
            disabled={!inputTask.trim() || isBreaking}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors flex items-center gap-1"
          >
            {isBreaking ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                분석중...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                분해
              </>
            )}
          </button>
        </div>

        {/* 팁 토글 */}
        <button
          onClick={() => setShowTips(!showTips)}
          className="flex items-center gap-1 text-sm text-gray-500 mt-2 hover:text-purple-500"
        >
          {showTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          ADHD 팁 보기
        </button>

        {showTips && (
          <div className="mt-2 p-3 bg-purple-50 rounded-lg text-sm text-purple-700">
            <p className="font-medium mb-1">💡 시작이 어려울 때:</p>
            <ul className="list-disc list-inside space-y-1 text-purple-600">
              <li>가장 쉬운 단계부터 시작하세요</li>
              <li>타이머를 5분만 맞춰보세요</li>
              <li>"완벽하게"가 아닌 "조금이라도" 목표로</li>
            </ul>
          </div>
        )}
      </div>

      {/* 분해 결과 */}
      {breakdown.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              "{inputTask}" 분해 결과
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              총 {totalMinutes}분
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {breakdown.map((step, index) => (
              <button
                key={index}
                onClick={() => toggleStep(index)}
                className={`w-full p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 ${
                  selectedSteps.includes(index)
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedSteps.includes(index)
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {selectedSteps.includes(index) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <div className="flex-1">
                  <span className={`text-sm ${
                    selectedSteps.includes(index) ? 'text-purple-700' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {step.minutes}분
                </span>
              </button>
            ))}
          </div>

          {/* 하단 버튼 */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedSteps.length === 0}
              className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {selectedSteps.length}개 추가
            </button>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {breakdown.length === 0 && !isBreaking && (
        <div className="px-4 pb-6 text-center">
          <div className="text-4xl mb-2">🐧</div>
          <p className="text-sm text-gray-500">
            {getResponse({ situation: 'encourage' })}
          </p>
        </div>
      )}
    </div>
  );
};

export default MagicToDo;
