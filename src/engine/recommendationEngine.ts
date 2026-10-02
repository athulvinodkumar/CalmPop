import type { GameId, MoodType, Recommendation, SessionRecord } from '../types';
import { ALL_GAME_IDS, GAME_CATALOG } from '../games/catalog';

// Baseline clinically-inspired mood-to-game prior map
export const MOOD_PRIORS: Record<MoodType, [GameId, GameId, GameId]> = {
  Anxious: ['breathing', 'calm-keys', 'ripple-pond'],
  Angry: ['worry-shredder', 'bubble-pop', 'color-fill'],
  Sad: ['gratitude-jar', 'star-catcher', 'calm-keys'],
  Tired: ['zen-sand', 'breathing', 'ripple-pond'],
  Overwhelmed: ['breathing', 'worry-shredder', 'zen-sand'],
  Restless: ['mandala', 'bubble-pop', 'star-catcher'],
  Okay: ['color-fill', 'gratitude-jar', 'mandala'],
};

export interface RecommendationBreakdown {
  gameId: GameId;
  gameTitle: string;
  mood: MoodType;
  totalScore: number;
  historyComponent: number;
  priorComponent: number;
  explorationComponent: number;
  timesPlayedForMood: number;
  avgDropForMood: number | null;
  overallAvgDrop: number | null;
  reason: string;
}

export class RecommendationEngine {
  /**
   * Calculates intelligent personalized recommendations for a given mood based on user session history.
   * Uses Multi-Armed Bandit with Upper Confidence Bound (UCB-1) inspired exploration.
   */
  public static getRecommendations(
    mood: MoodType,
    sessions: SessionRecord[],
    topK = 3
  ): Recommendation[] {
    const breakdowns = this.calculateAllScores(mood, sessions);
    // Sort descending by total score
    breakdowns.sort((a, b) => b.totalScore - a.totalScore);

    return breakdowns.slice(0, topK).map(b => ({
      gameId: b.gameId,
      score: Number(b.totalScore.toFixed(2)),
      reason: b.reason,
      isPrior: MOOD_PRIORS[mood].includes(b.gameId),
      timesPlayedForMood: b.timesPlayedForMood,
      avgDropForMood: b.avgDropForMood !== null ? Number(b.avgDropForMood.toFixed(1)) : null,
      explorationBonus: Number(b.explorationComponent.toFixed(2))
    }));
  }

  /**
   * Detailed breakdown for transparency & "Explain my recommendation" sheet
   */
  public static calculateAllScores(
    mood: MoodType,
    sessions: SessionRecord[]
  ): RecommendationBreakdown[] {
    const priors = MOOD_PRIORS[mood];
    const moodSessions = sessions.filter(s => s.mood === mood);
    const totalMoodSessions = moodSessions.length;

    return ALL_GAME_IDS.map(gameId => {
      const gameMoodSessions = moodSessions.filter(s => s.gameId === gameId);
      const timesPlayedForMood = gameMoodSessions.length;

      // 1. Historical Stress Drop Component (User's real measured efficacy)
      let historyComponent = 0;
      let avgDropForMood: number | null = null;
      let overallAvgDrop: number | null = null;

      if (timesPlayedForMood > 0) {
        const totalDrop = gameMoodSessions.reduce((acc, s) => acc + (s.stressBefore - s.stressAfter), 0);
        avgDropForMood = totalDrop / timesPlayedForMood;
        // Weight measured stress drop heavily (1.5x)
        historyComponent = avgDropForMood * 1.5;
      } else {
        // If not played under this mood, check if played generally in other moods
        const allGameSessions = sessions.filter(s => s.gameId === gameId);
        if (allGameSessions.length > 0) {
          const totalOverallDrop = allGameSessions.reduce((acc, s) => acc + (s.stressBefore - s.stressAfter), 0);
          overallAvgDrop = totalOverallDrop / allGameSessions.length;
          // Soft transfer learning factor (0.6x)
          historyComponent = overallAvgDrop * 0.6;
        }
      }

      // 2. Prior Component
      let priorComponent = 0;
      const priorIndex = priors.indexOf(gameId);
      if (priorIndex !== -1) {
        // 1st prior: 3.5, 2nd: 2.5, 3rd: 1.8
        priorComponent = priorIndex === 0 ? 3.5 : priorIndex === 1 ? 2.5 : 1.8;
      }

      // 3. Exploration Component (Multi-Armed Bandit / UCB)
      // Encourages discovering untried games for this mood
      const explorationConstant = 2.0;
      const explorationComponent = explorationConstant * Math.sqrt(
        Math.log(totalMoodSessions + 2) / (timesPlayedForMood + 1)
      );

      // Composite Score
      const totalScore = historyComponent + priorComponent + explorationComponent;

      // Plain language explanation generator
      let reason = '';
      if (timesPlayedForMood >= 2 && avgDropForMood !== null) {
        if (avgDropForMood >= 2) {
          reason = `Proven match: lowered your stress by ${avgDropForMood.toFixed(1)} on average when ${mood.toLowerCase()}.`;
        } else if (avgDropForMood > 0) {
          reason = `Consistently relieves tension (${avgDropForMood.toFixed(1)} drop) during ${mood.toLowerCase()} moments.`;
        } else {
          reason = `Played ${timesPlayedForMood} times when ${mood.toLowerCase()}; good familiar pacing.`;
        }
      } else if (timesPlayedForMood === 1 && avgDropForMood !== null) {
        reason = `Reduced your stress by ${avgDropForMood.toFixed(1)} pts in your last session!`;
      } else if (priorIndex !== -1) {
        if (priorIndex === 0) {
          reason = `Top curated activity designed specifically for easing ${mood.toLowerCase()} states.`;
        } else {
          reason = `Recommended technique for counteracting ${mood.toLowerCase()} feelings.`;
        }
      } else {
        reason = `Discovery pick: explore an untried calming ritual to reset your mindset.`;
      }

      return {
        gameId,
        gameTitle: GAME_CATALOG[gameId].title,
        mood,
        totalScore,
        historyComponent,
        priorComponent,
        explorationComponent,
        timesPlayedForMood,
        avgDropForMood,
        overallAvgDrop,
        reason
      };
    });
  }
}
