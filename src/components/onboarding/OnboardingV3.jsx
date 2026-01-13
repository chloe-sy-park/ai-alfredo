import React, { useState, useEffect } from 'react';
import { 
  Calendar, Mail, Clock, Sparkles, ChevronRight, 
  Shield, Eye, Check, ArrowRight, Heart,
  Zap, Brain, Coffee, Moon, Sun
} from 'lucide-react';
import SampleBriefingExperience from './SampleBriefingExperience';

/**
 * 🐧 Onboarding V3 - 문서 기준 플로우
 * 
 * 플로우:
 * 0. welcome - 펭귄 인사 (3초)
 * 1. sample - 샘플 브리핑 체험 (가치 먼저!)
 * 2. calendar - 캘린더 연동
 * 3. calendarInsight - 즉시 인사이트 (캘린더)
 * 4. email - 이메일 연동
 * 5. emailInsight - 즉시 인사이트 (이메일)
 * 6. complete - 완료 + 육성 알림
 * 
 * 총: 2-3분 / 질문: 0개 / 연동: 2개
 */

const STEPS = [
  'welcome',        // 0: 펭귄 인사
  'sample',         // 1: 샘플 브리핑 체험
  'calendar',       // 2: 캘린더 연동
  'calendarInsight',// 3: 즉시 인사이트 (캘린더)
  'email',          // 4: 이메일 연동
  'emailInsight',   // 5: 즉시 인사이트 (이메일)
  'complete',       // 6: 완료
];

const OnboardingV3 = ({ onComplete, existingGoogleAuth }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    calendarConnected: false,
    emailConnected: false,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Phase 0: 펭귄 인사 자동 진행 (3초)
  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        goNext();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

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
    onComplete?.(selections);
  };

  // ========== Step Components ==========

  // Step 0: Welcome - 펭귄 인사 (3초 자동 진행)
  const WelcomeStep = () => (
    <div className="text-center animate-fade-in">
      {/* 펜귄 캐릭터 */}
      <div className="relative mb-6">
        <div className="text-8xl animate-bounce-slow">🐧</div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-purple-200 rounded-full blur-sm" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        안녕하세요!
      </h1>
      <p className="text-gray-600 mb-6">
        저는 <span className="font-semibold text-purple-600">알프레도</span>예요.
        <br />오늘 하루를 함께 정리해드릴게요.
      </p>

      <p className="text-xs text-gray-400 mt-4">
        잠시만요...
      </p>
    </div>
  );

  // Step 1: 샘플 브리핑 체험 (가치 먼저!)
  const SampleStep = () => (
    <div className="animate-fade-in">
      <SampleBriefingExperience 
        onComplete={goNext}
      />
    </div>
  );

  // Step 2: Calendar - 캘린더 연동
  const CalendarStep = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          캘린더를 연결해주세요
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
          캘린더 데이터는 절대 공유하지 않아요. 🔒
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
        onClick={() => {
          // 캘린더 스킵 시 이메일 단계로
          setCurrentStep(4);
        }}
        className="w-full py-3 text-gray-500 hover:text-gray-700 mt-2"
      >
        나중에 할게요
      </button>
    </div>
  );

  // Step 3: Calendar Insight - 즉시 인사이트 (캘린더)
  const CalendarInsightStep = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🎯</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          벌써 몇 가지 알게 됐어요!
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
          <span className="text-xl">📆</span>
          <div>
            <p className="font-medium text-gray-800">이번 주 미팅이 꽤 있네요</p>
            <p className="text-sm text-gray-500">집중 시간 확보해드릴게요</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
          <span className="text-xl">🌅</span>
          <div>
            <p className="font-medium text-gray-800">오전에 일정이 많은 편이에요</p>
            <p className="text-sm text-gray-500">오후에 딥워크 시간 추천해드릴게요</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
          <span className="text-xl">💡</span>
          <div>
            <p className="font-medium text-gray-800">시간이 지나면 더 알게 될 거예요!</p>
            <p className="text-sm text-gray-500">패턴을 분석해서 맞춤 추천해드릴게요</p>
          </div>
        </div>
      </div>

      <button
        onClick={goNext}
        className="w-full py-4 bg-purple-500 text-white rounded-2xl font-semibold hover:bg-purple-600 transition-colors"
      >
        좋아요!
      </button>
    </div>
  );

  // Step 4: Email - 이메일 연동
  const EmailStep = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          이메일도 연결해볼까요?
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
          메일 내용은 읽지 않아요. 발신자와 제목만 확인해요. 🔒
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
        onClick={() => {
          // 이메일 스킵 시 완료로
          setCurrentStep(6);
        }}
        className="w-full py-3 text-gray-500 hover:text-gray-700 mt-2"
      >
        나중에 할게요
      </button>
    </div>
  );

  // Step 5: Email Insight - 즉시 인사이트 (이메일)
  const EmailInsightStep = () => (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">📬</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          이메일도 파악했어요!
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
          <span className="text-xl">📧</span>
          <div>
            <p className="font-medium text-gray-800">읽지 않은 메일이 좀 있네요</p>
            <p className="text-sm text-gray-500">중요한 것만 브리핑에 넣어드릴게요</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
          <span className="text-xl">⭐</span>
          <div>
            <p className="font-medium text-gray-800">자주 연락하는 분들 파악했어요</p>
            <p className="text-sm text-gray-500">VIP로 등록해드릴까요?</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
          <span className="text-xl">🔔</span>
          <div>
            <p className="font-medium text-gray-800">급한 메일은 바로 알려드릴게요</p>
            <p className="text-sm text-gray-500">놓치지 않게 도와드려요</p>
          </div>
        </div>
      </div>

      <button
        onClick={goNext}
        className="w-full py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
      >
        좋아요!
      </button>
    </div>
  );

  // Step 6: Complete - 완료 + 육성 알림
  const CompleteStep = () => (
    <div className="text-center animate-fade-in">
      <div className="relative mb-6">
        <div className="text-8xl">🎉</div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        준비 완료!
      </h1>
      <p className="text-gray-600 mb-6">
        알프레도가 조금씩 당신을 알아갈 거예요.
      </p>

      {/* 🐧 육성 알림 박스 */}
      <div className="bg-purple-50 rounded-2xl p-5 mb-6 text-left max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🐧</span>
          <span className="font-semibold text-purple-700">알프레도가 당신을 이해하는 중...</span>
        </div>
        
        {/* 프로그레스 바 */}
        <div className="bg-purple-200 rounded-full h-2 mb-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: '8%' }}
          />
        </div>
        <p className="text-right text-sm text-purple-600 font-medium mb-3">
          현재 이해도: 8%
        </p>
        
        <p className="text-sm text-purple-600">
          함께 시간을 보낼수록 더 잘 알게 될 거예요! 💜
        </p>
      </div>

      {/* 연결 상태 요약 */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">캘린더</span>
          <span className={selections.calendarConnected ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {selections.calendarConnected ? '✓ 연결됨' : '미연결'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">이메일</span>
          <span className={selections.emailConnected ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {selections.emailConnected ? '✓ 연결됨' : '미연결'}
          </span>
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors flex items-center justify-center gap-2 max-w-sm mx-auto"
      >
        <Heart className="w-5 h-5" />
        알프레도와 시작하기
      </button>
    </div>
  );

  // ========== Render ==========

  const stepComponents = [
    <WelcomeStep key="welcome" />,
    <SampleStep key="sample" />,
    <CalendarStep key="calendar" />,
    <CalendarInsightStep key="calendarInsight" />,
    <EmailStep key="email" />,
    <EmailInsightStep key="emailInsight" />,
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
        {currentStep > 1 && currentStep < STEPS.length - 1 && (
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

      {/* 스킵 버튼 (환영/완료 제외) */}
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="px-6 pb-6 text-center">
          <button
            onClick={() => setCurrentStep(STEPS.length - 1)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            온보딩 건너뛰기
          </button>
        </div>
      )}
    </div>
  );
};

export default OnboardingV3;
