import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'Refresh token is required', 400);
    }

    // Supabase 세션 갱신
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return errorResponse(ErrorCodes.TOKEN_EXPIRED, 'Invalid or expired refresh token', 401);
    }

    return successResponse({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
    });
  } catch (error) {
    console.error('Auth Refresh Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Token refresh failed', 500);
  }
});
