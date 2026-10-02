import type { GameId, MoodType, JourneyLevel, SessionRecord } from '../types';
import { RecommendationEngine } from './recommendationEngine';
import { GAME_CATALOG } from '../games/catalog';

// Clinically sound wind-down activities
export const WIND_DOWN_GAMES: GameId[] = ['breathing', 'zen-sand', 'ripple-pond', 'calm-keys'];

// Gentle starter pairings by mood
export const MOOD_STARTERS: Record<MoodType, GameId[]> = {
  Anxious: ['bubble-pop', 'ripple-pond', 'calm-keys'],
  Angry: ['bubble-pop', 'worry-shredder', 'color-fill'],
  Sad: ['star-catcher', 'gratitude-jar', 'calm-keys'],
  Tired: ['zen-sand', 'ripple-pond', 'color-fill'],
  Overwhelmed: ['worry-shredder', 'zen-sand', 'bubble-pop'],
  Restless: ['bubble-pop', 'color-fill', 'star-catcher'],
  Okay: ['color-fill', 'star-catcher', 'mandala']
};

export class JourneyEngine {
  /**
   * Generates a sequenced, personalized journey for a mood.
   * - Level 1: Gentle starter fitting the mood
   * - Middle levels: Top-ranked games from recommendation engine
   * - Final level: Always a calming wind-down game (Breathing, Zen Sand, Ripple Pond, Calm Keys)
   * - No game appears twice
   */
  public static generateJourney(
    mood: MoodType,
    sessions: SessionRecord[],
    length: number = 3,
    shuffleOffset: number = 0
  ): JourneyLevel[] {
    const validLength = Math.max(3, Math.min(5, length));
    const usedGames = new Set<GameId>();

    // 1. Get ranked games from RecommendationEngine
    const rankedBreakdowns = RecommendationEngine.calculateAllScores(mood, sessions);
    rankedBreakdowns.sort((a, b) => b.totalScore - a.totalScore);
    const rankedGameIds = rankedBreakdowns.map(b => b.gameId);

    // 2. Select Level 1 Starter
    const starterPool = MOOD_STARTERS[mood] || ['bubble-pop', 'ripple-pond', 'color-fill'];
    const starterIndex = shuffleOffset % starterPool.length;
    const starterGameId = starterPool[starterIndex];
    usedGames.add(starterGameId);

    // 3. Select Final Wind-Down Level
    // Wind-down must be one of WIND_DOWN_GAMES and not used yet
    const availableWindDowns = WIND_DOWN_GAMES.filter(g => !usedGames.has(g));
    // Sort wind downs by ranking for this mood
    availableWindDowns.sort((a, b) => {
      const rankA = rankedGameIds.indexOf(a);
      const rankB = rankedGameIds.indexOf(b);
      return rankA - rankB;
    });

    const windDownIndex = (Math.floor(shuffleOffset / starterPool.length)) % availableWindDowns.length;
    const windDownGameId = availableWindDowns[windDownIndex] || availableWindDowns[0];
    usedGames.add(windDownGameId);

    // 4. Select Middle Levels (length - 2)
    const middleCount = validLength - 2;
    const middleGames: GameId[] = [];

    // Filter available ranked games
    const availableMiddle = rankedGameIds.filter(g => !usedGames.has(g));
    
    // Support shuffling middle games if needed
    for (let i = 0; i < middleCount; i++) {
      const pickIdx = (i + (shuffleOffset % Math.max(1, availableMiddle.length))) % availableMiddle.length;
      const pick = availableMiddle[pickIdx];
      if (pick && !usedGames.has(pick)) {
        middleGames.push(pick);
        usedGames.add(pick);
      } else {
        // Fallback to any unused game
        const fallback = availableMiddle.find(g => !usedGames.has(g));
        if (fallback) {
          middleGames.push(fallback);
          usedGames.add(fallback);
        }
      }
    }

    // 5. Construct Level Objects with plain-language explanations
    const journeyLevels: JourneyLevel[] = [];

    // Level 1: Starter
    journeyLevels.push({
      levelNumber: 1,
      gameId: starterGameId,
      reason: `Gentle starter: eases initial tension with tactile focus before deeper regulation.`,
      replays: 0,
      completed: false
    });

    // Middle Levels
    middleGames.forEach((gameId, idx) => {
      const levelNum = idx + 2;
      const rank = rankedBreakdowns.find(b => b.gameId === gameId);
      const avgDrop = rank?.avgDropForMood;
      let reason = `Core regulator: highest algorithmic match for ${mood.toLowerCase()} mindset.`;
      if (avgDrop && avgDrop > 1.5) {
        reason = `Core regulator: historically lowered your stress by ${avgDrop.toFixed(1)} pts for ${mood.toLowerCase()}.`;
      }
      journeyLevels.push({
        levelNumber: levelNum,
        gameId,
        reason,
        replays: 0,
        completed: false
      });
    });

    // Final Level: Wind Down
    journeyLevels.push({
      levelNumber: validLength,
      gameId: windDownGameId,
      reason: `Calming wind-down: somatic grounding (${GAME_CATALOG[windDownGameId].title}) to seal in sustained peace.`,
      replays: 0,
      completed: false
    });

    return journeyLevels;
  }

  /**
   * Automatically calculates recommended journey length (min 3, max 5) based on mood and stress level:
   * - Lower stress (1-4) or milder mood ('Okay', 'Tired'): 3 games (quick, refreshing calm)
   * - Moderate stress (5-7) or transitional mood ('Sad', 'Restless'): 4 games (balanced reset)
   * - High/Intense stress (8-10) or high-arousal mood ('Anxious', 'Angry', 'Overwhelmed'): 5 games (deep somatic decompression)
   */
  public static getRecommendedJourneyLength(mood: MoodType, stressLevel: number): number {
    if (stressLevel >= 8 || mood === 'Overwhelmed' || (stressLevel >= 7 && (mood === 'Anxious' || mood === 'Angry'))) {
      return 5;
    }
    if (stressLevel >= 5 || mood === 'Sad' || mood === 'Restless' || mood === 'Anxious' || mood === 'Angry') {
      return 4;
    }
    return 3;
  }

  /**
   * Calculates tailored calm focus duration (in seconds) for each game based on mood and stress level.
   * - Low stress (1-3): 15s (light, non-intrusive micro-break)
   * - Moderate stress (4-6): 25s (grounding somatic pause)
   * - High stress (7-8): 35s (focused emotional regulation)
   * - Intense stress (9-10): 45s (deep parasympathetic vagal activation)
   * - High-arousal moods ('Angry', 'Anxious', 'Overwhelmed'): +5s somatic discharge allowance (up to 50s)
   */
  public static getRecommendedGameDuration(stressLevel: number, mood?: MoodType | null): number {
    let base = 20;
    if (stressLevel <= 3) {
      base = 15;
    } else if (stressLevel <= 6) {
      base = 25;
    } else if (stressLevel <= 8) {
      base = 35;
    } else {
      base = 45;
    }

    if (mood === 'Overwhelmed' || mood === 'Angry' || mood === 'Anxious') {
      base = Math.min(50, base + 5);
    }

    return base;
  }
}
