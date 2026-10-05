import React from 'react';
import { useTil } from '@/context/TilContext';
import { X, ShieldCheck, Activity, Layers, Eye } from 'lucide-react';

interface PermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateGlobalSettings } = useTil();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">System Permissions</h2>
              <p className="text-[11px] text-slate-500">Android permissions simulation</p>
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
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Permission 1: Usage Access */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Usage Access</h4>
                  <p className="text-[11px] text-slate-500">android.permission.PACKAGE_USAGE_STATS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateGlobalSettings({ usageAccessGranted: !settings.usageAccessGranted })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  settings.usageAccessGranted ? 'bg-blue' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.usageAccessGranted ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Allows TIL to read how long apps were used today. Without this permission, Android returns 0 seconds of usage time.
            </p>
          </div>

          {/* Permission 2: Display Over Other Apps */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Display Over Apps (Overlay)</h4>
                  <p className="text-[11px] text-slate-500">SYSTEM_ALERT_WINDOW</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateGlobalSettings({ overlayPermissionGranted: !settings.overlayPermissionGranted })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  settings.overlayPermissionGranted ? 'bg-blue' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.overlayPermissionGranted ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Allows TIL to show the full-screen lock blocker over an app once its daily limit has been exceeded.
            </p>
          </div>

          {/* Permission 3: Accessibility Service */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">TilAccessibilityService</h4>
                  <p className="text-[11px] text-slate-500">Instant app launch interception</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => updateGlobalSettings({ accessibilityServiceGranted: !settings.accessibilityServiceGranted })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  settings.accessibilityServiceGranted ? 'bg-blue' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                    settings.accessibilityServiceGranted ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Intercepts window state changes immediately when a locked app is launched, triggering the LockActivity.
            </p>
          </div>

          {/* Close */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
