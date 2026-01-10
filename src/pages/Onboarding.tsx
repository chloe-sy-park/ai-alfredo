import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const PHASES = [
  {
    id: 1,
    title: '반가워요! 🐧',
    subtitle: '알프레도가 더 잘 도와드리기 위해 몇 가지만 여쏛볼게요.',
    question: '주로 어떤 일을 하세요?',
    options: [
      { value: 'office', label: '회사원', emoji: '🏢' },
      { value: 'freelance', label: '프리랜서', emoji: '💻' },
      { value: 'student', label: '학생', emoji: '📚' },
      { value: 'business', label: '사업가', emoji: '🚀' },
      { value: 'other', label: '기타', emoji: '✨' }
    ]
  },
  {
    id: 2,
    title: '아침형인가요, 저녁형인가요?',
    subtitle: '브리핑 시간과 집중 시간대를 맞춤 설정해드릴게요.',
    question: '언제 가장 에너지가 높으세요?',
    options: [
      { value: 'early_bird', label: '새벽-오전', emoji: '🌅' },
      { value: 'morning', label: '오전', emoji: '☀️' },
      { value: 'afternoon', label: '오후', emoji: '🌤️' },
      { value: 'evening', label: '저녁', emoji: '🌙' },
      { value: 'night_owl', label: '밤', emoji: '🌃' }
    ]
  },
  {
    id: 3,
    title: '알프레도가 어떻게 대화하면 좋을까요?',
    subtitle: '나중에 언제든 바꿀 수 있어요.',
    question: '선호하는 톤을 골라주세요.',
    options: [
      { value: 'gentle_friend', label: '따뜻한 친구', emoji: '🤗' },
      { value: 'mentor', label: '멘토', emoji: '🧑‍🏫' },
      { value: 'ceo', label: 'CEO', emoji: '💼' },
      { value: 'cheerleader', label: '응원단', emoji: '💪' },
      { value: 'silent_partner', label: '조용한 동료', emoji: '🧘' }
    ]
  },
  {
    id: 4,
    title: '캐린더를 연동할까요?',
    subtitle: '일정을 보고 더 똑똑하게 도와드릴 수 있어요.',
    question: '',
    isPermission: true
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuthStore();
  const { setTonePreset, updateOnboarding } = useSettingsStore();
  
  const [currentPhase, setCurrentPhase] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const phase = PHASES[currentPhase];
  const isLastPhase = currentPhase === PHASES.length - 1;

  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [phase.id]: value });
    
    // 톤 선택시 즉시 적용
    if (phase.id === 3) {
      setTonePreset(value as any);
    }
  };

  const handleNext = () => {
    if (isLastPhase) {
      updateOnboarding({ completed: true, answers });
      completeOnboarding();
      navigate('/');
    } else {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handleBack = () => {
    if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const handleSkipPermission = () => {
    updateOnboarding({ completed: true, answers });
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-lavender-50 p-6 flex flex-col">
      {/* 진행바 */}
      <div className="flex gap-2 mb-8">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= currentPhase ? 'bg-lavender-400' : 'bg-lavender-200'
            }`}
          />
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{phase.title}</h1>
          <p className="text-gray-600">{phase.subtitle}</p>
        </div>

        {phase.isPermission ? (
          // 권한 요청 화면
          <Card className="w-full text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="font-semibold mb-2">캐린더 연동</h3>
            <p className="text-sm text-gray-600 mb-4">
              일정을 확인해서 더 똑똑한 브리핑을 드릴게요.
              캐린더 데이터는 안전하게 보호됩니다.
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={handleNext}>
                캐린더 연동하기
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleSkipPermission}>
                나중에 할게요
              </Button>
            </div>
          </Card>
        ) : (
          // 질문 화면
          <>
            {phase.question && (
              <p className="text-gray-700 mb-4 font-medium">{phase.question}</p>
            )}
            <div className="w-full grid grid-cols-2 gap-3">
              {phase.options?.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`p-4 rounded-2xl text-left transition-all ${
                    answers[phase.id] === option.value
                      ? 'bg-lavender-100 border-2 border-lavender-400 shadow-sm'
                      : 'bg-white border-2 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{option.emoji}</span>
                  <span className="font-medium text-gray-800">{option.label}</span>
                  {answers[phase.id] === option.value && (
                    <Check className="inline-block ml-2 text-lavender-500" size={16} />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 하단 네비게이션 */}
      {!phase.isPermission && (
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={handleBack}
            disabled={currentPhase === 0}
            className="flex items-center gap-1 text-gray-500 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
            이전
          </button>
          <Button
            onClick={handleNext}
            disabled={!answers[phase.id]}
            rightIcon={<ChevronRight size={18} />}
          >
            {isLastPhase ? '시작하기' : '다음'}
          </Button>
        </div>
      )}
    </div>
  );
}
