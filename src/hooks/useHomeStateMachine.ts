// useHomeStateMachine.ts - OS 전환 상태 머신 (Design System v1)
import { useReducer, useCallback, useEffect } from 'react';
import { OSType } from '../components/home/MainCard';

// ========================================
// Types
// ========================================

export type GlassState = 'loading' | 'ready' | 'empty' | 'error' | 'offline';
export type ErrorType = 'generic' | 'permission' | 'network';

interface OSState {
  glassState: GlassState;
  errorType?: ErrorType;
  payload?: unknown;
  isCached?: boolean;
  lastUpdated?: string;
}

interface HomeState {
  currentOS: OSType;
  states: Record<OSType, OSState>;
  isOnline: boolean;
}

// ========================================
// Actions
// ========================================

type HomeAction =
  | { type: 'SELECT_OS'; os: OSType }
  | { type: 'FETCH_START'; os: OSType }
  | { type: 'FETCH_SUCCESS'; os: OSType; payload: unknown }
  | { type: 'FETCH_EMPTY'; os: OSType }
  | { type: 'FETCH_ERROR'; os: OSType; errorType: ErrorType }
  | { type: 'NETWORK_OFFLINE' }
  | { type: 'NETWORK_ONLINE' }
  | { type: 'RETRY'; os: OSType }
  | { type: 'CACHE_FOUND'; os: OSType; payload: unknown; lastUpdated: string }
  | { type: 'CACHE_MISSING'; os: OSType };

// ========================================
// Initial State
// ========================================

const initialOSState: OSState = {
  glassState: 'loading',
};

const initialState: HomeState = {
  currentOS: 'work',
  states: {
    work: { ...initialOSState },
    life: { ...initialOSState },
    finance: { ...initialOSState },
  },
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
};

// ========================================
// Reducer
// ========================================

function homeReducer(state: HomeState, action: HomeAction): HomeState {
  switch (action.type) {
    case 'SELECT_OS':
      return {
        ...state,
        currentOS: action.os,
        states: {
          ...state.states,
          [action.os]: {
            ...state.states[action.os],
            glassState: 'loading',
          },
        },
      };

    case 'FETCH_START':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            ...state.states[action.os],
            glassState: 'loading',
          },
        },
      };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            glassState: 'ready',
            payload: action.payload,
            isCached: false,
            lastUpdated: new Date().toISOString(),
          },
        },
      };

    case 'FETCH_EMPTY':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            glassState: 'empty',
          },
        },
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            glassState: 'error',
            errorType: action.errorType,
          },
        },
      };

    case 'NETWORK_OFFLINE':
      // 오프라인 상태: 현재 OS의 캐시 여부에 따라 처리
      const currentOSState = state.states[state.currentOS];
      if (currentOSState.payload) {
        // 캐시 있음: ready(isCached) 유지
        return {
          ...state,
          isOnline: false,
          states: {
            ...state.states,
            [state.currentOS]: {
              ...currentOSState,
              glassState: 'ready',
              isCached: true,
            },
          },
        };
      } else {
        // 캐시 없음: offline
        return {
          ...state,
          isOnline: false,
          states: {
            ...state.states,
            [state.currentOS]: {
              glassState: 'offline',
            },
          },
        };
      }

    case 'NETWORK_ONLINE':
      return {
        ...state,
        isOnline: true,
      };

    case 'RETRY':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            glassState: 'loading',
          },
        },
      };

    case 'CACHE_FOUND':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            glassState: 'ready',
            payload: action.payload,
            isCached: true,
            lastUpdated: action.lastUpdated,
          },
        },
      };

    case 'CACHE_MISSING':
      return {
        ...state,
        states: {
          ...state.states,
          [action.os]: {
            glassState: 'offline',
          },
        },
      };

    default:
      return state;
  }
}

// ========================================
// Hook
// ========================================

interface UseHomeStateMachineOptions {
  initialOS?: OSType;
  onOSChange?: (os: OSType) => void;
}

export function useHomeStateMachine(options: UseHomeStateMachineOptions = {}) {
  const { initialOS = 'work', onOSChange } = options;

  const [state, dispatch] = useReducer(homeReducer, {
    ...initialState,
    currentOS: initialOS,
  });

  // OS 선택
  const selectOS = useCallback((os: OSType) => {
    dispatch({ type: 'SELECT_OS', os });
    onOSChange?.(os);
  }, [onOSChange]);

  // Fetch 시작
  const startFetch = useCallback((os: OSType) => {
    dispatch({ type: 'FETCH_START', os });
  }, []);

  // Fetch 성공
  const fetchSuccess = useCallback((os: OSType, payload: unknown) => {
    dispatch({ type: 'FETCH_SUCCESS', os, payload });
  }, []);

  // Fetch 빈 데이터
  const fetchEmpty = useCallback((os: OSType) => {
    dispatch({ type: 'FETCH_EMPTY', os });
  }, []);

  // Fetch 에러
  const fetchError = useCallback((os: OSType, errorType: ErrorType) => {
    dispatch({ type: 'FETCH_ERROR', os, errorType });
  }, []);

  // 재시도
  const retry = useCallback((os: OSType) => {
    dispatch({ type: 'RETRY', os });
  }, []);

  // 캐시 발견
  const cacheFound = useCallback((os: OSType, payload: unknown, lastUpdated: string) => {
    dispatch({ type: 'CACHE_FOUND', os, payload, lastUpdated });
  }, []);

  // 캐시 없음
  const cacheMissing = useCallback((os: OSType) => {
    dispatch({ type: 'CACHE_MISSING', os });
  }, []);

  // 네트워크 상태 감지
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'NETWORK_ONLINE' });
    const handleOffline = () => dispatch({ type: 'NETWORK_OFFLINE' });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 현재 OS 상태 getter
  const currentOSState = state.states[state.currentOS];

  return {
    // State
    currentOS: state.currentOS,
    glassState: currentOSState.glassState,
    errorType: currentOSState.errorType,
    payload: currentOSState.payload,
    isCached: currentOSState.isCached,
    lastUpdated: currentOSState.lastUpdated,
    isOnline: state.isOnline,

    // All OS states
    osStates: state.states,

    // Actions
    selectOS,
    startFetch,
    fetchSuccess,
    fetchEmpty,
    fetchError,
    retry,
    cacheFound,
    cacheMissing,
  };
}

export default useHomeStateMachine;
