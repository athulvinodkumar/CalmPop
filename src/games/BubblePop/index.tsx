import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';

interface BubbleState {
  id: number;
  popped: boolean;
  popping: boolean;
  popX?: number;
  popY?: number;
}

interface ParticleBurst {
  id: number;
  x: number;
  y: number;
}

const TOTAL_BUBBLES = 12;

export const BubblePopGame: React.FC = () => {
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);
  const [, setTotalPoppedCount] = useState(0);
  const [sheetsCleared, setSheetsCleared] = useState(0);
  const [isRefilling, setIsRefilling] = useState(false);
  const [bursts, setBursts] = useState<ParticleBurst[]>([]);

  const isPointerDownRef = useRef(false);
  const comboCountRef = useRef(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize 12-bubble sheet
  const initSheet = useCallback(() => {
    setIsRefilling(true);
    const newBubbles: BubbleState[] = Array.from({ length: TOTAL_BUBBLES }, (_, i) => ({
      id: i,
      popped: false,
      popping: false
    }));
    setBubbles(newBubbles);
    setTimeout(() => {
      setIsRefilling(false);
    }, 450);
  }, []);

  useEffect(() => {
    initSheet();
  }, [initSheet]);

  const triggerBubblePop = useCallback((index: number, clientX?: number, clientY?: number) => {
    setBubbles((prev) => {
      if (!prev[index] || prev[index].popped || prev[index].popping) return prev;

      // Update rising pitch combo
      comboCountRef.current += 1;
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        comboCountRef.current = 0;
      }, 550);

      // Rising pitch combo calculation
      const pitch = 0.95 + Math.min(1.4, comboCountRef.current * 0.08);
      soundEngine.playBubblePop(pitch);

      // Trigger particle burst if position available
      if (clientX !== undefined && clientY !== undefined) {
        const burstId = Date.now() + Math.random();
        setBursts((curr) => [...curr.slice(-6), { id: burstId, x: clientX, y: clientY }]);
        setTimeout(() => {
          setBursts((curr) => curr.filter((b) => b.id !== burstId));
        }, 500);
      }

      setTotalPoppedCount((c) => c + 1);

      const next = [...prev];
      next[index] = { ...next[index], popped: true, popping: true };

      // Check if all 12 are popped
      const poppedTotal = next.filter((b) => b.popped).length;
      if (poppedTotal === TOTAL_BUBBLES) {
        setTimeout(() => {
          soundEngine.playSuccessChord();
          setSheetsCleared((c) => c + 1);
          initSheet();
        }, 400);
      }

      return next;
    });
  }, [initSheet]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, index: number) => {
    isPointerDownRef.current = true;
    triggerBubblePop(index, e.clientX, e.clientY);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>, index: number) => {
    if (isPointerDownRef.current) {
      triggerBubblePop(index, e.clientX, e.clientY);
    }
  };

  useEffect(() => {
    const handleUp = () => {
      isPointerDownRef.current = false;
    };
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  const poppedInSheet = bubbles.filter((b) => b.popped).length;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950/40 select-none overflow-hidden touch-none">
      {/* Particle Bursts Layer */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: burst.x, top: burst.y }}
          >
            {/* Expanding shockwave ring */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-16 h-16 rounded-full border-2 border-sky-300"
            />
          </div>
        ))}
      </div>

      {/* Top Header / Stats Bar */}
      <div className="w-full max-w-lg flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>
            Sheet: <strong className="text-white font-mono text-sm">{poppedInSheet}</strong>
            <span className="text-slate-400 font-mono"> / {TOTAL_BUBBLES}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {comboCountRef.current > 1 && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 animate-pulse font-mono">
              <Zap className="w-3 h-3 fill-amber-400" />
              <span>{comboCountRef.current}x Combo</span>
            </span>
          )}

          <span className="text-slate-400 hidden sm:inline">
            Cleared: <strong className="text-sky-300 font-mono">{sheetsCleared}</strong>
          </span>

          <button
            onClick={() => {
              soundEngine.playBubblePop(0.9);
              initSheet();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refill</span>
          </button>
        </div>
      </div>

      {/* Main 12-Bubble Sheet: 3 columns on phones (min 72px targets), 4 columns on desktop */}
      <div className="flex-1 w-full max-w-lg flex items-center justify-center p-2 sm:p-4">
        <div className="relative p-4 sm:p-6 rounded-3xl bg-sky-950/20 border border-sky-500/20 backdrop-blur-xl shadow-2xl">
          {/* Grid: 3 cols on mobile, 4 cols on desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
            {bubbles.map((b) => {
              return (
                <div
                  key={b.id}
                  className="relative flex items-center justify-center"
                >
                  {/* Indented rim that stays when popped */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-sky-950/40 border border-sky-900/30 shadow-inner flex items-center justify-center">
                    {b.popped && (
                      <div className="w-10 h-10 rounded-full border border-sky-500/10 bg-sky-900/10" />
                    )}
                  </div>

                  {/* Inflated Bubble */}
                  <AnimatePresence>
                    {!b.popped && (
                      <motion.button
                        type="button"
                        initial={isRefilling ? { scale: 0, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{
                          scale: [1, 1.18, 0.8, 0],
                          opacity: [1, 1, 0.5, 0]
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 450,
                          damping: 24,
                          delay: isRefilling ? b.id * 0.025 : 0
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onPointerDown={(e) => handlePointerDown(e, b.id)}
                        onPointerEnter={(e) => handlePointerEnter(e, b.id)}
                        aria-label={`Bubble ${b.id + 1} unpopped`}
                        className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 min-w-[72px] min-h-[72px] rounded-full cursor-pointer focus:outline-none transition-transform"
                        style={{
                          background: 'radial-gradient(circle at 35% 30%, rgba(224, 242, 254, 0.85) 0%, rgba(56, 189, 248, 0.55) 45%, rgba(14, 116, 144, 0.6) 80%, rgba(12, 74, 110, 0.7) 100%)',
                          boxShadow: '0 8px 20px -3px rgba(14, 165, 233, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.7), inset 0 -3px 8px rgba(3, 105, 161, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.5)'
                        }}
                      >
                        {/* Upper-Left Glossy Specular Highlight */}
                        <div className="absolute top-2.5 left-3 w-5 h-3 sm:w-6 sm:h-3.5 rounded-full bg-white/90 blur-[0.6px] transform -rotate-40 pointer-events-none" />
                        <div className="absolute top-5 left-2 w-1.5 h-1.5 rounded-full bg-white/70 pointer-events-none" />

                        {/* Lower-Right Internal Refraction */}
                        <div className="absolute bottom-2.5 right-3.5 w-6 h-3 rounded-full bg-sky-300/40 blur-[1px] pointer-events-none" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <p className="text-xs text-slate-400 text-center pb-2">
        Tap or slide your finger across bubbles to pop combos. New sheet refills automatically!
      </p>
    </div>
  );
};
