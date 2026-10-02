import React from 'react';
import { ShieldCheck, HardDriveDownload } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const PrivacyBanner: React.FC = () => {
  const { setSettingsModalOpen } = useAppStore();

  return (
    <aside aria-label="Privacy promise" className="w-full bg-teal-500/10 dark:bg-teal-500/5 border-b border-teal-500/20 text-xs text-teal-800 dark:text-teal-300 py-1.5 px-4 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong>Your data never leaves this device:</strong> 100% offline, single-player, zero tracking, zero cloud servers.
          </span>
        </div>
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="underline hover:text-teal-950 dark:hover:text-teal-100 flex items-center gap-1 font-medium transition cursor-pointer"
        >
          <HardDriveDownload className="w-3 h-3" />
          Manage Data / Backup
        </button>
      </div>
    </aside>
  );
};
