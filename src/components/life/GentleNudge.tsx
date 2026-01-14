import { useState, useEffect } from 'react';
import { Feather, Coffee, Footprints, Flower2, ChevronRight, Target, CheckCircle } from 'lucide-react';
import { getHabits, getTodayLogs, getStreak } from '../../services/habits';
import { getTodayCondition } from '../../services/condition';

interface Nudge {
  id: string;
  icon: any;
  iconColor: string;
  title: string;
  description: string;
  action: string;
  actionHandler?: () => void;
  time?: string;
}

export default function GentleNudge() {
  var [nudges, setNudges] = useState<Nudge[]>([]);
  var [currentNudge, setCurrentNudge] = useState(0);

  useEffect(function() {
    generateNudges();
  }, []);

  function generateNudges() {
    var newNudges: Nudge[] = [];
    
    // 습관 체크
    var habits = getHabits();
    var todayLogs = getTodayLogs();
    var incompleteHabits = habits.filter(function(habit) {
      var log = todayLogs.find(function(l) { return l.habitId === habit.id; });
      return !log || !log.completed;
    });
    
    if (incompleteHabits.length > 0) {
      var randomHabit = incompleteHabits[Math.floor(Math.random() * incompleteHabits.length)];
      var streak = getStreak(randomHabit.id);
      newNudges.push({
        id: 'habit_' + randomHabit.id,
        icon: Target,
        iconColor: 'text-[#A996FF]',
        title: randomHabit.title,
        description: streak > 0 
          ? `${streak}일 연속 달성중! 오늘도 이어가볼까요?` 
          : '오늘 시작해보는 건 어때요?',
        action: '체크하기',
        actionHandler: function() {
          // 습관 체크 로직
          window.location.href = '#habits';
        }
      });
    }
    
    // 컨디션 체크
    var todayCondition = getTodayCondition();
    if (!todayCondition) {
      newNudges.push({
        id: 'condition',
        icon: CheckCircle,
        iconColor: 'text-blue-500',
        title: '오늘 컨디션 체크',
        description: '오늘의 몸과 마음 상태를 기록해보세요',
        action: '기록하기',
        time: '아침'
      });
    }
    
    // 기본 넛지들
    var now = new Date();
    var hour = now.getHours();
    
    if (hour >= 10 && hour <= 11) {
      newNudges.push({
        id: 'water',
        icon: Coffee,
        iconColor: 'text-blue-500',
        title: '수분 보충',
        description: '물 한 잔으로 오전을 상쾌하게!',
        action: '완료',
        time: '지금'
      });
    }
    
    if (hour >= 14 && hour <= 15) {
      newNudges.push({
        id: 'walk',
        icon: Footprints,
        iconColor: 'text-green-500',
        title: '가벼운 산책',
        description: '점심 후 10분 산책은 오후를 더 활기차게 만들어요',
        action: '알림 설정',
        time: '오후'
      });
    }
    
    if (hour >= 20) {
      newNudges.push({
        id: 'gratitude',
        icon: Flower2,
        iconColor: 'text-pink-500',
        title: '감사 일기',
        description: '오늘의 작은 감사 3가지를 기록해보세요',
        action: '작성하기',
        time: '저녁'
      });
    }
    
    // 넛지가 없으면 기본 격려 메시지
    if (newNudges.length === 0) {
      newNudges.push({
        id: 'default',
        icon: Feather,
        iconColor: 'text-[#A996FF]',
        title: '잘하고 있어요!',
        description: '오늘도 한 걸음씩 나아가고 있네요. 화이팅!',
        action: '고마워요',
        time: '언제나'
      });
    }
    
    setNudges(newNudges);
  }

  function handleNext() {
    setCurrentNudge((currentNudge + 1) % nudges.length);
  }

  if (nudges.length === 0) return null;

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
              <button 
                onClick={nudge.actionHandler || function() {}}
                className="px-4 py-1.5 bg-[#F0F0FF] text-[#A996FF] text-sm rounded-full hover:bg-[#E5E5FF] transition-colors"
              >
                {nudge.action}
              </button>
              <button className="text-[#999999] hover:text-[#666666] text-sm">
                나중에
              </button>
            </div>
          </div>
          
          {nudges.length > 1 && (
            <button 
              onClick={handleNext}
              className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <ChevronRight size={16} className="text-[#999999]" />
            </button>
          )}
        </div>
      </div>
      
      {/* 인디케이터 */}
      {nudges.length > 1 && (
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
      )}
    </div>
  );
}