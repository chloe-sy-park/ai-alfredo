import { create } from 'zustand';

// 레벨별 필요 XP 계산
const calculateXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// 기본 펭귄 상태 (DB 없을 때 사용)
const DEFAULT_PENGUIN_STATUS = {
  user_id: 'local',
  level: 1,
  current_xp: 0,
  total_xp: 0,
  xp_for_next_level: 100,
  coins: 50,
  current_mood: 'happy',
  streak_days: 0,
  equipped_items: []
};

interface PenguinStatus {
  id?: string;
  user_id: string;
  level: number;
  current_xp: number;
  total_xp: number;
  xp_for_next_level: number;
  coins: number;
  current_mood: string;
  streak_days: number;
  last_interaction?: string;
  equipped_items?: any[];
}

interface ShopItem {
  id: string;
  name: string;
  description?: string;
  item_type: string;
  rarity: string;
  price_coins: number;
  image_url?: string;
  owned?: boolean;
  can_afford?: boolean;
}

interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  is_equipped: boolean;
  penguin_items?: ShopItem;
}

interface PenguinState {
  status: PenguinStatus | null;
  shopItems: ShopItem[];
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStatus: () => Promise<void>;
  fetchShop: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  buyItem: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string, equip?: boolean) => Promise<boolean>;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateMood: (mood: string) => void;
  clearError: () => void;
}

export const usePenguinStore = create<PenguinState>((set) => ({
  status: DEFAULT_PENGUIN_STATUS, // 기본값으로 시작
  shopItems: [],
  inventory: [],
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    // DB 테이블이 없으므로 기본값 사용 (나중에 DB 연결시 활성화)
    console.log('🐧 펭귄 상태: 로컬 모드 사용');
    set({ 
      status: DEFAULT_PENGUIN_STATUS, 
      isLoading: false,
      error: null 
    });
  },

  fetchShop: async () => {
    // DB 없으므로 빈 상점
    console.log('🛒 상점: 로컬 모드 (아이템 없음)');
    set({ shopItems: [] });
  },

  fetchInventory: async () => {
    // DB 없으므로 빈 인벤토리
    console.log('🎒 인벤토리: 로컬 모드 (아이템 없음)');
    set({ inventory: [] });
  },

  buyItem: async (_itemId: string) => {
    console.log('🛒 구매 기능은 DB 연결 후 사용 가능');
    return false;
  },

  equipItem: async (_itemId: string, _equip = true) => {
    console.log('👔 장착 기능은 DB 연결 후 사용 가능');
    return false;
  },

  // 로컬 상태 업데이트 (서버 동기화 없이)
  addXP: (amount) => {
    set(state => {
      if (!state.status) return state;

      let newXP = state.status.current_xp + amount;
      let newLevel = state.status.level;
      let xpForNext = state.status.xp_for_next_level;

      // 레벨업 체크
      while (newXP >= xpForNext) {
        newXP -= xpForNext;
        newLevel += 1;
        xpForNext = calculateXpForLevel(newLevel);
      }

      return {
        status: {
          ...state.status,
          current_xp: newXP,
          level: newLevel,
          xp_for_next_level: xpForNext,
        },
      };
    });
  },

  addCoins: (amount) => {
    set(state => {
      if (!state.status) return state;
      return {
        status: {
          ...state.status,
          coins: state.status.coins + amount,
        },
      };
    });
  },

  updateMood: (mood) => {
    set(state => {
      if (!state.status) return state;
      return {
        status: {
          ...state.status,
          current_mood: mood,
        },
      };
    });
  },

  clearError: () => set({ error: null }),
}));
