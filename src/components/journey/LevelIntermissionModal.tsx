import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Flag, 
  CheckCircle2, 
  TrendingDown 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GAME_CATALOG } from '../../games/catalog';
import { soundEngine } from '../../engine/soundEngine';

export const LevelIntermissionModal: React.FC = () => {
  const { 
    activeJourney, 
    finishLevel, 
    replayCurrentLevel, 
    advanceToNextLevel, 
    finishFullJourney 
  } = useAppStore();

  const [hasRated, setHasRated] = useState(false);
  const [sliderVal, setSliderVal] = useState<number>(() => {
    if (!activeJourney) return 5;
    const lastStress = activeJourney.stressHistory[activeJourney.stressHistory.length - 1] ?? activeJourney.stressInitial;
    return Math.max(1, lastStress - 1);
  });
  const [titleCardShowing, setTitleCardShowing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!activeJourney || activeJourney.status !== 'intermission') return null;

  const currentIdx = activeJourney.currentLevelIndex;
  const currentLevel = activeJourney.levels[currentIdx];
  const currentGame = GAME_CATALOG[currentLevel.gameId];
  const isLastLevel = currentIdx === activeJourney.levels.length - 1;
  const nextLevel = !isLastLevel ? activeJourney.levels[currentIdx + 1] : null;
  const nextGame = nextLevel ? GAME_CATALOG[nextLevel.gameId] : null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderVal(val);
    soundEngine.playTileClick(0.7 + val * 0.08);
  };

  const handleSaveStress = () => {
    soundEngine.playSuccessChord();
    finishLevel(sliderVal);
    setHasRated(true);
  };

  const handlePlayAgain = () => {
    soundEngine.playBubblePop(1.1);
    if (!hasRated && !currentLevel.completed) {
      finishLevel(sliderVal);
    }
    replayCurrentLevel();
  };

  const handleNextLevel = () => {
    if (titleCardShowing) return;
    soundEngine.playSuccessChord();

    // Ensure stress rating is recorded even if user did not tap "Save Check-in"
    if (!hasRated && !currentLevel.completed) {
      finishLevel(sliderVal);
    }

    if (isLastLevel) {
      finishFullJourney();
    } else {
      // Show smooth title card before launching next level
      setTitleCardShowing(true);
      timerRef.current = setTimeout(() => {
        advanceToNextLevel();
      }, 1200);
    }
  };

  const handleEndJourney = () => {
    soundEngine.playBubblePop(0.9);
    if (!hasRated && !currentLevel.completed) {
      finishLevel(sliderVal);
    }
    finishFullJourney();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intermission-title"
    >
      <AnimatePresence mode="wait">
        {titleCardShowing && nextLevel && nextGame ? (
          /* Smooth Title Card Transition to Next Level */
          <motion.div
            key="title-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="text-center p-8 rounded-3xl glass-panel bg-slate-900/95 text-white border border-teal-500/40 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-400 font-mono">
              Up Next
            </span>
            <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Level {nextLevel.levelNumber}: {nextGame.title}
            </h2>
            <p className="text-xs text-slate-300">
              {nextGame.tagline}
            </p>
            <button 
              type="button" 
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                advanceToNextLevel();
              }}
              className="mt-3 inline-block text-[11px] text-teal-400 hover:text-teal-300 font-medium hover:underline cursor-pointer"
            >
              Starting automatically... (tap to begin now)
            </button>
          </motion.div>
        ) : (
          /* Normal Intermission Result Sheet */
          <motion.div
            key="intermission-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg glass-panel bg-slate-900/95 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/80 space-y-6"
          >
            {/* Top Indicator */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-800 text-teal-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Level {currentLevel.levelNumber} of {activeJourney.levels.length} Complete</span>
              </div>
              <h2 id="intermission-title" className="text-2xl font-extrabold text-white">
                {currentGame.title} Finished
              </h2>
              {currentLevel.replays > 0 && (
                <p className="text-xs text-slate-400">
                  (Played {currentLevel.replays + 1} times)
                </p>
              )}
            </div>

            {/* Step 1: Stress Check-in slider */}
            {!hasRated && !currentLevel.completed ? (
              <div className="space-y-4 py-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    How do you feel right now?
                  </span>
                  <div className="flex items-center gap-1 text-sm font-black text-teal-400 font-mono">
                    <span>Stress: {sliderVal}/10</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={sliderVal}
                  onChange={handleSliderChange}
                  aria-label="Stress after level"
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
                />

                <div className="flex justify-between px-1 text-[10px] text-slate-400">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setSliderVal(n);
                        soundEngine.playTileClick(0.7 + n * 0.08);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                        n === sliderVal ? 'bg-teal-500 text-white font-bold' : 'hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSaveStress}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
                >
                  Save Check-in
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-teal-950/60 border border-teal-800/80 text-center text-xs text-teal-200 flex items-center justify-center gap-2">
                <TrendingDown className="w-4 h-4 text-teal-400" />
                <span>
                  Check-in recorded: current stress level <strong>{activeJourney.stressHistory[activeJourney.stressHistory.length - 1]}/10</strong>.
                </span>
              </div>
            )}

            {/* Next Level Preview Card if not last level */}
            {nextLevel && nextGame && (
              <div className="p-4 rounded-2xl border border-slate-700/60 bg-slate-800/60 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Next Up • Level {nextLevel.levelNumber}
                </span>
                <h3 className="font-bold text-sm text-white">
                  {nextGame.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {nextLevel.reason}
                </p>
              </div>
            )}

            {/* The 3 Core Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* Button 2: Next level / Finish journey */}
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-600 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-teal-500/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLastLevel ? 'Finish Journey' : `Next Level (${nextGame?.title || ''})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {/* Button 1: Play again */}
                <button
                  onClick={handlePlayAgain}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play {currentGame.title} Again</span>
                </button>

                {/* Button 3: End journey */}
                <button
                  onClick={handleEndJourney}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>End Journey Early</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
