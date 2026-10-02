import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from './useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.getState().clearAllData();
  });

  it('records a session and calculates stress drop correctly', () => {
    const record = useSessionStore.getState().recordSession(
      'breathing',
      'Anxious',
      8,
      3,
      120
    );

    expect(record.stressBefore).toBe(8);
    expect(record.stressAfter).toBe(3);
    expect(record.stressDrop).toBe(5);
    expect(record.gameId).toBe('breathing');
    expect(record.mood).toBe('Anxious');

    const sessions = useSessionStore.getState().sessions;
    expect(sessions.length).toBe(1);
    expect(sessions[0].id).toBe(record.id);
  });

  it('adds and retrieves gratitude entries', () => {
    const entry = useSessionStore.getState().addGratitudeEntry('Morning sunlight', '#fde047');
    expect(entry.text).toBe('Morning sunlight');
    expect(entry.starColor).toBe('#fde047');

    const entries = useSessionStore.getState().gratitudeEntries;
    expect(entries.some(e => e.text === 'Morning sunlight')).toBe(true);

    const random = useSessionStore.getState().getRandomGratitudeEntry();
    expect(random).not.toBeNull();
  });

  it('exports and imports backup data faithfully', () => {
    useSessionStore.getState().recordSession('calm-keys', 'Sad', 7, 4, 180);
    useSessionStore.getState().addGratitudeEntry('A warm cup of coffee');

    const jsonStr = useSessionStore.getState().exportAllData();
    expect(jsonStr).toContain('calm-keys');
    expect(jsonStr).toContain('A warm cup of coffee');

    // Clear state
    useSessionStore.getState().clearAllData();
    expect(useSessionStore.getState().sessions.length).toBe(0);

    // Import back
    const parsed = JSON.parse(jsonStr);
    const success = useSessionStore.getState().importAllData(parsed);
    expect(success).toBe(true);

    expect(useSessionStore.getState().sessions.length).toBe(1);
    expect(useSessionStore.getState().sessions[0].gameId).toBe('calm-keys');
  });

  it('clears all data completely', () => {
    useSessionStore.getState().recordSession('bubble-pop', 'Angry', 9, 5, 60);
    expect(useSessionStore.getState().sessions.length).toBe(1);

    useSessionStore.getState().clearAllData();
    expect(useSessionStore.getState().sessions.length).toBe(0);
    expect(useSessionStore.getState().gratitudeEntries.length).toBe(0);
    expect(useSessionStore.getState().streak).toBe(0);
  });
});
