import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// 테스트용 사용자 ID
const TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// 레벨별 필요 XP 계산
const calculateXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
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

export const usePenguinStore = create<PenguinState>((set, get) => ({
  status: null,
  shopItems: [],
  inventory: [],
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data, error: dbError } = await supabase
        .from('penguin_status')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (dbError) {
        // 데이터 없으면 생성
        if (dbError.code === 'PGRST116') {
          const newStatus: PenguinStatus = {
            user_id: TEST_USER_ID,
            level: 1,
            current_xp: 0,
            total_xp: 0,
            xp_for_next_level: calculateXpForLevel(1),
            coins: 0,
            current_mood: 'happy',
            streak_days: 0,
            equipped_items: []
          };

          const { data: newData, error: insertError } = await supabase
            .from('penguin_status')
            .insert(newStatus)
            .select()
            .single();

          if (insertError) {
            console.error('Failed to create penguin:', insertError);
            set({ error: insertError.message, isLoading: false });
          } else if (newData) {
            set({ 
              status: { 
                ...newData, 
                xp_for_next_level: calculateXpForLevel(newData.level),
                equipped_items: [] 
              }, 
              isLoading: false 
            });
          }
        } else {
          console.error('DB fetch error:', dbError);
          set({ error: dbError.message, isLoading: false });
        }
      } else if (data) {
        set({ 
          status: { 
            ...data, 
            xp_for_next_level: calculateXpForLevel(data.level),
            equipped_items: [] 
          }, 
          isLoading: false 
        });
      }
    } catch (e) {
      console.error('Penguin fetch failed:', e);
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류', isLoading: false });
    }
  },

  fetchShop: async () => {
    try {
      // 모든 아이템 조회
      const { data: items, error: itemsError } = await supabase
        .from('penguin_items')
        .select('*')
        .order('price_coins', { ascending: true });

      if (itemsError) {
        console.error('Shop fetch error:', itemsError);
        set({ error: itemsError.message });
        return;
      }

      // 소유한 아이템 조회
      const { data: owned } = await supabase
        .from('penguin_inventory')
        .select('item_id')
        .eq('user_id', TEST_USER_ID);

      const ownedIds = (owned || []).map(o => o.item_id);
      const currentStatus = get().status;

      // 상점 아이템에 소유 여부 추가
      const shopData = (items || []).map(item => ({
        ...item,
        owned: ownedIds.includes(item.id),
        can_afford: currentStatus ? currentStatus.coins >= item.price_coins : false
      }));

      set({ shopItems: shopData });
    } catch (e) {
      console.error('Shop fetch failed:', e);
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
    }
  },

  fetchInventory: async () => {
    try {
      const { data, error: dbError } = await supabase
        .from('penguin_inventory')
        .select('*, penguin_items(*)')
        .eq('user_id', TEST_USER_ID);

      if (dbError) {
        console.error('Inventory fetch error:', dbError);
        set({ error: dbError.message });
        return;
      }

      set({ inventory: data || [] });
    } catch (e) {
      console.error('Inventory fetch failed:', e);
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
    }
  },

  buyItem: async (itemId) => {
    try {
      // 아이템 정보 조회
      const { data: item } = await supabase
        .from('penguin_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!item) {
        set({ error: '아이템을 찾을 수 없습니다' });
        return false;
      }

      const currentStatus = get().status;
      if (!currentStatus || currentStatus.coins < item.price_coins) {
        set({ error: '코인이 부족합니다' });
        return false;
      }

      // 이미 소유한지 확인
      const { data: existing } = await supabase
        .from('penguin_inventory')
        .select('id')
        .eq('user_id', TEST_USER_ID)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        set({ error: '이미 소유한 아이템입니다' });
        return false;
      }

      // 코인 차감
      const newCoins = currentStatus.coins - item.price_coins;
      const { error: updateError } = await supabase
        .from('penguin_status')
        .update({ coins: newCoins })
        .eq('user_id', TEST_USER_ID);

      if (updateError) {
        set({ error: '코인 차감 실패' });
        return false;
      }

      // 인벤토리에 추가
      const { error: insertError } = await supabase
        .from('penguin_inventory')
        .insert({
          user_id: TEST_USER_ID,
          item_id: itemId,
          is_equipped: false
        });

      if (insertError) {
        set({ error: '아이템 추가 실패' });
        return false;
      }

      // 상태 업데이트
      set(state => ({
        status: state.status ? { ...state.status, coins: newCoins } : null,
        shopItems: state.shopItems.map(shopItem =>
          shopItem.id === itemId ? { ...shopItem, owned: true } : shopItem
        )
      }));

      // 인벤토리 새로고침
      get().fetchInventory();

      console.log('✅ 아이템 구매 성공:', item.name);
      return true;
    } catch (e) {
      console.error('Buy item failed:', e);
      set({ error: e instanceof Error ? e.message : '알 수 없는 오류' });
      return false;
    }
  },

  equipItem: async (itemId, equip = true) => {
    try {
      // 같은 카테고리 아이템 해제 (한 종류만 장착 가능)
      if (equip) {
        const { data: item } = await supabase
          .from('penguin_items')
          .select('item_type')
          .eq('id', itemId)
          .single();

        if (item) {
          // 같은 타입 아이템 해제
          const { data: sameTypeItems } = await supabase
            .from('penguin_inventory')
            .select('id, item_id, penguin_items(item_type)')
            .eq('user_id', TEST_USER_ID)
            .eq('is_equipped', true);

          if (sameTypeItems) {
            for (const invItem of sameTypeItems) {
              if ((invItem as any).penguin_items?.item_type === item.item_type) {
                await supabase
                  .from('penguin_inventory')
                  .update({ is_equipped: false })
                  .eq('id', invItem.id);
              }
            }
          }
        }
      }

      // 장착/해제
      const { error: updateError } = await supabase
        .from('penguin_inventory')
        .update({ is_equipped: equip })
        .eq('user_id', TEST_USER_ID)
        .eq('item_id', itemId);

      if (updateError) {
        set({ error: '장착 상태 변경 실패' });
        return false;
      }

      // 인벤토리 새로고침
      await get().fetchInventory();

      console.log(equip ? '✅ 아이템 장착' : '✅ 아이템 해제');
      return true;
    } catch (e) {
      console.error('Equip item failed:', e);
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
