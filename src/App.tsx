import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import MobileDrawer from './components/MobileDrawer';
import ChallengeView from './components/ChallengeView';
import LearnView from './components/LearnView';
import ChatView from './components/ChatView';
import WrongNoteView from './components/WrongNoteView';
import SettingsPanel from './components/SettingsPanel';
import { useStore } from './store';

export default function App() {
  const { mode } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f1117] overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar onOpenSettings={() => setShowSettings(true)} />

      {/* Main content — add bottom padding on mobile for nav bar */}
      <main className="flex-1 overflow-hidden pb-14 md:pb-0">
        {mode === 'challenge' && <ChallengeView />}
        {mode === 'learn' && <LearnView />}
        {mode === 'quiz' && <ChatView />}
        {mode === 'notes' && <WrongNoteView />}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav
        onOpenSettings={() => setShowSettings(true)}
        onOpenDrawer={() => setShowDrawer(true)}
      />

      {/* Mobile drawer */}
      {showDrawer && <MobileDrawer onClose={() => setShowDrawer(false)} />}

      {/* Settings modal */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
