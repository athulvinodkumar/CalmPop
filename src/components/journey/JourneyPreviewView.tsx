import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Shuffle, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  CheckCircle2 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GAME_CATALOG } from '../../games/catalog';
import { soundEngine } from '../../engine/soundEngine';

import { JourneyEngine } from '../../engine/journeyEngine';

export const JourneyPreviewView: React.FC = () => {
  const { 
    activeJourney, 
    setJourneyLength, 
    shuffleJourney, 
    startActiveJourney, 
    setScreen 
  } = useAppStore();

  if (!activeJourney) return null;

  const handleShuffle = () => {
    soundEngine.playBubblePop(1.15);
    shuffleJourney();
  };

  const handleLengthChange = (length: number) => {
    soundEngine.playTileClick(1.0);
    setJourneyLength(length);
  };

  const handleStart = () => {
    soundEngine.playSuccessChord();
    startActiveJourney();
  };

  const levels = activeJourney.levels;
  const minPlaySeconds = JourneyEngine.getRecommendedGameDuration(activeJourney.stressInitial, activeJourney.mood);
  const gridColsClass = levels.length === 4
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
    : levels.length === 5
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'
    : 'grid grid-cols-1 md:grid-cols-3 gap-4';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => {
              soundEngine.playBubblePop(0.9);
              setScreen('checkin');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change Mood or Stress</span>
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Your Calm Journey
            </h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Mood: {activeJourney.mood} • Stress: {activeJourney.stressInitial}/10</span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            A guided multi-stage sequence designed to ease tension, regulate focus, and wind down smoothly.
          </p>
        </div>

        {/* Controls: Length & Shuffle */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Journey Length Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="px-2 text-[11px] font-semibold text-slate-400 uppercase">Levels:</span>
            {[3, 4, 5].map((len) => (
              <button
                key={len}
                onClick={() => handleLengthChange(len)}
                aria-label={`${len} level journey`}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  activeJourney.levels.length === len
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {len}
              </button>
            ))}
          </div>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition border border-slate-200 dark:border-slate-700"
            title="Re-roll journey combination"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-500" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Row of Planned Level Cards */}
      <div className="space-y-4 mb-10">
        <div className={gridColsClass}>
          {levels.map((level, idx) => {
            const game = GAME_CATALOG[level.gameId];
            const isStarter = idx === 0;
            const isWindDown = idx === levels.length - 1;

            return (
              <motion.div
                key={`${level.gameId}-${idx}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative flex flex-col justify-between p-5 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-md transition"
              >
                <div>
                  {/* Top Level Pill */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      Level {level.levelNumber} of {levels.length}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      isStarter 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : isWindDown
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {isStarter ? 'Starter' : isWindDown ? 'Wind Down' : 'Core Regulator'}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {game.tagline}
                  </p>

                  {/* Reason Box */}
                  <div className="p-3 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 mb-2 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <p className="leading-snug">
                      {level.reason}
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Category: {game.category}</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-medium">{minPlaySeconds}s calm reset</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Start Button Container */}
      <div className="p-6 rounded-3xl glass-panel bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
            <span>Ready to Begin Level 1: {GAME_CATALOG[levels[0].gameId].title}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Play each level for at least {minPlaySeconds} seconds. Replay as many times as you like before moving to the next.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Begin Journey</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
