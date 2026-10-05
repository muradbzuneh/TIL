import React, { useState, useEffect } from 'react';
import { useTil } from '@/context/TilContext';
import { TopBar } from '@/components/web/TopBar';
import { BottomTabs } from '@/components/web/BottomTabs';
import type { TabType } from '@/components/web/BottomTabs';
import { HomeScreen } from '@/components/web/HomeScreen';
import { AppsScreen } from '@/components/web/AppsScreen';
import { SettingsScreen } from '@/components/web/SettingsScreen';
import { AddAppModal } from '@/components/web/AddAppModal';
import { EditLimitModal } from '@/components/web/EditLimitModal';
import { AppDetailsModal } from '@/components/web/AppDetailsModal';
import { GlobalLimitModal } from '@/components/web/GlobalLimitModal';
import { PermissionsModal } from '@/components/web/PermissionsModal';
import { AboutModal } from '@/components/web/AboutModal';
import { PrivacyModal } from '@/components/web/PrivacyModal';
import { LockOverlayModal } from '@/components/web/LockOverlayModal';
import { OnboardingModal } from '@/components/web/OnboardingModal';
import type { ComputedAppUsage } from '@/context/TilContext';

export const AppContent: React.FC = () => {
  const { apps } = useTil();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Monitor window resize to adapt to physical mobile device screens
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modals state
  const [addAppOpen, setAddAppOpen] = useState(false);
  const [editLimitApp, setEditLimitApp] = useState<ComputedAppUsage | null>(null);
  const [detailsApp, setDetailsApp] = useState<ComputedAppUsage | null>(null);
  const [globalLimitOpen, setGlobalLimitOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Keep details and edit modals synchronized with updated app data in context
  const currentDetailsApp = detailsApp ? apps.find(a => a.id === detailsApp.id) || null : null;
  const currentEditLimitApp = editLimitApp ? apps.find(a => a.id === editLimitApp.id) || null : null;

  // On actual mobile phones (<640px), render full screen natively
  // On desktop screens, render inside the device phone mockup (or wide if toggled)
  const showDeviceFrame = isMobileFrame && !isMobileScreen;

  return (
    <div className="min-h-screen bg-[#EEF3FB] text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Application Bar */}
      <TopBar
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        onOpenOnboarding={() => setOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex justify-center items-start p-0 sm:p-4 md:p-6 overflow-x-hidden">
        {showDeviceFrame ? (
          /* Desktop Simulated Phone Mockup */
          <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-2xl shadow-slate-900/10 border-8 border-slate-900/90 overflow-hidden flex flex-col min-h-[740px] max-h-[880px] relative">
            {/* Top speaker & camera notch bar */}
            <div className="bg-slate-900 h-5 w-full flex items-center justify-center shrink-0">
              <div className="w-16 h-3 bg-slate-950 rounded-full" />
            </div>

            {/* Scrollable Screen Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#EEF3FB]">
              {activeTab === 'home' && (
                <HomeScreen
                  onOpenAddApp={() => setAddAppOpen(true)}
                  onOpenAppDetails={(app) => setDetailsApp(app)}
                  onOpenGlobalLimit={() => setGlobalLimitOpen(true)}
                  onOpenPermissions={() => setPermissionsOpen(true)}
                />
              )}

              {activeTab === 'apps' && (
                <AppsScreen
                  onOpenAddApp={() => setAddAppOpen(true)}
                  onOpenEditLimit={(app) => setEditLimitApp(app)}
                  onOpenAppDetails={(app) => setDetailsApp(app)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsScreen
                  onOpenGlobalLimit={() => setGlobalLimitOpen(true)}
                  onOpenPermissions={() => setPermissionsOpen(true)}
                  onOpenAbout={() => setAboutOpen(true)}
                  onOpenPrivacy={() => setPrivacyOpen(true)}
                  onOpenOnboarding={() => setOnboardingOpen(true)}
                />
              )}
            </div>

            {/* Bottom Tab Bar */}
            <div className="shrink-0">
              <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>
        ) : (
          /* Native Mobile Device View / Wide Desktop Mode */
          <div className="w-full max-w-2xl bg-transparent flex flex-col min-h-[calc(100vh-60px)] px-3 sm:px-0">
            <div className="flex-1 pb-16 pt-2 sm:pt-0">
              {activeTab === 'home' && (
                <HomeScreen
                  onOpenAddApp={() => setAddAppOpen(true)}
                  onOpenAppDetails={(app) => setDetailsApp(app)}
                  onOpenGlobalLimit={() => setGlobalLimitOpen(true)}
                  onOpenPermissions={() => setPermissionsOpen(true)}
                />
              )}

              {activeTab === 'apps' && (
                <AppsScreen
                  onOpenAddApp={() => setAddAppOpen(true)}
                  onOpenEditLimit={(app) => setEditLimitApp(app)}
                  onOpenAppDetails={(app) => setDetailsApp(app)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsScreen
                  onOpenGlobalLimit={() => setGlobalLimitOpen(true)}
                  onOpenPermissions={() => setPermissionsOpen(true)}
                  onOpenAbout={() => setAboutOpen(true)}
                  onOpenPrivacy={() => setPrivacyOpen(true)}
                  onOpenOnboarding={() => setOnboardingOpen(true)}
                />
              )}
            </div>

            {/* Fixed Bottom Tabs */}
            <div className="fixed bottom-0 left-0 right-0 z-30">
              <div className="max-w-2xl mx-auto">
                <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Interactive Modals */}
      <AddAppModal
        isOpen={addAppOpen}
        onClose={() => setAddAppOpen(false)}
      />

      <EditLimitModal
        app={currentEditLimitApp}
        onClose={() => setEditLimitApp(null)}
      />

      <AppDetailsModal
        app={currentDetailsApp}
        onClose={() => setDetailsApp(null)}
        onOpenEditLimit={(app) => setEditLimitApp(app)}
      />

      <GlobalLimitModal
        isOpen={globalLimitOpen}
        onClose={() => setGlobalLimitOpen(false)}
      />

      <PermissionsModal
        isOpen={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
      />

      <AboutModal
        isOpen={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />

      <PrivacyModal
        isOpen={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />

      {/* Lock Screen Full Blocker */}
      <LockOverlayModal />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
