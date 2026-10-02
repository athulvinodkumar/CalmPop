import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { useSessionStore } from '../store/useSessionStore';

describe('Journey Mode Flow Integration', () => {
  beforeEach(() => {
    useAppStore.getState().resetAllAppState();
    useSessionStore.getState().clearAllData();
  });

  it('initializes a journey preview with the chosen mood and length', () => {
    useAppStore.getState().initJourney('Anxious', 8, 3);
    const state = useAppStore.getState();

    expect(state.currentScreen).toBe('journey_preview');
    expect(state.activeJourney).not.toBeNull();
    expect(state.activeJourney?.mood).toBe('Anxious');
    expect(state.activeJourney?.stressInitial).toBe(8);
    expect(state.activeJourney?.levels).toHaveLength(3);
  });

  it('automatically derives journey length (min 3, max 5) from mood and stress when omitted', () => {
    // Intense stress 8 -> 5 levels
    useAppStore.getState().initJourney('Anxious', 8);
    expect(useAppStore.getState().activeJourney?.levels).toHaveLength(5);

    // Moderate stress 6 -> 4 levels
    useAppStore.getState().initJourney('Sad', 6);
    expect(useAppStore.getState().activeJourney?.levels).toHaveLength(4);

    // Low stress 3 -> 3 levels
    useAppStore.getState().initJourney('Tired', 3);
    expect(useAppStore.getState().activeJourney?.levels).toHaveLength(3);
  });

  it('updates journey length to 4 and 5 levels dynamically', () => {
    useAppStore.getState().initJourney('Angry', 7, 3);
    expect(useAppStore.getState().activeJourney?.levels).toHaveLength(3);

    useAppStore.getState().setJourneyLength(4);
    expect(useAppStore.getState().activeJourney?.levels).toHaveLength(4);

    useAppStore.getState().setJourneyLength(5);
    expect(useAppStore.getState().activeJourney?.levels).toHaveLength(5);
  });

  it('starts the journey and loads Level 1 game', () => {
    useAppStore.getState().initJourney('Sad', 9, 3);
    useAppStore.getState().startActiveJourney();

    const state = useAppStore.getState();
    expect(state.currentScreen).toBe('game');
    expect(state.activeGameId).toBe(state.activeJourney?.levels[0].gameId);
    expect(state.activeJourney?.currentLevelIndex).toBe(0);
  });

  it('supports replaying a level without advancing', () => {
    useAppStore.getState().initJourney('Tired', 6, 3);
    useAppStore.getState().startActiveJourney();

    expect(useAppStore.getState().activeJourney?.levels[0].replays).toBe(0);

    useAppStore.getState().replayCurrentLevel();
    expect(useAppStore.getState().activeJourney?.currentLevelIndex).toBe(0);
    expect(useAppStore.getState().activeJourney?.levels[0].replays).toBe(1);
  });

  it('advances through levels and finishes journey, recording journey stats', () => {
    useAppStore.getState().initJourney('Overwhelmed', 9, 3);
    useAppStore.getState().startActiveJourney();

    // Finish Level 1 (stress drops 9 -> 7)
    useAppStore.getState().finishLevel(7);
    expect(useAppStore.getState().activeJourney?.status).toBe('intermission');

    // Advance to Level 2
    useAppStore.getState().advanceToNextLevel();
    expect(useAppStore.getState().activeJourney?.currentLevelIndex).toBe(1);

    // Finish Level 2 (stress drops 7 -> 5)
    useAppStore.getState().finishLevel(5);

    // Advance to Level 3
    useAppStore.getState().advanceToNextLevel();
    expect(useAppStore.getState().activeJourney?.currentLevelIndex).toBe(2);

    // Finish Level 3 (stress drops 5 -> 3)
    useAppStore.getState().finishLevel(3);

    // Advance from final level finishes journey
    useAppStore.getState().advanceToNextLevel();

    const finalState = useAppStore.getState();
    expect(finalState.currentScreen).toBe('journey_summary');
    expect(finalState.activeJourney?.status).toBe('completed');

    // Verify session store recorded all 3 individual rounds and 1 full journey
    const sessionState = useSessionStore.getState();
    expect(sessionState.sessions).toHaveLength(3);
    expect(sessionState.journeys).toHaveLength(1);

    const journeyRecord = sessionState.journeys[0];
    expect(journeyRecord.stressInitial).toBe(9);
    expect(journeyRecord.stressFinal).toBe(3);
    expect(journeyRecord.stressDrop).toBe(6);
    expect(journeyRecord.completed).toBe(true);
  });

  it('guarantees Level 2 to Level 3 status transition from in_progress -> intermission -> in_progress', () => {
    useAppStore.getState().initJourney('Anxious', 8, 3);
    useAppStore.getState().startActiveJourney();

    expect(useAppStore.getState().activeJourney?.status).toBe('in_progress');
    expect(useAppStore.getState().activeJourney?.currentLevelIndex).toBe(0);

    // Level 1 complete
    useAppStore.setState((s) => ({
      activeJourney: s.activeJourney ? { ...s.activeJourney, status: 'intermission' } : null
    }));
    expect(useAppStore.getState().activeJourney?.status).toBe('intermission');

    // Advance to Level 2
    useAppStore.getState().advanceToNextLevel();
    expect(useAppStore.getState().activeJourney?.status).toBe('in_progress');
    expect(useAppStore.getState().activeJourney?.currentLevelIndex).toBe(1);

    // Level 2 complete
    useAppStore.setState((s) => ({
      activeJourney: s.activeJourney ? { ...s.activeJourney, status: 'intermission' } : null
    }));
    expect(useAppStore.getState().activeJourney?.status).toBe('intermission');

    // Advance to Level 3 (Breath Bloom)
    const level3GameId = useAppStore.getState().activeJourney?.levels[2].gameId;
    useAppStore.getState().advanceToNextLevel();
    expect(useAppStore.getState().activeJourney?.status).toBe('in_progress');
    expect(useAppStore.getState().activeJourney?.currentLevelIndex).toBe(2);
    expect(useAppStore.getState().activeGameId).toBe(level3GameId);
  });
});
