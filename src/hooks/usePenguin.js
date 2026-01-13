import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 🐧 Penguin Hook (Supabase Direct Mode)
// - Supabase 클라이언트 직접 사용
// - localStorage 백업
// - XP/레벨 관리

// 테스트용 사용자 ID
var TEST_USER_ID = '00000000-0000-0000-0000-000000000001';

// localStorage 키
var STORAGE_KEY = 'alfredo_penguin_status';

// 레벨별 필요 XP 계산
var calculateXpForLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// localStorage 데이터 로드
var loadPenguinData = function() {
  try {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load penguin data:', e);
    return null;
  }
};

// localStorage 데이터 저장
var savePenguinData = function(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save penguin data:', e);
  }
};

// 기본 펭귄 상태
var DEFAULT_STATUS = {
  level: 1,
  current_xp: 0,
  total_xp: 0,
  coins: 0,
  current_mood: 'happy',
  streak_days: 0,
  last_interaction: new Date().toISOString()
};

export function usePenguin(autoFetch) {
  var shouldAutoFetch = autoFetch !== false;
  
  var statusState = useState(function() {
    return loadPenguinData() || DEFAULT_STATUS;
  });
  var status = statusState[0];
  var setStatus = statusState[1];
  
  var shopItemsState = useState([]);
  var shopItems = shopItemsState[0];
  var setShopItems = shopItemsState[1];
  
  var inventoryState = useState([]);
  var inventory = inventoryState[0];
  var setInventory = inventoryState[1];
  
  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];
  
  var errorState = useState(null);
  var error = errorState[0];
  var setError = errorState[1];

  // 펭귄 상태 조회
  var fetchStatus = useCallback(async function() {
    setIsLoading(true);
    setError(null);

    try {
      var { data, error: dbError } = await supabase
        .from('penguin_status')
        .select('*')
        .eq('user_id', TEST_USER_ID)
        .single();

      if (dbError) {
        // 데이터 없으면 생성
        if (dbError.code === 'PGRST116') {
          var { data: newData, error: insertError } = await supabase
            .from('penguin_status')
            .insert({
              user_id: TEST_USER_ID,
              level: 1,
              current_xp: 0,
              total_xp: 0,
              coins: 0,
              current_mood: 'happy',
              streak_days: 0
            })
            .select()
            .single();

          if (insertError) {
            console.error('Failed to create penguin:', insertError);
            setError(insertError.message);
          } else if (newData) {
            setStatus(newData);
            savePenguinData(newData);
            console.log('✅ 펭귄 생성 성공:', newData);
          }
        } else {
          console.error('DB fetch error:', dbError);
          setError(dbError.message);
        }
      } else if (data) {
        setStatus(data);
        savePenguinData(data);
      }
    } catch (e) {
      console.error('Penguin fetch failed:', e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 상점 아이템 조회
  var fetchShop = useCallback(async function() {
    try {
      // 모든 아이템 조회
      var { data: items, error: itemsError } = await supabase
        .from('penguin_items')
        .select('*')
        .order('price_coins', { ascending: true });

      if (itemsError) {
        console.error('Shop fetch error:', itemsError);
        setError(itemsError.message);
        return;
      }

      // 소유한 아이템 조회
      var { data: owned } = await supabase
        .from('penguin_inventory')
        .select('item_id')
        .eq('user_id', TEST_USER_ID);

      var ownedIds = (owned || []).map(function(o) { return o.item_id; });

      // 상점 아이템에 소유 여부 추가
      var shopData = (items || []).map(function(item) {
        return Object.assign({}, item, {
          owned: ownedIds.indexOf(item.id) !== -1,
          can_afford: status ? status.coins >= item.price_coins : false
        });
      });

      setShopItems(shopData);
    } catch (e) {
      console.error('Shop fetch failed:', e);
      setError(e.message);
    }
  }, [status]);

  // 인벤토리 조회
  var fetchInventory = useCallback(async function() {
    try {
      var { data, error: dbError } = await supabase
        .from('penguin_inventory')
        .select('*, penguin_items(*)')
        .eq('user_id', TEST_USER_ID);

      if (dbError) {
        console.error('Inventory fetch error:', dbError);
        setError(dbError.message);
        return;
      }

      setInventory(data || []);
    } catch (e) {
      console.error('Inventory fetch failed:', e);
      setError(e.message);
    }
  }, []);

  // 아이템 구매
  var buyItem = useCallback(async function(itemId) {
    try {
      // 아이템 정보 조회
      var { data: item } = await supabase
        .from('penguin_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (!item) {
        setError('아이템을 찾을 수 없습니다');
        return false;
      }

      if (!status || status.coins < item.price_coins) {
        setError('코인이 부족합니다');
        return false;
      }

      // 이미 소유한지 확인
      var { data: existing } = await supabase
        .from('penguin_inventory')
        .select('id')
        .eq('user_id', TEST_USER_ID)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        setError('이미 소유한 아이템입니다');
        return false;
      }

      // 코인 차감
      var newCoins = status.coins - item.price_coins;
      var { error: updateError } = await supabase
        .from('penguin_status')
        .update({ coins: newCoins })
        .eq('user_id', TEST_USER_ID);

      if (updateError) {
        setError('코인 차감 실패');
        return false;
      }

      // 인벤토리에 추가
      var { error: insertError } = await supabase
        .from('penguin_inventory')
        .insert({
          user_id: TEST_USER_ID,
          item_id: itemId,
          is_equipped: false
        });

      if (insertError) {
        setError('아이템 추가 실패');
        return false;
      }

      // 상태 업데이트
      setStatus(function(prev) {
        var updated = Object.assign({}, prev, { coins: newCoins });
        savePenguinData(updated);
        return updated;
      });

      // 상점/인벤토리 새로고침
      await fetchShop();
      await fetchInventory();

      console.log('✅ 아이템 구매 성공:', item.name);
      return true;
    } catch (e) {
      console.error('Buy item failed:', e);
      setError(e.message);
      return false;
    }
  }, [status, fetchShop, fetchInventory]);

  // 아이템 장착/해제
  var equipItem = useCallback(async function(itemId, equip) {
    var shouldEquip = equip !== false;
    
    try {
      // 같은 카테고리 아이템 해제 (한 종류만 장착 가능)
      if (shouldEquip) {
        var { data: item } = await supabase
          .from('penguin_items')
          .select('item_type')
          .eq('id', itemId)
          .single();

        if (item) {
          // 같은 타입 아이템 해제
          var { data: sameTypeItems } = await supabase
            .from('penguin_inventory')
            .select('id, item_id, penguin_items(item_type)')
            .eq('user_id', TEST_USER_ID)
            .eq('is_equipped', true);

          if (sameTypeItems) {
            for (var i = 0; i < sameTypeItems.length; i++) {
              var invItem = sameTypeItems[i];
              if (invItem.penguin_items && invItem.penguin_items.item_type === item.item_type) {
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
      var { error: updateError } = await supabase
        .from('penguin_inventory')
        .update({ is_equipped: shouldEquip })
        .eq('user_id', TEST_USER_ID)
        .eq('item_id', itemId);

      if (updateError) {
        setError('장착 상태 변경 실패');
        return false;
      }

      // 인벤토리 새로고침
      await fetchInventory();

      console.log(shouldEquip ? '✅ 아이템 장착' : '✅ 아이템 해제');
      return true;
    } catch (e) {
      console.error('Equip item failed:', e);
      setError(e.message);
      return false;
    }
  }, [fetchInventory]);

  // XP 추가
  var addXp = useCallback(async function(amount, source) {
    if (!status) return false;

    try {
      var newTotalXp = status.total_xp + amount;
      var newCurrentXp = status.current_xp + amount;
      var newLevel = status.level;
      var newCoins = status.coins;
      
      // 레벨업 체크
      var xpNeeded = calculateXpForLevel(newLevel);
      while (newCurrentXp >= xpNeeded) {
        newCurrentXp -= xpNeeded;
        newLevel++;
        newCoins += 10; // 레벨업 보너스 코인
        xpNeeded = calculateXpForLevel(newLevel);
      }

      // DB 업데이트
      var { error: updateError } = await supabase
        .from('penguin_status')
        .update({
          total_xp: newTotalXp,
          current_xp: newCurrentXp,
          level: newLevel,
          coins: newCoins,
          last_interaction: new Date().toISOString()
        })
        .eq('user_id', TEST_USER_ID);

      if (updateError) {
        console.error('XP update failed:', updateError);
        return false;
      }

      // XP 히스토리 기록
      await supabase
        .from('xp_history')
        .insert({
          user_id: TEST_USER_ID,
          amount: amount,
          source: source || 'unknown',
          description: source + '로 ' + amount + 'XP 획득'
        });

      // 상태 업데이트
      setStatus(function(prev) {
        var updated = Object.assign({}, prev, {
          total_xp: newTotalXp,
          current_xp: newCurrentXp,
          level: newLevel,
          coins: newCoins
        });
        savePenguinData(updated);
        return updated;
      });

      console.log('✅ XP 추가:', amount, 'from', source);
      return true;
    } catch (e) {
      console.error('Add XP failed:', e);
      return false;
    }
  }, [status]);

  // 코인 추가
  var addCoins = useCallback(async function(amount) {
    if (!status) return false;

    try {
      var newCoins = status.coins + amount;

      var { error: updateError } = await supabase
        .from('penguin_status')
        .update({ coins: newCoins })
        .eq('user_id', TEST_USER_ID);

      if (updateError) {
        console.error('Coins update failed:', updateError);
        return false;
      }

      setStatus(function(prev) {
        var updated = Object.assign({}, prev, { coins: newCoins });
        savePenguinData(updated);
        return updated;
      });

      console.log('✅ 코인 추가:', amount);
      return true;
    } catch (e) {
      console.error('Add coins failed:', e);
      return false;
    }
  }, [status]);

  // 다음 레벨까지 필요한 XP
  var xpToNextLevel = status ? calculateXpForLevel(status.level) - status.current_xp : 0;
  var xpProgress = status ? (status.current_xp / calculateXpForLevel(status.level)) * 100 : 0;

  // 자동 fetch
  useEffect(function() {
    if (shouldAutoFetch) {
      fetchStatus();
    }
  }, [shouldAutoFetch, fetchStatus]);

  return {
    // 상태
    status: status,
    shopItems: shopItems,
    inventory: inventory,
    isLoading: isLoading,
    error: error,
    
    // 계산된 값
    xpToNextLevel: xpToNextLevel,
    xpProgress: xpProgress,
    
    // 조회 함수
    fetchStatus: fetchStatus,
    fetchShop: fetchShop,
    fetchInventory: fetchInventory,
    
    // 액션 함수
    buyItem: buyItem,
    equipItem: equipItem,
    addXp: addXp,
    addCoins: addCoins
  };
}

export default usePenguin;
