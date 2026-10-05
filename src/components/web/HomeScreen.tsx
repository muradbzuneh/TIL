import React from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration, formatCountdown } from '@/utils/time';
import { 
  AlertTriangle, 
  Hourglass, 
  Layers, 
  Activity, 
  Lock, 
  Timer, 
  Plus, 
  RotateCw, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { ComputedAppUsage } from '@/context/TilContext';
import type { UsageStatus } from '@/types/usage';

interface HomeScreenProps {
  onOpenAddApp: () => void;
  onOpenAppDetails: (app: ComputedAppUsage) => void;
  onOpenGlobalLimit: () => void;
  onOpenPermissions: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenAddApp,
  onOpenAppDetails,
  onOpenGlobalLimit,
  onOpenPermissions,
}) => {
  const { 
    apps, 
    globalUsage, 
    settings, 
    activeSession, 
    activeSessionElapsed, 
    stopManualTimer, 
    resetSeconds, 
    todayDateFormatted,
    simulateDailyReset,
  } = useTil();

  const usedApps = apps.filter(a => a.usedSeconds > 0);
  const lockedApps = apps.filter(a => a.isLocked);

  // Status pill helper
  const renderStatusPill = (status: UsageStatus, isLocked: boolean) => {
    if (isLocked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
          <Lock className="w-3 h-3" />
          <span>reached</span>
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          <AlertTriangle className="w-3 h-3" />
          <span>warning</span>
        </span>
      );
    }
    if (status === 'unverified') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
          <AlertCircle className="w-3 h-3" />
          <span>unverified</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="w-3 h-3" />
        <span>normal</span>
      </span>
    );
  };

  const activeApp = activeSession ? apps.find(a => a.id === activeSession.trackedAppId) : null;

  return (
    <div className="space-y-4 pb-24">
      {/* Date Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-blue">
          {todayDateFormatted}
        </p>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
          Today
        </h1>
      </div>

      {/* Permission Warning if not granted */}
      {!settings.usageAccessGranted && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <h3 className="font-bold text-sm">Usage unverified</h3>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            Android usage stays at 0 until Usage Access is enabled. Grant it in Settings to track actual app screen time.
          </p>
          <button
            onClick={onOpenPermissions}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:text-amber-700 underline cursor-pointer"
          >
            Open Permissions <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Combined Limit Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/70 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Hourglass className="w-4 h-4 text-blue" />
            <span className="text-sm font-bold">Combined limit</span>
          </div>
          {renderStatusPill(globalUsage.status, globalUsage.isReached)}
        </div>

        <div className="mt-3.5">
          <div className="text-4xl font-black text-slate-900 tracking-tight">
            {formatDuration(globalUsage.usedSeconds)}
          </div>

          {globalUsage.isEnabled ? (
            <div className="mt-3 space-y-2">
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    globalUsage.isReached 
                      ? 'bg-rose-500' 
                      : globalUsage.progressPercent >= 80 
                      ? 'bg-amber-500' 
                      : 'bg-blue'
                  }`}
                  style={{ width: `${Math.min(100, globalUsage.progressPercent)}%` }}
                />
              </div>

              <div className="pt-1 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Daily limit</span>
                  <span className="font-bold text-slate-800">{formatDuration(globalUsage.dailyLimitSeconds)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Remaining</span>
                  <span className="font-bold text-slate-800">{formatDuration(globalUsage.remainingSeconds)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Progress</span>
                  <span className="font-bold text-slate-800">{globalUsage.progressPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
              <span>No combined limit set. Add one from Settings.</span>
              <button
                onClick={onOpenGlobalLimit}
                className="font-bold text-blue hover:underline cursor-pointer"
              >
                Configure
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3 Metrics Tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
          <Layers className="w-4 h-4 text-blue" />
          <div className="text-2xl font-black text-slate-900 mt-1.5">{apps.length}</div>
          <div className="text-[11px] font-semibold text-slate-400">Tracked</div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
          <Activity className="w-4 h-4 text-indigo" />
          <div className="text-2xl font-black text-slate-900 mt-1.5">{usedApps.length}</div>
          <div className="text-[11px] font-semibold text-slate-400">Used today</div>
        </div>

        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
          <Lock className="w-4 h-4 text-rose-500" />
          <div className="text-2xl font-black text-slate-900 mt-1.5">{lockedApps.length}</div>
          <div className="text-[11px] font-semibold text-slate-400">Locked</div>
        </div>
      </div>

      {/* Active Timers Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className={`w-4 h-4 ${activeSession ? 'text-indigo animate-pulse' : 'text-slate-400'}`} />
            <span className="text-sm font-bold text-slate-800">Active timers</span>
          </div>
          <span className="text-sm font-extrabold text-slate-900">{activeSession ? 1 : 0}</span>
        </div>

        {activeSession && activeApp ? (
          <div className="mt-3 p-3 rounded-xl bg-indigo/5 border border-indigo/20 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-indigo">{activeApp.appName}</div>
              <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                {formatCountdown(activeSessionElapsed)}
              </div>
            </div>
            <button
              onClick={stopManualTimer}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              Stop Timer
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            No manual timer is running. Start one from a manual app in the Apps tab.
          </p>
        )}
      </div>

      {/* Reset in Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-2xs flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-400">Reset in</div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 mt-0.5 tracking-tight">
            {formatCountdown(resetSeconds)}
          </div>
        </div>
        <button
          onClick={simulateDailyReset}
          title="Simulate Daily Midnight Reset"
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCw className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Tracked Apps Section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-base font-extrabold text-slate-900">Tracked apps</h2>
          <button
            onClick={onOpenAddApp}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue hover:text-blue-hover cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add App
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/70">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm mt-2">No apps tracked yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Add your first app to monitor daily usage and enforce screen time limits.
            </p>
            <button
              onClick={onOpenAddApp}
              className="mt-4 px-4 py-2 rounded-xl bg-blue hover:bg-blue-hover text-white font-bold text-xs shadow-md shadow-blue/20 cursor-pointer"
            >
              Add an App
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {apps.map((app) => (
              <div
                key={app.id}
                onClick={() => onOpenAppDetails(app)}
                className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-blue/40 transition-all cursor-pointer shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue font-extrabold text-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {app.appName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{app.appName}</div>
                      <div className="text-[11px] text-slate-400">
                        {app.source === 'installed' ? 'Installed app' : 'Manual app'}
                      </div>
                    </div>
                  </div>
                  {renderStatusPill(app.status, app.isLocked)}
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Used</span>
                    <span className="font-bold text-slate-800">{formatDuration(app.usedSeconds)}</span>
                  </div>

                  {app.isLimitEnabled && (
                    <>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            app.isLocked ? 'bg-rose-500' : app.progressPercent >= 80 ? 'bg-amber-500' : 'bg-blue'
                          }`}
                          style={{ width: `${Math.min(100, app.progressPercent)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Limit: {formatDuration(app.dailyLimitSeconds)}</span>
                        <span>Remaining: {formatDuration(app.remainingSeconds)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
