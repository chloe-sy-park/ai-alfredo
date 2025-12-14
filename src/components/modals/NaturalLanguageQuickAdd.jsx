import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Send, Sparkles, Calendar, Clock, Target } from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

const NaturalLanguageQuickAdd = ({ 
  isOpen, 
  onClose, 
  onAddTask, 
  onAddEvent, 
  darkMode = false 
}) => {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef(null);
  
  // 자연어 파싱 함수
  const parseNaturalLanguage = (text) => {
    const result = {
      type: 'task', // 'task' or 'event'
      title: '',
      date: null,
      time: null,
      duration: 60,
      location: null,
      importance: 'medium',
      deadline: null,
    };
    
    let remaining = text.trim();
    
    // 날짜 패턴 감지
    const today = new Date();
    const datePatterns = [
      { pattern: /오늘/g, getDate: () => today },
      { pattern: /내일/g, getDate: () => new Date(today.getTime() + 24*60*60*1000) },
      { pattern: /모레/g, getDate: () => new Date(today.getTime() + 48*60*60*1000) },
      { pattern: /월요일/g, getDate: () => getNextWeekday(1) },
      { pattern: /화요일/g, getDate: () => getNextWeekday(2) },
      { pattern: /수요일/g, getDate: () => getNextWeekday(3) },
      { pattern: /목요일/g, getDate: () => getNextWeekday(4) },
      { pattern: /금요일/g, getDate: () => getNextWeekday(5) },
      { pattern: /토요일/g, getDate: () => getNextWeekday(6) },
      { pattern: /일요일/g, getDate: () => getNextWeekday(0) },
      { pattern: /다음\s*주/g, getDate: () => new Date(today.getTime() + 7*24*60*60*1000) },
      { pattern: /(\d{1,2})\/(\d{1,2})/g, getDate: (m) => new Date(today.getFullYear(), parseInt(m[1])-1, parseInt(m[2])) },
      { pattern: /(\d{1,2})월\s*(\d{1,2})일/g, getDate: (m) => new Date(today.getFullYear(), parseInt(m[1])-1, parseInt(m[2])) },
    ];
    
    function getNextWeekday(dayOfWeek) {
      const result = new Date(today);
      const currentDay = today.getDay();
      let daysUntil = dayOfWeek - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      result.setDate(result.getDate() + daysUntil);
      return result;
    }
    
    for (const dp of datePatterns) {
      const match = remaining.match(dp.pattern);
      if (match) {
        if (dp.pattern.toString().includes('(')) {
          const execMatch = dp.pattern.exec(text);
          if (execMatch) {
            result.date = dp.getDate(execMatch);
          }
        } else {
          result.date = dp.getDate();
        }
        remaining = remaining.replace(dp.pattern, ' ');
        break;
      }
    }
    
    // 시간 패턴 감지
    const timePatterns = [
      { pattern: /(\d{1,2}):(\d{2})/g, getTime: (m) => ({ h: parseInt(m[1]), m: parseInt(m[2]) }) },
      { pattern: /(\d{1,2})시\s*(\d{1,2})분/g, getTime: (m) => ({ h: parseInt(m[1]), m: parseInt(m[2]) }) },
      { pattern: /(\d{1,2})시반/g, getTime: (m) => ({ h: parseInt(m[1]), m: 30 }) },
      { pattern: /(\d{1,2})시/g, getTime: (m) => ({ h: parseInt(m[1]), m: 0 }) },
      { pattern: /오전\s*(\d{1,2})시?/g, getTime: (m) => ({ h: parseInt(m[1]), m: 0 }) },
      { pattern: /오후\s*(\d{1,2})시?/g, getTime: (m) => ({ h: parseInt(m[1]) + (parseInt(m[1]) < 12 ? 12 : 0), m: 0 }) },
    ];
    
    for (const tp of timePatterns) {
      const execMatch = tp.pattern.exec(remaining);
      if (execMatch) {
        const time = tp.getTime(execMatch);
        result.time = `${time.h.toString().padStart(2, '0')}:${time.m.toString().padStart(2, '0')}`;
        remaining = remaining.replace(tp.pattern, ' ');
        break;
      }
    }
    
    // 장소 패턴 감지
    const locationPatterns = [
      /(?:에서|에)\s*$/g,
      /(회의실\s*[A-Za-z0-9가-힣]+)/g,
      /(카페\s*[가-힣]+)/g,
      /(@\s*[가-힣A-Za-z0-9]+)/g,
    ];
    
    for (const lp of locationPatterns) {
      const match = remaining.match(lp);
      if (match) {
        result.location = match[0].replace(/에서|에|@/g, '').trim();
        remaining = remaining.replace(lp, ' ');
        break;
      }
    }
    
    // 소요시간 감지
    const durationMatch = remaining.match(/(\d+)\s*분/);
    if (durationMatch) {
      result.duration = parseInt(durationMatch[1]);
      remaining = remaining.replace(/(\d+)\s*분/, ' ');
    }
    const hourDurationMatch = remaining.match(/(\d+)\s*시간/);
    if (hourDurationMatch) {
      result.duration = parseInt(hourDurationMatch[1]) * 60;
      remaining = remaining.replace(/(\d+)\s*시간/, ' ');
    }
    
    // 중요도 감지
    if (/중요|급함|긴급|우선/.test(remaining)) {
      result.importance = 'high';
      remaining = remaining.replace(/중요|급함|긴급|우선/g, ' ');
    }
    
    // 마감 감지 (태스크용)
    const deadlineMatch = remaining.match(/까지/);
    if (deadlineMatch && result.date) {
      result.deadline = formatDateKorean(result.date);
      remaining = remaining.replace(/까지/g, ' ');
    }
    
    // 일정 vs 태스크 판단
    const eventKeywords = ['미팅', '회의', '약속', '면접', '식사', '점심', '저녁', '세션', '수업', '강의', '상담'];
    const isEvent = eventKeywords.some(kw => text.includes(kw)) || result.time !== null;
    result.type = isEvent ? 'event' : 'task';
    
    // 제목 정리
    result.title = remaining.replace(/\s+/g, ' ').trim();
    
    // 날짜가 없으면 오늘로 설정
    if (!result.date) {
      result.date = today;
    }
    
    return result;
  };
  
  // 날짜 포맷팅
  const formatDateKorean = (date) => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24*60*60*1000);
    
    if (date.toDateString() === today.toDateString()) return '오늘';
    if (date.toDateString() === tomorrow.toDateString()) return '내일';
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
  };
  
  const formatDateISO = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // 입력 처리
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim().length > 2) {
      const result = parseNaturalLanguage(value);
      setParsed(result);
    } else {
      setParsed(null);
    }
  };
  
  // 확인 및 저장
  const handleConfirm = () => {
    if (!parsed || !parsed.title) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      if (parsed.type === 'event') {
        const endTime = parsed.time ? (() => {
          const [h, m] = parsed.time.split(':').map(Number);
          const endMin = h * 60 + m + parsed.duration;
          return `${Math.floor(endMin / 60).toString().padStart(2, '0')}:${(endMin % 60).toString().padStart(2, '0')}`;
        })() : '10:00';
        
        onAddEvent?.({
          id: `event-nlp-${Date.now()}`,
          title: parsed.title,
          date: formatDateISO(parsed.date),
          start: parsed.time || '09:00',
          end: endTime,
          location: parsed.location || '',
          color: 'bg-[#A996FF]',
          important: parsed.importance === 'high',
        });
      } else {
        onAddTask?.({
          id: `task-nlp-${Date.now()}`,
          title: parsed.title,
          project: '빠른 추가',
          importance: parsed.importance,
          status: 'todo',
          priorityChange: 'new',
          priorityScore: parsed.importance === 'high' ? 85 : 60,
          sparkline: [0, 0, 0, 50, 60],
          deadline: parsed.deadline || formatDateKorean(parsed.date),
          scheduledTime: parsed.time,
          duration: parsed.duration,
        });
      }
      
      setIsProcessing(false);
      setInput('');
      setParsed(null);
      onClose();
    }, 300);
  };
  
  // 키보드 단축키
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && parsed?.title) {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-lg mx-4 ${cardBg} rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
      >
        {/* 입력 영역 */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${textPrimary}`}>빠른 추가</h3>
              <p className={`text-xs ${textSecondary}`}>자연어로 입력하면 자동 인식해요</p>
            </div>
          </div>
          
          <div className={`relative ${inputBg} rounded-xl`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="예: 내일 3시 투자사 미팅, 보고서 작성 금요일까지"
              className={`w-full px-4 py-3.5 bg-transparent ${textPrimary} placeholder-gray-400 focus:outline-none text-base`}
            />
            {input && (
              <button 
                onClick={() => { setInput(''); setParsed(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* 파싱 결과 미리보기 */}
        {parsed && parsed.title && (
          <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="pt-3 pb-2">
              <p className={`text-xs ${textSecondary} mb-2`}>🤖 알프레도가 인식한 내용</p>
              
              <div className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-[#F5F3FF]'}`}>
                {/* 타입 배지 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    parsed.type === 'event' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {parsed.type === 'event' ? '📅 일정' : '✅ 할일'}
                  </span>
                  {parsed.importance === 'high' && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">
                      🔥 중요
                    </span>
                  )}
                </div>
                
                {/* 제목 */}
                <p className={`font-semibold ${textPrimary} mb-2`}>{parsed.title}</p>
                
                {/* 상세 정보 */}
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} ${textSecondary}`}>
                    📆 {formatDateKorean(parsed.date)}
                  </span>
                  {parsed.time && (
                    <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} ${textSecondary}`}>
                      🕐 {parsed.time}
                    </span>
                  )}
                  {parsed.location && (
                    <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} ${textSecondary}`}>
                      📍 {parsed.location}
                    </span>
                  )}
                  {parsed.duration && parsed.type === 'event' && (
                    <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-white'} ${textSecondary}`}>
                      ⏱️ {parsed.duration}분
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                취소
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing || !parsed.title}
                className="flex-1 py-3 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    추가 중...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    추가하기
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* 예시 힌트 */}
        {!parsed && (
          <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            <p className={`text-xs ${textSecondary} pt-3 mb-2`}>💡 이렇게 입력해보세요</p>
            <div className="flex flex-wrap gap-2">
              {[
                '내일 3시 팀 미팅',
                '보고서 작성 금요일까지',
                '오후 2시 투자사 미팅 회의실A',
                '이메일 정리 오늘',
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(example);
                    setParsed(parseNaturalLanguage(example));
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 키보드 힌트 */}
        <div className={`px-4 py-2 ${darkMode ? 'bg-gray-900/50' : 'bg-gray-50'} flex justify-center gap-4`}>
          <span className={`text-[10px] ${textSecondary}`}>
            <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mr-1`}>Enter</kbd>
            추가
          </span>
          <span className={`text-[10px] ${textSecondary}`}>
            <kbd className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mr-1`}>Esc</kbd>
            닫기
          </span>
        </div>
      </div>
    </div>
  );
};


export default NaturalLanguageQuickAdd;
