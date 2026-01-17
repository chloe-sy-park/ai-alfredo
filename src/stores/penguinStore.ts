/**
 * 펭귄 스토어
 * 게이미피케이션 상태 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { penguinApi } from '../lib/api';

// === 타입 정의 ===

export interface PenguinItem {
  id: string;
  name: string;
  description: string;
  category: 'hat' | 'accessory' | 'background' | 'outfit';
  price: number;
  required_level: number;
  image_url?: string;
  is_available: boolean;
}

export interface InventoryItem {
  id: string;
  item_id: string;
  is_equipped: boolean;
  penguin_items: PenguinItem;
}

export interface PenguinStatus {
  id: string;
  user_id: string;
  level: number;
  experience: number;
  coins: number;
  streak_days: number;
  total_tasks_completed: number;
  last_active: string;
  equipped_items: PenguinItem[];
}

export interface ShopItem extends PenguinItem {
  owned: boolean;
  can_afford: boolean;
}

interface PenguinState {
  // 상태
  status: PenguinStatus | null;
  inventory: InventoryItem[];
  shop: ShopItem[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 모달 상태
  isShopOpen: boolean;
  isInventoryOpen: boolean;

  // Actions
  fetchStatus: () => Promise<void>;
  fetchShop: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  buyItem: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string, equip?: boolean) => Promise<boolean>;

  // 모달 제어
  openShop: () => void;
  closeShop: () => void;
  openInventory: () => void;
  closeInventory: () => void;

  // XP/코인 지급 (로컬 업데이트)
  addExperience: (amount: number) => void;
  addCoins: (amount: number) => void;
}

// 레벨업에 필요한 경험치 계산
function getExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// 레벨 칭호
const LEVEL_TITLES = [
  '꼬마 펭귄',
  '견습 펭귄',
  '열심히 펭귄',
  '능숙한 펭귄',
  '숙련된 펭귄',
  '전문가 펭귄',
  '마스터 펭귄',
  '레전드 펭귄',
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] || '신비의 펭귄';
}

export const usePenguinStore = create<PenguinState>()(
  persist(
    (set, get) => ({
      status: null,
      inventory: [],
      shop: [],
      isLoading: false,
      error: null,
      isShopOpen: false,
      isInventoryOpen: false,

      fetchStatus: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await penguinApi.getStatus();
          set({
            status: response.data,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: '펭귄 상태를 불러올 수 없습니다',
            isLoading: false,
          });
        }
      },

      fetchShop: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await penguinApi.getShop();
          if (response.data) {
            set({
              shop: response.data.items,
              isLoading: false,
            });
            // 코인 정보 업데이트
            if (get().status) {
              set({
                status: { ...get().status!, coins: response.data.user_coins },
              });
            }
          }
        } catch (error) {
          set({
            error: '상점을 불러올 수 없습니다',
            isLoading: false,
          });
        }
      },

      fetchInventory: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await penguinApi.getInventory();
          if (response.data) {
            set({
              inventory: response.data,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            error: '인벤토리를 불러올 수 없습니다',
            isLoading: false,
          });
        }
      },

      buyItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await penguinApi.buyItem(itemId);
          const data = response.data;
          if (data?.purchased) {
            // 인벤토리 업데이트
            set((state) => ({
              inventory: [...state.inventory, data.item],
              status: state.status
                ? { ...state.status, coins: data.remaining_coins }
                : null,
              shop: state.shop.map((item) =>
                item.id === itemId ? { ...item, owned: true } : item
              ),
              isLoading: false,
            }));
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || '구매에 실패했습니다',
            isLoading: false,
          });
          return false;
        }
      },

      equipItem: async (itemId, equip = true) => {
        try {
          const response = await penguinApi.equipItem(itemId, equip);
          const data = response.data;
          if (data) {
            const itemCategory = data.item?.category;
            // 인벤토리 업데이트
            set((state) => ({
              inventory: state.inventory.map((inv) =>
                inv.item_id === itemId
                  ? { ...inv, is_equipped: equip }
                  : equip && itemCategory && inv.penguin_items.category === itemCategory
                  ? { ...inv, is_equipped: false }
                  : inv
              ),
            }));
            // 상태 새로고침
            get().fetchStatus();
            return true;
          }
          return false;
        } catch (error) {
          set({ error: '장착에 실패했습니다' });
          return false;
        }
      },

      openShop: () => {
        set({ isShopOpen: true });
        get().fetchShop();
      },

      closeShop: () => {
        set({ isShopOpen: false });
      },

      openInventory: () => {
        set({ isInventoryOpen: true });
        get().fetchInventory();
      },

      closeInventory: () => {
        set({ isInventoryOpen: false });
      },

      addExperience: (amount) => {
        set((state) => {
          if (!state.status) return state;

          let newExp = state.status.experience + amount;
          let newLevel = state.status.level;
          let expForNextLevel = getExpForLevel(newLevel);

          // 레벨업 체크
          while (newExp >= expForNextLevel) {
            newExp -= expForNextLevel;
            newLevel++;
            expForNextLevel = getExpForLevel(newLevel);
          }

          return {
            status: {
              ...state.status,
              experience: newExp,
              level: newLevel,
            },
          };
        });
      },

      addCoins: (amount) => {
        set((state) => {
          if (!state.status) return state;
          return {
            status: {
              ...state.status,
              coins: state.status.coins + amount,
            },
          };
        });
      },
    }),
    {
      name: 'penguin-store',
      partialize: (state: PenguinState) => ({
        status: state.status,
      }),
    }
  )
);

// === 헬퍼 훅 ===

export function usePenguinLevel() {
  const status = usePenguinStore((state) => state.status);
  if (!status) return null;

  const currentExp = status.experience;
  const expForNextLevel = getExpForLevel(status.level);
  const progress = (currentExp / expForNextLevel) * 100;

  return {
    level: status.level,
    currentExp,
    expForNextLevel,
    progress,
    title: getLevelTitle(status.level),
  };
}

export function usePenguinCoins(): number {
  return usePenguinStore((state) => state.status?.coins ?? 0);
}

export function useEquippedItems(): PenguinItem[] {
  return usePenguinStore((state) => state.status?.equipped_items ?? []);
}

export default usePenguinStore;
