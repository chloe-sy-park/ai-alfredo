/**
 * 클라이언트 암호화 서비스
 * AES-GCM 기반 민감 데이터 암호화
 */

// 암호화 설정
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

/**
 * PBKDF2를 사용한 키 파생
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // 비밀번호로부터 기본 키 생성
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // AES 키 파생 (salt를 ArrayBuffer로 변환)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 데이터 암호화
 */
export async function encrypt(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Salt와 IV 생성
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // 키 파생
  const key = await deriveKey(password, salt);

  // 암호화
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    dataBuffer
  );

  // Salt + IV + 암호화된 데이터를 합쳐서 Base64로 인코딩
  const combined = new Uint8Array(
    SALT_LENGTH + IV_LENGTH + encryptedBuffer.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, SALT_LENGTH);
  combined.set(new Uint8Array(encryptedBuffer), SALT_LENGTH + IV_LENGTH);

  return btoa(String.fromCharCode(...combined));
}

/**
 * 데이터 복호화
 */
export async function decrypt(encryptedData: string, password: string): Promise<string> {
  // Base64 디코딩
  const combined = new Uint8Array(
    atob(encryptedData)
      .split('')
      .map((c) => c.charCodeAt(0))
  );

  // Salt, IV, 암호화된 데이터 분리
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedBuffer = combined.slice(SALT_LENGTH + IV_LENGTH);

  // 키 파생
  const key = await deriveKey(password, salt);

  // 복호화
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * 객체 암호화
 */
export async function encryptObject<T>(data: T, password: string): Promise<string> {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString, password);
}

/**
 * 객체 복호화
 */
export async function decryptObject<T>(encryptedData: string, password: string): Promise<T> {
  const jsonString = await decrypt(encryptedData, password);
  return JSON.parse(jsonString);
}

/**
 * 해시 생성 (비밀번호 저장용이 아닌 무결성 검증용)
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 랜덤 키 생성
 */
export function generateRandomKey(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Web Crypto API 지원 여부 확인
 */
export function isCryptoSupported(): boolean {
  return typeof crypto !== 'undefined' && crypto.subtle !== undefined;
}

export default {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  hash,
  generateRandomKey,
  isCryptoSupported,
};
