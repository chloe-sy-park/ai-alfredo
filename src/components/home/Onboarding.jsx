import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, Zap } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Data
import { mockBig3 } from '../../data/mockData';

// Common Components
import { AlfredoAvatar } from '../common';

// ============================================
// 🐧 온보딩 v2.0 (W1-6: 5단계 → 3단계 축소)
// ============================================

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0: 환영, 1: 컨디션+목표, 2: 완료
  const [data, setData] = useState({ mood: 'light', energy: 68, oneThing: '' });
  
  const moods = [
    { val: 'down', emoji: '😔', label: '힘들어요' },
    { val: 'okay', emoji: '😐', label: '그냥' },
    { val: 'light', emoji: '🙂', label: '괜찮아요' },
    { val: 'upbeat', emoji: '😊', label: '좋아요!' },
  ];
  
  const energyLevels = [
    { val: 25, emoji: '🔋', label: '낮음' },
    { val: 50, emoji: '☕', label: '보통' },
    { val: 75, emoji: '⚡', label: '좋음' },
    { val: 100, emoji: '💪', label: '충만!' },
  ];
  
  const stepLabels = ['시작', '오늘 준비', '완료'];
  
  const handleNext = () => step < 2 ? setStep(step + 1) : onComplete(data);
  
  const handleSkip = () => {
    // 기본값으로 온보딩 완료
    onComplete({ mood: 'light', energy: 68, oneThing: mockBig3[0]?.title || '' });
  };
  
  return (
    <div className="h-full flex flex-col bg-[#F0EBFF] overflow-hidden">
      {/* Progress - 3단계로 축소 */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">{stepLabels[step]}</span>
          {step === 1 && (
            <button 
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-[#A996FF]"
            >
              건너뛰기
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-[#A996FF]' : 'bg-[#E5E0FF]'
              }`} 
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* Step 0: 환영 화면 (간소화) */}
        {step === 0 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center pt-6">
            <div className="relative mb-6">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] rounded-full flex items-center justify-center shadow-2xl shadow-[#A996FF]/30">
                <span className="text-5xl">🐧</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-full shadow-md">
                <span className="text-sm font-bold text-[#A996FF]">알프레도</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              안녕하세요, Boss! 👋
            </h1>
            <p className="text-gray-500 mb-6">
              당신의 하루를 함께 관리해드릴<br/>
              <span className="text-[#A996FF] font-semibold">개인 집사</span>입니다.
            </p>
            
            {/* 핵심 기능 3개 (간단히) */}
            <div className="bg-white/80 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-base">📋</div>
                <p className="text-sm text-gray-700">컨디션에 맞게 할 일 정리</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-base">⏰</div>
                <p className="text-sm text-gray-700">중요한 것들 미리 알림</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-base">💜</div>
                <p className="text-sm text-gray-700">힘들 때도 옆에서 응원</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 1: 컨디션 + 목표 (통합) */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            {/* 알프레도 인사 */}
            <div className="flex items-start gap-3 mb-5">
              <AlfredoAvatar size="md" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-3 shadow-sm">
                <p className="text-sm text-gray-700">오늘 컨디션과 핵심 할 일만 알려주세요!</p>
              </div>
            </div>
            
            {/* 기분 선택 (한 줄) */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">기분</p>
              <div className="flex gap-2">
                {moods.map(m => (
                  <button 
                    key={m.val} 
                    onClick={() => setData({...data, mood: m.val})}
                    className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      data.mood === m.val 
                        ? 'bg-[#A996FF] text-white shadow-md scale-[1.02]' 
                        : 'bg-white/80 text-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 에너지 선택 (한 줄) */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 mb-2">에너지</p>
              <div className="flex gap-2">
                {energyLevels.map(e => (
                  <button 
                    key={e.val} 
                    onClick={() => setData({...data, energy: e.val})}
                    className={`flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      data.energy === e.val 
                        ? 'bg-[#A996FF] text-white shadow-md scale-[1.02]' 
                        : 'bg-white/80 text-gray-600'
                    }`}
                  >
                    <span className="text-xl">{e.emoji}</span>
                    <span className="text-[10px] font-medium">{e.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* 구분선 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#E5E0FF]" />
              <span className="text-xs text-gray-400">오늘의 핵심</span>
              <div className="flex-1 h-px bg-[#E5E0FF]" />
            </div>
            
            {/* 핵심 할 일 선택 */}
            <div className="space-y-2 mb-3">
              {mockBig3.slice(0, 3).map(task => (
                <button 
                  key={task.id}
                  onClick={() => setData({...data, oneThing: task.title})}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                    data.oneThing === task.title 
                      ? 'bg-[#A996FF] text-white shadow-md' 
                      : 'bg-white/80 text-gray-700 hover:bg-white'
                  }`}
                >
                  {data.oneThing === task.title 
                    ? <CheckCircle2 size={18} /> 
                    : <Circle size={18} className="opacity-40" />
                  }
                  <span className="text-sm font-medium">{task.title}</span>
                </button>
              ))}
            </div>
            
            {/* 직접 입력 */}
            <input 
              value={data.oneThing} 
              onChange={e => setData({...data, oneThing: e.target.value})}
              placeholder="또는 직접 입력..."
              className="w-full p-3 bg-white/80 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
            />
          </div>
        )}
        
        {/* Step 2: 완료 (간소화) */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 text-center pt-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] rounded-full flex items-center justify-center shadow-xl mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">준비 완료!</h1>
            <p className="text-gray-500 text-sm mb-6">오늘 하루를 함께 해드릴게요.</p>
            
            {/* 요약 카드 */}
            <div className="bg-white/90 border border-[#E8E3FF] rounded-xl p-4 shadow-sm text-left">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F3FF] rounded-full">
                  <span className="text-lg">{moods.find(m => m.val === data.mood)?.emoji}</span>
                  <span className="text-xs font-medium text-gray-600">{moods.find(m => m.val === data.mood)?.label}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F3FF] rounded-full">
                  <Zap size={14} className="text-[#A996FF]" />
                  <span className="text-xs font-medium text-gray-600">{data.energy}%</span>
                </div>
              </div>
              {data.oneThing && (
                <div className="flex items-center gap-2 p-3 bg-[#F5F3FF] rounded-xl">
                  <Sparkles size={16} className="text-[#A996FF]" />
                  <span className="text-sm font-medium text-gray-700">{data.oneThing}</span>
                </div>
              )}
            </div>
            
            {/* 알프레도 메시지 */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#8B7CF7]">
              <span>🐧</span>
              <span>컨디션에 맞게 정리해드릴게요!</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Button - 3단계용 */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-t from-[#F8F7FC] to-transparent">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 0 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="w-12 h-12 rounded-xl bg-white border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button 
            onClick={handleNext} 
            disabled={step === 1 && !data.oneThing}
            className={`flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              (step === 1 && !data.oneThing) 
                ? 'bg-[#E5E0FF] text-gray-400' 
                : 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8]'
            }`}
          >
            {step === 0 ? '시작하기 🚀' : step === 2 ? '하루 시작하기' : '다음'} 
            {step === 1 && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};


export default Onboarding;
