import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { getUserFromAuth, supabaseAdmin } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const authHeader = req.headers.get('Authorization');
    const { user, error } = await getUserFromAuth(authHeader);

    if (error || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    // Supabase 세션 종료
    await supabaseAdmin.auth.admin.signOut(user.id);

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Auth Logout Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Logout failed', 500);
  }
});
