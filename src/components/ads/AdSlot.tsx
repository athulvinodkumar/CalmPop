import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { adsTracking } from '../../services/adsTracking';

interface AdSlotProps {
  slotId?: string;
  format?: 'auto' | 'horizontal';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  slotId = '0000000000',
  format = 'auto',
  className = ''
}) => {
  const { adConsent } = useAppStore();
  const [adFailed, setAdFailed] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const adRef = useRef<HTMLModElement | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Strict check: if ads disabled in environment or consent denied, render nothing
  if (!adsTracking.isEnabled() || adConsent === 'denied' || adConsent === null) {
    return null;
  }

  // Gracefully collapse if offline or ad blocked/failed
  if (!isOnline || adFailed) {
    return null;
  }

  const clientId = adsTracking.getClientId();

  return (
    <div
      className={`w-full max-w-2xl mx-auto my-6 px-4 py-2 flex flex-col items-center justify-center transition-all ${className}`}
      style={{ minHeight: '90px' }} // Reserve fixed min-height to prevent layout shift (CLS)
    >
      <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium mb-1 select-none">
        Advertisement
      </span>

      <div className="w-full flex justify-center items-center overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-100/50 dark:bg-slate-900/50 min-h-[90px]">
        {clientId ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '250px', minHeight: '90px', width: '100%' }}
            data-ad-client={clientId}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
            onError={() => setAdFailed(true)}
          />
        ) : (
          <div className="text-[11px] text-slate-400 text-center py-4">
            <span>Sponsored Announcement Slot</span>
          </div>
        )}
      </div>
    </div>
  );
};
