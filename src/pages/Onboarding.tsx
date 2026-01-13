import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const PHASES = [
  {
    id: 1,
    title: '반가워요! 🐧',
    subtitle: '알프레도가 더 잘 도와드리기 위해 몇 가지만 여쫐볼게요.',
    options: [
      { value: 'office', label: '회사원', emoji: '🏢' },
      { value: 'freelance', label: '프리랜서', emoji: '💻' },
      { value: 'student', label: '학생', emoji: '📚' },
      { value: 'business', label: '사업가', emoji: '🚀' },
    ]
  },
  {
    id: 2,
    title: '언제 가장 집중이 잘 되세요?',
    subtitle: '브리핑 시간을 맞춤 설정해드릴게요.',
    options: [
      { value: 'morning', label: '오전', emoji: '☀️' },
      { value: 'afternoon', label: '오후', emoji: '🌤️' },
      { value: 'evening', label: '저녁', emoji: '🌙' },
      { value: 'night', label: '밤', emoji: '🌃' },
    ]
  },
  {
    id: 3,
    title: '알프레도 톤 선택',
    subtitle: '나중에 언제든 바꾸늤 수 있어요.',
    options: [
      { value: 'gentle', label: '따뜻한 친구', emoji: '🤗' },
      { value: 'mentor', label: '멘토', emoji: '🧑‍🏫' },
      { value: 'ceo', label: 'CEO', emoji: '💼' },
      { value: 'cheerleader', label: '응원단', emoji: '💪' },
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuthStore();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const phase = PHASES[currentPhase];
  const isLastPhase = currentPhase === PHASES.length - 1;

  const handleSelect = (value: string) => {
    setAnswers({ ...answers, [phase.id]: value });
  };

  const handleNext = () => {
    if (isLastPhase) {
      completeOnboarding();
      navigate('/');
    } else {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handleBack = () => {
    if (currentPhase > 0) setCurrentPhase(currentPhase - 1);
  };

  return (
    <div className="min-h-screen bg-lavender-50 p-6 flex flex-col">
      {/* 진행바 */}
      <div className="flex gap-2 mb-8">
        {PHASES.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= currentPhase ? 'bg-lavender-400' : 'bg-lavender-200'}`} />
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{phase.title}</h1>
          <p className="text-gray-600">{phase.subtitle}</p>
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          {phase.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`p-4 rounded-2xl text-left transition-all ${
                answers[phase.id] === option.value
                  ? 'bg-lavender-100 border-2 border-lavender-400'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mb-2 block">{option.emoji}</span>
              <span className="font-medium text-gray-800">{option.label}</span>
              {answers[phase.id] === option.value && <Check className="inline-block ml-2 text-lavender-500" size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 네비 */}
      <div className="flex justify-between items-center pt-6">
        <button onClick={handleBack} disabled={currentPhase === 0} className="flex items-center gap-1 text-gray-500 disabled:opacity-30">
          <ChevronLeft size={20} /> 이전
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[phase.id]}
          className="flex items-center gap-1 px-4 py-2 bg-lavender-500 text-white rounded-full disabled:opacity-50"
        >
          {isLastPhase ? '시작하기' : '다음'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
