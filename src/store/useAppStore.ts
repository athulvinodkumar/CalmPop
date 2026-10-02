import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameId, MoodType, ActiveJourney, JourneyRecord } from '../types';
import { JourneyEngine } from '../engine/journeyEngine';
import { useSessionStore } from './useSessionStore';

export type ScreenType = 
  | 'onboarding'
  | 'checkin'
  | 'recommendations'
  | 'journey_preview'
  | 'journey_summary'
  | 'game'
  | 'postcheck'
  | 'insights'
  | 'catalog';

export type ThemeType = 'light' | 'dark' | 'system';

interface AppState {
  // Navigation & Screen
  currentScreen: ScreenType;
  hasCompletedOnboarding: boolean;
  
  // Theme & Accessibility
  theme: ThemeType;
  soundEnabled: boolean;
  soundVolume: number;
  largeText: boolean;
  reducedMotion: boolean;

  // Active Flow State
  currentMood: MoodType | null;
  stressBefore: number;
  stressAfter: number;
  activeGameId: GameId | null;
  sessionStartTime: number | null;

  // Journey Mode State
  activeJourney: ActiveJourney | null;
  journeyLength: number; // 3, 4, or 5
  journeyShuffleOffset: number;

  // Modals
  explainModalOpen: boolean;
  settingsModalOpen: boolean;
  crisisModalOpen: boolean;

  // Actions
  setScreen: (screen: ScreenType) => void;
  completeOnboarding: () => void;
  setTheme: (theme: ThemeType) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (vol: number) => void;
  setLargeText: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  
  startCheckIn: (mood: MoodType, stress: number) => void;
  launchGame: (gameId: GameId) => void;
  finishGame: () => void;
  completePostCheck: (stressAfter: number) => void;
  cancelSession: () => void;

  // Journey Actions
  initJourney: (mood: MoodType, stress: number, length?: number) => void;
  shuffleJourney: () => void;
  setJourneyLength: (length: number) => void;
  startActiveJourney: () => void;
  finishLevel: (stressAfter: number) => void;
  replayCurrentLevel: () => void;
  advanceToNextLevel: () => void;
  finishFullJourney: () => void;
  resumeJourney: () => void;
  discardJourney: () => void;

  setExplainModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setCrisisModalOpen: (open: boolean) => void;
  resetAllAppState: () => void;
}

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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentScreen: 'checkin',
      hasCompletedOnboarding: false,
      theme: 'system',
      soundEnabled: true,
      soundVolume: 0.7,
      largeText: false,
      reducedMotion: false,

      currentMood: null,
      stressBefore: 5,
      stressAfter: 5,
      activeGameId: null,
      sessionStartTime: null,

      activeJourney: null,
      journeyLength: 3,
      journeyShuffleOffset: 0,

      explainModalOpen: false,
      settingsModalOpen: false,
      crisisModalOpen: false,

      setScreen: (screen) => set({ currentScreen: screen }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true, currentScreen: 'checkin' }),
      setTheme: (theme) => set({ theme }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setSoundVolume: (soundVolume) => set({ soundVolume }),
      setLargeText: (largeText) => set({ largeText }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),

      startCheckIn: (mood, stress) => set({
        currentMood: mood,
        stressBefore: stress,
        currentScreen: 'recommendations'
      }),

      launchGame: (gameId) => set({
        activeGameId: gameId,
        sessionStartTime: Date.now(),
        currentScreen: 'game'
      }),

      finishGame: () => set({
        currentScreen: 'postcheck'
      }),

      completePostCheck: (stressAfter) => set({
        stressAfter
      }),

      cancelSession: () => set({
        activeGameId: null,
        sessionStartTime: null,
        currentScreen: 'checkin'
      }),

      // --- Journey Actions ---
      initJourney: (mood, stress, length) => {
        const targetLen = length || JourneyEngine.getRecommendedJourneyLength(mood, stress);
        const sessions = useSessionStore.getState().sessions;
        const levels = JourneyEngine.generateJourney(mood, sessions, targetLen, 0);

        const newJourney: ActiveJourney = {
          id: `journey_${Date.now()}`,
          mood,
          stressInitial: stress,
          targetLength: targetLen,
          currentLevelIndex: 0,
          levels,
          stressHistory: [stress],
          totalDurationSeconds: 0,
          levelStartTime: Date.now(),
          status: 'in_progress',
          activeGameReplays: 0
        };

        set({
          currentMood: mood,
          stressBefore: stress,
          journeyLength: targetLen,
          journeyShuffleOffset: 0,
          activeJourney: newJourney,
          currentScreen: 'journey_preview'
        });
      },

      shuffleJourney: () => {
        const journey = get().activeJourney;
        if (!journey) return;
        const nextOffset = get().journeyShuffleOffset + 1;
        const sessions = useSessionStore.getState().sessions;
        const levels = JourneyEngine.generateJourney(journey.mood, sessions, journey.targetLength, nextOffset);

        set({
          journeyShuffleOffset: nextOffset,
          activeJourney: {
            ...journey,
            levels
          }
        });
      },

      setJourneyLength: (length) => {
        const journey = get().activeJourney;
        if (!journey) return;
        const validLen = Math.max(3, Math.min(5, length));
        const sessions = useSessionStore.getState().sessions;
        const levels = JourneyEngine.generateJourney(journey.mood, sessions, validLen, get().journeyShuffleOffset);

        set({
          journeyLength: validLen,
          activeJourney: {
            ...journey,
            targetLength: validLen,
            levels
          }
        });
      },

      startActiveJourney: () => {
        const journey = get().activeJourney;
        if (!journey || journey.levels.length === 0) return;
        const currentLevel = journey.levels[journey.currentLevelIndex];

        set({
          activeGameId: currentLevel.gameId,
          sessionStartTime: Date.now(),
          currentScreen: 'game',
          activeJourney: {
            ...journey,
            status: 'in_progress',
            levelStartTime: Date.now()
          }
        });
      },

      finishLevel: (stressAfter) => {
        const journey = get().activeJourney;
        if (!journey) return;
        const currentIdx = journey.currentLevelIndex;
        const currentLevel = journey.levels[currentIdx];
        const elapsed = Math.round((Date.now() - journey.levelStartTime) / 1000);

        // Record session to session store so engine learns
        const prevStress = journey.stressHistory[journey.stressHistory.length - 1] ?? journey.stressInitial;
        useSessionStore.getState().recordSession(
          currentLevel.gameId,
          journey.mood,
          prevStress,
          stressAfter,
          elapsed,
          journey.id,
          currentIdx + 1
        );

        const updatedLevels = [...journey.levels];
        updatedLevels[currentIdx] = {
          ...currentLevel,
          completed: true,
          stressAfter,
          durationSeconds: (currentLevel.durationSeconds || 0) + elapsed
        };

        const updatedHistory = [...journey.stressHistory, stressAfter];
        const updatedTotalDuration = journey.totalDurationSeconds + elapsed;

        set({
          stressAfter,
          activeJourney: {
            ...journey,
            levels: updatedLevels,
            stressHistory: updatedHistory,
            totalDurationSeconds: updatedTotalDuration,
            status: 'intermission'
          }
        });
      },

      replayCurrentLevel: () => {
        const journey = get().activeJourney;
        if (!journey) return;
        const currentIdx = journey.currentLevelIndex;
        const currentLevel = journey.levels[currentIdx];

        const updatedLevels = [...journey.levels];
        updatedLevels[currentIdx] = {
          ...currentLevel,
          replays: currentLevel.replays + 1
        };

        set({
          activeGameId: currentLevel.gameId,
          sessionStartTime: Date.now(),
          currentScreen: 'game',
          activeJourney: {
            ...journey,
            levels: updatedLevels,
            status: 'in_progress',
            levelStartTime: Date.now()
          }
        });
      },

      advanceToNextLevel: () => {
        const journey = get().activeJourney;
        if (!journey) return;
        const nextIdx = journey.currentLevelIndex + 1;

        if (nextIdx < journey.levels.length) {
          const nextLevel = journey.levels[nextIdx];
          set({
            activeGameId: nextLevel.gameId,
            sessionStartTime: Date.now(),
            currentScreen: 'game',
            activeJourney: {
              ...journey,
              currentLevelIndex: nextIdx,
              status: 'in_progress',
              levelStartTime: Date.now()
            }
          });
        } else {
          // Finished all levels!
          get().finishFullJourney();
        }
      },

      finishFullJourney: () => {
        const journey = get().activeJourney;
        if (!journey) return;

        const finalStress = journey.stressHistory[journey.stressHistory.length - 1] ?? journey.stressInitial;
        const stressDrop = journey.stressInitial - finalStress;

        const record: JourneyRecord = {
          id: journey.id,
          mood: journey.mood,
          stressInitial: journey.stressInitial,
          stressFinal: finalStress,
          stressDrop,
          totalDurationSeconds: journey.totalDurationSeconds,
          levels: journey.levels,
          timestamp: Date.now(),
          completed: true
        };

        useSessionStore.getState().recordJourney(record);

        set({
          activeGameId: null,
          activeJourney: {
            ...journey,
            status: 'completed'
          },
          currentScreen: 'journey_summary'
        });
      },

      resumeJourney: () => {
        const journey = get().activeJourney;
        if (!journey) return;
        if (journey.status === 'completed') {
          set({ currentScreen: 'journey_summary' });
        } else if (journey.status === 'intermission') {
          set({ currentScreen: 'game' }); // Shows intermission modal
        } else if (journey.levels.length > 0) {
          const currentLevel = journey.levels[journey.currentLevelIndex];
          set({
            activeGameId: currentLevel.gameId,
            sessionStartTime: Date.now(),
            currentScreen: 'game'
          });
        } else {
          set({ currentScreen: 'journey_preview' });
        }
      },

      discardJourney: () => {
        set({
          activeJourney: null,
          activeGameId: null,
          sessionStartTime: null,
          currentScreen: 'checkin'
        });
      },

      setExplainModalOpen: (open) => set({ explainModalOpen: open }),
      setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
      setCrisisModalOpen: (open) => set({ crisisModalOpen: open }),

      resetAllAppState: () => set({
        currentScreen: 'onboarding',
        hasCompletedOnboarding: false,
        theme: 'system',
        soundEnabled: true,
        soundVolume: 0.7,
        largeText: false,
        reducedMotion: false,
        currentMood: null,
        stressBefore: 5,
        stressAfter: 5,
        activeGameId: null,
        sessionStartTime: null,
        activeJourney: null,
        journeyLength: 3,
        journeyShuffleOffset: 0,
        explainModalOpen: false,
        settingsModalOpen: false,
        crisisModalOpen: false
      })
    }),
    {
      name: 'calmpop_app_settings',
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        soundVolume: state.soundVolume,
        largeText: state.largeText,
        reducedMotion: state.reducedMotion,
        activeJourney: state.activeJourney,
        journeyLength: state.journeyLength
      }),
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
