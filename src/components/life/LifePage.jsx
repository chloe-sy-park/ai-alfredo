import React, { useState } from 'react';
import { 
  ArrowLeft, Heart, Activity, Pill, Moon, Sun, Droplet, 
  ChevronRight, Plus, CheckCircle2, Clock, Calendar, Target
} from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

// Data
import { 
  mockHealthCheck, mockMedications, mockRelationships, 
  mockLifeReminders, mockPersonalSchedule 
} from '../../data/mockData';

// Other Components
import LifeDetailModal from '../modals/LifeDetailModal';

const LifePage = ({ mood, setMood, energy, setEnergy, onOpenChat, darkMode = false }) => {
  // localStorage 키
  const LIFE_STORAGE_KEYS = {
    medications: 'lifebutler_medications',
    routines: 'lifebutler_routines',
    lifeTop3: 'lifebutler_lifeTop3',
    upcomingItems: 'lifebutler_upcomingItems',
    dontForgetItems: 'lifebutler_dontForgetItems',
    relationshipItems: 'lifebutler_relationshipItems',
    healthCheck: 'lifebutler_healthCheck',
  };
  
  // 초기값 로드 함수
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);
  const [healthCheck, setHealthCheck] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.healthCheck, mockHealthCheck));
  const [medications, setMedications] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.medications, mockMedications));
  
  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  
  // 데이터 상태 (수정 가능하게) - localStorage에서 로드
  const [lifeTop3, setLifeTop3] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.lifeTop3, mockLifeReminders.todayTop3));
  const [upcomingItems, setUpcomingItems] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.upcomingItems, mockLifeReminders.upcoming));
  const [dontForgetItems, setDontForgetItems] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.dontForgetItems, mockLifeReminders.dontForget));
  const [relationshipItems, setRelationshipItems] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.relationshipItems, mockLifeReminders.relationships));
  const [routines, setRoutines] = useState(() => loadFromStorage(LIFE_STORAGE_KEYS.routines, mockRoutines));
  
  // 드래그앤드롭 상태
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [customTop3Order, setCustomTop3Order] = useState(null);
  
  // 🐧 알프레도 플로팅 메시지
  const [showAlfredo, setShowAlfredo] = useState(true);
  
  // localStorage 저장 (데이터 변경 시)
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.medications, JSON.stringify(medications)); } catch (e) {}
  }, [medications]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.routines, JSON.stringify(routines)); } catch (e) {}
  }, [routines]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.lifeTop3, JSON.stringify(lifeTop3)); } catch (e) {}
  }, [lifeTop3]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.upcomingItems, JSON.stringify(upcomingItems)); } catch (e) {}
  }, [upcomingItems]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.dontForgetItems, JSON.stringify(dontForgetItems)); } catch (e) {}
  }, [dontForgetItems]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.relationshipItems, JSON.stringify(relationshipItems)); } catch (e) {}
  }, [relationshipItems]);
  
  useEffect(() => {
    try { localStorage.setItem(LIFE_STORAGE_KEYS.healthCheck, JSON.stringify(healthCheck)); } catch (e) {}
  }, [healthCheck]);
  
  // 다크모드 스타일
  const bgGradient = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-100';
  
  const hour = new Date().getHours();
  const { todayTop3, upcoming, dontForget, relationships } = mockLifeReminders;
  
  const getAlfredoMessage = () => {
    const checkedCount = checkedItems.length;
    const totalRoutines = routines.length;
    const medicationsDue = medications.filter(m => {
      const [h] = m.time.split(':').map(Number);
      return h <= hour && !m.taken;
    });
    const upcomingBirthdays = relationships.filter(r => r.dDay <= 3);
    
    // 약 복용 시간
    if (medicationsDue.length > 0) {
      return {
        message: `${medicationsDue[0].name} 드실 시간이에요! 💊`,
        subMessage: medicationsDue[0].time + '에 복용',
        quickReplies: [
          { label: '복용했어요 ✓', key: 'took_med' },
          { label: '나중에 먹을게', key: 'later' }
        ]
      };
    }
    
    // 생일/기념일 리마인드
    if (upcomingBirthdays.length > 0) {
      const person = upcomingBirthdays[0];
      if (person.dDay === 0) {
        return {
          message: `오늘 ${person.name} ${person.event}이에요! 🎂`,
          subMessage: '연락하셨나요?',
          quickReplies: [
            { label: '연락했어요!', key: 'contacted' },
            { label: '선물 추천해줘', key: 'gift_idea' }
          ]
        };
      } else {
        return {
          message: `${person.dDay}일 후 ${person.name} ${person.event}!`,
          subMessage: '선물 준비하셨나요?',
          quickReplies: [
            { label: '선물 추천해줘', key: 'gift_idea' },
            { label: '알겠어요', key: 'ok' }
          ]
        };
      }
    }
    
    // 에너지 체크
    if (energy <= 30) {
      return {
        message: '에너지가 많이 낮으시네요 😴',
        subMessage: '잠깐 쉬거나 가벼운 산책 어때요?',
        quickReplies: [
          { label: '쉴게요', key: 'rest' },
          { label: '그래도 할 일 있어', key: 'continue' }
        ]
      };
    }
    
    // 루틴 진행률
    if (checkedCount === 0 && hour >= 12) {
      return {
        message: '오늘 아직 루틴을 시작 안 하셨네요.',
        subMessage: '작은 것부터 하나 해볼까요?',
        quickReplies: [
          { label: '시작할게요', key: 'start' },
          { label: '오늘은 쉴래요', key: 'skip' }
        ]
      };
    }
    
    if (checkedCount >= totalRoutines) {
      return {
        message: '오늘 루틴 완벽! 👏',
        subMessage: '자기 관리 정말 잘하고 계세요.',
        quickReplies: [
          { label: '고마워요 🐧', key: 'thanks' }
        ]
      };
    }
    
    // 균형 메시지
    return {
      message: '오늘 하루도 나를 위한 시간 가져요.',
      subMessage: `${totalRoutines - checkedCount}개 루틴이 남았어요.`,
      quickReplies: [
        { label: '루틴 시작할게', key: 'start' },
        { label: '뭐부터 할까?', key: 'recommend' }
      ]
    };
  };
  
  const alfredoMsg = getAlfredoMessage();
  
  // 드래그 핸들러 (오늘 꼭 챙길 것)
  const handleDragStart = (e, item, index) => {
    setDraggedItem({ item, index });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };
  
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverIndex(null);
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.index === targetIndex) return;
    
    const newOrder = [...lifeTop3];
    const [removed] = newOrder.splice(draggedItem.index, 1);
    newOrder.splice(targetIndex, 0, removed);
    
    setLifeTop3(newOrder);
    setCustomTop3Order(newOrder.map(t => t.id));
    setDraggedItem(null);
    setDragOverIndex(null);
  };
  
  // 현재 시간대 계산
  const getCurrentTimeSlot = () => {
    if (hour < 10) return 'morning';
    if (hour < 15) return 'afternoon';
    if (hour < 20) return 'evening';
    return 'night';
  };
  const currentTimeSlot = getCurrentTimeSlot();
  
  // 현재 시간대에 복용해야 할 약
  const currentMeds = medications.filter(m => m.time === currentTimeSlot);
  const pendingMeds = currentMeds.filter(m => !m.taken);
  const allMedsTaken = currentMeds.length > 0 && pendingMeds.length === 0;
  
  // 오늘 전체 복용 현황
  const totalMeds = medications.length;
  const takenMeds = medications.filter(m => m.taken).length;
  
  // 오늘 챙길 것 개수
  const criticalCount = todayTop3.filter(t => t.critical || t.dDay <= 1).length;
  const upcomingCount = upcoming.length;
  
  // 모달 열기
  const openModal = (item, type) => {
    setModalItem(item);
    setModalType(type);
    setModalOpen(true);
  };
  
  // 모달에서 저장
  const handleModalSave = (updatedItem) => {
    switch(modalType) {
      case 'medication':
      case 'medicationList': // medicationList에서 약 추가 시 medication으로 처리
        if (modalItem) {
          setMedications(medications.map(m => m.id === updatedItem.id ? updatedItem : m));
        } else {
          setMedications([...medications, { ...updatedItem, id: `med-${Date.now()}` }]);
        }
        break;
      case 'reminder':
        if (modalItem) {
          setLifeTop3(lifeTop3.map(t => t.id === updatedItem.id ? updatedItem : t));
        } else {
          setLifeTop3([...lifeTop3, { ...updatedItem, id: `lt-${Date.now()}` }]);
        }
        break;
      case 'upcoming':
        if (modalItem) {
          setUpcomingItems(upcomingItems.map(u => u.id === updatedItem.id ? updatedItem : u));
        } else {
          setUpcomingItems([...upcomingItems, { ...updatedItem, id: `up-${Date.now()}` }]);
        }
        break;
      case 'dontForget':
        if (modalItem) {
          setDontForgetItems(dontForgetItems.map(d => d.id === updatedItem.id ? updatedItem : d));
        } else {
          setDontForgetItems([...dontForgetItems, { ...updatedItem, id: `df-${Date.now()}` }]);
        }
        break;
      case 'relationship':
        if (modalItem) {
          setRelationshipItems(relationshipItems.map(r => r.id === updatedItem.id ? updatedItem : r));
        } else {
          setRelationshipItems([...relationshipItems, { ...updatedItem, id: `rel-${Date.now()}` }]);
        }
        break;
      case 'routine':
        if (modalItem) {
          setRoutines(routines.map(r => r.id === updatedItem.id ? updatedItem : r));
        } else {
          setRoutines([...routines, { ...updatedItem, id: `routine-${Date.now()}` }]);
        }
        break;
    }
    setModalOpen(false);
  };
  
  // 모달에서 삭제
  const handleModalDelete = (id) => {
    switch(modalType) {
      case 'medication':
        setMedications(medications.filter(m => m.id !== id));
        break;
      case 'reminder':
        setLifeTop3(lifeTop3.filter(t => t.id !== id));
        break;
      case 'upcoming':
        setUpcomingItems(upcomingItems.filter(u => u.id !== id));
        break;
      case 'dontForget':
        setDontForgetItems(dontForgetItems.filter(d => d.id !== id));
        break;
      case 'relationship':
        setRelationshipItems(relationshipItems.filter(r => r.id !== id));
        break;
      case 'routine':
        setRoutines(routines.filter(r => r.id !== id));
        break;
    }
    setModalOpen(false);
  };
  
  // 약 복용 체크
  const handleTakeMed = (medId) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMedications(medications.map(m => 
      m.id === medId ? { ...m, taken: true, takenAt: timeStr } : m
    ));
  };
  
  // 풍성한 알프레도 브리핑 생성
  const generateLifeBriefing = () => {
    const lines = [];
    const weather = mockWeather;
    const routines = mockRoutines;
    
    // 1. 시간대별 인사 + 날씨 (가장 먼저 알고 싶은 것)
    if (hour < 12) {
      // 아침
      if (healthCheck.sleep.hours < 6) {
        lines.push(`어젯밤 ${healthCheck.sleep.hours}시간밖에 못 주무셨네요. 오늘은 무리하지 마세요, Boss. 💤`);
      } else {
        lines.push('좋은 아침이에요, Boss! ☀️');
      }
      
      // 날씨 + 옷차림
      if (weather.temp <= 0) {
        lines.push(`\n오늘 **${weather.temp}°C**까지 떨어져요. ${weather.advice} 꼭 챙기시고, 목도리도요. 🧣`);
      } else if (weather.rain) {
        lines.push(`\n오후에 비 온대요. 우산 가방에 넣어두셨죠? ☔`);
      } else if (weather.condition === 'sunny') {
        lines.push(`\n오늘 날씨 좋아요! **${weather.tempHigh}°C**까지 올라가요. 점심에 잠깐 산책 어때요?`);
      }
      
      // 미세먼지
      if (weather.dust === 'bad' || weather.dust === 'veryBad') {
        lines.push(`\n미세먼지 **${weather.dustText}**이에요. 마스크 꼭 챙기세요.`);
      }
      
    } else if (hour < 17) {
      // 오후
      lines.push('오후도 힘내고 계시죠? ☀️');
      
      if (healthCheck.water.current < 4) {
        lines.push(`\n물 ${healthCheck.water.current}잔밖에 안 드셨어요. 지금 한 잔 어때요? 💧`);
      }
      
    } else if (hour < 21) {
      // 저녁
      lines.push('하루 마무리 잘 하고 계시죠? 🌆');
      
      if (weather.temp <= 0) {
        lines.push(`\n밖에 **${weather.temp}°C**예요. 따뜻하게 입고 다니세요.`);
      }
      
    } else {
      // 밤
      lines.push('오늘 하루 수고 많으셨어요, Boss. 🌙');
      
      if (healthCheck.sleep.hours < 7) {
        lines.push(`\n어제 ${healthCheck.sleep.hours}시간 주무셨잖아요. 오늘은 일찍 주무세요.`);
      }
    }
    
    // 2. 약 복용 (중요!)
    if (pendingMeds.length > 0) {
      const criticalMed = pendingMeds.find(m => m.critical);
      if (criticalMed) {
        lines.push(`\n💊 **${criticalMed.name}** 드셨어요? 이건 꼭 챙기셔야 해요.`);
      } else if (pendingMeds.length === 1) {
        lines.push(`\n💊 **${pendingMeds[0].name}** 드실 시간이에요.`);
      } else {
        lines.push(`\n💊 ${currentTimeSlot === 'morning' ? '아침' : currentTimeSlot === 'afternoon' ? '점심' : currentTimeSlot === 'evening' ? '저녁' : '취침 전'} 약 ${pendingMeds.length}개 아직 안 드셨어요.`);
      }
    }
    
    // 3. 긴급한 것 (돈 관련은 특별히 강조)
    const critical = todayTop3.filter(t => t.critical || t.dDay <= 1);
    if (critical.length > 0) {
      const item = critical[0];
      if (item.category === 'money') {
        lines.push(`\n💰 **${item.title}** ${item.dDay === 0 ? '오늘까지예요!' : '내일까지예요!'} ${item.note ? `${item.note}, ` : ''}이건 진짜 중요한 거 아시죠?`);
      } else {
        lines.push(`\n📌 **${item.title}** ${item.dDay === 0 ? '오늘이에요!' : 'D-1이에요!'} ${item.note ? `(${item.note})` : ''}`);
      }
    }
    
    // 4. 루틴 체크 (못 하고 있는 것)
    const missedRoutine = routines.find(r => r.current === 0 && r.lastDone);
    if (missedRoutine) {
      lines.push(`\n🔄 **${missedRoutine.title}** ${missedRoutine.lastDone}부터 안 하셨어요. 오늘은 가볍게라도 어때요?`);
    }
    
    // 5. 관계 챙기기
    const needContact = relationships.filter(r => r.lastContact >= 7);
    if (needContact.length > 0) {
      const person = needContact[0];
      if (person.lastContact >= 14) {
        lines.push(`\n💕 **${person.name}**${person.name.endsWith('님') ? '' : '님'}께 연락한 지 ${person.lastContact}일이나 됐어요. 오늘 잠깐 ${person.suggestion} 어때요?`);
      } else {
        lines.push(`\n💕 ${person.name}${person.name.endsWith('님') ? '' : '님'}께 ${person.suggestion} 보내는 건 어때요?`);
      }
    }
    
    // 6. 이번 주 일정 미리 알림
    if (upcoming.length > 0) {
      const event = upcoming[0];
      lines.push(`\n📅 ${event.date}에 **${event.title}** 있는 거 기억하시죠? ${event.note ? `${event.note}요.` : ''}`);
    }
    
    // 7. 컨디션 기반 조언
    if (energy < 30) {
      lines.push(`\n😌 에너지가 많이 낮아 보여요. 오늘은 급한 것만 하고 쉬세요. 괜찮아요.`);
    } else if (energy < 50) {
      lines.push(`\n😊 컨디션이 보통이네요. 가벼운 것부터 하나씩 해봐요.`);
    } else if (energy >= 70 && mood === 'upbeat') {
      lines.push(`\n✨ 오늘 컨디션 좋으시네요! 미뤄둔 거 처리하기 딱 좋아요.`);
    }
    
    // 8. 마무리 - 시간대별로 다르게
    if (hour < 12) {
      lines.push(`\n\n오늘 하루도 Boss답게 보내요! 제가 옆에서 다 챙길게요. 🐧`);
    } else if (hour < 18) {
      lines.push(`\n\n남은 하루도 힘내세요! 필요한 거 있으면 불러주세요. 🐧`);
    } else {
      lines.push(`\n\n오늘도 수고했어요, Boss. 푹 쉬세요. 🐧`);
    }
    
    return lines.join('');
  };
  
  const handleToggleItem = (id) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const handleSaveJournal = () => {
    if (journalText.trim()) {
      setJournalSaved(true);
      setTimeout(() => setJournalSaved(false), 2000);
    }
  };
  
  const getDDayText = (dDay) => {
    if (dDay === 0) return '오늘';
    if (dDay === 1) return '내일';
    return `D-${dDay}`;
  };
  
  const getDDayColor = (dDay, critical) => {
    if (critical || dDay === 0) return 'bg-red-500 text-white';
    if (dDay === 1) return 'bg-[#A996FF]500 text-white';
    if (dDay <= 3) return 'bg-[#EDE9FE] text-[#7C6CD6]';
    return 'bg-gray-100 text-gray-600';
  };
  
  return (
    <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-[#FDF8F3] to-[#F5EDE4]'} transition-colors duration-300`}>
      <div className="p-4 space-y-4 pb-32">
        
        {/* 알프레도 브리핑 */}
        <div className={`${cardBg}/90 backdrop-blur-xl rounded-xl shadow-lg p-5 border ${darkMode ? 'border-gray-700' : 'border-[#EDE9FE]'}`}>
          {/* 헤더: 알프레도 + 날씨 요약 */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <AlfredoAvatar size="lg" />
              <div>
                <p className={`font-bold ${textPrimary}`}>알프레도 🐧</p>
                <p className={`text-xs ${darkMode ? 'text-[#A996FF]' : 'text-[#A996FF]'}`}>오늘 챙길 것 {criticalCount}개</p>
              </div>
            </div>
            {/* 날씨 미니 카드 */}
            <div className={`flex items-center gap-2 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-gray-100 to-sky-50'} px-3 py-1.5 rounded-full`}>
              <span className="text-lg">
                {mockWeather.condition === 'sunny' ? '☀️' : 
                 mockWeather.condition === 'cloudy' ? '☁️' : 
                 mockWeather.condition === 'rain' ? '🌧️' : '❄️'}
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>{mockWeather.temp}°</span>
              {mockWeather.dust === 'bad' && <span className="text-[11px] text-red-500 font-medium">먼지😷</span>}
            </div>
          </div>
          
          {/* 브리핑 본문 */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]'} rounded-xl p-4`}>
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} leading-relaxed whitespace-pre-line`}>
              {generateLifeBriefing().split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className={`${darkMode ? 'text-[#A996FF]' : 'text-[#7C6CD6]'} font-semibold`}>{part}</strong> : part
              )}
            </p>
          </div>
        </div>
        
        {/* 컨디션 & 건강 체크 */}
        <div className={`${cardBg}/80 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
          <h3 className={`font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <span className="text-lg">💫</span> 오늘의 컨디션
          </h3>
          
          {/* 에너지 & 기분 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* 에너지 */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#7C6CD6] font-medium">에너지</span>
                <span className="text-lg font-bold text-[#8B7CF7]">{energy}%</span>
              </div>
              <div className="h-2.5 bg-[#EDE9FE] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500"
                  style={{ width: `${energy}%` }}
                />
              </div>
              <div className="flex justify-between mt-3">
                {[25, 50, 75, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setEnergy(val)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                      energy === val 
                        ? 'bg-[#F5F3FF]0 text-white shadow-md scale-110' 
                        : 'bg-white text-[#8B7CF7] hover:bg-[#F5F3FF]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 기분 */}
            <div className="bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] rounded-xl p-4">
              <span className="text-sm text-[#7C3AED] font-medium">기분</span>
              <div className="flex justify-around mt-3">
                {[
                  { key: 'down', emoji: '😔', label: '힘듦' },
                  { key: 'light', emoji: '😊', label: '괜찮음' },
                  { key: 'upbeat', emoji: '😄', label: '좋음' },
                ].map(m => (
                  <button
                    key={m.key}
                    onClick={() => setMood(m.key)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      mood === m.key 
                        ? 'bg-[#EDE9FE] scale-110' 
                        : 'hover:bg-[#F5F3FF]'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[11px] text-[#8B7CF7]">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 간단 건강 체크 */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-gray-100 rounded-xl p-3 text-center">
              <span className="text-xl">💤</span>
              <p className="text-[11px] text-gray-600 font-medium mt-1">{healthCheck.sleep.hours}시간</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-xl">💧</span>
              <p className="text-[11px] text-gray-600 font-medium mt-1">{healthCheck.water.current}/{healthCheck.water.target}잔</p>
              <button 
                onClick={() => setHealthCheck({...healthCheck, water: {...healthCheck.water, current: healthCheck.water.current + 1}})}
                className="text-[11px] text-gray-500 underline"
              >+1잔</button>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <span className="text-xl">🚶</span>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">{(healthCheck.steps.current / 1000).toFixed(1)}k</p>
            </div>
            <button 
              onClick={() => openModal(null, 'medicationList')}
              className={`rounded-xl p-3 text-center transition-all hover:scale-105 ${
                pendingMeds.length > 0 ? 'bg-[#EDE9FE] ring-2 ring-[#C4B5FD]' : 'bg-[#F5F3FF]'
              }`}
            >
              <span className="text-xl">💊</span>
              <p className={`text-[11px] font-medium mt-1 ${pendingMeds.length > 0 ? 'text-[#7C3AED]' : 'text-[#F5F3FF]0'}`}>
                {takenMeds}/{totalMeds}
              </p>
              {pendingMeds.length > 0 && (
                <p className="text-[11px] text-[#8B7CF7] font-semibold">지금!</p>
              )}
            </button>
          </div>
        </div>
        
        {/* 오늘의 Life Top 3 */}
        <div className={`${cardBg}/80 backdrop-blur-xl rounded-xl shadow-sm p-4 border ${borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
              <span className="text-lg">📌</span> 오늘 꼭 챙길 것
            </h3>
            <div className="flex items-center gap-2">
              {customTop3Order && (
                <button 
                  onClick={() => { setCustomTop3Order(null); setLifeTop3(mockLifeReminders.todayTop3); }}
                  className={`text-[11px] ${darkMode ? 'text-[#A996FF]' : 'text-[#8B7CF7]'} font-medium hover:underline`}
                >
                  순서 초기화
                </button>
              )}
              <button 
                onClick={() => openModal(null, 'reminder')}
                className={`w-7 h-7 ${darkMode ? 'bg-[#A996FF]/30 text-[#A996FF]' : 'bg-[#EDE9FE] text-[#8B7CF7]'} rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80`}
              >
                +
              </button>
            </div>
          </div>
          
          {/* 드래그 안내 */}
          {!customTop3Order && lifeTop3.length > 1 && (
            <p className={`text-[11px] ${textSecondary} mb-2 flex items-center gap-1`}>
              <span>↕️</span> 드래그해서 순서를 바꿀 수 있어요
            </p>
          )}
          
          <div className="space-y-2">
            {lifeTop3.map((item, idx) => (
              <div 
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onClick={() => openModal(item, 'reminder')}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-grab active:cursor-grabbing ${
                  dragOverIndex === idx && draggedItem?.index !== idx
                    ? `border-2 border-[#A996FF] ${darkMode ? 'bg-[#A996FF]/20' : 'bg-[#F5F3FF]'}`
                    : checkedItems.includes(item.id) 
                      ? `${darkMode ? 'bg-gray-700' : 'bg-gray-50'} opacity-60` 
                      : `${cardBg} shadow-sm border ${borderColor} hover:shadow-md`
                }`}
              >
                {/* 드래그 핸들 */}
                <div className={textSecondary + " cursor-grab active:cursor-grabbing"}>
                  <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                    <circle cx="3" cy="4" r="1.5"/>
                    <circle cx="9" cy="4" r="1.5"/>
                    <circle cx="3" cy="10" r="1.5"/>
                    <circle cx="9" cy="10" r="1.5"/>
                    <circle cx="3" cy="16" r="1.5"/>
                    <circle cx="9" cy="16" r="1.5"/>
                  </svg>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleItem(item.id); }}
                  className={`${checkedItems.includes(item.id) ? 'text-emerald-500' : 'text-[#A996FF]'}`}
                >
                  {checkedItems.includes(item.id) ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-gray-800 ${checkedItems.includes(item.id) ? 'line-through text-gray-400' : ''}`}>
                    {item.title}
                  </p>
                  {item.note && <p className="text-xs text-gray-400 truncate">{item.note}</p>}
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-full font-bold ${getDDayColor(item.dDay, item.critical)}`}>
                  {getDDayText(item.dDay)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* 🔄 오늘의 루틴 */}
        <div className={`${cardBg}/90 backdrop-blur-xl border ${borderColor} rounded-xl shadow-sm p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${textPrimary} flex items-center gap-2`}>
              <span className="text-lg">🔄</span> 오늘의 루틴
            </h3>
            <button 
              onClick={() => openModal(null, 'routine')}
              className={`w-7 h-7 ${darkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-600'} rounded-full flex items-center justify-center text-lg font-bold hover:opacity-80`}
            >
              +
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {routines.map(routine => {
              const completed = routine.current >= routine.target;
              const progress = Math.min((routine.current / routine.target) * 100, 100);
              
              return (
                <div 
                  key={routine.id}
                  onClick={() => openModal(routine, 'routine')}
                  className={`p-3 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                    completed 
                      ? darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50' 
                      : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{routine.icon}</span>
                  <p className={`text-[11px] font-medium mt-1 ${completed ? (darkMode ? 'text-emerald-400' : 'text-emerald-600') : textSecondary}`}>
                    {routine.current}/{routine.target}
                  </p>
                  {routine.streak > 0 && (
                    <p className="text-[11px] text-[#A996FF] font-medium">🔥 {routine.streak}일</p>
                  )}
                  {routine.lastDone && !completed && (
                    <p className="text-[11px] text-red-400">{routine.lastDone}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* 📅 다가오는 것 (이번 주 + 잊지 말 것 통합) */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3FF] rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="text-lg">📅</span> 다가오는 것
            </h3>
            <button 
              onClick={() => openModal(null, 'upcoming')}
              className="w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-lg font-bold hover:bg-gray-200"
            >
              +
            </button>
          </div>
          
          {/* 일정 */}
          <div className="space-y-2 mb-3">
            {upcomingItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => openModal(item, 'upcoming')}
                className="flex items-center gap-3 p-3 bg-gray-100/50 rounded-xl cursor-pointer hover:bg-gray-100/50 transition-all"
              >
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.note}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
          
          {/* 구분선 */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">💡 잊지 마세요</span>
            <button 
              onClick={() => openModal(null, 'dontForget')}
              className="w-5 h-5 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-300"
            >
              +
            </button>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          
          {/* 잊지 말 것 */}
          <div className="grid grid-cols-2 gap-2">
            {dontForgetItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => openModal(item, 'dontForget')}
                className={`p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${item.critical ? 'bg-red-50 border border-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <p className={`text-sm font-medium ${item.critical ? 'text-red-700' : 'text-gray-700'}`}>
                  {item.title}
                </p>
                {item.amount && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.amount}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 관계 챙기기 */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3FF] rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="text-lg">💕</span> 연락할 때 됐어요
            </h3>
            <button 
              onClick={() => openModal(null, 'relationship')}
              className="w-7 h-7 bg-[#EDE9FE] text-[#8B7CF7] rounded-full flex items-center justify-center text-lg font-bold hover:bg-[#DDD6FE]"
            >
              +
            </button>
          </div>
          
          <div className="space-y-2">
            {relationshipItems.filter(r => r.lastContact >= 7).map(person => (
              <div 
                key={person.id} 
                onClick={() => openModal(person, 'relationship')}
                className="flex items-center gap-3 p-3 bg-[#F5F3FF]/50 rounded-xl cursor-pointer hover:bg-[#EDE9FE]/50 transition-all"
              >
                <span className="text-2xl">{person.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-700">{person.name}</p>
                  <p className="text-xs text-gray-400">{person.lastContact}일 전 연락</p>
                </div>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 bg-[#EDE9FE] text-[#8B7CF7] rounded-full text-xs font-semibold hover:bg-[#DDD6FE]"
                >
                  {person.suggestion}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 오늘 하루 기록 */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#E8E3FF] rounded-xl shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-lg">📝</span> 오늘 하루 기록
          </h3>
          
          <textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="오늘 하루는 어땠나요? 감사한 일, 기억하고 싶은 것..."
            className="w-full h-28 p-3 bg-[#F5F3FF]/50 rounded-xl text-sm text-gray-700 placeholder:text-[#C4B5FD] resize-none focus:outline-none focus:ring-2 focus:ring-[#DDD6FE]"
          />
          
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSaveJournal}
              disabled={!journalText.trim()}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                journalText.trim()
                  ? 'bg-[#F5F3FF]0 text-white shadow-md active:scale-95'
                  : 'bg-gray-100 text-gray-300'
              }`}
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
          onClose={() => setModalOpen(false)}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          medications={medications}
          onTakeMed={handleTakeMed}
        />
      )}
      
      {/* 🐧 알프레도 플로팅 */}
      <AlfredoFloatingBubble
        message={alfredoMsg.message}
        subMessage={alfredoMsg.subMessage}
        isVisible={showAlfredo}
        onOpenChat={onOpenChat}
        darkMode={false}
        quickReplies={alfredoMsg.quickReplies}
      />
    </div>
  );
};

// === Work Page ===

export default LifePage;
