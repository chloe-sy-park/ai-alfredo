// 클라이언트 사이드 암호화 (AES-GCM)

const ENCRYPTION_KEY_NAME = 'alfredo-encryption-key';
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// 마스터 키 생성 또는 가져오기
export async function getOrCreateMasterKey(): Promise<CryptoKey> {
  // IndexedDB에서 키 검색
  const existingKey = await getKeyFromStorage();
  if (existingKey) return existingKey;

  // 새 키 생성
  const key = await crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );

  // IndexedDB에 저장
  await saveKeyToStorage(key);
  return key;
}

// 암호화
export async function encrypt(data: string): Promise<string> {
  const key = await getOrCreateMasterKey();
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  // 랜덤 IV 생성
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    encoded
  );

  // IV + ciphertext 결합 후 Base64 인코딩
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// 복호화
export async function decrypt(encryptedData: string): Promise<string> {
  const key = await getOrCreateMasterKey();
  
  // Base64 디코딩
  const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // IV와 ciphertext 분리
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// IndexedDB에 키 저장
async function saveKeyToStorage(key: CryptoKey): Promise<void> {
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyArray = Array.from(new Uint8Array(exportedKey));
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AlfredoEncryption', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readwrite');
      const store = tx.objectStore('keys');
      store.put(keyArray, ENCRYPTION_KEY_NAME);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
  });
}

// IndexedDB에서 키 가져오기
async function getKeyFromStorage(): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AlfredoEncryption', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('keys')) {
        db.createObjectStore('keys');
      }
    };
    
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', 'readonly');
      const store = tx.objectStore('keys');
      const getRequest = store.get(ENCRYPTION_KEY_NAME);
      
      getRequest.onsuccess = async () => {
        if (!getRequest.result) {
          resolve(null);
          return;
        }
        
        const keyArray = new Uint8Array(getRequest.result);
        const key = await crypto.subtle.importKey(
          'raw',
          keyArray,
          { name: ALGORITHM, length: KEY_LENGTH },
          true,
          ['encrypt', 'decrypt']
        );
        resolve(key);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
}
