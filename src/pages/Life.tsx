import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Plus,
  Phone,
  Sparkles
} from 'lucide-react';
import { ConditionLevel, conditionConfig, getTodayCondition, setTodayCondition } from '../services/condition';
import { 
  getHabits, 
  addHabit, 
  getTodayHabitLog, 
  incrementHabit, 
  toggleHabitComplete,
  getTodayCompletionRate,
  getStreak,
  Habit,
  HabitLog
} from '../services/habits';
import {
  Relationship,
  addRelationship,
  recordContact,
  getDaysSinceContact,
  getNeedContactReminders,
  categoryLabels
} from '../services/relationships';

export default function Life() {
  var navigate = useNavigate();
  var [condition, setCondition] = useState<ConditionLevel | null>(null);
  var [habits, setHabits] = useState<Habit[]>([]);
  var [habitLogs, setHabitLogs] = useState<Record<string, HabitLog | null>>({});
  var [reminders, setReminders] = useState<Relationship[]>([]);
  var [completionRate, setCompletionRate] = useState(0);
  
  // 모달
  var [showAddHabit, setShowAddHabit] = useState(false);
  var [showAddRelation, setShowAddRelation] = useState(false);
  var [newHabitTitle, setNewHabitTitle] = useState('');
  var [newHabitIcon, setNewHabitIcon] = useState('✨');
  var [newRelationName, setNewRelationName] = useState('');
  var [newRelationCategory, setNewRelationCategory] = useState<'family' | 'friend' | 'work' | 'other'>('friend');

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    // 컨디션
    var todayCondition = getTodayCondition();
    if (todayCondition) {
      setCondition(todayCondition.level);
    }
    
    // 습관
    var allHabits = getHabits();
    setHabits(allHabits);
    
    // 습관 로그
    var logs: Record<string, HabitLog | null> = {};
    allHabits.forEach(function(h) {
      logs[h.id] = getTodayHabitLog(h.id);
    });
    setHabitLogs(logs);
    
    // 완료율
    setCompletionRate(getTodayCompletionRate());
    
    // 연락 리마인더
    setReminders(getNeedContactReminders());
  }

  function handleConditionSelect(level: ConditionLevel) {
    setTodayCondition(level);
    setCondition(level);
  }

  function handleHabitIncrement(habitId: string) {
    incrementHabit(habitId);
    loadData();
  }

  function handleHabitToggle(habitId: string) {
    toggleHabitComplete(habitId);
    loadData();
  }

  function handleAddHabit() {
    if (!newHabitTitle.trim()) return;
    addHabit({
      title: newHabitTitle,
      icon: newHabitIcon,
      frequency: 'daily',
      targetCount: 1
    });
    setNewHabitTitle('');
    setNewHabitIcon('✨');
    setShowAddHabit(false);
    loadData();
  }

  function handleAddRelation() {
    if (!newRelationName.trim()) return;
    addRelationship({
      name: newRelationName,
      emoji: '👤',
      category: newRelationCategory,
      reminderDays: 14
    });
    setNewRelationName('');
    setNewRelationCategory('friend');
    setShowAddRelation(false);
    loadData();
  }

  function handleRecordContact(id: string) {
    recordContact(id);
    loadData();
  }

  // 웰니스 팁
  var wellnessTips = [
    '오늘도 잘하고 있어요! 작은 성취도 축하해요 🎉',
    '충분한 수면은 최고의 생산성 도구예요 😴',
    '5분 스트레칭으로 몸과 마음을 리프레시하세요 🧘',
    '물 한 잔 마시고 잠시 쉬어가세요 💧',
    '당신은 충분히 잘하고 있어요. 믿어요! ✨'
  ];
  var randomTip = wellnessTips[Math.floor(Math.random() * wellnessTips.length)];

  var conditionLevels: ConditionLevel[] = ['great', 'good', 'normal', 'bad'];
  var habitIcons = ['✨', '💪', '📚', '🎯', '🧘', '🏃', '💧', '😴'];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={24} className="text-pink-500" />
            <h1 className="text-xl font-bold">라이프</h1>
          </div>
        </div>

        {/* 컨디션 상세 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">오늘 컨디션</h3>
          <div className="grid grid-cols-4 gap-2">
            {conditionLevels.map(function(level) {
              var info = conditionConfig[level];
              var isSelected = condition === level;
              return (
                <button
                  key={level}
                  onClick={function() { handleConditionSelect(level); }}
                  className={'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ' +
                    (isSelected
                      ? 'border-lavender-400 bg-lavender-50'
                      : 'border-gray-100 hover:border-gray-200')
                  }
                >
                  <span className="text-2xl">{info.emoji}</span>
                  <span className="text-xs font-medium text-gray-600">{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 습관 트래커 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">오늘의 습관</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-lavender-500 bg-lavender-50 px-2 py-1 rounded-full">
                {completionRate}% 달성
              </span>
              <button
                onClick={function() { setShowAddHabit(true); }}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {habits.map(function(habit) {
              var log = habitLogs[habit.id];
              var count = log ? log.count : 0;
              var isComplete = log ? log.completed : false;
              var streak = getStreak(habit.id);
              var progress = Math.min((count / habit.targetCount) * 100, 100);
              
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <button
                    onClick={function() { 
                      if (habit.targetCount === 1) {
                        handleHabitToggle(habit.id);
                      } else {
                        handleHabitIncrement(habit.id);
                      }
                    }}
                    className={'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ' +
                      (isComplete ? 'bg-green-100' : 'bg-gray-100')
                    }
                  >
                    {habit.icon}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{habit.title}</span>
                      {streak > 0 && (
                        <span className="text-xs text-orange-500">🔥 {streak}일</span>
                      )}
                    </div>
                    {habit.targetCount > 1 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-lavender-400 transition-all"
                            style={{ width: progress + '%' }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {count}/{habit.targetCount}{habit.unit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  {habit.targetCount > 1 && !isComplete && (
                    <button
                      onClick={function() { handleHabitIncrement(habit.id); }}
                      className="text-xs px-2 py-1 bg-lavender-100 text-lavender-600 rounded-full"
                    >
                      +1
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 관계 리마인더 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">연락할 사람</h3>
            <button
              onClick={function() { setShowAddRelation(true); }}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {reminders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              연락 리마인더가 없어요
            </p>
          ) : (
            <div className="space-y-2">
              {reminders.slice(0, 3).map(function(person) {
                var daysSince = getDaysSinceContact(person.id);
                return (
                  <div key={person.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                    <span className="text-2xl">{person.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-gray-400">
                        {daysSince}일 전 연락
                      </p>
                    </div>
                    <button
                      onClick={function() { handleRecordContact(person.id); }}
                      className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                    >
                      <Phone size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 웰니스 팁 */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="text-pink-500 flex-shrink-0" size={20} />
            <div>
              <p className="font-medium text-gray-800">알프레도의 한마디</p>
              <p className="text-sm text-gray-600 mt-1">{randomTip}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 습관 추가 모달 */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up">
            <h3 className="font-semibold text-lg mb-4">새 습관 추가</h3>
            
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">아이콘</label>
              <div className="flex gap-2 flex-wrap">
                {habitIcons.map(function(icon) {
                  return (
                    <button
                      key={icon}
                      onClick={function() { setNewHabitIcon(icon); }}
                      className={'w-10 h-10 rounded-full flex items-center justify-center text-lg ' +
                        (newHabitIcon === icon ? 'bg-lavender-100 ring-2 ring-lavender-400' : 'bg-gray-100')
                      }
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">습관 이름</label>
              <input
                type="text"
                value={newHabitTitle}
                onChange={function(e) { setNewHabitTitle(e.target.value); }}
                placeholder="예: 명상 10분"
                className="w-full p-3 border border-gray-200 rounded-xl"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={function() { setShowAddHabit(false); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddHabit}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl font-medium"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관계 추가 모달 */}
      {showAddRelation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up">
            <h3 className="font-semibold text-lg mb-4">연락처 추가</h3>
            
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">이름</label>
              <input
                type="text"
                value={newRelationName}
                onChange={function(e) { setNewRelationName(e.target.value); }}
                placeholder="이름 입력"
                className="w-full p-3 border border-gray-200 rounded-xl"
              />
            </div>
            
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-2 block">관계</label>
              <div className="flex gap-2">
                {(['family', 'friend', 'work', 'other'] as const).map(function(cat) {
                  return (
                    <button
                      key={cat}
                      onClick={function() { setNewRelationCategory(cat); }}
                      className={'flex-1 py-2 px-3 rounded-xl text-sm font-medium ' +
                        (newRelationCategory === cat
                          ? 'bg-lavender-100 text-lavender-600'
                          : 'bg-gray-100 text-gray-600')
                      }
                    >
                      {categoryLabels[cat]}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={function() { setShowAddRelation(false); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-medium"
              >
                취소
              </button>
              <button
                onClick={handleAddRelation}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl font-medium"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
