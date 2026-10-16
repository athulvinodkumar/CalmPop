import React, { useEffect, Suspense, lazy } from 'react';
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
import { GameRouter } from './games/GameRouter';
import { PostCheckinModal } from './components/postcheck/PostCheckinModal';
import { AudioUnlockBanner } from './components/layout/AudioUnlockBanner';
import { ConsentBanner } from './components/ads/ConsentBanner';
import { HeartHandshake, ShieldCheck, FileText } from 'lucide-react';

// Lazy-loaded auxiliary views to minimize initial bundle size and maximize mobile LCP
const LandingPage = lazy(() => import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const PrivacyPage = lazy(() => import('./components/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./components/legal/TermsPage').then((m) => ({ default: m.TermsPage })));
const InsightsDashboard = lazy(() => import('./components/insights/InsightsDashboard').then((m) => ({ default: m.InsightsDashboard })));
const GameCatalogView = lazy(() => import('./components/catalog/GameCatalogView').then((m) => ({ default: m.GameCatalogView })));

export const App: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    hasCompletedOnboarding,
    theme,
    soundEnabled,
    largeText,
    setCrisisModalOpen,
    setSettingsModalOpen
  } = useAppStore();

  // URL route syncing for landing and legal pages
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/privacy' || hash === '#privacy') {
        setScreen('privacy');
      } else if (path === '/terms' || hash === '#terms') {
        setScreen('terms');
      } else if (path === '/landing' || hash === '#landing') {
        setScreen('landing');
      }
    };

    handleLocation();
    window.addEventListener('popstate', handleLocation);
    window.addEventListener('hashchange', handleLocation);
    return () => {
      window.removeEventListener('popstate', handleLocation);
      window.removeEventListener('hashchange', handleLocation);
    };
  }, [setScreen]);

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
    <div className="min-h-screen min-h-dvh flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Global Modals & Banners */}
      <CrisisDisclaimerModal />
      <ExplainEngineModal />
      <SettingsModal />
      <AudioUnlockBanner />
      <ConsentBanner />

      {/* Screen Dispatcher */}
      <Suspense
        fallback={
          <div className="w-full min-h-screen min-h-dvh flex flex-col items-center justify-center p-8 text-slate-400 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-500/40 border-t-teal-500 animate-spin" />
            <p className="text-xs uppercase tracking-widest text-teal-400/80 font-medium">Entering Calm Space...</p>
          </div>
        }
      >
        {currentScreen === 'landing' ? (
          <LandingPage />
        ) : currentScreen === 'privacy' ? (
          <PrivacyPage />
        ) : currentScreen === 'terms' ? (
          <TermsPage />
        ) : !hasCompletedOnboarding ? (
          <main className="flex-1 flex items-center justify-center p-4">
            <OnboardingFlow />
          </main>
        ) : currentScreen === 'game' ? (
          <GameRouter />
        ) : currentScreen === 'postcheck' ? (
          <PostCheckinModal />
        ) : (
          <div className="flex-1 flex flex-col w-full">
            <Navbar />

            <main className="flex-1 w-full">
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

                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 text-xs">
                  <button
                    onClick={() => setScreen('privacy')}
                    className="hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Privacy Policy</span>
                  </button>

                  <button
                    onClick={() => setScreen('terms')}
                    className="hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Terms</span>
                  </button>

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
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </footer>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default App;
