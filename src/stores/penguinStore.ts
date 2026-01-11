import { create } from 'zustand';
import { penguinApi } from '../lib/api';
import type { PenguinStatus, PenguinItem, PenguinInventory, PenguinMood } from '../types/database';

interface PenguinStatusWithItems extends PenguinStatus {
  equipped_items: PenguinItem[];
}

interface ShopItem extends PenguinItem {
  owned: boolean;
  can_afford: boolean;
}

interface InventoryItem extends PenguinInventory {
  penguin_items: PenguinItem;
}

interface PenguinState {
  status: PenguinStatusWithItems | null;
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
  updateMood: (mood: PenguinMood) => void;
  clearError: () => void;
}

export const usePenguinStore = create<PenguinState>((set, get) => ({
  status: null,
  shopItems: [],
  inventory: [],
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await penguinApi.getStatus();

      if (response.success && response.data) {
        set({ status: response.data, isLoading: false });
      } else {
        set({ error: response.error?.message || '펭귄 상태 조회 실패', isLoading: false });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류', isLoading: false });
    }
  },

  fetchShop: async () => {
    try {
      const response = await penguinApi.getShop();

      if (response.success && response.data) {
        set({ shopItems: response.data.items });
      } else {
        set({ error: response.error?.message || '상점 조회 실패' });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
    }
  },

  fetchInventory: async () => {
    try {
      const response = await penguinApi.getInventory();

      if (response.success && response.data) {
        set({ inventory: response.data });
      } else {
        set({ error: response.error?.message || '인벤토리 조회 실패' });
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
    }
  },

  buyItem: async (itemId) => {
    try {
      const response = await penguinApi.buyItem(itemId);

      if (response.success && response.data) {
        // 상태 업데이트
        set(state => ({
          status: state.status
            ? { ...state.status, coins: response.data!.remaining_coins }
            : null,
          shopItems: state.shopItems.map(item =>
            item.id === itemId ? { ...item, owned: true } : item
          ),
        }));

        // 인벤토리 새로고침
        get().fetchInventory();

        return true;
      } else {
        set({ error: response.error?.message || '아이템 구매 실패' });
        return false;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
  },

  equipItem: async (itemId, equip = true) => {
    try {
      const response = await penguinApi.equipItem(itemId, equip);

      if (response.success && response.data) {
        // 인벤토리 업데이트
        set(state => ({
          inventory: state.inventory.map(item => ({
            ...item,
            is_equipped: item.item_id === itemId ? equip : false,
          })),
          // 장착 아이템 업데이트
          status: state.status
            ? {
                ...state.status,
                equipped_items: equip
                  ? [response.data!.item]
                  : state.status.equipped_items.filter(i => i.id !== itemId),
              }
            : null,
        }));

        return true;
      } else {
        set({ error: response.error?.message || '아이템 장착 실패' });
        return false;
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
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
        xpForNext = Math.floor(xpForNext * 1.5);
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
          mood,
        },
      };
    });
  },

  clearError: () => set({ error: null }),
}));
