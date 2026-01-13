import React, { useMemo } from 'react';
import { Dna, Zap, Clock, Sun, Moon, AlertTriangle, TrendingUp, Sparkles, Coffee, Calendar, Mic, Users, Scale, PartyPopper } from 'lucide-react';
import { 
  getRandomMessage, 
  getLearningMessage, 
  getDayOfWeekMessage,
  formatMessageWithTime,
  formatMessageWithCount 
} from '../../services/dna/dnaMessages';

/**
 * 🧬 DNA 인사이트 카드
 * 캘린더 분석 기반 개인화된 팁 표시
 * dnaMessages.ts의 60개+ 메시지 활용
 */
export var DNAInsightCard = function(props) {
  var dnaProfile = props.dnaProfile;
  var dnaAnalysisPhase = props.dnaAnalysisPhase;
  var dnaSuggestions = props.dnaSuggestions || [];
  var getBestFocusTime = props.getBestFocusTime;
  var getChronotype = props.getChronotype;
  var getStressLevel = props.getStressLevel;
  var getPeakHours = props.getPeakHours;
  // 🆕 새로운 props
  var todayContext = props.todayContext;
  var getSpecialAlerts = props.getSpecialAlerts;
  var getBurnoutWarning = props.getBurnoutWarning;
  var getTodayEnergyDrain = props.getTodayEnergyDrain;
  
  // DNA 프로필이 없으면 렌더링 안함
  if (!dnaProfile) return null;
  
  // 현재 시간
  var now = new Date();
  var currentHour = now.getHours();
  var dayOfWeek = now.getDay(); // 0=일, 1=월, ..., 6=토
  
  // 인사이트 계산
  var insight = useMemo(function() {
    var chronotype = getChronotype ? getChronotype() : null;
    var bestFocusTime = getBestFocusTime ? getBestFocusTime() : null;
    var stressLevel = getStressLevel ? getStressLevel() : null;
    var peakHours = getPeakHours ? getPeakHours() : [];
    var specialAlerts = getSpecialAlerts ? getSpecialAlerts(1) : []; // 내일까지 체크
    var burnoutWarning = getBurnoutWarning ? getBurnoutWarning() : null;
    
    // 현재 피크 시간인지 확인
    var isCurrentlyPeak = peakHours.includes(currentHour);
    // 오후 슬럼프 시간인지 (13-15시)
    var isAfternoonSlump = currentHour >= 13 && currentHour <= 15;
    
    // ========== 1. 번아웃 위험 (최우선) ==========
    if (burnoutWarning && (burnoutWarning.level === 'critical' || burnoutWarning.level === 'warning')) {
      var burnoutMsg = getRandomMessage('burnout');
      if (burnoutMsg) {
        return {
          icon: AlertTriangle,
          iconColor: 'text-red-500',
          bgColor: 'from-red-50 to-orange-50',
          borderColor: 'border-red-100',
          title: burnoutMsg.title,
          message: burnoutMsg.message,
          type: 'burnout'
        };
      }
    }
    
    // ========== 2. 스트레스 높음 ==========
    if (stressLevel === 'burnout' || stressLevel === 'high') {
      var stressMsg = getRandomMessage('stressHigh');
      if (stressMsg) {
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          bgColor: 'from-amber-50 to-orange-50',
          borderColor: 'border-amber-100',
          title: stressMsg.title,
          message: stressMsg.message,
          type: 'warning'
        };
      }
    }
    
    // ========== 3. 발표/중요 일정 D-1 또는 당일 ==========
    var presentationAlert = specialAlerts.find(function(a) { 
      return a.type === 'presentation' || a.type === 'important_meeting'; 
    });
    if (presentationAlert) {
      var presMsg = getRandomMessage('presentation');
      if (presMsg) {
        return {
          icon: Mic,
          iconColor: 'text-rose-500',
          bgColor: 'from-rose-50 to-pink-50',
          borderColor: 'border-rose-100',
          title: presMsg.title,
          message: presMsg.message,
          type: 'presentation'
        };
      }
    }
    
    // ========== 4. 연속 미팅 ==========
    if (todayContext && todayContext.hasConsecutiveMeetings) {
      var meetingMsg = getRandomMessage('consecutiveMeetings');
      if (meetingMsg) {
        var formattedMsg = formatMessageWithCount(meetingMsg.message, todayContext.totalMeetings);
        return {
          icon: Users,
          iconColor: 'text-blue-500',
          bgColor: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-100',
          title: meetingMsg.title,
          message: formattedMsg,
          type: 'meetings'
        };
      }
    }
    
    // ========== 5. 바쁜 날 ==========
    if (todayContext && (todayContext.busyLevel === 'heavy' || todayContext.busyLevel === 'extreme')) {
      var busyMsg = getRandomMessage('busyDay');
      if (busyMsg) {
        var formattedBusyMsg = formatMessageWithCount(busyMsg.message, todayContext.totalMeetings);
        return {
          icon: Calendar,
          iconColor: 'text-orange-500',
          bgColor: 'from-orange-50 to-amber-50',
          borderColor: 'border-orange-100',
          title: busyMsg.title,
          message: formattedBusyMsg,
          type: 'busy'
        };
      }
    }
    
    // ========== 6. 현재 피크 시간 ==========
    if (isCurrentlyPeak) {
      var peakMsg = getRandomMessage('peak');
      if (peakMsg) {
        return {
          icon: Zap,
          iconColor: 'text-yellow-500',
          bgColor: 'from-yellow-50 to-amber-50',
          borderColor: 'border-yellow-100',
          title: peakMsg.title,
          message: peakMsg.message,
          type: 'peak'
        };
      }
    }
    
    // ========== 7. 오후 슬럼프 ==========
    if (isAfternoonSlump) {
      var slumpMsg = getRandomMessage('afternoonSlump');
      if (slumpMsg) {
        return {
          icon: Coffee,
          iconColor: 'text-amber-600',
          bgColor: 'from-amber-50 to-yellow-50',
          borderColor: 'border-amber-100',
          title: slumpMsg.title,
          message: slumpMsg.message,
          type: 'slump'
        };
      }
    }
    
    // ========== 8. 요일별 메시지 ==========
    // 월요일
    if (dayOfWeek === 1 && currentHour < 12) {
      var mondayMsg = getDayOfWeekMessage('monday');
      if (mondayMsg) {
        return {
          icon: Sparkles,
          iconColor: 'text-blue-500',
          bgColor: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-100',
          title: mondayMsg.title,
          message: mondayMsg.message,
          type: 'dayOfWeek'
        };
      }
    }
    // 금요일
    if (dayOfWeek === 5 && currentHour >= 14) {
      var fridayMsg = getDayOfWeekMessage('friday');
      if (fridayMsg) {
        return {
          icon: PartyPopper,
          iconColor: 'text-purple-500',
          bgColor: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-100',
          title: fridayMsg.title,
          message: fridayMsg.message,
          type: 'dayOfWeek'
        };
      }
    }
    // 주말
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      var weekendMsg = getDayOfWeekMessage('weekend');
      if (weekendMsg) {
        return {
          icon: Sun,
          iconColor: 'text-green-500',
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-100',
          title: weekendMsg.title,
          message: weekendMsg.message,
          type: 'dayOfWeek'
        };
      }
    }
    
    // ========== 9. 여유로운 날 ==========
    if (todayContext && todayContext.busyLevel === 'light') {
      var lightMsg = getRandomMessage('lightDay');
      if (lightMsg) {
        return {
          icon: Sparkles,
          iconColor: 'text-emerald-500',
          bgColor: 'from-emerald-50 to-green-50',
          borderColor: 'border-emerald-100',
          title: lightMsg.title,
          message: lightMsg.message,
          type: 'light'
        };
      }
    }
    
    // ========== 10. 크로노타입 기반 ==========
    if (chronotype === 'morning' && currentHour < 12) {
      var morningMsg = getRandomMessage('morningType');
      if (morningMsg) {
        return {
          icon: Sun,
          iconColor: 'text-orange-400',
          bgColor: 'from-orange-50 to-yellow-50',
          borderColor: 'border-orange-100',
          title: morningMsg.title,
          message: morningMsg.message,
          type: 'chronotype'
        };
      }
    }
    if (chronotype === 'evening' && currentHour >= 17) {
      var eveningMsg = getRandomMessage('eveningType');
      if (eveningMsg) {
        return {
          icon: Moon,
          iconColor: 'text-indigo-400',
          bgColor: 'from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-100',
          title: eveningMsg.title,
          message: eveningMsg.message,
          type: 'chronotype'
        };
      }
    }
    
    // ========== 11. 집중 시간 추천 ==========
    if (bestFocusTime) {
      var focusMsg = getRandomMessage('focusTime');
      if (focusMsg) {
        var formattedFocusMsg = formatMessageWithTime(focusMsg.message, bestFocusTime);
        return {
          icon: Clock,
          iconColor: 'text-purple-500',
          bgColor: 'from-purple-50 to-indigo-50',
          borderColor: 'border-purple-100',
          title: focusMsg.title,
          message: formattedFocusMsg,
          type: 'focus'
        };
      }
    }
    
    // ========== 12. 학습 페이즈 기반 ==========
    if (dnaAnalysisPhase === 'day1') {
      var day1Msg = getLearningMessage('day1');
      if (day1Msg) {
        return {
          icon: Sparkles,
          iconColor: 'text-purple-400',
          bgColor: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-100',
          title: day1Msg.title,
          message: day1Msg.message,
          type: 'learning'
        };
      }
    }
    
    if (dnaAnalysisPhase === 'week1') {
      var week1Msg = getLearningMessage('week1');
      if (week1Msg) {
        return {
          icon: TrendingUp,
          iconColor: 'text-green-500',
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-100',
          title: week1Msg.title,
          message: week1Msg.message,
          type: 'learning'
        };
      }
    }
    
    if (dnaAnalysisPhase === 'week2') {
      var week2Msg = getLearningMessage('week2');
      if (week2Msg) {
        return {
          icon: Dna,
          iconColor: 'text-purple-500',
          bgColor: 'from-purple-50 to-indigo-50',
          borderColor: 'border-purple-100',
          title: week2Msg.title,
          message: week2Msg.message,
          type: 'complete'
        };
      }
    }
    
    // ========== 기본 ==========
    return {
      icon: Dna,
      iconColor: 'text-purple-500',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-100',
      title: 'DNA 분석 완료',
      message: '캘린더 기반으로 최적의 조언을 드려요',
      type: 'default'
    };
  }, [
    dnaProfile, 
    dnaAnalysisPhase, 
    currentHour, 
    dayOfWeek,
    getChronotype, 
    getBestFocusTime, 
    getStressLevel, 
    getPeakHours,
    todayContext,
    getSpecialAlerts,
    getBurnoutWarning
  ]);
  
  var IconComponent = insight.icon;
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 rounded-xl border p-3 bg-gradient-to-r ' + insight.bgColor + ' ' + insight.borderColor
  },
    React.createElement('div', { className: 'flex items-center gap-3' },
      // 아이콘
      React.createElement('div', {
        className: 'p-2 rounded-lg bg-white/60 shadow-sm'
      },
        React.createElement(IconComponent, {
          size: 18,
          className: insight.iconColor
        })
      ),
      
      // 텍스트
      React.createElement('div', { className: 'flex-1 min-w-0' },
        React.createElement('div', { className: 'flex items-center gap-1.5' },
          React.createElement('span', {
            className: 'text-[10px] font-medium text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded'
          }, '🧬 DNA'),
          React.createElement('span', {
            className: 'text-sm font-medium text-gray-800'
          }, insight.title)
        ),
        React.createElement('p', {
          className: 'text-xs text-gray-600 mt-0.5 truncate'
        }, insight.message)
      )
    )
  );
};

export default DNAInsightCard;
