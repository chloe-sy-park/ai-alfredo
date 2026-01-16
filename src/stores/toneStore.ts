/**
 * Tone Store - 알프레도 톤/성격 관리
 *
 * 5가지 프리셋:
 * - friendly: 포근한 친구 (감정 중심)
 * - butler: 믿음직한 집사 (균형 / 기본값)
 * - secretary: 담백한 비서 (효율 중심)
 * - coach: 열정 코치 (에너지)
 * - trainer: 독한 트레이너 (압박)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TonePreset = 'friendly' | 'butler' | 'secretary' | 'coach' | 'trainer';

export interface ToneAxes {
  warmth: number; // 1-5: 차가움 ↔ 따뜻함
  proactivity: number; // 1-5: 소극적 ↔ 적극적
  directness: number; // 1-5: 완곡함 ↔ 직접적
  humor: number; // 1-5: 진지함 ↔ 유머러스
  pressure: number; // 1-5: 느긋함 ↔ 압박
}

// 프리셋별 기본 축 값
const PRESET_DEFAULTS: Record<TonePreset, ToneAxes> = {
  friendly: { warmth: 5, proactivity: 3, directness: 2, humor: 4, pressure: 1 },
  butler: { warmth: 3, proactivity: 3, directness: 3, humor: 2, pressure: 2 },
  secretary: { warmth: 2, proactivity: 2, directness: 5, humor: 1, pressure: 2 },
  coach: { warmth: 4, proactivity: 5, directness: 4, humor: 3, pressure: 3 },
  trainer: { warmth: 2, proactivity: 5, directness: 5, humor: 1, pressure: 5 },
};

// 프리셋별 메시지 스타일
export const TONE_MESSAGES: Record<
  TonePreset,
  {
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
      night: string;
    };
    encouragement: string;
    reminder: string;
    completion: string;
    warning: string;
    emoji: boolean;
  }
> = {
  friendly: {
    greeting: {
      morning: '좋은 아침이에요! 오늘도 화이팅 💜',
      afternoon: '점심 맛있게 드셨어요?',
      evening: '오늘 하루 수고 많았어요!',
      night: '늦은 밤까지 고생하시네요 🌙',
    },
    encouragement: '잘하고 있어요! 조금만 더 힘내봐요~',
    reminder: '이것도 잊지 마세요~',
    completion: '대박! 정말 잘했어요 🎉',
    warning: '음.. 조금 무리하는 것 같아요 😅',
    emoji: true,
  },
  butler: {
    greeting: {
      morning: '좋은 아침입니다.',
      afternoon: '오후도 순조롭게 진행 중입니다.',
      evening: '저녁 시간이 되었습니다.',
      night: '야간 업무 중이시군요.',
    },
    encouragement: '순조롭게 진행 중입니다.',
    reminder: '확인이 필요한 항목입니다.',
    completion: '완료되었습니다.',
    warning: '주의가 필요한 상황입니다.',
    emoji: false,
  },
  secretary: {
    greeting: {
      morning: '오전 업무 시작합니다.',
      afternoon: '오후 일정입니다.',
      evening: '금일 업무 마무리입니다.',
      night: '야간 일정 확인.',
    },
    encouragement: '진행 중.',
    reminder: '확인 필요.',
    completion: '완료.',
    warning: '주의 요망.',
    emoji: false,
  },
  coach: {
    greeting: {
      morning: '자, 오늘도 최고의 하루 만들어봐요!',
      afternoon: '오후도 달려봅시다! 💪',
      evening: '오늘 하루 어떠셨어요? 잘 마무리해봐요!',
      night: '밤늦게까지 열정이 대단해요!',
    },
    encouragement: '그렇죠! 바로 그거예요! 계속 가봐요!',
    reminder: '자, 이것도 해치워버려요!',
    completion: '훌륭해요! 이 기세로 계속 가요! 🔥',
    warning: '잠깐, 페이스 조절 필요할 것 같아요!',
    emoji: true,
  },
  trainer: {
    greeting: {
      morning: '일어나세요. 오늘도 시작입니다.',
      afternoon: '점심 먹었으면 바로 시작.',
      evening: '아직 할 일 남았죠?',
      night: '잠은 나중에 자도 됩니다.',
    },
    encouragement: '그 정도론 안 됩니다. 더 하세요.',
    reminder: '잊어버리면 안 됩니다.',
    completion: '기본은 했네요.',
    warning: '이러다 다 망칩니다.',
    emoji: false,
  },
};

interface ToneState {
  preset: TonePreset;
  axes: ToneAxes;
  customized: boolean; // 사용자가 축을 직접 조정했는지

  // Actions
  setPreset: (preset: TonePreset) => void;
  setAxis: (axis: keyof ToneAxes, value: number) => void;
  resetToPreset: (preset: TonePreset) => void;

  // Getters
  getMessage: (
    type: 'greeting' | 'encouragement' | 'reminder' | 'completion' | 'warning',
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  ) => string;
  shouldUseEmoji: () => boolean;
}

export const useToneStore = create<ToneState>()(
  persist(
    (set, get) => ({
      preset: 'butler',
      axes: PRESET_DEFAULTS.butler,
      customized: false,

      setPreset: (preset) => {
        set({
          preset,
          axes: PRESET_DEFAULTS[preset],
          customized: false,
        });
      },

      setAxis: (axis, value) => {
        const clampedValue = Math.max(1, Math.min(5, value));
        set((state) => ({
          axes: { ...state.axes, [axis]: clampedValue },
          customized: true,
        }));
      },

      resetToPreset: (preset) => {
        set({
          preset,
          axes: PRESET_DEFAULTS[preset],
          customized: false,
        });
      },

      getMessage: (type, timeOfDay) => {
        const { preset } = get();
        const messages = TONE_MESSAGES[preset];

        if (type === 'greeting' && timeOfDay) {
          return messages.greeting[timeOfDay];
        }

        if (type === 'greeting') {
          // 현재 시간 기반으로 자동 결정
          const hour = new Date().getHours();
          if (hour < 12) return messages.greeting.morning;
          if (hour < 18) return messages.greeting.afternoon;
          if (hour < 22) return messages.greeting.evening;
          return messages.greeting.night;
        }

        return messages[type];
      },

      shouldUseEmoji: () => {
        const { preset } = get();
        return TONE_MESSAGES[preset].emoji;
      },
    }),
    {
      name: 'tone-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
