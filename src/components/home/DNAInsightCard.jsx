import React, { useMemo } from 'react';
import { Dna, Zap, Clock, Sun, Moon, AlertTriangle, TrendingUp, Sparkles } from 'lucide-react';

/**
 * 🧬 DNA 인사이트 카드
 * 캘린더 분석 기반 개인화된 팁 표시
 */
export var DNAInsightCard = function(props) {
  var dnaProfile = props.dnaProfile;
  var dnaAnalysisPhase = props.dnaAnalysisPhase;
  var dnaSuggestions = props.dnaSuggestions || [];
  var getBestFocusTime = props.getBestFocusTime;
  var getChronotype = props.getChronotype;
  var getStressLevel = props.getStressLevel;
  var getPeakHours = props.getPeakHours;
  
  // DNA 프로필이 없으면 렌더링 안함
  if (!dnaProfile) return null;
  
  // 현재 시간
  var now = new Date();
  var currentHour = now.getHours();
  
  // 인사이트 계산
  var insight = useMemo(function() {
    var chronotype = getChronotype ? getChronotype() : null;
    var bestFocusTime = getBestFocusTime ? getBestFocusTime() : null;
    var stressLevel = getStressLevel ? getStressLevel() : null;
    var peakHours = getPeakHours ? getPeakHours() : [];
    
    // 현재 피크 시간인지 확인
    var isCurrentlyPeak = peakHours.includes(currentHour);
    
    // 스트레스 높으면 최우선
    if (stressLevel === 'burnout' || stressLevel === 'high') {
      return {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        bgColor: 'from-amber-50 to-orange-50',
        borderColor: 'border-amber-100',
        title: '오늘은 좀 쉬어가요',
        message: stressLevel === 'burnout' 
          ? '최근 일정이 많았어요. 가벼운 일만 해도 충분해요 💜'
          : '요즘 바쁘셨죠? 무리하지 마세요',
        type: 'warning'
      };
    }
    
    // 현재 피크 시간이면
    if (isCurrentlyPeak) {
      return {
        icon: Zap,
        iconColor: 'text-yellow-500',
        bgColor: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-100',
        title: '지금이 골든타임! ⚡',
        message: '에너지 높은 시간이에요. 중요한 일 지금 하면 좋아요',
        type: 'peak'
      };
    }
    
    // 집중 시간 추천
    if (bestFocusTime) {
      return {
        icon: Clock,
        iconColor: 'text-purple-500',
        bgColor: 'from-purple-50 to-indigo-50',
        borderColor: 'border-purple-100',
        title: '집중 추천 시간',
        message: bestFocusTime.day + ' ' + bestFocusTime.time + '가 집중하기 좋아요',
        type: 'focus'
      };
    }
    
    // 크로노타입 기반
    if (chronotype) {
      if (chronotype === 'morning' && currentHour < 12) {
        return {
          icon: Sun,
          iconColor: 'text-orange-400',
          bgColor: 'from-orange-50 to-yellow-50',
          borderColor: 'border-orange-100',
          title: '아침형 파워 🌅',
          message: '오전에 집중 잘 되시는 분! 중요한 일 지금 해요',
          type: 'chronotype'
        };
      }
      if (chronotype === 'evening' && currentHour >= 17) {
        return {
          icon: Moon,
          iconColor: 'text-indigo-400',
          bgColor: 'from-indigo-50 to-purple-50',
          borderColor: 'border-indigo-100',
          title: '저녁형 파워 🌙',
          message: '오후/저녁에 집중 잘 되시죠? 지금 최적이에요',
          type: 'chronotype'
        };
      }
    }
    
    // 분석 페이즈 기반 기본 메시지
    if (dnaAnalysisPhase === 'day1') {
      return {
        icon: Sparkles,
        iconColor: 'text-purple-400',
        bgColor: 'from-purple-50 to-pink-50',
        borderColor: 'border-purple-100',
        title: '알프레도가 배우는 중',
        message: '캘린더 분석 중이에요. 곧 맞춤 조언 드릴게요!',
        type: 'learning'
      };
    }
    
    if (dnaAnalysisPhase === 'week1') {
      return {
        icon: TrendingUp,
        iconColor: 'text-green-500',
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-100',
        title: '패턴을 발견했어요',
        message: '일주일 데이터로 Boss님 리듬을 알아가는 중!',
        type: 'learning'
      };
    }
    
    // 기본
    return {
      icon: Dna,
      iconColor: 'text-purple-500',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-100',
      title: 'DNA 분석 완료',
      message: '캘린더 기반으로 최적의 조언을 드려요',
      type: 'default'
    };
  }, [dnaProfile, dnaAnalysisPhase, currentHour, getChronotype, getBestFocusTime, getStressLevel, getPeakHours]);
  
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
