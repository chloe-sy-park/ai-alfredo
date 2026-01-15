import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BodyDoublingSession {
  id: string;
  task: string;
  startTime: Date;
  duration: number; // 분 단위
  endTime?: Date;
  completed: boolean;
}

interface BodyDoublingState {
  isActive: boolean;
  currentSession: BodyDoublingSession | null;
  sessions: BodyDoublingSession[];
  
  // Actions
  startSession: (task: string, duration: number) => void;
  endSession: (completed?: boolean) => void;
  getElapsedTime: () => number; // 경과 시간 (초)
  getRemainingTime: () => number; // 남은 시간 (초)
  getSessions: (date?: Date) => BodyDoublingSession[];
}

export const useBodyDoublingStore = create<BodyDoublingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentSession: null,
      sessions: [],
      
      startSession: (task, duration) => {
        const session: BodyDoublingSession = {
          id: Date.now().toString(),
          task,
          startTime: new Date(),
          duration,
          completed: false
        };
        
        set({
          isActive: true,
          currentSession: session
        });
      },
      
      endSession: (completed = false) => {
        const { currentSession, sessions } = get();
        
        if (currentSession) {
          const endedSession = {
            ...currentSession,
            endTime: new Date(),
            completed
          };
          
          set({
            isActive: false,
            currentSession: null,
            sessions: [...sessions, endedSession]
          });
        }
      },
      
      getElapsedTime: () => {
        const { currentSession } = get();
        if (!currentSession) return 0;
        
        const now = new Date();
        return Math.floor((now.getTime() - currentSession.startTime.getTime()) / 1000);
      },
      
      getRemainingTime: () => {
        const { currentSession } = get();
        if (!currentSession) return 0;
        
        const elapsed = get().getElapsedTime();
        const totalSeconds = currentSession.duration * 60;
        return Math.max(0, totalSeconds - elapsed);
      },
      
      getSessions: (date) => {
        const { sessions } = get();
        
        if (!date) return sessions;
        
        return sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return (
            sessionDate.getFullYear() === date.getFullYear() &&
            sessionDate.getMonth() === date.getMonth() &&
            sessionDate.getDate() === date.getDate()
          );
        });
      }
    }),
    {
      name: 'body-doubling-storage'
    }
  )
);