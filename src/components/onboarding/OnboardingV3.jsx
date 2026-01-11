import React, { useState, useEffect } from 'react';
import { 
  Calendar, Mail, Clock, Sparkles, ChevronRight, 
  Shield, Eye, Check, ArrowRight, Heart,
  Zap, Brain, Coffee, Moon, Sun
} from 'lucide-react';
import { usePersonalityStore, PERSONALITY_CONFIGS } from '../../stores/personalityStore';
import { useMemoryStore } from '../../stores/memoryStore';
import { useBehaviorStore } from '../../stores/behaviorStore';

/**
 * 🐧 Onboarding V3 - Permission Priming + Value-First
 * 
 * 영감:
 * - Calm: 시작하자마자 호흡 애니메이션 (3초 내 가치 전달)
 * - Wise: 가입 전에 가치 체험
 * - Noom: "이 질문을 하는 이유" 투명성
 * - Pi: "지금 뭐가 필요해요?" 사용자 Agency
 * - Motion: 가치 경험 후에 권한 요청
 */

const STEPS = [
  'welcome',      // 0: 환영 + 즉시 가치
  'needs',        // 1: Pi 스타일 - 뭐가 필요해요?
  'personality',  // 2: 알프레도 성격 선택
  'rhythm',       // 3: 크로노타입 (아침형/저녁형)
  'calendar',     // 4: 캘린더 연동 (Permission Priming)
  'email',        // 5: 이메일 연동 (Permission Priming)
  'complete',     // 6: 완료
];

const OnboardingV3 = ({ onComplete, existingGoogleAuth }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    need: null,
    personality: 'warm',
    rhythm: null,
    calendarConnected: false,
    emailConnected: false,
  });
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { setPersonalityMode } = usePersonalityStore();
  const { setUserFact, addMemory } = useMemoryStore();
  const { trackSessionStart } = useBehaviorStore();

  useEffect(() => {
    trackSessionStart();
  }, []);

  const goNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
      setIsAnimating(false);
    }, 300);
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // 선택된 성격 적용
    setPersonalityMode(selections.personality);
    
    // 사용자 정보 저장
    if (selections.rhythm) {
      setUserFact('chronotype', selections.rhythm, 'onboarding');
    }
    if (selections.need) {
      setUserFact('primaryNeed', selections.need, 'onboarding');
    }
    
    // 메모리 추가
    addMemory({
      type: 'event',
      content: '알프레도와 처음 만남',
      importance: 3,
      source: 'explicit',
      tags: ['onboarding', 'first-meeting'],
    });
    
    onComplete?.(selections);
  };

  // ========== Step Components ==========

  // Step 0: Welcome - 즉시 가치 전달 (Calm 스타일)
  const WelcomeStep = () => (
    <div className="text-center animate-fade-in">
      {/* 펜귄 캐릭터 */}
      <div className="relative mb-6">
        <div className="text-8xl animate-bounce-slow">🐧</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-purple-200 rounded-full blur-sm" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        안녕하세요, Boss!
      </h1>
      <p className="text-gray-600 mb-6">
        저는 <span className="font-semibold text-purple-600">알프레도</span>예요.
        <br />Boss의 하루를 도와드릴 AI 버틀러입니다.
      </p>

      {/* 즉시 가치 전달 */}
      <div className="bg-purple-50 rounded-2xl p-4 mb-6 text-left">
        <p className="text-sm font-medium text-purple-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          알프레도가 도와드릴 수 있는 것들
        </p>
        <ul className="space-y-2 text-sm text-purple-600">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-500" />
            아침 브리핑으로 하루 시작 도와드리기
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-500" />
            중요한 일 놓치지 않게 리마인드
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-500" />
            에너지 리듬에 맞는 일정 추천
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-purple-500" />
            힘들 때 옆에서 응원해드리기
          </li>
        </ul>
      </div>

      <button
        onClick={goNext}
        className="w-full py-4 bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
      >
        시작하기
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-400 mt-4">
        2분 정도 걸려요 • 언제든 건너뛸 수 있어요
      </p>
    </div>
  );

  // Step 1: Needs - Pi 스타일 "뭐가 필요해요?"
  const NeedsStep = () => {
    const needs = [
      { id: 'organize', emoji: '📋', label: '정리하기', desc: '머릿속 할 일들 정리하고 싶어요' },
      { id: 'focus', emoji: '🎯', label: '집중하기', desc: '산만함 없이 집중하고 싶어요' },
      { id: 'balance', emoji: '⚖️', label: '균형 잡기', desc: '일과 삶의 균형을 찾고 싶어요' },
      { id: 'support', emoji: '🫂', label: '응원받기', desc: '누군가 옆에서 응원해주면 좋겠어요' },
    ];

    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐧</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            지금 가장 필요한 게 뭐예요?
          </h2>
          <p className="text-sm text-gray-500">
            Boss에게 맞는 도움을 드릴게요
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {needs.map((need) => (
            <button
              key={need.id}
              onClick={() => {
                setSelections(prev => ({ ...prev, need: need.id }));
                setTimeout(goNext, 300);
              }}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                selections.need === need.id
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
              }`}
            >
              <span className="text-3xl">{need.emoji}</span>
              <div>
                <p className="font-medium text-gray-800">{need.label}</p>
                <p className="text-sm text-gray-500">{need.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-full py-3 text-gray-500 hover:text-gray-700"
        >
          나중에 정할게요
        </button>
      </div>
    );
  };

  // Step 2: Personality - 알프레도 성격 선택 (CARROT 스타일)
  const PersonalityStep = () => {
    const personalities = Object.values(PERSONALITY_CONFIGS);

    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎭</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            알프레도 성격을 골라주세요
          </h2>
          <p className="text-sm text-gray-500">
            언제든 설정에서 바꿀 수 있어요
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {personalities.map((p) => (
            <button
              key={p.mode}
              onClick={() => setSelections(prev => ({ ...prev, personality: p.mode }))}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                selections.personality === p.mode
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{p.emoji}</span>
                <span className="font-semibold text-gray-800">{p.name}</span>
                {selections.personality === p.mode && (
                  <Check className="w-5 h-5 text-purple-500 ml-auto" />
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">{p.description}</p>
              <div className="flex flex-wrap gap-1">
                {p.samplePhrases.slice(0, 2).map((phrase, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    "{phrase.slice(0, 20)}..."
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-full py-4 bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 transition-colors"
        >
          계속하기
        </button>
      </div>
    );
  };

  // Step 3: Rhythm - 크로노타입
  const RhythmStep = () => {
    const rhythms = [
      { id: 'morning', emoji: '☀️', label: '아침형', desc: '아침에 가장 집중 잘 돼요', icon: Sun },
      { id: 'evening', emoji: '🌙', label: '저녁형', desc: '오후-저녁에 에너지가 높아요', icon: Moon },
      { id: 'flexible', emoji: '🌈', label: '유연형', desc: '그때그때 달라요', icon: Zap },
    ];

    return (
      <div className="animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">⏰</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Boss는 언제 가장 집중이 잘 돼요?
          </h2>
          <p className="text-sm text-gray-500">
            이 정보로 최적의 시간에 중요한 일을 추천해드려요
          </p>
        </div>

        {/* "왜 묻는지" 설명 - Noom 스타일 */}
        <div className="bg-blue-50 rounded-xl p-3 mb-4 text-sm text-blue-700 flex items-start gap-2">
          <Brain className="w-4 h-4 mt-0.5" />
          <span>
            <strong>왜 묻나요?</strong> ADHD에선 에너지 리듬에 맞는 스케줄링이 중요해요.
            집중 잘 되는 시간에 중요한 일을 배치해드려요.
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {rhythms.map((rhythm) => (
            <button
              key={rhythm.id}
              onClick={() => {
                setSelections(prev => ({ ...prev, rhythm: rhythm.id }));
                setTimeout(goNext, 300);
              }}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                selections.rhythm === rhythm.id
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-200'
              }`}
            >
              <span className="text-3xl">{rhythm.emoji}</span>
              <div className="text-left">
                <p className="font-medium text-gray-800">{rhythm.label}</p>
                <p className="text-sm text-gray-500">{rhythm.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={goNext}
          className="w-full py-3 text-gray-500 hover:text-gray-700"
        >
          잘 모르겠어요
        </button>
      </div>
    );
  };

  // Step 4: Calendar Permission Priming (Motion/Reclaim 스타일)
  const CalendarStep = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          캘린더 연동하기
        </h2>
        <p className="text-sm text-gray-500">
          일정을 보면 더 똑똑한 도움을 드릴 수 있어요
        </p>
      </div>

      {/* Permission Priming - "연결하면 얻는 것" */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 mb-4">
        <p className="text-sm font-medium text-purple-700 mb-3">
          캘린더를 연결하면:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-purple-600">
            <Check className="w-4 h-4 text-purple-500 mt-0.5" />
            <span>오늘 미팅 30분 전에 알려드려요</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-purple-600">
            <Check className="w-4 h-4 text-purple-500 mt-0.5" />
            <span>비어있는 시간에 집중 시간을 보호해드려요</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-purple-600">
            <Check className="w-4 h-4 text-purple-500 mt-0.5" />
            <span>내일 일정을 미리 브리핑으로 알려드려요</span>
          </li>
        </ul>
      </div>

      {/* 프라이버시 보장 */}
      <div className="flex items-start gap-2 mb-6 p-3 bg-gray-50 rounded-xl">
        <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
        <p className="text-xs text-gray-500">
          캘린더 데이터는 Boss의 기기에만 저장되고, 절대 공유하지 않아요.
        </p>
      </div>

      <button
        onClick={() => {
          setSelections(prev => ({ ...prev, calendarConnected: true }));
          // 실제 Google OAuth 로직 호출
          goNext();
        }}
        className="w-full py-4 bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
      >
        <Calendar className="w-5 h-5" />
        Google 캘린더 연결하기
      </button>

      <button
        onClick={goNext}
        className="w-full py-3 text-gray-500 hover:text-gray-700 mt-2"
      >
        나중에 할게요
      </button>
    </div>
  );

  // Step 5: Email Permission Priming
  const EmailStep = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          이메일 연동하기
        </h2>
        <p className="text-sm text-gray-500">
          중요한 메일만 콕 집어서 알려드려요
        </p>
      </div>

      {/* Permission Priming */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 mb-4">
        <p className="text-sm font-medium text-blue-700 mb-3">
          이메일을 연결하면:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-blue-600">
            <Check className="w-4 h-4 text-blue-500 mt-0.5" />
            <span>답장 필요한 메일만 따로 알려드려요</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-blue-600">
            <Check className="w-4 h-4 text-blue-500 mt-0.5" />
            <span>VIP 발신자 메일은 바로 알림을 드려요</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-blue-600">
            <Check className="w-4 h-4 text-blue-500 mt-0.5" />
            <span>아침 브리핑에 메일 요약을 넣어드려요</span>
          </li>
        </ul>
      </div>

      {/* 프라이버시 */}
      <div className="flex items-start gap-2 mb-6 p-3 bg-gray-50 rounded-xl">
        <Eye className="w-4 h-4 text-gray-400 mt-0.5" />
        <p className="text-xs text-gray-500">
          메일 내용은 읽지 않아요. 발신자와 제목만 확인해요.
        </p>
      </div>

      <button
        onClick={() => {
          setSelections(prev => ({ ...prev, emailConnected: true }));
          goNext();
        }}
        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Mail className="w-5 h-5" />
        Gmail 연결하기
      </button>

      <button
        onClick={goNext}
        className="w-full py-3 text-gray-500 hover:text-gray-700 mt-2"
      >
        나중에 할게요
      </button>
    </div>
  );

  // Step 6: Complete
  const CompleteStep = () => (
    <div className="text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="text-8xl">🎉</div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        준비 완료!
      </h1>
      <p className="text-gray-600 mb-6">
        이제 알프레도가 Boss의 하루를 도와드릴 준비가 됐어요!
      </p>

      {/* 선택 요약 */}
      <div className="bg-purple-50 rounded-2xl p-4 mb-6 text-left">
        <p className="text-sm font-medium text-purple-700 mb-3">
          설정된 내용
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-gray-600">알프레도 성격</span>
            <span className="text-purple-600 font-medium">
              {PERSONALITY_CONFIGS[selections.personality]?.name}
            </span>
          </li>
          {selections.rhythm && (
            <li className="flex justify-between">
              <span className="text-gray-600">에너지 타입</span>
              <span className="text-purple-600 font-medium">
                {selections.rhythm === 'morning' ? '아침형' : 
                 selections.rhythm === 'evening' ? '저녕형' : '유연형'}
              </span>
            </li>
          )}
          <li className="flex justify-between">
            <span className="text-gray-600">캘린더</span>
            <span className={selections.calendarConnected ? 'text-green-600' : 'text-gray-400'}>
              {selections.calendarConnected ? '연결됨' : '미연결'}
            </span>
          </li>
          <li className="flex justify-between">
            <span className="text-gray-600">이메일</span>
            <span className={selections.emailConnected ? 'text-green-600' : 'text-gray-400'}>
              {selections.emailConnected ? '연결됨' : '미연결'}
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleComplete}
        className="w-full py-4 bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
      >
        <Heart className="w-5 h-5" />
        알프레도와 시작하기
      </button>
    </div>
  );

  // ========== Render ==========

  const stepComponents = [
    <WelcomeStep key="welcome" />,
    <NeedsStep key="needs" />,
    <PersonalityStep key="personality" />,
    <RhythmStep key="rhythm" />,
    <CalendarStep key="calendar" />,
    <EmailStep key="email" />,
    <CompleteStep key="complete" />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Progress Bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <button
            onClick={goBack}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← 이전
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 px-6 py-8 transition-opacity ${
        isAnimating ? 'opacity-0' : 'opacity-100'
      }`}>
        {stepComponents[currentStep]}
      </div>
    </div>
  );
};

export default OnboardingV3;
