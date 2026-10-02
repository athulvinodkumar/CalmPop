export type MoodType = 
  | 'Anxious' 
  | 'Angry' 
  | 'Sad' 
  | 'Tired' 
  | 'Overwhelmed' 
  | 'Restless' 
  | 'Okay';

export type GameId = 
  | 'bubble-pop'
  | 'zen-sand'
  | 'breathing'
  | 'worry-shredder'
  | 'ripple-pond'
  | 'mandala'
  | 'calm-keys'
  | 'gratitude-jar'
  | 'star-catcher'
  | 'color-fill';

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: 'Tactile' | 'Somatic' | 'Reflective' | 'Creative' | 'Auditory' | 'Focus';
  icon: string;
  accentColor: string;
  themeGradient: string;
  instructions: string;
  benefits: string;
}

export interface SessionRecord {
  id: string;
  gameId: GameId;
  mood: MoodType;
  stressBefore: number;
  stressAfter: number;
  stressDrop: number;
  durationSeconds: number;
  timestamp: number;
  journeyId?: string;
  levelNumber?: number;
}

export interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
  timestamp: number;
  starColor: string;
}

export interface Recommendation {
  gameId: GameId;
  score: number;
  reason: string;
  isPrior: boolean;
  timesPlayedForMood: number;
  avgDropForMood: number | null;
  explorationBonus: number;
}

// Journey Mode Types
export interface JourneyLevel {
  levelNumber: number;
  gameId: GameId;
  reason: string;
  replays: number;
  completed: boolean;
  stressAfter?: number;
  durationSeconds?: number;
}

export interface JourneyRecord {
  id: string;
  mood: MoodType;
  stressInitial: number;
  stressFinal: number;
  stressDrop: number;
  totalDurationSeconds: number;
  levels: JourneyLevel[];
  timestamp: number;
  completed: boolean;
}

export interface ActiveJourney {
  id: string;
  mood: MoodType;
  stressInitial: number;
  targetLength: number; // 3, 4, or 5
  currentLevelIndex: number;
  levels: JourneyLevel[];
  stressHistory: number[]; // [initial, afterLevel1, afterLevel2, ...]
  totalDurationSeconds: number;
  levelStartTime: number;
  status: 'in_progress' | 'intermission' | 'completed';
  activeGameReplays: number;
}
