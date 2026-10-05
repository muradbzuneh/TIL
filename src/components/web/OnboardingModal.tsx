import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { Sparkles, Activity, Layers, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { updateGlobalSettings } = useTil();
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleFinish = () => {
    updateGlobalSettings({
      onboardingCompleted: true,
      usageAccessGranted: true,
      overlayPermissionGranted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 text-center">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-blue' : i < step ? 'w-3 bg-blue/40' : 'w-3 bg-slate-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-4 my-2">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Welcome to TIL</h2>
              <p className="text-xs font-semibold text-blue mt-0.5">Time Is Limited</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              TIL is designed to help you build intentional screen habits through daily app limits, combined limits, and focus timers.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3 rounded-2xl bg-blue hover:bg-blue-hover text-white font-bold text-xs shadow-md shadow-blue/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Usage Access */}
        {step === 2 && (
          <div className="space-y-4 my-2">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo flex items-center justify-center mx-auto shadow-inner">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Track Daily Usage</h2>
              <p className="text-xs font-semibold text-indigo mt-0.5">Usage Access</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              TIL calculates time spent in each app to monitor limits. In Android, this requires the Usage Access permission.
            </p>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-600 font-medium">
              Privacy Promise: Usage data stays 100% on your device and is never uploaded anywhere.
            </div>
            <button
              onClick={() => {
                updateGlobalSettings({ usageAccessGranted: true });
                setStep(3);
              }}
              className="w-full mt-4 py-3 rounded-2xl bg-indigo hover:bg-indigo/90 text-white font-bold text-xs shadow-md shadow-indigo/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Grant Usage Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Overlay */}
        {step === 3 && (
          <div className="space-y-4 my-2">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Enforce Limits</h2>
              <p className="text-xs font-semibold text-purple-600 mt-0.5">Overlay Permission</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              When an app exceeds its daily limit, TIL displays the lock overlay over the screen until midnight.
            </p>
            <button
              onClick={() => {
                updateGlobalSettings({ overlayPermissionGranted: true });
                setStep(4);
              }}
              className="w-full mt-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Grant Overlay Access</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="space-y-4 my-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">You&apos;re All Set!</h2>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">Ready to Track</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your limits are active. You can add more apps, adjust your combined limit, or start focus timers anytime.
            </p>
            <button
              onClick={handleFinish}
              className="w-full mt-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Open Dashboard</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
