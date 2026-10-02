import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  CloudRain, 
  BatteryLow, 
  Activity, 
  Wind, 
  Smile, 
  Zap, 
  ArrowRight,
  Sparkles,
  Compass,
  Play,
  Grid
} from 'lucide-react';
import type { MoodType } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { soundEngine } from '../../engine/soundEngine';
import { JourneyEngine } from '../../engine/journeyEngine';

interface MoodOption {
  type: MoodType;
  label: string;
  desc: string;
  icon: React.ReactNode;
  activeColor: string;
  glowColor: string;
}

const MOODS: MoodOption[] = [
  {
    type: 'Anxious',
    label: 'Anxious',
    desc: 'Heart racing, racing thoughts, worry spirals',
    icon: <Activity className="w-5 h-5 text-amber-500" />,
    activeColor: 'border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-100',
    glowColor: 'shadow-amber-500/20'
  },
  {
    type: 'Angry',
    label: 'Angry',
    desc: 'Frustrated, irritable, heated physical tension',
    icon: <Flame className="w-5 h-5 text-rose-500" />,
    activeColor: 'border-rose-400 dark:border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100',
    glowColor: 'shadow-rose-500/20'
  },
  {
    type: 'Sad',
    label: 'Sad',
    desc: 'Heavy, melancholic, low emotional energy',
    icon: <CloudRain className="w-5 h-5 text-sky-500" />,
    activeColor: 'border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100',
    glowColor: 'shadow-sky-500/20'
  },
  {
    type: 'Tired',
    label: 'Tired',
    desc: 'Drained, mental fog, needing soft restorative calm',
    icon: <BatteryLow className="w-5 h-5 text-slate-500 dark:text-slate-400" />,
    activeColor: 'border-slate-400 dark:border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100',
    glowColor: 'shadow-slate-500/20'
  },
  {
    type: 'Overwhelmed',
    label: 'Overwhelmed',
    desc: 'Sensory overload, too many demands at once',
    icon: <Wind className="w-5 h-5 text-indigo-500" />,
    activeColor: 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100',
    glowColor: 'shadow-indigo-500/20'
  },
  {
    type: 'Restless',
    label: 'Restless',
    desc: 'Fidgety, hard to settle down, nervous drive',
    icon: <Zap className="w-5 h-5 text-purple-500" />,
    activeColor: 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-100',
    glowColor: 'shadow-purple-500/20'
  },
  {
    type: 'Okay',
    label: 'Okay',
    desc: 'Balanced, open, seeking a mindful pause',
    icon: <Smile className="w-5 h-5 text-emerald-500" />,
    activeColor: 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100',
    glowColor: 'shadow-emerald-500/20'
  }
];

export const CheckinFlow: React.FC = () => {
  const { 
    initJourney, 
    startCheckIn, 
    currentMood, 
    stressBefore, 
    activeJourney, 
    resumeJourney, 
    discardJourney, 
    setScreen 
  } = useAppStore();

  const [selectedMood, setSelectedMood] = useState<MoodType>(currentMood || 'Anxious');
  const [stressLevel, setStressLevel] = useState<number>(stressBefore || 6);

  const recommendedJourneyLength = JourneyEngine.getRecommendedJourneyLength(selectedMood, stressLevel);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    soundEngine.playBubblePop(1.15);
  };

  const handleStressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setStressLevel(val);
    soundEngine.playTileClick(0.8 + val * 0.08);
  };

  // Primary: Start Journey Mode with mood-dependent length (min 3, max 5)
  const handleStartJourney = () => {
    soundEngine.playSuccessChord();
    initJourney(selectedMood, stressLevel, recommendedJourneyLength);
  };

  // Secondary: Single recommendations
  const handleSoloRecommendations = () => {
    soundEngine.playBubblePop(1.0);
    startCheckIn(selectedMood, stressLevel);
  };

  const getStressLabel = (val: number) => {
    if (val <= 2) return { text: 'Very Mild • Low Stress', color: 'text-emerald-600 dark:text-emerald-400' };
    if (val <= 4) return { text: 'Mild • Slightly Noticeable', color: 'text-teal-600 dark:text-teal-400' };
    if (val <= 6) return { text: 'Moderate • Palpable Tension', color: 'text-amber-600 dark:text-amber-400' };
    if (val <= 8) return { text: 'High • Needs Attention', color: 'text-orange-600 dark:text-orange-400' };
    return { text: 'Intense • Urgent Reset Needed', color: 'text-rose-600 dark:text-rose-400' };
  };

  const stressInfo = getStressLabel(stressLevel);
  const hasActiveJourney = activeJourney && activeJourney.status !== 'completed';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Resume Journey Banner if in-progress */}
      {hasActiveJourney && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-indigo-500/15 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Resume In-Progress Journey
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are currently at <strong>Level {activeJourney.currentLevelIndex + 1} of {activeJourney.levels.length}</strong> ({activeJourney.mood}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playBubblePop(0.9);
                discardJourney();
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Start Fresh
            </button>
            <button
              onClick={() => {
                soundEngine.playSuccessChord();
                resumeJourney();
              }}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Journey</span>
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 sm:mb-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick 10-Second Check-In</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          How are you feeling right now?
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          CalmPop builds a guided multi-level journey that progressively guides your body back to calm.
        </p>
      </motion.div>

      {/* Main Check-In Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/60 dark:border-slate-800"
      >
        {/* Step 1: Pick Mood */}
        <section aria-labelledby="mood-heading" className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 id="mood-heading" className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 1 • Pick Your Current Mood
            </h2>
            <span className="text-xs text-slate-400">Tap to select</span>
          </div>

          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3"
            role="radiogroup" 
            aria-label="Current Mood Selection"
          >
            {MOODS.map((m) => {
              const isSelected = selectedMood === m.type;
              return (
                <button
                  key={m.type}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleMoodSelect(m.type)}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? `${m.activeColor} ring-2 ring-teal-500/40 shadow-lg ${m.glowColor} scale-[1.02]`
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-xs">
                      {m.icon}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-4 ring-teal-500/20" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {m.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {m.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Rate Stress Level */}
        <section aria-labelledby="stress-heading" className="mb-8 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <h2 id="stress-heading" className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 2 • Rate Your Stress Level
            </h2>
            <span className={`text-xs font-semibold ${stressInfo.color}`}>
              {stressInfo.text}
            </span>
          </div>

          <div className="my-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">1 (Deeply Calm)</span>
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Stress:</span>
                <span className="text-xl font-black text-teal-600 dark:text-teal-400">{stressLevel}</span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">10 (Overloaded)</span>
            </div>

            <div className="relative flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={stressLevel}
                onChange={handleStressChange}
                aria-label="Stress level from 1 to 10"
                className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>

            {/* Quick 1-10 pips */}
            <div className="flex justify-between px-1 mt-2 text-[10px] text-slate-400">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setStressLevel(num);
                    soundEngine.playTileClick(0.8 + num * 0.08);
                  }}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                    num === stressLevel
                      ? 'bg-teal-500 text-white font-bold'
                      : 'hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Primary and Secondary Action Buttons */}
        <div className="pt-2 space-y-3">
          {/* PRIMARY: Start My Calm Journey */}
          <button
            onClick={handleStartJourney}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/35 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span>Start My Calm Journey ({recommendedJourneyLength} Games)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Dynamic mood & stress journey rationale */}
          <div className="flex items-center justify-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-medium text-center px-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>
              {recommendedJourneyLength === 5
                ? 'Deep 5-game reset recommended for high stress'
                : recommendedJourneyLength === 4
                ? 'Balanced 4-game sequence for moderate tension'
                : 'Gentle 3-game flow for quick mindful calm'} ({selectedMood} • Stress {stressLevel}/10)
            </span>
          </div>

          {/* SECONDARY: Browse All Games & Single Suggestions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2">
            <button
              onClick={() => {
                soundEngine.playBubblePop(1.0);
                setScreen('catalog');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 transition py-1"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Browse All 10 Games</span>
            </button>

            <button
              onClick={handleSoloRecommendations}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5 transition py-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Or view single recommendations</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
