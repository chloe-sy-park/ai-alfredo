/**
 * 펭귄 스토어
 * 게이미피케이션 상태 관리 (localStorage 기반 - Supabase Edge Function 호출 제거)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// 기본 펭귄 상태 생성
function createDefaultStatus(): PenguinStatus {
  return {
    id: `penguin-${Date.now()}`,
    user_id: '',
    level: 1,
    experience: 0,
    coins: 100,
    streak_days: 1,
    total_tasks_completed: 0,
    last_active: new Date().toISOString(),
    equipped_items: [],
  };
}

// 기본 상점 아이템
const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'hat-1',
    name: '빨간 모자',
    description: '귀여운 빨간 모자',
    category: 'hat',
    price: 50,
    required_level: 1,
    is_available: true,
    owned: false,
    can_afford: true,
  },
  {
    id: 'hat-2',
    name: '파란 모자',
    description: '시원한 파란 모자',
    category: 'hat',
    price: 75,
    required_level: 2,
    is_available: true,
    owned: false,
    can_afford: true,
  },
  {
    id: 'accessory-1',
    name: '선글라스',
    description: '멋진 선글라스',
    category: 'accessory',
    price: 100,
    required_level: 3,
    is_available: true,
    owned: false,
    can_afford: true,
  },
];

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

      // localStorage에서 상태 로드 (API 호출 제거)
      fetchStatus: async () => {
        set({ isLoading: true, error: null });
        try {
          // 기존 상태가 없으면 기본값 생성
          const currentStatus = get().status;
          if (!currentStatus) {
            set({
              status: createDefaultStatus(),
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          set({
            error: '펭귄 상태를 불러올 수 없습니다',
            isLoading: false,
          });
        }
      },

      // 상점 로드 (로컬 데이터 사용)
      fetchShop: async () => {
        set({ isLoading: true, error: null });
        try {
          const status = get().status;
          const inventory = get().inventory;

          // 소유 여부와 구매 가능 여부 계산
          const shopItems = DEFAULT_SHOP_ITEMS.map(item => ({
            ...item,
            owned: inventory.some(inv => inv.item_id === item.id),
            can_afford: status ? status.coins >= item.price : false,
          }));

          set({
            shop: shopItems,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: '상점을 불러올 수 없습니다',
            isLoading: false,
          });
        }
      },

      // 인벤토리 로드 (persist에서 자동 로드됨)
      fetchInventory: async () => {
        set({ isLoading: true, error: null });
        try {
          // inventory는 이미 persist에 의해 로드됨
          set({ isLoading: false });
        } catch (error) {
          set({
            error: '인벤토리를 불러올 수 없습니다',
            isLoading: false,
          });
        }
      },

      // 아이템 구매 (로컬 처리)
      buyItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const status = get().status;
          const shop = get().shop;
          const item = shop.find(i => i.id === itemId);

          if (!status || !item) {
            set({ isLoading: false, error: '아이템을 찾을 수 없습니다' });
            return false;
          }

          if (status.coins < item.price) {
            set({ isLoading: false, error: '코인이 부족합니다' });
            return false;
          }

          if (item.owned) {
            set({ isLoading: false, error: '이미 소유한 아이템입니다' });
            return false;
          }

          // 인벤토리에 추가
          const newInventoryItem: InventoryItem = {
            id: `inv-${Date.now()}`,
            item_id: item.id,
            is_equipped: false,
            penguin_items: item,
          };

          set((state) => ({
            inventory: [...state.inventory, newInventoryItem],
            status: state.status
              ? { ...state.status, coins: state.status.coins - item.price }
              : null,
            shop: state.shop.map((shopItem) =>
              shopItem.id === itemId ? { ...shopItem, owned: true } : shopItem
            ),
            isLoading: false,
          }));

          return true;
        } catch (error: any) {
          set({
            error: '구매에 실패했습니다',
            isLoading: false,
          });
          return false;
        }
      },

      // 아이템 장착 (로컬 처리)
      equipItem: async (itemId, equip = true) => {
        try {
          const inventory = get().inventory;
          const invItem = inventory.find(i => i.item_id === itemId);

          if (!invItem) return false;

          const itemCategory = invItem.penguin_items.category;

          // 인벤토리 업데이트 (같은 카테고리는 해제)
          set((state) => ({
            inventory: state.inventory.map((inv) =>
              inv.item_id === itemId
                ? { ...inv, is_equipped: equip }
                : equip && itemCategory && inv.penguin_items.category === itemCategory
                ? { ...inv, is_equipped: false }
                : inv
            ),
            // 장착된 아이템 목록 업데이트
            status: state.status ? {
              ...state.status,
              equipped_items: equip
                ? [...state.status.equipped_items.filter(i => i.category !== itemCategory), invItem.penguin_items]
                : state.status.equipped_items.filter(i => i.id !== itemId)
            } : null,
          }));

          return true;
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
          if (!state.status) {
            // 상태가 없으면 생성
            const newStatus = createDefaultStatus();
            newStatus.experience = amount;
            return { status: newStatus };
          }

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
          if (!state.status) {
            const newStatus = createDefaultStatus();
            newStatus.coins = 100 + amount;
            return { status: newStatus };
          }
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
        inventory: state.inventory,
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
