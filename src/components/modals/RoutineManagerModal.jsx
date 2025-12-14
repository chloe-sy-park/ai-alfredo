import React, { useState } from 'react';
import { X, Plus, CheckCircle2, Trash2, ChevronRight, Clock, Calendar, Flame } from 'lucide-react';

// 루틴 템플릿 상수
const ROUTINE_TEMPLATES = {
  morning: {
    name: '🌅 모닝 루틴',
    description: '상쾌한 아침을 시작하세요',
    items: [
      { title: '기상', icon: '⏰', time: '07:00', duration: 5 },
      { title: '물 한 잔', icon: '💧', time: '07:05', duration: 2 },
      { title: '스트레칭', icon: '🧘', time: '07:10', duration: 10 },
      { title: '아침 식사', icon: '🍳', time: '07:30', duration: 20 },
      { title: '오늘 계획 확인', icon: '📋', time: '08:00', duration: 10 },
    ]
  },
  evening: {
    name: '🌙 이브닝 루틴',
    description: '편안한 마무리를 위해',
    items: [
      { title: '내일 준비', icon: '📝', time: '21:00', duration: 15 },
      { title: '디지털 디톡스', icon: '📵', time: '21:30', duration: 30 },
      { title: '명상/독서', icon: '📚', time: '22:00', duration: 20 },
      { title: '취침 준비', icon: '🌙', time: '22:30', duration: 15 },
    ]
  },
  workout: {
    name: '💪 운동 루틴',
    description: '건강한 몸을 위해',
    items: [
      { title: '워밍업', icon: '🔥', duration: 10 },
      { title: '본운동', icon: '🏋️', duration: 30 },
      { title: '쿨다운', icon: '🧊', duration: 10 },
      { title: '스트레칭', icon: '🧘', duration: 10 },
    ]
  },
  focus: {
    name: '🎯 집중 루틴',
    description: '딥워크를 위한 준비',
    items: [
      { title: '방해요소 제거', icon: '🔕', duration: 5 },
      { title: '목표 설정', icon: '🎯', duration: 5 },
      { title: '집중 세션', icon: '⚡', duration: 50 },
      { title: '휴식', icon: '☕', duration: 10 },
    ]
  }
};

const ROUTINE_ICONS = ['💧', '🏃', '🧘', '📚', '💪', '🍳', '☕', '🎯', '📝', '🌙', '⏰', '🔔', '💊', '🧹', '🌱', '🎨'];

const RoutineManagerModal = ({ 
  isOpen, 
  onClose, 
  routines = [], 
  onAddRoutine, 
  onUpdateRoutine, 
  onDeleteRoutine,
  onToggleRoutine,
  darkMode = false 
}) => {
  const [activeTab, setActiveTab] = useState('my'); // 'my', 'templates', 'add'
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [newRoutine, setNewRoutine] = useState({
    title: '',
    icon: '🎯',
    repeatType: 'daily', // daily, weekdays, weekly, custom
    repeatDays: [1, 2, 3, 4, 5], // 0=일, 1=월, ...
    time: '',
    target: 1,
    reminder: true,
  });
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  
  if (!isOpen) return null;
  
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 오늘의 루틴 완료율 계산
  const todayProgress = routines.length > 0 
    ? Math.round((routines.filter(r => r.current >= r.target).length / routines.length) * 100)
    : 0;
  
  // 루틴 추가/수정 핸들러
  const handleSaveRoutine = () => {
    if (!newRoutine.title.trim()) return;
    
    const routineData = {
      id: editingRoutine?.id || `routine-${Date.now()}`,
      ...newRoutine,
      current: editingRoutine?.current || 0,
      streak: editingRoutine?.streak || 0,
      history: editingRoutine?.history || [],
      createdAt: editingRoutine?.createdAt || new Date().toISOString(),
    };
    
    if (editingRoutine) {
      onUpdateRoutine?.(routineData);
    } else {
      onAddRoutine?.(routineData);
    }
    
    setNewRoutine({
      title: '',
      icon: '🎯',
      repeatType: 'daily',
      repeatDays: [1, 2, 3, 4, 5],
      time: '',
      target: 1,
      reminder: true,
    });
    setEditingRoutine(null);
    setActiveTab('my');
  };
  
  // 템플릿 적용
  const handleApplyTemplate = (templateKey) => {
    const template = ROUTINE_TEMPLATES[templateKey];
    if (!template) return;
    
    template.items.forEach((item, index) => {
      setTimeout(() => {
        onAddRoutine?.({
          id: `routine-${Date.now()}-${index}`,
          title: item.title,
          icon: item.icon,
          repeatType: 'daily',
          repeatDays: [0, 1, 2, 3, 4, 5, 6],
          time: item.time || '',
          target: 1,
          current: 0,
          streak: 0,
          history: [],
          reminder: true,
          templateGroup: templateKey,
          createdAt: new Date().toISOString(),
        });
      }, index * 100);
    });
    
    setActiveTab('my');
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-lg ${cardBg} rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col`}
      >
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-lg font-bold ${textPrimary}`}>🔄 루틴 관리</h2>
            <button onClick={onClose} className={`p-2 ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg`}>
              <X size={20} />
            </button>
          </div>
          
          {/* 진행률 바 */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className={textSecondary}>오늘 진행률</span>
              <span className="font-medium text-[#A996FF]">{todayProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
          </div>
          
          {/* 탭 */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            {[
              { id: 'my', label: '내 루틴', icon: '📋' },
              { id: 'templates', label: '템플릿', icon: '✨' },
              { id: 'add', label: '추가', icon: '➕' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-[#A996FF]'
                    : `${textSecondary}`
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 내 루틴 탭 */}
          {activeTab === 'my' && (
            <div className="space-y-3">
              {routines.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🌱</p>
                  <p className={`font-medium ${textPrimary} mb-1`}>아직 루틴이 없어요</p>
                  <p className={`text-sm ${textSecondary} mb-4`}>템플릿으로 시작하거나 직접 만들어보세요!</p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="px-4 py-2 bg-[#A996FF] text-white rounded-xl text-sm font-medium"
                  >
                    템플릿 보기
                  </button>
                </div>
              ) : (
                routines.map(routine => (
                  <div 
                    key={routine.id}
                    className={`${inputBg} rounded-xl p-3 ${routine.current >= routine.target ? 'ring-2 ring-emerald-400' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      {/* 아이콘 & 완료 버튼 */}
                      <button
                        onClick={() => onToggleRoutine?.(routine.id)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                          routine.current >= routine.target
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-white dark:bg-gray-600'
                        }`}
                      >
                        {routine.current >= routine.target ? '✅' : routine.icon}
                      </button>
                      
                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${textPrimary} truncate`}>{routine.title}</p>
                          {routine.streak >= 3 && (
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full">
                              🔥 {routine.streak}일
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs ${textSecondary}`}>
                            {routine.current}/{routine.target} 완료
                          </span>
                          {routine.time && (
                            <span className={`text-xs ${textSecondary}`}>• {routine.time}</span>
                          )}
                          <span className={`text-xs ${textSecondary}`}>
                            • {routine.repeatType === 'daily' ? '매일' : 
                               routine.repeatType === 'weekdays' ? '평일' : 
                               routine.repeatType === 'weekly' ? '매주' : '커스텀'}
                          </span>
                        </div>
                        
                        {/* 진행 바 */}
                        {routine.target > 1 && (
                          <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#A996FF] rounded-full transition-all"
                              style={{ width: `${Math.min((routine.current / routine.target) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* 액션 */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingRoutine(routine);
                            setNewRoutine(routine);
                            setActiveTab('add');
                          }}
                          className={`p-2 ${textSecondary} hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg`}
                        >
                          <Settings size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* 템플릿 탭 */}
          {activeTab === 'templates' && (
            <div className="space-y-3">
              {Object.entries(ROUTINE_TEMPLATES).map(([key, template]) => (
                <div 
                  key={key}
                  className={`${inputBg} rounded-xl p-4`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-bold ${textPrimary}`}>{template.name}</h3>
                      <p className={`text-xs ${textSecondary}`}>{template.description}</p>
                    </div>
                    <button
                      onClick={() => handleApplyTemplate(key)}
                      className="px-3 py-1.5 bg-[#A996FF] text-white text-xs font-medium rounded-lg hover:bg-[#8B7CF7] transition-colors"
                    >
                      적용하기
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {template.items.map((item, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-600 rounded-lg flex items-center gap-1"
                      >
                        {item.icon} {item.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 추가/수정 탭 */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <h3 className={`font-bold ${textPrimary}`}>
                {editingRoutine ? '루틴 수정' : '새 루틴 만들기'}
              </h3>
              
              {/* 아이콘 선택 */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>아이콘</label>
                <div className="flex flex-wrap gap-2">
                  {ROUTINE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewRoutine({ ...newRoutine, icon })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        newRoutine.icon === icon
                          ? 'bg-[#A996FF] ring-2 ring-[#A996FF] ring-offset-2'
                          : `${inputBg} hover:bg-gray-200 dark:hover:bg-gray-600`
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 제목 */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>루틴 이름</label>
                <input
                  type="text"
                  value={newRoutine.title}
                  onChange={e => setNewRoutine({ ...newRoutine, title: e.target.value })}
                  placeholder="예: 물 8잔 마시기"
                  className={`w-full px-4 py-3 ${inputBg} ${textPrimary} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]`}
                />
              </div>
              
              {/* 반복 설정 */}
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>반복</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'daily', label: '매일' },
                    { value: 'weekdays', label: '평일만' },
                    { value: 'weekly', label: '매주' },
                    { value: 'custom', label: '직접 선택' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setNewRoutine({ ...newRoutine, repeatType: opt.value })}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        newRoutine.repeatType === opt.value
                          ? 'bg-[#A996FF] text-white'
                          : `${inputBg} ${textSecondary}`
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                
                {/* 커스텀 요일 선택 */}
                {newRoutine.repeatType === 'custom' && (
                  <div className="flex gap-1 mt-3">
                    {weekDays.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const days = newRoutine.repeatDays.includes(idx)
                            ? newRoutine.repeatDays.filter(d => d !== idx)
                            : [...newRoutine.repeatDays, idx];
                          setNewRoutine({ ...newRoutine, repeatDays: days });
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          newRoutine.repeatDays.includes(idx)
                            ? 'bg-[#A996FF] text-white'
                            : `${inputBg} ${textSecondary}`
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 시간 & 목표 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>알림 시간 (선택)</label>
                  <input
                    type="time"
                    value={newRoutine.time}
                    onChange={e => setNewRoutine({ ...newRoutine, time: e.target.value })}
                    className={`w-full px-4 py-3 ${inputBg} ${textPrimary} rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A996FF]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>일일 목표</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, target: Math.max(1, newRoutine.target - 1) })}
                      className={`w-10 h-10 ${inputBg} rounded-lg flex items-center justify-center ${textSecondary}`}
                    >
                      <Minus size={16} />
                    </button>
                    <span className={`flex-1 text-center text-xl font-bold ${textPrimary}`}>{newRoutine.target}</span>
                    <button
                      onClick={() => setNewRoutine({ ...newRoutine, target: newRoutine.target + 1 })}
                      className={`w-10 h-10 ${inputBg} rounded-lg flex items-center justify-center ${textSecondary}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 알림 설정 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${textPrimary}`}>알림 받기</p>
                  <p className={`text-xs ${textSecondary}`}>설정한 시간에 알려드려요</p>
                </div>
                <button
                  onClick={() => setNewRoutine({ ...newRoutine, reminder: !newRoutine.reminder })}
                  className={`w-12 h-7 rounded-full transition-all ${
                    newRoutine.reminder ? 'bg-[#A996FF]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    newRoutine.reminder ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {/* 버튼 */}
              <div className="flex gap-2 pt-2">
                {editingRoutine && (
                  <button
                    onClick={() => {
                      onDeleteRoutine?.(editingRoutine.id);
                      setEditingRoutine(null);
                      setActiveTab('my');
                    }}
                    className="px-4 py-3 bg-red-100 text-red-600 rounded-xl font-medium"
                  >
                    삭제
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingRoutine(null);
                    setNewRoutine({
                      title: '',
                      icon: '🎯',
                      repeatType: 'daily',
                      repeatDays: [1, 2, 3, 4, 5],
                      time: '',
                      target: 1,
                      reminder: true,
                    });
                    setActiveTab('my');
                  }}
                  className={`flex-1 py-3 ${inputBg} ${textSecondary} rounded-xl font-medium`}
                >
                  취소
                </button>
                <button
                  onClick={handleSaveRoutine}
                  disabled={!newRoutine.title.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {editingRoutine ? '수정하기' : '추가하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 루틴 위젯 (홈페이지용)
const RoutineWidget = ({ routines = [], onToggle, onOpenManager, darkMode = false }) => {
  return null; // TODO: implement later
};

export { ROUTINE_TEMPLATES, ROUTINE_ICONS };
export { ROUTINE_TEMPLATES, ROUTINE_ICONS };
export default RoutineManagerModal;
