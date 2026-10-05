import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration } from '@/utils/time';
import { X, Hourglass } from 'lucide-react';

interface GlobalLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_GLOBAL_LIMITS = [
  { label: '2 Hours', seconds: 7200 },
  { label: '3 Hours', seconds: 10800 },
  { label: '4 Hours', seconds: 14400 },
  { label: '5 Hours', seconds: 18000 },
  { label: '6 Hours', seconds: 21600 },
];

export const GlobalLimitModal: React.FC<GlobalLimitModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateGlobalSettings } = useTil();

  const [isEnabled, setIsEnabled] = useState(settings.isEnabled);
  const [hours, setHours] = useState(() => Math.floor(settings.dailyLimitSeconds / 3600) || 4);
  const [minutes, setMinutes] = useState(() => Math.floor((settings.dailyLimitSeconds % 3600) / 60) || 0);

  if (!isOpen) return null;

  const totalSeconds = hours * 3600 + minutes * 60;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateGlobalSettings({
      isEnabled,
      dailyLimitSeconds: totalSeconds,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue font-bold flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Combined Daily Limit</h2>
              <p className="text-[11px] text-slate-500">Across all tracked apps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Enforce Combined Limit</span>
              <span className="text-[11px] text-slate-400">Lock all apps once total limit is reached</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEnabled(!isEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isEnabled ? 'bg-blue' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                  isEnabled ? 'left-5.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {isEnabled && (
            <div className="space-y-3">
              <div className="bg-blue-50/50 p-3 rounded-2xl flex items-center justify-between border border-blue-100">
                <span className="text-xs text-slate-600 font-semibold">Total Combined Limit:</span>
                <span className="text-sm font-black text-blue">{formatDuration(totalSeconds)}</span>
              </div>

              {/* Hours and Minutes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="15"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue"
                  />
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {PRESET_GLOBAL_LIMITS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => {
                      setHours(Math.floor(preset.seconds / 3600));
                      setMinutes(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      totalSeconds === preset.seconds
                        ? 'bg-blue text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue hover:bg-blue-hover text-white font-bold text-xs shadow-md shadow-blue/20 transition-all cursor-pointer"
            >
              Save Global Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
