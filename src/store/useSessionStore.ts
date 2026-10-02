import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId, GratitudeEntry, MoodType, SessionRecord, JourneyRecord } from '../types';

interface SessionState {
  sessions: SessionRecord[];
  journeys: JourneyRecord[];
  gratitudeEntries: GratitudeEntry[];
  streak: number;
  lastActiveDate: string | null;

  // Actions
  recordSession: (
    gameId: GameId,
    mood: MoodType,
    stressBefore: number,
    stressAfter: number,
    durationSeconds: number,
    journeyId?: string,
    levelNumber?: number
  ) => SessionRecord;

  recordJourney: (journey: JourneyRecord) => void;
  addGratitudeEntry: (text: string, starColor?: string) => GratitudeEntry;
  getRandomGratitudeEntry: () => GratitudeEntry | null;
  clearAllData: () => void;
  importAllData: (jsonData: {
    sessions?: SessionRecord[];
    journeys?: JourneyRecord[];
    gratitudeEntries?: GratitudeEntry[];
    streak?: number;
    lastActiveDate?: string;
  }) => boolean;
  exportAllData: () => string;
}

const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(name);
      }
    } catch {
      // Graceful fallback
    }
    return null;
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch {
      // Storage quota exceeded or disabled
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
    } catch {
      // Graceful fallback
    }
  }
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      journeys: [],
      gratitudeEntries: [
        {
          id: 'welcome-star-1',
          text: 'Took a peaceful moment to pause today.',
          date: getTodayDateString(),
          timestamp: Date.now() - 86400000,
          starColor: '#fde047'
        },
        {
          id: 'welcome-star-2',
          text: 'Enjoyed a warm cup of herbal tea.',
          date: getTodayDateString(),
          timestamp: Date.now() - 172800000,
          starColor: '#a7f3d0'
        }
      ],
      streak: 1,
      lastActiveDate: getTodayDateString(),

      recordSession: (gameId, mood, stressBefore, stressAfter, durationSeconds, journeyId, levelNumber) => {
        const today = getTodayDateString();
        const prevLastDate = get().lastActiveDate;
        let newStreak = get().streak;

        if (prevLastDate !== today) {
          if (prevLastDate) {
            const last = new Date(prevLastDate);
            const now = new Date(today);
            const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }
        }

        const stressDrop = stressBefore - stressAfter;
        const newRecord: SessionRecord = {
          id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          gameId,
          mood,
          stressBefore,
          stressAfter,
          stressDrop,
          durationSeconds: Math.max(1, durationSeconds),
          timestamp: Date.now(),
          journeyId,
          levelNumber
        };

        set((state) => ({
          sessions: [newRecord, ...state.sessions],
          streak: newStreak,
          lastActiveDate: today
        }));

        return newRecord;
      },

      recordJourney: (journey: JourneyRecord) => {
        set((state) => ({
          journeys: [journey, ...state.journeys]
        }));
      },

      addGratitudeEntry: (text, starColor = '#fde047') => {
        const today = getTodayDateString();
        const newEntry: GratitudeEntry = {
          id: `gratitude_${Date.now()}`,
          text: text.trim(),
          date: today,
          timestamp: Date.now(),
          starColor
        };

        set((state) => ({
          gratitudeEntries: [newEntry, ...state.gratitudeEntries]
        }));

        return newEntry;
      },

      getRandomGratitudeEntry: () => {
        const entries = get().gratitudeEntries;
        if (!entries || entries.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * entries.length);
        return entries[randomIndex];
      },

      clearAllData: () => {
        set({
          sessions: [],
          journeys: [],
          gratitudeEntries: [],
          streak: 0,
          lastActiveDate: null
        });
      },

      importAllData: (jsonData) => {
        try {
          if (!jsonData || typeof jsonData !== 'object') return false;
          set({
            sessions: Array.isArray(jsonData.sessions) ? jsonData.sessions : [],
            journeys: Array.isArray(jsonData.journeys) ? jsonData.journeys : [],
            gratitudeEntries: Array.isArray(jsonData.gratitudeEntries) ? jsonData.gratitudeEntries : [],
            streak: typeof jsonData.streak === 'number' ? jsonData.streak : 1,
            lastActiveDate: typeof jsonData.lastActiveDate === 'string' ? jsonData.lastActiveDate : getTodayDateString()
          });
          return true;
        } catch {
          return false;
        }
      },

      exportAllData: () => {
        const state = get();
        const payload = {
          version: '1.1',
          exportedAt: new Date().toISOString(),
          sessions: state.sessions,
          journeys: state.journeys,
          gratitudeEntries: state.gratitudeEntries,
          streak: state.streak,
          lastActiveDate: state.lastActiveDate
        };
        return JSON.stringify(payload, null, 2);
      }
    }),
    {
      name: 'calmpop_session_data',
      storage: {
        getItem: (name) => {
          const str = safeStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, val) => safeStorage.setItem(name, JSON.stringify(val)),
        removeItem: (name) => safeStorage.removeItem(name)
      }
    }
  )
);
