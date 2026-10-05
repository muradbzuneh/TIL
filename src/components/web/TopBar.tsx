import React, { useState } from 'react';
import { useTil } from '@/context/TilContext';
import { formatCountdown } from '@/utils/time';
import { 
  Clock, 
  Smartphone, 
  Monitor, 
  Sparkles, 
  RotateCcw, 
  Lock, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface TopBarProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenOnboarding: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  onOpenOnboarding,
}) => {
  const { 
    resetSeconds, 
    simulateUsage, 
    simulateDailyReset, 
    apps, 
    setActiveLockedApp,
  } = useTil();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const lockedApp = apps.find(a => a.isLocked) || apps[0];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-3 sm:px-4 py-2 shadow-xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue to-indigo flex items-center justify-center shadow-md shadow-blue/20 text-white font-black text-sm sm:text-base tracking-tight shrink-0">
            TIL
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">Time Is Limited</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue border border-blue-200/60">
                v1.0.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Screen Time & Daily App Limit Manager</p>
          </div>
        </div>

        {/* Center/Right: Actions & Simulators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Midnight Countdown */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue shrink-0" />
            <span className="text-slate-400 hidden xs:inline">Reset in:</span>
            <span className="font-mono font-bold text-slate-900">{formatCountdown(resetSeconds)}</span>
          </div>

          {/* Quick Simulation Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo/10 hover:bg-indigo/20 text-indigo font-semibold text-xs transition-colors border border-indigo/20 cursor-pointer"
              title="Test real-time limits & simulation features"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Simulator Tools
                </div>
                
                <button
                  onClick={() => {
                    const target = apps[0];
                    if (target) simulateUsage(target.id, 900); // +15 mins
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-blue" />
                  <div>
                    <div className="font-bold">Add +15m to {apps[0]?.appName || 'first app'}</div>
                    <div className="text-[10px] text-slate-400">Fast-forward usage time</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (lockedApp) {
                      setActiveLockedApp(lockedApp);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-bold">Trigger Lock Overlay</div>
                    <div className="text-[10px] text-slate-400">Simulate Android LockActivity</div>
                  </div>
                </button>

                <button
                  onClick={simulateDailyReset}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold">Simulate Midnight Reset</div>
                    <div className="text-[10px] text-slate-400">Clear usage & unlock all apps</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={onOpenOnboarding}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <div>
                    <div className="font-bold">Replay Setup Wizard</div>
                    <div className="text-[10px] text-slate-400">View 4-step onboarding flow</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* View Mode Toggle: Desktop Frame vs Wide Screen (hidden on small mobile devices) */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            title={isMobileFrame ? "Switch to Wide Dashboard View" : "Switch to Mobile Device Frame"}
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-blue" />
                <span>Wide View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
