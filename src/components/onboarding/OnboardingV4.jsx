import React, { useState, useEffect } from 'react';
import { 
  Calendar, Mail, Sparkles, ChevronRight, 
  Shield, Check, ArrowRight, Heart, Zap, Lock, Eye, Bell, Clock
} from 'lucide-react';

/**
 * 🐧 Onboarding V4 - Permission Priming 강화 버전
 * 
 * 벤치마킹 적용:
 * - Reclaim AI: 각 권한이 어떤 기능을 활성화하는지 구체적 설명
 * - Motion: 가치 경험 후 권한 요청
 * - Clockwise: 연동 후 보게 될 결과 프리뷰
 * - Plaid: 데이터 투명성 강조
 * - Pi: Agency 제공 ("지금 뭐가 필요해요?")
 * 
 * 단계:
 * 1. Welcome + 즉시 가치 (Calm 스타일 3초 가치 전달)
 * 2. 뭐가 필요해요? (Pi 스타일 Agency)
 * 3. 연동 (Permission Priming 강화)
 * 4. 완료 + 즉시 가치 프리뷰
 */

const STEPS = ['welcome', 'needs', 'connect', 'complete'];

// 필요 옵션
const NEEDS = [
  { id: 'organize', emoji: '📋', label: '정리', desc: '머릿속 할 일 정리' },
  { id: 'focus', emoji: '🎯', label: '집중', desc: '산만함 없이 몰입' },
  { id: 'balance', emoji: '⚖️', label: '균형', desc: '일과 삶의 밸런스' },
  { id: 'support', emoji: '🫂', label: '응원', desc: '옆에서 격려해주기' },
];

// 🔑 Permission Priming 메시지
const PERMISSION_BENEFITS = {
  calendar: [
    { icon: Bell, text: '미팅 30분 전 부드러운 알림' },
    { icon: Clock, text: '하루 시작 시 오늘 일정 브리핑' },
    { icon: Sparkles, text: '바쁜 날 vs 여유로운 날 파악' },
  ],
  email: [
    { icon: Mail, text: '중요한 메일만 알려드려요' },
    { icon: Check, text: '답장 필요한 메일 체크' },
    { icon: Eye, text: 'VIP 발신자 우선 표시' },
  ],
};

// 🔒 프라이버시 약속 (Plaid 스타일)
const PRIVACY_PROMISES = [
  '데이터는 기기에만 저장돼요',
  '제3자와 절대 공유하지 않아요',
  '언제든 연결 해제할 수 있어요',
];

const OnboardingV4 = ({ onComplete, onGoogleAuth }) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    need: null,
    connected: false,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const goNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1));
      setIsTransitioning(false);
    }, 200);
  };

  const handleComplete = () => {
    onComplete?.(selections);
  };

  const handleGoogleConnect = async () => {
    if (onGoogleAuth) {
      const success = await onGoogleAuth();
      if (success) {
        setSelections(prev => ({ ...prev, connected: true }));
      }
    }
    goNext();
  };

  // ========== Step 0: Welcome ==========
  const WelcomeStep = () => (
    <div className="text-center">
      {/* 펭귄 - 즉시 가치 전달 (Calm 스타일) */}
      <div className="relative mb-8">
        <div className="text-[100px] leading-none animate-bounce">🐧</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-purple-200/50 rounded-full blur-md" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        안녕하세요!
      </h1>
      <p className="text-gray-600 mb-8">
        <span className="font-semibold text-purple-600">알프레도</span>예요.
        <br />Boss의 하루를 도와드릴게요.
      </p>

      {/* 핵심 가치 3개 - 즉시 가치 전달 */}
      <div className="flex justify-center gap-4 mb-10">
        {[
          { emoji: '☀️', text: '아침 브리핑' },
          { emoji: '🔔', text: '부드러운 알림' },
          { emoji: '💜', text: '응원 & 격려' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs text-gray-500">{item.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={goNext}
        className="w-full min-h-[56px] bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        시작하기
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-400 mt-4">
        1분이면 끝나요 ✨
      </p>
    </div>
  );

  // ========== Step 1: Needs (Pi 스타일 Agency) ==========
  const NeedsStep = () => (
    <div>
      <div className="text-center mb-8">
        <span className="text-5xl">🐧</span>
        <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">
          지금 가장 필요한 건요?
        </h2>
        <p className="text-sm text-gray-500">
          하나만 골라주세요 — 나중에 바꿀 수 있어요
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {NEEDS.map((need) => (
          <button
            key={need.id}
            onClick={() => {
              setSelections(prev => ({ ...prev, need: need.id }));
              setTimeout(goNext, 300);
            }}
            className={`min-h-[100px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 active:scale-[0.97] ${
              selections.need === need.id
                ? 'border-purple-400 bg-purple-50'
                : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
            }`}
          >
            <span className="text-3xl">{need.emoji}</span>
            <span className="font-medium text-gray-800">{need.label}</span>
            <span className="text-xs text-gray-500">{need.desc}</span>
          </button>
        ))}
      </div>

      <button
        onClick={goNext}
        className="w-full py-3 text-gray-400 hover:text-gray-600 text-sm"
      >
        나중에 정할게요
      </button>
    </div>
  );

  // ========== Step 2: Connect (Permission Priming 강화) ==========
  const ConnectStep = () => (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          알프레도가 더 잘 도와드릴게요
        </h2>
        <p className="text-sm text-gray-500">
          캘린더와 이메일을 연결하면
        </p>
      </div>

      {/* 🔑 Permission Priming: 구체적 혜택 (Reclaim 스타일) */}
      <div className="space-y-3 mb-5">
        {/* 캘린더 혜택 */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700 text-sm">캘린더 연동하면</span>
          </div>
          <div className="space-y-2 pl-7">
            {PERMISSION_BENEFITS.calendar.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <benefit.icon className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-700">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 이메일 혜택 */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700 text-sm">이메일 연동하면</span>
          </div>
          <div className="space-y-2 pl-7">
            {PERMISSION_BENEFITS.email.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <benefit.icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-700">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🔒 프라이버시 약속 (Plaid 스타일) */}
      <button
        onClick={() => setShowPrivacy(!showPrivacy)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl mb-4 transition-all hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">데이터는 안전하게 보관돼요</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showPrivacy ? 'rotate-90' : ''}`} />
      </button>

      {showPrivacy && (
        <div className="bg-green-50 rounded-xl p-4 mb-4 animate-in fade-in duration-200">
          <div className="space-y-2">
            {PRIVACY_PROMISES.map((promise, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700">{promise}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleGoogleConnect}
        className="w-full min-h-[56px] bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google로 연결하기
      </button>

      <button
        onClick={goNext}
        className="w-full py-3 text-gray-400 hover:text-gray-600 text-sm mt-2"
      >
        나중에 할게요 — 설정에서 언제든 가능해요
      </button>
    </div>
  );

  // ========== Step 3: Complete (즉시 가치 프리뷰) ==========
  const CompleteStep = () => (
    <div className="text-center">
      <div className="text-[80px] leading-none mb-6">🎉</div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        준비 완료!
      </h1>
      <p className="text-gray-600 mb-6">
        알프레도가 Boss의 하루를
        <br />도와드릴 준비가 됐어요
      </p>

      {/* 🎁 즉시 가치 프리뷰 (Clockwise 스타일) */}
      {selections.connected ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700">연동 완료! 바로 시작해요</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✨ 내일 아침, 첫 브리핑을 보내드릴게요</p>
            <p>📅 캘린더를 분석해서 오늘 하루를 파악할게요</p>
            <p>💌 중요한 이메일이 오면 알려드릴게요</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-semibold text-gray-700">연동 없이도 시작할 수 있어요</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📝 할 일을 추가하고 관리해보세요</p>
            <p>💬 알프레도와 대화해보세요</p>
            <p>⚙️ 설정에서 언제든 Google 연동 가능해요</p>
          </div>
        </div>
      )}

      {/* 선택한 니즈 표시 */}
      {selections.need && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-gray-500">선택한 목표:</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {NEEDS.find(n => n.id === selections.need)?.emoji} {NEEDS.find(n => n.id === selections.need)?.label}
          </span>
        </div>
      )}

      <button
        onClick={handleComplete}
        className="w-full min-h-[56px] bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <Heart className="w-5 h-5" />
        시작하기
      </button>
    </div>
  );

  // ========== Render ==========
  const stepComponents = [
    <WelcomeStep key="welcome" />,
    <NeedsStep key="needs" />,
    <ConnectStep key="connect" />,
    <CompleteStep key="complete" />,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      {/* Progress - 더 심플하게 */}
      <div className="px-6 pt-6">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 px-6 py-10 flex flex-col justify-center transition-opacity duration-200 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}>
        {stepComponents[step]}
      </div>
    </div>
  );
};

export default OnboardingV4;

// Named export도 추가
export { OnboardingV4 };
