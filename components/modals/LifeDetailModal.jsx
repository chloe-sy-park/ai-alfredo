import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, Clock, Calendar, Plus } from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

const LifeDetailModal = ({ item, type, onClose, onSave, onDelete, medications, onTakeMed }) => {
  const isNew = !item;
  const [editMode, setEditMode] = useState(isNew);
  const [editData, setEditData] = useState(item || getDefaultData(type));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // 타입별 기본 데이터
  function getDefaultData(t) {
    switch(t) {
      case 'medication':
        return { name: '', icon: '💊', time: 'morning', scheduledTime: '08:00', note: '', category: 'supplement', critical: false };
      case 'reminder':
        return { title: '', icon: '📌', dDay: 0, note: '', critical: false };
      case 'upcoming':
        return { title: '', icon: '📅', date: '', note: '' };
      case 'dontForget':
        return { title: '', icon: '💡', date: '', amount: '', note: '', critical: false };
      case 'relationship':
        return { name: '', icon: '👤', lastContact: 0, suggestion: '연락해보기' };
      case 'routine':
        return { name: '', icon: '💪', target: 1, current: 0, unit: '회', streak: 0 };
      default:
        return {};
    }
  }
  
  const hour = new Date().getHours();
  const getCurrentTimeSlot = () => {
    if (hour < 10) return 'morning';
    if (hour < 15) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  };
  const currentTimeSlot = getCurrentTimeSlot();
  
  // 아이콘 옵션들
  const iconOptions = {
    medication: ['💊', '💉', '🩹', '🧴', '🌿', '🔬'],
    reminder: ['📌', '⚠️', '💰', '🏠', '👨‍👩‍👧', '📋', '🎯', '🔔'],
    upcoming: ['📅', '🎂', '🎉', '✈️', '🏥', '🎓', '💼', '🍽️'],
    dontForget: ['💡', '💳', '📄', '🔑', '📦', '💸', '🧾', '🏦'],
    relationship: ['👤', '👩', '👨', '👴', '👵', '👶', '🐕', '❤️'],
    routine: ['💪', '🏃', '💧', '📖', '🧘', '🛌', '🥗', '☕'],
  };
  
  const getTypeConfig = () => {
    switch(type) {
      case 'medicationList':
        return { title: '오늘의 복용', icon: '💊', fields: [], color: 'lavender' };
      case 'medication':
        return { title: isNew ? '약/영양제 추가' : '약/영양제', icon: '💊', fields: ['name', 'time', 'scheduledTime', 'note', 'category'], color: 'lavender' };
      case 'reminder':
        return { title: isNew ? '챙길 것 추가' : '챙길 것', icon: '📌', fields: ['title', 'dDay', 'note', 'category'], color: 'lavender' };
      case 'upcoming':
        return { title: isNew ? '일정 추가' : '다가오는 일정', icon: '📅', fields: ['title', 'date', 'note', 'category'], color: 'blue' };
      case 'dontForget':
        return { title: isNew ? '잊지 말 것 추가' : '잊지 말 것', icon: '💡', fields: ['title', 'date', 'amount', 'note'], color: 'lavender' };
      case 'relationship':
        return { title: isNew ? '관계 추가' : '관계 챙기기', icon: '💕', fields: ['name', 'lastContact', 'suggestion'], color: 'lavender' };
      case 'routine':
        return { title: isNew ? '루틴 추가' : '루틴 관리', icon: '🔄', fields: ['name', 'target', 'unit'], color: 'emerald' };
      default:
        return { title: '상세', icon: '📋', fields: [], color: 'gray' };
    }
  };
  
  const config = getTypeConfig();
  
  const timeOptions = [
    { value: 'morning', label: '아침 (07:00-09:00)' },
    { value: 'afternoon', label: '점심 (12:00-14:00)' },
    { value: 'evening', label: '저녁 (18:00-20:00)' },
    { value: 'night', label: '취침 전 (21:00-23:00)' },
  ];
  
  const categoryOptions = {
    medication: [
      { value: 'prescription', label: '처방약' },
      { value: 'supplement', label: '영양제' },
    ],
    reminder: [
      { value: 'money', label: '💰 돈' },
      { value: 'family', label: '👨‍👩‍👧 가족' },
      { value: 'home', label: '🏠 가정' },
      { value: 'admin', label: '📋 행정' },
      { value: 'personal', label: '🎯 개인' },
    ],
  };
  
  const handleSave = () => {
    onSave(editData);
    setEditMode(false);
  };
  
  const handleDelete = () => {
    onDelete(item?.id);
    setShowDeleteConfirm(false);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full sm:w-[420px] max-h-[85vh] bg-white rounded-t-3xl sm:rounded-xl overflow-hidden animate-slideUp">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r from-${config.color}-100 to-${config.color}-50 border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item?.icon || config.icon}</span>
              <div>
                <h2 className="font-bold text-gray-800">{editMode ? '수정하기' : config.title}</h2>
                {!editMode && item?.name && <p className="text-sm text-gray-500">{item.name || item.title}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {type === 'medicationList' ? (
            // 약 목록 모드
            <div className="space-y-4">
              {timeSlots.map(slot => {
                const slotMeds = medications?.filter(m => m.time === slot.key) || [];
                if (slotMeds.length === 0) return null;
                
                const allTaken = slotMeds.every(m => m.taken);
                const isCurrentSlot = currentTimeSlot === slot.key;
                
                return (
                  <div 
                    key={slot.key}
                    className={`rounded-xl p-3 transition-all ${
                      isCurrentSlot && !allTaken 
                        ? 'bg-[#F5F3FF] ring-2 ring-[#C4B5FD]' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{slot.icon}</span>
                        <span className="font-bold text-gray-700">{slot.label}</span>
                        <span className="text-xs text-gray-400">{slot.timeRange}</span>
                      </div>
                      {allTaken && <span className="text-emerald-500 text-sm font-medium">✓ 완료</span>}
                      {isCurrentSlot && !allTaken && (
                        <span className="text-xs px-2 py-0.5 bg-[#DDD6FE] text-[#7C3AED] rounded-full font-semibold">지금</span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {slotMeds.map(med => (
                        <div 
                          key={med.id}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                            med.taken 
                              ? 'bg-emerald-50' 
                              : med.critical
                                ? 'bg-red-50 border border-red-200'
                                : 'bg-white border border-gray-100'
                          }`}
                        >
                          <button
                            onClick={() => !med.taken && onTakeMed(med.id)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              med.taken 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-gray-200 hover:bg-[#DDD6FE]'
                            }`}
                          >
                            {med.taken && <span className="text-sm">✓</span>}
                          </button>
                          <span className="text-lg">{med.icon}</span>
                          <div className="flex-1">
                            <p className={`font-medium ${med.taken ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                              {med.name}
                            </p>
                            <p className="text-[11px] text-gray-400">{med.scheduledTime} · {med.note}</p>
                          </div>
                          {med.critical && !med.taken && (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">중요</span>
                          )}
                          {med.taken && (
                            <span className="text-xs text-emerald-500">{med.takenAt}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !editMode ? (
            // 상세 보기 모드
            <div className="space-y-4">
              {type === 'medication' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">복용 시간</span>
                      <span className="font-semibold text-gray-800">{item?.timeLabel} ({item?.scheduledTime})</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">종류</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item?.category === 'prescription' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item?.category === 'prescription' ? '처방약' : '영양제'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">오늘 복용</span>
                      <span className={`font-semibold ${item?.taken ? 'text-emerald-600' : 'text-[#A996FF]500'}`}>
                        {item?.taken ? `✓ ${item.takenAt}에 복용` : '아직 안 함'}
                      </span>
                    </div>
                  </div>
                  {item?.note && (
                    <div className="bg-[#F5F3FF] rounded-xl p-3">
                      <p className="text-sm text-[#7C6CD6]">💡 {item.note}</p>
                    </div>
                  )}
                  {item?.critical && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-sm text-red-600 font-medium">⚠️ 중요한 약입니다. 꼭 챙겨드세요!</p>
                    </div>
                  )}
                </>
              )}
              
              {type === 'reminder' && (
                <>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">D-Day</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        item?.dDay === 0 ? 'bg-red-500 text-white' : 
                        item?.dDay === 1 ? 'bg-[#A996FF]500 text-white' : 'bg-[#EDE9FE] text-[#7C6CD6]'
                      }`}>
                        {item?.dDay === 0 ? '오늘' : item?.dDay === 1 ? '내일' : `D-${item?.dDay}`}
                      </span>
                    </div>
                    {item?.note && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">메모</span>
                        <span className="text-gray-700">{item.note}</span>
                      </div>
                    )}
                  </div>
                  {item?.critical && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-sm text-red-600 font-medium">⚠️ 안 하면 큰일나요!</p>
                    </div>
                  )}
                </>
              )}
              
              {type === 'upcoming' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">날짜</span>
                    <span className="font-semibold text-gray-800">{item?.date}</span>
                  </div>
                  {item?.note && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">장소/메모</span>
                      <span className="text-gray-700">{item.note}</span>
                    </div>
                  )}
                </div>
              )}
              
              {type === 'dontForget' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">날짜</span>
                    <span className="font-semibold text-gray-800">{item?.date}</span>
                  </div>
                  {item?.amount && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">금액</span>
                      <span className="font-bold text-gray-800">{item.amount}</span>
                    </div>
                  )}
                  {item?.note && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">메모</span>
                      <span className="text-gray-700">{item.note}</span>
                    </div>
                  )}
                </div>
              )}
              
              {type === 'relationship' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">마지막 연락</span>
                    <span className="font-semibold text-gray-800">{item?.lastContact}일 전</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">추천 행동</span>
                    <span className="text-[#8B7CF7] font-medium">{item?.suggestion}</span>
                  </div>
                </div>
              )}
              
              {type === 'routine' && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">오늘 진행</span>
                    <span className="font-bold text-gray-800">{item?.current || 0} / {item?.target || 1}{item?.unit || '회'}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(((item?.current || 0) / (item?.target || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">연속 달성</span>
                    <span className="font-medium text-[#A996FF]500">🔥 {item?.streak || 0}일</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 수정 모드
            <div className="space-y-4">
              {/* 아이콘 선택 */}
              {(iconOptions[type] || (type === 'medicationList' && iconOptions['medication'])) && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">아이콘</label>
                  <div className="flex flex-wrap gap-2">
                    {(iconOptions[type] || iconOptions['medication']).map(icon => (
                      <button
                        key={icon}
                        onClick={() => setEditData({...editData, icon})}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                          editData.icon === icon 
                            ? 'bg-[#EDE9FE] ring-2 ring-[#A996FF] scale-110' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 이름/제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {(type === 'medication' || type === 'medicationList') ? '약 이름' : type === 'relationship' ? '이름' : type === 'routine' ? '루틴 이름' : '제목'}
                </label>
                <input
                  type="text"
                  value={editData.name || editData.title || ''}
                  onChange={(e) => setEditData({...editData, [type === 'relationship' || type === 'medication' || type === 'medicationList' || type === 'routine' ? 'name' : 'title']: e.target.value})}
                  placeholder={type === 'routine' ? '예: 물 마시기' : (type === 'medication' || type === 'medicationList') ? '예: 비타민 D' : ''}
                  className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#DDD6FE]"
                />
              </div>
              
              {/* 약 관련 필드 */}
              {(type === 'medication' || type === 'medicationList') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">복용 시간대</label>
                    <select
                      value={editData.time || 'morning'}
                      onChange={(e) => setEditData({...editData, time: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    >
                      {timeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">정확한 시간</label>
                    <input
                      type="time"
                      value={editData.scheduledTime || '08:00'}
                      onChange={(e) => setEditData({...editData, scheduledTime: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">종류</label>
                    <div className="flex gap-2">
                      {categoryOptions.medication.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setEditData({...editData, category: opt.value})}
                          className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all ${
                            editData.category === opt.value 
                              ? 'bg-[#EDE9FE] text-[#7C3AED] ring-2 ring-[#C4B5FD]' 
                              : 'bg-gray-50 text-gray-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              {/* 챙길 것 (reminder) - D-Day */}
              {type === 'reminder' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">D-Day (며칠 후)</label>
                  <input
                    type="number"
                    min="0"
                    value={editData.dDay || 0}
                    onChange={(e) => setEditData({...editData, dDay: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = 오늘, 1 = 내일</p>
                </div>
              )}
              
              {/* 다가오는 일정 (upcoming) - 날짜 */}
              {type === 'upcoming' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">날짜</label>
                  <input
                    type="text"
                    value={editData.date || ''}
                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                    placeholder="예: 12/25 (수)"
                    className="w-full p-3 bg-gray-50 rounded-xl border-none"
                  />
                </div>
              )}
              
              {/* 잊지 말 것 (dontForget) - 날짜, 금액 */}
              {type === 'dontForget' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">날짜</label>
                    <input
                      type="text"
                      value={editData.date || ''}
                      onChange={(e) => setEditData({...editData, date: e.target.value})}
                      placeholder="예: 매월 25일"
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">금액 (선택)</label>
                    <input
                      type="text"
                      value={editData.amount || ''}
                      onChange={(e) => setEditData({...editData, amount: e.target.value})}
                      placeholder="예: 50,000원"
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="critical"
                      checked={editData.critical || false}
                      onChange={(e) => setEditData({...editData, critical: e.target.checked})}
                      className="w-5 h-5 rounded text-red-500"
                    />
                    <label htmlFor="critical" className="text-sm text-gray-600">⚠️ 중요 (안 하면 큰일)</label>
                  </div>
                </>
              )}
              
              {/* 관계 (relationship) - 마지막 연락, 추천 행동 */}
              {type === 'relationship' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">마지막 연락 (며칠 전)</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.lastContact || 0}
                      onChange={(e) => setEditData({...editData, lastContact: parseInt(e.target.value) || 0})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">추천 행동</label>
                    <select
                      value={editData.suggestion || '연락해보기'}
                      onChange={(e) => setEditData({...editData, suggestion: e.target.value})}
                      className="w-full p-3 bg-gray-50 rounded-xl border-none"
                    >
                      <option value="연락해보기">연락해보기</option>
                      <option value="밥 한번!">밥 한번!</option>
                      <option value="안부 전해요">안부 전해요</option>
                      <option value="선물하기">선물하기</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* 루틴 (routine) - 목표, 단위 */}
              {type === 'routine' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">목표</label>
                      <input
                        type="number"
                        min="1"
                        value={editData.target || 1}
                        onChange={(e) => setEditData({...editData, target: parseInt(e.target.value) || 1})}
                        className="w-full p-3 bg-gray-50 rounded-xl border-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">단위</label>
                      <select
                        value={editData.unit || '회'}
                        onChange={(e) => setEditData({...editData, unit: e.target.value})}
                        className="w-full p-3 bg-gray-50 rounded-xl border-none"
                      >
                        <option value="회">회</option>
                        <option value="잔">잔</option>
                        <option value="분">분</option>
                        <option value="페이지">페이지</option>
                        <option value="km">km</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              
              {/* 메모 (루틴 제외) */}
              {type !== 'routine' && type !== 'relationship' && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">메모</label>
                  <textarea
                    value={editData.note || ''}
                    onChange={(e) => setEditData({...editData, note: e.target.value})}
                    placeholder="추가 메모..."
                    className="w-full p-3 bg-gray-50 rounded-xl border-none resize-none h-20"
                  />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-10">
            <div className="bg-white border border-[#E8E3FF] rounded-xl p-6 w-full max-w-[300px] text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">삭제하시겠어요?</h3>
              <p className="text-sm text-gray-500 mb-4">이 작업은 되돌릴 수 없어요.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {type === 'medicationList' ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditData(getDefaultData('medication'));
                  setEditMode(true);
                }}
                className="flex-1 py-3 bg-[#EDE9FE] text-[#7C6CD6] rounded-xl font-semibold hover:bg-[#DDD6FE] transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} /> 약/영양제 추가
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#A996FF] text-white rounded-xl font-semibold hover:bg-[#8B7CF7] transition-colors"
              >
                닫기
              </button>
            </div>
          ) : !editMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="py-3 px-4 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#F5F3FF]0 text-white rounded-xl font-semibold hover:bg-[#8B7CF7] transition-colors"
              >
                닫기
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-[#F5F3FF]0 text-white rounded-xl font-semibold"
              >
                저장
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === Life Page ===

export default LifeDetailModal;
