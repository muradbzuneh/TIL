import React from 'react';
import { X, Info, Shield, Heart, Smartphone } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue font-bold flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">About TIL</h2>
              <p className="text-[11px] text-slate-500">Time Is Limited • v1.0.0</p>
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
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-blue-900">
            <h4 className="font-extrabold text-sm mb-1">Our Philosophy</h4>
            <p className="text-xs text-blue-800">
              TIL is built on the principle that your time and attention are finite. By setting strict daily app limits and combined boundaries, you regain agency over your attention.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">Zero Telemetry</strong>
                TIL never tracks you, sends metrics, or sells data. All records remain 100% on your device.
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">Hard Lock Discipline</strong>
                When an app reaches its limit, it is locked until the daily midnight reset. No easy bypass buttons, helping you stay true to your goals.
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">Manual Focus Sessions</strong>
                Track off-screen or custom activities with real-time timers and roll them into your daily screen boundaries.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
