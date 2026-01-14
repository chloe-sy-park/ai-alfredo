import { useOnboardingStore } from '../../stores/onboardingStore';
import { Briefcase, Heart, Scale, HelpCircle } from 'lucide-react';

type Direction = 'work' | 'life' | 'both' | 'auto';

export default function Step3Direction() {
  var { selectedDirection, setDirection, nextStep } = useOnboardingStore();

  var options: { value: Direction; icon: typeof Briefcase; label: string; description: string }[] = [
    {
      value: 'work',
      icon: Briefcase,
      label: '일 중심',
      description: '업무 생산성에 집중하고 싶어요'
    },
    {
      value: 'life',
      icon: Heart,
      label: '삶 중심',
      description: '생활 패턴과 밸런스가 중요해요'
    },
    {
      value: 'both',
      icon: Scale,
      label: '둘 다',
      description: '일과 삶 모두 챙기고 싶어요'
    },
    {
      value: 'auto',
      icon: HelpCircle,
      label: '잘 모르겠어요',
      description: 'AlFredo가 판단해주세요'
    }
  ];

  function handleSelect(value: Direction) {
    setDirection(value);
  }

  function handleNext() {
    if (selectedDirection) {
      nextStep();
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          어떤 방향으로 시작할까요?
        </h1>
      </div>
      
      {/* 선택지 */}
      <div className="flex-1 space-y-3">
        {options.map(function(option) {
          var IconComponent = option.icon;
          var isSelected = selectedDirection === option.value;
          
          return (
            <button
              key={option.value}
              onClick={function() { handleSelect(option.value); }}
              className={'w-full p-4 rounded-2xl text-left transition-all border-2 ' +
                (isSelected 
                  ? 'bg-[#F0F0FF] border-[#A996FF]' 
                  : 'bg-white border-transparent hover:bg-[#F5F5F5]')}
            >
              <div className="flex items-center gap-3">
                <div className={'w-12 h-12 rounded-xl flex items-center justify-center ' +
                  (isSelected ? 'bg-[#A996FF]' : 'bg-[#F5F5F5]')}>
                  <IconComponent 
                    size={24} 
                    className={isSelected ? 'text-white' : 'text-[#666666]'} 
                  />
                </div>
                <div>
                  <p className={'font-semibold ' + (isSelected ? 'text-[#A996FF]' : 'text-[#1A1A1A]')}>
                    {option.label}
                  </p>
                  <p className="text-sm text-[#999999]">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* CTA */}
      <button
        onClick={handleNext}
        disabled={!selectedDirection}
        className={'w-full py-4 rounded-2xl font-semibold text-lg transition-colors mt-8 ' +
          (selectedDirection 
            ? 'bg-[#A996FF] text-white hover:bg-[#8B7BE8]' 
            : 'bg-[#E5E5E5] text-[#999999]')}
      >
        다음
      </button>
    </div>
  );
}
