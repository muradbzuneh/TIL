import React from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration } from '@/utils/time';
import { 
  X, 
  Sliders, 
  Trash2, 
  Lock, 
  Plus, 
  Activity
} from 'lucide-react';
import type { ComputedAppUsage } from '@/context/TilContext';

interface AppDetailsModalProps {
  app: ComputedAppUsage | null;
  onClose: () => void;
  onOpenEditLimit: (app: ComputedAppUsage) => void;
}

export const AppDetailsModal: React.FC<AppDetailsModalProps> = ({
  app,
  onClose,
  onOpenEditLimit,
}) => {
  const { simulateUsage, setActiveLockedApp, removeTrackedApp } = useTil();
  const [confirmRemove, setConfirmRemove] = React.useState(false);
  const [lockedMessage, setLockedMessage] = React.useState<string | null>(null);

  if (!app) return null;

  const handleSimulatePlus15 = () => {
    simulateUsage(app.id, 900); // 15 mins
  };

  const handleTriggerLock = () => {
    setActiveLockedApp(app);
    onClose();
  };

  const handleRemove = () => {
    if (app.isLocked) {
      setLockedMessage(`"${app.appName}" has reached its daily limit and cannot be removed until midnight reset.`);
      return;
    }
    setConfirmRemove(true);
  };

  const executeRemove = () => {
    removeTrackedApp(app.id);
    setConfirmRemove(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue font-black text-lg flex items-center justify-center">
              {app.appName.charAt(0)}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{app.appName}</h2>
              <p className="text-[11px] text-slate-400">
                {app.packageName || (app.source === 'installed' ? 'Installed package' : 'Manual activity')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Status & Usage Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">Today&apos;s Usage</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  app.isLocked
                    ? 'bg-rose-100 text-rose-700'
                    : app.status === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {app.isLocked ? 'limit reached' : app.status}
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {formatDuration(app.usedSeconds)}
            </div>

            {app.isLimitEnabled && (
              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      app.isLocked ? 'bg-rose-500' : app.progressPercent >= 80 ? 'bg-amber-500' : 'bg-blue'
                    }`}
                    style={{ width: `${Math.min(100, app.progressPercent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Limit: {formatDuration(app.dailyLimitSeconds)}</span>
                  <span>{app.progressPercent.toFixed(1)}% used</span>
                </div>
              </div>
            )}
          </div>

          {/* Usage Breakdown */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue" />
              <span>Usage Breakdown</span>
            </h4>

            <div className="flex justify-between text-slate-500 py-1 border-b border-slate-100">
              <span>System Tracked Time:</span>
              <span className="font-bold text-slate-800">{formatDuration(app.systemUsageSeconds)}</span>
            </div>

            <div className="flex justify-between text-slate-500 py-1">
              <span>Manual Session Time:</span>
              <span className="font-bold text-slate-800">{formatDuration(app.manualUsageSeconds)}</span>
            </div>
          </div>

          {/* Test & Simulation Tools */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test & Simulation</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSimulatePlus15}
                className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate +15m</span>
              </button>

              <button
                type="button"
                onClick={handleTriggerLock}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Test Lock Screen</span>
              </button>
            </div>
          </div>

          {/* Management Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onOpenEditLimit(app);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-blue" />
              <span>Change Daily Limit</span>
            </button>

            {lockedMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                <p className="font-medium">{lockedMessage}</p>
                <button
                  type="button"
                  onClick={() => setLockedMessage(null)}
                  className="mt-2 text-rose-800 font-bold underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {confirmRemove ? (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <p className="text-xs font-bold text-rose-900">Remove &quot;{app.appName}&quot; from tracking?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(false)}
                    className="flex-1 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeRemove}
                    className="flex-1 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer hover:bg-rose-700"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRemove}
                disabled={app.isLocked}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  app.isLocked
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{app.isLocked ? 'Locked (Cannot Remove)' : 'Remove from Tracking'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
