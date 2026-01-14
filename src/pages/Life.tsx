import { useState, useEffect } from 'react';
import { 
  Heart, 
  Droplets,
  Moon,
  Users,
  Sparkles,
  Plus,
  Check,
  Phone,
  X
} from 'lucide-react';
import { 
  Habit, 
  HabitLog,
  getHabits, 
  getTodayLogs,
  toggleHabitComplete,
  incrementHabit,
  getTodayCompletionRate,
  getStreak,
  addHabit
} from '../services/habits';
import { 
  Relationship,
  getRelationships,
  getNeedContactReminders,
  recordContact,
  addRelationship,
  categoryLabels
} from '../services/relationships';
import { 
  ConditionLevel, 
  getTodayCondition, 
  setTodayCondition,
  conditionConfig 
} from '../services/condition';

export default function Life() {
  var [habits, setHabits] = useState<Habit[]>([]);
  var [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  var [completionRate, setCompletionRate] = useState(0);
  var [reminders, setReminders] = useState<Array<Relationship & { daysSince: number }>>([]);
  var [currentCondition, setCurrentCondition] = useState<ConditionLevel | null>(null);
  
  // 모달 상태
  var [isAddingHabit, setIsAddingHabit] = useState(false);
  var [isAddingRelationship, setIsAddingRelationship] = useState(false);
  var [newHabitTitle, setNewHabitTitle] = useState('');
  var [newHabitIcon, setNewHabitIcon] = useState('✨');
  var [newRelName, setNewRelName] = useState('');
  var [newRelCategory, setNewRelCategory] = useState<'family' | 'friend' | 'work' | 'other'>('friend');

  useEffect(function() {
    loadData();
  }, []);

  function loadData() {
    setHabits(getHabits());
    setTodayLogs(getTodayLogs());
    setCompletionRate(getTodayCompletionRate());
    setReminders(getNeedContactReminders());
    
    var condition = getTodayCondition();
    if (condition) {
      setCurrentCondition(condition.level);
    }
  }

  function handleToggleHabit(habitId: string) {
    toggleHabitComplete(habitId);
    loadData();
  }

  function handleIncrementHabit(habitId: string) {
    incrementHabit(habitId);
    loadData();
  }

  function handleConditionChange(level: ConditionLevel) {
    setTodayCondition(level);
    setCurrentCondition(level);
  }

  function handleRecordContact(relId: string) {
    recordContact(relId);
    loadData();
  }

  function handleAddHabit() {
    if (!newHabitTitle.trim()) return;
    addHabit({
      title: newHabitTitle.trim(),
      icon: newHabitIcon,
      frequency: 'daily',
      targetCount: 1
    });
    setNewHabitTitle('');
    setNewHabitIcon('✨');
    setIsAddingHabit(false);
    loadData();
  }

  function handleAddRelationship() {
    if (!newRelName.trim()) return;
    addRelationship({
      name: newRelName.trim(),
      emoji: '👋',
      category: newRelCategory,
      reminderDays: 14
    });
    setNewRelName('');
    setNewRelCategory('friend');
    setIsAddingRelationship(false);
    loadData();
  }

  // 웰니스 팁
  function getWellnessTip(): string {
    var tips = [
      '오늘 하루도 충분히 잘하고 있어요 💜',
      '잠깐 스트레칭 해볼까요? 몸이 편해져요',
      '물 한 잔 마시고 가세요 💧',
      '숨 크게 쉬어보세요. 마음이 차분해져요',
      '오늘의 작은 성취를 인정해주세요 ✨'
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  var habitIcons = ['💧', '🏃', '😴', '📖', '🧘', '🥗', '☀️', '✨'];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-mobile mx-auto p-4 space-y-4">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-pink-400" size={24} />
            <h1 className="text-xl font-bold">라이프</h1>
          </div>
          <span className="text-2xl">🌿</span>
        </div>

        {/* 컨디션 상세 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-500 mb-3">💜 오늘의 컨디션</h2>
          
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(conditionConfig) as ConditionLevel[]).map(function(level) {
              var config = conditionConfig[level];
              var isSelected = currentCondition === level;
              return (
                <button
                  key={level}
                  onClick={function() { handleConditionChange(level); }}
                  className={
                    'flex flex-col items-center py-3 rounded-xl transition-all ' +
                    (isSelected 
                      ? 'bg-lavender-100 border-2 border-lavender-400' 
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100')
                  }
                >
                  <span className="text-2xl mb-1">{config.emoji}</span>
                  <span className="text-xs text-gray-600">{config.label}</span>
                </button>
              );
            })}
          </div>
          
          {currentCondition && (
            <p className="text-sm text-gray-500 mt-3 text-center">
              {conditionConfig[currentCondition].message}
            </p>
          )}
        </div>

        {/* 습관 트래커 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-400" />
              <h2 className="font-semibold">오늘의 습관</h2>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                {completionRate}%
              </span>
            </div>
            <button
              onClick={function() { setIsAddingHabit(true); }}
              className="p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {habits.map(function(habit) {
              var log = todayLogs.find(function(l) { return l.habitId === habit.id; });
              var isCompleted = log ? log.completed : false;
              var currentCount = log ? log.count : 0;
              var streak = getStreak(habit.id);
              
              return (
                <div 
                  key={habit.id}
                  className={
                    'flex items-center gap-3 p-3 rounded-xl transition-all ' +
                    (isCompleted ? 'bg-green-50' : 'bg-gray-50')
                  }
                >
                  <button
                    onClick={function() { handleToggleHabit(habit.id); }}
                    className={
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all ' +
                      (isCompleted 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white border-2 border-gray-200')
                    }
                  >
                    {isCompleted ? <Check size={16} /> : <span className="text-lg">{habit.icon}</span>}
                  </button>
                  
                  <div className="flex-1">
                    <p className={'text-sm ' + (isCompleted ? 'text-green-600' : 'text-gray-700')}>
                      {habit.title}
                    </p>
                    {habit.targetCount > 1 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-400 rounded-full transition-all"
                            style={{ width: Math.min(100, (currentCount / habit.targetCount) * 100) + '%' }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {currentCount}/{habit.targetCount}{habit.unit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {habit.targetCount > 1 && !isCompleted && (
                    <button
                      onClick={function() { handleIncrementHabit(habit.id); }}
                      className="px-3 py-1 bg-lavender-100 text-lavender-600 rounded-lg text-xs"
                    >
                      +1
                    </button>
                  )}
                  
                  {streak > 0 && (
                    <span className="text-xs text-orange-500">🔥 {streak}일</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 관계 리마인더 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              <h2 className="font-semibold">연락하기</h2>
            </div>
            <button
              onClick={function() { setIsAddingRelationship(true); }}
              className="p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {reminders.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">
              소중한 사람들을 등록해보세요
            </p>
          ) : (
            <div className="space-y-2">
              {reminders.slice(0, 3).map(function(rel) {
                return (
                  <div 
                    key={rel.id}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
                  >
                    <span className="text-2xl">{rel.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{rel.name}</p>
                      <p className="text-xs text-gray-500">
                        {rel.daysSince}일 전 마지막 연락
                      </p>
                    </div>
                    <button
                      onClick={function() { handleRecordContact(rel.id); }}
                      className="p-2 bg-blue-100 rounded-full text-blue-500 hover:bg-blue-200"
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
            <span className="text-2xl">🐧</span>
            <div>
              <p className="text-sm font-medium text-gray-700">알프레도의 한마디</p>
              <p className="text-sm text-gray-600 mt-1">{getWellnessTip()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 습관 추가 모달 */}
      {isAddingHabit && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4">습관 추가</h3>
            
            <div className="flex gap-2 mb-4 flex-wrap">
              {habitIcons.map(function(icon) {
                return (
                  <button
                    key={icon}
                    onClick={function() { setNewHabitIcon(icon); }}
                    className={
                      'w-10 h-10 rounded-xl flex items-center justify-center text-xl ' +
                      (newHabitIcon === icon ? 'bg-lavender-100 border-2 border-lavender-400' : 'bg-gray-100')
                    }
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
            
            <input
              type="text"
              value={newHabitTitle}
              onChange={function(e) { setNewHabitTitle(e.target.value); }}
              placeholder="습관 이름 (예: 물 8잔 마시기)"
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 outline-none focus:border-lavender-400"
              autoFocus
            />
            
            <div className="flex gap-2">
              <button
                onClick={function() { setIsAddingHabit(false); setNewHabitTitle(''); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleAddHabit}
                disabled={!newHabitTitle.trim()}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관계 추가 모달 */}
      {isAddingRelationship && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl p-6 w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4">소중한 사람 추가</h3>
            
            <input
              type="text"
              value={newRelName}
              onChange={function(e) { setNewRelName(e.target.value); }}
              placeholder="이름"
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 outline-none focus:border-lavender-400"
              autoFocus
            />
            
            <div className="flex gap-2 mb-4">
              {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map(function(cat) {
                return (
                  <button
                    key={cat}
                    onClick={function() { setNewRelCategory(cat); }}
                    className={
                      'flex-1 py-2 rounded-xl text-sm transition-colors ' +
                      (newRelCategory === cat 
                        ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                        : 'bg-gray-100 text-gray-500')
                    }
                  >
                    {categoryLabels[cat]}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={function() { setIsAddingRelationship(false); setNewRelName(''); }}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleAddRelationship}
                disabled={!newRelName.trim()}
                className="flex-1 py-3 bg-lavender-400 text-white rounded-xl disabled:opacity-50"
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
