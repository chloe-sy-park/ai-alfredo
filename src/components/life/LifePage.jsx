import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, Pill, Moon, Sun, Droplet, 
  ChevronRight, Plus, CheckCircle2, Clock, Calendar, Target, Circle
} from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

// Data
import { 
  mockHealthCheck, mockMedications, mockRelationships, 
  mockLifeReminders, mockRoutines
} from '../../data/mockData';

// Other Components
import LifeDetailModal from '../modals/LifeDetailModal';

var LifePage = function(props) {
  var mood = props.mood;
  var setMood = props.setMood;
  var energy = props.energy;
  var setEnergy = props.setEnergy;
  var onOpenChat = props.onOpenChat;
  var darkMode = props.darkMode || false;
  
  // localStorage 키
  var LIFE_STORAGE_KEYS = {
    medications: 'lifebutler_medications',
    routines: 'lifebutler_life_routines',
    lifeTop3: 'lifebutler_lifeTop3',
    upcomingItems: 'lifebutler_upcomingItems',
    dontForgetItems: 'lifebutler_dontForgetItems',
    relationshipItems: 'lifebutler_relationshipItems',
    healthCheck: 'lifebutler_healthCheck',
  };
  
  // 초기값 로드 함수
  var loadFromStorage = function(key, defaultValue) {
    try {
      var saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  var journalTextState = useState('');
  var journalText = journalTextState[0];
  var setJournalText = journalTextState[1];
  
  var journalSavedState = useState(false);
  var journalSaved = journalSavedState[0];
  var setJournalSaved = journalSavedState[1];
  
  var checkedItemsState = useState([]);
  var checkedItems = checkedItemsState[0];
  var setCheckedItems = checkedItemsState[1];
  
  var healthCheckState = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.healthCheck, mockHealthCheck); });
  var healthCheck = healthCheckState[0];
  var setHealthCheck = healthCheckState[1];
  
  var medicationsState = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.medications, mockMedications); });
  var medications = medicationsState[0];
  var setMedications = medicationsState[1];
  
  // 모달 상태
  var modalOpenState = useState(false);
  var modalOpen = modalOpenState[0];
  var setModalOpen = modalOpenState[1];
  
  var modalItemState = useState(null);
  var modalItem = modalItemState[0];
  var setModalItem = modalItemState[1];
  
  var modalTypeState = useState(null);
  var modalType = modalTypeState[0];
  var setModalType = modalTypeState[1];
  
  // 데이터 상태
  var lifeTop3State = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.lifeTop3, mockLifeReminders.todayTop3 || []); });
  var lifeTop3 = lifeTop3State[0];
  var setLifeTop3 = lifeTop3State[1];
  
  var upcomingItemsState = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.upcomingItems, mockLifeReminders.upcoming || []); });
  var upcomingItems = upcomingItemsState[0];
  var setUpcomingItems = upcomingItemsState[1];
  
  var dontForgetItemsState = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.dontForgetItems, mockLifeReminders.dontForget || []); });
  var dontForgetItems = dontForgetItemsState[0];
  var setDontForgetItems = dontForgetItemsState[1];
  
  var relationshipItemsState = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.relationshipItems, mockLifeReminders.relationships || []); });
  var relationshipItems = relationshipItemsState[0];
  var setRelationshipItems = relationshipItemsState[1];
  
  var routinesState = useState(function() { return loadFromStorage(LIFE_STORAGE_KEYS.routines, mockRoutines || []); });
  var routines = routinesState[0];
  var setRoutines = routinesState[1];
  
  // localStorage 저장
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.medications, JSON.stringify(medications)); } catch (e) {}
  }, [medications]);
  
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.routines, JSON.stringify(routines)); } catch (e) {}
  }, [routines]);
  
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.lifeTop3, JSON.stringify(lifeTop3)); } catch (e) {}
  }, [lifeTop3]);
  
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.upcomingItems, JSON.stringify(upcomingItems)); } catch (e) {}
  }, [upcomingItems]);
  
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.dontForgetItems, JSON.stringify(dontForgetItems)); } catch (e) {}
  }, [dontForgetItems]);
  
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.relationshipItems, JSON.stringify(relationshipItems)); } catch (e) {}
  }, [relationshipItems]);
  
  useEffect(function() {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.healthCheck, JSON.stringify(healthCheck)); } catch (e) {}
  }, [healthCheck]);
  
  // 스타일
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  var textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  
  var hour = new Date().getHours();
  
  // 현재 시간대
  var getCurrentTimeSlot = function() {
    if (hour < 10) return 'morning';
    if (hour < 15) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  };
  var currentTimeSlot = getCurrentTimeSlot();
  
  // 약 복용 현황
  var currentMeds = medications.filter(function(m) { return m.time === currentTimeSlot; });
  var pendingMeds = currentMeds.filter(function(m) { return !m.taken; });
  var totalMeds = medications.length;
  var takenMeds = medications.filter(function(m) { return m.taken; }).length;
  
  // 모달 열기
  var openModal = function(item, type) {
    setModalItem(item);
    setModalType(type);
    setModalOpen(true);
  };
  
  // 모달에서 저장
  var handleModalSave = function(updatedItem) {
    switch(modalType) {
      case 'medication':
      case 'medicationList':
        if (modalItem) {
          setMedications(medications.map(function(m) { return m.id === updatedItem.id ? updatedItem : m; }));
        } else {
          setMedications(medications.concat([Object.assign({}, updatedItem, { id: 'med-' + Date.now() })]));
        }
        break;
      case 'reminder':
        if (modalItem) {
          setLifeTop3(lifeTop3.map(function(t) { return t.id === updatedItem.id ? updatedItem : t; }));
        } else {
          setLifeTop3(lifeTop3.concat([Object.assign({}, updatedItem, { id: 'lt-' + Date.now() })]));
        }
        break;
      case 'upcoming':
        if (modalItem) {
          setUpcomingItems(upcomingItems.map(function(u) { return u.id === updatedItem.id ? updatedItem : u; }));
        } else {
          setUpcomingItems(upcomingItems.concat([Object.assign({}, updatedItem, { id: 'up-' + Date.now() })]));
        }
        break;
      case 'dontForget':
        if (modalItem) {
          setDontForgetItems(dontForgetItems.map(function(d) { return d.id === updatedItem.id ? updatedItem : d; }));
        } else {
          setDontForgetItems(dontForgetItems.concat([Object.assign({}, updatedItem, { id: 'df-' + Date.now() })]));
        }
        break;
      case 'relationship':
        if (modalItem) {
          setRelationshipItems(relationshipItems.map(function(r) { return r.id === updatedItem.id ? updatedItem : r; }));
        } else {
          setRelationshipItems(relationshipItems.concat([Object.assign({}, updatedItem, { id: 'rel-' + Date.now() })]));
        }
        break;
      case 'routine':
        if (modalItem) {
          setRoutines(routines.map(function(r) { return r.id === updatedItem.id ? updatedItem : r; }));
        } else {
          setRoutines(routines.concat([Object.assign({}, updatedItem, { id: 'routine-' + Date.now() })]));
        }
        break;
    }
    setModalOpen(false);
  };
  
  // 모달에서 삭제
  var handleModalDelete = function(id) {
    switch(modalType) {
      case 'medication':
        setMedications(medications.filter(function(m) { return m.id !== id; }));
        break;
      case 'reminder':
        setLifeTop3(lifeTop3.filter(function(t) { return t.id !== id; }));
        break;
      case 'upcoming':
        setUpcomingItems(upcomingItems.filter(function(u) { return u.id !== id; }));
        break;
      case 'dontForget':
        setDontForgetItems(dontForgetItems.filter(function(d) { return d.id !== id; }));
        break;
      case 'relationship':
        setRelationshipItems(relationshipItems.filter(function(r) { return r.id !== id; }));
        break;
      case 'routine':
        setRoutines(routines.filter(function(r) { return r.id !== id; }));
        break;
    }
    setModalOpen(false);
  };
  
  // 약 복용 체크
  var handleTakeMed = function(medId) {
    var now = new Date();
    var timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    setMedications(medications.map(function(m) {
      return m.id === medId ? Object.assign({}, m, { taken: true, takenAt: timeStr }) : m;
    }));
  };
  
  var handleToggleItem = function(id) {
    setCheckedItems(function(prev) {
      return prev.includes(id) ? prev.filter(function(i) { return i !== id; }) : prev.concat([id]);
    });
  };
  
  var handleSaveJournal = function() {
    if (journalText.trim()) {
      setJournalSaved(true);
      setTimeout(function() { setJournalSaved(false); }, 2000);
    }
  };
  
  var getDDayText = function(dDay) {
    if (dDay === 0) return '오늘';
    if (dDay === 1) return '내일';
    return 'D-' + dDay;
  };
  
  var getDDayColor = function(dDay, critical) {
    if (critical || dDay === 0) return 'bg-red-500 text-white';
    if (dDay === 1) return 'bg-[#A996FF] text-white';
    if (dDay <= 3) return 'bg-[#EDE9FE] text-[#7C6CD6]';
    return 'bg-gray-100 text-gray-600';
  };
  
  return (
    <div className={"flex-1 overflow-y-auto " + (darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-[#FDF8F3] to-[#F5EDE4]') + " transition-colors duration-300"}>
      <div className="p-4 space-y-4 pb-32">
        
        {/* 헤더 */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className={"text-xl font-bold " + textPrimary}>나를 위한 시간</h1>
            <p className={textSecondary + " text-sm"}>건강, 루틴, 소중한 사람들</p>
          </div>
          <div className={"px-3 py-1.5 rounded-full text-sm " + (darkMode ? 'bg-gray-800' : 'bg-white/80')}>
            <span className="text-lg mr-1">{energy >= 70 ? '😊' : energy >= 40 ? '😐' : '😴'}</span>
            <span className={textSecondary}>{energy}%</span>
          </div>
        </div>
        
        {/* 건강 트래킹 (간소화) */}
        <div className={cardBg + "/90 backdrop-blur-xl rounded-2xl shadow-sm p-4 border " + borderColor}>
          <h3 className={"font-bold " + textPrimary + " mb-3 flex items-center gap-2"}>
            <span className="text-lg">💪</span> 오늘의 건강
          </h3>
          
          <div className="grid grid-cols-4 gap-3">
            {/* 수면 */}
            <button 
              onClick={function() { 
                var newHours = prompt('어젯밤 몇 시간 주무셨어요?', (healthCheck && healthCheck.sleep && healthCheck.sleep.hours) || '7');
                if (newHours) {
                  setHealthCheck(Object.assign({}, healthCheck, { sleep: Object.assign({}, (healthCheck && healthCheck.sleep) || {}, { hours: parseInt(newHours) }) }));
                }
              }}
              className={(darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50') + " rounded-xl p-3 text-center hover:scale-105 transition-all"}
            >
              <span className="text-2xl">💤</span>
              <p className={(darkMode ? 'text-indigo-300' : 'text-indigo-600') + " text-sm font-bold mt-1"}>
                {(healthCheck && healthCheck.sleep && healthCheck.sleep.hours) || 7}h
              </p>
              <p className={"text-[10px] " + textSecondary}>수면</p>
            </button>
            
            {/* 물 */}
            <button 
              onClick={function() { 
                setHealthCheck(Object.assign({}, healthCheck, { 
                  water: Object.assign({}, (healthCheck && healthCheck.water) || {}, { 
                    current: ((healthCheck && healthCheck.water && healthCheck.water.current) || 0) + 1 
                  }) 
                }));
              }}
              className={(darkMode ? 'bg-sky-900/30' : 'bg-sky-50') + " rounded-xl p-3 text-center hover:scale-105 transition-all"}
            >
              <span className="text-2xl">💧</span>
              <p className={(darkMode ? 'text-sky-300' : 'text-sky-600') + " text-sm font-bold mt-1"}>
                {(healthCheck && healthCheck.water && healthCheck.water.current) || 0}/{(healthCheck && healthCheck.water && healthCheck.water.target) || 8}
              </p>
              <p className={"text-[10px] " + textSecondary}>물 +1</p>
            </button>
            
            {/* 걸음 */}
            <div className={(darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50') + " rounded-xl p-3 text-center"}>
              <span className="text-2xl">🚶</span>
              <p className={(darkMode ? 'text-emerald-300' : 'text-emerald-600') + " text-sm font-bold mt-1"}>
                {(((healthCheck && healthCheck.steps && healthCheck.steps.current) || 0) / 1000).toFixed(1)}k
              </p>
              <p className={"text-[10px] " + textSecondary}>걸음</p>
            </div>
            
            {/* 약 */}
            <button 
              onClick={function() { openModal(null, 'medicationList'); }}
              className={((pendingMeds.length > 0) ? (darkMode ? 'bg-purple-900/50 ring-2 ring-purple-500' : 'bg-purple-100 ring-2 ring-purple-300') : (darkMode ? 'bg-purple-900/30' : 'bg-purple-50')) + " rounded-xl p-3 text-center hover:scale-105 transition-all"}
            >
              <span className="text-2xl">💊</span>
              <p className={(darkMode ? 'text-purple-300' : 'text-purple-600') + " text-sm font-bold mt-1"}>
                {takenMeds}/{totalMeds}
              </p>
              <p className={"text-[10px] " + (pendingMeds.length > 0 ? (darkMode ? 'text-purple-400 font-bold' : 'text-purple-600 font-bold') : textSecondary)}>
                {pendingMeds.length > 0 ? '지금!' : '약'}
              </p>
            </button>
          </div>
        </div>
        
        {/* 오늘의 루틴 */}
        <div className={cardBg + "/90 backdrop-blur-xl rounded-2xl shadow-sm p-4 border " + borderColor}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
              <span className="text-lg">🔄</span> 오늘의 루틴
            </h3>
            <button 
              onClick={function() { openModal(null, 'routine'); }}
              className={(darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600') + " w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80"}
            >
              +
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {routines.map(function(routine) {
              var completed = routine.current >= routine.target;
              
              return (
                <button 
                  key={routine.id}
                  onClick={function() { openModal(routine, 'routine'); }}
                  className={"p-3 rounded-xl text-center transition-all hover:scale-105 " + (
                    completed 
                      ? darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  )}
                >
                  <span className="text-2xl">{routine.icon}</span>
                  <p className={"text-xs font-bold mt-1 " + (completed ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : textSecondary)}>
                    {routine.current}/{routine.target}
                  </p>
                  {routine.streak > 0 && (
                    <p className="text-[10px] text-orange-500 font-medium">🔥{routine.streak}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* 오늘 꼭 챙길 것 */}
        <div className={cardBg + "/90 backdrop-blur-xl rounded-2xl shadow-sm p-4 border " + borderColor}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
              <span className="text-lg">📌</span> 오늘 꼭 챙길 것
            </h3>
            <button 
              onClick={function() { openModal(null, 'reminder'); }}
              className={(darkMode ? 'bg-[#A996FF]/30 text-[#A996FF]' : 'bg-[#EDE9FE] text-[#8B7CF7]') + " w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80"}
            >
              +
            </button>
          </div>
          
          <div className="space-y-2">
            {lifeTop3.map(function(item) {
              var isChecked = checkedItems.includes(item.id);
              return (
                <div 
                  key={item.id}
                  className={"flex items-center gap-3 p-3 rounded-xl transition-all " + (
                    isChecked 
                      ? (darkMode ? 'bg-gray-700 opacity-60' : 'bg-gray-50 opacity-60')
                      : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white hover:bg-gray-50') + " shadow-sm"
                  )}
                >
                  <button 
                    onClick={function() { handleToggleItem(item.id); }}
                    className={isChecked ? 'text-emerald-500' : 'text-[#A996FF]'}
                  >
                    {isChecked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <span className="text-xl">{item.icon}</span>
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={function() { openModal(item, 'reminder'); }}
                  >
                    <p className={"font-semibold " + (isChecked ? 'line-through ' + textSecondary : textPrimary)}>
                      {item.title}
                    </p>
                    {item.note && <p className={"text-xs " + textSecondary + " truncate"}>{item.note}</p>}
                  </div>
                  <span className={"text-[11px] px-2 py-1 rounded-full font-bold " + getDDayColor(item.dDay, item.critical)}>
                    {getDDayText(item.dDay)}
                  </span>
                </div>
              );
            })}
            
            {lifeTop3.length === 0 && (
              <p className={textSecondary + " text-center py-4 text-sm"}>오늘 챙길 것을 추가해보세요</p>
            )}
          </div>
        </div>
        
        {/* 다가오는 것 */}
        <div className={cardBg + "/90 backdrop-blur-xl rounded-2xl shadow-sm p-4 border " + borderColor}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
              <span className="text-lg">📅</span> 다가오는 것
            </h3>
            <button 
              onClick={function() { openModal(null, 'upcoming'); }}
              className={(darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600') + " w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80"}
            >
              +
            </button>
          </div>
          
          <div className="space-y-2">
            {upcomingItems.map(function(item) {
              return (
                <div 
                  key={item.id} 
                  onClick={function() { openModal(item, 'upcoming'); }}
                  className={"flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all " + (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100')}
                >
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className={"font-medium " + textPrimary}>{item.title}</p>
                    {item.note && <p className={"text-xs " + textSecondary}>{item.note}</p>}
                  </div>
                  <span className={"text-xs px-2 py-1 rounded-full font-medium " + (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600')}>
                    {item.date}
                  </span>
                </div>
              );
            })}
            
            {upcomingItems.length === 0 && (
              <p className={textSecondary + " text-center py-4 text-sm"}>예정된 일정이 없어요</p>
            )}
          </div>
          
          {/* 잊지 말 것 */}
          {dontForgetItems.length > 0 && (
            <>
              <div className="flex items-center gap-2 my-3">
                <div className={"flex-1 h-px " + (darkMode ? 'bg-gray-700' : 'bg-gray-200')} />
                <span className={"text-xs " + textSecondary}>💡 잊지 마세요</span>
                <div className={"flex-1 h-px " + (darkMode ? 'bg-gray-700' : 'bg-gray-200')} />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {dontForgetItems.map(function(item) {
                  return (
                    <div 
                      key={item.id} 
                      onClick={function() { openModal(item, 'dontForget'); }}
                      className={"p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] " + (
                        item.critical 
                          ? (darkMode ? 'bg-red-900/30 border border-red-800' : 'bg-red-50 border border-red-100')
                          : (darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100')
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{item.icon}</span>
                        <span className={"text-xs " + textSecondary}>{item.date}</span>
                      </div>
                      <p className={"text-sm font-medium " + (item.critical ? (darkMode ? 'text-red-400' : 'text-red-700') : textPrimary)}>
                        {item.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        {/* 관계 챙기기 */}
        <div className={cardBg + "/90 backdrop-blur-xl rounded-2xl shadow-sm p-4 border " + borderColor}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={"font-bold " + textPrimary + " flex items-center gap-2"}>
              <span className="text-lg">💕</span> 연락할 때 됐어요
            </h3>
            <button 
              onClick={function() { openModal(null, 'relationship'); }}
              className={(darkMode ? 'bg-pink-900/30 text-pink-400' : 'bg-pink-100 text-pink-600') + " w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80"}
            >
              +
            </button>
          </div>
          
          <div className="space-y-2">
            {relationshipItems.filter(function(r) { return r.lastContact >= 7; }).map(function(person) {
              return (
                <div 
                  key={person.id} 
                  onClick={function() { openModal(person, 'relationship'); }}
                  className={"flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all " + (darkMode ? 'bg-pink-900/20 hover:bg-pink-900/30' : 'bg-pink-50/50 hover:bg-pink-100/50')}
                >
                  <span className="text-2xl">{person.icon}</span>
                  <div className="flex-1">
                    <p className={"font-medium " + textPrimary}>{person.name}</p>
                    <p className={"text-xs " + textSecondary}>{person.lastContact}일 전 연락</p>
                  </div>
                  <span className={"px-3 py-1.5 rounded-full text-xs font-semibold " + (darkMode ? 'bg-pink-900/50 text-pink-300' : 'bg-pink-100 text-pink-600')}>
                    {person.suggestion}
                  </span>
                </div>
              );
            })}
            
            {relationshipItems.filter(function(r) { return r.lastContact >= 7; }).length === 0 && (
              <p className={textSecondary + " text-center py-4 text-sm"}>모두 최근에 연락했어요 👍</p>
            )}
          </div>
        </div>
        
        {/* 오늘 하루 기록 */}
        <div className={cardBg + "/90 backdrop-blur-xl rounded-2xl shadow-sm p-4 border " + borderColor}>
          <h3 className={"font-bold " + textPrimary + " mb-3 flex items-center gap-2"}>
            <span className="text-lg">📝</span> 오늘 하루 기록
          </h3>
          
          <textarea
            value={journalText}
            onChange={function(e) { setJournalText(e.target.value); }}
            placeholder="오늘 하루는 어땠나요? 감사한 일, 기억하고 싶은 것..."
            className={"w-full h-24 p-3 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 " + (
              darkMode 
                ? 'bg-gray-700 text-gray-200 placeholder:text-gray-500 focus:ring-gray-600' 
                : 'bg-[#F5F3FF]/50 text-gray-700 placeholder:text-[#C4B5FD] focus:ring-[#DDD6FE]'
            )}
          />
          
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveJournal}
              disabled={!journalText.trim()}
              className={"px-4 py-2 rounded-xl text-sm font-bold transition-all " + (
                journalText.trim()
                  ? 'bg-[#A996FF] text-white shadow-md active:scale-95'
                  : (darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-300')
              )}
            >
              {journalSaved ? '✓ 저장됨' : '저장하기'}
            </button>
          </div>
        </div>
        
      </div>
      
      {/* Life Detail Modal */}
      {modalOpen && (
        <LifeDetailModal
          item={modalItem}
          type={modalType}
          onClose={function() { setModalOpen(false); }}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          medications={medications}
          onTakeMed={handleTakeMed}
        />
      )}
    </div>
  );
};

export default LifePage;
