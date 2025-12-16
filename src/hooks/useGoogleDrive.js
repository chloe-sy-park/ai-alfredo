// useGoogleDrive.js - Google Drive 동기화 훅
import { useState, useCallback, useEffect } from 'react';
import { useGoogleCalendar } from './useGoogleCalendar';

// localStorage 키 상수
const STORAGE_KEYS = {
  SYNC_ENABLED: 'lifebutler_drive_sync_enabled',
  LAST_SYNC: 'lifebutler_drive_last_sync',
  ENCRYPTION_KEY: 'lifebutler_encryption_key',
  // 동기화할 데이터 키들
  TASKS: 'lifebutler_allTasks',
  ROUTINES: 'lifebutler_routines',
  HEALTH: 'lifebutler_healthCheck',
  RELATIONSHIPS: 'lifebutler_relationshipItems',
  SETTINGS: 'lifebutler_userData',
  GAME_STATE: 'lifebutler_gameState',
};

// 암호화 관련 상수
const ENCRYPTION_ENABLED = true; // 암호화 활성화 여부

export function useGoogleDrive() {
  const { isConnected, getAccessToken, connect, disconnect } = useGoogleCalendar();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [error, setError] = useState(null);
  const [syncProgress, setSyncProgress] = useState(null);

  // 초기화 - 저장된 설정 복원
  useEffect(() => {
    const savedSyncEnabled = localStorage.getItem(STORAGE_KEYS.SYNC_ENABLED) === 'true';
    const savedLastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    
    setSyncEnabled(savedSyncEnabled);
    if (savedLastSync) {
      setLastSync(new Date(savedLastSync));
    }
  }, []);

  // 암호화 키 생성 또는 가져오기
  const getEncryptionKey = useCallback(async () => {
    let keyData = localStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY);
    
    if (!keyData) {
      // 새 키 생성
      const key = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
      
      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
      keyData = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
      localStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, keyData);
      
      return key;
    }
    
    // 기존 키 복원
    const rawKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }, []);

  // 데이터 암호화
  const encryptData = useCallback(async (data) => {
    if (!ENCRYPTION_ENABLED) {
      return JSON.stringify(data);
    }
    
    try {
      const key = await getEncryptionKey();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      
      const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );
      
      // IV + 암호화된 데이터를 합침
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      
      return JSON.stringify({
        encrypted: true,
        data: btoa(String.fromCharCode(...combined)),
      });
    } catch (err) {
      console.error('Encryption error:', err);
      // 암호화 실패 시 평문으로 저장
      return JSON.stringify(data);
    }
  }, [getEncryptionKey]);

  // 데이터 복호화
  const decryptData = useCallback(async (encryptedString) => {
    try {
      const parsed = JSON.parse(encryptedString);
      
      // 암호화되지 않은 데이터
      if (!parsed.encrypted) {
        return parsed;
      }
      
      const key = await getEncryptionKey();
      const combined = Uint8Array.from(atob(parsed.data), c => c.charCodeAt(0));
      
      // IV와 데이터 분리
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);
      
      const decryptedData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );
      
      return JSON.parse(new TextDecoder().decode(decryptedData));
    } catch (err) {
      console.error('Decryption error:', err);
      // 복호화 실패 시 원본 반환 시도
      try {
        return JSON.parse(encryptedString);
      } catch {
        return null;
      }
    }
  }, [getEncryptionKey]);

  // localStorage에서 모든 데이터 수집
  const collectLocalData = useCallback(() => {
    const data = {};
    
    // Tasks
    try {
      const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (tasks) data.tasks = JSON.parse(tasks);
    } catch (e) { console.warn('Failed to parse tasks'); }
    
    // Routines
    try {
      const routines = localStorage.getItem(STORAGE_KEYS.ROUTINES);
      if (routines) data.routines = JSON.parse(routines);
    } catch (e) { console.warn('Failed to parse routines'); }
    
    // Health
    try {
      const health = localStorage.getItem(STORAGE_KEYS.HEALTH);
      if (health) data.health = JSON.parse(health);
    } catch (e) { console.warn('Failed to parse health'); }
    
    // Relationships
    try {
      const relationships = localStorage.getItem(STORAGE_KEYS.RELATIONSHIPS);
      if (relationships) data.relationships = JSON.parse(relationships);
    } catch (e) { console.warn('Failed to parse relationships'); }
    
    // Settings
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settings) data.settings = JSON.parse(settings);
    } catch (e) { console.warn('Failed to parse settings'); }
    
    // Game State
    try {
      const gameState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
      if (gameState) data.gameState = JSON.parse(gameState);
    } catch (e) { console.warn('Failed to parse gameState'); }
    
    return data;
  }, []);

  // localStorage에 데이터 복원
  const restoreLocalData = useCallback((data) => {
    if (data.tasks) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    }
    if (data.routines) {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(data.routines));
    }
    if (data.health) {
      localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(data.health));
    }
    if (data.relationships) {
      localStorage.setItem(STORAGE_KEYS.RELATIONSHIPS, JSON.stringify(data.relationships));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    if (data.gameState) {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data.gameState));
    }
  }, []);

  // Drive에 데이터 백업
  const backupToDrive = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Google에 연결되어 있지 않습니다');
      return false;
    }

    setIsSyncing(true);
    setSyncProgress('데이터 수집 중...');
    setError(null);

    try {
      // 로컬 데이터 수집
      const localData = collectLocalData();
      
      setSyncProgress('데이터 암호화 중...');
      
      // 각 파일 암호화
      const encryptedData = {};
      for (const [key, value] of Object.entries(localData)) {
        if (value !== undefined) {
          encryptedData[key] = await encryptData(value);
        }
      }
      
      encryptedData.deviceInfo = navigator.userAgent;
      
      setSyncProgress('Google Drive에 업로드 중...');
      
      // Drive API 호출
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'syncAll',
          content: encryptedData,
          useAppDataFolder: false, // 사용자 Drive에 저장 (Life Butler 폴더)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '백업에 실패했습니다');
      }

      const result = await response.json();
      
      // 마지막 동기화 시간 저장
      const now = new Date();
      setLastSync(now);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
      
      setSyncProgress(null);
      return true;
    } catch (err) {
      console.error('Backup error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, [getAccessToken, collectLocalData, encryptData]);

  // Drive에서 데이터 복원
  const restoreFromDrive = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Google에 연결되어 있지 않습니다');
      return false;
    }

    setIsSyncing(true);
    setSyncProgress('Google Drive에서 다운로드 중...');
    setError(null);

    try {
      // Drive API 호출
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'restoreAll',
          useAppDataFolder: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || '복원에 실패했습니다');
      }

      const result = await response.json();
      
      if (!result.data || Object.keys(result.data).length === 0) {
        setError('복원할 데이터가 없습니다');
        return false;
      }

      setSyncProgress('데이터 복호화 중...');
      
      // 각 파일 복호화
      const decryptedData = {};
      for (const [key, value] of Object.entries(result.data)) {
        if (key === 'sync_meta') continue; // 메타데이터는 건너뜀
        if (value && typeof value === 'string') {
          decryptedData[key] = await decryptData(value);
        } else if (value) {
          decryptedData[key] = value;
        }
      }

      setSyncProgress('로컬 데이터 업데이트 중...');
      
      // localStorage에 복원
      restoreLocalData(decryptedData);
      
      // 마지막 동기화 시간 저장
      const now = new Date();
      setLastSync(now);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now.toISOString());
      
      return true;
    } catch (err) {
      console.error('Restore error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, [getAccessToken, decryptData, restoreLocalData]);

  // 동기화 활성화/비활성화
  const toggleSync = useCallback((enabled) => {
    setSyncEnabled(enabled);
    localStorage.setItem(STORAGE_KEYS.SYNC_ENABLED, enabled.toString());
    
    if (enabled && isConnected) {
      // 활성화 시 즉시 백업
      backupToDrive();
    }
  }, [isConnected, backupToDrive]);

  // 연결 상태 변경 시 자동 동기화
  useEffect(() => {
    if (isConnected && syncEnabled && !isSyncing) {
      // 마지막 동기화가 1시간 이상 지났으면 자동 동기화
      const oneHour = 60 * 60 * 1000;
      if (!lastSync || (Date.now() - lastSync.getTime()) > oneHour) {
        backupToDrive();
      }
    }
  }, [isConnected, syncEnabled, lastSync, isSyncing, backupToDrive]);

  // Drive에서 파일 목록 가져오기
  const getFileList = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return [];

    try {
      const response = await fetch('/api/drive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'listFiles',
          useAppDataFolder: false,
        }),
      });

      if (!response.ok) return [];

      const result = await response.json();
      return result.files || [];
    } catch (err) {
      console.error('List files error:', err);
      return [];
    }
  }, [getAccessToken]);

  return {
    // 상태
    isConnected,
    isSyncing,
    syncEnabled,
    lastSync,
    error,
    syncProgress,
    
    // 액션
    connect,
    disconnect,
    backupToDrive,
    restoreFromDrive,
    toggleSync,
    getFileList,
    
    // 유틸리티
    encryptData,
    decryptData,
  };
}

export default useGoogleDrive;
