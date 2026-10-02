import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, Sun, Moon, Laptop, ArrowRight, CheckCircle2, Heart } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { ThemeType } from '../../store/useAppStore';
import { soundEngine } from '../../engine/soundEngine';

export const OnboardingFlow: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const { completeOnboarding, theme, setTheme } = useAppStore();

  const handleNext = () => {
    soundEngine.playBubblePop(1.1);
    if (step < 2) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      soundEngine.playSuccessChord();
    }
  };

  const handleThemePick = (selectedTheme: ThemeType) => {
    setTheme(selectedTheme);
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (selectedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
    soundEngine.playBubblePop(1.2);
  };

  const stepsData = [
    {
      title: "Discover What Truly Calms You",
      subtitle: "Personalized stress relief powered by your own body's response.",
      icon: <Sparkles className="w-10 h-10 text-teal-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Most stress apps give everyone the same advice. <strong>CalmPop is different:</strong> it features 10 tactile, sensory, and somatic micro-games and measures which one actually lowers your stress score.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 text-teal-800 dark:text-teal-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>10 Tactile & Somatic Games</span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-indigo-800 dark:text-indigo-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Learns your unique patterns</span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-purple-800 dark:text-purple-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Gentle sound synthesis</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Distraction-free 60fps play</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Our Absolute Privacy Promise",
      subtitle: "Your mental state is nobody's business but your own.",
      icon: <ShieldCheck className="w-10 h-10 text-emerald-500" />,
      content: (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm mb-1">
              Zero Accounts • Zero Tracking • Zero Cloud
            </h4>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
              Every score, mood check-in, and gratitude thought is kept entirely inside your browser storage. We have no servers, no analytics, no cookies, and no third-party tracking.
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            CalmPop functions completely offline as a Progressive Web App (PWA). You can back up or permanently wipe your data anytime with one click.
          </p>
        </div>
      )
    },
    {
      title: "Choose Your Sanctuary Theme",
      subtitle: "Pick an aesthetic that soothes your eyes.",
      icon: <Heart className="w-10 h-10 text-rose-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleThemePick('light')}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white/50 dark:bg-slate-800/40'
              }`}
            >
              <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Light</span>
            </button>

            <button
              onClick={() => handleThemePick('dark')}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white/50 dark:bg-slate-800/40'
              }`}
            >
              <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Dark</span>
            </button>

            <button
              onClick={() => handleThemePick('system')}
              className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white/50 dark:bg-slate-800/40'
              }`}
            >
              <Laptop className={`w-6 h-6 ${theme === 'system' ? 'text-teal-500' : 'text-slate-400'}`} />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">System</span>
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            You can change this or toggle high contrast in Settings at any time.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg glass-panel bg-white/80 dark:bg-slate-900/80 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-slate-800"
      >
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-8 bg-teal-500' : 'w-2 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                {stepsData[step].icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5">
                {stepsData[step].title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {stepsData[step].subtitle}
              </p>
            </div>

            {stepsData[step].content}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 0 ? (
            <button
              onClick={() => {
                soundEngine.playBubblePop(0.9);
                setStep(step - 1);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-2 rounded-xl transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium text-sm shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition transform active:scale-95"
          >
            <span>{step === 2 ? 'Begin Journey' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
