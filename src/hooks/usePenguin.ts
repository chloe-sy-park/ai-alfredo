import { useState, useCallback, useEffect } from 'react';
import { penguinApi } from '../lib/api';
import type { PenguinStatus, PenguinItem, PenguinInventory } from '../types/database';

interface PenguinStatusWithItems extends PenguinStatus {
  equipped_items: PenguinItem[];
}

interface ShopItem extends PenguinItem {
  owned: boolean;
  can_afford: boolean;
}

interface UsePenguinReturn {
  status: PenguinStatusWithItems | null;
  shopItems: ShopItem[];
  inventory: (PenguinInventory & { penguin_items: PenguinItem })[];
  isLoading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  fetchShop: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  buyItem: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string, equip?: boolean) => Promise<boolean>;
}

export function usePenguin(autoFetch = true): UsePenguinReturn {
  const [status, setStatus] = useState<PenguinStatusWithItems | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<(PenguinInventory & { penguin_items: PenguinItem })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 펭귄 상태 조회
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await penguinApi.getStatus();

      if (response.success && response.data) {
        setStatus(response.data);
      } else {
        setError(response.error?.message || '펭귄 상태 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 상점 조회
  const fetchShop = useCallback(async () => {
    try {
      const response = await penguinApi.getShop();

      if (response.success && response.data) {
        setShopItems(response.data.items);
      } else {
        setError(response.error?.message || '상점 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    }
  }, []);

  // 인벤토리 조회
  const fetchInventory = useCallback(async () => {
    try {
      const response = await penguinApi.getInventory();

      if (response.success && response.data) {
        setInventory(response.data);
      } else {
        setError(response.error?.message || '인벤토리 조회 실패');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    }
  }, []);

  // 아이템 구매
  const buyItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const response = await penguinApi.buyItem(itemId);

      if (response.success && response.data) {
        // 상태 업데이트
        setStatus(prev =>
          prev ? { ...prev, coins: response.data!.remaining_coins } : prev
        );
        
        // 상점 아이템 업데이트
        setShopItems(prev =>
          prev.map(item =>
            item.id === itemId ? { ...item, owned: true } : item
          )
        );
        
        // 인벤토리에 추가
        setInventory(prev => [...prev, response.data!.item]);
        
        return true;
      } else {
        setError(response.error?.message || '아이템 구매 실패');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return false;
    }
  }, []);

  // 아이템 장착/해제
  const equipItem = useCallback(async (itemId: string, equip = true): Promise<boolean> => {
    try {
      const response = await penguinApi.equipItem(itemId, equip);

      if (response.success && response.data) {
        // 인벤토리 업데이트
        setInventory(prev =>
          prev.map(item => ({
            ...item,
            is_equipped: item.item_id === itemId ? equip : false,
          }))
        );
        
        // 펭귄 상태의 장착 아이템 업데이트
        if (equip) {
          setStatus(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              equipped_items: [response.data!.item],
            };
          });
        } else {
          setStatus(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              equipped_items: prev.equipped_items.filter(i => i.id !== itemId),
            };
          });
        }
        
        return true;
      } else {
        setError(response.error?.message || '아이템 장착 실패');
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
      return false;
    }
  }, []);

  // 자동 fetch
  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
    }
  }, [autoFetch, fetchStatus]);

  return {
    status,
    shopItems,
    inventory,
    isLoading,
    error,
    fetchStatus,
    fetchShop,
    fetchInventory,
    buyItem,
    equipItem,
  };
}

export default usePenguin;
