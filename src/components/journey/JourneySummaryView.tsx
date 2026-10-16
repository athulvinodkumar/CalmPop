import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  TrendingDown, 
  Clock, 
  Layers, 
  Home, 
  RotateCcw, 
  BarChart2, 
  CheckCircle2 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { GAME_CATALOG } from '../../games/catalog';
import { soundEngine } from '../../engine/soundEngine';

export const JourneySummaryView: React.FC = () => {
  const { activeJourney, setScreen, discardJourney } = useAppStore();

  const initialStress = activeJourney?.stressInitial ?? 8;
  const history = activeJourney?.stressHistory ?? [initialStress, Math.max(1, initialStress - 3)];
  const finalStress = history[history.length - 1] ?? initialStress;
  const stressDrop = initialStress - finalStress;

  const totalMinutes = Math.max(1, Math.round((activeJourney?.totalDurationSeconds ?? 60) / 60));
  const levels = activeJourney?.levels ?? [];

  useEffect(() => {
    if (stressDrop > 0) {
      soundEngine.playSuccessChord();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#6366f1', '#f59e0b', '#ec4899']
      });
    }
  }, [stressDrop]);

  const handleStartAnother = () => {
    soundEngine.playBubblePop(1.1);
    discardJourney();
    setScreen('checkin');
  };

  const handleBackHome = () => {
    soundEngine.playBubblePop(0.9);
    discardJourney();
    setScreen('checkin');
  };

  const handleViewInsights = () => {
    soundEngine.playBubblePop(1.0);
    discardJourney();
    setScreen('insights');
  };

  const getEncouragingMessage = () => {
    if (stressDrop >= 4) {
      return "Exceptional recovery! Your nervous system responded powerfully to this sequenced combination of sensory, tactile, and breath regulation.";
    }
    if (stressDrop >= 2) {
      return "Substantial ease restored. Moving through progressive activities helped your mind soften and release acute tension.";
    }
    if (stressDrop > 0) {
      return "Noticeable easing. Step by step, giving yourself dedicated space creates quiet stability.";
    }
    return "Every minute of self-care counts. Giving yourself permission to pause is a victory in itself.";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6 touch-pan-y">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel bg-white/90 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6"
      >
        {/* Top Trophy / Burst */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <Sparkles className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 font-mono">
            Journey Complete
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            Calm Pathway Achieved
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            {getEncouragingMessage()}
          </p>
        </div>

        {/* Big Stress Delta Comparison */}
        <div className="p-5 rounded-3xl bg-gradient-to-tr from-teal-500/10 via-emerald-500/10 to-indigo-500/10 border border-teal-500/20 flex items-center justify-around">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Start Stress</span>
            <span className="text-3xl font-black text-slate-800 dark:text-slate-200">{initialStress}</span>
            <span className="text-xs text-slate-400">/10</span>
          </div>

          <div className="flex flex-col items-center">
            <TrendingDown className="w-6 h-6 text-teal-500 mb-1" />
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
              {stressDrop > 0 ? `-${stressDrop} pts Drop` : 'Stable Equilibrium'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Final Stress</span>
            <span className="text-3xl font-black text-teal-600 dark:text-teal-400">{finalStress}</span>
            <span className="text-xs text-slate-400">/10</span>
          </div>
        </div>

        {/* Small SVG Line Chart of Stress Progression across levels */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span>Stress Progression Across Levels</span>
            <span className="font-mono text-teal-600 dark:text-teal-400">
              {history.map((val, i) => i === 0 ? `Start: ${val}` : `L${i}: ${val}`).join(' → ')}
            </span>
          </div>

          <div className="w-full pt-4 pb-2">
            <svg viewBox="0 0 400 100" className="w-full h-24 overflow-visible">
              {/* Guides */}
              {[2, 5, 8].map((lvl) => {
                const y = 90 - (lvl / 10) * 80;
                return (
                  <line
                    key={lvl}
                    x1="20"
                    y1={y}
                    x2="380"
                    y2={y}
                    stroke="rgba(150, 150, 150, 0.15)"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Calculate points */}
              {(() => {
                const stepX = (380 - 20) / Math.max(1, history.length - 1);
                const points = history.map((val, idx) => ({
                  x: 20 + idx * stepX,
                  y: 90 - (val / 10) * 80,
                  val
                }));
                const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylineStr}
                    />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5"
                          fill="#14b8a6"
                          className="stroke-white dark:stroke-slate-900"
                          strokeWidth="2"
                        />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          className="fill-slate-700 dark:fill-slate-200 font-mono"
                        >
                          {p.val}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-teal-500 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase">Calm Time</span>
              <strong className="text-slate-900 dark:text-white">{totalMinutes} Minutes</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block uppercase">Levels Completed</span>
              <strong className="text-slate-900 dark:text-white">{levels.length} Games</strong>
            </div>
          </div>
        </div>

        {/* Games Breakdown List */}
        <div className="space-y-2 text-left pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Journey Sequence
          </span>
          <div className="space-y-1.5">
            {levels.map((l) => {
              const game = GAME_CATALOG[l.gameId];
              return (
                <div
                  key={l.levelNumber}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-800/30 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold font-mono text-[10px] flex items-center justify-center">
                      {l.levelNumber}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {game.title}
                    </span>
                    {l.replays > 0 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        (+{l.replays} replay{l.replays > 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleStartAnother}
            className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Another Journey</span>
          </button>

          <button
            onClick={handleViewInsights}
            className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>View Updated Insights</span>
          </button>

          <button
            onClick={handleBackHome}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
