import React from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Privacy Policy</h2>
              <p className="text-[11px] text-slate-500">100% On-Device & Private</p>
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
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm">No Data Leaves Your Device</h4>
            <p>
              TIL does not operate any analytics servers, advertising networks, or external cloud storage for your usage data. Everything is queried and stored locally on your device.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What We Access:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
              <li>Daily usage duration (seconds) per tracked package via Android UsageStatsManager.</li>
              <li>Names and package identifiers of apps you specifically choose to track.</li>
              <li>Manual timer session timestamps.</li>
            </ul>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>What We NEVER Access:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
              <li>Never inspect in-app content, messages, or keystrokes.</li>
              <li>Never collect personal identifiers, IP addresses, or device IDs.</li>
              <li>Never upload usage patterns to third parties.</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
