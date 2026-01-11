import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// 🐧 알프레도 성격 시스템 (CARROT 스타일)
// 친근 ↔ 직설 ↔ 장난꾸러기 스펙트럼
// ============================================

export type PersonalityMode = 'warm' | 'direct' | 'playful';

interface PersonalityConfig {
  mode: PersonalityMode;
  name: string;
  description: string;
  emoji: string;
  traits: {
    encouragement: 'gentle' | 'moderate' | 'energetic';
    honesty: 'soft' | 'balanced' | 'blunt';
    humor: 'minimal' | 'moderate' | 'playful';
  };
  samplePhrases: string[];
}

export const PERSONALITY_CONFIGS: Record<PersonalityMode, PersonalityConfig> = {
  warm: {
    mode: 'warm',
    name: '따뜻한 집사',
    description: '부드럽고 공감적인 톤. 항상 응원하며 위로해줘요.',
    emoji: '🫂',
    traits: {
      encouragement: 'gentle',
      honesty: 'soft',
      humor: 'minimal',
    },
    samplePhrases: [
      '힘들었죠? 옆에 있을게요 💜',
      '천천히 가도 괜찮아요~',
      '오늘 하루도 수고했어요',
      '못해도 괜찮아요, 내일 다시 하면 돼요',
      'Boss가 얼마나 노력하는지 알아요',
    ],
  },
  direct: {
    mode: 'direct',
    name: '직설 코치',
    description: '솔직하고 효율적인 톤. 핵심만 짚어줘요.',
    emoji: '💪',
    traits: {
      encouragement: 'moderate',
      honesty: 'blunt',
      humor: 'minimal',
    },
    samplePhrases: [
      '지금 시작하세요. 미루면 더 힘들어요.',
      '이건 30분이면 끝나요. 바로 하죠.',
      '3번째 미루는 거예요. 오늘은 해봐요.',
      '잘했어요. 다음 거 하죠.',
      '이 시간이 제일 집중 잘 돼요. 활용하세요.',
    ],
  },
  playful: {
    mode: 'playful',
    name: '장난꾸러기',
    description: '유쾌하고 위트있는 톤. 재미있게 동기부여해요.',
    emoji: '😜',
    traits: {
      encouragement: 'energetic',
      honesty: 'balanced',
      humor: 'playful',
    },
    samplePhrases: [
      '오늘 할 일? 저도 같이 해볼게요~ 🐧',
      '이거 끝내면 제가 춤출게요! 💃',
      'Boss! 레벨업 기회가 왔어요! ⚡',
      '미루기 몬스터를 물리쳐요! 🗡️',
      '우와~ 대박! 진짜 해냈어요! 🎉',
    ],
  },
};

// 감정 상태별 표현
export const EMOTIONAL_EXPRESSIONS = {
  happy: { emoji: '😊', animation: 'bounce' },
  proud: { emoji: '🥹', animation: 'pulse' },
  encouraging: { emoji: '💪', animation: 'shake' },
  sad: { emoji: '😢', animation: 'droop' },
  worried: { emoji: '😟', animation: 'tremble' },
  excited: { emoji: '🤩', animation: 'spin' },
  sleepy: { emoji: '😴', animation: 'sway' },
  neutral: { emoji: '🐧', animation: 'none' },
};

interface PersonalityState {
  currentMode: PersonalityMode;
  currentEmotion: keyof typeof EMOTIONAL_EXPRESSIONS;
  
  // 사용자 상호작용에 따른 감정 변화
  emotionHistory: Array<{
    emotion: keyof typeof EMOTIONAL_EXPRESSIONS;
    reason: string;
    timestamp: string;
  }>;
  
  // 액션
  setPersonalityMode: (mode: PersonalityMode) => void;
  setEmotion: (emotion: keyof typeof EMOTIONAL_EXPRESSIONS, reason?: string) => void;
  
  // 컨텍스트 기반 응답 생성
  getResponse: (context: ResponseContext) => string;
  getEmoji: () => string;
  getAnimation: () => string;
}

interface ResponseContext {
  situation: 'greeting' | 'taskComplete' | 'taskDefer' | 'encourage' | 'celebrate' | 'remind' | 'stress' | 'rest';
  energy?: number;
  mood?: string;
  streakDays?: number;
  taskCount?: number;
  hour?: number;
}

const CONTEXTUAL_RESPONSES: Record<PersonalityMode, Record<string, string[]>> = {
  warm: {
    greeting: [
      '오늘도 좋은 하루 되세요 💜',
      '옆에서 응원하고 있어요~',
      '오늘 하루도 함께해요!',
    ],
    taskComplete: [
      '해냈어요! 정말 잘했어요 ✨',
      '수고했어요~ 대단해요!',
      '완료! 자랑스러워요 💜',
    ],
    taskDefer: [
      '괜찮아요, 지금 힘든 거 알아요',
      '나중에 해도 돼요. 쉬어가요~',
      '무리하지 마세요. 옆에 있을게요',
    ],
    encourage: [
      '할 수 있어요. 믿어요 💜',
      '작은 것부터 천천히요',
      'Boss는 생각보다 대단한 사람이에요',
    ],
    celebrate: [
      '우와! 정말 대단해요! 🎉',
      '최고예요! 자랑스러워요!',
      '이건 진짜 축하할 일이에요!',
    ],
    stress: [
      '힘들 땐 쉬어도 괜찮아요',
      '지금 잠깐 멈춰도 돼요',
      '옆에서 기다릴게요. 천천히요',
    ],
    rest: [
      '오늘 푹 쉬세요~ 💤',
      '쉬는 것도 중요해요',
      '충전 시간! 재충전하세요',
    ],
  },
  direct: {
    greeting: [
      '좋은 아침. 오늘 할 일 확인하세요.',
      '준비됐으면 시작하죠.',
      '오늘의 목표, 설정했어요?',
    ],
    taskComplete: [
      '완료. 잘했어요.',
      '하나 끝. 다음 거 하죠.',
      'Good. 계속 가요.',
    ],
    taskDefer: [
      '이유가 있겠죠. 하지만 내일은 하세요.',
      '미루면 쌓여요. 조심하세요.',
      '5분만 해볼까요? 시작이 반이에요.',
    ],
    encourage: [
      '지금 시작하세요.',
      '생각보다 금방 끝나요.',
      '미루는 시간에 끝낼 수 있어요.',
    ],
    celebrate: [
      '훌륭해요. 이 조자 유지하세요.',
      '좋아요. 다음 레벨 가죠.',
      '잘했어요. 자랑스러워요.',
    ],
    stress: [
      '지금은 쉬세요. 내일 하면 돼요.',
      '과부하 상태예요. 멈추세요.',
      '건강이 먼저예요.',
    ],
    rest: [
      '휴식도 생산성이에요.',
      '푹 쉬세요.',
      '재충전하고 내일 하죠.',
    ],
  },
  playful: {
    greeting: [
      '오늘도 모험 시작! 🗡️',
      'Boss! 레벨업 준비됐어요? ⚡',
      '미션 브리핑 시작합니다! 🐧',
    ],
    taskComplete: [
      '우왕! 퀘스트 클리어! 🎮',
      '+100 경험치 획득! ✨',
      '대박! Boss 최고! 🏆',
    ],
    taskDefer: [
      '도망가도 괜찮아요~ 다시 도전! 🏃',
      '미루기 스킬 발동! (하지만 내일은...)',
      '휴식도 전략이에요! 🛋️',
    ],
    encourage: [
      '이번 퀘스트, 같이 깨요! 💪',
      'Boss에게 불가능은 없어요!',
      '한 방에 끝내버려요! ⚡',
    ],
    celebrate: [
      '축하 폭죽! 🎉🎊🎉',
      'LEGENDARY! 전설이에요!',
      '춤춰야 해요! 💃🕺',
    ],
    stress: [
      '오버히트! 쿨다운 필요해요 ❄️',
      '잠깐! HP 회복 타임!',
      '세이브 포인트에서 쉬어가요 💾',
    ],
    rest: [
      '숙면 퀘스트 시작! 😴',
      '내일의 Boss를 위해! 🌙',
      '충전 모드 ON! 🔋',
    ],
  },
};

export const usePersonalityStore = create<PersonalityState>()(
  persist(
    (set, get) => ({
      currentMode: 'warm',
      currentEmotion: 'neutral',
      emotionHistory: [],

      setPersonalityMode: (mode) => {
        set({ currentMode: mode });
      },

      setEmotion: (emotion, reason = '') => {
        const now = new Date().toISOString();
        set(state => ({
          currentEmotion: emotion,
          emotionHistory: [
            ...state.emotionHistory.slice(-50),
            { emotion, reason, timestamp: now }
          ],
        }));
      },

      getResponse: (context) => {
        const { currentMode } = get();
        const responses = CONTEXTUAL_RESPONSES[currentMode][context.situation];
        
        if (!responses || responses.length === 0) {
          return '옆에서 응원하고 있어요 🐧';
        }
        
        // 랜덤 선택
        return responses[Math.floor(Math.random() * responses.length)];
      },

      getEmoji: () => {
        const { currentEmotion } = get();
        return EMOTIONAL_EXPRESSIONS[currentEmotion]?.emoji || '🐧';
      },

      getAnimation: () => {
        const { currentEmotion } = get();
        return EMOTIONAL_EXPRESSIONS[currentEmotion]?.animation || 'none';
      },
    }),
    {
      name: 'alfredo-personality-store',
    }
  )
);

export default usePersonalityStore;
