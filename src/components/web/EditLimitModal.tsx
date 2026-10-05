import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration } from '@/utils/time';
import { X } from 'lucide-react';
import type { ComputedAppUsage } from '@/context/TilContext';

interface EditLimitModalProps {
  app: ComputedAppUsage | null;
  onClose: () => void;
}

const PRESET_LIMITS = [
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '45m', seconds: 2700 },
  { label: '1h', seconds: 3600 },
  { label: '1h 30m', seconds: 5400 },
  { label: '2h', seconds: 7200 },
  { label: '3h', seconds: 10800 },
];

export const EditLimitModal: React.FC<EditLimitModalProps> = ({ app, onClose }) => {
  const { updateAppLimit } = useTil();

  const [hours, setHours] = useState(() => (app ? Math.floor(app.dailyLimitSeconds / 3600) : 1));
  const [minutes, setMinutes] = useState(() => (app ? Math.floor((app.dailyLimitSeconds % 3600) / 60) : 0));

  if (!app) return null;

  const totalLimitSeconds = hours * 3600 + minutes * 60;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppLimit(app.id, totalLimitSeconds);
    onClose();
  };

  const applyPreset = (seconds: number) => {
    setHours(Math.floor(seconds / 3600));
    setMinutes(Math.floor((seconds % 3600) / 60));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue font-bold flex items-center justify-center text-xs">
              {app.appName.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Edit Daily Limit</h2>
              <p className="text-[11px] text-slate-500">{app.appName}</p>
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
          <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between border border-slate-100">
            <span className="text-xs text-slate-500 font-semibold">New Daily Limit:</span>
            <span className="text-sm font-black text-blue">{formatDuration(totalLimitSeconds)}</span>
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
                step="5"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LIMITS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => applyPreset(preset.seconds)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    totalLimitSeconds === preset.seconds
                      ? 'bg-blue text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue hover:bg-blue-hover text-white font-bold text-xs shadow-md shadow-blue/20 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
