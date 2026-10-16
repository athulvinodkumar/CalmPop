import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

export const BreathingGame: React.FC = () => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [timerCount, setTimerCount] = useState<number>(4);
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Inhale: 4s, Hold: 1.5s, Exhale: 6s
  useEffect(() => {
    if (!isTabVisible) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'inhale') {
      soundEngine.playSingingBowl(220, 3.8); // A3 Singing bowl
      setTimerCount(4);
      const interval = setInterval(() => {
        setTimerCount((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        setPhase('hold');
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else if (phase === 'hold') {
      setTimerCount(2);
      timeout = setTimeout(() => {
        setPhase('exhale');
      }, 1500);
      return () => clearTimeout(timeout);
    } else if (phase === 'exhale') {
      soundEngine.playSingingBowl(164.81, 5.5); // E3 Grounding resonance
      setTimerCount(6);
      const interval = setInterval(() => {
        setTimerCount((prev) => (prev > 1 ? prev - 1 : 1));
      }, 1000);

      timeout = setTimeout(() => {
        clearInterval(interval);
        setCyclesCompleted((c) => c + 1);
        setPhase('inhale');
      }, 6000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [phase, isTabVisible]);

  const getCue = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: 'Inhale Peace',
          desc: 'Expand your belly and chest gently',
          color: 'text-teal-300'
        };
      case 'hold':
        return {
          title: 'Hold Gently',
          desc: 'Rest in this still, quiet center',
          color: 'text-sky-300'
        };
      case 'exhale':
        return {
          title: 'Exhale Tension',
          desc: 'Release all resistance through your mouth',
          color: 'text-emerald-300'
        };
    }
  };

  const cue = getCue();

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-teal-950/40 to-slate-950">
      {/* Top Cycles Counter */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-teal-950/50 backdrop-blur-md border border-teal-500/20 text-xs text-teal-200">
        <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
        <span>Cycles Completed: <strong className="text-white font-mono">{cyclesCompleted}</strong></span>
        <span className="text-teal-400/60">•</span>
        <span className="text-teal-300">4s Inhale / 6s Exhale Vagal Rhythm</span>
      </div>

      {/* Main Breathing Morphing Circle */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-md my-auto">
        {/* Multi-layered pulsating aura rings */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.55 : phase === 'hold' ? 1.55 : 0.85,
            opacity: phase === 'inhale' ? 0.4 : phase === 'hold' ? 0.5 : 0.15
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 1.5 : 6,
            ease: phase === 'inhale' ? 'easeInOut' : 'easeOut'
          }}
          className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-teal-400/20 blur-2xl pointer-events-none"
        />

        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.35 : phase === 'hold' ? 1.35 : 0.9,
            opacity: phase === 'inhale' ? 0.6 : phase === 'hold' ? 0.65 : 0.25
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 1.5 : 6,
            ease: phase === 'inhale' ? 'easeInOut' : 'easeOut'
          }}
          className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-emerald-400/20 blur-xl pointer-events-none"
        />

        {/* Central Breathing Orb */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.2 : phase === 'hold' ? 1.2 : 0.82,
            boxShadow: phase === 'inhale'
              ? '0 0 50px rgba(20, 184, 166, 0.5)'
              : phase === 'hold'
              ? '0 0 60px rgba(56, 189, 248, 0.6)'
              : '0 0 20px rgba(16, 185, 129, 0.2)'
          }}
          transition={{
            duration: phase === 'inhale' ? 4 : phase === 'hold' ? 1.5 : 6,
            ease: 'easeInOut'
          }}
          className="relative w-36 h-36 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center bg-gradient-to-tr from-teal-500/40 via-emerald-400/30 to-sky-300/40 backdrop-blur-xl border border-teal-300/40"
        >
          {/* Internal ripple wave */}
          <div className="absolute inset-3 sm:inset-4 rounded-full border border-white/20 animate-pulse" />

          {/* Seconds countdown */}
          <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tighter drop-shadow-md">
            {timerCount}s
          </span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-teal-200/90 font-bold mt-1">
            {phase}
          </span>
        </motion.div>

        {/* Dynamic Text Cue */}
        <div className="mt-8 text-center h-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1"
            >
              <h3 className={`text-xl sm:text-2xl font-black ${cue.color} tracking-tight`}>
                {cue.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                {cue.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="text-xs text-teal-200/60 text-center pb-2">
        Synchronize your breath with the expanding orb. Rest your shoulders and let your jaw soften.
      </p>
    </div>
  );
};
