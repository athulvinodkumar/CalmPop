import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Brain,
  WifiOff,
  ArrowRight,
  HeartHandshake,
  Clock,
  Compass,
  FileText
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AdSlot } from '../ads/AdSlot';
import { adsTracking } from '../../services/adsTracking';

export const LandingPage: React.FC = () => {
  const { setScreen } = useAppStore();

  const handleStart = () => {
    adsTracking.trackSessionStart();
    setScreen('checkin');
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-12 flex flex-col items-center text-center">
        {/* Privacy Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-6 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>100% On-Device Privacy • No Cloud Storage • Zero Accounts</span>
        </motion.div>

        {/* Clear Headline & One-Line Value Prop */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15]"
        >
          Private stress relief that <span className="bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500 bg-clip-text text-transparent">learns what works</span> for you
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed"
        >
          Explore 10 science-grounded sensory micro-games with procedural audio. An on-device algorithm adapts to your nervous system, with zero personal data ever leaving your browser.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={handleStart}
            className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 active:scale-95 text-slate-950 font-bold text-base shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Start in 10 seconds, no signup</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            Takes under 2 minutes
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <WifiOff className="w-3.5 h-3.5 text-teal-500" />
            Works offline
          </span>
        </div>
      </section>

      {/* 3 Core Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Strict On-Device Privacy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              No analytics servers, no databases, and no login required. The Worry Shredder runs strictly in volatile RAM and is never stored anywhere.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Adaptive Learning Engine</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              CalmPop uses an on-device UCB-1 bandit algorithm that learns which sensory micro-game provides you with the greatest measured relief.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-sm backdrop-blur-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Procedural Web Audio</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every sound is synthesized in real time via the Web Audio API without downloading audio files. Instant loading even on slow cellular connections.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Strip */}
      <section className="bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800/80 py-12 px-4 sm:px-6 my-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How CalmPop Works
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              A rapid 3-step ritual designed to reset your autonomic nervous system
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-sm">
                1
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Quick Check-in</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Rate your current tension level in 5 seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                2
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">1-Minute Activity</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Engage in a gentle sensory game matched by your recommendation engine.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-sm">
                3
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Instant Feedback</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Reflect on your shift in calm. Your local bandit model updates instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Ad Slot on Landing Page (Off by default, consent gated) */}
      <AdSlot slotId="1000000001" className="my-4" />

      {/* Medical Disclaimer & Crisis Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full">
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400">
            <HeartHandshake className="w-4 h-4" />
            <span>Not Medical Advice & Crisis Support</span>
          </div>
          <p>
            CalmPop is a self-guided wellness and relaxation tool. It is not intended to diagnose, treat, cure, or prevent any mental health condition or psychological disorder.
          </p>
          <p className="font-medium">
            If you or someone you know is in crisis or experiencing severe distress, please reach out for immediate, free, confidential support: Call or text <strong className="underline">988</strong> (USA & Canada) or visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-white">findahelpline.com</a> for international help.
          </p>
        </div>
      </section>

      {/* Footer with Stable Legal Links */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 sm:px-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <button
            onClick={() => setScreen('privacy')}
            className="hover:text-teal-500 transition cursor-pointer flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <span>•</span>
          <button
            onClick={() => setScreen('terms')}
            className="hover:text-teal-500 transition cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Use</span>
          </button>
          <span>•</span>
          <button
            onClick={() => setScreen('catalog')}
            className="hover:text-teal-500 transition cursor-pointer flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Game Library</span>
          </button>
        </div>
        <p>© {new Date().getFullYear()} CalmPop. Private stress relief that learns what works for you.</p>
      </footer>
    </div>
  );
};
