import { useState, useEffect } from 'react';
import { Feather, Coffee, Footprints, Flower2, ChevronRight } from 'lucide-react';

interface Nudge {
  id: string;
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  action: string;
  time?: string;
}

export default function GentleNudge() {
  var [nudges] = useState<Nudge[]>([
    {
      id: '1',
      icon: Coffee,
      iconColor: 'text-brown-500',
      title: '잠깐의 휴식',
      description: '2시간 동안 집중했어요. 5분만 쉬어볼까요?',
      action: '타이머 시작',
      time: '지금'
    },
    {
      id: '2',
      icon: Footprints,
      iconColor: 'text-green-500',
      title: '가벼운 산책',
      description: '점심 후 10분 산책은 오후를 더 활기차게 만들어요',
      action: '알림 설정',
      time: '오후 1시'
    },
    {
      id: '3',
      icon: Flower2,
      iconColor: 'text-pink-500',
      title: '감사 일기',
      description: '오늘의 작은 감사 3가지를 기록해보세요',
      action: '작성하기',
      time: '저녁'
    }
  ]);

  var [currentNudge, setCurrentNudge] = useState(0);

  function handleNext() {
    setCurrentNudge((currentNudge + 1) % nudges.length);
  }

  var nudge = nudges[currentNudge];
  var Icon = nudge.icon;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Feather size={16} className="text-[#A996FF]" />
        <h3 className="font-semibold text-[#1A1A1A]">부드러운 넛지</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div className={`p-3 bg-[#F5F5F5] rounded-xl ${nudge.iconColor}`}>
            <Icon size={24} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-[#1A1A1A]">{nudge.title}</h4>
              {nudge.time && (
                <span className="text-xs text-[#999999]">{nudge.time}</span>
              )}
            </div>
            <p className="text-sm text-[#666666] mb-3">{nudge.description}</p>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-1.5 bg-[#F0F0FF] text-[#A996FF] text-sm rounded-full hover:bg-[#E5E5FF] transition-colors">
                {nudge.action}
              </button>
              <button className="text-[#999999] hover:text-[#666666] text-sm">
                나중에
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleNext}
            className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
          >
            <ChevronRight size={16} className="text-[#999999]" />
          </button>
        </div>
      </div>
      
      {/* 인디케이터 */}
      <div className="flex justify-center gap-1 mt-4">
        {nudges.map(function(_, index) {
          return (
            <button
              key={index}
              onClick={function() { setCurrentNudge(index); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                index === currentNudge ? 'bg-[#A996FF]' : 'bg-[#E5E5E5]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}