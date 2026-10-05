import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration, formatCountdown } from '@/utils/time';
import { 
  Plus, 
  Search, 
  Layers, 
  Play, 
  Square, 
  Trash2, 
  Sliders, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import type { ComputedAppUsage } from '@/context/TilContext';
import type { UsageStatus } from '@/types/usage';

interface AppsScreenProps {
  onOpenAddApp: () => void;
  onOpenEditLimit: (app: ComputedAppUsage) => void;
  onOpenAppDetails: (app: ComputedAppUsage) => void;
}

export const AppsScreen: React.FC<AppsScreenProps> = ({
  onOpenAddApp,
  onOpenEditLimit,
  onOpenAppDetails,
}) => {
  const { 
    apps, 
    activeSession, 
    activeSessionElapsed, 
    startManualTimer, 
    stopManualTimer, 
    removeTrackedApp 
  } = useTil();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'installed' | 'manual'>('all');
  const [removeAlertMessage, setRemoveAlertMessage] = useState<string | null>(null);

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.packageName && app.packageName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || app.source === filterType;
    return matchesSearch && matchesType;
  });

  const [confirmDeleteApp, setConfirmDeleteApp] = useState<ComputedAppUsage | null>(null);

  const handleRemove = (app: ComputedAppUsage, e: React.MouseEvent) => {
    e.stopPropagation();
    if (app.isLocked) {
      setRemoveAlertMessage(
        `"${app.appName}" has reached its daily limit and is currently locked. It cannot be removed until the daily reset at midnight.`
      );
      return;
    }

    setConfirmDeleteApp(app);
  };

  const executeRemove = (app: ComputedAppUsage) => {
    const result = removeTrackedApp(app.id);
    if (!result.success && result.message) {
      setRemoveAlertMessage(result.message);
    }
    setConfirmDeleteApp(null);
  };

  const renderStatus = (status: UsageStatus, isLocked: boolean) => {
    if (isLocked) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
          <Lock className="w-2.5 h-2.5" /> reached
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="w-2.5 h-2.5" /> warning
        </span>
      );
    }
    if (status === 'unverified') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
          <AlertCircle className="w-2.5 h-2.5" /> unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="w-2.5 h-2.5" /> normal
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Alert modal if user tries to remove locked app */}
      {removeAlertMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">App is Locked</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">{removeAlertMessage}</p>
            <button
              onClick={() => setRemoveAlertMessage(null)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal before removing app */}
      {confirmDeleteApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Remove &quot;{confirmDeleteApp.appName}&quot;?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              This will remove the app from tracking and reset its monitored screen time for today.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteApp(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeRemove(confirmDeleteApp)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tracked Apps</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage apps that TIL tracks and their daily limits.</p>
        </div>

        <button
          onClick={onOpenAddApp}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue hover:bg-blue-hover text-white font-bold text-xs shadow-md shadow-blue/20 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add App</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracked apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/80 rounded-2xl pl-9.5 pr-4 py-2 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue/30"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'installed', 'manual'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? 'bg-blue text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Apps List */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 mt-2">
          <Layers className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm mt-2">No apps found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {searchQuery ? 'Try clearing your search term.' : 'Add your first app to get started.'}
          </p>
          <button
            onClick={onOpenAddApp}
            className="mt-4 px-4 py-2 rounded-xl bg-blue hover:bg-blue-hover text-white font-bold text-xs cursor-pointer shadow-md shadow-blue/20"
          >
            Add App
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => {
            const isTimerRunning = activeSession ? activeSession.trackedAppId === app.id : false;

            return (
              <div
                key={app.id}
                onClick={() => onOpenAppDetails(app)}
                className="bg-white rounded-3xl p-4.5 border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-all cursor-pointer group"
              >
                {/* Top Row: Icon + Name + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue font-black text-base flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {app.appName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        {app.appName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.source === 'installed' ? 'Installed app' : 'Manual app'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatus(app.status, app.isLocked)}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue transition-colors" />
                  </div>
                </div>

                {/* Usage details */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Used</span>
                    <span className="font-bold text-slate-800">{formatDuration(app.usedSeconds)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <span>Daily limit</span>
                    <span className="font-bold text-slate-800">
                      {app.isLimitEnabled ? formatDuration(app.dailyLimitSeconds) : 'No limit'}
                    </span>
                  </div>

                  {app.isLimitEnabled && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          app.isLocked ? 'bg-rose-500' : app.progressPercent >= 80 ? 'bg-amber-500' : 'bg-blue'
                        }`}
                        style={{ width: `${Math.min(100, app.progressPercent)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Manual Timer Button (for manual apps) */}
                {app.source === 'manual' && (
                  <div className="mt-3.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isTimerRunning) {
                          stopManualTimer();
                        } else {
                          startManualTimer(app.id);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isTimerRunning
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/20'
                          : 'bg-indigo/10 hover:bg-indigo/20 text-indigo border border-indigo/20'
                      }`}
                    >
                      {isTimerRunning ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Timer ({formatCountdown(activeSessionElapsed)})</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Manual Timer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Bottom Action Buttons */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEditLimit(app);
                    }}
                    className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Edit Limit</span>
                  </button>

                  <button
                    onClick={(e) => handleRemove(app, e)}
                    disabled={app.isLocked}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      app.isLocked
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                    }`}
                  >
                    {app.isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
