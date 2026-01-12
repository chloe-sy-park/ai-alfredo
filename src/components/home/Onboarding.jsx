import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  Sparkles, 
  Zap, 
  Heart,
  CheckCircle2,
  Circle,
  Shield,
  Bell,
  Coffee,
  Sun,
  Moon,
  CloudRain
} from 'lucide-react';

// Constants
import { COLORS } from '../../constants/colors';

// Common Components
import { AlfredoAvatar } from '../common';

// ============================================
// 🐧 온보딩 v3.0 (W2: Value First + Permission Priming)
// ============================================
// 
// 벤치마킹 적용:
// - Noom: 왜 이 질문을 하는지 설명
// - Wise: 가입 전 가치 먼저 체험
// - Calm: 앱 실행 즉시 가치 전달
// - Pi: 사용자에게 선택권 (agency)
// - Duolingo: 가치 경험 후 권한 요청
// ============================================

var Onboarding = function(props) {
  var onComplete = props.onComplete;
  var onCalendarConnect = props.onCalendarConnect;
  var isCalendarConnected = props.isCalendarConnected;
  var calendarEvents = props.calendarEvents || [];
  var weather = props.weather;
  
  var _useState = useState(0);
  var step = _useState[0];
  var setStep = _useState[1];
  
  var _useData = useState({
    condition: 3, // 1-5 scale
    todayFocus: '',
    calendarConnected: isCalendarConnected || false
  });
  var data = _useData[0];
  var setData = _useData[1];
  
  var _useShowSplash = useState(true);
  var showSplash = _useShowSplash[0];
  var setShowSplash = _useShowSplash[1];
  
  // Splash 3초 후 자동 전환
  useEffect(function() {
    var timer = setTimeout(function() {
      setShowSplash(false);
    }, 2500);
    return function() { clearTimeout(timer); };
  }, []);
  
  // 단계 정의
  var steps = [
    { id: 'value', label: '소개' },
    { id: 'calendar', label: '연동' },
    { id: 'condition', label: '컨디션' },
    { id: 'magic', label: '시작' }
  ];
  
  // 컨디션 옵션
  var conditionOptions = [
    { val: 1, emoji: '😴', label: '피곤해요', color: '#94A3B8' },
    { val: 2, emoji: '😔', label: '좀 힘들어요', color: '#A78BFA' },
    { val: 3, emoji: '😐', label: '보통이에요', color: '#60A5FA' },
    { val: 4, emoji: '🙂', label: '괜찮아요', color: '#34D399' },
    { val: 5, emoji: '😊', label: '좋아요!', color: '#FBBF24' }
  ];
  
  // 시간대 인사
  var getTimeGreeting = function() {
    var hour = new Date().getHours();
    if (hour < 6) return '이 시간에 깨어계시네요';
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 17) return '좋은 오후예요';
    if (hour < 21) return '좋은 저녁이에요';
    return '늦은 시간이네요';
  };
  
  // 다음 단계
  var handleNext = function() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };
  
  // 건너뛰기
  var handleSkip = function() {
    if (step === 1) { // 캘린더 연동 건너뛰기
      setStep(step + 1);
    }
  };
  
  // 캘린더 연동
  var handleCalendarConnect = function() {
    if (onCalendarConnect) {
      onCalendarConnect();
    }
    setData(Object.assign({}, data, { calendarConnected: true }));
    // 연동 후 잠시 대기 후 다음 단계
    setTimeout(function() {
      setStep(step + 1);
    }, 1000);
  };
  
  // ============================================
  // Splash Screen (3초)
  // ============================================
  if (showSplash) {
    return React.createElement('div', {
      className: 'h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#F8F7FC] to-[#F0EBFF]'
    },
      // 펭귄 등장 애니메이션
      React.createElement('div', {
        className: 'animate-in fade-in zoom-in-50 duration-700'
      },
        React.createElement('div', {
          className: 'w-32 h-32 bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] rounded-full flex items-center justify-center shadow-2xl shadow-[#A996FF]/30'
        },
          React.createElement('span', { className: 'text-6xl' }, '🐧')
        )
      ),
      
      // 인사 (fade in delay)
      React.createElement('div', {
        className: 'mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 text-center'
      },
        React.createElement('p', {
          className: 'text-xl font-bold text-gray-800'
        }, getTimeGreeting() + ', Boss!'),
        React.createElement('p', {
          className: 'text-sm text-gray-500 mt-1'
        }, '알프레도가 준비하고 있어요...')
      ),
      
      // 로딩 도트
      React.createElement('div', {
        className: 'mt-8 flex gap-1.5 animate-in fade-in duration-500 delay-1000'
      },
        [0, 1, 2].map(function(i) {
          return React.createElement('div', {
            key: i,
            className: 'w-2 h-2 bg-[#A996FF] rounded-full animate-bounce',
            style: { animationDelay: (i * 0.15) + 's' }
          });
        })
      )
    );
  }
  
  // ============================================
  // Step 0: Value Preview (가치 먼저 보여주기)
  // ============================================
  var renderValuePreview = function() {
    return React.createElement('div', {
      className: 'animate-in fade-in slide-in-from-right-4 duration-500'
    },
      // 알프레도 인사
      React.createElement('div', {
        className: 'flex items-start gap-3 mb-6'
      },
        React.createElement(AlfredoAvatar, { size: 'lg', expression: 'happy' }),
        React.createElement('div', {
          className: 'flex-1 bg-white rounded-2xl rounded-tl-md p-4 shadow-sm'
        },
          React.createElement('p', {
            className: 'text-[15px] text-gray-800 font-medium leading-relaxed'
          },
            '반가워요, Boss! 👋',
            React.createElement('br'),
            '저는 당신의 하루를 함께 관리해드릴 ',
            React.createElement('span', { className: 'text-[#A996FF] font-bold' }, '개인 집사'),
            ' 알프레도예요.'
          )
        )
      ),
      
      // Value Cards
      React.createElement('div', { className: 'space-y-3 mb-6' },
        // Card 1: 아침 브리핑
        React.createElement('div', {
          className: 'bg-white rounded-xl p-4 border border-[#E8E3FF] shadow-sm'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('div', {
              className: 'w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4B8] to-[#FFCF7D] flex items-center justify-center flex-shrink-0'
            },
              React.createElement(Sun, { size: 20, className: 'text-orange-600' })
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-semibold text-gray-800 text-sm' }, '아침마다 오늘 일정을 정리해드려요'),
              React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, '"오늘 미팅 2개, 오후에 여유 있어요"')
            )
          )
        ),
        
        // Card 2: 맥락 알림
        React.createElement('div', {
          className: 'bg-white rounded-xl p-4 border border-[#E8E3FF] shadow-sm'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('div', {
              className: 'w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4E0FF] to-[#93C5FD] flex items-center justify-center flex-shrink-0'
            },
              React.createElement(Bell, { size: 20, className: 'text-blue-600' })
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-semibold text-gray-800 text-sm' }, '중요한 일은 미리 알려드려요'),
              React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, '"30분 후 미팅이에요, 준비하세요"')
            )
          )
        ),
        
        // Card 3: 컨디션 맞춤
        React.createElement('div', {
          className: 'bg-white rounded-xl p-4 border border-[#E8E3FF] shadow-sm'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('div', {
              className: 'w-10 h-10 rounded-xl bg-gradient-to-br from-[#E9D5FF] to-[#C4B5FD] flex items-center justify-center flex-shrink-0'
            },
              React.createElement(Heart, { size: 20, className: 'text-purple-600' })
            ),
            React.createElement('div', null,
              React.createElement('p', { className: 'font-semibold text-gray-800 text-sm' }, '컨디션에 맞게 하루를 조절해요'),
              React.createElement('p', { className: 'text-xs text-gray-500 mt-0.5' }, '"오늘은 무리하지 말고 천천히 가요"')
            )
          )
        )
      ),
      
      // 부가 설명
      React.createElement('div', {
        className: 'text-center'
      },
        React.createElement('p', {
          className: 'text-xs text-gray-400'
        }, '* 캘린더를 연결하면 더 정확하게 도와드릴 수 있어요')
      )
    );
  };
  
  // ============================================
  // Step 1: Calendar Permission Priming
  // ============================================
  var renderCalendarPriming = function() {
    var isConnected = data.calendarConnected || isCalendarConnected;
    
    return React.createElement('div', {
      className: 'animate-in fade-in slide-in-from-right-4 duration-500'
    },
      // 알프레도 설명
      React.createElement('div', {
        className: 'flex items-start gap-3 mb-6'
      },
        React.createElement(AlfredoAvatar, { size: 'md' }),
        React.createElement('div', {
          className: 'flex-1 bg-white rounded-2xl rounded-tl-md p-4 shadow-sm'
        },
          React.createElement('p', {
            className: 'text-sm text-gray-700 leading-relaxed'
          },
            '캘린더를 연결하면 ',
            React.createElement('span', { className: 'font-semibold text-[#A996FF]' }, '제가 일정을 미리 파악'),
            '해서 더 똑똑하게 도와드릴 수 있어요.'
          )
        )
      ),
      
      // Why 카드 (Noom 스타일 - 왜 이걸 요청하는지 설명)
      React.createElement('div', {
        className: 'bg-[#F8F7FC] rounded-xl p-4 mb-5 border border-[#E8E3FF]'
      },
        React.createElement('p', {
          className: 'text-xs font-semibold text-[#8B7BE8] mb-3 flex items-center gap-1.5'
        },
          React.createElement(Sparkles, { size: 14 }),
          '캘린더를 연결하면'
        ),
        React.createElement('div', { className: 'space-y-2.5' },
          [
            { icon: Clock, text: '미팅 30분 전에 미리 알려드려요' },
            { icon: Calendar, text: '바쁜 날 vs 여유로운 날 파악해요' },
            { icon: Coffee, text: '쉬는 시간도 챙겨드려요' }
          ].map(function(item, i) {
            return React.createElement('div', {
              key: i,
              className: 'flex items-center gap-2.5'
            },
              React.createElement(item.icon, { size: 16, className: 'text-[#A996FF]' }),
              React.createElement('span', { className: 'text-sm text-gray-600' }, item.text)
            );
          })
        )
      ),
      
      // 연결 버튼 또는 완료 상태
      isConnected ? (
        React.createElement('div', {
          className: 'bg-green-50 border border-green-200 rounded-xl p-4 text-center'
        },
          React.createElement('div', { className: 'flex items-center justify-center gap-2 text-green-600' },
            React.createElement(CheckCircle2, { size: 20 }),
            React.createElement('span', { className: 'font-semibold' }, '캘린더 연결됨!')
          ),
          calendarEvents.length > 0 && React.createElement('p', {
            className: 'text-xs text-green-600 mt-2'
          }, '오늘 일정 ' + calendarEvents.length + '개를 확인했어요')
        )
      ) : (
        React.createElement('div', null,
          React.createElement('button', {
            onClick: handleCalendarConnect,
            className: 'w-full py-4 bg-white border-2 border-[#A996FF] rounded-xl flex items-center justify-center gap-3 hover:bg-[#F8F7FC] transition-colors'
          },
            React.createElement('div', {
              className: 'w-8 h-8 bg-[#F0EBFF] rounded-lg flex items-center justify-center'
            },
              React.createElement(Calendar, { size: 18, className: 'text-[#A996FF]' })
            ),
            React.createElement('span', { className: 'font-semibold text-gray-700' }, 'Google 캘린더 연결하기')
          ),
          
          // 프라이버시 안심 메시지
          React.createElement('div', {
            className: 'flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400'
          },
            React.createElement(Shield, { size: 12 }),
            React.createElement('span', null, '캘린더 데이터는 절대 외부에 공유되지 않아요')
          )
        )
      )
    );
  };
  
  // ============================================
  // Step 2: Condition Check (왜 묻는지 설명)
  // ============================================
  var renderConditionCheck = function() {
    return React.createElement('div', {
      className: 'animate-in fade-in slide-in-from-right-4 duration-500'
    },
      // 알프레도 질문 + 이유
      React.createElement('div', {
        className: 'flex items-start gap-3 mb-4'
      },
        React.createElement(AlfredoAvatar, { size: 'md' }),
        React.createElement('div', {
          className: 'flex-1 bg-white rounded-2xl rounded-tl-md p-4 shadow-sm'
        },
          React.createElement('p', {
            className: 'text-sm text-gray-700 leading-relaxed'
          }, '오늘 컨디션은 어때요?')
        )
      ),
      
      // Why 설명 (Noom 스타일)
      React.createElement('div', {
        className: 'bg-[#F8F7FC] rounded-lg px-3 py-2 mb-5 flex items-center gap-2'
      },
        React.createElement(Sparkles, { size: 14, className: 'text-[#A996FF] flex-shrink-0' }),
        React.createElement('p', {
          className: 'text-xs text-gray-500'
        }, '컨디션에 따라 오늘 할 일 양을 조절해드려요')
      ),
      
      // 컨디션 선택 (5단계)
      React.createElement('div', { className: 'space-y-2 mb-6' },
        conditionOptions.map(function(opt) {
          var isSelected = data.condition === opt.val;
          return React.createElement('button', {
            key: opt.val,
            onClick: function() { setData(Object.assign({}, data, { condition: opt.val })); },
            className: 'w-full p-4 rounded-xl flex items-center gap-4 transition-all ' + (
              isSelected 
                ? 'bg-[#A996FF] text-white shadow-lg scale-[1.02]' 
                : 'bg-white border border-gray-100 text-gray-700 hover:border-[#A996FF]/30'
            )
          },
            React.createElement('span', { className: 'text-2xl' }, opt.emoji),
            React.createElement('span', { className: 'font-medium' }, opt.label),
            isSelected && React.createElement(CheckCircle2, { 
              size: 20, 
              className: 'ml-auto' 
            })
          );
        })
      ),
      
      // 컨디션별 알프레도 반응
      React.createElement('div', {
        className: 'bg-white/80 rounded-xl p-4 border border-[#E8E3FF]'
      },
        React.createElement('div', { className: 'flex items-center gap-2 mb-2' },
          React.createElement('span', null, '🐧'),
          React.createElement('span', { className: 'text-xs font-medium text-[#8B7BE8]' }, '알프레도')
        ),
        React.createElement('p', { className: 'text-sm text-gray-600' },
          data.condition <= 2 
            ? '오늘은 무리하지 마요. 꼭 해야 할 것만 챙길게요.'
            : data.condition === 3
            ? '알겠어요. 적당히 조절해서 정리해드릴게요.'
            : '좋아요! 오늘 하고 싶은 거 다 해봐요.'
        )
      )
    );
  };
  
  // ============================================
  // Step 3: First Magic (즉시 결과 보여주기)
  // ============================================
  var renderFirstMagic = function() {
    var hour = new Date().getHours();
    var timeContext = hour < 12 ? '아침' : hour < 17 ? '오후' : '저녁';
    
    // 캘린더 기반 즉석 인사이트
    var todayEventCount = calendarEvents.filter(function(e) {
      var eventDate = new Date(e.start?.dateTime || e.start?.date);
      var today = new Date();
      return eventDate.toDateString() === today.toDateString();
    }).length;
    
    var nextEvent = calendarEvents.find(function(e) {
      var eventTime = new Date(e.start?.dateTime || e.start?.date);
      return eventTime > new Date();
    });
    
    return React.createElement('div', {
      className: 'animate-in fade-in slide-in-from-right-4 duration-500'
    },
      // 성공 표시
      React.createElement('div', { className: 'text-center mb-6' },
        React.createElement('div', {
          className: 'w-20 h-20 mx-auto bg-gradient-to-br from-[#A996FF] to-[#8B7BE8] rounded-full flex items-center justify-center shadow-xl mb-3'
        },
          React.createElement('span', { className: 'text-4xl' }, '✨')
        ),
        React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, '준비 완료!'),
        React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, '이제 함께 시작해볼까요?')
      ),
      
      // 즉시 인사이트 카드 (Magic Moment)
      React.createElement('div', {
        className: 'bg-white rounded-xl p-4 border border-[#E8E3FF] shadow-sm mb-4'
      },
        React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
          React.createElement('span', null, '🐧'),
          React.createElement('span', { className: 'text-sm font-semibold text-[#8B7BE8]' }, '오늘의 브리핑')
        ),
        
        React.createElement('div', { className: 'space-y-2.5' },
          // 일정 요약
          (data.calendarConnected || isCalendarConnected) && React.createElement('div', {
            className: 'flex items-center gap-2 text-sm'
          },
            React.createElement(Calendar, { size: 16, className: 'text-[#A996FF]' }),
            React.createElement('span', { className: 'text-gray-700' },
              todayEventCount > 0 
                ? '오늘 일정 ' + todayEventCount + '개 있어요'
                : '오늘은 일정이 비어있어요'
            )
          ),
          
          // 다음 일정
          nextEvent && React.createElement('div', {
            className: 'flex items-center gap-2 text-sm'
          },
            React.createElement(Clock, { size: 16, className: 'text-[#A996FF]' }),
            React.createElement('span', { className: 'text-gray-700' },
              '다음: ' + (nextEvent.summary || '일정')
            )
          ),
          
          // 날씨 (있으면)
          weather && React.createElement('div', {
            className: 'flex items-center gap-2 text-sm'
          },
            React.createElement(CloudRain, { size: 16, className: 'text-[#A996FF]' }),
            React.createElement('span', { className: 'text-gray-700' },
              weather.description + ', ' + Math.round(weather.temp) + '°C'
            )
          ),
          
          // 컨디션 기반 조언
          React.createElement('div', {
            className: 'flex items-center gap-2 text-sm'
          },
            React.createElement(Heart, { size: 16, className: 'text-[#A996FF]' }),
            React.createElement('span', { className: 'text-gray-700' },
              data.condition <= 2 
                ? '오늘은 가볍게 갈게요'
                : data.condition >= 4
                ? '오늘 컨디션 좋으시네요!'
                : '적당히 조절해서 갈게요'
            )
          )
        )
      ),
      
      // 알프레도 메시지
      React.createElement('div', {
        className: 'flex items-start gap-3'
      },
        React.createElement(AlfredoAvatar, { size: 'md', expression: 'happy' }),
        React.createElement('div', {
          className: 'flex-1 bg-white rounded-2xl rounded-tl-md p-4 shadow-sm'
        },
          React.createElement('p', {
            className: 'text-sm text-gray-700'
          },
            data.condition <= 2 
              ? '무리하지 마세요. 옆에서 챙겨드릴게요.'
              : '좋아요! 오늘 하루도 함께 해드릴게요. 💜'
          )
        )
      )
    );
  };
  
  // ============================================
  // Main Render
  // ============================================
  var renderStep = function() {
    switch (step) {
      case 0: return renderValuePreview();
      case 1: return renderCalendarPriming();
      case 2: return renderConditionCheck();
      case 3: return renderFirstMagic();
      default: return null;
    }
  };
  
  // 다음 버튼 텍스트
  var getNextButtonText = function() {
    switch (step) {
      case 0: return '시작하기';
      case 1: return data.calendarConnected || isCalendarConnected ? '다음' : '나중에 연결하기';
      case 2: return '다음';
      case 3: return '하루 시작하기 🚀';
      default: return '다음';
    }
  };
  
  // 다음 버튼 활성화 여부
  var isNextEnabled = function() {
    return true; // 모든 단계 진행 가능
  };
  
  return React.createElement('div', {
    className: 'h-full flex flex-col bg-gradient-to-b from-[#F8F7FC] to-[#F0EBFF] overflow-hidden'
  },
    // Progress Bar
    React.createElement('div', {
      className: 'px-6 pt-6 pb-4 flex-shrink-0'
    },
      // Step Label + Skip
      React.createElement('div', {
        className: 'flex justify-between items-center mb-2'
      },
        React.createElement('span', {
          className: 'text-xs text-gray-400 font-medium'
        }, steps[step].label),
        step === 1 && !data.calendarConnected && !isCalendarConnected && React.createElement('button', {
          onClick: handleSkip,
          className: 'text-xs text-gray-400 hover:text-[#A996FF] transition-colors'
        }, '건너뛰기')
      ),
      
      // Progress Dots
      React.createElement('div', { className: 'flex gap-2' },
        steps.map(function(s, i) {
          return React.createElement('div', {
            key: s.id,
            className: 'h-1.5 flex-1 rounded-full transition-all duration-300 ' + (
              i <= step ? 'bg-[#A996FF]' : 'bg-[#E5E0FF]'
            )
          });
        })
      )
    ),
    
    // Content
    React.createElement('div', {
      className: 'flex-1 overflow-y-auto px-6 pb-4'
    }, renderStep()),
    
    // Bottom Button
    React.createElement('div', {
      className: 'flex-shrink-0 p-6 bg-gradient-to-t from-[#F8F7FC] to-transparent'
    },
      React.createElement('button', {
        onClick: handleNext,
        disabled: !isNextEnabled(),
        className: 'w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ' + (
          isNextEnabled()
            ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 hover:bg-[#8B7BE8] active:scale-[0.98]'
            : 'bg-[#E5E0FF] text-gray-400'
        )
      },
        React.createElement('span', null, getNextButtonText()),
        step < 3 && React.createElement(ArrowRight, { size: 20 })
      )
    )
  );
};

export default Onboarding;
