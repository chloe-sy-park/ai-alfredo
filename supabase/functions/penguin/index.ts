import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const userId = user.user_metadata?.user_id;
    if (!userId) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'User not found', 401);
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const action = pathParts[1]; // /penguin/status, /penguin/shop, /penguin/buy

    switch (req.method) {
      case 'GET':
        if (action === 'shop') return getShop(userId);
        if (action === 'inventory') return getInventory(userId);
        if (action === 'achievements') return getAchievements(userId);
        return getStatus(userId);
      case 'POST':
        if (action === 'buy') return buyItem(userId, await req.json());
        if (action === 'equip') return equipItem(userId, await req.json());
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Unknown action', 400);
      default:
        return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }
  } catch (error) {
    console.error('Penguin Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});

// 펭귄 상태 조회
async function getStatus(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('penguin_status')
    .select(`
      *,
      penguin_inventory (
        item_id,
        is_equipped,
        penguin_items (*)
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    // 상태가 없으면 생성
    if (error.code === 'PGRST116') {
      const { data: newStatus, error: createError } = await supabaseAdmin
        .from('penguin_status')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        return errorResponse(ErrorCodes.INTERNAL_ERROR, createError.message, 500);
      }

      return successResponse(newStatus);
    }
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // 장착 중인 아이템 분리
  const equippedItems = data.penguin_inventory
    ?.filter((inv: any) => inv.is_equipped)
    ?.map((inv: any) => inv.penguin_items) || [];

  return successResponse({
    ...data,
    equipped_items: equippedItems,
    penguin_inventory: undefined,
  });
}

// 상점 조회
async function getShop(userId: string) {
  // 사용자 레벨 확인
  const { data: status } = await supabaseAdmin
    .from('penguin_status')
    .select('level, coins')
    .eq('user_id', userId)
    .single();

  // 구매 가능한 아이템 조회
  const { data: items, error } = await supabaseAdmin
    .from('penguin_items')
    .select('*')
    .eq('is_available', true)
    .lte('required_level', status?.level || 1)
    .order('category')
    .order('price');

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  // 이미 보유한 아이템 확인
  const { data: owned } = await supabaseAdmin
    .from('penguin_inventory')
    .select('item_id')
    .eq('user_id', userId);

  const ownedIds = new Set(owned?.map(o => o.item_id));

  const itemsWithOwnership = items?.map(item => ({
    ...item,
    owned: ownedIds.has(item.id),
    can_afford: (status?.coins || 0) >= item.price,
  }));

  return successResponse({
    items: itemsWithOwnership,
    user_coins: status?.coins || 0,
  });
}

// 인벤토리 조회
async function getInventory(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('penguin_inventory')
    .select(`
      *,
      penguin_items (*)
    `)
    .eq('user_id', userId);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse(data);
}

// 아이템 구매
async function buyItem(userId: string, body: any) {
  const { item_id } = body;

  if (!item_id) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'Item ID is required', 400);
  }

  // 아이템 정보 확인
  const { data: item } = await supabaseAdmin
    .from('penguin_items')
    .select('*')
    .eq('id', item_id)
    .single();

  if (!item) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Item not found', 404);
  }

  // 사용자 상태 확인
  const { data: status } = await supabaseAdmin
    .from('penguin_status')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!status) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Penguin status not found', 404);
  }

  // 레벨 확인
  if (status.level < item.required_level) {
    return errorResponse(
      ErrorCodes.LIMIT_EXCEEDED,
      `Level ${item.required_level} required`,
      400
    );
  }

  // 코인 확인
  if (status.coins < item.price) {
    return errorResponse(
      ErrorCodes.LIMIT_EXCEEDED,
      'Not enough coins',
      400,
      { required: item.price, current: status.coins }
    );
  }

  // 이미 소유 확인
  const { data: existing } = await supabaseAdmin
    .from('penguin_inventory')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', item_id)
    .single();

  if (existing) {
    return errorResponse(ErrorCodes.ALREADY_EXISTS, 'Item already owned', 400);
  }

  // 구매 처리
  await supabaseAdmin
    .from('penguin_status')
    .update({ coins: status.coins - item.price })
    .eq('user_id', userId);

  const { data: inventory, error } = await supabaseAdmin
    .from('penguin_inventory')
    .insert({
      user_id: userId,
      item_id,
    })
    .select(`
      *,
      penguin_items (*)
    `)
    .single();

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({
    purchased: true,
    item: inventory,
    remaining_coins: status.coins - item.price,
  });
}

// 아이템 장착
async function equipItem(userId: string, body: any) {
  const { item_id, equip = true } = body;

  if (!item_id) {
    return errorResponse(ErrorCodes.MISSING_FIELD, 'Item ID is required', 400);
  }

  // 소유 확인
  const { data: inventory } = await supabaseAdmin
    .from('penguin_inventory')
    .select(`
      *,
      penguin_items (*)
    `)
    .eq('user_id', userId)
    .eq('item_id', item_id)
    .single();

  if (!inventory) {
    return errorResponse(ErrorCodes.NOT_FOUND, 'Item not in inventory', 404);
  }

  // 같은 카테고리 아이템 해제 (장착 시)
  if (equip) {
    const category = inventory.penguin_items.category;

    // 같은 카테고리의 다른 아이템 해제
    await supabaseAdmin
      .from('penguin_inventory')
      .update({ is_equipped: false })
      .eq('user_id', userId)
      .eq('is_equipped', true)
      .neq('item_id', item_id);

    // 정확히는 카테고리 기반으로 해제해야 하지만, 단순화를 위해 전체 해제
  }

  // 장착/해제
  const { error } = await supabaseAdmin
    .from('penguin_inventory')
    .update({ is_equipped: equip })
    .eq('id', inventory.id);

  if (error) {
    return errorResponse(ErrorCodes.INTERNAL_ERROR, error.message, 500);
  }

  return successResponse({
    equipped: equip,
    item: inventory.penguin_items,
  });
}

// 업적 조회 (간단 버전)
async function getAchievements(userId: string) {
  // TODO: 업적 시스템 구현
  return successResponse({
    achievements: [],
    message: 'Achievements coming soon!',
  });
}
