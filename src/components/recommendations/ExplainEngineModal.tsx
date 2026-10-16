import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, HelpCircle, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useSessionStore } from '../../store/useSessionStore';
import { RecommendationEngine, MOOD_PRIORS } from '../../engine/recommendationEngine';
import { GAME_CATALOG } from '../../games/catalog';

export const ExplainEngineModal: React.FC = () => {
  const { explainModalOpen, setExplainModalOpen, currentMood } = useAppStore();
  const { sessions } = useSessionStore();

  if (!explainModalOpen) return null;

  const mood = currentMood || 'Anxious';
  const allBreakdowns = RecommendationEngine.calculateAllScores(mood, sessions);
  // Sort descending by score
  allBreakdowns.sort((a, b) => b.totalScore - a.totalScore);

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explain-engine-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] max-h-[85dvh] overflow-y-auto overscroll-contain rounded-3xl glass-panel bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 touch-pan-y"
        >
          {/* Close button */}
          <button
            onClick={() => setExplainModalOpen(false)}
            aria-label="Close explanation"
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 id="explain-engine-title" className="text-xl font-bold text-slate-900 dark:text-white">
                How CalmPop Ranks Activities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% Local Multi-Armed Bandit Scoring Engine
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                The Recommendation Formula
              </h3>
              <p className="text-xs text-teal-950 dark:text-teal-200/90 leading-relaxed font-mono bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-teal-200/40 dark:border-teal-800/40">
                Score = (Avg Stress Drop × 1.5) + Prior Weight + Exploration Bonus (UCB-1)
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc pl-4 pt-1">
                <li>
                  <strong>Avg Stress Drop (Measured Impact):</strong> The real point reduction you logged when playing this game under mood <span className="font-semibold text-teal-700 dark:text-teal-300">"{mood}"</span>.
                </li>
                <li>
                  <strong>Prior Weight:</strong> Clinically proven pairings for your mood ({MOOD_PRIORS[mood].map(id => GAME_CATALOG[id].title).join(', ')}).
                </li>
                <li>
                  <strong>Exploration Bonus:</strong> Mathematical Upper Confidence Bound that grants an exploratory boost to games you haven't tried yet, so the app keeps finding what works best for you.
                </li>
              </ul>
            </div>

            {/* Current ranking table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Real-Time Ranking for "{mood}" ({sessions.filter(s => s.mood === mood).length} mood sessions logged)
              </h3>

              <div className="space-y-2">
                {allBreakdowns.map((b, idx) => {
                  const isTop3 = idx < 3;
                  return (
                    <div
                      key={b.gameId}
                      className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition ${
                        isTop3
                          ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-800/60'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isTop3 ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {b.gameTitle}
                            </span>
                            {isTop3 && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 font-bold">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {b.reason}
                          </p>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="flex items-center gap-3 self-end sm:self-auto text-[11px] font-mono">
                        <div className="text-right" title="Stress Drop Score">
                          <span className="text-[9px] block text-slate-400 uppercase font-sans">Drop</span>
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            {b.avgDropForMood !== null ? `+${b.avgDropForMood.toFixed(1)}` : '0.0'}
                          </span>
                        </div>
                        <div className="text-right" title="Prior Clinical Bonus">
                          <span className="text-[9px] block text-slate-400 uppercase font-sans">Prior</span>
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            +{b.priorComponent.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-right" title="Exploration Bonus">
                          <span className="text-[9px] block text-slate-400 uppercase font-sans">Explore</span>
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            +{b.explorationComponent.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-right pl-2 border-l border-slate-200 dark:border-slate-700" title="Total Composite Score">
                          <span className="text-[9px] block text-teal-600 dark:text-teal-400 uppercase font-sans font-bold">Score</span>
                          <span className="font-bold text-teal-600 dark:text-teal-400">
                            {b.totalScore.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                All computations are performed in-memory on your device using client-side JavaScript. No user data is sent across the internet.
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setExplainModalOpen(false)}
              className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-xl transition hover:opacity-90"
            >
              Got it, close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
