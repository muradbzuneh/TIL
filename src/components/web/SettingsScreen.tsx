import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration } from '@/utils/time';
import { 
  Hourglass, 
  ShieldCheck, 
  RotateCcw, 
  Trash2, 
  Info, 
  Lock, 
  ChevronRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface SettingsScreenProps {
  onOpenGlobalLimit: () => void;
  onOpenPermissions: () => void;
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
  onOpenOnboarding: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onOpenGlobalLimit,
  onOpenPermissions,
  onOpenAbout,
  onOpenPrivacy,
  onOpenOnboarding,
}) => {
  const { 
    settings, 
    simulateDailyReset, 
    deleteAllLocalData, 
    apps 
  } = useTil();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);

  const handleResetUsage = () => {
    simulateDailyReset();
    setResetSuccessToast(true);
    setTimeout(() => setResetSuccessToast(false), 3000);
  };

  const handleDeleteAll = () => {
    deleteAllLocalData();
    setConfirmDelete(false);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Toast */}
      {resetSuccessToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Usage reset! Apps unlocked for today.</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Control global limits, system permissions, and preferences.</p>
      </div>

      {/* Limits & Rules Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Limits & Enforcement</h2>
        
        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {/* Combined Global Limit */}
          <button
            onClick={onOpenGlobalLimit}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue flex items-center justify-center shrink-0">
                <Hourglass className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">Combined Limit</div>
                <div className="text-xs text-slate-500">
                  {settings.isEnabled 
                    ? `Enabled: ${formatDuration(settings.dailyLimitSeconds)} / day` 
                    : 'Disabled'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.isEnabled ? 'bg-blue-50 text-blue' : 'bg-slate-100 text-slate-500'
              }`}>
                {settings.isEnabled ? 'Active' : 'Off'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>

          {/* System Permissions */}
          <button
            onClick={onOpenPermissions}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">System Permissions</div>
                <div className="text-xs text-slate-500">
                  Usage Access & Overlay status
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.usageAccessGranted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {settings.usageAccessGranted ? 'Granted' : 'Needs attention'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Testing & Maintenance Section */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Simulation & Data</h2>

        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {/* Replay Onboarding */}
          <button
            onClick={onOpenOnboarding}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">Setup Wizard</div>
                <div className="text-xs text-slate-500">Revisit the initial 4-step onboarding</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          {/* Reset Today's Usage */}
          <div className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">Reset Today&apos;s Usage</div>
                <div className="text-xs text-slate-500">Unlock apps & start fresh for today</div>
              </div>
            </div>
            <button
              onClick={handleResetUsage}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Delete All Local Data */}
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900">Delete Local Data</div>
                  <div className="text-xs text-slate-500">Restore factory state & clear storage</div>
                </div>
              </div>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Erase
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAll}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>

            {confirmDelete && (
              <p className="text-[11px] text-rose-600 mt-2 font-medium bg-rose-50 p-2 rounded-xl">
                Warning: This clears all tracked apps ({apps.length}), limits, and usage history.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="space-y-2 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">About & Privacy</h2>

        <div className="bg-white rounded-3xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          <button
            onClick={onOpenPrivacy}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">Privacy Policy</div>
                <div className="text-xs text-slate-500">100% on-device data guarantee</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>

          <button
            onClick={onOpenAbout}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-sm text-slate-900">About TIL</div>
                <div className="text-xs text-slate-500">Version, architecture, and principles</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Footnote */}
      <div className="text-center pt-4">
        <p className="text-[11px] font-semibold text-slate-400">
          TIL (Time Is Limited) • Designed for intentional digital wellbeing
        </p>
      </div>
    </div>
  );
};
