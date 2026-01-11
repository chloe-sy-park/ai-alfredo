import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Service Role 클라이언트 (관리자 권한)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 사용자 컨텍스트 클라이언트 생성
export function createUserClient(authHeader: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Authorization 헤더에서 사용자 정보 추출
export async function getUserFromAuth(authHeader: string | null) {
  if (!authHeader) {
    return { user: null, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error) {
    return { user: null, error: error.message };
  }

  return { user, error: null };
}
