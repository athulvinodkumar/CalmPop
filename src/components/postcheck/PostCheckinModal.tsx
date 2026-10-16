import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ArrowRight, 
  TrendingDown, 
  Sparkles, 
  Flame, 
  BarChart2, 
  Home
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';
import { GAME_CATALOG } from '../../games/catalog';
import { soundEngine } from '../../engine/soundEngine';

export const PostCheckinModal: React.FC = () => {
  const { 
    activeGameId, 
    currentMood, 
    stressBefore, 
    sessionStartTime, 
    setScreen, 
    cancelSession 
  } = useAppStore();

  const { recordSession, streak } = useSessionStore();

  const [stressAfter, setStressAfter] = useState<number>(Math.max(1, stressBefore - 2));
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!activeGameId) return null;
  const game = GAME_CATALOG[activeGameId];
  const mood = currentMood || 'Anxious';

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setStressAfter(val);
    soundEngine.playTileClick(0.7 + val * 0.08);
  };

  const handleSubmit = () => {
    const durationSeconds = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : 60;
    recordSession(activeGameId, mood, stressBefore, stressAfter, durationSeconds);
    setIsSubmitted(true);

    if (stressBefore > stressAfter) {
      soundEngine.playSuccessChord();
      // Confetti burst for calming success
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#38bdf8', '#a855f7', '#fbbf24']
      });
    } else {
      soundEngine.playBubblePop(1.1);
    }
  };

  const handleFinishToScreen = (target: 'checkin' | 'insights') => {
    soundEngine.playBubblePop(1.0);
    cancelSession(); // clears active game state
    setScreen(target);
  };

  const stressDrop = stressBefore - stressAfter;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="postcheck-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg max-h-[88vh] max-h-[88dvh] overflow-y-auto overscroll-contain glass-panel bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 touch-pan-y"
      >
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="post-check-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Session Complete • {game.title}</span>
                </div>
                <h2 id="postcheck-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                  How are you feeling now?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You started at <span className="font-semibold text-slate-700 dark:text-slate-300">stress level {stressBefore}/10</span>. Check in with your breath and body.
                </p>
              </div>

              {/* Stress Slider */}
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">1 (Very Calm)</span>
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Current Stress:</span>
                    <span className="text-xl font-bold text-teal-600 dark:text-teal-400">{stressAfter}</span>
                    <span className="text-xs text-slate-400">/ 10</span>
                  </div>
                  <span className="text-xs text-slate-400">10 (Overloaded)</span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={stressAfter}
                  onChange={handleSliderChange}
                  aria-label="Current stress after activity"
                  className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500 focus:outline-none"
                />

                <div className="flex justify-between px-1 text-[10px] text-slate-400">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setStressAfter(n);
                        soundEngine.playTileClick(0.7 + n * 0.08);
                      }}
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                        n === stressAfter
                          ? 'bg-teal-500 text-white font-bold'
                          : 'hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-semibold text-sm shadow-lg shadow-teal-500/25 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <span>Save & View Result</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="post-check-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
                {stressDrop > 0 ? (
                  <TrendingDown className="w-8 h-8" />
                ) : (
                  <CheckCircle2 className="w-8 h-8" />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {stressDrop > 0 ? 'Stress Reduced!' : 'Mindful Pause Logged'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  CalmPop has learned your response to {game.title} while feeling {mood.toLowerCase()}.
                </p>
              </div>

              {/* Stress Comparison Result Card */}
              <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 flex items-center justify-around">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Before
                  </span>
                  <span className="text-2xl font-black text-slate-700 dark:text-slate-300">
                    {stressBefore}
                  </span>
                  <span className="text-xs text-slate-400">/10</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowRight className="w-5 h-5 text-teal-500 mb-1" />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    stressDrop > 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {stressDrop > 0 ? `-${stressDrop} pts` : 'Stable'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    After
                  </span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                    {stressAfter}
                  </span>
                  <span className="text-xs text-slate-400">/10</span>
                </div>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Calm Streak</span>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {streak} Day{streak > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">Algorithm Status</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    Weights Updated ✓
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => handleFinishToScreen('insights')}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>View Insights</span>
                </button>

                <button
                  onClick={() => handleFinishToScreen('checkin')}
                  className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Done & Return Home</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
