import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles, Cloud, Calendar, Clock, MapPin } from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

// Data
import { mockWeather, mockEvents, mockBig3 } from '../../data/mockData';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0부터 시작 (환영 화면)
  const [data, setData] = useState({ mood: 'okay', energy: 50, oneThing: '', memo: '' });
  
  const moods = [
    { val: 'down', emoji: '😔', label: '힘들어요' },
    { val: 'okay', emoji: '😐', label: '그냥 그래요' },
    { val: 'light', emoji: '🙂', label: '괜찮아요' },
    { val: 'upbeat', emoji: '😊', label: '좋아요!' },
  ];
  
  const stepLabels = ['시작', '일정', '컨디션', '목표', '완료'];
  
  const handleNext = () => step < 4 ? setStep(step + 1) : onComplete(data);
  
  const handleSkip = () => {
    // 기본값으로 온보딩 완료
    onComplete({ mood: 'light', energy: 68, oneThing: mockBig3[0]?.title || '', memo: '' });
  };
  
  return (
    <div className="h-full flex flex-col bg-[#F0EBFF] overflow-hidden">
      {/* Progress */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">{stepLabels[step]}</span>
          {step > 0 && step < 4 && (
            <button 
              onClick={handleSkip}
              className="text-xs text-gray-400 hover:text-[#A996FF]"
            >
              건너뛰기
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {[0,1,2,3,4].map(i => (
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
        {/* Step 0: 환영 화면 */}
        {step === 0 && (
          <div className="animate-in fade-in zoom-in-95 duration-500 text-center pt-8">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] rounded-full flex items-center justify-center shadow-2xl shadow-[#A996FF]/30">
                <span className="text-6xl">🐧</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white rounded-full shadow-md">
                <span className="text-sm font-bold text-[#A996FF]">알프레도</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              안녕하세요, Boss! 👋
            </h1>
            <p className="text-gray-500 mb-2">
              저는 알프레도예요.
            </p>
            <p className="text-gray-500 mb-8">
              당신의 하루를 함께 관리해드릴<br/>
              <span className="text-[#A996FF] font-semibold">개인 집사</span>입니다.
            </p>
            
            <div className="bg-white/80 rounded-xl p-5 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">📋</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">스마트한 우선순위</p>
                  <p className="text-xs text-gray-500">AI가 컨디션에 맞게 할 일을 정리해드려요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">⏰</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">타이밍 케어</p>
                  <p className="text-xs text-gray-500">미팅, 약, 중요한 것들 미리 알려드려요</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-lg">💬</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">대화로 관리</p>
                  <p className="text-xs text-gray-500">"오늘 뭐 해야 돼?"라고 물어보세요</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 1: 일정 미리보기 */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 mb-6">
              <AlfredoAvatar size="lg" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-4 shadow-sm">
                <p className="font-medium text-gray-800">좋은 아침이에요, Boss! ☀️</p>
                <p className="text-sm text-gray-500 mt-1">오늘 하루를 함께 준비해볼까요?</p>
              </div>
            </div>
            
            {/* Weather */}
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-4 shadow-sm mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Cloud className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{mockWeather.temp}°</p>
                    <p className="text-sm text-gray-500">{mockWeather.description}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>최고 {mockWeather.high}° / 최저 {mockWeather.low}°</p>
                  <p className="text-gray-600 font-medium mt-1">🌧️ 비 올 확률 {mockWeather.rainChance}%</p>
                </div>
              </div>
              <div className="mt-3 p-2.5 bg-gray-100 rounded-xl flex items-center gap-2">
                <span>☂️</span>
                <span className="text-sm text-gray-700">우산 챙기는 거 잊지 마세요!</span>
              </div>
            </div>
            
            {/* Schedule */}
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={18} className="text-[#A996FF]" />
                오늘의 일정
              </h3>
              <div className="space-y-2">
                {mockEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-1 h-10 rounded-full ${event.color}`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{event.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} /><span>{event.start} - {event.end}</span>
                        {event.location && <><MapPin size={12} /><span>{event.location}</span></>}
                      </div>
                    </div>
                    {event.important && <span className="text-xs bg-[#EDE9FE] text-[#8B7CF7] px-2 py-1 rounded-full">중요</span>}
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2.5 bg-[#F5F3FF] rounded-xl flex items-start gap-2">
                <span>💼</span>
                <span className="text-sm text-gray-600">중요한 미팅이 있네요! 명함 챙기시고, 복장도 한번 체크해보세요.</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: 컨디션 입력 */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 mb-8">
              <AlfredoAvatar size="lg" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-4 shadow-sm">
                <p className="font-medium text-gray-800">오늘 컨디션은 어떠세요? 🤔</p>
                <p className="text-sm text-gray-500 mt-1">솔직하게 알려주시면 하루 계획을 더 잘 도와드릴 수 있어요.</p>
              </div>
            </div>
            
            <div className="mb-8">
              <p className="text-sm font-medium text-gray-500 mb-3">기분</p>
              <div className="grid grid-cols-2 gap-3">
                {moods.map(m => (
                  <button key={m.val} onClick={() => setData({...data, mood: m.val})}
                    className={`p-5 rounded-xl border-2 flex flex-col items-center gap-2 ${data.mood === m.val ? 'border-[#A996FF] bg-white shadow-lg scale-[1.02]' : 'border-transparent bg-white/60'}`}>
                    <span className="text-4xl">{m.emoji}</span>
                    <span className={`text-sm font-medium ${data.mood === m.val ? 'text-[#A996FF]' : 'text-gray-500'}`}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">에너지 레벨</p>
                <span className="text-sm font-bold text-[#A996FF]">{data.energy}%</span>
              </div>
              <div className="relative">
                <input type="range" min="0" max="100" step="5" value={data.energy}
                  onChange={e => setData({...data, energy: parseInt(e.target.value)})}
                  className="w-full h-3 bg-[#E5E0FF] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#A996FF] [&::-webkit-slider-thumb]:shadow-lg" />
                <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-[#A996FF] to-[#8B7BE8] rounded-full pointer-events-none" style={{width: `${data.energy}%`}} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>🔋 방전</span><span>⚡ 충만</span>
              </div>
            </div>
            
            <div className="p-3 bg-[#F5F3FF] rounded-xl">
              <p className="text-sm text-gray-600">
                {data.energy < 30 ? '💤 에너지가 낮으시네요. 오늘은 핵심 업무만 집중하고, 작은 일들은 내일로 미뤄도 괜찮아요.'
                : data.energy < 60 ? '☕ 보통 수준이시네요. 중요한 일 먼저 처리하고, 틈틈이 휴식도 챙기세요!'
                : '💪 에너지 충만하시네요! 어려운 일도 오늘 해치울 수 있을 것 같아요!'}
              </p>
            </div>
          </div>
        )}
        
        {/* Step 3: 핵심 1가지 */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <div className="flex items-start gap-3 mb-6">
              <AlfredoAvatar size="lg" />
              <div className="flex-1 bg-white rounded-xl rounded-tl-md p-4 shadow-sm">
                <p className="font-medium text-gray-800">오늘 가장 중요한 건 뭐예요? 🎯</p>
                <p className="text-sm text-gray-500 mt-1">하나만 골라주세요. 제가 그거 중심으로 챙길게요.</p>
              </div>
            </div>
            
            {/* Big3에서 선택 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">📌 오늘 할 일에서 선택</p>
              <div className="space-y-2">
                {mockBig3.map(task => (
                  <button 
                    key={task.id}
                    onClick={() => setData({...data, oneThing: task.title})}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      data.oneThing === task.title 
                        ? 'bg-[#A996FF] text-white' 
                        : 'bg-white text-gray-800 hover:bg-[#F5F3FF]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {data.oneThing === task.title ? <CheckCircle2 size={18} /> : <Circle size={18} className="opacity-40" />}
                      <span className="font-medium text-sm">{task.title}</span>
                    </div>
                    {task.deadline && (
                      <span className={`text-xs block mt-1 ml-7 ${data.oneThing === task.title ? 'text-white/70' : 'text-gray-400'}`}>
                        {task.deadline}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 직접 입력 */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">✏️ 또는 직접 입력</p>
              <input 
                value={data.oneThing} 
                onChange={e => setData({...data, oneThing: e.target.value})}
                placeholder="오늘 꼭 해야 할 한 가지"
                className="w-full p-4 bg-white rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
              />
            </div>
            
            {/* 메모 */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">💬 알프레도에게 한마디 (선택)</p>
              <textarea 
                value={data.memo}
                onChange={e => setData({...data, memo: e.target.value})}
                placeholder="예: 오후 3시 이후로는 집중이 안 돼요"
                rows={2}
                className="w-full p-4 bg-white rounded-xl text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#A996FF]"
              />
            </div>
          </div>
        )}
        
        {/* Step 4: 완료 */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 text-center pt-8">
            <AlfredoAvatar size="xl" className="mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">준비 완료! 🎉</h1>
            <p className="text-gray-500 mb-8">오늘 하루를 함께 해드릴게요.</p>
            
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-5 shadow-sm text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] flex items-center justify-center text-lg">
                  {moods.find(m => m.val === data.mood)?.emoji}
                </div>
                <div>
                  <p className="text-xs text-gray-400">오늘의 기분</p>
                  <p className="font-medium text-gray-800">{moods.find(m => m.val === data.mood)?.label} · 에너지 {data.energy}%</p>
                </div>
              </div>
              {data.oneThing && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] flex items-center justify-center"><Sparkles size={16} className="text-[#A996FF]" /></div>
                  <div>
                    <p className="text-xs text-gray-400">오늘의 핵심</p>
                    <p className="font-medium text-gray-800">{data.oneThing}</p>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-6">입력하신 정보를 바탕으로 오늘의 우선순위를 정리할게요!</p>
          </div>
        )}
      </div>
      
      {/* Bottom Button */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-t from-[#F8F7FC] to-transparent">
        <div className="flex gap-3 max-w-lg mx-auto">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="w-14 h-14 rounded-xl bg-white border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <button onClick={handleNext} disabled={step === 3 && !data.oneThing}
            className={`flex-1 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              (step === 3 && !data.oneThing) 
                ? 'bg-[#E5E0FF] text-gray-400' 
                : 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8]'
            }`}>
            {step === 0 ? '시작하기 🚀' : step === 4 ? '하루 시작하기' : '다음'} 
            {step !== 0 && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};


export default Onboarding;
