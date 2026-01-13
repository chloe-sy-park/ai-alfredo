import React, { useState, useEffect } from 'react';
import { X, Droplets, Moon, Footprints, Pill, Plus, Minus, Check, Clock } from 'lucide-react';

var HealthEditModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var onSave = props.onSave;
  var healthData = props.healthData || {};
  var darkMode = props.darkMode;
  
  // 로컬 상태
  var waterState = useState(healthData.waterIntake || 0);
  var water = waterState[0];
  var setWater = waterState[1];
  
  var sleepState = useState(healthData.sleepHours || 0);
  var sleep = sleepState[0];
  var setSleep = sleepState[1];
  
  var stepsState = useState(healthData.steps || 0);
  var steps = stepsState[0];
  var setSteps = stepsState[1];
  
  var medicationState = useState(healthData.medication || false);
  var medication = medicationState[0];
  var setMedication = medicationState[1];
  
  var waterGoalState = useState(healthData.waterGoal || 8);
  var waterGoal = waterGoalState[0];
  var setWaterGoal = waterGoalState[1];
  
  // 모달 열릴 때 초기화
  useEffect(function() {
    if (isOpen) {
      setWater(healthData.waterIntake || 0);
      setSleep(healthData.sleepHours || 0);
      setSteps(healthData.steps || 0);
      setMedication(healthData.medication || false);
      setWaterGoal(healthData.waterGoal || 8);
    }
  }, [isOpen, healthData]);
  
  if (!isOpen) return null;
  
  var bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  var textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  var textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  var borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  var cardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  
  var handleSave = function() {
    if (onSave) {
      onSave({
        waterIntake: water,
        waterGoal: waterGoal,
        sleepHours: sleep,
        steps: steps,
        medication: medication
      });
    }
  };
  
  // 숫자 버튼
  var NumberControl = function(controlProps) {
    var value = controlProps.value;
    var onChange = controlProps.onChange;
    var min = controlProps.min || 0;
    var max = controlProps.max || 999999;
    var step = controlProps.step || 1;
    var unit = controlProps.unit || '';
    var color = controlProps.color || 'text-[#A996FF]';
    
    return React.createElement('div', { 
      className: 'flex items-center gap-3'
    },
      React.createElement('button', {
        onClick: function() { onChange(Math.max(min, value - step)); },
        className: 'w-10 h-10 rounded-full flex items-center justify-center transition-all ' +
          (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
      }, React.createElement(Minus, { size: 18, className: textSecondary })),
      
      React.createElement('div', { className: 'flex items-baseline gap-1 min-w-[80px] justify-center' },
        React.createElement('span', { className: textPrimary + ' text-2xl font-bold tabular-nums' },
          typeof value === 'number' ? value.toLocaleString() : value
        ),
        unit && React.createElement('span', { className: textSecondary + ' text-sm' }, unit)
      ),
      
      React.createElement('button', {
        onClick: function() { onChange(Math.min(max, value + step)); },
        className: 'w-10 h-10 rounded-full flex items-center justify-center transition-all ' +
          (darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
      }, React.createElement(Plus, { size: 18, className: textSecondary }))
    );
  };
  
  // 알프레도 피드백
  var getAlfredoFeedback = function() {
    var messages = [];
    
    if (water >= waterGoal) {
      messages.push('💧 물 목표 달성! 수분 섭취 잘 하셨어요!');
    } else if (water < waterGoal / 2) {
      messages.push('💧 물 좀 더 마셔요! 수분이 부족해요.');
    }
    
    if (sleep >= 7) {
      messages.push('😴 충분한 수면! 에너지 충전 완료!');
    } else if (sleep > 0 && sleep < 6) {
      messages.push('😴 수면이 부족해요. 오늘은 일찍 자봐요.');
    }
    
    if (steps >= 10000) {
      messages.push('🚶 만보 달성! 대단해요!');
    } else if (steps >= 5000) {
      messages.push('🚶 반이나 걸었어요! 조금만 더!');
    }
    
    if (medication) {
      messages.push('💊 약 잘 챙겼어요!');
    }
    
    if (messages.length === 0) {
      return '오늘의 건강 데이터를 기록해주세요! 🐧';
    }
    
    return messages[0];
  };
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-end justify-center'
  },
    // 배경
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/50',
      onClick: onClose
    }),
    
    // 모달
    React.createElement('div', {
      className: bgColor + ' rounded-t-3xl w-full max-w-lg max-h-[85vh] flex flex-col relative animate-slide-up'
    },
      // 핸들
      React.createElement('div', { className: 'flex justify-center py-3' },
        React.createElement('div', { className: 'w-10 h-1 rounded-full bg-gray-300' })
      ),
      
      // 헤더
      React.createElement('div', { className: 'px-5 pb-4 flex items-center justify-between' },
        React.createElement('h2', { className: textPrimary + ' text-xl font-bold' }, '건강 기록'),
        React.createElement('button', {
          onClick: onClose,
          className: textSecondary + ' p-2 hover:bg-gray-100 rounded-full transition-colors'
        }, React.createElement(X, { size: 20 }))
      ),
      
      // 콘텐츠
      React.createElement('div', { className: 'flex-1 overflow-y-auto px-5 pb-8' },
        // 알프레도 피드백
        React.createElement('div', { 
          className: 'bg-gradient-to-r from-[#A996FF]/20 to-[#8B7CF7]/10 rounded-2xl p-4 mb-6'
        },
          React.createElement('div', { className: 'flex items-start gap-3' },
            React.createElement('span', { className: 'text-2xl' }, '🐧'),
            React.createElement('p', { className: textPrimary + ' text-sm' }, getAlfredoFeedback())
          )
        ),
        
        // 물 섭취
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-3 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
            React.createElement('div', { 
              className: 'w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center'
            }, React.createElement(Droplets, { size: 20, className: 'text-blue-500' })),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('p', { className: textPrimary + ' font-semibold' }, '물 섭취'),
              React.createElement('p', { className: textSecondary + ' text-xs' }, 
                '목표: ' + waterGoal + '잔 ' + (water >= waterGoal ? '✅' : '')
              )
            )
          ),
          React.createElement(NumberControl, {
            value: water,
            onChange: setWater,
            min: 0,
            max: 20,
            step: 1,
            unit: '잔'
          })
        ),
        
        // 수면
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-3 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
            React.createElement('div', { 
              className: 'w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center'
            }, React.createElement(Moon, { size: 20, className: 'text-purple-500' })),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('p', { className: textPrimary + ' font-semibold' }, '수면 시간'),
              React.createElement('p', { className: textSecondary + ' text-xs' }, 
                sleep >= 7 ? '충분해요! 👍' : sleep > 0 ? '조금 부족해요' : '어젯밤 수면 시간'
              )
            )
          ),
          React.createElement(NumberControl, {
            value: sleep,
            onChange: setSleep,
            min: 0,
            max: 24,
            step: 0.5,
            unit: '시간'
          })
        ),
        
        // 걸음 수
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-3 border ' + borderColor },
          React.createElement('div', { className: 'flex items-center gap-3 mb-3' },
            React.createElement('div', { 
              className: 'w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center'
            }, React.createElement(Footprints, { size: 20, className: 'text-emerald-500' })),
            React.createElement('div', { className: 'flex-1' },
              React.createElement('p', { className: textPrimary + ' font-semibold' }, '걸음 수'),
              React.createElement('p', { className: textSecondary + ' text-xs' }, 
                steps >= 10000 ? '🎉 만보 달성!' : '목표: 10,000보'
              )
            )
          ),
          React.createElement(NumberControl, {
            value: steps,
            onChange: setSteps,
            min: 0,
            max: 100000,
            step: 1000,
            unit: '보'
          })
        ),
        
        // 약 복용
        React.createElement('div', { className: cardBg + ' rounded-2xl p-4 mb-6 border ' + borderColor },
          React.createElement('button', {
            onClick: function() { setMedication(!medication); },
            className: 'w-full flex items-center gap-3'
          },
            React.createElement('div', { 
              className: 'w-10 h-10 rounded-full flex items-center justify-center ' +
                (medication ? 'bg-amber-500 text-white' : 'bg-amber-500/20')
            }, 
              medication 
                ? React.createElement(Check, { size: 20 })
                : React.createElement(Pill, { size: 20, className: 'text-amber-500' })
            ),
            React.createElement('div', { className: 'flex-1 text-left' },
              React.createElement('p', { className: textPrimary + ' font-semibold' }, '약/영양제'),
              React.createElement('p', { className: textSecondary + ' text-xs' }, 
                medication ? '✅ 복용 완료!' : '탭해서 복용 체크'
              )
            ),
            React.createElement('div', {
              className: 'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ' +
                (medication 
                  ? 'bg-amber-500 border-amber-500' 
                  : (darkMode ? 'border-gray-600' : 'border-gray-300'))
            },
              medication && React.createElement(Check, { size: 14, className: 'text-white' })
            )
          )
        ),
        
        // 저장 버튼
        React.createElement('button', {
          onClick: handleSave,
          className: 'w-full py-4 bg-[#A996FF] text-white rounded-xl font-semibold text-lg shadow-lg'
        }, '저장하기')
      )
    )
  );
};

export default HealthEditModal;
