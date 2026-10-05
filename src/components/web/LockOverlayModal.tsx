import React from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration, formatCountdown } from '@/utils/time';
import { ShieldAlert, Clock, ArrowLeft, Lock } from 'lucide-react';

export const LockOverlayModal: React.FC = () => {
  const { activeLockedApp, setActiveLockedApp, resetSeconds } = useTil();

  if (!activeLockedApp) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Top Tag */}
      <div className="pt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-black tracking-wider uppercase">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>TIL Lock Enforcement</span>
      </div>

      {/* Center Hero */}
      <div className="flex flex-col items-center text-center max-w-sm w-full space-y-4 my-auto">
        {/* Animated glowing lock badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center shadow-2xl shadow-rose-600/40 animate-pulse">
            <Lock className="w-12 h-12 text-white stroke-[2.2]" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Daily Limit Reached
          </h1>
          <p className="text-base font-bold text-rose-400 mt-1">
            {activeLockedApp.appName}
          </p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
          You have reached your daily limit of{' '}
          <strong className="text-white font-extrabold">{formatDuration(activeLockedApp.dailyLimitSeconds)}</strong>{' '}
          for today. Take a mindful break and reconnect with the physical world.
        </p>

        {/* Stats card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5 backdrop-blur-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Total used today:</span>
            <span className="font-extrabold text-white font-mono">{formatDuration(activeLockedApp.usedSeconds)}</span>
          </div>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-white/10">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Resets in:</span>
            </span>
            <span className="font-extrabold text-rose-400 font-mono tracking-wider">
              {formatCountdown(resetSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="w-full max-w-xs pb-4">
        <button
          onClick={() => setActiveLockedApp(null)}
          className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
