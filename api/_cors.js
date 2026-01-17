// 공유 CORS 유틸리티
// 허용된 도메인 목록

const ALLOWED_ORIGINS = [
  'https://ai-alfredo.vercel.app',
  'https://alfredo.vercel.app',
  // 개발 환경
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

/**
 * CORS 헤더 설정
 * @param {Request} req
 * @param {Response} res
 * @returns {boolean} - preflight 요청이면 true
 */
export function setCorsHeaders(req, res) {
  const origin = req.headers.origin || req.headers.referer || '';

  // 허용된 origin인지 확인
  const allowedOrigin = ALLOWED_ORIGINS.find(allowed =>
    origin.startsWith(allowed)
  );

  // 허용된 origin이 있으면 해당 origin 설정, 없으면 첫 번째 프로덕션 도메인 설정
  const corsOrigin = allowedOrigin || ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // OPTIONS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}

/**
 * 환경 변수에서 허용된 도메인 추가
 */
export function getAdditionalOrigins() {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(',').map(o => o.trim());
  }
  return [];
}
