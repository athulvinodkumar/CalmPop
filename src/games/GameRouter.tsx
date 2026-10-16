import React, { Suspense, lazy } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GameShell } from './common/GameShell';

// Code splitting: lazy-load every game to drastically improve mobile LCP and reduce initial bundle
const BubblePopGame = lazy(() => import('./BubblePop').then((m) => ({ default: m.BubblePopGame })));
const ZenSandGame = lazy(() => import('./ZenSand').then((m) => ({ default: m.ZenSandGame })));
const BreathingGame = lazy(() => import('./Breathing').then((m) => ({ default: m.BreathingGame })));
const WorryShredderGame = lazy(() => import('./WorryShredder').then((m) => ({ default: m.WorryShredderGame })));
const RipplePondGame = lazy(() => import('./RipplePond').then((m) => ({ default: m.RipplePondGame })));
const MandalaGame = lazy(() => import('./Mandala').then((m) => ({ default: m.MandalaGame })));
const CalmKeysGame = lazy(() => import('./CalmKeys').then((m) => ({ default: m.CalmKeysGame })));
const GratitudeJarGame = lazy(() => import('./GratitudeJar').then((m) => ({ default: m.GratitudeJarGame })));
const StarCatcherGame = lazy(() => import('./StarCatcher').then((m) => ({ default: m.StarCatcherGame })));
const ColorFillGame = lazy(() => import('./ColorFill').then((m) => ({ default: m.ColorFillGame })));

export const GameRouter: React.FC = () => {
  const { activeGameId } = useAppStore();

  if (!activeGameId) return null;

  const renderGame = () => {
    switch (activeGameId) {
      case 'bubble-pop':
        return <BubblePopGame />;
      case 'zen-sand':
        return <ZenSandGame />;
      case 'breathing':
        return <BreathingGame />;
      case 'worry-shredder':
        return <WorryShredderGame />;
      case 'ripple-pond':
        return <RipplePondGame />;
      case 'mandala':
        return <MandalaGame />;
      case 'calm-keys':
        return <CalmKeysGame />;
      case 'gratitude-jar':
        return <GratitudeJarGame />;
      case 'star-catcher':
        return <StarCatcherGame />;
      case 'color-fill':
        return <ColorFillGame />;
      default:
        return <div className="p-8 text-center text-slate-400">Game not found</div>;
    }
  };

  return (
    <GameShell>
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-slate-400 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-teal-400/40 border-t-teal-400 animate-spin" />
            <p className="text-xs uppercase tracking-widest text-teal-300/80 font-medium">Entering Calm Space...</p>
          </div>
        }
      >
        {renderGame()}
      </Suspense>
    </GameShell>
  );
};
