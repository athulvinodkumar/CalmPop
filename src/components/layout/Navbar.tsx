import React from 'react';
import { Sparkles, Moon, Sun, Volume2, VolumeX, BarChart2, Grid, Compass, HeartHandshake, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { soundEngine } from '../../engine/soundEngine';

export const Navbar: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    theme,
    setTheme,
    soundEnabled,
    setSoundEnabled,
    setSettingsModalOpen,
    setCrisisModalOpen
  } = useAppStore();

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    soundEngine.setMuted(!nextSound);
    if (nextSound) {
      soundEngine.playBubblePop(1.1);
    }
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    soundEngine.playBubblePop(0.9);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-6 h-16 flex items-center justify-between gap-1 sm:gap-4 overflow-hidden">
        {/* Brand */}
        <button
          onClick={() => setScreen('checkin')}
          className="flex items-center gap-2 text-left focus:outline-none group shrink-0 min-h-[48px] cursor-pointer"
          aria-label="CalmPop Home"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-600 dark:from-teal-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
                CalmPop
              </span>
              <span className="hidden md:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                100% Private
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block -mt-0.5">
              Adaptive Stress Relief
            </p>
          </div>
        </button>

        {/* Center Nav */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shrink-0">
          <button
            onClick={() => setScreen('checkin')}
            aria-label="Check In"
            className={`min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentScreen === 'checkin' || currentScreen === 'recommendations' || (!['catalog', 'insights', 'journey_preview', 'journey_summary', 'landing', 'privacy', 'terms'].includes(currentScreen))
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Check In</span>
          </button>

          <button
            onClick={() => setScreen('catalog')}
            aria-label="All Games"
            className={`min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentScreen === 'catalog'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">All Games</span>
          </button>

          <button
            onClick={() => setScreen('insights')}
            aria-label="Insights"
            className={`min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentScreen === 'insights'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute synthesized sound' : 'Unmute sound'}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Support Helpline link */}
          <button
            onClick={() => setCrisisModalOpen(true)}
            aria-label="Crisis support and helplines"
            title="Support & Resources"
            className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4" />
          </button>

          {/* Settings / Privacy / Backup */}
          <button
            onClick={() => setSettingsModalOpen(true)}
            aria-label="Settings and Data Privacy"
            title="Settings & Data Management"
            className="w-10 h-10 sm:w-11 sm:h-11 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
