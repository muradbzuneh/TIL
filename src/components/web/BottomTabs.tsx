import React from 'react';
import { LayoutDashboard, Layers, Settings } from 'lucide-react';

export type TabType = 'home' | 'apps' | 'settings';

interface BottomTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'apps' as TabType,
      label: 'Apps',
      icon: Layers,
    },
    {
      id: 'settings' as TabType,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 sm:py-2 px-6 flex items-center justify-around shadow-lg shadow-slate-900/5 select-none pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center relative w-16 py-1 cursor-pointer transition-transform active:scale-95"
          >
            {/* Soft pill indicator matching TIL theme */}
            <div
              className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive ? 'bg-blue-50 text-blue scale-100' : 'text-slate-400 hover:text-slate-600 scale-90'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span
              className={`text-[11px] mt-0.5 tracking-tight font-bold transition-colors ${
                isActive ? 'text-blue' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
