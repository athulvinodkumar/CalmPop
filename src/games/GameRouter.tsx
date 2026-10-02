import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { GameShell } from './common/GameShell';
import { BubblePopGame } from './BubblePop';
import { ZenSandGame } from './ZenSand';
import { BreathingGame } from './Breathing';
import { WorryShredderGame } from './WorryShredder';
import { RipplePondGame } from './RipplePond';
import { MandalaGame } from './Mandala';
import { CalmKeysGame } from './CalmKeys';
import { GratitudeJarGame } from './GratitudeJar';
import { StarCatcherGame } from './StarCatcher';
import { ColorFillGame } from './ColorFill';

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
      {renderGame()}
    </GameShell>
  );
};
