import { describe, it, expect } from 'vitest';
import { JourneyEngine, WIND_DOWN_GAMES } from './journeyEngine';
import type { MoodType } from '../types';

describe('JourneyEngine', () => {
  const moods: MoodType[] = ['Anxious', 'Angry', 'Sad', 'Tired', 'Overwhelmed', 'Restless', 'Okay'];

  it('generates journeys for each of the 7 moods with no duplicate games', () => {
    for (const mood of moods) {
      const journey = JourneyEngine.generateJourney(mood, [], 3);
      expect(journey).toHaveLength(3);

      const gameIds = journey.map(l => l.gameId);
      const uniqueIds = new Set(gameIds);
      expect(uniqueIds.size).toBe(3); // No repeats!

      // Final level is a calming wind-down game
      const finalGame = journey[2].gameId;
      expect(WIND_DOWN_GAMES).toContain(finalGame);
    }
  });

  it('supports 4 and 5 level journeys with no duplicate games', () => {
    const journey4 = JourneyEngine.generateJourney('Overwhelmed', [], 4);
    expect(journey4).toHaveLength(4);
    expect(new Set(journey4.map(l => l.gameId)).size).toBe(4);
    expect(WIND_DOWN_GAMES).toContain(journey4[3].gameId);

    const journey5 = JourneyEngine.generateJourney('Restless', [], 5);
    expect(journey5).toHaveLength(5);
    expect(new Set(journey5.map(l => l.gameId)).size).toBe(5);
    expect(WIND_DOWN_GAMES).toContain(journey5[4].gameId);
  });

  it('provides shuffle functionality that generates valid alternatives without duplicates', () => {
    const j1 = JourneyEngine.generateJourney('Anxious', [], 3, 0);
    const j2 = JourneyEngine.generateJourney('Anxious', [], 3, 1);

    expect(j1).toHaveLength(3);
    expect(j2).toHaveLength(3);
    expect(new Set(j1.map(l => l.gameId)).size).toBe(3);
    expect(new Set(j2.map(l => l.gameId)).size).toBe(3);
    expect(WIND_DOWN_GAMES).toContain(j1[2].gameId);
    expect(WIND_DOWN_GAMES).toContain(j2[2].gameId);
  });

  it('calculates recommended journey length depending on mood and stress level (min 3, max 5)', () => {
    // High stress or overwhelmed -> 5 games
    expect(JourneyEngine.getRecommendedJourneyLength('Overwhelmed', 6)).toBe(5);
    expect(JourneyEngine.getRecommendedJourneyLength('Anxious', 8)).toBe(5);
    expect(JourneyEngine.getRecommendedJourneyLength('Angry', 9)).toBe(5);

    // Moderate stress -> 4 games
    expect(JourneyEngine.getRecommendedJourneyLength('Sad', 6)).toBe(4);
    expect(JourneyEngine.getRecommendedJourneyLength('Restless', 5)).toBe(4);
    expect(JourneyEngine.getRecommendedJourneyLength('Anxious', 5)).toBe(4);

    // Low stress / mild moods -> 3 games
    expect(JourneyEngine.getRecommendedJourneyLength('Tired', 3)).toBe(3);
    expect(JourneyEngine.getRecommendedJourneyLength('Okay', 2)).toBe(3);
  });

  it('calculates tailored calm focus duration per game based on stress and mood', () => {
    // Low stress (1-3) -> 15s
    expect(JourneyEngine.getRecommendedGameDuration(2, 'Okay')).toBe(15);
    expect(JourneyEngine.getRecommendedGameDuration(3, 'Tired')).toBe(15);

    // Moderate stress (4-6) -> 25s (or 30s with high arousal mood)
    expect(JourneyEngine.getRecommendedGameDuration(5, 'Sad')).toBe(25);
    expect(JourneyEngine.getRecommendedGameDuration(5, 'Anxious')).toBe(30);

    // High stress (7-8) -> 35s (or 40s with high arousal mood)
    expect(JourneyEngine.getRecommendedGameDuration(7, 'Sad')).toBe(35);
    expect(JourneyEngine.getRecommendedGameDuration(8, 'Angry')).toBe(40);

    // Severe stress (9-10) -> 45s (or 50s with high arousal mood)
    expect(JourneyEngine.getRecommendedGameDuration(9, 'Sad')).toBe(45);
    expect(JourneyEngine.getRecommendedGameDuration(10, 'Overwhelmed')).toBe(50);
  });
});
