import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { soundEngine } from './engine/soundEngine';
import { Navbar } from './components/layout/Navbar';
import { CrisisDisclaimerModal } from './components/layout/CrisisDisclaimerModal';
import { ExplainEngineModal } from './components/recommendations/ExplainEngineModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { CheckinFlow } from './components/checkin/CheckinFlow';
import { JourneyPreviewView } from './components/journey/JourneyPreviewView';
import { JourneySummaryView } from './components/journey/JourneySummaryView';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { GameCatalogView } from './components/catalog/GameCatalogView';
import { InsightsDashboard } from './components/insights/InsightsDashboard';
import { GameRouter } from './games/GameRouter';
import { PostCheckinModal } from './components/postcheck/PostCheckinModal';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const {
    currentScreen,
    hasCompletedOnboarding,
    theme,
    soundEnabled,
    largeText,
    setCrisisModalOpen,
    setSettingsModalOpen
  } = useAppStore();

  // Initialize theme, sound, and font size
  useEffect(() => {
    // Theme setup
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };
    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    // Sound engine sync
    soundEngine.setMuted(!soundEnabled);

    // Large text sync
    if (largeText) {
      document.body.classList.add('large-text-mode');
    } else {
      document.body.classList.remove('large-text-mode');
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [theme, soundEnabled, largeText]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Global Modals */}
      <CrisisDisclaimerModal />
      <ExplainEngineModal />
      <SettingsModal />

      {/* Screen Dispatcher */}
      {!hasCompletedOnboarding ? (
        <main className="flex-1 flex items-center justify-center p-4">
          <OnboardingFlow />
        </main>
      ) : currentScreen === 'game' ? (
        <GameRouter />
      ) : currentScreen === 'postcheck' ? (
        <PostCheckinModal />
      ) : (
        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1">
            {currentScreen === 'journey_preview' ? (
              <JourneyPreviewView />
            ) : currentScreen === 'journey_summary' ? (
              <JourneySummaryView />
            ) : currentScreen === 'recommendations' ? (
              <RecommendationsView />
            ) : currentScreen === 'catalog' ? (
              <GameCatalogView />
            ) : currentScreen === 'insights' ? (
              <InsightsDashboard />
            ) : (
              <CheckinFlow />
            )}
          </main>

          {/* Calming Footer with Disclaimers & Privacy */}
          <footer className="w-full border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-xs py-8 px-4 text-xs text-slate-500 dark:text-slate-400 mt-12">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <span>CalmPop</span>
                  <span>•</span>
                  <span>Single-Player Stress Relief</span>
                </div>
                <p className="max-w-md text-[11px] leading-relaxed">
                  <strong>Notice:</strong> CalmPop is an everyday self-regulation tool and does not provide clinical or medical advice. If you feel unsafe or in severe emotional distress, please connect with a trusted person or local helpline.
                </p>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  <strong>Your data never leaves this device:</strong> 100% offline, local browser storage only.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={() => setCrisisModalOpen(true)}
                  className="hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Support & Helplines</span>
                </button>

                <button
                  onClick={() => setSettingsModalOpen(true)}
                  className="hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy & Data Wipe</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
