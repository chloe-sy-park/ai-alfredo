/**
 * 🎛️ 알프레도 개인화 시스템 (노션 가이드 기준 4축)
 * 
 * 4가지 축:
 * 1. dataDepth: 데이터 깊이 (에센셜 ↔ 밸런스 ↔ 풀 데이터)
 * 2. notificationStyle: 알림 스타일 (젠틀 ↔ 중립 ↔ 코치)
 * 3. visualStyle: 시각화 스타일 (채팅 ↔ 카드 ↔ 대시보드)
 * 4. motivationStyle: 동기부여 스타일 (플로우 ↔ 균형 ↔ 게이미피케이션)
 */

// ============================================
// 축 정의
// ============================================

var AXES = {
  dataDepth: {
    key: 'dataDepth',
    name: '데이터 깊이',
    description: '얼마나 자세히 볼 것인가',
    left: { value: 0, emoji: '😌', label: '에센셜', desc: '핵심 숫자만' },
    center: { value: 50, emoji: '📊', label: '밸런스', desc: '주요 인사이트' },
    right: { value: 100, emoji: '🔬', label: '풀 데이터', desc: '모든 것을 보여줘' }
  },
  notificationStyle: {
    key: 'notificationStyle',
    name: '알림 스타일',
    description: '어떻게 말할 것인가',
    left: { value: 0, emoji: '🌸', label: '젠틀', desc: '제안해요' },
    center: { value: 50, emoji: '⚖️', label: '중립', desc: '알려드려요' },
    right: { value: 100, emoji: '🔥', label: '코치', desc: '해야 해요' }
  },
  visualStyle: {
    key: 'visualStyle',
    name: '시각화 스타일',
    description: '어떻게 보여줄 것인가',
    left: { value: 0, emoji: '💬', label: '채팅', desc: '말로 알려줘' },
    center: { value: 50, emoji: '🎴', label: '카드형', desc: '요약 카드' },
    right: { value: 100, emoji: '📈', label: '대시보드', desc: '차트로 보여줘' }
  },
  motivationStyle: {
    key: 'motivationStyle',
    name: '동기부여 스타일',
    description: '무엇이 움직이게 하는가',
    left: { value: 0, emoji: '🌊', label: '플로우', desc: '흐름대로' },
    center: { value: 50, emoji: '⚖️', label: '균형', desc: '적당한 목표' },
    right: { value: 100, emoji: '🏆', label: '게이미피케이션', desc: '도전과 보상' }
  }
};

// ============================================
// 프리셋 정의
// ============================================

var PRESETS = {
  qsMania: {
    key: 'qsMania',
    emoji: '🔬',
    name: 'QS 매니아',
    description: '모든 데이터를 분석하고 싶어요',
    longDesc: '스프레드시트 좋아하고, 상관관계 분석하고, 모든 원시 데이터에 접근하고 싶은 분',
    values: {
      dataDepth: 100,        // 풀 데이터
      notificationStyle: 80, // 코치에 가깝게
      visualStyle: 100,      // 대시보드
      motivationStyle: 100   // 게이미피케이션
    }
  },
  balance: {
    key: 'balance',
    emoji: '📊',
    name: '밸런스',
    description: '인사이트는 좋지만 직접 분석은 귀찮아요',
    longDesc: '주요 패턴은 알고 싶지만, 복잡한 건 알아서 해주면 좋겠는 분',
    values: {
      dataDepth: 50,         // 밸런스
      notificationStyle: 50, // 중립
      visualStyle: 50,       // 카드형
      motivationStyle: 50    // 균형
    },
    isDefault: true
  },
  minimal: {
    key: 'minimal',
    emoji: '✨',
    name: '미니멀',
    description: '복잡한 건 싫어요. 핵심만 알려주세요',
    longDesc: '앱에 시간 쓰기 싫고, 딱 필요한 것만 빠르게 확인하고 싶은 분',
    values: {
      dataDepth: 0,          // 에센셜
      notificationStyle: 0,  // 젠틀
      visualStyle: 0,        // 채팅
      motivationStyle: 0     // 플로우
    }
  },
  achiever: {
    key: 'achiever',
    emoji: '🏆',
    name: '성과 지향형',
    description: '목표와 도전이 동기부여돼요',
    longDesc: '스트릭, 배지, 리더보드가 있으면 더 열심히 하게 되는 분',
    values: {
      dataDepth: 50,         // 밸런스
      notificationStyle: 80, // 코치에 가깝게
      visualStyle: 50,       // 카드형
      motivationStyle: 100   // 게이미피케이션
    }
  },
  selfCare: {
    key: 'selfCare',
    emoji: '🌱',
    name: '자기돌봄형',
    description: '부드럽게, 압박 없이 가고 싶어요',
    longDesc: '웰빙과 균형을 중시하고, 죄책감 없이 유연하게 하고 싶은 분',
    values: {
      dataDepth: 20,         // 에센셜에 가깝게
      notificationStyle: 0,  // 젠틀
      visualStyle: 0,        // 채팅
      motivationStyle: 0     // 플로우
    }
  }
};

// ============================================
// 영역별 기본값 (업무/라이프/운동)
// ============================================

var AREA_DEFAULTS = {
  work: {
    key: 'work',
    emoji: '💼',
    name: '업무',
    color: '#3B82F6',
    values: {
      dataDepth: 70,         // 풀 데이터에 가깝게
      notificationStyle: 70, // 코치에 가깝게
      visualStyle: 50,       // 카드형
      motivationStyle: 70    // 게이미피케이션에 가깝게
    }
  },
  life: {
    key: 'life',
    emoji: '🌿',
    name: '라이프',
    color: '#10B981',
    values: {
      dataDepth: 30,         // 에센셜에 가깝게
      notificationStyle: 20, // 젠틀에 가깝게
      visualStyle: 30,       // 채팅에 가깝게
      motivationStyle: 30    // 플로우에 가깝게
    }
  },
  health: {
    key: 'health',
    emoji: '🏃',
    name: '운동/건강',
    color: '#F59E0B',
    values: {
      dataDepth: 60,         // 밸런스~풀데이터
      notificationStyle: 50, // 중립
      visualStyle: 70,       // 대시보드에 가깝게
      motivationStyle: 80    // 게이미피케이션에 가깝게
    }
  }
};

// ============================================
// 스토리지 키
// ============================================

var STORAGE_KEYS = {
  globalStyle: 'alfredo_personalization_global',
  workStyle: 'alfredo_personalization_work',
  lifeStyle: 'alfredo_personalization_life',
  healthStyle: 'alfredo_personalization_health',
  currentPreset: 'alfredo_current_preset',
  areaEnabled: 'alfredo_area_personalization_enabled',
  onboardingComplete: 'alfredo_onboarding_complete'
};

// ============================================
// 헬퍼 함수들
// ============================================

/**
 * 값에서 레벨 라벨 가져오기 (0-33: left, 34-66: center, 67-100: right)
 */
function getAxisLevel(axisKey, value) {
  var axis = AXES[axisKey];
  if (!axis) return null;
  
  if (value <= 33) {
    return axis.left;
  } else if (value <= 66) {
    return axis.center;
  } else {
    return axis.right;
  }
}

/**
 * 모든 축의 현재 레벨 가져오기
 */
function getAllLevels(values) {
  var result = {};
  Object.keys(AXES).forEach(function(key) {
    result[key] = getAxisLevel(key, values[key] || 50);
  });
  return result;
}

/**
 * 스타일 저장
 */
function saveStyle(areaKey, values) {
  var storageKey = areaKey === 'global' 
    ? STORAGE_KEYS.globalStyle 
    : STORAGE_KEYS[areaKey + 'Style'];
  
  if (storageKey) {
    localStorage.setItem(storageKey, JSON.stringify(values));
  }
}

/**
 * 스타일 불러오기
 */
function loadStyle(areaKey) {
  var storageKey = areaKey === 'global' 
    ? STORAGE_KEYS.globalStyle 
    : STORAGE_KEYS[areaKey + 'Style'];
  
  if (!storageKey) return getDefaultStyle(areaKey);
  
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load style:', e);
  }
  
  return getDefaultStyle(areaKey);
}

/**
 * 기본 스타일 가져오기
 */
function getDefaultStyle(areaKey) {
  if (areaKey === 'global') {
    return PRESETS.balance.values;
  }
  
  var areaDefault = AREA_DEFAULTS[areaKey];
  if (areaDefault) {
    return areaDefault.values;
  }
  
  return PRESETS.balance.values;
}

/**
 * 프리셋 적용
 */
function applyPreset(presetKey, areaKey) {
  var preset = PRESETS[presetKey];
  if (!preset) return false;
  
  saveStyle(areaKey || 'global', preset.values);
  localStorage.setItem(STORAGE_KEYS.currentPreset, presetKey);
  
  return true;
}

/**
 * 현재 프리셋 확인
 */
function getCurrentPreset() {
  return localStorage.getItem(STORAGE_KEYS.currentPreset) || 'balance';
}

/**
 * 영역별 설정 활성화 여부
 */
function isAreaPersonalizationEnabled() {
  return localStorage.getItem(STORAGE_KEYS.areaEnabled) === 'true';
}

function setAreaPersonalizationEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.areaEnabled, enabled ? 'true' : 'false');
}

// ============================================
// 프리뷰 메시지 생성
// ============================================

/**
 * 현재 설정 기반 프리뷰 메시지 생성
 */
function generatePreviewMessage(values, context) {
  var levels = getAllLevels(values);
  var area = context || 'general';
  
  // 알림 스타일별 인사
  var greeting;
  if (levels.notificationStyle.value === 0) {
    // 젠틀
    greeting = '안녕하세요~ 오늘 하루도 함께해요 ☀️';
  } else if (levels.notificationStyle.value === 100) {
    // 코치
    greeting = '좋은 아침이에요. 오늘 할 일 정리해볼까요?';
  } else {
    // 중립
    greeting = '좋은 아침이에요. 오늘 일정 알려드릴게요.';
  }
  
  // 데이터 깊이별 정보량
  var dataInfo;
  if (levels.dataDepth.value === 0) {
    // 에센셜
    dataInfo = '오늘의 핵심: 미팅 2개, 집중시간 3시간 확보됐어요.';
  } else if (levels.dataDepth.value === 100) {
    // 풀 데이터
    dataInfo = '오늘 미팅 2개(09:30 팀회의 45분, 14:00 1:1 30분), 예상 집중시간 3.5시간, 어제 대비 +23%, 이번 주 평균 대비 +15%입니다.';
  } else {
    // 밸런스
    dataInfo = '오늘 미팅 2개, 집중시간 3시간 반 예상돼요. 어제보다 여유로운 하루예요.';
  }
  
  // 동기부여 스타일별 마무리
  var motivation;
  if (levels.motivationStyle.value === 0) {
    // 플로우
    motivation = '오늘도 흐름대로 가봐요~';
  } else if (levels.motivationStyle.value === 100) {
    // 게이미피케이션
    motivation = '🔥 3일 연속 목표 달성 중! 오늘도 달성하면 배지 획득!';
  } else {
    // 균형
    motivation = '오늘 목표: 보고서 마무리. 할 수 있어요!';
  }
  
  return {
    greeting: greeting,
    dataInfo: dataInfo,
    motivation: motivation,
    full: greeting + '\n\n' + dataInfo + '\n\n' + motivation
  };
}

/**
 * 같은 상황, 다른 톤 예시 생성 (태스크 미루기)
 */
function generateToneExample(values) {
  var levels = getAllLevels(values);
  
  if (levels.notificationStyle.value <= 33) {
    // 젠틀
    return {
      situation: '중요한 태스크를 3시간째 미루고 있음',
      message: '보고서 작업, 시작하기 어려운 것 같아요.\n잠깐 같이 살펴볼까요? 아니면 오늘은 쉬어도 괜찮아요.',
      buttons: ['5분만 시작해보기', '내일로 미루기', '그냥 있을래요']
    };
  } else if (levels.notificationStyle.value >= 67) {
    // 코치
    return {
      situation: '중요한 태스크를 3시간째 미루고 있음',
      message: '보고서, 3시간째 미루고 있어요 ⏰\n지금 안 하면 오늘 밤 11시까지 해야 해요.\n딱 25분만 집중해봐요. 시작이 반이에요!',
      buttons: ['25분 집중 시작 🔥']
    };
  } else {
    // 중립
    return {
      situation: '중요한 태스크를 3시간째 미루고 있음',
      message: '보고서 마감이 내일이에요.\n지금 시작하면 예상 소요 시간 2시간.',
      buttons: ['시작하기', '리마인더 설정', '미루기']
    };
  }
}

/**
 * 같은 성과, 다른 피드백 예시 생성 (5일 연속 달성)
 */
function generateFeedbackExample(values) {
  var levels = getAllLevels(values);
  
  if (levels.motivationStyle.value <= 33) {
    // 플로우
    return {
      situation: '5일 연속 아침 루틴 완료',
      message: '이번 주 아침이 부드럽게 흘러가고 있네요 ☀️',
      extra: null
    };
  } else if (levels.motivationStyle.value >= 67) {
    // 게이미피케이션
    return {
      situation: '5일 연속 아침 루틴 완료',
      message: '🔥 5일 스트릭 달성!\n+50 포인트 획득\n7일 달성하면 \'얼리버드\' 배지 획득!',
      extra: {
        streak: '🔥🔥🔥🔥🔥⬜⬜',
        nextReward: '다음 보상까지: 2일'
      }
    };
  } else {
    // 균형
    return {
      situation: '5일 연속 아침 루틴 완료',
      message: '5일 연속 아침 루틴 완료! 🌅\n이 페이스 좋아요.',
      extra: null
    };
  }
}

// ============================================
// 온보딩 질문
// ============================================

var ONBOARDING_QUESTIONS = [
  {
    id: 'dataRelation',
    question: '데이터와의 관계가 어떠세요?',
    options: [
      {
        emoji: '🔬',
        label: '데이터 덕후',
        desc: '스프레드시트 좋아해요. 모든 걸 분석하고 싶어요',
        impact: { dataDepth: 100, visualStyle: 100 }
      },
      {
        emoji: '📊',
        label: '적당히 궁금',
        desc: '인사이트는 좋지만 직접 파고들진 않아요',
        impact: { dataDepth: 50, visualStyle: 50 }
      },
      {
        emoji: '✨',
        label: '심플하게',
        desc: '복잡한 건 싫어요. 핵심만 알려주세요',
        impact: { dataDepth: 0, visualStyle: 0 }
      }
    ]
  },
  {
    id: 'motivationStyle',
    question: '어떤 스타일이 더 동기부여 돼요?',
    options: [
      {
        emoji: '🏆',
        label: '도전과 보상',
        desc: '목표, 스트릭, 배지 좋아요! 경쟁심이 동기부여돼요',
        impact: { motivationStyle: 100, notificationStyle: 70 }
      },
      {
        emoji: '🌊',
        label: '흐름대로',
        desc: '압박 싫어요. 유연하게 갈 수 있으면 좋겠어요',
        impact: { motivationStyle: 0, notificationStyle: 20 }
      },
      {
        emoji: '⚖️',
        label: '중간 어딘가',
        desc: '목표는 있되, 놓쳐도 괜찮은 정도가 좋아요',
        impact: { motivationStyle: 50, notificationStyle: 50 }
      }
    ]
  }
];

/**
 * 온보딩 답변으로 프리셋 추천
 */
function recommendPresetFromAnswers(answers) {
  // 기본값
  var recommended = {
    dataDepth: 50,
    notificationStyle: 50,
    visualStyle: 50,
    motivationStyle: 50
  };
  
  // 답변 반영
  answers.forEach(function(answer) {
    if (answer.impact) {
      Object.keys(answer.impact).forEach(function(key) {
        recommended[key] = answer.impact[key];
      });
    }
  });
  
  // 가장 가까운 프리셋 찾기
  var closestPreset = 'balance';
  var minDistance = Infinity;
  
  Object.keys(PRESETS).forEach(function(presetKey) {
    var preset = PRESETS[presetKey];
    var distance = 0;
    
    Object.keys(recommended).forEach(function(axis) {
      distance += Math.abs(recommended[axis] - preset.values[axis]);
    });
    
    if (distance < minDistance) {
      minDistance = distance;
      closestPreset = presetKey;
    }
  });
  
  return {
    values: recommended,
    closestPreset: closestPreset,
    preset: PRESETS[closestPreset]
  };
}

// ============================================
// Export
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AXES: AXES,
    PRESETS: PRESETS,
    AREA_DEFAULTS: AREA_DEFAULTS,
    STORAGE_KEYS: STORAGE_KEYS,
    ONBOARDING_QUESTIONS: ONBOARDING_QUESTIONS,
    getAxisLevel: getAxisLevel,
    getAllLevels: getAllLevels,
    saveStyle: saveStyle,
    loadStyle: loadStyle,
    getDefaultStyle: getDefaultStyle,
    applyPreset: applyPreset,
    getCurrentPreset: getCurrentPreset,
    isAreaPersonalizationEnabled: isAreaPersonalizationEnabled,
    setAreaPersonalizationEnabled: setAreaPersonalizationEnabled,
    generatePreviewMessage: generatePreviewMessage,
    generateToneExample: generateToneExample,
    generateFeedbackExample: generateFeedbackExample,
    recommendPresetFromAnswers: recommendPresetFromAnswers
  };
}

// 브라우저 환경
if (typeof window !== 'undefined') {
  window.AlfredoPersonalization = {
    AXES: AXES,
    PRESETS: PRESETS,
    AREA_DEFAULTS: AREA_DEFAULTS,
    STORAGE_KEYS: STORAGE_KEYS,
    ONBOARDING_QUESTIONS: ONBOARDING_QUESTIONS,
    getAxisLevel: getAxisLevel,
    getAllLevels: getAllLevels,
    saveStyle: saveStyle,
    loadStyle: loadStyle,
    getDefaultStyle: getDefaultStyle,
    applyPreset: applyPreset,
    getCurrentPreset: getCurrentPreset,
    isAreaPersonalizationEnabled: isAreaPersonalizationEnabled,
    setAreaPersonalizationEnabled: setAreaPersonalizationEnabled,
    generatePreviewMessage: generatePreviewMessage,
    generateToneExample: generateToneExample,
    generateFeedbackExample: generateFeedbackExample,
    recommendPresetFromAnswers: recommendPresetFromAnswers
  };
}
