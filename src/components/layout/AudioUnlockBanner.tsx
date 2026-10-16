import React, { useState, useEffect } from 'react';
import { VolumeX } from 'lucide-react';
import { soundEngine } from '../../engine/soundEngine';
import { useAppStore } from '../../store/useAppStore';

export const AudioUnlockBanner: React.FC = () => {
  const { soundEnabled } = useAppStore();
  const [isSuspended, setIsSuspended] = useState<boolean>(soundEngine.isSuspended());
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = soundEngine.subscribeState((suspended) => {
      setIsSuspended(suspended);
    });
    return () => unsubscribe();
  }, []);

  if (!soundEnabled || !isSuspended || dismissed) {
    return null;
  }

  const handleUnlock = () => {
    soundEngine.unlock();
    soundEngine.playBubblePop(1.1);
  };

  return (
    <aside 
      aria-label="Audio enable banner"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/95 dark:bg-slate-800/95 border border-teal-500/40 text-teal-300 text-xs shadow-2xl backdrop-blur-md animate-bounce cursor-pointer hover:bg-slate-800 transition"
      onClick={handleUnlock}
    >
      <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0">
        <VolumeX className="w-3.5 h-3.5 text-teal-400" />
      </div>
      <span className="font-medium">Audio suspended. <strong>Tap to enable sound</strong></span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        className="ml-1 text-slate-400 hover:text-white p-0.5 rounded-full"
        aria-label="Dismiss audio banner"
      >
        ✕
      </button>
    </aside>
  );
};
