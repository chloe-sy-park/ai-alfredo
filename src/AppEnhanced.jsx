/**
 * 🐧 AppEnhanced.jsx - 새 기능들이 통합된 확장 App
 * 
 * 원본 App.jsx를 import하고 새 기능들을 래핑
 * 
 * 새로 추가된 기능:
 * - OnboardingV3 (첫 방문 시)
 * - YearInPixels (연간 기분 시각화)
 * - WeeklyReport (주간 인사이트)
 * - MagicToDo (작업 분해)
 * - AlfredoPersonalitySelector (성격 설정)
 * - AlfredoMemoryDisplay (기억 표시)
 */

import React, { useState, useEffect } from 'react';

// 새 컴포넌트들
import { OnboardingV3 } from './components/onboarding';
import { YearInPixels, WeeklyReport } from './components/insights';
import { MagicToDo } from './components/adhd';
import { AlfredoPersonalitySelector, AlfredoMemoryDisplay } from './components/character';
import { useOnboardingStatus } from './components/common/OnboardingCheck';

// Store
import { usePersonalityStore } from './stores';
import { useMemoryStore } from './stores';
import { useBehaviorStore } from './stores';
import { useForgivingStore } from './stores';

/**
 * 확장된 라우터 훅 - App.jsx에서 사용
 */
export function useEnhancedRouter() {
  const [enhancedView, setEnhancedView] = useState(null);
  const { isComplete, completeOnboarding, resetOnboarding } = useOnboardingStatus();
  
  // 새 페이지 라우터
  const enhancedViews = {
    ONBOARDING: 'ONBOARDING',
    YEAR_IN_PIXELS: 'YEAR_IN_PIXELS',
    WEEKLY_REPORT_V2: 'WEEKLY_REPORT_V2',
    MAGIC_TODO: 'MAGIC_TODO',
    PERSONALITY_SETTINGS: 'PERSONALITY_SETTINGS',
    MEMORY_VIEW: 'MEMORY_VIEW'
  };
  
  // 첫 방문 체크
  useEffect(() => {
    if (!isComplete) {
      setEnhancedView('ONBOARDING');
    }
  }, [isComplete]);
  
  const openEnhancedView = (viewName) => {
    setEnhancedView(viewName);
  };
  
  const closeEnhancedView = () => {
    setEnhancedView(null);
  };
  
  const handleOnboardingComplete = (data) => {
    completeOnboarding();
    setEnhancedView(null);
    
    // Store에 온보딩 데이터 저장
    if (data) {
      const { setMode } = usePersonalityStore.getState();
      const { addMemory } = useMemoryStore.getState();
      
      if (data.personality) {
        setMode(data.personality);
      }
      
      if (data.chronotype) {
        addMemory({
          type: 'preference',
          content: `크로노타입: ${data.chronotype}`,
          importance: 3
        });
      }
      
      if (data.primaryNeed) {
        addMemory({
          type: 'preference',
          content: `주요 니즈: ${data.primaryNeed}`,
          importance: 3
        });
      }
    }
  };
  
  return {
    enhancedView,
    enhancedViews,
    openEnhancedView,
    closeEnhancedView,
    handleOnboardingComplete,
    resetOnboarding,
    isOnboardingComplete: isComplete
  };
}

/**
 * 확장 페이지 렌더러
 */
export function EnhancedPageRenderer({ 
  view, 
  darkMode, 
  onClose, 
  onComplete,
  tasks = [],
  ...props 
}) {
  switch (view) {
    case 'ONBOARDING':
      return (
        <div className="fixed inset-0 z-[100]">
          <OnboardingV3
            onComplete={onComplete}
            onSkip={onComplete}
            darkMode={darkMode}
          />
        </div>
      );
      
    case 'YEAR_IN_PIXELS':
      return (
        <div className="fixed inset-0 z-50 overflow-auto">
          <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]'} p-4`}>
            <div className="max-w-lg mx-auto">
              <button
                onClick={onClose}
                className={`mb-4 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
              >
                ← 뒤로
              </button>
              <YearInPixels darkMode={darkMode} />
            </div>
          </div>
        </div>
      );
      
    case 'WEEKLY_REPORT_V2':
      return (
        <div className="fixed inset-0 z-50 overflow-auto">
          <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]'} p-4`}>
            <div className="max-w-lg mx-auto">
              <button
                onClick={onClose}
                className={`mb-4 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
              >
                ← 뒤로
              </button>
              <WeeklyReport darkMode={darkMode} />
            </div>
          </div>
        </div>
      );
      
    case 'MAGIC_TODO':
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <MagicToDo
              onAddSteps={(steps) => {
                console.log('Add steps:', steps);
                onClose();
              }}
              darkMode={darkMode}
            />
          </div>
        </div>
      );
      
    case 'PERSONALITY_SETTINGS':
      return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <AlfredoPersonalitySelector
              onSelect={onClose}
              darkMode={darkMode}
            />
          </div>
        </div>
      );
      
    case 'MEMORY_VIEW':
      return (
        <div className="fixed inset-0 z-50 overflow-auto">
          <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]'} p-4`}>
            <div className="max-w-lg mx-auto">
              <button
                onClick={onClose}
                className={`mb-4 px-4 py-2 rounded-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
              >
                ← 뒤로
              </button>
              <AlfredoMemoryDisplay darkMode={darkMode} />
            </div>
          </div>
        </div>
      );
      
    default:
      return null;
  }
}

/**
 * More 페이지용 새 메뉴 아이템들
 */
export function getEnhancedMenuItems(openEnhancedView) {
  return [
    {
      id: 'year-in-pixels',
      icon: '📅',
      title: 'Year in Pixels',
      subtitle: '연간 기분 시각화',
      color: 'from-purple-500 to-pink-500',
      onClick: () => openEnhancedView('YEAR_IN_PIXELS')
    },
    {
      id: 'weekly-report',
      icon: '📊',
      title: '주간 리포트',
      subtitle: '패턴 분석 & 인사이트',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => openEnhancedView('WEEKLY_REPORT_V2')
    },
    {
      id: 'magic-todo',
      icon: '✨',
      title: 'Magic ToDo',
      subtitle: '작업 자동 분해',
      color: 'from-amber-500 to-orange-500',
      onClick: () => openEnhancedView('MAGIC_TODO')
    },
    {
      id: 'personality',
      icon: '🐧',
      title: '알프레도 성격',
      subtitle: '말투 & 스타일 설정',
      color: 'from-violet-500 to-purple-500',
      onClick: () => openEnhancedView('PERSONALITY_SETTINGS')
    },
    {
      id: 'memory',
      icon: '🧠',
      title: '알프레도 기억',
      subtitle: '내가 기억하는 것들',
      color: 'from-teal-500 to-emerald-500',
      onClick: () => openEnhancedView('MEMORY_VIEW')
    }
  ];
}

export default {
  useEnhancedRouter,
  EnhancedPageRenderer,
  getEnhancedMenuItems
};
