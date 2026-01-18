// Alfredo Settings Service - 알프레도 육성 설정

export interface AlfredoSettings {
  // === 핵심 설정 ===
  // Role Blend: 1(Life 중심) ~ 5(Work 중심)
  workLifeBalance: number;
  // Intervention Level: 1(최소 개입) ~ 5(밀착 케어)
  proactivity: number;
  // 기본 뷰: 통합/워크/라이프
  defaultView: 'integrated' | 'work' | 'life';
  
  // === 톤 시스템 ===
  // 프리셋: friend(친구), butler(집사), secretary(비서), coach(코치), trainer(트레이너)
  tonePreset: 'friend' | 'butler' | 'secretary' | 'coach' | 'trainer' | 'custom';
  // 5축 커스터마이징 (프리셋이 'custom'일 때만 사용)
  toneAxes: {
    warmth: number;      // 따뜻함: 1(차가움) ~ 5(따뜻함)
    proactivity: number; // 적극성: 1(수동적) ~ 5(적극적)
    directness: number;  // 직접성: 1(완곡) ~ 5(직설)
    humor: number;       // 유머: 1(진지) ~ 5(유머)
    pressure: number;    // 압박: 1(느슨) ~ 5(타이트)
  };
  
  // === 알림 설정 ===
  notificationsEnabled: boolean;
  morningAlertTime: string;
  eveningAlertTime: string;
  
  // === 메타 정보 ===
  updatedAt: string;
}

const STORAGE_KEY = 'alfredo_settings';

// 프리셋별 5축 기본값
export const TONE_PRESETS = {
  friend: { warmth: 5, proactivity: 2, directness: 1, humor: 3, pressure: 1 },
  butler: { warmth: 4, proactivity: 3, directness: 3, humor: 2, pressure: 2 },
  secretary: { warmth: 2, proactivity: 2, directness: 4, humor: 1, pressure: 3 },
  coach: { warmth: 3, proactivity: 5, directness: 4, humor: 3, pressure: 4 },
  trainer: { warmth: 1, proactivity: 5, directness: 5, humor: 2, pressure: 5 }
};

// 기본 설정
const DEFAULT_SETTINGS: AlfredoSettings = {
  workLifeBalance: 3,
  proactivity: 3,
  defaultView: 'integrated',
  tonePreset: 'butler',
  toneAxes: TONE_PRESETS.butler,
  notificationsEnabled: true,
  morningAlertTime: '08:00',
  eveningAlertTime: '21:00',
  updatedAt: new Date().toISOString()
};

// 설정 가져오기
export function getAlfredoSettings(): AlfredoSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(stored) as AlfredoSettings;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

// 설정 저장
export function saveAlfredoSettings(settings: Partial<AlfredoSettings>): AlfredoSettings {
  const current = getAlfredoSettings();
  const updated: AlfredoSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save alfredo settings:', e);
  }
  
  return updated;
}

// 프리셋 적용
export function applyTonePreset(preset: AlfredoSettings['tonePreset']): AlfredoSettings {
  if (preset === 'custom') {
    return saveAlfredoSettings({ tonePreset: 'custom' });
  }
  
  return saveAlfredoSettings({
    tonePreset: preset,
    toneAxes: TONE_PRESETS[preset]
  });
}

// === 레이블 함수들 ===

// Work-Life Balance 레이블
export function getWorkLifeLabel(value: number): string {
  const labels: Record<number, string> = {
    1: '🏠 Life 중심',
    2: '🏠 Life 우선',
    3: '⚖️ 균형',
    4: '💼 Work 우선',
    5: '💼 Work 중심'
  };
  return labels[value] || labels[3];
}

// Proactivity 레이블
export function getProactivityLabel(value: number): string {
  const labels: Record<number, string> = {
    1: '🤫 최소 개입',
    2: '🔔 조용한 지원',
    3: '💬 균형',
    4: '📣 적극적 지원',
    5: '🔊 밀착 케어'
  };
  return labels[value] || labels[3];
}

// 프리셋 정보
export const TONE_PRESET_INFO = {
  friend: { icon: '🌸', label: '포근한 친구', desc: '따뜻, 공감, 재촉 안 함' },
  butler: { icon: '🎩', label: '믿음직한 집사', desc: '따뜻 + 체계적 (기본)' },
  secretary: { icon: '⚖️', label: '담백한 비서', desc: '감정 최소, 정보 중심' },
  coach: { icon: '🔥', label: '열정 코치', desc: '적극 푸시, 동기부여' },
  trainer: { icon: '😈', label: '독한 트레이너', desc: '직설, 약간 도발' }
};

// 톤 축 레이블
export function getToneAxisLabel(axis: keyof AlfredoSettings['toneAxes'], value: number): string {
  const labels: Record<string, Record<number, string>> = {
    warmth: {
      1: '차갑게', 2: '담백하게', 3: '중립적으로', 4: '따뜻하게', 5: '매우 따뜻하게'
    },
    proactivity: {
      1: '물어볼 때만', 2: '필요시만', 3: '적당히', 4: '자주 체크인', 5: '항상 함께'
    },
    directness: {
      1: '완곡하게', 2: '부드럽게', 3: '균형있게', 4: '명확하게', 5: '직설적으로'
    },
    humor: {
      1: '진지하게만', 2: '가끔 유머', 3: '적절히', 4: '자주 농담', 5: '유머러스하게'
    },
    pressure: {
      1: '느슨하게', 2: '여유있게', 3: '적당히', 4: '타이트하게', 5: '강하게 푸시'
    }
  };
  return labels[axis]?.[value] || '보통';
}

// 톤 예시 메시지
export function getToneExample(settings: AlfredoSettings): string {
  const { tonePreset, toneAxes } = settings;
  
  if (tonePreset === 'friend' || (tonePreset === 'custom' && toneAxes.warmth >= 4 && toneAxes.pressure <= 2)) {
    return '"오늘 많이 힘들었죠? 천천히 쉬어가도 괜찮아요 🤗"';
  }
  if (tonePreset === 'butler' || (tonePreset === 'custom' && toneAxes.warmth >= 3 && toneAxes.proactivity >= 3)) {
    return '"오늘 미팅 3개 있으시네요. 점심 후 여유 시간에 보고서 어떠세요? 😊"';
  }
  if (tonePreset === 'secretary' || (tonePreset === 'custom' && toneAxes.warmth <= 2 && toneAxes.directness >= 4)) {
    return '"14:00 미팅. 보고서 마감 17:00. 현재 진행률 70%."';
  }
  if (tonePreset === 'coach' || (tonePreset === 'custom' && toneAxes.proactivity >= 4 && toneAxes.pressure >= 3)) {
    return '"좋아요! 오전에 2개 끝냈네요! 이 속도면 오늘 목표 달성 가능해요! 💪"';
  }
  if (tonePreset === 'trainer' || (tonePreset === 'custom' && toneAxes.directness >= 5 && toneAxes.pressure >= 5)) {
    return '"보고서 아직도 안 끝냈어요? 지금 당장 시작하세요. 변명은 필요 없어요."';
  }
  
  return '"오늘 할 일이 3개 있어요. 하나씩 차근차근 해볼까요?"';
}

// 설정 초기화
export function resetAlfredoSettings(): AlfredoSettings {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  } catch (e) {
    console.error('Failed to reset alfredo settings:', e);
  }
  return DEFAULT_SETTINGS;
}
