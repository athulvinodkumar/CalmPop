import { describe, it, expect } from 'vitest';
import { RecommendationEngine, MOOD_PRIORS } from './recommendationEngine';
import type { MoodType, SessionRecord } from '../types';

describe('RecommendationEngine', () => {
  it('returns cold start recommendations matching the prior map for Anxious', () => {
    const emptySessions: SessionRecord[] = [];
    const recs = RecommendationEngine.getRecommendations('Anxious', emptySessions, 3);

    expect(recs).toHaveLength(3);
    const recIds = recs.map(r => r.gameId);
    // Cold start should recommend the priors for Anxious
    expect(recIds).toEqual(MOOD_PRIORS['Anxious']);
    expect(recs[0].isPrior).toBe(true);
    expect(recs[0].reason).toContain('curated');
  });

  it('cold start works for all moods', () => {
    const moods: MoodType[] = ['Anxious', 'Angry', 'Sad', 'Tired', 'Overwhelmed', 'Restless', 'Okay'];
    for (const mood of moods) {
      const recs = RecommendationEngine.getRecommendations(mood, [], 3);
      expect(recs.map(r => r.gameId)).toEqual(MOOD_PRIORS[mood]);
    }
  });

  it('adapts when a non-prior game achieves high stress drop', () => {
    // Say the user felt Anxious, and played 'mandala' (not an initial prior for Anxious)
    // and achieved a massive stress drop of 7 points twice!
    const sessions: SessionRecord[] = [
      {
        id: '1',
        gameId: 'mandala',
        mood: 'Anxious',
        stressBefore: 9,
        stressAfter: 2,
        stressDrop: 7,
        durationSeconds: 180,
        timestamp: Date.now() - 3600000
      },
      {
        id: '2',
        gameId: 'mandala',
        mood: 'Anxious',
        stressBefore: 8,
        stressAfter: 2,
        stressDrop: 6,
        durationSeconds: 200,
        timestamp: Date.now() - 1800000
      }
    ];

    const recs = RecommendationEngine.getRecommendations('Anxious', sessions, 3);
    const topGameId = recs[0].gameId;

    // Mandala should now beat out the static priors because of measured efficacy!
    expect(topGameId).toBe('mandala');
    expect(recs[0].reason).toContain('Proven match: lowered your stress by 6.5');
    expect(recs[0].timesPlayedForMood).toBe(2);
  });

  it('provides exploration bonus for untried activities', () => {
    const breakdowns = RecommendationEngine.calculateAllScores('Tired', []);
    for (const b of breakdowns) {
      expect(b.explorationComponent).toBeGreaterThan(0);
      expect(b.timesPlayedForMood).toBe(0);
    }
  });

  it('provides transparent breakdown for Explain My Recommendation sheet', () => {
    const breakdown = RecommendationEngine.calculateAllScores('Angry', []);
    expect(breakdown.length).toBe(10);
    
    const shredder = breakdown.find(b => b.gameId === 'worry-shredder');
    expect(shredder).toBeDefined();
    expect(shredder?.priorComponent).toBeGreaterThan(0);
    expect(shredder?.totalScore).toBeGreaterThan(0);
  });
});
