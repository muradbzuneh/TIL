import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { formatDuration } from '@/utils/time';
import { X, Search, Smartphone, Edit3, Check, Clock } from 'lucide-react';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_INSTALLED_APPS = [
  { name: 'YouTube', package: 'com.google.android.youtube', category: 'Video' },
  { name: 'Instagram', package: 'com.instagram.android', category: 'Social' },
  { name: 'TikTok', package: 'com.zhiliaoapp.musically', category: 'Social' },
  { name: 'X / Twitter', package: 'com.twitter.android', category: 'Social' },
  { name: 'Reddit', package: 'com.reddit.frontpage', category: 'Community' },
  { name: 'Chrome Browser', package: 'com.android.chrome', category: 'Browser' },
  { name: 'Netflix', package: 'com.netflix.mediaclient', category: 'Entertainment' },
  { name: 'Spotify', package: 'com.spotify.music', category: 'Audio' },
  { name: 'Discord', package: 'com.discord', category: 'Chat' },
  { name: 'Snapchat', package: 'com.snapchat.android', category: 'Social' },
  { name: 'Twitch', package: 'tv.twitch.android.app', category: 'Gaming' },
  { name: 'WhatsApp', package: 'com.whatsapp', category: 'Messaging' },
  { name: 'Facebook', package: 'com.facebook.katana', category: 'Social' },
  { name: 'Pinterest', package: 'com.pinterest', category: 'Lifestyle' },
  { name: 'Slack', package: 'com.Slack', category: 'Work' },
];

const PRESET_LIMITS = [
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
  { label: '45m', seconds: 2700 },
  { label: '1h', seconds: 3600 },
  { label: '1h 30m', seconds: 5400 },
  { label: '2h', seconds: 7200 },
  { label: '3h', seconds: 10800 },
];

export const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose }) => {
  const { addTrackedApp, apps } = useTil();

  const [activeTab, setActiveTab] = useState<'installed' | 'manual'>('installed');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected app info
  const [selectedApp, setSelectedApp] = useState<{ name: string; package: string } | null>(null);
  const [manualAppName, setManualAppName] = useState('');
  
  // Duration in hours and minutes
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);

  if (!isOpen) return null;

  const trackedPackageNames = new Set(apps.map(a => a.packageName).filter(Boolean));

  const filteredCatalog = PRESET_INSTALLED_APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.package.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalLimitSeconds = hours * 3600 + minutes * 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'installed') {
      if (!selectedApp) return;
      addTrackedApp({
        appName: selectedApp.name,
        packageName: selectedApp.package,
        source: 'installed',
        dailyLimitSeconds: totalLimitSeconds,
      });
    } else {
      if (!manualAppName.trim()) return;
      addTrackedApp({
        appName: manualAppName.trim(),
        packageName: null,
        source: 'manual',
        dailyLimitSeconds: totalLimitSeconds,
      });
    }

    onClose();
  };

  const applyPreset = (seconds: number) => {
    setHours(Math.floor(seconds / 3600));
    setMinutes(Math.floor((seconds % 3600) / 60));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Add Tracked App</h2>
            <p className="text-xs text-slate-500">Choose an app and set its daily screen limit.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Source Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('installed')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'installed'
                  ? 'bg-white text-blue shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Installed Apps</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-blue shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Custom / Manual</span>
            </button>
          </div>

          {activeTab === 'installed' ? (
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search installed device apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-blue focus:bg-white"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-2xl p-1 bg-slate-50/50">
                {filteredCatalog.map((app) => {
                  const isTracked = trackedPackageNames.has(app.package);
                  const isSelected = selectedApp?.package === app.package;

                  return (
                    <div
                      key={app.package}
                      onClick={() => !isTracked && setSelectedApp({ name: app.name, package: app.package })}
                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isTracked
                          ? 'opacity-50 cursor-not-allowed bg-transparent'
                          : isSelected
                          ? 'bg-blue text-white shadow-xs font-bold cursor-pointer'
                          : 'hover:bg-slate-100 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue'
                          }`}
                        >
                          {app.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold">{app.name}</div>
                          <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {app.package}
                          </div>
                        </div>
                      </div>

                      {isTracked ? (
                        <span className="text-[10px] font-semibold text-slate-400">Already tracked</span>
                      ) : isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">App or Activity Name</label>
              <input
                type="text"
                placeholder="e.g. Reading, Gaming, Study Session"
                value={manualAppName}
                onChange={(e) => setManualAppName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-blue focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">
                Manual apps allow you to start and stop real-time focused sessions with the built-in timer.
              </p>
            </div>
          )}

          {/* Daily Limit Picker */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue" />
                <span>Daily Screen Limit:</span>
              </label>
              <span className="text-xs font-black text-blue">{formatDuration(totalLimitSeconds)}</span>
            </div>

            {/* Hours and Minutes Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-500">Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-blue"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_LIMITS.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => applyPreset(preset.seconds)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
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

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={activeTab === 'installed' ? !selectedApp : !manualAppName.trim()}
              className="w-full py-2.5 rounded-xl bg-blue hover:bg-blue-hover disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-md shadow-blue/20 transition-all cursor-pointer"
            >
              Add to Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
